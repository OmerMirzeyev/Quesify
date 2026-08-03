namespace backend.Models;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Sanitized, unique handle (lowercase, no spaces/diacritics) — auto-generated at registration
    // (from FirstName+LastName) or Google sign-in (from the Google display name), with a numeric
    // suffix appended on collision. Editable later from the Profile Settings page.
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public string? Emoji { get; set; }
    public bool IsBanned { get; set; } = false;
    public DateTime? TimeoutUntil { get; set; }
    public string? AvatarUrl { get; set; }
    public int Coins { get; set; } = 0;
    public bool HasUnlimitedCoins { get; set; } = false;

    // Denormalized copies of the currently-equipped cosmetic ShopItem ids (same pattern as
    // Emoji/AvatarUrl above) so other users' clients can render a user's frame/theme without a
    // join through UserInventory — loose references, not FKs, to keep the delete-cascade graph simple.
    public int? EquippedFrameId { get; set; }
    public int? EquippedThemeId { get; set; }

    // Email OTP — shared by both registration verification and password-reset flows (a user
    // is never doing both at once, so one pair of columns covers both purposes).
    public bool IsEmailVerified { get; set; } = false;
    public string? EmailOtpCode { get; set; }
    public DateTime? EmailOtpExpiresAt { get; set; }

    // Gamification — Xp is server-authoritative (awarded by MapController on level completion),
    // separate from the frontend's legacy local gold/xp economy. Streak fields are maintained by
    // AuthController's daily heartbeat: CurrentStreak increments once per new calendar day of
    // activity and resets to 1 after a missed day; HighestStreak is a high-water mark.
    public int Xp { get; set; } = 0;
    public int CurrentStreak { get; set; } = 0;
    public int HighestStreak { get; set; } = 0;
    public DateTime? LastActiveDate { get; set; }
}
