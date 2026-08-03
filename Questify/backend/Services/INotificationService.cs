namespace backend.Services;

public interface INotificationService
{
    /// Pushes a real-time toast to every connection the given user currently has open. `data` is
    /// optional structured payload (e.g. chat message sender/preview) beyond the human-readable
    /// `message` string, for callers that need the frontend to act on it (not just display it).
    Task NotifyUserAsync(string email, string type, string message, object? data = null);

    /// Pushes a real-time toast to every currently-connected client (platform-wide announcements).
    Task BroadcastAsync(string type, string message);
}
