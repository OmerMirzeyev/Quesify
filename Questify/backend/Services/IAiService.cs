namespace backend.Services;

public interface IAiService
{
    /// `history` is the recent conversation (oldest first) as (Role, Content) pairs, where Role
    /// is "user" or "assistant" — the system prompt is added internally, callers never supply it.
    Task<string> AskAsync(IEnumerable<(string Role, string Content)> history);
}
