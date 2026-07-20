using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models.DTOs;

public class RegisterModel
{
    [Required]
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    [JsonPropertyName("emoji")]
    public string? Emoji { get; set; }
}
