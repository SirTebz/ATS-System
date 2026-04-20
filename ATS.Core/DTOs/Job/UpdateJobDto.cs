namespace ATS.Core.DTOs.Job;

public class UpdateJobDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Company { get; set; }
    public string? Location { get; set; }
    public bool? IsActive { get; set; }
}