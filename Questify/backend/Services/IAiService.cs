using backend.Models.DTOs;

namespace backend.Services;

public interface IAiService
{
    /// `history` is the recent conversation (oldest first) as (Role, Content) pairs, where Role
    /// is "user" or "assistant" — the system prompt is added internally, callers never supply it.
    /// `course` is the user's currently enrolled track (e.g. "C#", "Java", "Python"), already
    /// validated by the caller; when set, the assistant is locked to that language exclusively.
    Task<string> AskAsync(IEnumerable<(string Role, string Content)> history, string? course = null, CancellationToken cancellationToken = default);

    /// Generates one unique, randomized multiple-choice question for the given language/topic/
    /// difficulty. Returns null (never throws for AI-side failures) if both the primary and
    /// fallback models fail or return unparsable JSON — the caller decides how to surface that.
    Task<GeneratedQuestionDto?> GenerateQuestionAsync(string language, string topic, string difficulty, CancellationToken cancellationToken = default);
}
