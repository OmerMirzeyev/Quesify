namespace backend.Services;

// BCrypt: salted + a real work factor, replacing the previous unsalted SHA-256 hashing.
public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Hash isn't a valid BCrypt hash (e.g. a leftover legacy SHA-256 value) — treat as no match.
            return false;
        }
    }
}
