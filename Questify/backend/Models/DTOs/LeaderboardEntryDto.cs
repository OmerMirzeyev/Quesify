namespace backend.Models.DTOs;

// Deliberately omits Email — the leaderboard is public/unauthenticated and must not
// leak which email addresses are registered.
public class LeaderboardEntryDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Emoji { get; set; }
    public string? AvatarUrl { get; set; }
    public int? EquippedFrameId { get; set; }
    public int? EquippedThemeId { get; set; }
    public string Role { get; set; } = string.Empty;
}
