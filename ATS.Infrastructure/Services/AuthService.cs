using ATS.Core.DTOs.Auth;
using ATS.Core.Enums;
using ATS.Core.Interfaces;
using ATS.Core.Models;
using Microsoft.AspNetCore.Identity;

namespace ATS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ITokenService _tokenService;

    public AuthService(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Validate role
        var allowedRoles = new[] { UserRole.Candidate, UserRole.Recruiter };
        if (!allowedRoles.Contains(dto.Role))
            throw new ArgumentException($"Invalid role. Allowed roles: {string.Join(", ", allowedRoles)}");

        // Check duplicate email
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            UserName = dto.Email.Trim().ToLower(),
            Role = dto.Role
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        // Ensure role exists in DB then assign
        await EnsureRoleExistsAsync(dto.Role);
        await _userManager.AddToRoleAsync(user, dto.Role);

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles);

        return BuildAuthResponse(user, roles, token);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email.Trim().ToLower())
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles);

        return BuildAuthResponse(user, roles, token);
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    private async Task EnsureRoleExistsAsync(string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new IdentityRole(role));
    }

    private AuthResponseDto BuildAuthResponse(User user, IList<string> roles, string token)
    {
        var jwtHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwtToken = jwtHandler.ReadJwtToken(token);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}",
            Role = roles.FirstOrDefault() ?? string.Empty,
            ExpiresAt = jwtToken.ValidTo
        };
    }
}