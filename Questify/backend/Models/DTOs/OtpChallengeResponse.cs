namespace backend.Models.DTOs;

// Returned by Register/Login instead of a token — the client must complete /verify-otp
// with this Email + ChallengeId before it receives an AuthResponse.
public class OtpChallengeResponse
{
    public string Email { get; set; } = string.Empty;
    public string ChallengeId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool RequiresOtp { get; set; } = true;
}
