namespace backend.Models.DTOs;

public class AiChatMessageDto
{
    // "user" or "bot" (frontend's sender values) — "system" banner messages are UI-only and
    // filtered out by the controller before this ever reaches the AI service.
    public string Role { get; set; } = "user";
    public string Content { get; set; } = string.Empty;
}
