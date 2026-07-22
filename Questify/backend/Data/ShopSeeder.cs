using backend.Models;

namespace backend.Data;

// Seeds a starter catalog on first run (only when ShopItems is empty — admins can freely add,
// edit, or delete from there afterward via the existing shop endpoints; this never overwrites
// their changes on subsequent restarts).
public static class ShopSeeder
{
    public static void SeedIfEmpty(AppDbContext context)
    {
        if (context.ShopItems.Any())
            return;

        var items = new List<ShopItem>
        {
            // ── Jokers / power-ups (consumable) ──
            new()
            {
                Name = "Streak Freeze", Emoji = "🧊", Price = 80, Type = "Joker", ItemType = "streak_freeze",
                Rarity = "Rare", Game = "Questify", GameColor = "#38bdf8",
                GameBg = "linear-gradient(135deg,#38bdf822 0%,#0369a122 100%)", GameBorder = "rgba(56,189,248,0.4)",
                Desc = "Sıfırlanma Qoruyucu — bir gün buraxsanız belə streak-inizi qoruyur."
            },
            new()
            {
                Name = "50/50 Joker", Emoji = "🃏", Price = 75, Type = "Joker", ItemType = "joker_5050",
                Rarity = "Rare", Game = "Quiz", GameColor = "#f59e0b",
                GameBg = "linear-gradient(135deg,#f59e0b22 0%,#78350f22 100%)", GameBorder = "rgba(245,158,11,0.4)",
                Desc = "Suallarda 2 yanlış variantı silir."
            },
            new()
            {
                Name = "Double XP Potion", Emoji = "⚡", Price = 120, Type = "İksir", ItemType = "double_xp",
                Rarity = "Epic", Game = "Questify", GameColor = "#a855f7",
                GameBg = "linear-gradient(135deg,#a855f722 0%,#6d28d922 100%)", GameBorder = "rgba(168,85,247,0.45)",
                Desc = "2x XP İksiri — növbəti tamamladığınız səviyyədə XP-ni ikiqat edir."
            },
            new()
            {
                Name = "Heart Refill", Emoji = "💖", Price = 50, Type = "İksir", ItemType = "potion_heart",
                Rarity = "Common", Game = "RPG", GameColor = "#ef4444",
                GameBg = "linear-gradient(135deg,#ef444422 0%,#7f1d1d22 100%)", GameBorder = "rgba(239,68,68,0.35)",
                Desc = "Can Bərpası — 1 can hüququ geri qazandırır. Həftəlik: 1 dəfə."
            },

            // ── Avatars (single-owned) ──
            new()
            {
                Name = "Kod Ninzyası", Emoji = "🥷", Price = 150, Type = "Avatar", ItemType = "avatar",
                Rarity = "Rare", Game = "Questify", GameColor = "#94a3b8",
                GameBg = "linear-gradient(135deg,#94a3b822 0%,#47556922 100%)", GameBorder = "rgba(148,163,184,0.4)",
                Desc = "Gölgədə irəliləyən kod ustası."
            },
            new()
            {
                Name = "Kosmik Astronavt", Emoji = "🧑‍🚀", Price = 220, Type = "Avatar", ItemType = "avatar",
                Rarity = "Epic", Game = "Questify", GameColor = "#3b82f6",
                GameBg = "linear-gradient(135deg,#3b82f622 0%,#1d4ed822 100%)", GameBorder = "rgba(59,130,246,0.45)",
                Desc = "Kodun sərhədlərini kəşf edən astronavt."
            },
            new()
            {
                Name = "Sehrbaz Proqramçı", Emoji = "🧙", Price = 200, Type = "Avatar", ItemType = "avatar",
                Rarity = "Epic", Game = "Questify", GameColor = "#06b6d4",
                GameBg = "linear-gradient(135deg,#06b6d422 0%,#0e749222 100%)", GameBorder = "rgba(6,182,212,0.45)",
                Desc = "Sintaksis sehrlərinə hakim olan usta."
            },
            new()
            {
                Name = "Feniks Döyüşçüsü", Emoji = "🔥", Price = 300, Type = "Avatar", ItemType = "avatar",
                Rarity = "Legendary", Game = "Questify", GameColor = "#f97316",
                GameBg = "linear-gradient(135deg,#f9731622 0%,#ea580c22 100%)", GameBorder = "rgba(249,115,22,0.5)",
                Desc = "Küllərdən doğulan əfsanəvi döyüşçü."
            },
            new()
            {
                Name = "Kibernetik Cəngavər", Emoji = "🤖", Price = 260, Type = "Avatar", ItemType = "avatar",
                Rarity = "Epic", Game = "Questify", GameColor = "#22c55e",
                GameBg = "linear-gradient(135deg,#22c55e22 0%,#15803d22 100%)", GameBorder = "rgba(34,197,94,0.45)",
                Desc = "Gələcəyin kod-döyüşçüsü."
            },

            // ── Profile frames (single-owned, equippable) ──
            new()
            {
                Name = "Qızıl Çərçivə", Emoji = "🖼️", Price = 180, Type = "Çərçivə", ItemType = "frame",
                Rarity = "Epic", Game = "Questify", GameColor = "#eab308",
                GameBg = "linear-gradient(135deg,#eab30822 0%,#a1620722 100%)", GameBorder = "rgba(234,179,8,0.5)",
                Desc = "Profilinizi qızıl haşiyə ilə fərqləndirin."
            },
            new()
            {
                Name = "Neon Çərçivə", Emoji = "🖼️", Price = 190, Type = "Çərçivə", ItemType = "frame",
                Rarity = "Epic", Game = "Questify", GameColor = "#22d3ee",
                GameBg = "linear-gradient(135deg,#22d3ee22 0%,#0e749222 100%)", GameBorder = "rgba(34,211,238,0.5)",
                Desc = "İşıq saçan neon haşiyə."
            },
            new()
            {
                Name = "Almaz Çərçivə", Emoji = "🖼️", Price = 320, Type = "Çərçivə", ItemType = "frame",
                Rarity = "Legendary", Game = "Questify", GameColor = "#a855f7",
                GameBg = "linear-gradient(135deg,#a855f722 0%,#6d28d922 100%)", GameBorder = "rgba(168,85,247,0.5)",
                Desc = "Ən nadir profil haşiyəsi."
            },

            // ── Custom neon themes (single-owned, equippable) ──
            new()
            {
                Name = "Neon Cyan Tema", Emoji = "🎨", Price = 150, Type = "Tema", ItemType = "theme",
                Rarity = "Rare", Game = "Questify", GameColor = "#22d3ee",
                GameBg = "linear-gradient(135deg,#22d3ee22 0%,#0891b222 100%)", GameBorder = "rgba(34,211,238,0.45)",
                Desc = "Tətbiqin vurğu rənglərini cyan neona dəyişir."
            },
            new()
            {
                Name = "Neon Pink Tema", Emoji = "🎨", Price = 150, Type = "Tema", ItemType = "theme",
                Rarity = "Rare", Game = "Questify", GameColor = "#ec4899",
                GameBg = "linear-gradient(135deg,#ec489922 0%,#be185d22 100%)", GameBorder = "rgba(236,72,153,0.45)",
                Desc = "Tətbiqin vurğu rənglərini pink neona dəyişir."
            },
            new()
            {
                Name = "Neon Yaşıl Tema", Emoji = "🎨", Price = 150, Type = "Tema", ItemType = "theme",
                Rarity = "Rare", Game = "Questify", GameColor = "#22c55e",
                GameBg = "linear-gradient(135deg,#22c55e22 0%,#15803d22 100%)", GameBorder = "rgba(34,197,94,0.45)",
                Desc = "Tətbiqin vurğu rənglərini yaşıl neona dəyişir."
            },
        };

        context.ShopItems.AddRange(items);
        context.SaveChanges();
    }
}
