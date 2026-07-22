using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Extensions;

public static class ClaimsPrincipalExtensions
{
    // The JWT stores the email under the short "email"/"sub" claim names (JwtRegisteredClaimNames),
    // not the long ClaimTypes.Email URI, so check all three rather than assume inbound claim mapping.
    public static string? GetEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? principal.FindFirstValue(ClaimTypes.Email)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    }
}
