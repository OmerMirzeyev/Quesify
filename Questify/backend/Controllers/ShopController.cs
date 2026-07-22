using backend.Data;
using backend.Models;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShopController : ControllerBase
{
    private readonly AppDbContext _context;

    public ShopController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/shop — public, returns all items
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _context.ShopItems.ToListAsync();
        return Ok(items);
    }

    // POST /api/shop — Admin only, adds a new item. Binds a DTO (not the ShopItem entity
    // directly) so a client can never supply/override the Id (over-posting).
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddItem([FromBody] CreateShopItemDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Item adı boş ola bilməz." });

        var item = new ShopItem
        {
            Name = dto.Name,
            Price = dto.Price,
            Emoji = dto.Emoji,
            Type = dto.Type,
            ItemType = dto.ItemType,
            Rarity = dto.Rarity,
            Game = dto.Game,
            GameColor = dto.GameColor,
            GameBg = dto.GameBg,
            GameBorder = dto.GameBorder,
            Desc = dto.Desc,
            Stock = dto.Stock
        };

        _context.ShopItems.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, item);
    }

    // DELETE /api/shop/{id} — Admin only, removes item by ID
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.ShopItems.FindAsync(id);
        if (item is null) return NotFound(new { message = "Item tapılmadı." });

        _context.ShopItems.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"\"{item.Name}\" silindi.", id = item.Id });
    }

    // POST /api/shop/{id}/stock?stock=10 — Admin only, sets absolute stock (increase/decrease
    // both go through the same "set new value" call from the store page). ?unlimited=true clears
    // the limit back to null instead.
    [HttpPost("{id:int}/stock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetStock(int id, [FromQuery] int? stock, [FromQuery] bool unlimited = false)
    {
        var item = await _context.ShopItems.FindAsync(id);
        if (item is null) return NotFound(new { message = "Item tapılmadı." });

        if (unlimited)
        {
            item.Stock = null;
        }
        else
        {
            if (stock is null || stock < 0)
                return BadRequest(new { message = "Stok mənfi ola bilməz." });
            item.Stock = stock;
        }

        await _context.SaveChangesAsync();

        return Ok(new { id = item.Id, stock = item.Stock });
    }
}
