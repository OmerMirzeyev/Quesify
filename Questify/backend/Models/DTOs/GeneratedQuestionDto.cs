namespace backend.Models.DTOs;

public class GeneratedQuestionDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public int CorrectIndex { get; set; }
    public string Hint { get; set; } = string.Empty;

    // Echoed back only when GenerateQuestionRequestDto.ChapterId/LevelId were provided — see the
    // comment there. Null for the plain preview-only flow that predates level targeting.
    public int? ChapterId { get; set; }
    public int? LevelId { get; set; }
    public string? LevelTitle { get; set; }
}
