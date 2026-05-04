using System.Text.Json.Serialization;

namespace ATS.Core.DTOs.Analysis;

public class AiAnalysisResponse
{
    [JsonPropertyName("score")]
    public double Score { get; set; }

    [JsonPropertyName("missing_keywords")]
    public List<string> MissingKeywords { get; set; } = new();

    [JsonPropertyName("strengths")]
    public List<string> Strengths { get; set; } = new();

    [JsonPropertyName("suggestions")]
    public List<string> Suggestions { get; set; } = new();
}