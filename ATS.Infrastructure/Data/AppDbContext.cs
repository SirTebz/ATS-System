using ATS.Core.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ATS.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<AnalysisResult> AnalysisResults => Set<AnalysisResult>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(e =>
        {
            e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            e.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            e.Property(u => u.Role).HasMaxLength(50).IsRequired();
        });

        builder.Entity<Resume>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.FileName).HasMaxLength(255).IsRequired();
            e.Property(r => r.FileUrl).HasMaxLength(500).IsRequired();
            e.Property(r => r.ParsedText).HasColumnType("nvarchar(max)");
            e.HasOne(r => r.User)
             .WithMany(u => u.Resumes)
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Job>(e =>
        {
            e.HasKey(j => j.Id);
            e.Property(j => j.Title).HasMaxLength(200).IsRequired();
            e.Property(j => j.Description).HasColumnType("nvarchar(max)").IsRequired();
            e.Property(j => j.Company).HasMaxLength(200).IsRequired();
            e.Property(j => j.Location).HasMaxLength(200);
            e.HasOne(j => j.Recruiter)
             .WithMany(u => u.Jobs)
             .HasForeignKey(j => j.RecruiterId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Application>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasOne(a => a.Resume)
             .WithMany(r => r.Applications)
             .HasForeignKey(a => a.ResumeId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Job)
             .WithMany(j => j.Applications)
             .HasForeignKey(a => a.JobId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(a => a.Candidate)
             .WithMany()
             .HasForeignKey(a => a.CandidateId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(a => new { a.ResumeId, a.JobId }).IsUnique();
        });

        builder.Entity<AnalysisResult>(e =>
        {
            e.HasKey(ar => ar.Id);
            e.Property(ar => ar.MissingKeywordsJson).HasColumnType("nvarchar(max)");
            e.Property(ar => ar.SuggestionsJson).HasColumnType("nvarchar(max)");
            e.Property(ar => ar.StrengthsJson).HasColumnType("nvarchar(max)");
            e.HasOne(ar => ar.Application)
             .WithOne(a => a.AnalysisResult)
             .HasForeignKey<AnalysisResult>(ar => ar.ApplicationId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}