namespace ATS.Core.DTOs.Resume;

public class ResumeResponseDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool HasParsedText { get; set; }
}