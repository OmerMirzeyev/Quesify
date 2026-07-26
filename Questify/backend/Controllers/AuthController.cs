using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
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
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IEmailService _emailService;

    public AuthController(
        IConfiguration configuration,
        AppDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<AuthController> logger,
        IHttpClientFactory httpClientFactory,
        IEmailService emailService)
    {
        _configuration = configuration;
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
        _emailService = emailService;
    }

    private const int EmailOtpTtlMinutes = 10;

    // Shared by register (purpose "Email Verification") and forgot-password (purpose "Password
    // Reset") — both just need a fresh 6-digit code on the user record and an email sent.
    private async Task GenerateAndSendOtpAsync(User user, string purpose)
    {
        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        user.EmailOtpCode = code;
        user.EmailOtpExpiresAt = DateTime.UtcNow.AddMinutes(EmailOtpTtlMinutes);
        await _context.SaveChangesAsync();
        await _emailService.SendOtpEmailAsync(user.Email, code, purpose);
    }

    [HttpPost("register")]
    public async Task<ActionResult<OtpChallengeResponse>> Register([FromBody] RegisterModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existingUser is not null)
        {
            if (existingUser.IsEmailVerified)
            {
                return Conflict(new { message = "Email is already registered." });
            }

            // Unverified accounts (e.g. left over from before the mail system worked) never
            // proved ownership of the inbox, so re-registering is safe: refresh their details
            // and password, then send a brand-new OTP instead of permanently locking the email.
            existingUser.FirstName = model.FirstName.Trim();
            existingUser.LastName = model.LastName.Trim();
            existingUser.PasswordHash = _passwordHasher.HashPassword(model.Password);
            existingUser.Emoji = model.Emoji;
            await _context.SaveChangesAsync();

            await GenerateAndSendOtpAsync(existingUser, "Email Verification");

            return Ok(new OtpChallengeResponse
            {
                Email = existingUser.Email,
                Message = "A verification code has been sent to your email."
            });
        }

        var user = new User
        {
            FirstName = model.FirstName.Trim(),
            LastName = model.LastName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(model.Password),
            Role = "User",
            Emoji = model.Emoji,
            IsEmailVerified = false
        };

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // The unique index on Email caught a race between the lookup above and this insert.
            if (await _context.Users.AnyAsync(u => u.Email == email && u.Id != user.Id))
                return Conflict(new { message = "Email is already registered." });
            throw;
        }

        await GenerateAndSendOtpAsync(user, "Email Verification");

        return Ok(new OtpChallengeResponse
        {
            Email = user.Email,
            Message = "A verification code has been sent to your email."
        });
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
            Role = user.Role,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Emoji = user.Emoji
        });
    }

    // Completes registration: validates the code emailed by /register, marks the account
    // verified, and issues the real JWT — this is the only path that turns a fresh registration
    // into an authenticated session.
    [HttpPost("verify-email-otp")]
    public async Task<ActionResult<AuthResponse>> VerifyEmailOtp([FromBody] VerifyOtpDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            return NotFound(new { message = "No account was found with this email." });
        }

        if (user.EmailOtpCode is null || user.EmailOtpCode != model.Code.Trim())
        {
            return BadRequest(new { message = "Invalid verification code." });
        }

        if (user.EmailOtpExpiresAt is null || user.EmailOtpExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "The verification code has expired. Please request a new one." });
        }

        var (isBlocked, blockMessage) = user.CheckModerationStatus();
        if (isBlocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = blockMessage });
        }

        user.IsEmailVerified = true;
        user.EmailOtpCode = null;
        user.EmailOtpExpiresAt = null;
        await _context.SaveChangesAsync();

        var expirationMinutes = _configuration.GetValue("Jwt:ExpirationMinutes", 60);
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var token = GenerateJwtToken(user.Email, user.Role, expiration);

        return Ok(new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            Role = user.Role,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Emoji = user.Emoji
        });
    }

    // Re-sends the registration verification code — also reusable if a user's forgot-password
    // code expired before they got to it, since both share the same User.EmailOtpCode column.
    [HttpPost("resend-otp")]
    public async Task<ActionResult> ResendOtp([FromBody] ResendOtpDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            return NotFound(new { message = "No account was found with this email." });
        }

        await GenerateAndSendOtpAsync(user, "Email Verification");

        return Ok(new { message = "A new verification code has been sent to your email." });
    }

    // Google Sign-In — verifies the ID token Google Identity Services hands back on the frontend
    // against Google's tokeninfo endpoint (no client secret needed for ID token verification),
    // then either logs the matching local account in or auto-registers a new one from the
    // token's profile claims. Requires "Authentication:Google:ClientId" to be configured;
    // otherwise this responds 501 so the frontend can show a clear "not configured" message
    // instead of a confusing generic failure.
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleAuth([FromBody] GoogleAuthDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var googleClientId = _configuration["Authentication:Google:ClientId"];
        if (string.IsNullOrWhiteSpace(googleClientId))
        {
            return StatusCode(StatusCodes.Status501NotImplemented,
                new { message = "Google Sign-In is not configured on the server yet." });
        }

        GoogleTokenInfo? tokenInfo;
        try
        {
            var http = _httpClientFactory.CreateClient();
            var response = await http.GetAsync(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(model.Credential)}");
            if (!response.IsSuccessStatusCode)
            {
                return Unauthorized(new { message = "Invalid Google credential." });
            }
            tokenInfo = await response.Content.ReadFromJsonAsync<GoogleTokenInfo>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Google token verification request failed.");
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = "Could not verify the Google credential." });
        }

        if (tokenInfo is null
            || string.IsNullOrEmpty(tokenInfo.Email)
            || !string.Equals(tokenInfo.Aud, googleClientId, StringComparison.Ordinal)
            || !string.Equals(tokenInfo.EmailVerified, "true", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(new { message = "Invalid Google credential." });
        }

        var email = tokenInfo.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            // Google-only accounts still need a PasswordHash (NOT NULL) — they never use it to
            // sign in, so a random value that's never handed back to anyone is fine here.
            user = new User
            {
                FirstName = string.IsNullOrWhiteSpace(tokenInfo.GivenName) ? "Questify" : tokenInfo.GivenName,
                LastName = string.IsNullOrWhiteSpace(tokenInfo.FamilyName) ? "Player" : tokenInfo.FamilyName,
                Email = email,
                PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N")),
                Role = "User",
                Emoji = "🎮",
                AvatarUrl = tokenInfo.Picture,
                IsEmailVerified = true
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
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
            Role = user.Role,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Emoji = user.Emoji
        });
    }

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
            return NotFound(new { message = "No account was found with this email address." });
        }

        await GenerateAndSendOtpAsync(user, "Password Reset");

        return Ok(new { message = "A password reset code has been sent to your email." });
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
            return NotFound(new { message = "User not found." });
        }

        if (user.EmailOtpCode is null || user.EmailOtpCode != model.Code.Trim())
        {
            return BadRequest(new { message = "Invalid verification code." });
        }

        if (user.EmailOtpExpiresAt is null || user.EmailOtpExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "The verification code has expired. Please request a new one." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(model.Password);
        user.EmailOtpCode = null;
        user.EmailOtpExpiresAt = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Your password has been updated successfully!" });
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

    // POST /api/auth/heartbeat — called once per active session (right after login, and again on
    // every app hydration/reload while the JWT is still valid) so the daily streak advances even
    // when a user never re-submits the login form on a later day. Idempotent within a day: a
    // second call on the same UTC date is a no-op besides re-returning the current totals.
    [Authorize]
    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat()
    {
        var email = User.GetEmail();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Unauthorized();

        var today = DateTime.UtcNow.Date;
        var lastActive = user.LastActiveDate?.Date;

        if (lastActive != today)
        {
            user.CurrentStreak = lastActive == today.AddDays(-1) ? user.CurrentStreak + 1 : 1;
            user.HighestStreak = Math.Max(user.HighestStreak, user.CurrentStreak);
            user.LastActiveDate = today;
        }

        if (user.CurrentStreak >= 7) await BadgeAwarder.AwardAsync(_context, user, "streak_7");
        if (user.CurrentStreak >= 30) await BadgeAwarder.AwardAsync(_context, user, "streak_30");

        var top10Ids = await _context.Users
            .Where(u => u.Role != "Admin")
            .OrderByDescending(u => u.Xp)
            .Take(10)
            .Select(u => u.Id)
            .ToListAsync();
        if (top10Ids.Contains(user.Id)) await BadgeAwarder.AwardAsync(_context, user, "top10");

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            currentStreak = user.CurrentStreak,
            highestStreak = user.HighestStreak,
            xp = user.Xp,
            lastActiveDate = user.LastActiveDate
        });
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
