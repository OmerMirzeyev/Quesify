using backend.Data;
using backend.Extensions;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MarketController : ControllerBase
{
    // Repeatable purchases — everything else (avatars/badges/frames/themes) can only be owned once.
    private static readonly HashSet<string> ConsumableItemTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "potion_heart", "joker_5050", "streak_freeze", "double_xp"
    };

    // Cosmetic categories where owning several is fine, but only one of each category can be
    // equipped at a time (mirrors the avatar behavior that already existed).
    private static readonly HashSet<string> EquippableSingleSlotTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "avatar", "frame", "theme"
    };

    private readonly AppDbContext _context;

    public MarketController(AppDbContext context)
    {
        _context = context;
    }

    // POST /api/market/purchase — spends Coins (unless HasUnlimitedCoins), records ownership.
    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseRequestDto model)
    {
        var email = User.GetEmail();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var item = await _context.ShopItems.FindAsync(model.ShopItemId);
        if (item is null) return NotFound(new { message = "Məhsul tapılmadı." });

        var isConsumable = ConsumableItemTypes.Contains(item.ItemType);
        if (!isConsumable)
        {
            var alreadyOwned = await _context.UserInventories
                .AnyAsync(i => i.UserId == user.Id && i.ShopItemId == item.Id);
            if (alreadyOwned)
                return BadRequest(new { message = "Bu məhsul artıq sizdədir." });
        }

        // Stock applies to everyone, including admins — only the coin cost is bypassed for them.
        if (item.Stock.HasValue && item.Stock.Value <= 0)
            return BadRequest(new { message = "Stokda yoxdur." });

        var hasUnlimitedCoins = user.HasEffectiveUnlimitedCoins();
        if (!hasUnlimitedCoins && user.Coins < item.Price)
            return BadRequest(new { message = "Kifayət qədər coin yoxdur." });

        if (!hasUnlimitedCoins)
            user.Coins -= item.Price;

        if (item.Stock.HasValue)
            item.Stock -= 1;

        _context.UserInventories.Add(new UserInventory
        {
            UserId = user.Id,
            ShopItemId = item.Id
        });

        await _context.SaveChangesAsync();

        var ownedItemIds = await _context.UserInventories
            .Where(i => i.UserId == user.Id)
            .Select(i => i.ShopItemId)
            .ToListAsync();

        return Ok(new { coins = user.Coins, hasUnlimitedCoins, ownedItemIds });
    }

    // GET /api/market/inventory — caller's owned items + current coin balance.
    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        var email = User.GetEmail();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var inventory = await _context.UserInventories
            .Where(i => i.UserId == user.Id)
            .Include(i => i.ShopItem)
            .Select(i => new
            {
                i.Id,
                i.ShopItemId,
                i.ShopItem.Name,
                i.ShopItem.ItemType,
                i.ShopItem.Emoji,
                i.PurchasedAt,
                i.IsEquipped
            })
            .ToListAsync();

        return Ok(new { coins = user.Coins, hasUnlimitedCoins = user.HasEffectiveUnlimitedCoins(), inventory });
    }

    // POST /api/market/equip — validates ownership, unequips other items in the same cosmetic
    // slot (avatar/frame/theme), and mirrors the equipped choice onto denormalized User fields
    // so other users' clients can render it without a join through UserInventory.
    [HttpPost("equip")]
    public async Task<IActionResult> Equip([FromBody] EquipItemDto model)
    {
        var email = User.GetEmail();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var owned = await _context.UserInventories
            .Include(i => i.ShopItem)
            .FirstOrDefaultAsync(i => i.UserId == user.Id && i.ShopItemId == model.ShopItemId);
        if (owned is null) return BadRequest(new { message = "Bu məhsul sizdə yoxdur." });

        var itemType = owned.ShopItem.ItemType;
        if (EquippableSingleSlotTypes.Contains(itemType))
        {
            var others = await _context.UserInventories
                .Include(i => i.ShopItem)
                .Where(i => i.UserId == user.Id && i.Id != owned.Id && i.ShopItem.ItemType == itemType)
                .ToListAsync();
            foreach (var other in others) other.IsEquipped = false;

            if (string.Equals(itemType, "avatar", StringComparison.OrdinalIgnoreCase))
            {
                user.Emoji = owned.ShopItem.Emoji;
            }
            else if (string.Equals(itemType, "frame", StringComparison.OrdinalIgnoreCase))
            {
                user.EquippedFrameId = owned.ShopItemId;
            }
            else if (string.Equals(itemType, "theme", StringComparison.OrdinalIgnoreCase))
            {
                user.EquippedThemeId = owned.ShopItemId;
            }
        }

        owned.IsEquipped = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Təchiz edildi.", shopItemId = owned.ShopItemId, itemType });
    }
}
