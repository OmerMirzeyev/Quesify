namespace backend.Services;

public interface IAiService
{
    /// `history` is the recent conversation (oldest first) as (Role, Content) pairs, where Role
    /// is "user" or "assistant" — the system prompt is added internally, callers never supply it.
    /// `course` is the user's currently enrolled track (e.g. "C#", "Java", "Python"), already
    /// validated by the caller; when set, the assistant is locked to that language exclusively.
    Task<string> AskAsync(IEnumerable<(string Role, string Content)> history, string? course = null);
}
