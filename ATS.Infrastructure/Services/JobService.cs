using ATS.Core.DTOs.Job;
using ATS.Core.Interfaces;
using ATS.Core.Models;
using ATS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ATS.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly AppDbContext _context;

    public JobService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<JobResponseDto> CreateJobAsync(CreateJobDto dto, string recruiterId)
    {
        var job = new Job
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Company = dto.Company.Trim(),
            Location = dto.Location.Trim(),
            RecruiterId = recruiterId
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        return await MapToDtoAsync(job.Id);
    }

    public async Task<JobResponseDto?> UpdateJobAsync(Guid jobId, UpdateJobDto dto, string recruiterId)
    {
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.RecruiterId == recruiterId);

        if (job is null)
            return null;

        if (!string.IsNullOrWhiteSpace(dto.Title))
            job.Title = dto.Title.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Description))
            job.Description = dto.Description.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Company))
            job.Company = dto.Company.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Location))
            job.Location = dto.Location.Trim();

        if (dto.IsActive.HasValue)
            job.IsActive = dto.IsActive.Value;

        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await MapToDtoAsync(job.Id);
    }

    public async Task<bool> DeleteJobAsync(Guid jobId, string recruiterId)
    {
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.RecruiterId == recruiterId);

        if (job is null)
            return false;

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<JobResponseDto>> GetAllActiveJobsAsync()
    {
        return await _context.Jobs
            .Where(j => j.IsActive)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new JobResponseDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Company = j.Company,
                Location = j.Location,
                IsActive = j.IsActive,
                RecruiterName = $"{j.Recruiter.FirstName} {j.Recruiter.LastName}",
                CreatedAt = j.CreatedAt,
                ApplicationCount = j.Applications.Count
            })
            .ToListAsync();
    }

    public async Task<List<JobResponseDto>> GetRecruiterJobsAsync(string recruiterId)
    {
        return await _context.Jobs
            .Where(j => j.RecruiterId == recruiterId)
            .OrderByDescending(j => j.CreatedAt)
            .Select(j => new JobResponseDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Company = j.Company,
                Location = j.Location,
                IsActive = j.IsActive,
                RecruiterName = $"{j.Recruiter.FirstName} {j.Recruiter.LastName}",
                CreatedAt = j.CreatedAt,
                ApplicationCount = j.Applications.Count
            })
            .ToListAsync();
    }

    public async Task<JobResponseDto?> GetJobByIdAsync(Guid jobId)
    {
        var job = await _context.Jobs
            .Include(j => j.Recruiter)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job is null)
            return null;

        return new JobResponseDto
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            Company = job.Company,
            Location = job.Location,
            IsActive = job.IsActive,
            RecruiterName = $"{job.Recruiter.FirstName} {job.Recruiter.LastName}",
            CreatedAt = job.CreatedAt,
            ApplicationCount = job.Applications.Count
        };
    }

    // ── Private Helpers ────────────────────────────────────────────────────
    private async Task<JobResponseDto> MapToDtoAsync(Guid jobId)
    {
        return await _context.Jobs
            .Where(j => j.Id == jobId)
            .Select(j => new JobResponseDto
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Company = j.Company,
                Location = j.Location,
                IsActive = j.IsActive,
                RecruiterName = $"{j.Recruiter.FirstName} {j.Recruiter.LastName}",
                CreatedAt = j.CreatedAt,
                ApplicationCount = j.Applications.Count
            })
            .FirstAsync();
    }
}