namespace backend.Models.DTOs;

public class GenerateQuestionRequestDto
{
    public string Language { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;

    // The admin's current UI language (e.g. "Azerbaijani" | "English" | "Turkish") — the generated
    // title/description/question/options/hint are written in this language, not tied to the "Language"
    // field above (which is the programming language the question is ABOUT, e.g. "Java").
    public string? ContentLanguage { get; set; }

    // Optional — set once the admin form's cascading Language/Chapter/Level selection has resolved
    // to real DB ids (see AdminController.ResolveLevel). When present, the response echoes them
    // back (plus LevelTitle) so the form can bind the AI result directly to that exact map node
    // without a second round trip. This endpoint itself only generates a preview — it never
    // persists — final binding happens when the admin submits via POST /api/admin/questions.
    public int? ChapterId { get; set; }
    public int? LevelId { get; set; }
}
