using ATS.Core.Enums;
using ATS.Core.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace ATS.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        // ── Seed Roles ─────────────────────────────────────────────────────
        string[] roles = [UserRole.Admin, UserRole.Recruiter, UserRole.Candidate];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // ── Seed Admin ─────────────────────────────────────────────────────
        await SeedUserAsync(
            userManager,
            firstName: "System",
            lastName: "Admin",
            email: "admin@ats.com",
            password: "Admin@1234",
            role: UserRole.Admin);

        // ── Seed Test Recruiter ────────────────────────────────────────────
        await SeedUserAsync(
            userManager,
            firstName: "Jane",
            lastName: "Smith",
            email: "recruiter@ats.com",
            password: "Recruiter@1234",
            role: UserRole.Recruiter);

        // ── Seed Test Candidate ────────────────────────────────────────────
        await SeedUserAsync(
            userManager,
            firstName: "John",
            lastName: "Doe",
            email: "candidate@ats.com",
            password: "Candidate@1234",
            role: UserRole.Candidate);
    }

    // ── Private Helpers ────────────────────────────────────────────────────
    private static async Task SeedUserAsync(
        UserManager<User> userManager,
        string firstName,
        string lastName,
        string email,
        string password,
        string role)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
            return; // Already exists — skip

        var user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            UserName = email,
            Role = role,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, password);

        if (result.Succeeded)
            await userManager.AddToRoleAsync(user, role);
        else
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new Exception($"Failed to seed user {email}: {errors}");
        }
    }
}