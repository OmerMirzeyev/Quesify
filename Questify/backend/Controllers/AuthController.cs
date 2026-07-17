using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = model.Email.Trim().ToLowerInvariant();
        var role = email == "admin@gmail.com" && model.Password == "admin123"
            ? "Admin"
            : "User";

        var expirationMinutes = _configuration.GetValue("Jwt:ExpirationMinutes", 60);
        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var token = GenerateJwtToken(email, role, expiration);

        return Ok(new AuthResponse
        {
            Token = token,
            Expiration = expiration,
            Role = role
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
