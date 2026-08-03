using backend.Data;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    // URL-safe course slugs (the frontend must send one of these, e.g. '?course=csharp' — never
    // the raw internal track name, since 'C#' percent-encodes to the ugly/fragile 'C%23') mapped
    // to the internal Track values used by UserMapProgress.Track and Course.Slug.
    private static readonly Dictionary<string, string> CourseSlugToTrack = new(StringComparer.OrdinalIgnoreCase)
    {
        ["csharp"] = "C#",
        ["c#"] = "C#",
        ["java"] = "Java",
        ["python"] = "Python",
    };

    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/leaderboard — global Top 50 by total Xp descending (unchanged default).
    // GET /api/leaderboard?course=csharp|java|python — Top 50 for that course specifically,
    // ranked by XP earned on that track alone.
    [HttpGet]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string? course = null)
    {
        if (string.IsNullOrWhiteSpace(course) || course.Equals("global", StringComparison.OrdinalIgnoreCase))
        {
            var globalUsers = await _context.Users
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

            return Ok(globalUsers);
        }

        if (!CourseSlugToTrack.TryGetValue(course.Trim(), out var track))
        {
            return BadRequest(new { message = $"Naməlum kurs: '{course}'." });
        }

        // No separate per-course XP column exists on User — the only place Xp is ever awarded is
        // MapController.CompleteLevel's flat GamificationConstants.LevelCompletionXp per level, so
        // "XP on this course" is exactly (completed levels on this track) * that constant. This
        // joins UserMapProgress (course/XP source of truth) against Users (identity/profile),
        // exactly the join the bug report asked for.
        var trackXp = await _context.UserMapProgress
            .Where(p => p.IsCompleted && p.Track == track)
            .GroupBy(p => p.UserId)
            .Select(g => new { UserId = g.Key, Xp = g.Count() * GamificationConstants.LevelCompletionXp })
            .ToListAsync();

        var xpByUserId = trackXp.ToDictionary(x => x.UserId, x => x.Xp);
        var userIds = xpByUserId.Keys.ToList();

        var trackUsers = await _context.Users
            .Where(u => userIds.Contains(u.Id) && u.Role != "Admin")
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
                CurrentStreak = u.CurrentStreak
            })
            .ToListAsync();

        foreach (var entry in trackUsers)
        {
            entry.Xp = xpByUserId[entry.Id];
        }

        var ordered = trackUsers.OrderByDescending(e => e.Xp).Take(50).ToList();
        return Ok(ordered);
    }
}
