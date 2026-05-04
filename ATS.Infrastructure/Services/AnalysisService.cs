using System.Text;
using System.Text.Json;
using ATS.Core.DTOs.Analysis;
using ATS.Core.Interfaces;
using ATS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ATS.Core.Models;
using OpenAI.Chat;

namespace ATS.Infrastructure.Services;

public class AnalysisService : IAnalysisService
{
    private readonly AppDbContext _context;
    private readonly IMatchingService _matchingService;
    private readonly IConfiguration _configuration;

    public AnalysisService(
        AppDbContext context,
        IMatchingService matchingService,
        IConfiguration configuration)
    {
        _context = context;
        _matchingService = matchingService;
        _configuration = configuration;
    }

    public async Task<AnalysisResultDto> AnalyzeAsync(Guid applicationId)
    {
        // Load application with related data
        var application = await _context.Applications
            .Include(a => a.Resume)
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId)
            ?? throw new KeyNotFoundException("Application not found.");

        if (string.IsNullOrWhiteSpace(application.Resume.ParsedText))
            throw new InvalidOperationException(
                "Resume has no parsed text. Please re-upload the resume.");

        // Remove existing analysis if re-analyzing
        var existing = await _context.AnalysisResults
            .FirstOrDefaultAsync(ar => ar.ApplicationId == applicationId);

        if (existing is not null)
            _context.AnalysisResults.Remove(existing);

        // Try AI analysis first — fallback to keyword matching
        AnalysisResult result;
        try
        {
            var aiResponse = await RunAiAnalysisAsync(
                application.Resume.ParsedText,
                application.Job.Description);

            result = BuildResult(applicationId, application, aiResponse, "AI");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AnalysisService] AI failed, using keyword fallback: {ex.Message}");
            result = RunKeywordFallback(applicationId, application);
        }

        _context.AnalysisResults.Add(result);
        await _context.SaveChangesAsync();

        return MapToDto(result);
    }

    public async Task<AnalysisResultDto?> GetResultAsync(Guid applicationId)
    {
        var result = await _context.AnalysisResults
            .FirstOrDefaultAsync(ar => ar.ApplicationId == applicationId);

        return result is null ? null : MapToDto(result);
    }

    // ── AI Analysis ────────────────────────────────────────────────────────
    private async Task<AiAnalysisResponse> RunAiAnalysisAsync(
        string resumeText,
        string jobDescription)
    {
        var apiKey = _configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key not configured.");

        var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

        var client = new ChatClient(model, apiKey);

        var prompt = BuildPrompt(resumeText, jobDescription);

        var response = await client.CompleteChatAsync(
            new UserChatMessage(prompt));

        var rawJson = response.Value.Content[0].Text;

        // Strip markdown code fences if present
        var cleanJson = rawJson
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        var parsed = JsonSerializer.Deserialize<AiAnalysisResponse>(cleanJson)
            ?? throw new InvalidOperationException("Failed to parse AI response.");

        // Clamp score to 0–100
        parsed.Score = Math.Clamp(parsed.Score, 0, 100);

        return parsed;
    }

    private static string BuildPrompt(string resumeText, string jobDescription)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are an expert ATS (Applicant Tracking System) analyzer.");
        sb.AppendLine();
        sb.AppendLine("Compare the following resume against the job description and return a JSON analysis.");
        sb.AppendLine();
        sb.AppendLine("RESUME:");
        sb.AppendLine(resumeText.Length > 3000
            ? resumeText[..3000] + "... [truncated]"
            : resumeText);
        sb.AppendLine();
        sb.AppendLine("JOB DESCRIPTION:");
        sb.AppendLine(jobDescription.Length > 2000
            ? jobDescription[..2000] + "... [truncated]"
            : jobDescription);
        sb.AppendLine();
        sb.AppendLine("Return ONLY valid JSON in exactly this format — no markdown, no explanation:");
        sb.AppendLine("""
        {
          "score": <number 0-100>,
          "missing_keywords": ["keyword1", "keyword2"],
          "strengths": ["strength1", "strength2"],
          "suggestions": ["suggestion1", "suggestion2"]
        }
        """);
        sb.AppendLine();
        sb.AppendLine("Rules:");
        sb.AppendLine("- score: overall match percentage (0–100)");
        sb.AppendLine("- missing_keywords: important skills/tools from the job not found in resume");
        sb.AppendLine("- strengths: areas where the resume strongly matches the job");
        sb.AppendLine("- suggestions: specific actionable improvements the candidate should make");
        sb.AppendLine("- Return between 3 and 10 items per array");

        return sb.ToString();
    }

    // ── Keyword Fallback ───────────────────────────────────────────────────
    private AnalysisResult RunKeywordFallback(
        Guid applicationId,
        Core.Models.Application application)
    {
        var score = _matchingService.CalculateKeywordScore(
            application.Resume.ParsedText,
            application.Job.Description);

        var missing = _matchingService.ExtractMissingKeywords(
            application.Resume.ParsedText,
            application.Job.Description);

        var fakeResponse = new AiAnalysisResponse
        {
            Score = score,
            MissingKeywords = missing.Take(10).ToList(),
            Strengths = new List<string>
            {
                "Keyword analysis completed",
                "Resume text successfully parsed"
            },
            Suggestions = new List<string>
            {
                "Consider adding more keywords from the job description",
                "Tailor your resume specifically to this role",
                "Ensure all required skills are explicitly mentioned"
            }
        };

        return BuildResult(applicationId, application, fakeResponse, "Keyword");
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private static AnalysisResult BuildResult(
        Guid applicationId,
        Core.Models.Application application,
        AiAnalysisResponse response,
        string source)
    {
        return new AnalysisResult
        {
            ApplicationId = applicationId,
            ResumeId = application.ResumeId,
            JobId = application.JobId,
            MatchScore = response.Score,
            MissingKeywordsJson = JsonSerializer.Serialize(response.MissingKeywords),
            SuggestionsJson = JsonSerializer.Serialize(response.Suggestions),
            StrengthsJson = JsonSerializer.Serialize(response.Strengths),
            AnalysisSource = source
        };
    }

    private static AnalysisResultDto MapToDto(AnalysisResult result)
    {
        return new AnalysisResultDto
        {
            Id = result.Id,
            ApplicationId = result.ApplicationId,
            MatchScore = result.MatchScore,
            MissingKeywords = JsonSerializer.Deserialize<List<string>>(
                result.MissingKeywordsJson) ?? new(),
            Suggestions = JsonSerializer.Deserialize<List<string>>(
                result.SuggestionsJson) ?? new(),
            Strengths = JsonSerializer.Deserialize<List<string>>(
                result.StrengthsJson) ?? new(),
            AnalysisSource = result.AnalysisSource,
            CreatedAt = result.CreatedAt
        };
    }
}