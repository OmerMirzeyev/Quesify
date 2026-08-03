namespace backend.Data;

// Shared between MapController (which awards it) and LeaderboardController (which derives
// per-course XP straight from completed-level counts, since there's no separate per-course XP
// column on User) so the two never drift apart.
public static class GamificationConstants
{
    public const int LevelCompletionXp = 20;

    // Flat per-level Coins award (mirrors LevelCompletionXp's rationale) — the frontend's
    // per-quest goldReward values are untrusted client display data only, so real spendable
    // currency uses this fixed, server-controlled amount instead of trusting a client-reported figure.
    public const int LevelCompletionCoins = 15;
}
