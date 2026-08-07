using backend.Data;
using backend.Extensions;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MapController : ControllerBase
{
    private readonly AppDbContext _context;

    public MapController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/map/progress?track=C%23 — Admins get isUnlocked=true for every row they've
    // seen (matches the frontend's existing "admins see every level" behavior) without
    // needing a per-user override column.
    [HttpGet("progress")]
    public async Task<IActionResult> GetProgress([FromQuery] string? track = null)
    {
        var email = User.GetEmail();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var isAdmin = User.IsInRole("Admin");

        var query = _context.UserMapProgress.Where(p => p.UserId == user.Id);
        if (!string.IsNullOrWhiteSpace(track))
            query = query.Where(p => p.Track == track);

        var rows = await query.ToListAsync();

        var result = rows.Select(p => new MapProgressDto
        {
            Track = p.Track,
            ChapterIndex = p.ChapterIndex,
            LevelIndex = p.LevelIndex,
            IsUnlocked = isAdmin || p.IsUnlocked,
            IsCompleted = p.IsCompleted
        });

        return Ok(new { isAdminOverride = isAdmin, progress = result });
    }

    // POST /api/map/complete — marks a level completed and unlocks the next one. Idempotent.
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteLevel([FromBody] CompleteLevelDto model)
    {
        if (string.IsNullOrWhiteSpace(model.Track))
            return BadRequest(new { message = "Track tələb olunur." });

        var email = User.GetEmail();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var current = await _context.UserMapProgress.FirstOrDefaultAsync(p =>
            p.UserId == user.Id && p.Track == model.Track &&
            p.ChapterIndex == model.ChapterIndex && p.LevelIndex == model.LevelIndex);

        var wasAlreadyCompleted = current?.IsCompleted ?? false;

        if (current is null)
        {
            current = new UserMapProgress
            {
                UserId = user.Id,
                Track = model.Track,
                ChapterIndex = model.ChapterIndex,
                LevelIndex = model.LevelIndex
            };
            _context.UserMapProgress.Add(current);
        }

        current.IsUnlocked = true;
        current.IsCompleted = true;
        current.CompletedAt = DateTime.UtcNow;

        // Award XP (and check level-completion badges) only the first time this specific level
        // is completed — CompleteLevel is otherwise idempotent and gets called again on retries.
        var coinsAwarded = 0;
        if (!wasAlreadyCompleted)
        {
            coinsAwarded = GamificationConstants.LevelCompletionCoins;
            user.Xp += GamificationConstants.LevelCompletionXp;
            user.Coins += GamificationConstants.LevelCompletionCoins;

            var otherCompletedCount = await _context.UserMapProgress
                .CountAsync(p => p.UserId == user.Id && p.IsCompleted && p.Id != current.Id);
            if (otherCompletedCount == 0)
                await BadgeAwarder.AwardAsync(_context, user, "first_lesson");

            if (user.Xp >= 100)
                await BadgeAwarder.AwardAsync(_context, user, "xp_100");
        }

        var nextChapterIndex = model.IsLastLevelOfChapter ? model.ChapterIndex + 1 : model.ChapterIndex;
        var nextLevelIndex = model.IsLastLevelOfChapter ? 0 : model.LevelIndex + 1;

        var next = await _context.UserMapProgress.FirstOrDefaultAsync(p =>
            p.UserId == user.Id && p.Track == model.Track &&
            p.ChapterIndex == nextChapterIndex && p.LevelIndex == nextLevelIndex);

        if (next is null)
        {
            next = new UserMapProgress
            {
                UserId = user.Id,
                Track = model.Track,
                ChapterIndex = nextChapterIndex,
                LevelIndex = nextLevelIndex,
                IsUnlocked = true
            };
            _context.UserMapProgress.Add(next);
        }
        else
        {
            next.IsUnlocked = true;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Səviyyə tamamlandı.",
            unlockedNext = new { track = model.Track, chapterIndex = nextChapterIndex, levelIndex = nextLevelIndex },
            coins = user.Coins,
            // The real amount just credited to the wallet (0 on repeat/idempotent calls) — the
            // frontend uses this instead of the admin-configured per-quest goldReward (which is
            // untrusted display-only data) so the completion toast never overstates real earnings.
            coinsAwarded,
            hasUnlimitedCoins = user.HasEffectiveUnlimitedCoins()
        });
    }

    // GET /api/map/chapters?track=C%23 — read-only, any authenticated user (unlike the admin-only
    // create endpoints in AdminController). Only ever returns chapters *beyond* the two static
    // ones every track already renders from mockData.js's CHAPTER_META — those two never get a
    // DB row unless an admin targets one of their levels (see AdminController.ResolveLevel), and
    // even then this endpoint still only returns what's actually in the DB. The frontend merges
    // this list with its static CHAPTER_META array by OrderIndex.
    [HttpGet("chapters")]
    public async Task<IActionResult> GetChapters([FromQuery] string track)
    {
        if (string.IsNullOrWhiteSpace(track))
            return BadRequest(new { message = "Track tələb olunur." });

        var chapters = await _context.Chapters
            .Where(c => c.Track == track)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new ChapterDto
            {
                Id = c.Id,
                Track = c.Track,
                OrderIndex = c.OrderIndex,
                Title = c.Title,
                Description = c.Description,
                Icon = c.Icon,
                Color = c.Color
            })
            .ToListAsync();

        return Ok(chapters);
    }

    // GET /api/map/levels?track=C%23&chapterOrderIndex=0 — same read-only/additive contract as
    // GetChapters above. Looked up by (track, chapterOrderIndex) rather than a DB chapter id so a
    // still-unmaterialized static chapter simply returns an empty list instead of requiring a GET
    // to have side effects.
    [HttpGet("levels")]
    public async Task<IActionResult> GetLevels([FromQuery] string track, [FromQuery] int chapterOrderIndex)
    {
        if (string.IsNullOrWhiteSpace(track))
            return BadRequest(new { message = "Track tələb olunur." });

        var chapter = await _context.Chapters.FirstOrDefaultAsync(c => c.Track == track && c.OrderIndex == chapterOrderIndex);
        if (chapter is null) return Ok(Array.Empty<LevelDto>());

        var levels = await _context.Levels
            .Where(l => l.ChapterId == chapter.Id)
            .OrderBy(l => l.OrderIndex)
            .Select(l => new LevelDto
            {
                Id = l.Id,
                ChapterId = l.ChapterId,
                OrderIndex = l.OrderIndex,
                Title = l.Title,
                Topic = l.Topic,
                Icon = l.Icon,
                Difficulty = l.Difficulty,
                XpReward = l.XpReward,
                GoldReward = l.GoldReward,
                Description = l.Description
            })
            .ToListAsync();

        return Ok(levels);
    }

    // GET /api/map/questions?levelId=5 — read-only, any authenticated user. This is what actually
    // lets a level's admin-authored/AI-generated questions be played: QuestModal fetches this for
    // any level it knows a real DB id for (see QuestsGrid's dbLevelId attachment) and merges the
    // result into that level's playable challenge list, instead of only ever showing mockData.js's
    // static content.
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestionsForLevel([FromQuery] int levelId)
    {
        var level = await _context.Levels.Include(l => l.Chapter).FirstOrDefaultAsync(l => l.Id == levelId);
        if (level is null) return Ok(Array.Empty<QuestionRecordDto>());

        var questions = await _context.Questions
            .Where(q => q.LevelId == levelId)
            .OrderBy(q => q.Id)
            .ToListAsync();

        var result = questions.Select(q => new QuestionRecordDto
        {
            Id = q.Id,
            Language = level.Chapter.Track,
            ChapterId = level.ChapterId,
            LevelId = level.Id,
            LevelTitle = level.Title,
            QuestionText = q.QuestionText,
            Options = new QuestionOptionsDto { A = q.OptionA, B = q.OptionB, C = q.OptionC, D = q.OptionD },
            CorrectOption = q.CorrectOption,
            Hint = q.Hint
        });

        return Ok(result);
    }
}
