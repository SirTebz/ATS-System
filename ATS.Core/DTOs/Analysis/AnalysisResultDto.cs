namespace ATS.Core.DTOs.Analysis;

public class AnalysisResultDto
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public double MatchScore { get; set; }
    public List<string> MissingKeywords { get; set; } = new();
    public List<string> Suggestions { get; set; } = new();
    public List<string> Strengths { get; set; } = new();
    public string AnalysisSource { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}