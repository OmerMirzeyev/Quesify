namespace backend.Models.DTOs;

public class GeneratedQuestionDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public int CorrectIndex { get; set; }
    public string Hint { get; set; } = string.Empty;
}
