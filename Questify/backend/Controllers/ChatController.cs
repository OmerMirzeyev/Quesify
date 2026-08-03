using backend.Data;
using backend.Extensions;
using backend.Models;
using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    // Toast preview length — long enough to be useful, short enough to fit a single-line toast.
    private const int PreviewLength = 60;

    private readonly AppDbContext _context;
    private readonly INotificationService _notifications;

    public ChatController(AppDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    // POST /api/chat/send — persists a direct message and pushes a real-time "new message" toast
    // to the receiver via NotificationHub (see NotifyUserAsync's optional `data`, which lets the
    // frontend append the message live instead of just displaying the toast text).
    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto model)
    {
        if (string.IsNullOrWhiteSpace(model?.ReceiverEmail) || string.IsNullOrWhiteSpace(model.Text))
        {
            return BadRequest(new { message = "Alıcı və mesaj mətni tələb olunur." });
        }

        var senderEmail = User.GetEmail();
        var sender = await _context.Users.FirstOrDefaultAsync(u => u.Email == senderEmail);
        if (sender is null) return Unauthorized();

        var normalizedReceiverEmail = model.ReceiverEmail.Trim().ToLowerInvariant();
        var receiver = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedReceiverEmail);
        if (receiver is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        var text = model.Text.Trim();
        var message = new DirectMessage
        {
            SenderId = sender.Id,
            ReceiverId = receiver.Id,
            Text = text,
            SentAt = DateTime.UtcNow,
            IsRead = false,
        };
        _context.DirectMessages.Add(message);
        await _context.SaveChangesAsync();

        var preview = text.Length > PreviewLength ? text[..PreviewLength] + "…" : text;
        await _notifications.NotifyUserAsync(
            receiver.Email,
            "chat_message",
            $"{sender.Username} sizə mesaj göndərdi: {preview}",
            new { SenderEmail = sender.Email, SenderUsername = sender.Username, Text = text, SentAt = message.SentAt });

        return Ok(new
        {
            id = message.Id,
            senderEmail = sender.Email,
            receiverEmail = receiver.Email,
            text = message.Text,
            sentAt = message.SentAt,
            isRead = message.IsRead
        });
    }

    // GET /api/chat/conversation?withEmail=... — full message history with one friend, oldest
    // first, so the frontend can hydrate its chat window regardless of which device either side
    // sent from. Marks the other person's messages read as a side effect of opening it.
    [HttpGet("conversation")]
    public async Task<IActionResult> GetConversation([FromQuery] string withEmail)
    {
        if (string.IsNullOrWhiteSpace(withEmail))
        {
            return BadRequest(new { message = "E-poçt tələb olunur." });
        }

        var myEmail = User.GetEmail();
        var me = await _context.Users.FirstOrDefaultAsync(u => u.Email == myEmail);
        if (me is null) return Unauthorized();

        var normalizedWithEmail = withEmail.Trim().ToLowerInvariant();
        var other = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedWithEmail);
        if (other is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        var messages = await _context.DirectMessages
            .Where(m => (m.SenderId == me.Id && m.ReceiverId == other.Id) || (m.SenderId == other.Id && m.ReceiverId == me.Id))
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                m.Id,
                senderEmail = m.SenderId == me.Id ? me.Email : other.Email,
                receiverEmail = m.ReceiverId == me.Id ? me.Email : other.Email,
                m.Text,
                m.SentAt,
                m.IsRead
            })
            .ToListAsync();

        var unreadIncomingIds = await _context.DirectMessages
            .Where(m => m.SenderId == other.Id && m.ReceiverId == me.Id && !m.IsRead)
            .Select(m => m.Id)
            .ToListAsync();
        if (unreadIncomingIds.Count > 0)
        {
            await _context.DirectMessages
                .Where(m => unreadIncomingIds.Contains(m.Id))
                .ExecuteUpdateAsync(setters => setters.SetProperty(m => m.IsRead, true));
        }

        return Ok(messages);
    }
}
