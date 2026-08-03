namespace backend.Models.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string Role { get; set; } = string.Empty;

    // Populated for Google sign-in (and available for any future auth path) so the frontend
    // doesn't have to fall back to whatever happened to be typed into the login form.
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Emoji { get; set; }

    // Sanitized handle (see UsernameGenerator) — lets a brand-new Google sign-in seed the local
    // profile with a real generated username instead of a generic placeholder.
    public string? Username { get; set; }
}
