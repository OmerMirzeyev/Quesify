namespace backend.Models.DTOs;

public class GenerateQuestionRequestDto
{
    public string Language { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
}
