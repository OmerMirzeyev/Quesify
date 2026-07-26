namespace backend.Models;

// Join row recording that a user earned a specific Badge — one per (UserId, BadgeId),
// enforced via a unique index in AppDbContext.
public class UserBadge
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int BadgeId { get; set; }
    public Badge Badge { get; set; } = null!;
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
}
