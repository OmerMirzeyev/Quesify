namespace backend.Models.DTOs;

public class MapProgressDto
{
    public string Track { get; set; } = string.Empty;
    public int ChapterIndex { get; set; }
    public int LevelIndex { get; set; }
    public bool IsUnlocked { get; set; }
    public bool IsCompleted { get; set; }
}
