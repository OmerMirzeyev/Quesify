namespace backend.Services;

public interface INotificationService
{
    /// Pushes a real-time toast to every connection the given user currently has open.
    Task NotifyUserAsync(string email, string type, string message);

    /// Pushes a real-time toast to every currently-connected client (platform-wide announcements).
    Task BroadcastAsync(string type, string message);
}
