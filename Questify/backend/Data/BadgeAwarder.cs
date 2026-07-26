using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Shared award-check used by every controller that can trigger a badge (AuthController's daily
// heartbeat, MapController's level completion). Only stages the UserBadge add — callers already
// call SaveChangesAsync once at the end of their action for the rest of their own changes.
public static class BadgeAwarder
{
    public static async Task AwardAsync(AppDbContext context, User user, string code)
    {
        var badge = await context.Badges.FirstOrDefaultAsync(b => b.Code == code);
        if (badge is null) return;

        var alreadyEarned = await context.UserBadges
            .AnyAsync(ub => ub.UserId == user.Id && ub.BadgeId == badge.Id);
        if (alreadyEarned) return;

        context.UserBadges.Add(new UserBadge { UserId = user.Id, BadgeId = badge.Id });
    }
}
