using backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Services;

// Client event name is fixed as "ReceiveNotification" — see the frontend's SignalR listener in
// src/utils/signalr.js, which must stay in sync with this string and the payload shape below.
public record NotificationPayload(string Type, string Message, DateTime Timestamp);

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public Task NotifyUserAsync(string email, string type, string message) =>
        _hub.Clients.Group(NotificationHub.GroupNameFor(email))
            .SendAsync("ReceiveNotification", new NotificationPayload(type, message, DateTime.UtcNow));

    public Task BroadcastAsync(string type, string message) =>
        _hub.Clients.All.SendAsync("ReceiveNotification", new NotificationPayload(type, message, DateTime.UtcNow));
}
