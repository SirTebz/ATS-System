using ATS.Core.DTOs.Application;
using ATS.Core.Enums;
using ATS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ATS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationController : BaseController
{
    private readonly IApplicationService _applicationService;

    public ApplicationController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    /// <summary>Candidate applies to a job</summary>
    [HttpPost]
    [Authorize(Roles = UserRole.Candidate)]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Apply([FromBody] CreateApplicationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _applicationService.ApplyToJobAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetMyApplications), new { }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Get all applications for the current candidate</summary>
    [HttpGet("my")]
    [Authorize(Roles = UserRole.Candidate)]
    [ProducesResponseType(typeof(List<ApplicationResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyApplications()
    {
        var applications = await _applicationService
            .GetCandidateApplicationsAsync(CurrentUserId);

        return Ok(applications);
    }

    /// <summary>Get all applications for a job — recruiter only</summary>
    [HttpGet("job/{jobId:guid}")]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(typeof(List<ApplicationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetJobApplications(Guid jobId)
    {
        try
        {
            var applications = await _applicationService
                .GetJobApplicationsAsync(jobId, CurrentUserId);

            return Ok(applications);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
    }

    /// <summary>Update application status — recruiter only</summary>
    [HttpPatch("{applicationId:guid}/status")]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(
        Guid applicationId,
        [FromQuery] string status)
    {
        try
        {
            var updated = await _applicationService
                .UpdateApplicationStatusAsync(applicationId, status, CurrentUserId);

            if (!updated)
                return NotFound(new { message = "Application not found." });

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}