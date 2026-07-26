using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize] // logged-in only — the OpenRouter key/quota is server-side, don't expose it to anonymous callers
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
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

        var reply = await _aiService.AskAsync(history);
        return Ok(new { reply });
    }
}
