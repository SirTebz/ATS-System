using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ATS.API.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    protected string CurrentUserEmail =>
        User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

    protected string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
}