using backend.Data;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // POST /api/users/avatars — batch lookup so Leaderboard/Friends/Chat can show everyone's
    // *current* DB-persisted avatar (a user's own browser is not the only place their picture
    // needs to be visible from).
    [HttpPost("avatars")]
    public async Task<IActionResult> GetAvatars([FromBody] AvatarLookupDto model)
    {
        var normalized = (model.Emails ?? new List<string>())
            .Where(e => !string.IsNullOrWhiteSpace(e))
            .Select(e => e.Trim().ToLowerInvariant())
            .Distinct()
            .Take(200)
            .ToList();

        if (normalized.Count == 0)
            return Ok(Array.Empty<object>());

        var users = await _context.Users
            .Where(u => normalized.Contains(u.Email))
            .Select(u => new { u.Email, u.Emoji, u.AvatarUrl, u.EquippedFrameId, u.EquippedThemeId })
            .ToListAsync();

        return Ok(users);
    }

    // GET /api/users/{id}/badges — a user's earned badges, oldest-first.
    [HttpGet("{id:int}/badges")]
    public async Task<IActionResult> GetUserBadges(int id)
    {
        var badges = await _context.UserBadges
            .Where(ub => ub.UserId == id)
            .Include(ub => ub.Badge)
            .OrderBy(ub => ub.EarnedAt)
            .Select(ub => new
            {
                ub.Badge.Code,
                ub.Badge.Name,
                ub.Badge.Description,
                ub.Badge.Emoji,
                ub.EarnedAt
            })
            .ToListAsync();

        return Ok(badges);
    }
}
