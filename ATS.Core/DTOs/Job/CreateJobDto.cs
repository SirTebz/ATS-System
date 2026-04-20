using System.ComponentModel.DataAnnotations;

namespace ATS.Core.DTOs.Job;

public class CreateJobDto
{
    [Required, MinLength(3)]
    public string Title { get; set; } = string.Empty;

    [Required, MinLength(20)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Company { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;
}