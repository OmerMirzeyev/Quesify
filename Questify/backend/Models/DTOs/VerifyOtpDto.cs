using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class VerifyOtpDto
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string ChallengeId { get; set; } = string.Empty;

    [Required]
    public string Code { get; set; } = string.Empty;
}
