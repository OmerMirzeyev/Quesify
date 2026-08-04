using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using backend.Models.DTOs;

namespace backend.Services;

// Talks to OpenRouter's OpenAI-compatible chat completions endpoint. Two free models are tried
// in order (config: AiSettings:Model, then AiSettings:FallbackModel) since free-tier models on
// OpenRouter occasionally return 429/503 when overloaded — falling back keeps the mentor
// responsive instead of surfacing a raw error to the user.
public class AiService : IAiService
{
    // Language-match instruction is shared by both prompt variants below so the mentor never
    // replies in English to a question asked in Azerbaijani/Turkish/etc — the persona (gamified
    // quest mentor) stays constant, only the language of the reply itself changes.
    private const string LanguageMatchInstruction =
        "LANGUAGE RULE: Always reply in the EXACT SAME language the user used to ask their " +
        "question (e.g., if they ask in Azerbaijani, reply in Azerbaijani; if in Turkish, reply " +
        "in Turkish; if in English, reply in English). Detect the language from the user's latest " +
        "message every time — do not default to English. Maintain your gamified, engaging mentor " +
        "persona fully localized in that language, not just a literal translation. Code keywords " +
        "and syntax stay in the programming language itself, but all of your own explanations, " +
        "comments, and encouragement must be in the user's language.";

    // Shared by both prompt variants below — draws the line between the three fully-supported
    // languages (comprehensive help, no caveats) and everything else (still a real, helpful
    // answer, but tagged with a friendly "Coming Soon" heads-up so the user isn't misled into
    // thinking Questify already has a full interactive course for it).
    private const string ComingSoonInstruction =
        "TECHNOLOGY SCOPE: Questify's primary, fully-supported languages — with complete " +
        "interactive courses, quizzes, and quests — are C#, Java, and Python. Give comprehensive, " +
        "expert-level help for these three, no caveats needed. If the user asks about any OTHER " +
        "programming technology (e.g. HTML, CSS, JavaScript/TypeScript, SQL, DevOps, Docker, Git, " +
        "CI/CD, PHP, Ruby, Go, Rust, Swift, Kotlin, React, Angular, Vue, cloud platforms, etc.), " +
        "still give a real, accurate, helpful answer — with a short code example if useful — never " +
        "refuse and never redirect them back to C#/Java/Python. Instead, ALWAYS end that reply " +
        "with a short, friendly, enthusiastic note, translated into the exact same language as the " +
        "rest of your reply, equivalent in meaning to: \"💡 Note: Full interactive learning paths " +
        "and quizzes for this technology are Coming Soon ('Çox Yaxında') to Questify!\". Never " +
        "append this note when the question is about C#, Java, Python, or Questify's own app " +
        "features — only for other technologies.";

    private const string BaseSystemPrompt =
        "You are the Questify AI Mentor, an in-app assistant for Questify, a gamified " +
        "programming-learning platform. You may ONLY answer questions about: (1) Questify's own " +
        "features — quests/levels, XP, gold, the shop, leaderboard, streaks, avatars, jokers, " +
        "achievements, friends; (2) any programming/software-development technology — languages, " +
        "frameworks, tools, databases, DevOps, etc.; and (3) general programming/computer-science " +
        "concepts (syntax, loops, arrays, OOP, debugging, etc.). " +
        "If asked about anything outside that scope — unrelated topics, other products, personal " +
        "advice, current events, medical/legal/financial advice, etc. — politely decline in one " +
        "short sentence and steer the conversation back to programming or Questify. " +
        "Keep answers concise, beginner-friendly, and encouraging. " +
        ComingSoonInstruction + " " +
        LanguageMatchInstruction;

    // Appended instead of the generic scope note above when the caller knows which track the
    // user is enrolled in — every explanation and code sample must stay in that one language, so
    // a Python learner never gets handed a C# snippet by mistake.
    private const string LanguageLockTemplate =
        "You are the Questify AI Mentor, an in-app assistant for Questify, a gamified " +
        "programming-learning platform. The user is currently enrolled in the {0} course. " +
        "You may answer questions about: (1) Questify's own features — quests/levels, XP, " +
        "gold, the shop, leaderboard, streaks, avatars, jokers, achievements, friends; (2) " +
        "{0} programming concepts (syntax, loops, arrays, OOP, debugging, etc.); and (3) any " +
        "other programming/software-development technology, even outside {0}. " +
        "LANGUAGE LOCK (for the user's own {0} course only): when the question is about {0} — the " +
        "course the user is actively working through — every explanation and code example must be " +
        "written in {0} ONLY; never substitute a different language for {0} material. " +
        "OTHER TECHNOLOGIES: if the user instead asks about a different programming technology " +
        "(another language, a framework, a tool, etc.), do NOT refuse and do NOT redirect them " +
        "back to {0} — give a real, helpful, informative answer in that technology (with a short " +
        "code example if useful). " +
        ComingSoonInstruction + " " +
        "If asked about anything truly outside that scope — unrelated topics, other products, " +
        "personal advice, current events, medical/legal/financial advice, etc. — politely decline " +
        "in one short sentence and steer the conversation back to programming or Questify. " +
        "Tone: energetic, gamified, and encouraging — talk like a quest mentor guiding a hero " +
        "through their {0} adventure (light RPG flavor, occasional emoji, XP/level-up language " +
        "welcome), but stay concise and beginner-friendly above all. " +
        LanguageMatchInstruction;

    // Used by GenerateQuestionAsync — forces strict JSON output so the admin panel can parse the
    // response directly into form fields. {0}=language, {1}=topic, {2}=difficulty, {3}=random seed,
    // {4}=content language (the admin's current UI language — e.g. "Azerbaijani"/"English"/"Turkish").
    // The all-caps block at the end is deliberately blunt and repeated in different phrasings —
    // free-tier models on OpenRouter ignore a single polite "no markdown" instruction often enough
    // that ExtractJson (below) still has to be the real safety net, not this prompt alone.
    private const string QuestionGenerationPromptTemplate =
        "You are generating admin content for Questify, a gamified programming-learning platform. " +
        "Generate ONE completely new, unique multiple-choice coding question about the " +
        "programming language \"{0}\", topic \"{1}\", difficulty \"{2}\". Every time you are " +
        "called you MUST invent a different question — vary the scenario, wording, and code shown " +
        "so it never repeats a previous answer, even for the same language/topic/difficulty. Use " +
        "this random seed only to vary your creative choice, never mention it in the output: {3}. " +
        "Generate the title, description, question text, and hint STRICTLY in the following " +
        "language: {4}. Do not mix in any other natural language for those fields. Any code shown " +
        "inside the question must be valid {0} syntax (code syntax/keywords are never translated, " +
        "only the surrounding natural-language text is in {4}). Provide EXACTLY 4 answer options, " +
        "only one of which is correct — the options themselves must also be written in {4} (except " +
        "for literal {0} code/keywords within an option). Respond matching exactly this JSON shape: " +
        "{{\"title\":\"...\",\"description\":\"...\",\"question\":\"...\"," +
        "\"options\":[\"...\",\"...\",\"...\",\"...\"],\"correctIndex\":0,\"hint\":\"...\"}} " +
        "RETURN ONLY VALID RAW JSON. DO NOT INCLUDE MARKDOWN CODE BLOCKS. DO NOT USE ```json OR ``` " +
        "OF ANY KIND. DO NOT ADD ANY EXTRA TEXT, EXPLANATION, OR COMMENTARY BEFORE OR AFTER THE " +
        "JSON. Your entire response must start with an opening curly brace and end with a closing " +
        "curly brace and contain nothing else.";

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

    public async Task<(string Reply, string? DebugError)> AskAsync(IEnumerable<(string Role, string Content)> history, string? course = null, CancellationToken cancellationToken = default)
    {
        var settings = _configuration.GetSection("AiSettings");
        var apiKey = settings["ApiKey"];
        var baseUrl = settings["BaseUrl"] ?? "https://openrouter.ai/api/v1/chat/completions";
        var model = settings["Model"] ?? "meta-llama/llama-3.3-70b-instruct:free";
        var fallbackModel = settings["FallbackModel"] ?? "google/gemini-2.0-flash-lite-001:free";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("AiSettings:ApiKey is not configured — set it via 'dotnet user-secrets set \"AiSettings:ApiKey\" \"...\"' in Development, or the AiSettings__ApiKey environment variable elsewhere.");
            return (string.Empty, "AiSettings:ApiKey is not set.");
        }

        var systemPrompt = IsKnownCourse(course)
            ? string.Format(LanguageLockTemplate, course)
            : BaseSystemPrompt;

        var messages = new List<object> { new { role = "system", content = systemPrompt } };
        messages.AddRange(history.TakeLast(12).Select(h => (object)new { role = h.Role, content = h.Content }));

        // Without a cap, a free-tier reasoning model can spend its entire generation on hidden
        // "thinking" tokens and never finish within the per-request HttpClient timeout — same
        // fix already applied to GenerateQuestionAsync's QuestionMaxTokens, for the same reason.
        const int ChatMaxTokens = 600;

        var (reply, err1) = await TryModelAsync(model, apiKey, baseUrl, messages, cancellationToken, ChatMaxTokens);
        if (reply is not null) return (reply, null);

        _logger.LogWarning("AI model {Model} was unavailable — retrying with fallback {Fallback}.", model, fallbackModel);
        var (reply2, err2) = await TryModelAsync(fallbackModel, apiKey, baseUrl, messages, cancellationToken, ChatMaxTokens);
        if (reply2 is not null) return (reply2, null);

        // Both models failed — fail silently to the user. The exact provider failure is only
        // ever surfaced server-side via DebugError (logged by the controller); the caller gets an
        // empty reply and degrades to its own clean, localized fallback message instead of a raw
        // error ever reaching the chat window.
        var combinedError = $"primary: {err1} || fallback: {err2}";
        return (string.Empty, combinedError);
    }

    public async Task<(GeneratedQuestionDto? Question, string? DebugError)> GenerateQuestionAsync(string language, string topic, string difficulty, string? contentLanguage = null, CancellationToken cancellationToken = default)
    {
        var settings = _configuration.GetSection("AiSettings");
        var apiKey = settings["ApiKey"];
        var baseUrl = settings["BaseUrl"] ?? "https://openrouter.ai/api/v1/chat/completions";
        var model = settings["Model"] ?? "meta-llama/llama-3.3-70b-instruct:free";
        var fallbackModel = settings["FallbackModel"] ?? "google/gemini-2.0-flash-lite-001:free";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("AiSettings:ApiKey is not configured — question generation unavailable.");
            return (null, "AiSettings:ApiKey is not set.");
        }

        // A fresh random seed per call nudges the model toward a genuinely different question
        // instead of the same "textbook example" for a given language/topic/difficulty combo.
        var seed = Guid.NewGuid().ToString("N")[..8];
        var resolvedContentLanguage = string.IsNullOrWhiteSpace(contentLanguage) ? "Azerbaijani" : contentLanguage;
        var prompt = string.Format(QuestionGenerationPromptTemplate, language, topic, difficulty, seed, resolvedContentLanguage);
        var messages = new List<object> { new { role = "system", content = prompt } };

        // Capped well above what a title+description+question+4 options+hint needs — free-tier
        // models occasionally get truncated mid-JSON on the default token budget, which produces
        // syntactically invalid JSON no amount of string cleaning can fix. This is the other half
        // of the fix alongside ExtractJson below (that one handles malformed *wrapping*, this one
        // prevents malformed *truncation*).
        const int QuestionMaxTokens = 900;

        var (raw, err1) = await TryModelAsync(model, apiKey, baseUrl, messages, cancellationToken, QuestionMaxTokens);
        var parsed = raw is null ? null : ParseGeneratedQuestion(raw);
        if (parsed is not null) return (parsed, null);

        _logger.LogWarning("AI question generation with {Model} failed/returned invalid JSON — retrying with {Fallback}.", model, fallbackModel);
        var (raw2, err2) = await TryModelAsync(fallbackModel, apiKey, baseUrl, messages, cancellationToken, QuestionMaxTokens);
        var parsed2 = raw2 is null ? null : ParseGeneratedQuestion(raw2);
        if (parsed2 is not null) return (parsed2, null);

        var debugError = raw is not null ? $"primary returned unparsable content: {raw}" : $"primary: {err1}";
        var debugError2 = raw2 is not null ? $"fallback returned unparsable content: {raw2}" : $"fallback: {err2}";
        return (null, $"{debugError} || {debugError2}");
    }

    // Strips a leading/trailing markdown code fence (```json ... ``` or plain ``` ... ```,
    // tolerant of casing and a missing/blank language tag), then — regardless of whether a fence
    // was found — takes the substring between the first '{' and the last '}'. That second step is
    // what actually makes this robust: models don't only wrap JSON in fences, they sometimes also
    // prepend a sentence ("Sure, here's your question:") or append one, and fence-stripping alone
    // leaves that prose in place, which is exactly why the old regex-only approach worked "once"
    // and then failed the moment a call came back in a slightly different shape.
    private static readonly Regex CodeFenceRegex = new(
        @"^\s*```(?:json)?\s*|\s*```\s*$",
        RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.Compiled);

    private static string ExtractJson(string raw)
    {
        var cleaned = CodeFenceRegex.Replace(raw, string.Empty).Trim();

        var start = cleaned.IndexOf('{');
        var end = cleaned.LastIndexOf('}');
        if (start < 0 || end < 0 || end <= start)
        {
            return cleaned;
        }

        return cleaned[start..(end + 1)];
    }

    // Returns null (rather than throwing) on any malformed/incomplete response so the caller can
    // transparently retry with the fallback model.
    private GeneratedQuestionDto? ParseGeneratedQuestion(string raw)
    {
        var jsonText = ExtractJson(raw);

        try
        {
            using var doc = JsonDocument.Parse(jsonText);
            var root = doc.RootElement;

            var options = root.GetProperty("options").EnumerateArray()
                .Select(o => o.GetString() ?? string.Empty)
                .Where(o => !string.IsNullOrWhiteSpace(o))
                .ToList();

            var dto = new GeneratedQuestionDto
            {
                Title = root.GetProperty("title").GetString()?.Trim() ?? string.Empty,
                Description = root.GetProperty("description").GetString()?.Trim() ?? string.Empty,
                Question = root.GetProperty("question").GetString()?.Trim() ?? string.Empty,
                Options = options,
                CorrectIndex = root.GetProperty("correctIndex").GetInt32(),
                Hint = root.GetProperty("hint").GetString()?.Trim() ?? string.Empty,
            };

            var isValid = !string.IsNullOrWhiteSpace(dto.Title)
                && !string.IsNullOrWhiteSpace(dto.Question)
                && dto.Options.Count is >= 2 and <= 4
                && dto.CorrectIndex >= 0 && dto.CorrectIndex < dto.Options.Count;

            if (!isValid)
            {
                _logger.LogWarning("AI-generated question parsed but failed shape validation. Cleaned={Cleaned}", jsonText);
            }

            return isValid ? dto : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse AI-generated question JSON. Raw={Raw} Cleaned={Cleaned}", raw, jsonText);
            return null;
        }
    }

    // Returns (content, rawError). On any failure Content is null and RawError carries the exact
    // provider response body / exception text — logged here via _logger for the server console,
    // and also handed back up to AskAsync/GenerateQuestionAsync so callers can (temporarily, for
    // debugging in production) surface the real reason instead of only a generic fallback message.
    private async Task<(string? Content, string? RawError)> TryModelAsync(string model, string apiKey, string baseUrl, List<object> messages, CancellationToken cancellationToken, int? maxTokens = null)
    {
        try
        {
            var http = _httpClientFactory.CreateClient();
            http.Timeout = TimeSpan.FromSeconds(15);

            using var request = new HttpRequestMessage(HttpMethod.Post, baseUrl);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            // Recommended (not required) by OpenRouter to identify the calling app in their dashboard.
            request.Headers.TryAddWithoutValidation("HTTP-Referer", "https://questify.app");
            request.Headers.TryAddWithoutValidation("X-Title", "Questify AI Mentor");
            request.Content = maxTokens is null
                ? JsonContent.Create(new { model, messages })
                : JsonContent.Create(new { model, messages, max_tokens = maxTokens });

            using var response = await http.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var rawError = $"{model} → HTTP {(int)response.StatusCode} {response.StatusCode}: {body}";
                _logger.LogWarning("AI model {Model} returned {Status}: {Body}", model, response.StatusCode, body);
                return (null, rawError);
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("error", out var errorEl))
            {
                var rawError = $"{model} → provider error payload: {errorEl}";
                _logger.LogWarning("AI model {Model} returned an error payload: {Error}", model, errorEl.ToString());
                return (null, rawError);
            }

            var content = root
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return (string.IsNullOrWhiteSpace(content) ? null : content.Trim(), null);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Caller's overall deadline (see AiController) was hit — let it propagate so the
            // controller can return a 504 instead of silently trying the fallback model too.
            throw;
        }
        catch (Exception ex)
        {
            var rawError = $"{model} → exception: {ex.GetType().Name}: {ex.Message}";
            _logger.LogWarning(ex, "AI model {Model} request failed.", model);
            return (null, rawError);
        }
    }
}
