namespace backend.Extensions;

public static class UserEconomyExtensions
{
    // Admins always have unlimited coins in the shop (in addition to the explicit
    // HasUnlimitedCoins flag admins can grant to any other user) — single source of truth so
    // the purchase check, the balance shown to the client, and the coin deduction can never
    // drift from each other across controllers.
    public static bool HasEffectiveUnlimitedCoins(this Models.User user)
    {
        return user.HasUnlimitedCoins || string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase);
    }
}
