namespace backend.Models.DTOs;

// Returned by Register instead of a token — the client must complete /verify-email-otp with
// this Email + the code emailed to the user before it receives an AuthResponse.
public class OtpChallengeResponse
{
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
