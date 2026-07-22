using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

// Mirrors ShopItem minus Id, so a client can never supply/override the Id (over-posting).
public class CreateShopItemDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public int Price { get; set; }
    public string Emoji { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ItemType { get; set; } = string.Empty;
    public string Rarity { get; set; } = string.Empty;
    public string Game { get; set; } = string.Empty;
    public string GameColor { get; set; } = string.Empty;
    public string GameBg { get; set; } = string.Empty;
    public string GameBorder { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public int? Stock { get; set; } = null;
}
