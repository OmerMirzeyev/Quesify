using backend.Data;
using backend.Extensions;
using backend.Models;
using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private static readonly string[] AllowedRoles = { "Admin", "User" };

    // Same deadline strategy as AiController.Chat — bounds the worst case (2 model attempts *
    // 15s each) so the admin's "Generate with AI" button never spins forever.
    private static readonly TimeSpan AiRequestDeadline = TimeSpan.FromSeconds(35);

    private readonly AppDbContext _context;
    private readonly INotificationService _notifications;
    private readonly IAiService _aiService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(AppDbContext context, INotificationService notifications, IAiService aiService, ILogger<AdminController> logger)
    {
        _context = context;
        _notifications = notifications;
        _aiService = aiService;
        _logger = logger;
    }

    // POST /api/admin/generate-question — used by the Admin Panel's "Generate with AI" button to
    // populate the question-creation form with a unique, randomized AI-written question instead
    // of an admin having to write one by hand.
    [HttpPost("generate-question")]
    public async Task<IActionResult> GenerateQuestion([FromBody] GenerateQuestionRequestDto request, CancellationToken cancellationToken)
    {
        if (request is null
            || string.IsNullOrWhiteSpace(request.Language)
            || string.IsNullOrWhiteSpace(request.Topic)
            || string.IsNullOrWhiteSpace(request.Difficulty))
        {
            return BadRequest(new { message = "Dil, mövzu və çətinlik səviyyəsi tələb olunur." });
        }

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(AiRequestDeadline);

        try
        {
            var (generated, debugError) = await _aiService.GenerateQuestionAsync(
                request.Language.Trim(), request.Topic.Trim(), request.Difficulty.Trim(),
                request.ContentLanguage?.Trim(), cts.Token);

            if (generated is null)
            {
                // Caught silently from the user's perspective — the exact upstream failure reason
                // only ever goes to the server log so a flaky free-tier model/rate-limit is
                // distinguishable from a real bug without ever surfacing raw text to the admin.
                _logger.LogError("AI question generation failed — raw reason: {DebugError}", debugError);
                return StatusCode(StatusCodes.Status502BadGateway, new { message = "AI sual yarada bilmədi. Zəhmət olmasa yenidən cəhd edin." });
            }

            // Echo the target node back so the form can bind this preview to the exact map node
            // the admin selected (see GenerateQuestionRequestDto.ChapterId/LevelId) — this call
            // never persists anything itself, that only happens on the later POST /api/admin/questions.
            if (request.ChapterId.HasValue && request.LevelId.HasValue)
            {
                var targetLevel = await _context.Levels.FindAsync(request.LevelId.Value);
                if (targetLevel is not null && targetLevel.ChapterId == request.ChapterId.Value)
                {
                    generated.ChapterId = request.ChapterId;
                    generated.LevelId = request.LevelId;
                    generated.LevelTitle = targetLevel.Title;
                }
            }

            return Ok(generated);
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("AI question generation exceeded the {Deadline}s deadline.", AiRequestDeadline.TotalSeconds);
            return StatusCode(StatusCodes.Status504GatewayTimeout, new { message = "AI sorğusu vaxt aşımına uğradı. Yenidən cəhd edin." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating AI question.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Gözlənilməz xəta baş verdi." });
        }
    }

    // POST /api/admin/chapters — used by the Chapter Map's "+" button (Task 1.1) to create a
    // brand-new chapter for a track. Always appended after whatever chapters already exist for
    // that track (static + DB), never inserted in the middle.
    [HttpPost("chapters")]
    public async Task<IActionResult> CreateChapter([FromBody] CreateChapterDto request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Track) || string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Dil (track) və fəsil başlığı tələb olunur." });

        var track = request.Track.Trim();
        var existingMax = await _context.Chapters
            .Where(c => c.Track == track)
            .Select(c => (int?)c.OrderIndex)
            .MaxAsync();
        // Never land below BaseOrderIndex, even if the only DB rows so far are low-index "shadow"
        // chapters materialized by ResolveLevel (e.g. chapter 0 got shadow-resolved by a node "+"
        // click) — otherwise the next DB chapter would collide with a still-unmaterialized static
        // chapter's index (e.g. land on 1, colliding with the static "Fəsil 2").
        var floor = Math.Max(request.BaseOrderIndex, 0) - 1;
        var orderIndex = Math.Max(existingMax ?? -1, floor) + 1;

        var chapter = new Chapter
        {
            Track = track,
            OrderIndex = orderIndex,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "📦" : request.Icon.Trim(),
            Color = string.IsNullOrWhiteSpace(request.Color) ? "#8b5cf6" : request.Color.Trim()
        };
        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();

        return Ok(new ChapterDto
        {
            Id = chapter.Id,
            Track = chapter.Track,
            OrderIndex = chapter.OrderIndex,
            Title = chapter.Title,
            Description = chapter.Description,
            Icon = chapter.Icon,
            Color = chapter.Color
        });
    }

    // POST /api/admin/levels — creates a brand-new level under an existing (DB) chapter. Used when
    // the admin form's Level dropdown is set to "-- Create New Level --" for a chapter that already
    // has a real ChapterId (either a DB-only chapter, or a static one already resolved once via
    // ResolveLevel below).
    [HttpPost("levels")]
    public async Task<IActionResult> CreateLevel([FromBody] CreateLevelDto request)
    {
        if (request is null || request.ChapterId <= 0 || string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Fəsil (chapterId) və səviyyə başlığı tələb olunur." });

        var chapter = await _context.Chapters.FindAsync(request.ChapterId);
        if (chapter is null) return NotFound(new { message = "Fəsil tapılmadı." });

        var existingMax = await _context.Levels
            .Where(l => l.ChapterId == request.ChapterId)
            .Select(l => (int?)l.OrderIndex)
            .MaxAsync();
        // Same floor-vs-max reasoning as CreateChapter above — a low-index shadow level (from
        // ResolveLevel) must never push a "new level" below the static level count already known
        // to exist in this chapter.
        var floor = Math.Max(request.BaseOrderIndex, 0) - 1;
        var orderIndex = Math.Max(existingMax ?? -1, floor) + 1;

        var level = new Level
        {
            ChapterId = request.ChapterId,
            OrderIndex = orderIndex,
            Title = request.Title.Trim(),
            Topic = string.IsNullOrWhiteSpace(request.Topic) ? "General" : request.Topic.Trim(),
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "📝" : request.Icon.Trim(),
            Difficulty = string.IsNullOrWhiteSpace(request.Difficulty) ? "Easy" : request.Difficulty.Trim(),
            XpReward = request.XpReward ?? 100,
            GoldReward = request.GoldReward ?? 50,
            Description = request.Description?.Trim()
        };
        _context.Levels.Add(level);
        await _context.SaveChangesAsync();

        return Ok(new LevelDto
        {
            Id = level.Id,
            ChapterId = level.ChapterId,
            OrderIndex = level.OrderIndex,
            Title = level.Title,
            Topic = level.Topic,
            Icon = level.Icon,
            Difficulty = level.Difficulty,
            XpReward = level.XpReward,
            GoldReward = level.GoldReward,
            Description = level.Description
        });
    }

    // POST /api/admin/levels/resolve — find-or-create the Chapter+Level identified by
    // (Track, ChapterOrderIndex, LevelOrderIndex). This is what lets the map node "+" button and
    // the admin form's cascading dropdowns work uniformly for BOTH brand-new DB chapters/levels
    // AND the 120 pre-existing static levels in mockData.js — the very first time an admin targets
    // one of those static levels, this materializes a matching DB row (idempotent afterwards) so a
    // real LevelId exists to bind a Question to.
    [HttpPost("levels/resolve")]
    public async Task<IActionResult> ResolveLevel([FromBody] ResolveLevelDto request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Track))
            return BadRequest(new { message = "Track tələb olunur." });

        var track = request.Track.Trim();

        var chapter = await _context.Chapters.FirstOrDefaultAsync(c => c.Track == track && c.OrderIndex == request.ChapterOrderIndex);
        if (chapter is null)
        {
            chapter = new Chapter
            {
                Track = track,
                OrderIndex = request.ChapterOrderIndex,
                Title = string.IsNullOrWhiteSpace(request.ChapterTitle) ? $"Fəsil {request.ChapterOrderIndex + 1}" : request.ChapterTitle.Trim(),
                Description = request.ChapterDescription?.Trim(),
                Icon = string.IsNullOrWhiteSpace(request.ChapterIcon) ? "📦" : request.ChapterIcon.Trim(),
                Color = string.IsNullOrWhiteSpace(request.ChapterColor) ? "#8b5cf6" : request.ChapterColor.Trim()
            };
            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();
        }

        var level = await _context.Levels.FirstOrDefaultAsync(l => l.ChapterId == chapter.Id && l.OrderIndex == request.LevelOrderIndex);
        if (level is null)
        {
            level = new Level
            {
                ChapterId = chapter.Id,
                OrderIndex = request.LevelOrderIndex,
                Title = string.IsNullOrWhiteSpace(request.LevelTitle) ? $"Level {request.LevelOrderIndex + 1}" : request.LevelTitle.Trim(),
                Topic = string.IsNullOrWhiteSpace(request.Topic) ? "General" : request.Topic.Trim(),
                Icon = string.IsNullOrWhiteSpace(request.Icon) ? "📝" : request.Icon.Trim(),
                Difficulty = string.IsNullOrWhiteSpace(request.Difficulty) ? "Easy" : request.Difficulty.Trim(),
                XpReward = request.XpReward ?? 100,
                GoldReward = request.GoldReward ?? 50,
                Description = request.Description?.Trim()
            };
            _context.Levels.Add(level);
            await _context.SaveChangesAsync();
        }

        return Ok(new ResolvedLevelDto { ChapterId = chapter.Id, LevelId = level.Id });
    }

    // POST /api/admin/questions — persists a question bound to an already-resolved LevelId. This
    // is what the manual "Add Question Manually" admin form (Task 2) submits to.
    [HttpPost("questions")]
    public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto request)
    {
        if (request is null || request.LevelId <= 0 || string.IsNullOrWhiteSpace(request.QuestionText))
            return BadRequest(new { message = "Səviyyə (levelId) və sual mətni tələb olunur." });

        if (string.IsNullOrWhiteSpace(request.Options?.A) || string.IsNullOrWhiteSpace(request.Options?.B))
            return BadRequest(new { message = "A və B variantları tələb olunur." });

        var allowedOptions = new[] { "A", "B", "C", "D" };
        if (!allowedOptions.Contains(request.CorrectOption))
            return BadRequest(new { message = "Düzgün variant A, B, C və ya D olmalıdır." });

        var level = await _context.Levels.Include(l => l.Chapter).FirstOrDefaultAsync(l => l.Id == request.LevelId);
        if (level is null) return NotFound(new { message = "Səviyyə tapılmadı." });

        // Cross-check the caller's own understanding of which chapter/track this level belongs to
        // against the level's actual Chapter — catches a stale client-side selection (e.g. the
        // admin switched Language/Chapter in the form after LevelId was resolved but before
        // submitting) instead of silently writing the question onto the wrong node.
        if (request.ChapterId.HasValue && request.ChapterId.Value != level.ChapterId)
            return BadRequest(new { message = "chapterId seçilmiş səviyyə ilə uyğun gəlmir." });

        if (!string.IsNullOrWhiteSpace(request.Language) &&
            !string.Equals(request.Language.Trim(), level.Chapter.Track, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "language seçilmiş səviyyənin kursu ilə uyğun gəlmir." });

        // The correct option must actually point at a non-empty answer — otherwise a form bug
        // (or a manually-crafted request) could bind "correct" to a blank C/D slot.
        var selectedOptionText = request.CorrectOption switch
        {
            "A" => request.Options.A,
            "B" => request.Options.B,
            "C" => request.Options.C,
            "D" => request.Options.D,
            _ => null
        };
        if (string.IsNullOrWhiteSpace(selectedOptionText))
            return BadRequest(new { message = "Düzgün variant boş ola bilməz." });

        var question = new Question
        {
            LevelId = level.Id,
            QuestionText = request.QuestionText.Trim(),
            OptionA = request.Options.A.Trim(),
            OptionB = request.Options.B.Trim(),
            OptionC = request.Options.C?.Trim() ?? string.Empty,
            OptionD = request.Options.D?.Trim() ?? string.Empty,
            CorrectOption = request.CorrectOption,
            Hint = request.Hint?.Trim()
        };
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();

        return Ok(ToQuestionRecordDto(question, level));
    }

    // POST /api/admin/levels/{levelId}/generate-question — Task 1's node "+" button, Option A.
    // Generates one AI question for this exact level's topic/difficulty and immediately persists
    // it bound to LevelId — unlike POST /api/admin/generate-question (preview-only), this one
    // both generates AND binds in a single call.
    [HttpPost("levels/{levelId:int}/generate-question")]
    public async Task<IActionResult> GenerateQuestionForLevel(int levelId, [FromBody] GenerateLevelQuestionDto request, CancellationToken cancellationToken)
    {
        var level = await _context.Levels.Include(l => l.Chapter).FirstOrDefaultAsync(l => l.Id == levelId);
        if (level is null) return NotFound(new { message = "Səviyyə tapılmadı." });

        var language = string.IsNullOrWhiteSpace(request?.Language) ? level.Chapter.Track : request!.Language.Trim();

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(AiRequestDeadline);

        try
        {
            var (generated, debugError) = await _aiService.GenerateQuestionAsync(
                language, level.Topic, level.Difficulty, request?.ContentLanguage?.Trim(), cts.Token);

            if (generated is null)
            {
                _logger.LogError("AI generate-for-level failed — raw reason: {DebugError}", debugError);
                return StatusCode(StatusCodes.Status502BadGateway, new { message = "AI sual yarada bilmədi. Zəhmət olmasa yenidən cəhd edin." });
            }

            var options = generated.Options ?? new List<string>();
            var question = new Question
            {
                LevelId = level.Id,
                QuestionText = generated.Question,
                OptionA = options.ElementAtOrDefault(0) ?? string.Empty,
                OptionB = options.ElementAtOrDefault(1) ?? string.Empty,
                OptionC = options.ElementAtOrDefault(2) ?? string.Empty,
                OptionD = options.ElementAtOrDefault(3) ?? string.Empty,
                CorrectOption = allowedOptionLetters.ElementAtOrDefault(generated.CorrectIndex) ?? "A",
                Hint = generated.Hint
            };
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return Ok(ToQuestionRecordDto(question, level, language));
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("AI generate-for-level exceeded the {Deadline}s deadline.", AiRequestDeadline.TotalSeconds);
            return StatusCode(StatusCodes.Status504GatewayTimeout, new { message = "AI sorğusu vaxt aşımına uğradı. Yenidən cəhd edin." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating AI question for level {LevelId}.", levelId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Gözlənilməz xəta baş verdi." });
        }
    }

    private static readonly string[] allowedOptionLetters = { "A", "B", "C", "D" };

    private static QuestionRecordDto ToQuestionRecordDto(Question question, Level level, string? language = null) => new()
    {
        Id = question.Id,
        Language = language ?? level.Chapter.Track,
        ChapterId = level.ChapterId,
        LevelId = level.Id,
        LevelTitle = level.Title,
        QuestionText = question.QuestionText,
        Options = new QuestionOptionsDto { A = question.OptionA, B = question.OptionB, C = question.OptionC, D = question.OptionD },
        CorrectOption = question.CorrectOption,
        Hint = question.Hint
    };

    [HttpGet("dashboard")]
    public IActionResult GetDashboard()
    {
        return Ok(new
        {
            Message = "Welcome to the admin dashboard. This endpoint requires the Admin role.",
            Timestamp = DateTime.UtcNow
        });
    }

    // POST /api/admin/broadcast?message=... — pushes a real-time toast (via NotificationHub) to
    // every currently-connected client, for platform-wide announcements (maintenance windows,
    // new features, etc). Doesn't persist anywhere — purely a live push to whoever's online now.
    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromQuery] string message)
    {
        if (string.IsNullOrWhiteSpace(message))
            return BadRequest(new { message = "Mesaj tələb olunur." });

        await _notifications.BroadcastAsync("platform_update", message.Trim());
        return Ok(new { message = "Bildiriş bütün onlayn istifadəçilərə göndərildi." });
    }

    // POST /api/admin/ban/{userId}
    // Also supports ?email=... as fallback if userId is 0
    [HttpPost("ban/{userId:int}")]
    public async Task<IActionResult> BanUser(int userId, [FromQuery] string? email = null)
    {
        if (userId <= 0 && string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "userId və ya email tələb olunur." });

        var user = userId > 0
            ? await _context.Users.FindAsync(userId)
            : await _context.Users.FirstOrDefaultAsync(u => u.Email == email!.Trim().ToLowerInvariant());

        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.IsBanned = true;
        user.TimeoutUntil = null;
        await LogModerationActionAsync(user.Id, "Ban");
        await _context.SaveChangesAsync();
        await _notifications.NotifyUserAsync(user.Email, "moderation", "Hesabınız admin tərəfindən bloklandı.");

        return Ok(new { message = $"{user.Email} bloklandı.", userId = user.Id, isBanned = true });
    }

    // POST /api/admin/ban/by-email — ban by email (used when frontend ID != DB ID)
    [HttpPost("ban/by-email")]
    public async Task<IActionResult> BanUserByEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.IsBanned = true;
        user.TimeoutUntil = null;
        await LogModerationActionAsync(user.Id, "Ban");
        await _context.SaveChangesAsync();
        await _notifications.NotifyUserAsync(user.Email, "moderation", "Hesabınız admin tərəfindən bloklandı.");

        return Ok(new { message = $"{user.Email} bloklandı.", userId = user.Id, isBanned = true });
    }

    // POST /api/admin/unban/by-email
    [HttpPost("unban/by-email")]
    public async Task<IActionResult> UnbanUserByEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.IsBanned = false;
        await LogModerationActionAsync(user.Id, "Unban");
        await _context.SaveChangesAsync();
        await _notifications.NotifyUserAsync(user.Email, "moderation", "Hesabınızın bloku admin tərəfindən açıldı. ✅");

        return Ok(new { message = $"{user.Email} bloku açıldı.", userId = user.Id, isBanned = false });
    }

    // POST /api/admin/timeout/by-email?minutes=10
    [HttpPost("timeout/by-email")]
    public async Task<IActionResult> TimeoutUserByEmail([FromQuery] string email, [FromQuery] int minutes = 10)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });
        if (minutes < 1)
            return BadRequest(new { message = "Müddət ən azı 1 dəqiqə olmalıdır." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.TimeoutUntil = DateTime.UtcNow.AddMinutes(minutes);
        await LogModerationActionAsync(user.Id, "Timeout", $"{minutes} dəqiqə");
        await _context.SaveChangesAsync();
        await _notifications.NotifyUserAsync(user.Email, "moderation", $"Hesabınız {minutes} dəqiqəliyinə məhdudlaşdırıldı.");

        return Ok(new
        {
            message = $"{user.Email} {minutes} dəqiqə məhdudlaşdırıldı.",
            userId = user.Id,
            timeoutUntil = user.TimeoutUntil
        });
    }

    // POST /api/admin/remove-timeout/by-email
    [HttpPost("remove-timeout/by-email")]
    public async Task<IActionResult> RemoveTimeoutByEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.TimeoutUntil = null;
        await LogModerationActionAsync(user.Id, "RemoveTimeout");
        await _context.SaveChangesAsync();
        await _notifications.NotifyUserAsync(user.Email, "moderation", "Məhdudiyyətiniz admin tərəfindən götürüldü. ✅");

        return Ok(new { message = $"{user.Email} məhdudiyyəti götürüldü.", userId = user.Id });
    }

    // GET /api/admin/users?page=1&pageSize=25
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _context.Users.OrderBy(u => u.Id);
        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.Role,
                u.Emoji,
                u.IsBanned,
                u.TimeoutUntil,
                u.AvatarUrl,
                u.Coins,
                u.HasUnlimitedCoins
            })
            .ToListAsync();

        return Ok(new { items = users, totalCount, page, pageSize });
    }

    // POST /api/admin/coins/by-email?email=...&amount=500 — absolute set, not a delta.
    [HttpPost("coins/by-email")]
    public async Task<IActionResult> SetCoinsByEmail([FromQuery] string email, [FromQuery] int amount)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });
        if (amount < 0)
            return BadRequest(new { message = "Miqdar mənfi ola bilməz." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.Coins = amount;
        await LogModerationActionAsync(user.Id, "SetCoins", amount.ToString());
        await _context.SaveChangesAsync();

        return Ok(new { userId = user.Id, email = user.Email, coins = user.Coins });
    }

    // POST /api/admin/coins/unlimited/by-email?email=...&enabled=true
    [HttpPost("coins/unlimited/by-email")]
    public async Task<IActionResult> SetUnlimitedCoinsByEmail([FromQuery] string email, [FromQuery] bool enabled)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email.Trim().ToLowerInvariant());
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.HasUnlimitedCoins = enabled;
        await LogModerationActionAsync(user.Id, "SetUnlimitedCoins", enabled.ToString());
        await _context.SaveChangesAsync();

        return Ok(new { userId = user.Id, email = user.Email, hasUnlimitedCoins = user.HasUnlimitedCoins });
    }

    // POST /api/admin/role/by-email?email=...&role=Admin
    [HttpPost("role/by-email")]
    public async Task<IActionResult> SetRoleByEmail([FromQuery] string email, [FromQuery] string role)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });
        if (!AllowedRoles.Contains(role))
            return BadRequest(new { message = $"Rol '{role}' etibarsızdır." });

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var callerEmail = User.GetEmail();
        if (role != "Admin" && string.Equals(callerEmail, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Öz admin rolunuzu özünüzdən götürə bilməzsiniz." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        user.Role = role;
        await LogModerationActionAsync(user.Id, "RoleChange", role);
        await _context.SaveChangesAsync();

        return Ok(new { userId = user.Id, email = user.Email, role = user.Role });
    }

    // DELETE /api/admin/users/by-email?email=...
    [HttpDelete("users/by-email")]
    public async Task<IActionResult> DeleteUserByEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var callerEmail = User.GetEmail();
        if (string.Equals(callerEmail, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Öz hesabınızı silə bilməzsiniz." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        await LogModerationActionAsync(user.Id, "Delete");
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{normalizedEmail} silindi." });
    }

    // GET /api/admin/moderation-history?email=... — audit trail; omit email for all users.
    [HttpGet("moderation-history")]
    public async Task<IActionResult> GetModerationHistory([FromQuery] string? email = null)
    {
        var query = _context.ModerationActions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(email))
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (targetUser is null) return NotFound(new { message = "İstifadəçi tapılmadı." });
            query = query.Where(a => a.TargetUserId == targetUser.Id);
        }

        var actions = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(200)
            .ToListAsync();

        var userIds = actions.SelectMany(a => new[] { a.TargetUserId, a.AdminUserId }).Distinct().ToList();
        var emailsById = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email);

        var result = actions.Select(a => new
        {
            a.Id,
            TargetEmail = emailsById.GetValueOrDefault(a.TargetUserId, "(deleted)"),
            AdminEmail = emailsById.GetValueOrDefault(a.AdminUserId, "(deleted)"),
            a.ActionType,
            a.Reason,
            a.CreatedAt
        });

        return Ok(result);
    }

    private async Task LogModerationActionAsync(int targetUserId, string actionType, string? reason = null)
    {
        var adminEmail = User.GetEmail();
        var adminId = 0;
        if (!string.IsNullOrWhiteSpace(adminEmail))
        {
            adminId = await _context.Users
                .Where(u => u.Email == adminEmail)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();
        }

        _context.ModerationActions.Add(new ModerationAction
        {
            TargetUserId = targetUserId,
            AdminUserId = adminId,
            ActionType = actionType,
            Reason = reason
        });
    }
}
