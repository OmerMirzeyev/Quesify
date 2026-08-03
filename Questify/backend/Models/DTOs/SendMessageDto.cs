namespace backend.Models.DTOs;

public class SendMessageDto
{
    public string ReceiverEmail { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}
