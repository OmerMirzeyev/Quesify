namespace backend.Models.DTOs;

// Partial-update DTO for PUT /api/shop/{id} — every field is optional so the admin panel can
// send just the fields it actually edited (e.g. price + description) without clobbering the rest.
public class UpdateShopItemDto
{
    public string? Name { get; set; }
    public int? Price { get; set; }
    public string? Emoji { get; set; }
    public string? Type { get; set; }
    public string? ItemType { get; set; }
    public string? Rarity { get; set; }
    public string? Game { get; set; }
    public string? GameColor { get; set; }
    public string? GameBg { get; set; }
    public string? GameBorder { get; set; }
    public string? Desc { get; set; }
}
