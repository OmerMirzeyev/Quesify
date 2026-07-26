using System.Text.Json.Serialization;

namespace backend.Models.DTOs;

// Shape of the response from Google's https://oauth2.googleapis.com/tokeninfo?id_token=...
// endpoint — used to verify an ID token server-side without pulling in a full Google SDK.
public class GoogleTokenInfo
{
    [JsonPropertyName("aud")]
    public string Aud { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("email_verified")]
    public string EmailVerified { get; set; } = string.Empty;

    [JsonPropertyName("given_name")]
    public string? GivenName { get; set; }

    [JsonPropertyName("family_name")]
    public string? FamilyName { get; set; }

    [JsonPropertyName("picture")]
    public string? Picture { get; set; }
}
