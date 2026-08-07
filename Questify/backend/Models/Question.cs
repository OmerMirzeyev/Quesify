namespace backend.Models;

// A multiple-choice question bound to a specific Level — created either by an admin filling the
// manual form (AdminController.CreateQuestion) or by the AI-generate-for-level flow
// (AdminController.GenerateQuestionForLevel). A level can hold more than one Question over time
// (e.g. an admin tops up a level with extra AI-generated questions later).
public class Question
{
    public int Id { get; set; }
    public int LevelId { get; set; }
    public Level Level { get; set; } = null!;
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;

    // "A" | "B" | "C" | "D" — matches the literal JSON shape the admin UI/AI response use.
    public string CorrectOption { get; set; } = "A";
    public string? Hint { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
