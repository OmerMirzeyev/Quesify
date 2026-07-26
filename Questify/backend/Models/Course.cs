namespace backend.Models;

// Landing-page course catalog entry. Not the lesson/quest content itself (that still lives in
// the frontend's QUESTS_BY_CHAPTER for the tracks that have it) — this is the canonical list of
// what's shown on the landing page, in what order, and whether it's actually playable yet.
public class Course
{
    public int Id { get; set; }

    // Matches the frontend's ALL_TRACKS track identifiers for the three that are playable
    // ("C#", "Java", "Python"); the other three are catalog-only for now.
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int ChapterCount { get; set; }
    public int LevelCount { get; set; }

    // False for tracks with no lesson content yet (SQL, C++, React) — the landing page shows
    // these as "Coming Soon" instead of letting them navigate into an empty course.
    public bool IsAvailable { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}
