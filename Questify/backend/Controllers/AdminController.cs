using backend.Data;
using backend.Extensions;
using backend.Models;
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

    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public IActionResult GetDashboard()
    {
        return Ok(new
        {
            Message = "Welcome to the admin dashboard. This endpoint requires the Admin role.",
            Timestamp = DateTime.UtcNow
        });
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
