namespace ATS.Core.Models;

public class AnalysisResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApplicationId { get; set; }
    public Guid ResumeId { get; set; }
    public Guid JobId { get; set; }
    public double MatchScore { get; set; }
    public string MissingKeywordsJson { get; set; } = "[]";
    public string SuggestionsJson { get; set; } = "[]";
    public string StrengthsJson { get; set; } = "[]";
    public string AnalysisSource { get; set; } = "AI"; // "AI" or "Keyword"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Application Application { get; set; } = null!;
}