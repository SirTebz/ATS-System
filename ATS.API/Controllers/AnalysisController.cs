using ATS.Core.DTOs.Analysis;
using ATS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ATS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalysisController : BaseController
{
    private readonly IAnalysisService _analysisService;

    public AnalysisController(IAnalysisService analysisService)
    {
        _analysisService = analysisService;
    }

    /// <summary>Get analysis result for an application</summary>
    [HttpGet("{applicationId:guid}")]
    [ProducesResponseType(typeof(AnalysisResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResult(Guid applicationId)
    {
        var result = await _analysisService.GetResultAsync(applicationId);

        if (result is null)
            return NotFound(new { message = "No analysis found for this application." });

        return Ok(result);
    }

    /// <summary>Manually trigger re-analysis for an application</summary>
    [HttpPost("{applicationId:guid}/analyze")]
    [ProducesResponseType(typeof(AnalysisResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Analyze(Guid applicationId)
    {
        try
        {
            var result = await _analysisService.AnalyzeAsync(applicationId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}