namespace backend.Models.DTOs;

public class UpdateProfileModel
{
    // Target user is derived from the caller's JWT claims, never from the request body
    // (this used to take a raw Email here with no [Authorize], letting anyone overwrite
    // anyone else's profile).
    public string? AvatarUrl { get; set; }
    public string? Emoji { get; set; }
}
