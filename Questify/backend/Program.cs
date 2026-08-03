using System.Text;
using backend.Data;
using backend.Extensions;
using backend.Filters;
using backend.Hubs;
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

// ==========================================
// 1. Swagger Servislərinin Əlavə Edilməsi
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddSignalR();

// Used by AuthController to verify Google Sign-In ID tokens against Google's tokeninfo endpoint.
builder.Services.AddHttpClient();

// Locks the dev server to the port the frontend's API_BASE_URL/vite proxy expect, even if
// launchSettings.json is bypassed (e.g. running the built DLL directly) — only in Development,
// and only when nothing has already pinned a URL via ASPNETCORE_URLS/--urls.
if (builder.Environment.IsDevelopment() && Environment.GetEnvironmentVariable("ASPNETCORE_URLS") is null)
{
    builder.WebHost.UseUrls("http://localhost:5271");
}

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

        // Browsers can't attach an Authorization header to the WebSocket handshake SignalR's
        // client uses, so its accessTokenFactory instead appends the JWT as ?access_token=...
        // (see src/utils/signalr.js) — only honored under /hubs, so normal REST calls still must
        // use the Authorization header.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Configurable via appsettings' "AllowedOrigins" array — falls back to local Vite dev ports if not set.
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin => true)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

// ==========================================
// 2. Swagger Middleware-nin Aktiv Edilməsi
// ==========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Questify API v1");
        c.RoutePrefix = "swagger";
    });
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Applies pending EF Core migrations
    dbContext.Database.Migrate();

    // Ensure the built-in "Admin Questify" account exists, with the credentials always pinned to
    // admin@questify.com / Admin123! — reset on every startup so the password never drifts from
    // what's documented, even if it was changed via the profile/reset-password flow.
    const string AdminEmail = "admin@questify.com";
    const string AdminPassword = "Admin123!";

    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    var adminUser = dbContext.Users.FirstOrDefault(u => u.Email == AdminEmail);
    if (adminUser is null)
    {
        adminUser = new User
        {
            FirstName = "Admin",
            LastName = "Questify",
            Email = AdminEmail,
            PasswordHash = passwordHasher.HashPassword(AdminPassword),
            Role = "Admin",
            Emoji = "🛡️",
            IsEmailVerified = true
        };
        dbContext.Users.Add(adminUser);
    }
    else
    {
        adminUser.PasswordHash = passwordHasher.HashPassword(AdminPassword);
        if (adminUser.Role != "Admin")
        {
            adminUser.Role = "Admin";
        }
        if (!adminUser.IsEmailVerified)
        {
            adminUser.IsEmailVerified = true;
        }
    }
    dbContext.SaveChanges();

    // Backfills Username for rows created before that column existed (or anything else that
    // slipped through with it blank) — a one-time no-op on every startup after the first.
    var usersMissingUsername = dbContext.Users.Where(u => u.Username == "").ToList();
    foreach (var userMissingUsername in usersMissingUsername)
    {
        var baseName = $"{userMissingUsername.FirstName} {userMissingUsername.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(baseName)) baseName = userMissingUsername.Email.Split('@')[0];
        userMissingUsername.Username = UsernameGenerator.GenerateUniqueAsync(dbContext, baseName).GetAwaiter().GetResult();
    }
    if (usersMissingUsername.Count > 0) dbContext.SaveChanges();

    ShopSeeder.SeedIfEmpty(dbContext);
    CourseSeeder.SeedIfEmpty(dbContext);
    BadgeSeeder.SeedIfEmpty(dbContext);
}

app.UseRouting();
app.UseCors("Default");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();