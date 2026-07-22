namespace backend.Models;

public class ShopItem
{
    public int Id { get; set; }
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

    // null = unlimited stock (the default for existing/legacy items). A non-null value is
    // decremented on each successful purchase and blocks purchase at 0.
    public int? Stock { get; set; } = null;
}
