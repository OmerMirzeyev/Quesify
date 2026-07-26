namespace backend.Models.DTOs;

public class AiChatRequestDto
{
    public List<AiChatMessageDto> Messages { get; set; } = new();
}
