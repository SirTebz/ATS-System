using ATS.Core.Enums;

namespace ATS.Core.Models;

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ResumeId { get; set; }
    public Guid JobId { get; set; }
    public string CandidateId { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public Resume Resume { get; set; } = null!;
    public Job Job { get; set; } = null!;
    public User Candidate { get; set; } = null!;
    public AnalysisResult? AnalysisResult { get; set; }
}