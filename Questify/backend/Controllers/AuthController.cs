using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using backend.Models.DTOs;
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

    public AuthController(IConfiguration configuration, AppDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterModel model)
    {
        Console.WriteLine($"Giriş cəhdi (Register) - E-poçt: {model?.Email}");
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage));
            Console.WriteLine($"Register model validation failed: {errors}");
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            Console.WriteLine($"Qeydiyyat ziddiyyəti: '{email}' artıq qeydiyyatdan keçib.");
            return Conflict(new { message = "Email is already registered." });
        }

        var user = new User
        {
            FirstName = model.FirstName.Trim(),
            LastName = model.LastName.Trim(),
            Email = email,
            PasswordHash = HashPassword(model.Password),
            Role = "User",
            Emoji = model.Emoji
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

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

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !VerifyPassword(model.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
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

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, string> _resetCodes = new();

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
            return NotFound(new { message = "İstifadəçi tapılmadı." });
        }

        // Generate a random 6-digit code
        var randomCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        _resetCodes[email] = randomCode;

        try
        {
            var subject = "Questify Şifrə Sıfırlama Kodu";
            var body = $@"Hörmətli {user.FirstName} {user.LastName},

Questify hesabınızın şifrəsini sıfırlamaq üçün doğrulama kodunuz: {randomCode}

Qeyd: Bu kodu heç kimlə paylaşmayın.";

            await SendEmailAsync(email, subject, body);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SMTP Error: {ex.Message}");
            return StatusCode(500, new { message = "E-poçt göndərilərkən xəta baş verdi. Zəhmət olmasa backend konfiqurasiyasını yoxlayın." });
        }

        return Ok(new 
        { 
            message = "Doğrulama kodu e-poçt ünvanınıza göndərildi. Zəhmət olmasa poçt qutunuzu yoxlayın." 
        });
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

        if (!_resetCodes.TryGetValue(email, out var savedCode) || savedCode != model.Code.Trim())
        {
            return BadRequest(new { message = "Yanlış doğrulama kodu." });
        }

        user.PasswordHash = HashPassword(model.Password);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        _resetCodes.TryRemove(email, out _);

        return Ok(new { message = "Şifrəniz uğurla yeniləndi!" });
    }

    private static string HashPassword(string password)
    {
        return Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password)));
    }

    private static bool VerifyPassword(string password, string passwordHash)
    {
        return HashPassword(password) == passwordHash;
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
