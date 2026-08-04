using backend.Models.DTOs;

namespace backend.Services;

public interface IAiService
{
    /// `history` is the recent conversation (oldest first) as (Role, Content) pairs, where Role
    /// is "user" or "assistant" — the system prompt is added internally, callers never supply it.
    /// `course` is the user's currently enrolled track (e.g. "C#", "Java", "Python"), already
    /// validated by the caller; when set, the assistant is locked to that language exclusively.
    /// `DebugError` is null on success; on failure it carries the exact raw provider error(s) —
    /// intended to be surfaced to the frontend/console for diagnosing transient AI failures.
    Task<(string Reply, string? DebugError)> AskAsync(IEnumerable<(string Role, string Content)> history, string? course = null, CancellationToken cancellationToken = default);

    /// Generates one unique, randomized multiple-choice question for the given language/topic/
    /// difficulty. `Question` is null (never throws for AI-side failures) if both the primary and
    /// fallback models fail or return unparsable JSON — `DebugError` then carries the raw reason.
    Task<(GeneratedQuestionDto? Question, string? DebugError)> GenerateQuestionAsync(string language, string topic, string difficulty, string? contentLanguage = null, CancellationToken cancellationToken = default);
}
