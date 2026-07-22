namespace backend.Models;

public class ModerationAction
{
    public int Id { get; set; }
    public int TargetUserId { get; set; }
    public int AdminUserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
