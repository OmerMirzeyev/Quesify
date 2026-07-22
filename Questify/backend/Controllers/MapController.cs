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
            unlockedNext = new { track = model.Track, chapterIndex = nextChapterIndex, levelIndex = nextLevelIndex }
        });
    }
}
