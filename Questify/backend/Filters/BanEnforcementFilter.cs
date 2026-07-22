using backend.Data;
using backend.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace backend.Filters;

// Registered globally in Program.cs. Login already rejects banned/timed-out users before
// issuing a token; this filter closes the remaining gap — a token issued before a ban/timeout
// was applied would otherwise keep working against every other [Authorize] endpoint until it
// naturally expired.
public class BanEnforcementFilter : IAsyncActionFilter
{
    private readonly AppDbContext _context;

    public BanEnforcementFilter(AppDbContext context)
    {
        _context = context;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var principal = context.HttpContext.User;
        if (principal.Identity?.IsAuthenticated == true)
        {
            var email = principal.GetEmail();
            if (!string.IsNullOrWhiteSpace(email))
            {
                var user = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user is not null)
                {
                    var (isBlocked, message) = user.CheckModerationStatus();
                    if (isBlocked)
                    {
                        context.Result = new ObjectResult(new { message }) { StatusCode = StatusCodes.Status403Forbidden };
                        return;
                    }
                }
            }
        }

        await next();
    }
}
