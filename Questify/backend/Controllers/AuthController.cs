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
