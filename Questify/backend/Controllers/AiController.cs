using backend.Data;
using backend.Extensions;
using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize] // logged-in only — the OpenRouter key/quota is server-side, don't expose it to anonymous callers
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly AppDbContext _context;

    public AiController(IAiService aiService, AppDbContext context)
    {
        _aiService = aiService;
        _context = context;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequestDto request)
    {
        if (request?.Messages is null || request.Messages.Count == 0)
        {
            return BadRequest(new { message = "No message provided." });
        }

        var history = request.Messages
            .Where(m => m.Role is "user" or "bot")
            .Select(m => (Role: m.Role == "bot" ? "assistant" : "user", Content: m.Content))
            .ToList();

        var course = await ResolveEnrolledCourseAsync(request.Course);

        var reply = await _aiService.AskAsync(history, course);
        return Ok(new { reply });
    }

    // The frontend hint (Dashboard's activeProgrammingLanguage) is trusted only after it matches
    // a real, enrollable course slug. Otherwise we fall back to the DB: whichever track the user
    // most recently made progress on, so the language lock still applies even if the client
    // didn't send a hint (or sent a bogus one).
    private async Task<string?> ResolveEnrolledCourseAsync(string? requestedCourse)
    {
        if (AiService.IsKnownCourse(requestedCourse))
        {
            return requestedCourse;
        }

        var email = User.GetEmail();
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var lastActiveTrack = await _context.UserMapProgress
            .Where(p => p.User.Email == email)
            .OrderByDescending(p => p.CompletedAt ?? DateTime.MinValue)
            .ThenByDescending(p => p.Id)
            .Select(p => p.Track)
            .FirstOrDefaultAsync();

        return AiService.IsKnownCourse(lastActiveTrack) ? lastActiveTrack : null;
    }
}
