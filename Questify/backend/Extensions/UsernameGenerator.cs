using System.Security.Cryptography;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Extensions;

// Turns a display name (typed at registration, or handed back by Google's tokeninfo endpoint)
// into a lowercase, space-free handle — e.g. "Omer Mirzeyev" -> "omermirzeyev", or
// "omermirzeyev99" if that base is already taken. Used by both the register and Google
// Sign-In flows in AuthController, and by Program.cs's startup backfill for pre-existing rows.
public static class UsernameGenerator
{
    // Azerbaijani/Turkish letters that don't map onto plain ASCII a-z — transliterated instead of
    // silently dropped, so "Şəhla Çələbi" still produces a readable "sehlacelebi" rather than losing
    // half the letters.
    private static readonly Dictionary<char, string> Transliteration = new()
    {
        ['ə'] = "e", ['ö'] = "o", ['ü'] = "u", ['ş'] = "s", ['ç'] = "c", ['ğ'] = "g", ['ı'] = "i",
    };

    public static string Sanitize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return "player";
        }

        var sb = new StringBuilder();
        foreach (var ch in input.Trim().ToLowerInvariant())
        {
            if (Transliteration.TryGetValue(ch, out var replacement))
            {
                sb.Append(replacement);
            }
            else if (ch is >= 'a' and <= 'z' or >= '0' and <= '9')
            {
                sb.Append(ch);
            }
            // Everything else (spaces, punctuation, remaining diacritics) is dropped — a handle
            // has no separators.
        }

        return sb.Length == 0 ? "player" : sb.ToString();
    }

    // Appends a random 2-digit suffix on collision (e.g. "omermirzeyev99"), matching the pattern
    // requested for Google onboarding — retries a few times before falling back to a guaranteed-
    // unique Guid fragment (astronomically unlikely to be reached in practice).
    public static async Task<string> GenerateUniqueAsync(AppDbContext context, string? displayName)
    {
        var candidate = Sanitize(displayName);
        if (!await context.Users.AnyAsync(u => u.Username == candidate))
        {
            return candidate;
        }

        for (var attempt = 0; attempt < 20; attempt++)
        {
            var suffixed = candidate + RandomNumberGenerator.GetInt32(10, 100);
            if (!await context.Users.AnyAsync(u => u.Username == suffixed))
            {
                return suffixed;
            }
        }

        return candidate + Guid.NewGuid().ToString("N")[..6];
    }
}
