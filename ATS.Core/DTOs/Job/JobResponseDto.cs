namespace ATS.Core.DTOs.Job;

public class JobResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string RecruiterName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ApplicationCount { get; set; }
}