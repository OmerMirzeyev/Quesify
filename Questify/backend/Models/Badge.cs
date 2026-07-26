namespace backend.Models;

// Catalog of awardable achievements — seeded once (see BadgeSeeder) and never
// user-editable; Code is the stable key award-checks (BadgeAwarder) look up by.
public class Badge
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
}
