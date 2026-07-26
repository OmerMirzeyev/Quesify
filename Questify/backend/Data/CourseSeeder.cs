using backend.Models;

namespace backend.Data;

// Seeds the 6 landing-page technology cards on first run (only when Courses is empty — an
// admin can freely edit availability/order afterward without this overwriting it on restart).
public static class CourseSeeder
{
    public static void SeedIfEmpty(AppDbContext context)
    {
        if (context.Courses.Any())
            return;

        var courses = new List<Course>
        {
            new() { Slug = "C#",     Name = "C#",     Icon = "🟣", ChapterCount = 2, LevelCount = 40, IsAvailable = true,  SortOrder = 1 },
            new() { Slug = "Java",   Name = "Java",   Icon = "☕", ChapterCount = 2, LevelCount = 40, IsAvailable = true,  SortOrder = 2 },
            new() { Slug = "Python", Name = "Python", Icon = "🐍", ChapterCount = 2, LevelCount = 40, IsAvailable = true,  SortOrder = 3 },
            new() { Slug = "SQL",    Name = "SQL",    Icon = "🗄️", ChapterCount = 0, LevelCount = 0,  IsAvailable = false, SortOrder = 4 },
            new() { Slug = "C++",    Name = "C++",    Icon = "🔴", ChapterCount = 0, LevelCount = 0,  IsAvailable = false, SortOrder = 5 },
            new() { Slug = "React",  Name = "React",  Icon = "⚛️", ChapterCount = 0, LevelCount = 0,  IsAvailable = false, SortOrder = 6 },
        };

        context.Courses.AddRange(courses);
        context.SaveChanges();
    }
}
