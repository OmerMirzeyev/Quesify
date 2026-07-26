namespace backend.Services;

public interface IEmailService
{
    /// Sends a 6-digit OTP code by email. `purpose` is a short human label ("Email Verification",
    /// "Password Reset", ...) used in the subject/body — not a routing key.
    Task SendOtpEmailAsync(string toEmail, string code, string purpose);
}
