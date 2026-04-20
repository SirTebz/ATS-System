using System.ComponentModel.DataAnnotations;

namespace ATS.Core.DTOs.Application;

public class CreateApplicationDto
{
    [Required] public Guid ResumeId { get; set; }
    [Required] public Guid JobId { get; set; }
}