using System.Net;
using System.Net.Mail;
using System.Linq;

namespace backend.Services;

// Sends real mail over SMTP when EmailSettings are configured; otherwise (the default in a
// fresh clone — appsettings.json ships with placeholder credentials) logs the code to the
// backend terminal instead, so OTP flows are usable out of the box without any mail setup.
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(string toEmail, string code, string purpose)
    {
        var settings = _configuration.GetSection("EmailSettings");
        var senderEmail = settings["SenderEmail"];
        var appPassword = settings["AppPassword"];
        var host = settings["Host"] ?? "smtp.gmail.com";
        var port = settings.GetValue("Port", 587);

        var isConfigured =
            !string.IsNullOrWhiteSpace(senderEmail) &&
            !string.IsNullOrWhiteSpace(appPassword) &&
            senderEmail != "your-email@gmail.com" &&
            appPassword != "your-app-password";

        if (!isConfigured)
        {
            _logger.LogInformation(
                "[DEV-ONLY EMAIL — SMTP not configured] To={Email} Purpose={Purpose} Code={Code}",
                toEmail, purpose, code);
            return;
        }

        try
        {
            using var client = new SmtpClient(host, port);
            // UseDefaultCredentials must be set to false BEFORE assigning Credentials —
            // SmtpClient silently resets Credentials to null otherwise, causing a 5.7.0
            // "authentication required" failure that never surfaces to the caller.
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential(senderEmail, appPassword);
            client.EnableSsl = true;
            client.Port = 587;

            using var mail = new MailMessage(
                senderEmail!,
                toEmail,
                $"Questify — {purpose} Code",
                BuildHtmlBody(code, purpose))
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(mail);
        }
        catch (Exception ex)
        {
            // Never let a mail-server hiccup block the OTP flow — the code is already saved
            // server-side, so fall back to the dev log the same way an unconfigured SMTP would.
            _logger.LogWarning(ex,
                "Failed to send {Purpose} email to {Email}; logging code instead. Code={Code}",
                purpose, toEmail, code);
        }
    }

    private static string BuildHtmlBody(string code, string purpose)
    {
        var digitBoxes = string.Concat(code.Select(d =>
            $"<td style=\"width:38px;height:48px;background:#1e1b3a;border:1px solid #3d3865;" +
            $"border-radius:8px;text-align:center;vertical-align:middle;\">" +
            $"<span style=\"font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#22d3ee;\">{d}</span></td>" +
            "<td style=\"width:8px;\"></td>"));

        return $$"""
            <div style="background:#0f0d24;padding:32px 16px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
              <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#161331;border-radius:16px;overflow:hidden;border:1px solid #2a2653;">
                <tr>
                  <td style="padding:28px 32px 8px;text-align:center;">
                    <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">
                      ⚔️ Quest<span style="color:#22d3ee;">ify</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 4px;text-align:center;">
                    <p style="color:#a5a0c9;font-size:15px;margin:0;">{{purpose}}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px;text-align:center;">
                    <table role="presentation" style="margin:0 auto;border-collapse:separate;">
                      <tr>{{digitBoxes}}</tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 28px;text-align:center;">
                    <p style="color:#7a76a3;font-size:13px;line-height:1.6;margin:0;">
                      This code expires in 10 minutes.<br />
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </div>
            """;
    }
}
