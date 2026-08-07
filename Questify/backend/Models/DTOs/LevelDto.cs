namespace backend.Models.DTOs;

public class LevelDto
{
    public int Id { get; set; }
    public int ChapterId { get; set; }
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public int XpReward { get; set; }
    public int GoldReward { get; set; }
    public string? Description { get; set; }
}

public class CreateLevelDto
{
    public int ChapterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Topic { get; set; }
    public string? Icon { get; set; }
    public string? Difficulty { get; set; }
    public int? XpReward { get; set; }
    public int? GoldReward { get; set; }
    public string? Description { get; set; }

    // Same role as CreateChapterDto.BaseOrderIndex, but for levels already sitting inside this
    // specific chapter as static content (0 for a brand-new DB-only chapter, 20 when extending an
    // existing static chapter — see mockData.js's per-chapter quest arrays).
    public int BaseOrderIndex { get; set; }
}

// Finds-or-creates the Chapter+Level identified by (Track, ChapterOrderIndex, LevelOrderIndex),
// materializing real DB ids for a level that today only exists as static frontend content. Used
// the first time an admin targets an existing map node (chapter map "+" button, or the admin
// quest form's cascading dropdowns) so a Question can be bound to a real LevelId.
public class ResolveLevelDto
{
    public string Track { get; set; } = string.Empty;
    public int ChapterOrderIndex { get; set; }
    public string? ChapterTitle { get; set; }
    public string? ChapterDescription { get; set; }
    public string? ChapterIcon { get; set; }
    public string? ChapterColor { get; set; }

    public int LevelOrderIndex { get; set; }
    public string? LevelTitle { get; set; }
    public string? Topic { get; set; }
    public string? Icon { get; set; }
    public string? Difficulty { get; set; }
    public int? XpReward { get; set; }
    public int? GoldReward { get; set; }
    public string? Description { get; set; }
}

public class ResolvedLevelDto
{
    public int ChapterId { get; set; }
    public int LevelId { get; set; }
}
