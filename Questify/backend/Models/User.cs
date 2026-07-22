namespace backend.Models;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
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
}
