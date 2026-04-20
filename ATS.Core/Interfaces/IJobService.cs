using ATS.Core.DTOs.Job;

namespace ATS.Core.Interfaces;

public interface IJobService
{
    Task<JobResponseDto> CreateJobAsync(CreateJobDto dto, string recruiterId);
    Task<JobResponseDto?> UpdateJobAsync(Guid jobId, UpdateJobDto dto, string recruiterId);
    Task<bool> DeleteJobAsync(Guid jobId, string recruiterId);
    Task<List<JobResponseDto>> GetAllActiveJobsAsync();
    Task<List<JobResponseDto>> GetRecruiterJobsAsync(string recruiterId);
    Task<JobResponseDto?> GetJobByIdAsync(Guid jobId);
}