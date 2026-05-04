using ATS.Core.DTOs.Application;
using ATS.Core.Enums;
using ATS.Core.Interfaces;
using ATS.Core.Models;
using ATS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ATS.Infrastructure.Services;

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _context;
    private readonly IAnalysisService _analysisService;

    public ApplicationService(
        AppDbContext context,
        IAnalysisService analysisService)
    {
        _context = context;
        _analysisService = analysisService;
    }

    public async Task<ApplicationResponseDto> ApplyToJobAsync(
        CreateApplicationDto dto,
        string candidateId)
    {
        // Validate resume belongs to this candidate
        var resume = await _context.Resumes
            .FirstOrDefaultAsync(r => r.Id == dto.ResumeId && r.UserId == candidateId)
            ?? throw new KeyNotFoundException("Resume not found or does not belong to you.");

        // Validate job exists and is active
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == dto.JobId && j.IsActive)
            ?? throw new KeyNotFoundException("Job not found or is no longer active.");

        // Prevent duplicate applications
        var alreadyApplied = await _context.Applications
            .AnyAsync(a => a.ResumeId == dto.ResumeId && a.JobId == dto.JobId);

        if (alreadyApplied)
            throw new InvalidOperationException("You have already applied to this job.");

        // Create application
        var application = new Application
        {
            ResumeId = dto.ResumeId,
            JobId = dto.JobId,
            CandidateId = candidateId,
            Status = ApplicationStatus.Pending
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        // Trigger analysis automatically
        try
        {
            await _analysisService.AnalyzeAsync(application.Id);
        }
        catch (Exception ex)
        {
            // Don't fail the application if analysis fails
            Console.WriteLine($"[ApplicationService] Analysis failed: {ex.Message}");
        }

        return await BuildResponseDtoAsync(application.Id);
    }

    public async Task<List<ApplicationResponseDto>> GetCandidateApplicationsAsync(
        string candidateId)
    {
        var applications = await _context.Applications
            .Where(a => a.CandidateId == candidateId)
            .OrderByDescending(a => a.AppliedAt)
            .Include(a => a.Job)
            .Include(a => a.AnalysisResult)
            .ToListAsync();

        return applications.Select(a => new ApplicationResponseDto
        {
            Id = a.Id,
            ResumeId = a.ResumeId,
            JobId = a.JobId,
            JobTitle = a.Job.Title,
            Company = a.Job.Company,
            CandidateName = string.Empty,
            CandidateEmail = string.Empty,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
            MatchScore = a.AnalysisResult?.MatchScore
        }).ToList();
    }

    public async Task<List<ApplicationResponseDto>> GetJobApplicationsAsync(
        Guid jobId,
        string recruiterId)
    {
        // Verify recruiter owns this job
        var jobExists = await _context.Jobs
            .AnyAsync(j => j.Id == jobId && j.RecruiterId == recruiterId);

        if (!jobExists)
            throw new UnauthorizedAccessException(
                "Job not found or you do not have permission to view its applications.");

        var applications = await _context.Applications
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.AnalysisResult != null
                ? a.AnalysisResult.MatchScore : 0)
            .Include(a => a.Candidate)
            .Include(a => a.AnalysisResult)
            .Include(a => a.Job)
            .ToListAsync();

        return applications.Select(a => new ApplicationResponseDto
        {
            Id = a.Id,
            ResumeId = a.ResumeId,
            JobId = a.JobId,
            JobTitle = a.Job.Title,
            Company = a.Job.Company,
            CandidateName = $"{a.Candidate.FirstName} {a.Candidate.LastName}",
            CandidateEmail = a.Candidate.Email ?? string.Empty,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
            MatchScore = a.AnalysisResult?.MatchScore
        }).ToList();
    }

    public async Task<bool> UpdateApplicationStatusAsync(
        Guid applicationId,
        string status,
        string recruiterId)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId
                && a.Job.RecruiterId == recruiterId);

        if (application is null)
            return false;

        if (!Enum.TryParse<ApplicationStatus>(status, ignoreCase: true, out var parsed))
            throw new ArgumentException(
                $"Invalid status. Valid values: {string.Join(", ", Enum.GetNames<ApplicationStatus>())}");

        application.Status = parsed;
        await _context.SaveChangesAsync();

        return true;
    }

    // ── Private Helpers ────────────────────────────────────────────────────
    private async Task<ApplicationResponseDto> BuildResponseDtoAsync(Guid applicationId)
    {
        var a = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .Include(a => a.AnalysisResult)
            .FirstAsync(a => a.Id == applicationId);

        return new ApplicationResponseDto
        {
            Id = a.Id,
            ResumeId = a.ResumeId,
            JobId = a.JobId,
            JobTitle = a.Job.Title,
            Company = a.Job.Company,
            CandidateName = $"{a.Candidate.FirstName} {a.Candidate.LastName}",
            CandidateEmail = a.Candidate.Email ?? string.Empty,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
            MatchScore = a.AnalysisResult?.MatchScore
        };
    }
}