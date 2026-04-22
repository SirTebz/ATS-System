using ATS.Core.DTOs.Resume;
using ATS.Core.Interfaces;
using ATS.Core.Models;
using ATS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ATS.Infrastructure.Services;

public class ResumeService : IResumeService
{
    private readonly AppDbContext _context;
    private readonly PdfParserService _pdfParser;
    private readonly IConfiguration _configuration;

    public ResumeService(
        AppDbContext context,
        PdfParserService pdfParser,
        IConfiguration configuration)
    {
        _context = context;
        _pdfParser = pdfParser;
        _configuration = configuration;
    }

    public async Task<ResumeResponseDto> UploadResumeAsync(ResumeUploadDto uploadDto, string userId)
    {
        // Validate content type
        if (!string.Equals(uploadDto.ContentType, "application/pdf",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Only PDF files are allowed.");
        }

        // Validate file size (5MB max)
        const long maxFileSize = 5 * 1024 * 1024;
        if (uploadDto.FileSize > maxFileSize)
            throw new ArgumentException("File size must not exceed 5MB.");

        // Build storage path
        var storageRoot = _configuration["FileStorage:ResumePath"]
            ?? "wwwroot/resumes";

        var absolutePath = Path.Combine(Directory.GetCurrentDirectory(), storageRoot);
        if (!Directory.Exists(absolutePath))
            Directory.CreateDirectory(absolutePath);

        // Generate unique file name to prevent collisions
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(uploadDto.FileName)}";
        var filePath = Path.Combine(absolutePath, uniqueFileName);

        // Save file to disk
        await using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            uploadDto.FileStream.Position = 0;
            await uploadDto.FileStream.CopyToAsync(fileStream);
        }

        // Extract text from PDF
        string parsedText;
        try
        {
            uploadDto.FileStream.Position = 0;
            parsedText = _pdfParser.ExtractText(uploadDto.FileStream);
        }
        catch (Exception ex)
        {
            // Don't fail the upload if parsing fails — store empty text
            parsedText = string.Empty;
            Console.WriteLine($"[ResumeService] PDF parsing failed: {ex.Message}");
        }

        // Persist to database
        var resume = new Resume
        {
            UserId = userId,
            FileName = uploadDto.FileName,
            FileUrl = $"/{storageRoot}/{uniqueFileName}".Replace("\\", "/"),
            ParsedText = parsedText
        };

        _context.Resumes.Add(resume);
        await _context.SaveChangesAsync();

        return MapToDto(resume);
    }

    public async Task<List<ResumeResponseDto>> GetUserResumesAsync(string userId)
    {
        return await _context.Resumes
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ResumeResponseDto
            {
                Id = r.Id,
                FileName = r.FileName,
                FileUrl = r.FileUrl,
                CreatedAt = r.CreatedAt,
                HasParsedText = !string.IsNullOrEmpty(r.ParsedText)
            })
            .ToListAsync();
    }

    public async Task<bool> DeleteResumeAsync(Guid resumeId, string userId)
    {
        var resume = await _context.Resumes
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userId);

        if (resume is null)
            return false;

        // Delete physical file
        var absoluteFilePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            resume.FileUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (File.Exists(absoluteFilePath))
            File.Delete(absoluteFilePath);

        _context.Resumes.Remove(resume);
        await _context.SaveChangesAsync();

        return true;
    }

    // ── Private Helpers ────────────────────────────────────────────────────
    private static ResumeResponseDto MapToDto(Resume resume) => new()
    {
        Id = resume.Id,
        FileName = resume.FileName,
        FileUrl = resume.FileUrl,
        CreatedAt = resume.CreatedAt,
        HasParsedText = !string.IsNullOrEmpty(resume.ParsedText)
    };
}