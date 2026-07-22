namespace backend.Models.DTOs;

public class CompleteLevelDto
{
    public string Track { get; set; } = string.Empty;
    public int ChapterIndex { get; set; }
    public int LevelIndex { get; set; }

    // Level counts/chapter boundaries are owned by the frontend content (mockData.js),
    // so the client tells the server whether this was the last level of the chapter,
    // which determines whether the "next unlock" is the next level or the next chapter.
    public bool IsLastLevelOfChapter { get; set; }
}
