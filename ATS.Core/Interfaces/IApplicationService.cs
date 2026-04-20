using ATS.Core.DTOs.Application;

namespace ATS.Core.Interfaces;

public interface IApplicationService
{
    Task<ApplicationResponseDto> ApplyToJobAsync(CreateApplicationDto dto, string candidateId);
    Task<List<ApplicationResponseDto>> GetCandidateApplicationsAsync(string candidateId);
    Task<List<ApplicationResponseDto>> GetJobApplicationsAsync(Guid jobId, string recruiterId);
    Task<bool> UpdateApplicationStatusAsync(Guid applicationId, string status, string recruiterId);
}