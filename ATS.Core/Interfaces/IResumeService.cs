using ATS.Core.DTOs.Resume;

namespace ATS.Core.Interfaces;

public interface IResumeService
{
    Task<ResumeResponseDto> UploadResumeAsync(ResumeUploadDto uploadDto, string userId);
    Task<List<ResumeResponseDto>> GetUserResumesAsync(string userId);
    Task<bool> DeleteResumeAsync(Guid resumeId, string userId);
}