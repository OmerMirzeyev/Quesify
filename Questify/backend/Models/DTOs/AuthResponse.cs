namespace backend.Models.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string Role { get; set; } = string.Empty;
}
