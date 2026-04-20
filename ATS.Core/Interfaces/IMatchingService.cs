namespace ATS.Core.Interfaces;

public interface IMatchingService
{
    double CalculateKeywordScore(string resumeText, string jobDescription);
    List<string> ExtractMissingKeywords(string resumeText, string jobDescription);
}