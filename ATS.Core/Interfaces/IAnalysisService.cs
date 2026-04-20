using ATS.Core.DTOs.Analysis;

namespace ATS.Core.Interfaces;

public interface IAnalysisService
{
    Task<AnalysisResultDto> AnalyzeAsync(Guid applicationId);
    Task<AnalysisResultDto?> GetResultAsync(Guid applicationId);
}