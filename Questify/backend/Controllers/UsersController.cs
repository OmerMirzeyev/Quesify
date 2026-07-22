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
}
