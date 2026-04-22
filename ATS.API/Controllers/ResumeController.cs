using ATS.Core.DTOs.Resume;
using ATS.Core.Enums;
using ATS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ATS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResumeController : BaseController
{
    private readonly IResumeService _resumeService;

    public ResumeController(IResumeService resumeService)
    {
        _resumeService = resumeService;
    }

    /// <summary>Upload a PDF resume</summary>
    [HttpPost("upload")]
    [Authorize(Roles = UserRole.Candidate)]
    [ProducesResponseType(typeof(ResumeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only PDF files are accepted." });

        try
        {
            // Map IFormFile → ResumeUploadDto (IFormFile stays in API layer)
            var uploadDto = new ResumeUploadDto
            {
                FileName = file.FileName,
                FileStream = file.OpenReadStream(),
                ContentType = file.ContentType,
                FileSize = file.Length
            };

            var result = await _resumeService.UploadResumeAsync(uploadDto, CurrentUserId);
            return CreatedAtAction(nameof(GetMyResumes), new { }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Get all resumes for the current candidate</summary>
    [HttpGet("my")]
    [Authorize(Roles = UserRole.Candidate)]
    [ProducesResponseType(typeof(List<ResumeResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyResumes()
    {
        var resumes = await _resumeService.GetUserResumesAsync(CurrentUserId);
        return Ok(resumes);
    }

    /// <summary>Delete a resume by ID</summary>
    [HttpDelete("{resumeId:guid}")]
    [Authorize(Roles = UserRole.Candidate)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid resumeId)
    {
        var deleted = await _resumeService.DeleteResumeAsync(resumeId, CurrentUserId);

        if (!deleted)
            return NotFound(new { message = "Resume not found or does not belong to you." });

        return NoContent();
    }
}