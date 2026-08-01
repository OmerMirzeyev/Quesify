namespace backend.Models.DTOs;

public class AiChatRequestDto
{
    public List<AiChatMessageDto> Messages { get; set; } = new();

    // Client-side hint for which course the user is currently studying (Dashboard's
    // activeProgrammingLanguage) — untrusted input, so the controller only honors it after
    // matching it against the known enrollable course slugs; otherwise it falls back to the
    // user's most recently active track in the database.
    public string? Course { get; set; }
}
