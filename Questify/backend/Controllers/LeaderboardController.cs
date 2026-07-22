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

    [HttpGet]
    public async Task<IActionResult> GetLeaderboard()
    {
        var users = await _context.Users
            .Where(u => u.Role != "Admin")
            .Select(u => new LeaderboardEntryDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Emoji = u.Emoji,
                AvatarUrl = u.AvatarUrl,
                EquippedFrameId = u.EquippedFrameId,
                EquippedThemeId = u.EquippedThemeId,
                Role = u.Role
            })
            .ToListAsync();

        return Ok(users);
    }
}
