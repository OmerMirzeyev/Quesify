using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Extensions;
using backend.Models;
using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IConfiguration configuration,
        AppDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<OtpChallengeResponse>> Register([FromBody] RegisterModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return Conflict(new { message = "Email is already registered." });
        }

        var user = new User
        {
            FirstName = model.FirstName.Trim(),
            LastName = model.LastName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(model.Password),
            Role = "User",
            Emoji = model.Emoji
        };

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // The unique index on Email caught a race between the AnyAsync check above and this insert.
            if (await _context.Users.AnyAsync(u => u.Email == email && u.Id != user.Id))
                return Conflict(new { message = "Email is already registered." });
            throw;
        }

        var challenge = await IssueOtpChallengeAsync(user);
        return Ok(challenge);
    }

    // Login issues a JWT directly — no OTP step. (OTP/2FA was tried here and explicitly
    // reverted per user request: it blocked normal sign-in with no SMTP configured to actually
    // deliver the code, so every login required digging through server logs. Register still
    // goes through IssueOtpChallengeAsync/VerifyOtp below, since only login was asked to change.)
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !_passwordHasher.VerifyPassword(model.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var (isBlocked, blockMessage) = user.CheckModerationStatus();
        if (isBlocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = blockMessage });
        }

        var expirationMinutes = _configuration.GetValue("Jwt:ExpirationMinutes", 60);
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var token = GenerateJwtToken(user.Email, user.Role, expiration);

        return Ok(new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            Role = user.Role
        });
    }

    // Every path to a JWT (register or login) goes through this: create a fresh OTP challenge,
    // log the code server-side (dev-only — no SMTP configured, same pattern as forgot-password),
    // and hand the client back a challenge id instead of a token.
    private async Task<OtpChallengeResponse> IssueOtpChallengeAsync(User user)
    {
        var challengeId = Guid.NewGuid().ToString("N");
        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        _context.LoginOtps.Add(new LoginOtp
        {
            UserId = user.Id,
            ChallengeId = challengeId,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpTtlMinutes)
        });
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "[DEV-ONLY] Login OTP issued for {Email} — challengeId={ChallengeId}, code={Code}",
            user.Email, challengeId, code);

        return new OtpChallengeResponse
        {
            Email = user.Email,
            ChallengeId = challengeId,
            Message = "Doğrulama kodu hazırlandı və qeydə alındı.",
            RequiresOtp = true
        };
    }

    private const int OtpTtlMinutes = 5;

    [HttpPost("verify-otp")]
    public async Task<ActionResult<AuthResponse>> VerifyOtp([FromBody] VerifyOtpDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var otp = await _context.LoginOtps
            .Include(o => o.User)
            .Where(o => o.ChallengeId == model.ChallengeId && o.User.Email == email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null || otp.Code != model.Code.Trim())
        {
            return BadRequest(new { message = "Yanlış doğrulama kodu." });
        }

        if (otp.ExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Doğrulama kodunun vaxtı bitib. Yenidən tələb edin." });
        }

        var (isBlocked, blockMessage) = otp.User.CheckModerationStatus();
        if (isBlocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = blockMessage });
        }

        otp.IsUsed = true;
        await _context.SaveChangesAsync();

        var expirationMinutes = _configuration.GetValue("Jwt:ExpirationMinutes", 60);
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var token = GenerateJwtToken(otp.User.Email, otp.User.Role, expiration);

        return Ok(new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            Role = otp.User.Role
        });
    }

    [HttpPost("resend-otp")]
    public async Task<ActionResult> ResendOtp([FromBody] ResendOtpDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var otp = await _context.LoginOtps
            .Include(o => o.User)
            .Where(o => o.ChallengeId == model.ChallengeId && o.User.Email == email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null)
        {
            return NotFound(new { message = "Doğrulama sorğusu tapılmadı. Yenidən daxil olmağa çalışın." });
        }

        otp.Code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        otp.ExpiresAt = DateTime.UtcNow.AddMinutes(OtpTtlMinutes);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "[DEV-ONLY] Login OTP resent for {Email} — challengeId={ChallengeId}, code={Code}",
            email, model.ChallengeId, otp.Code);

        return Ok(new { message = "Yeni doğrulama kodu hazırlandı və qeydə alındı." });
    }

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (string Code, DateTime ExpiresAt)> _resetCodes = new();
    private const int ResetCodeTtlMinutes = 10;

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            return NotFound(new { message = "Bu e-poçt ünvanı ilə qeydiyyatlı istifadəçi tapılmadı." });
        }

        // Generate a temporary password and a separate 6-digit confirmation code.
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        var tempPasswordChars = new char[8];
        for (int i = 0; i < tempPasswordChars.Length; i++)
            tempPasswordChars[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        var tempPassword = new string(tempPasswordChars);

        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        _resetCodes[email] = (code, DateTime.UtcNow.AddMinutes(ResetCodeTtlMinutes));

        user.PasswordHash = _passwordHasher.HashPassword(tempPassword);
        await _context.SaveChangesAsync();

        // SECURITY: previously this endpoint returned tempPassword/code directly in the HTTP
        // response — anyone who knew a victim's email could take over their account. No SMTP
        // credentials are configured yet (see EmailSettings in appsettings.json), so for now this
        // logs server-side only (dev visibility) instead of emailing it. Once real SMTP credentials
        // are supplied, replace this log line with a call to SendEmailAsync and keep the response
        // generic — never put secrets back in the response body.
        _logger.LogInformation(
            "[DEV-ONLY] Password reset issued for {Email} — code={Code}, tempPassword={TempPassword}",
            email, code, tempPassword);

        return Ok(new { message = "Müvəqqəti şifrəniz hazırlandı və qeydə alındı. Zəhmət olmasa admin ilə əlaqə saxlayın." });
    }

    private async Task SendEmailAsync(string recipientEmail, string subject, string body)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var senderEmail = emailSettings["SenderEmail"];
        var appPassword = emailSettings["AppPassword"];

        if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(appPassword))
        {
            throw new InvalidOperationException("Gmail SMTP 'SenderEmail' və ya 'AppPassword' konfiqurasiya olunmayıb.");
        }

        using var client = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new System.Net.NetworkCredential(senderEmail, appPassword),
            EnableSsl = true
        };

        using var mailMessage = new System.Net.Mail.MailMessage(senderEmail, recipientEmail, subject, body);
        await client.SendMailAsync(mailMessage);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            return NotFound(new { message = "İstifadəçi tapılmadı." });
        }

        if (!_resetCodes.TryGetValue(email, out var saved) || saved.Code != model.Code.Trim())
        {
            return BadRequest(new { message = "Yanlış doğrulama kodu." });
        }

        if (saved.ExpiresAt < DateTime.UtcNow)
        {
            _resetCodes.TryRemove(email, out _);
            return BadRequest(new { message = "Doğrulama kodunun vaxtı bitib. Yenidən tələb edin." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(model.Password);
        await _context.SaveChangesAsync();

        _resetCodes.TryRemove(email, out _);

        return Ok(new { message = "Şifrəniz uğurla yeniləndi!" });
    }

    // GET /api/auth/status?email=... — polls ban/timeout state. Requires auth: only the
    // caller themselves (or an Admin) may query a given email, to stop unauthenticated
    // enumeration of registered emails and their moderation state.
    [Authorize]
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "E-poçt tələb olunur." });

        var normalized = email.Trim().ToLowerInvariant();
        var callerEmail = User.GetEmail();
        if (!User.IsInRole("Admin") && !string.Equals(callerEmail, normalized, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalized);
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        return Ok(new
        {
            isBanned = user.IsBanned,
            timeoutUntil = user.TimeoutUntil,
            role = user.Role
        });
    }

    // POST /api/auth/update-profile — syncs avatar/emoji from frontend. Requires auth;
    // the target user is the caller themselves (from the JWT), never a body-supplied email.
    [Authorize]
    [HttpPost("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
    {
        var email = User.GetEmail();
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return NotFound(new { message = "İstifadəçi tapılmadı." });

        if (model.AvatarUrl is not null) user.AvatarUrl = model.AvatarUrl;
        if (model.Emoji is not null) user.Emoji = model.Emoji;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profil yeniləndi." });
    }

    private string GenerateJwtToken(string email, string role, DateTime expiration)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var signingKey = jwtSettings["SigningKey"]
            ?? throw new InvalidOperationException("JWT SigningKey is not configured.");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiration,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
