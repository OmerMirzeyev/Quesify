namespace backend.Models.DTOs;

// Mirrors the literal { "A": "...", "B": "...", "C": "...", "D": "..." } shape used throughout
// the admin question-management flow.
public class QuestionOptionsDto
{
    public string A { get; set; } = string.Empty;
    public string B { get; set; } = string.Empty;
    public string C { get; set; } = string.Empty;
    public string D { get; set; } = string.Empty;
}

public class CreateQuestionDto
{
    public int LevelId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public QuestionOptionsDto Options { get; set; } = new();
    public string CorrectOption { get; set; } = "A";
    public string? Hint { get; set; }

    // Optional — when the caller already knows which chapter/track it resolved LevelId against
    // (the admin form always does, via ResolveLevel), these are cross-checked server-side against
    // the level's actual Chapter so a stale/mismatched client-side selection can never silently
    // write a question onto the wrong node.
    public int? ChapterId { get; set; }
    public string? Language { get; set; }
}

// Response shape for both the manual-create and AI-generate-for-level endpoints — matches the
// exact JSON model requested for the admin question hierarchy feature.
public class QuestionRecordDto
{
    public int Id { get; set; }
    public string Language { get; set; } = string.Empty;
    public int ChapterId { get; set; }
    public int LevelId { get; set; }
    public string LevelTitle { get; set; } = string.Empty;
    public string QuestionText { get; set; } = string.Empty;
    public QuestionOptionsDto Options { get; set; } = new();
    public string CorrectOption { get; set; } = "A";
    public string? Hint { get; set; }
}

// Request for AdminController.GenerateQuestionForLevel — chapterId/levelId come from the route
// (POST /api/admin/levels/{levelId}/generate-question), this only needs the AI prompt inputs.
public class GenerateLevelQuestionDto
{
    public string Language { get; set; } = string.Empty;
    public string? ContentLanguage { get; set; }
}
