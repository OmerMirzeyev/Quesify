using backend.Models;

namespace backend.Data;

// Seeds the fixed badge catalog on first run (same idempotent shape as ShopSeeder/CourseSeeder).
// Codes here are the stable keys BadgeAwarder looks up — never rename an existing Code without
// also updating the award-check call sites (AuthController.Heartbeat, MapController.CompleteLevel).
public static class BadgeSeeder
{
    public static void SeedIfEmpty(AppDbContext context)
    {
        if (context.Badges.Any())
            return;

        var badges = new List<Badge>
        {
            new() { Code = "first_lesson", Name = "İlk Dərs", Emoji = "🎯", Description = "İlk səviyyəni tamamladın!" },
            new() { Code = "streak_7", Name = "7 Günlük Seriya", Emoji = "🔥", Description = "7 gün ardıcıl aktiv oldun." },
            new() { Code = "streak_30", Name = "30 Günlük Seriya", Emoji = "🌟", Description = "30 gün ardıcıl aktiv oldun — əsl fanatik!" },
            new() { Code = "xp_100", Name = "100 XP Klubu", Emoji = "⚡", Description = "Ümumilikdə 100 XP topladın." },
            new() { Code = "top10", Name = "Top 10 Liderlik", Emoji = "🏅", Description = "Liderlik cədvəlində ilk 10-a girdin." },
        };

        context.Badges.AddRange(badges);
        context.SaveChanges();
    }
}
