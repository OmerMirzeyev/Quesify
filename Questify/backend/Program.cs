using System.Text;
using backend.Data;
using backend.Filters;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var jwtSettings = builder.Configuration.GetSection("Jwt");
var signingKey = jwtSettings["SigningKey"]
    ?? throw new InvalidOperationException(
        "JWT SigningKey is not configured. Set it via 'dotnet user-secrets set \"Jwt:SigningKey\" \"...\"' " +
        "in Development, or the Jwt__SigningKey environment variable elsewhere.");

builder.Services.AddControllers(options =>
{
    // Rejects requests from an already-issued token if the user was banned/timed-out
    // after the token was issued (Login already blocks issuing a new token for them).
    options.Filters.Add<BanEnforcementFilter>();
});

builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

// Anchor the SQLite DB to the project source root (ContentRootPath), not the CWD.
// This prevents the "empty app.db" issue where dotnet run writes to bin\Debug\net10.0\ instead.
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "app.db");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// Configurable via appsettings' "AllowedOrigins" array (e.g. add a deployed frontend origin
// there) — falls back to the two local Vite dev ports if not set.
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Applies pending EF Core migrations, creating the DB on first run — does NOT drop
    // existing data on restart (this used to call EnsureDeleted()+EnsureCreated() on every
    // startup, wiping the entire database every time the app restarted).
    dbContext.Database.Migrate();

    // Ensure the built-in "Admin Questify" account exists and is always Role="Admin" — this
    // self-heals on every startup (not just when the Users table is empty), so it can never be
    // left demoted by, e.g., an accidental role-change through the admin panel.
    var adminUser = dbContext.Users.FirstOrDefault(u => u.Email == "admin@questify.com");
    if (adminUser is null)
    {
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        adminUser = new User
        {
            FirstName = "Admin",
            LastName = "Questify",
            Email = "admin@questify.com",
            PasswordHash = passwordHasher.HashPassword("AdminPassword123!"),
            Role = "Admin",
            Emoji = "🛡️"
        };
        dbContext.Users.Add(adminUser);
    }
    else if (adminUser.Role != "Admin")
    {
        adminUser.Role = "Admin";
    }
    dbContext.SaveChanges();

    ShopSeeder.SeedIfEmpty(dbContext);
}

app.UseRouting();
app.UseCors("Default");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
