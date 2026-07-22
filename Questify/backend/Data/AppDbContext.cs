using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ShopItem> ShopItems => Set<ShopItem>();
    public DbSet<UserInventory> UserInventories => Set<UserInventory>();
    public DbSet<UserMapProgress> UserMapProgress => Set<UserMapProgress>();
    public DbSet<ModerationAction> ModerationActions => Set<ModerationAction>();
    public DbSet<LoginOtp> LoginOtps => Set<LoginOtp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserInventory>()
            .HasOne(ui => ui.User)
            .WithMany()
            .HasForeignKey(ui => ui.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserInventory>()
            .HasOne(ui => ui.ShopItem)
            .WithMany()
            .HasForeignKey(ui => ui.ShopItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserMapProgress>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserMapProgress>()
            .HasIndex(p => new { p.UserId, p.Track, p.ChapterIndex, p.LevelIndex })
            .IsUnique();

        modelBuilder.Entity<LoginOtp>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LoginOtp>()
            .HasIndex(o => o.ChallengeId);
    }
}
