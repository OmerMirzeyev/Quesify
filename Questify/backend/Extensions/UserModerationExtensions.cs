using backend.Models;

namespace backend.Extensions;

public static class UserModerationExtensions
{
    // Shared by Login (blocks issuing a new token) and BanEnforcementFilter (blocks
    // requests from an already-issued token), so ban/timeout enforcement can't drift
    // between the two call sites.
    public static (bool IsBlocked, string? Message) CheckModerationStatus(this User user)
    {
        if (user.IsBanned)
            return (true, "Hesabınız bloklanıb.");

        if (user.TimeoutUntil.HasValue && user.TimeoutUntil.Value > DateTime.UtcNow)
            return (true, $"Hesabınız məhdudlaşdırılıb. Bitmə vaxtı: {user.TimeoutUntil.Value:u}");

        return (false, null);
    }
}
