using System.ComponentModel.DataAnnotations;

namespace ATS.Core.DTOs.Resume;

public class ResumeUploadDto
{
    [Required]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public Stream FileStream { get; set; } = Stream.Null;

    [Required]
    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }
}