using backend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

// Real-time push channel for toasts/badge updates — e.g. a moderation action landing on the
// affected user, or an admin-triggered platform-wide announcement (see INotificationService).
// Every authenticated connection joins a per-email group on connect, so server code can target
// "this user" (across every tab/device they have open) without tracking raw connection IDs.
[Authorize]
public class NotificationHub : Hub
{
    public static string GroupNameFor(string email) => $"user:{email.Trim().ToLowerInvariant()}";

    public override async Task OnConnectedAsync()
    {
        var email = Context.User?.GetEmail();
        if (!string.IsNullOrWhiteSpace(email))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupNameFor(email));
        }

        await base.OnConnectedAsync();
    }
}
