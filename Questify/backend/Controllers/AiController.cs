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
    // Hard ceiling on total request time (AiService itself bounds each of its up-to-2 model
    // attempts to 15s each, i.e. ~30s worst case) — this is the safety net that turns a stuck
    // upstream call into a clean 504 instead of the frontend spinner hanging indefinitely.
    private static readonly TimeSpan RequestDeadline = TimeSpan.FromSeconds(35);

    private readonly IAiService _aiService;
    private readonly AppDbContext _context;
    private readonly ILogger<AiController> _logger;

    public AiController(IAiService aiService, AppDbContext context, ILogger<AiController> logger)
    {
        _aiService = aiService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequestDto request, CancellationToken cancellationToken)
    {
        if (request?.Messages is null || request.Messages.Count == 0)
        {
            return BadRequest(new { message = "No message provided." });
        }

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(RequestDeadline);

        try
        {
            var history = request.Messages
                .Where(m => m.Role is "user" or "bot")
                .Select(m => (Role: m.Role == "bot" ? "assistant" : "user", Content: m.Content))
                .ToList();

            var course = await ResolveEnrolledCourseAsync(request.Course);

            var (reply, debugError) = await _aiService.AskAsync(history, course, cts.Token);
            if (debugError is not null)
            {
                // Caught silently from the user's perspective — the exact upstream failure (rate
                // limit, bad model id, timeout, etc.) only ever goes to the server log. The
                // frontend gets an empty `reply` and degrades to its own clean fallback message.
                _logger.LogError("AI chat failed — raw reason: {DebugError}", debugError);
            }
            return Ok(new { reply });
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("AI chat request exceeded the {Deadline}s deadline.", RequestDeadline.TotalSeconds);
            return StatusCode(StatusCodes.Status504GatewayTimeout, new { message = "AI mentor request timed out. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error handling AI chat request.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong reaching the AI mentor. Please try again." });
        }
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
