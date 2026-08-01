using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Services;

// Talks to OpenRouter's OpenAI-compatible chat completions endpoint. Two free models are tried
// in order (config: AiSettings:Model, then AiSettings:FallbackModel) since free-tier models on
// OpenRouter occasionally return 429/503 when overloaded — falling back keeps the mentor
// responsive instead of surfacing a raw error to the user.
public class AiService : IAiService
{
    private const string BaseSystemPrompt =
        "You are the Questify AI Mentor, an in-app assistant for Questify, a gamified " +
        "programming-learning platform. You may ONLY answer questions about: (1) Questify's own " +
        "features — quests/levels, XP, gold, the shop, leaderboard, streaks, avatars, jokers, " +
        "achievements, friends; (2) the courses Questify teaches — C#, Java, Python, SQL, C++, " +
        "and React; and (3) general programming/computer-science concepts related to those " +
        "languages (syntax, loops, arrays, OOP, debugging, etc.). " +
        "If asked about anything outside that scope — unrelated topics, other products, personal " +
        "advice, current events, medical/legal/financial advice, etc. — politely decline in one " +
        "short sentence and steer the conversation back to programming or Questify. " +
        "Keep answers concise, beginner-friendly, and encouraging.";

    // Appended instead of the generic scope note above when the caller knows which track the
    // user is enrolled in — every explanation and code sample must stay in that one language, so
    // a Python learner never gets handed a C# snippet by mistake.
    private const string LanguageLockTemplate =
        "You are the Questify AI Mentor, an in-app assistant for Questify, a gamified " +
        "programming-learning platform. The user is currently enrolled in the {0} course. " +
        "You may ONLY answer questions about: (1) Questify's own features — quests/levels, XP, " +
        "gold, the shop, leaderboard, streaks, avatars, jokers, achievements, friends; and (2) " +
        "{0} programming concepts (syntax, loops, arrays, OOP, debugging, etc.). " +
        "STRICT LANGUAGE LOCK: every explanation and EVERY code example you give must be written " +
        "in {0} ONLY — never show code in another language, even to compare or translate, even if " +
        "the user explicitly asks for a different language. If asked for another language, briefly " +
        "explain you're their dedicated {0} mentor for this quest and give the {0} equivalent instead. " +
        "If asked about anything outside that scope — unrelated topics, other products, personal " +
        "advice, current events, medical/legal/financial advice, etc. — politely decline in one " +
        "short sentence and steer the conversation back to {0} or Questify. " +
        "Tone: energetic, gamified, and encouraging — talk like a quest mentor guiding a hero " +
        "through their {0} adventure (light RPG flavor, occasional emoji, XP/level-up language " +
        "welcome), but stay concise and beginner-friendly above all.";

    // Only these tracks have real lesson content (see CourseSeeder) — a course outside this set
    // can't actually be "enrolled in", so it's ignored rather than trusted into the prompt.
    private static readonly HashSet<string> KnownCourses = new(StringComparer.OrdinalIgnoreCase)
    {
        "C#", "Java", "Python"
    };

    // Shared with AiController so it validates the client-supplied course hint against the exact
    // same whitelist this service trusts when building the system prompt.
    public static bool IsKnownCourse(string? course) => course is not null && KnownCourses.Contains(course);

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiService> _logger;

    public AiService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<AiService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> AskAsync(IEnumerable<(string Role, string Content)> history, string? course = null)
    {
        var settings = _configuration.GetSection("AiSettings");
        var apiKey = settings["ApiKey"];
        var baseUrl = settings["BaseUrl"] ?? "https://openrouter.ai/api/v1/chat/completions";
        var model = settings["Model"] ?? "meta-llama/llama-3.3-70b-instruct:free";
        var fallbackModel = settings["FallbackModel"] ?? "google/gemini-2.0-flash-lite-001:free";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("AiSettings:ApiKey is not configured — set it via 'dotnet user-secrets set \"AiSettings:ApiKey\" \"...\"' in Development, or the AiSettings__ApiKey environment variable elsewhere.");
            return "The AI mentor isn't configured on the server yet.";
        }

        var systemPrompt = IsKnownCourse(course)
            ? string.Format(LanguageLockTemplate, course)
            : BaseSystemPrompt;

        var messages = new List<object> { new { role = "system", content = systemPrompt } };
        messages.AddRange(history.TakeLast(12).Select(h => (object)new { role = h.Role, content = h.Content }));

        var reply = await TryModelAsync(model, apiKey, baseUrl, messages);
        if (reply is not null) return reply;

        _logger.LogWarning("AI model {Model} was unavailable — retrying with fallback {Fallback}.", model, fallbackModel);
        reply = await TryModelAsync(fallbackModel, apiKey, baseUrl, messages);

        return reply ?? "Sorry, the AI mentor is temporarily unavailable. Please try again in a moment.";
    }

    private async Task<string?> TryModelAsync(string model, string apiKey, string baseUrl, List<object> messages)
    {
        try
        {
            var http = _httpClientFactory.CreateClient();
            http.Timeout = TimeSpan.FromSeconds(30);

            using var request = new HttpRequestMessage(HttpMethod.Post, baseUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            // Recommended (not required) by OpenRouter to identify the calling app in their dashboard.
            request.Headers.TryAddWithoutValidation("HTTP-Referer", "https://questify.app");
            request.Headers.TryAddWithoutValidation("X-Title", "Questify AI Mentor");
            request.Content = JsonContent.Create(new { model, messages });

            using var response = await http.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI model {Model} returned {Status}: {Body}", model, response.StatusCode, body);
                return null;
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("error", out var errorEl))
            {
                _logger.LogWarning("AI model {Model} returned an error payload: {Error}", model, errorEl.ToString());
                return null;
            }

            var content = root
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return string.IsNullOrWhiteSpace(content) ? null : content.Trim();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI model {Model} request failed.", model);
            return null;
        }
    }
}
