using ATS.Core.Models;

namespace ATS.Core.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user, IList<string> roles);
}