using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/courses — public catalog for the landing page's "languages you can learn"
    // section. IsAvailable distinguishes the three tracks with real lesson content (C#, Java,
    // Python) from catalog-only entries (SQL, C++, React) so the frontend can show the latter
    // as "Coming Soon" instead of navigating into an empty course.
    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _context.Courses
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id,
                c.Slug,
                c.Name,
                c.Icon,
                c.ChapterCount,
                c.LevelCount,
                c.IsAvailable
            })
            .ToListAsync();

        return Ok(courses);
    }

    // GET /api/courses/stats — real enrollment counts for the landing page's globe tooltips and
    // stat cards. "Enrolled" = has at least one UserMapProgress row on that track (created the
    // moment a user completes their first level there — see MapController.CompleteLevel), so
    // catalog-only tracks with no lesson content (SQL, C++, React) correctly read 0 rather than
    // a made-up number.
    [HttpGet("stats")]
    public async Task<IActionResult> GetCourseStats()
    {
        var courses = await _context.Courses
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        var enrollmentCounts = await _context.UserMapProgress
            .Select(p => new { p.Track, p.UserId })
            .Distinct()
            .GroupBy(p => p.Track)
            .Select(g => new { Track = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.Track, g => g.Count);

        var stats = courses.Select(c => new
        {
            c.Id,
            c.Slug,
            c.Name,
            c.Icon,
            c.IsAvailable,
            Students = enrollmentCounts.TryGetValue(c.Slug, out var count) ? count : 0
        });

        return Ok(stats);
    }
}
