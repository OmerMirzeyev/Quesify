namespace backend.Models;

// DB-backed OTP challenge issued by Register/Login before a JWT is handed out — every
// path to an authenticated session goes through one of these rows.
public class LoginOtp
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string ChallengeId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
