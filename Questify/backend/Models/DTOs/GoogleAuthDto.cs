using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models.DTOs;

public class GoogleAuthDto
{
    // The ID token ("credential") handed back by Google Identity Services on the frontend —
    // verified server-side against Google's tokeninfo endpoint before it's ever trusted.
    [Required]
    [JsonPropertyName("credential")]
    public string Credential { get; set; } = string.Empty;
}
