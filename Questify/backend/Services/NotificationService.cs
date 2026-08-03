using backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services;

// Client event name is fixed as "ReceiveNotification" — see the frontend's SignalR listener in
// src/utils/signalr.js, which must stay in sync with this string and the payload shape below.
public record NotificationPayload(string Type, string Message, DateTime Timestamp, object? Data = null);

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public Task NotifyUserAsync(string email, string type, string message, object? data = null) =>
        _hub.Clients.Group(NotificationHub.GroupNameFor(email))
            .SendAsync("ReceiveNotification", new NotificationPayload(type, message, DateTime.UtcNow, data));

    public Task BroadcastAsync(string type, string message) =>
        _hub.Clients.All.SendAsync("ReceiveNotification", new NotificationPayload(type, message, DateTime.UtcNow));
}
