namespace backend.Models.DTOs;

public class GenerateQuestionRequestDto
{
    public string Language { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;

    // The admin's current UI language (e.g. "Azerbaijani" | "English" | "Turkish") — the generated
    // title/description/question/options/hint are written in this language, not tied to the "Language"
    // field above (which is the programming language the question is ABOUT, e.g. "Java").
    public string? ContentLanguage { get; set; }
}
