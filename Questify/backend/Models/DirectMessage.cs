namespace backend.Models;

// Loose references to User (SenderId/ReceiverId) rather than FK navigation properties — same
// pattern already used by ModerationAction's TargetUserId/AdminUserId — so two FKs into the same
// User table never force an ambiguous cascade-delete decision.
public class DirectMessage
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
}
