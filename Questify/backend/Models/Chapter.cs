namespace backend.Models;

// A chapter within a track's roadmap (e.g. "C#" chapter 0 = "Fəsil 1: Əsaslar"). The first two
// chapters per track already exist as static frontend content (src/data/mockData.js) and are
// never written here — rows in this table only ever represent chapters *beyond* those two
// (OrderIndex >= StaticChapterCount, see AdminController), or lazily-materialized shadow rows
// for a static chapter once an admin targets one of its levels for a new question (see
// AdminController.ResolveLevel). OrderIndex is the same 0-based index UserMapProgress.ChapterIndex
// already keys off of, so this table stays a pure additive layer over existing progress tracking.
public class Chapter
{
    public int Id { get; set; }
    public string Track { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "📦";
    public string Color { get; set; } = "#8b5cf6";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Level> Levels { get; set; } = new();
}
