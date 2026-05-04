using ATS.Core.DTOs.Job;
using ATS.Core.Enums;
using ATS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ATS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobController : BaseController
{
    private readonly IJobService _jobService;

    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    /// <summary>Get all active jobs — visible to everyone</summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<JobResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllJobs()
    {
        var jobs = await _jobService.GetAllActiveJobsAsync();
        return Ok(jobs);
    }

    /// <summary>Get a single job by ID — visible to everyone</summary>
    [HttpGet("{jobId:guid}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(JobResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetJobById(Guid jobId)
    {
        var job = await _jobService.GetJobByIdAsync(jobId);

        if (job is null)
            return NotFound(new { message = "Job not found." });

        return Ok(job);
    }

    /// <summary>Get all jobs posted by the current recruiter</summary>
    [HttpGet("my")]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(typeof(List<JobResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyJobs()
    {
        var jobs = await _jobService.GetRecruiterJobsAsync(CurrentUserId);
        return Ok(jobs);
    }

    /// <summary>Create a new job posting</summary>
    [HttpPost]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(typeof(JobResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var job = await _jobService.CreateJobAsync(dto, CurrentUserId);

        return CreatedAtAction(nameof(GetJobById), new { jobId = job.Id }, job);
    }

    /// <summary>Update an existing job posting</summary>
    [HttpPut("{jobId:guid}")]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(typeof(JobResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateJob(Guid jobId, [FromBody] UpdateJobDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var job = await _jobService.UpdateJobAsync(jobId, dto, CurrentUserId);

        if (job is null)
            return NotFound(new { message = "Job not found or you do not have permission to edit it." });

        return Ok(job);
    }

    /// <summary>Delete a job posting</summary>
    [HttpDelete("{jobId:guid}")]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteJob(Guid jobId)
    {
        var deleted = await _jobService.DeleteJobAsync(jobId, CurrentUserId);

        if (!deleted)
            return NotFound(new { message = "Job not found or you do not have permission to delete it." });

        return NoContent();
    }

    /// <summary>Toggle job active/inactive status</summary>
    [HttpPatch("{jobId:guid}/toggle-status")]
    [Authorize(Roles = UserRole.Recruiter)]
    [ProducesResponseType(typeof(JobResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleStatus(Guid jobId)
    {
        var existing = await _jobService.GetJobByIdAsync(jobId);

        if (existing is null)
            return NotFound(new { message = "Job not found." });

        var updated = await _jobService.UpdateJobAsync(
            jobId,
            new UpdateJobDto { IsActive = !existing.IsActive },
            CurrentUserId);

        if (updated is null)
            return NotFound(new { message = "Job not found or you do not have permission to edit it." });

        return Ok(updated);
    }
}