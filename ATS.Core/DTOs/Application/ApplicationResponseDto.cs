using ATS.Core.Enums;

namespace ATS.Core.DTOs.Application;

public class ApplicationResponseDto
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; }
    public DateTime AppliedAt { get; set; }
    public double? MatchScore { get; set; }
}