using backend.Data;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    // Top 50 by Xp descending — the frontend's global leaderboard tab.
    [HttpGet]
    public async Task<IActionResult> GetLeaderboard()
    {
        var users = await _context.Users
            .Where(u => u.Role != "Admin")
            .OrderByDescending(u => u.Xp)
            .Take(50)
            .Select(u => new LeaderboardEntryDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Emoji = u.Emoji,
                AvatarUrl = u.AvatarUrl,
                EquippedFrameId = u.EquippedFrameId,
                EquippedThemeId = u.EquippedThemeId,
                Role = u.Role,
                Xp = u.Xp,
                CurrentStreak = u.CurrentStreak
            })
            .ToListAsync();

        return Ok(users);
    }
}
