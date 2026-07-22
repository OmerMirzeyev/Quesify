namespace backend.Models;

public class UserInventory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int ShopItemId { get; set; }
    public ShopItem ShopItem { get; set; } = null!;
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
    public bool IsEquipped { get; set; } = false;
}
