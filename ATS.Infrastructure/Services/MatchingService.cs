using System.Text.RegularExpressions;
using ATS.Core.Interfaces;

namespace ATS.Infrastructure.Services;

public class MatchingService : IMatchingService
{
    // Common words to ignore during keyword extraction
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "we", "you", "they",
        "he", "she", "it", "this", "that", "these", "those", "our", "your",
        "their", "its", "as", "if", "so", "not", "no", "nor", "yet", "both",
        "either", "neither", "than", "then", "when", "where", "who", "which",
        "what", "how", "all", "any", "each", "few", "more", "most", "other",
        "some", "such", "into", "through", "during", "including", "without",
        "across", "following", "between", "out", "about", "up", "per", "also"
    };

    public double CalculateKeywordScore(string resumeText, string jobDescription)
    {
        if (string.IsNullOrWhiteSpace(resumeText) ||
            string.IsNullOrWhiteSpace(jobDescription))
            return 0;

        var jobKeywords = ExtractKeywords(jobDescription);
        if (jobKeywords.Count == 0)
            return 0;

        var resumeKeywords = ExtractKeywords(resumeText);

        var matchedCount = jobKeywords
            .Count(jk => resumeKeywords.Any(rk =>
                string.Equals(rk, jk, StringComparison.OrdinalIgnoreCase)));

        return Math.Round((double)matchedCount / jobKeywords.Count * 100, 2);
    }

    public List<string> ExtractMissingKeywords(string resumeText, string jobDescription)
    {
        if (string.IsNullOrWhiteSpace(resumeText) ||
            string.IsNullOrWhiteSpace(jobDescription))
            return new List<string>();

        var jobKeywords = ExtractKeywords(jobDescription);
        var resumeKeywords = ExtractKeywords(resumeText);

        return jobKeywords
            .Where(jk => !resumeKeywords.Any(rk =>
                string.Equals(rk, jk, StringComparison.OrdinalIgnoreCase)))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(k => k)
            .ToList();
    }

    // ── Private Helpers ────────────────────────────────────────────────────
    private static HashSet<string> ExtractKeywords(string text)
    {
        var words = Regex.Split(text.ToLower(), @"[^a-zA-Z0-9#+.\-]+")
            .Where(w => w.Length > 2 && !StopWords.Contains(w))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return words;
    }
}