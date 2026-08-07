namespace backend.Models;

// A level (map node) within a Chapter. Same additive-layer relationship to the static frontend
// content as Chapter — see Chapter.cs. OrderIndex matches UserMapProgress.LevelIndex.
public class Level
{
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public Chapter Chapter { get; set; } = null!;
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Topic { get; set; } = "General";
    public string Icon { get; set; } = "📝";

    // Canonical English form ("Easy" | "Medium" | "Hard") — matches what AiService's prompt
    // template and GenerateQuestionRequestDto already expect, so no translation table is needed
    // when a level's own topic/difficulty feeds an AI generation call.
    public string Difficulty { get; set; } = "Easy";
    public int XpReward { get; set; } = 100;
    public int GoldReward { get; set; } = 50;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Question> Questions { get; set; } = new();
}
