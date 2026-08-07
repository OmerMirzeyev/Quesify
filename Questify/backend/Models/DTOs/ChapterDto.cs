namespace backend.Models.DTOs;

public class ChapterDto
{
    public int Id { get; set; }
    public string Track { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class CreateChapterDto
{
    public string Track { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }

    // Number of chapters that already exist as static frontend content for this track (currently
    // 2 — see mockData.js CHAPTER_META) — new chapters are appended after those, so this table
    // never has to duplicate the static seed data just to know where numbering should continue.
    public int BaseOrderIndex { get; set; } = 2;
}
