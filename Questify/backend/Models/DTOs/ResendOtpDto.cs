using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class ResendOtpDto
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string ChallengeId { get; set; } = string.Empty;
}
