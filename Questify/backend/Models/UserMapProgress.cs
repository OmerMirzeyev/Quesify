namespace backend.Models;

// Per-user unlock/completion state. Quiz/level content itself (chapters, questions)
// stays owned by the frontend (src/data/mockData.js) — this table only tracks which
// (Track, ChapterIndex, LevelIndex) tuples a given user has unlocked/completed, so it
// never has to be kept in sync with frontend content changes.
public class UserMapProgress
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Track { get; set; } = string.Empty;
    public int ChapterIndex { get; set; }
    public int LevelIndex { get; set; }
    public bool IsUnlocked { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
}
