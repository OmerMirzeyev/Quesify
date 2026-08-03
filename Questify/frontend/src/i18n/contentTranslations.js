// Translations for Chapter Map content that lives in src/data/mockData.js (chapter titles/
// subtitles + each level's display title) rather than in translations.js — that content is
// static per-course quest data, not app-shell UI strings, so it needs its own lookup instead of
// the t() key system. Quiz questions/options/hints inside a level are intentionally NOT covered
// here yet (kept in Azerbaijani) — translating ~120 graded quiz questions accurately is a much
// larger content pass than "make the Chapter Map translate."
//
// Falls back to the original mockData.js string whenever a language/entry isn't present here, so
// a missing translation never renders blank.

// Keyed by track ('C#' | 'Java' | 'Python') -> chapter index (0 | 1) -> language -> {title, subtitle}.
export const CHAPTER_META_TRANSLATIONS = {
  'C#': [
    {
      en: { title: 'Chapter 1: Fundamentals', subtitle: 'Variables, Loops, Arrays' },
      tr: { title: 'Bölüm 1: Temeller', subtitle: 'Değişkenler, Döngüler, Diziler' },
    },
    {
      en: { title: 'Chapter 2: OOP & Advanced', subtitle: 'Classes, LINQ, Generics' },
      tr: { title: 'Bölüm 2: OOP ve İleri Seviye', subtitle: 'Sınıflar, LINQ, Generics' },
    },
  ],
  Java: [
    {
      en: { title: 'Chapter 1: Fundamentals', subtitle: 'Syntax, OOP, Collections' },
      tr: { title: 'Bölüm 1: Temeller', subtitle: 'Sözdizimi, OOP, Koleksiyonlar' },
    },
    {
      en: { title: 'Chapter 2: Advanced', subtitle: 'Generics, Streams, Patterns' },
      tr: { title: 'Bölüm 2: İleri Seviye', subtitle: 'Generics, Streams, Desenler' },
    },
  ],
  Python: [
    {
      en: { title: 'Chapter 1: Fundamentals', subtitle: 'Print, Lists, Functions' },
      tr: { title: 'Bölüm 1: Temeller', subtitle: 'Print, Listeler, Fonksiyonlar' },
    },
    {
      en: { title: 'Chapter 2: Advanced', subtitle: 'OOP, Decorators, Async' },
      tr: { title: 'Bölüm 2: İleri Seviye', subtitle: 'OOP, Dekoratörler, Async' },
    },
  ],
};

export function translateChapterMeta(track, chapterIndex, language, fallback) {
  const entry = CHAPTER_META_TRANSLATIONS[track]?.[chapterIndex]?.[language];
  return entry || fallback;
}

// Keyed by "<track>-<questId>" (quest ids repeat across tracks, e.g. both C# and Java have an id
// 1, so the track prefix disambiguates) -> language -> translated title. levelName ("Level 1:
// Variables") is left alone everywhere — it's already plain English in mockData.js.
export const LEVEL_TITLE_TRANSLATIONS = {
  // ── C# Chapter 1 ──
  'C#-1': { en: 'C# Variables & Types', tr: 'C# Değişkenler ve Tipler' },
  'C#-2': { en: 'Loops', tr: 'Döngüler' },
  'C#-3': { en: 'Arrays', tr: 'Diziler' },
  'C#-4': { en: 'String Operations', tr: 'String İşlemleri' },
  'C#-5': { en: 'Methods', tr: 'Metotlar' },
  'C#-6': { en: 'Conditional Statements', tr: 'Koşul İfadeleri' },
  'C#-7': { en: 'OOP Basics', tr: 'OOP Temelleri' },
  'C#-8': { en: 'Inheritance', tr: 'Kalıtım' },
  'C#-9': { en: 'Interfaces', tr: 'Arayüzler' },
  'C#-10': { en: 'Exception Handling', tr: 'Hata Yönetimi' },
  'C#-11': { en: 'List and Dictionary', tr: 'List ve Dictionary' },
  'C#-12': { en: 'Polymorphism', tr: 'Polimorfizm' },
  'C#-13': { en: 'Delegates & Events', tr: 'Delegeler ve Olaylar' },
  'C#-14': { en: 'Generics', tr: 'Generics' },
  'C#-15': { en: 'LINQ Queries', tr: 'LINQ Sorguları' },
  'C#-16': { en: 'Asynchronous Programming', tr: 'Asenkron Programlama' },
  'C#-17': { en: 'File Operations', tr: 'Dosya İşlemleri' },
  'C#-18': { en: 'Design Patterns', tr: 'Tasarım Desenleri' },
  'C#-19': { en: 'Algorithms', tr: 'Algoritmalar' },
  'C#-20': { en: 'The Ultimate Challenge 🏆', tr: 'En Büyük Sınav 🏆' },

  // ── C# Chapter 2 ──
  'C#-101': { en: 'Tuple & ValueTuple', tr: 'Tuple ve ValueTuple' },
  'C#-102': { en: 'Record Types', tr: 'Record Türleri' },
  'C#-103': { en: 'Pattern Matching', tr: 'Örüntü Eşleştirme (Pattern Matching)' },
  'C#-104': { en: 'Span<T> & Memory', tr: 'Span<T> ve Bellek' },
  'C#-105': { en: 'Nullable Reference Types', tr: 'Nullable Referans Türleri' },
  'C#-106': { en: 'Extension Methods', tr: 'Extension Metotlar' },
  'C#-107': { en: 'Attributes', tr: 'Öznitelikler (Attributes)' },
  'C#-108': { en: 'Reflection', tr: 'Reflection (Yansıma)' },
  'C#-109': { en: 'Dependency Injection', tr: 'Dependency Injection' },
  'C#-110': { en: 'SOLID: Single Responsibility', tr: 'SOLID: Tek Sorumluluk' },
  'C#-111': { en: 'SOLID: Open/Closed', tr: 'SOLID: Açık/Kapalı' },
  'C#-112': { en: 'SOLID: Liskov', tr: 'SOLID: Liskov' },
  'C#-113': { en: 'SOLID: Interface Segregation', tr: 'SOLID: Arayüz Ayrımı' },
  'C#-114': { en: 'SOLID: Dependency Inversion', tr: 'SOLID: Bağımlılığın Tersine Çevrilmesi' },
  'C#-115': { en: 'Unit Testing Basics', tr: 'Birim Test Temelleri' },
  'C#-116': { en: 'Introduction to ASP.NET Core', tr: "ASP.NET Core'a Giriş" },
  'C#-117': { en: 'Entity Framework Core', tr: 'Entity Framework Core' },
  'C#-118': { en: 'JWT Authentication', tr: 'JWT Authentication' },
  'C#-119': { en: 'Microservices Architecture', tr: 'Mikroservis Mimarisi' },
  'C#-120': { en: 'C# Master Challenge 🏆', tr: 'C# Ustalık Sınavı 🏆' },

  // ── Java Chapter 1 ──
  'Java-1': { en: 'Introduction to Java', tr: "Java'ya Giriş" },
  'Java-2': { en: 'Variables', tr: 'Değişkenler' },
  'Java-3': { en: 'String Handling', tr: 'String İşleme' },
  'Java-4': { en: 'Loops', tr: 'Döngüler' },
  'Java-5': { en: 'Arrays', tr: 'Diziler' },
  'Java-6': { en: 'Class and Object', tr: 'Sınıf ve Nesne' },
  'Java-7': { en: 'Inheritance', tr: 'Kalıtım' },
  'Java-8': { en: 'Interfaces', tr: 'Arayüzler' },
  'Java-9': { en: 'Exception Handling', tr: 'Hata Yönetimi' },
  'Java-10': { en: 'Collections', tr: 'Koleksiyonlar' },
  'Java-11': { en: 'Generics', tr: 'Generics' },
  'Java-12': { en: 'Java Streams API', tr: 'Java Streams API' },
  'Java-13': { en: 'Lambda Expressions', tr: 'Lambda İfadeleri' },
  'Java-14': { en: 'Optional<T>', tr: 'Optional<T>' },
  'Java-15': { en: 'Multithreading', tr: 'Çoklu İş Parçacığı (Multithreading)' },
  'Java-16': { en: 'Design Patterns', tr: 'Tasarım Desenleri' },
  'Java-17': { en: 'JDBC & Databases', tr: 'JDBC ve Veritabanları' },
  'Java-18': { en: 'Introduction to Spring Framework', tr: "Spring Framework'e Giriş" },
  'Java-19': { en: 'Spring Boot REST API', tr: 'Spring Boot REST API' },
  'Java-20': { en: 'Java Master Challenge 🏆', tr: 'Java Ustalık Sınavı 🏆' },

  // ── Java Chapter 2 ──
  'Java-101': { en: 'Java Records (Java 16+)', tr: 'Java Records (Java 16+)' },
  'Java-102': { en: 'Sealed Classes', tr: 'Sealed Sınıflar' },
  'Java-103': { en: 'Text Blocks', tr: 'Text Blocks' },
  'Java-104': { en: 'Pattern Matching Switch', tr: 'Pattern Matching Switch' },
  'Java-105': { en: 'Virtual Threads (Java 21)', tr: 'Virtual Threads (Java 21)' },
  'Java-106': { en: 'CompletableFuture', tr: 'CompletableFuture' },
  'Java-107': { en: 'JUnit 5 Testing', tr: 'JUnit 5 ile Test' },
  'Java-108': { en: 'Mockito Mocking', tr: 'Mockito Mocking' },
  'Java-109': { en: 'Build Tools', tr: 'Build Araçları' },
  'Java-110': { en: 'Microservices Architecture', tr: 'Mikroservis Mimarisi' },
  'Java-111': { en: 'Introduction to Apache Kafka', tr: "Apache Kafka'ya Giriş" },
  'Java-112': { en: 'Java + Docker', tr: 'Java + Docker' },
  'Java-113': { en: 'REST vs GraphQL', tr: 'REST vs GraphQL' },
  'Java-114': { en: 'Spring Security', tr: 'Spring Security' },
  'Java-115': { en: 'Caching', tr: 'Önbellekleme (Caching)' },
  'Java-116': { en: 'Load Balancing', tr: 'Yük Dengeleme' },
  'Java-117': { en: 'Monitoring & Logging', tr: 'Monitoring ve Logging' },
  'Java-118': { en: 'Event Sourcing Pattern', tr: 'Event Sourcing Deseni' },
  'Java-119': { en: 'JVM Performance', tr: 'JVM Performansı' },
  'Java-120': { en: 'Java Senior Challenge 🏆', tr: 'Java Kıdemli Sınavı 🏆' },

  // ── Python Chapter 1 ──
  'Python-1': { en: 'Introduction to Python', tr: "Python'a Giriş" },
  'Python-2': { en: 'Variables', tr: 'Değişkenler' },
  'Python-3': { en: 'String Operations', tr: 'String İşlemleri' },
  'Python-4': { en: 'Lists', tr: 'Listeler' },
  'Python-5': { en: 'Loops', tr: 'Döngüler' },
  'Python-6': { en: 'Functions', tr: 'Fonksiyonlar' },
  'Python-7': { en: 'Conditional Statements', tr: 'Koşul İfadeleri' },
  'Python-8': { en: 'Dictionaries', tr: 'Sözlükler (Dicts)' },
  'Python-9': { en: 'Tuples', tr: 'Demetler (Tuples)' },
  'Python-10': { en: 'Sets', tr: 'Kümeler (Sets)' },
  'Python-11': { en: 'Class and Object', tr: 'Sınıf ve Nesne' },
  'Python-12': { en: 'Inheritance', tr: 'Kalıtım' },
  'Python-13': { en: 'Decorators', tr: 'Dekoratörler' },
  'Python-14': { en: 'Generator Functions', tr: 'Generator Fonksiyonları' },
  'Python-15': { en: 'List Comprehension', tr: 'List Comprehension' },
  'Python-16': { en: 'File Operations', tr: 'Dosya İşlemleri' },
  'Python-17': { en: 'Modules & Packages', tr: 'Modüller ve Paketler' },
  'Python-18': { en: 'Exception Handling', tr: 'Hata Yönetimi' },
  'Python-19': { en: 'Testing with pytest', tr: 'pytest ile Test' },
  'Python-20': { en: 'Python Master Challenge 🏆', tr: 'Python Ustalık Sınavı 🏆' },

  // ── Python Chapter 2 ──
  'Python-101': { en: 'Asynchronous Python', tr: 'Asenkron Python' },
  'Python-102': { en: 'Type Annotations', tr: 'Tip Notasyonları' },
  'Python-103': { en: '@dataclass Decorator', tr: '@dataclass Dekoratörü' },
  'Python-104': { en: 'Context Managers', tr: 'Context Manager' },
  'Python-105': { en: 'Metaclasses', tr: 'Metasınıflar' },
  'Python-106': { en: 'Descriptors', tr: 'Tanımlayıcılar (Descriptors)' },
  'Python-107': { en: 'NumPy Basics', tr: 'NumPy Temelleri' },
  'Python-108': { en: 'Pandas DataFrame', tr: 'Pandas DataFrame' },
  'Python-109': { en: 'Introduction to Machine Learning', tr: "Machine Learning'e Giriş" },
  'Python-110': { en: 'FastAPI REST API', tr: 'FastAPI REST API' },
  'Python-111': { en: 'SQLAlchemy ORM', tr: 'SQLAlchemy ORM' },
  'Python-112': { en: 'Celery Task Queue', tr: 'Celery Task Queue' },
  'Python-113': { en: 'Python + Docker', tr: 'Python + Docker' },
  'Python-114': { en: 'Pytest + Mock', tr: 'Pytest + Mock' },
  'Python-115': { en: 'CI/CD Pipeline', tr: 'CI/CD Pipeline' },
  'Python-116': { en: 'Real-time with WebSocket', tr: 'WebSocket ile Gerçek Zamanlı' },
  'Python-117': { en: 'Pydantic Validation', tr: 'Pydantic Doğrulama' },
  'Python-118': { en: 'AI/LLM Integration', tr: 'AI/LLM Entegrasyonu' },
  'Python-119': { en: 'System Design', tr: 'Sistem Tasarımı' },
  'Python-120': { en: 'Python Senior Challenge 🏆', tr: 'Python Kıdemli Sınavı 🏆' },
};

export function translateLevelTitle(track, questId, language, fallback) {
  return LEVEL_TITLE_TRANSLATIONS[`${track}-${questId}`]?.[language] || fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHALLENGE (quiz) CONTENT TRANSLATIONS
// Keyed by "<track>-<questId>" -> language -> array of { question, options, hint },
// in the exact same order as the level's `challenges` array in mockData.js.
// `correctIndex` is NOT duplicated here — it's identical across languages and
// already lives on the az fallback object; translateChallenges() merges it back in.
// ─────────────────────────────────────────────────────────────────────────────
export const CHALLENGE_TRANSLATIONS = {
  // ══════════════════════════════ C# — Chapter 1 ══════════════════════════════
  'C#-1': {
    en: [
      { question: 'Which type is used to store integers in C#?', options: ['double', 'char', 'int', 'string'], hint: 'Integer → int.' },
      { question: 'Which type stores a boolean (true/false) value?', options: ['bool', 'string', 'float', 'char'], hint: 'bool — Boolean.' },
    ],
    tr: [
      { question: 'C# dilinde tam sayıları saklamak için hangi tip kullanılır?', options: ['double', 'char', 'int', 'string'], hint: 'Integer → int.' },
      { question: 'Mantıksal (true/false) değeri hangi tip saklar?', options: ['bool', 'string', 'float', 'char'], hint: 'bool — Boolean.' },
    ],
  },
  'C#-2': {
    en: [
      { question: 'How many times will for (int i=0; i<5; i++) execute?', options: ['4', '5', '6', 'Infinite'], hint: 'i=0..4, 5 times total.' },
      { question: 'Which loop executes at least once?', options: ['for', 'while', 'do-while', 'foreach'], hint: 'Condition is checked after the block.' },
    ],
    tr: [
      { question: 'for (int i=0; i<5; i++) kaç kez çalışır?', options: ['4', '5', '6', 'Sonsuz'], hint: 'i=0..4, toplam 5 kez.' },
      { question: 'Hangi döngü en az 1 kez çalışır?', options: ['for', 'while', 'do-while', 'foreach'], hint: 'Koşul bloktan sonra kontrol edilir.' },
    ],
  },
  'C#-3': {
    en: [
      { question: 'An int array with 5 elements?', options: ['int[] arr = new int[5];', 'int arr = new int(5);', 'array int arr = 5;', 'int[5] arr;'], hint: 'new int[5].' },
      { question: 'The first element of an array?', options: ['arr[1]', 'arr[0]', 'arr[-1]', 'arr.first'], hint: 'Indexing starts at zero.' },
    ],
    tr: [
      { question: '5 elemanlı int dizisi?', options: ['int[] arr = new int[5];', 'int arr = new int(5);', 'array int arr = 5;', 'int[5] arr;'], hint: 'new int[5].' },
      { question: 'Dizinin ilk elemanı?', options: ['arr[1]', 'arr[0]', 'arr[-1]', 'arr.first'], hint: 'Sıfırdan başlar.' },
    ],
  },
  'C#-4': {
    en: [
      { question: 'For string length?', options: ['.size', '.count', '.Length', '.len()'], hint: 'C# has a Length property.' },
      { question: 'What does "Hello" + " World" give?', options: ['Hello World', 'Hello+World', 'Error', 'null'], hint: 'The + operator concatenates.' },
    ],
    tr: [
      { question: 'String uzunluğu için?', options: ['.size', '.count', '.Length', '.len()'], hint: "C#'ta Length adında bir property var." },
      { question: '"Merhaba" + " Dünya" ne verir?', options: ['Merhaba Dünya', 'Merhaba+Dünya', 'Hata', 'null'], hint: '+ operatörü birleştirme yapar.' },
    ],
  },
  'C#-5': {
    en: [
      { question: 'What is the return type of a method that returns nothing?', options: ['null', 'void', 'empty', 'none'], hint: 'void — no return value.' },
      { question: 'What is method overloading?', options: ['Same name, different parameters', 'Same parameters, different name', 'Recursion', 'Always static'], hint: 'Same name, different signature.' },
    ],
    tr: [
      { question: 'Hiçbir şey döndürmeyen bir metodun dönüş tipi nedir?', options: ['null', 'void', 'empty', 'none'], hint: 'void — geri dönüş değeri yok.' },
      { question: 'Metot overloading nedir?', options: ['Aynı isim, farklı parametreler', 'Aynı parametreler, farklı isim', 'Rekürsiyon', 'Her zaman static'], hint: 'Aynı isim, farklı imza.' },
    ],
  },
  'C#-6': {
    en: [
      { question: 'In an if-else if chain, when the first true condition is found?', options: ['All blocks execute', 'Only that block runs, the rest are skipped', 'Error', 'Infinite loop'], hint: 'Only one branch executes.' },
      { question: 'What happens if there is no break in a switch case?', options: ['Error', 'It falls through to the next case', 'Execution stops', 'null'], hint: 'Fall-through occurs.' },
    ],
    tr: [
      { question: 'if-else if zincirinde ilk doğru koşul bulunduğunda ne olur?', options: ['Hepsi çalışır', 'Sadece o blok çalışır, geri kalanı atlanır', 'Hata', 'Sonsuz döngü'], hint: 'Sadece bir branch çalışır.' },
      { question: 'switch case içinde break olmazsa ne olur?', options: ['Hata', "Bir sonraki case'e geçer", 'Çalışma durur', 'null'], hint: 'Fall-through gerçekleşir.' },
    ],
  },
  'C#-7': {
    en: [
      { question: 'Which keyword creates a new object?', options: ['class', 'create', 'new', 'this'], hint: 'new calls the constructor.' },
      { question: 'Which principle hides data?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], hint: 'Encapsulation — bundling data.' },
    ],
    tr: [
      { question: 'Yeni bir nesne oluşturmak için hangi anahtar kelime kullanılır?', options: ['class', 'create', 'new', 'this'], hint: "new, constructor'ı çağırır." },
      { question: 'Hangi prensip veriyi gizler?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], hint: 'Encapsulation — kapsülleme.' },
    ],
  },
  'C#-8': {
    en: [
      { question: 'Which symbol is used for inheritance?', options: [':', '->', 'extends', 'implements'], hint: 'class Dog : Animal.' },
      { question: 'To call a base class method?', options: ['super()', 'base()', 'parent()', 'root()'], hint: "C# uses the base keyword." },
    ],
    tr: [
      { question: 'Kalıtım almak için hangi sembol kullanılır?', options: [':', '->', 'extends', 'implements'], hint: 'class Dog : Animal.' },
      { question: 'Base sınıfın bir metodunu çağırmak için?', options: ['super()', 'base()', 'parent()', 'root()'], hint: "C#'ta base anahtar kelimesi kullanılır." },
    ],
  },
  'C#-9': {
    en: [
      { question: 'Do interface methods have a default body?', options: ['Yes', 'No (abstract)', 'Always virtual', 'Static only'], hint: 'Abstract by default.' },
      { question: 'How many interfaces can a class implement?', options: ['1', '2', '3', 'Unlimited'], hint: 'C# supports multiple interface implementation.' },
    ],
    tr: [
      { question: 'Interface metotlarının varsayılan bir gövdesi var mı?', options: ['Var', 'Yok (abstract)', 'Her zaman virtual', 'Sadece static'], hint: 'Varsayılan olarak abstract.' },
      { question: 'Bir sınıf kaç interface implement edebilir?', options: ['1', '2', '3', 'Sınırsız'], hint: "C# birden fazla interface implementasyonunu destekler." },
    ],
  },
  'C#-10': {
    en: [
      { question: 'Which block is used to catch errors?', options: ['catch-try', 'try-catch', 'error-handle', 'finally'], hint: 'try → catch.' },
      { question: 'When does the finally block execute?', options: ['Only on error', 'Always', 'Only on success', 'Never'], hint: 'It always executes.' },
    ],
    tr: [
      { question: 'Hataları yakalamak için hangi blok kullanılır?', options: ['catch-try', 'try-catch', 'error-handle', 'finally'], hint: 'try → catch.' },
      { question: 'finally bloğu ne zaman çalışır?', options: ['Sadece hata olduğunda', 'Her zaman', 'Sadece başarılı olduğunda', 'Asla'], hint: 'Her zaman çalışır.' },
    ],
  },
  'C#-11': {
    en: [
      { question: 'How does List<T> differ from an array?', options: ['Fixed size', 'Grows dynamically', 'Only for strings', 'Only for ints'], hint: 'It grows dynamically.' },
      { question: 'What does Dictionary<K,V> store?', options: ['Only int', 'Key-value pairs', 'An ordered list', 'Bits'], hint: 'Key-value.' },
    ],
    tr: [
      { question: "List<T>'in diziden farkı nedir?", options: ['Sabit boyut', 'Dinamik olarak büyür', 'Sadece string için', 'Sadece int için'], hint: 'Dinamik olarak büyür.' },
      { question: 'Dictionary<K,V> ne saklar?', options: ['Sadece int', 'Anahtar-değer çiftleri', 'Sıralı bir liste', 'Bitler'], hint: 'Key-value.' },
    ],
  },
  'C#-12': {
    en: [
      { question: 'What does polymorphism mean?', options: ['Same interface, different behavior', 'Only one class', 'Creating an array', 'A loop'], hint: 'Via override.' },
      { question: 'What is an abstract class for?', options: ['Direct use', 'A base for inheritance only', 'Static methods', 'It is not an interface'], hint: 'Cannot be instantiated.' },
    ],
    tr: [
      { question: 'Polimorfizm ne anlama gelir?', options: ['Aynı arayüz, farklı davranış', 'Sadece bir sınıf', 'Dizi oluşturmak', 'Döngü'], hint: 'Override ile.' },
      { question: 'Abstract sınıf ne için kullanılır?', options: ['Doğrudan kullanım için', 'Sadece kalıtım için bir temel', 'Static metotlar için', 'Interface değildir'], hint: 'Örneği (instance) oluşturulamaz.' },
    ],
  },
  'C#-13': {
    en: [
      { question: 'What is a delegate?', options: ['A type category', 'A type that holds a reference to a method', 'An interface', 'An array'], hint: 'A method pointer.' },
      { question: 'What kind of delegate is Action<T>?', options: ['Returns something', 'Returns void', 'Returns bool', 'Throws an error'], hint: 'Action → void.' },
    ],
    tr: [
      { question: 'Delegate nedir?', options: ['Bir tip kategorisi', 'Bir metot referansını tutan tip', 'Bir interface', 'Bir dizi'], hint: 'Bir metot işaretçisi.' },
      { question: "Action<T> ne tür bir delegate'tir?", options: ['Bir şey döndürür', 'Void döndürür', 'Bool döndürür', 'Hata fırlatır'], hint: 'Action → void.' },
    ],
  },
  'C#-14': {
    en: [
      { question: 'Why is a generic method useful?', options: ['Same code works for any type', 'Only for int', 'Makes code heavier', 'Recursion'], hint: 'Type parameterized.' },
      { question: 'What does the T : class constraint mean?', options: ['T must be a reference type (class)', 'T must be string only', 'T must be void', 'T must be an interface'], hint: 'A reference-type constraint.' },
    ],
    tr: [
      { question: 'Generic metot neden faydalıdır?', options: ['Her tip için aynı kod', 'Sadece int için', 'Kodu daha ağır yapar', 'Rekürsiyon'], hint: 'Tip parametreli.' },
      { question: 'T : class kısıtlaması ne anlama gelir?', options: ['T mutlaka bir referans tipi (class) olmalıdır', 'T sadece string olmalıdır', 'T void olmalıdır', 'T bir interface olmalıdır'], hint: 'Referans tipi koşulu.' },
    ],
  },
  'C#-15': {
    en: [
      { question: 'What does LINQ Where() do?', options: ['Deletes an element', 'Filters by a condition', 'Sorts', 'Joins'], hint: 'A filter operation.' },
      { question: 'What does LINQ Select() do?', options: ['Deletes', 'Projects/transforms', 'Counts', 'Throws an error'], hint: 'A map operation.' },
    ],
    tr: [
      { question: 'LINQ Where() ne yapar?', options: ['Elemanı siler', 'Bir koşula göre filtreler', 'Sıralar', 'Birleştirir'], hint: 'Bir filtreleme işlemi.' },
      { question: 'LINQ Select() ne yapar?', options: ['Siler', 'Projeksiyon/dönüştürme yapar', 'Sayar', 'Hata fırlatır'], hint: 'Bir map işlemi.' },
    ],
  },
  'C#-16': {
    en: [
      { question: 'What must an async method return?', options: ['void', 'Task or Task<T>', 'int', 'string'], hint: 'Task — an asynchronous operation.' },
      { question: 'What does the await keyword do?', options: ['Blocks the thread', 'Waits for the task to complete', 'Creates a thread', 'Kills a thread'], hint: 'Waits without blocking.' },
    ],
    tr: [
      { question: 'Bir async metot ne döndürmelidir?', options: ['void', 'Task veya Task<T>', 'int', 'string'], hint: 'Task — asenkron bir işlem.' },
      { question: 'await anahtar kelimesi ne yapar?', options: ["Thread'i bloklar", 'Task tamamlanana kadar bekler', 'Bir thread oluşturur', "Thread'i sonlandırır"], hint: 'Bloklamadan bekler.' },
    ],
  },
  'C#-17': {
    en: [
      { question: 'What is the simplest method to read a file?', options: ['File.Read()', 'File.ReadAllText()', 'Stream.Get()', 'IO.Load()'], hint: 'ReadAllText returns the whole file.' },
      { question: 'What is StreamWriter for?', options: ['Reading a file', 'Deleting a file', 'Writing text to a file', 'Compression'], hint: 'Write → to a file.' },
    ],
    tr: [
      { question: 'Bir dosyayı okumanın en basit yöntemi nedir?', options: ['File.Read()', 'File.ReadAllText()', 'Stream.Get()', 'IO.Load()'], hint: 'ReadAllText tüm dosyayı verir.' },
      { question: 'StreamWriter ne için kullanılır?', options: ['Dosya okumak', 'Dosyayı silmek', 'Dosyaya yazı yazmak', 'Sıkıştırma'], hint: 'Write → dosyaya.' },
    ],
  },
  'C#-18': {
    en: [
      { question: 'What is the purpose of the Singleton pattern?', options: ['Multiple instances', 'Only one instance', 'An abstract class', 'Not static'], hint: 'A single instance.' },
      { question: 'What does the Factory pattern do?', options: ['Hides object creation', 'Deletes an object', 'Declares an interface', 'A loop'], hint: 'A creational pattern.' },
    ],
    tr: [
      { question: "Singleton pattern'in amacı nedir?", options: ['Birden fazla örnek (instance)', 'Sadece bir örnek', 'Abstract bir sınıf', 'Static değil'], hint: 'Tek bir instance.' },
      { question: "Factory pattern ne yapar?", options: ['Nesne oluşturmayı gizler', 'Nesneyi siler', 'Bir interface tanımlar', 'Bir döngü'], hint: 'Bir yaratımsal (creational) pattern.' },
    ],
  },
  'C#-19': {
    en: [
      { question: 'What is the condition for binary search?', options: ['The array must be sorted', 'It must be empty', 'Only for strings', 'Never'], hint: 'Halves the search space in a sorted array.' },
      { question: 'What does bubble sort do?', options: ['Halves the array', 'Compares and swaps adjacent elements', 'Hashing', 'Recursion'], hint: 'Compares neighbors.' },
    ],
    tr: [
      { question: 'Binary search için hangi koşul gereklidir?', options: ['Dizi sıralı olmalı', 'Boş olmalı', 'Sadece string için', 'Asla'], hint: 'Sıralı bir dizide arama alanını ikiye böler.' },
      { question: 'Bubble sort ne yapar?', options: ['Diziyi ikiye böler', 'Komşu elemanları karşılaştırıp yer değiştirir', 'Hashleme yapar', 'Rekürsiyon'], hint: 'Komşu elemanları karşılaştırır.' },
    ],
  },
  'C#-20': {
    en: [
      { question: 'Which access modifier can only be accessed from within that same class?', options: ['public', 'protected', 'private', 'internal'], hint: 'Encapsulation → private.' },
      { question: 'Which pattern does IEnumerable<T> support?', options: ['Singleton', 'Iterator', 'Factory', 'Observer'], hint: 'The foreach loop.' },
      { question: 'Where are async void methods used?', options: ['Everywhere', 'Only in event handlers', 'LINQ', 'Constructors'], hint: 'Event handlers are a special case.' },
    ],
    tr: [
      { question: 'Hangi erişim belirleyici sadece o sınıfın içinden çağrılabilir?', options: ['public', 'protected', 'private', 'internal'], hint: 'Encapsulation → private.' },
      { question: "IEnumerable<T> hangi pattern'i destekler?", options: ['Singleton', 'Iterator', 'Factory', 'Observer'], hint: 'foreach döngüsü.' },
      { question: "async void metotlar nerede kullanılır?", options: ['Her yerde', "Sadece event handler'larda", 'LINQ', "Constructor'larda"], hint: 'Event handler özel bir durumdur.' },
    ],
  },

  // ══════════════════════════════ C# — Chapter 2 ══════════════════════════════
  'C#-101': {
    en: [{ question: 'What is the C# 7+ ValueTuple syntax?', options: ['(int, string)', 'Tuple(int, string)', '[int, string]', '{int, string}'], hint: 'The (int x, string y) form.' }],
    tr: [{ question: 'C# 7+ ValueTuple sözdizimi nedir?', options: ['(int, string)', 'Tuple(int, string)', '[int, string]', '{int, string}'], hint: '(int x, string y) biçimi.' }],
  },
  'C#-102': {
    en: [{ question: 'What is the main advantage of a record type?', options: ['Mutable', 'Immutable value semantics', 'No interface', 'Static only'], hint: 'Immutable data.' }],
    tr: [{ question: 'Record tipinin temel avantajı nedir?', options: ['Mutable (değişebilir)', 'Immutable (değişmez) değer semantiği', 'Interface yok', 'Sadece static'], hint: 'Değiştirilemez veri.' }],
  },
  'C#-103': {
    en: [{ question: 'What is the C# 8+ switch expression syntax?', options: ['switch(x) { }', 'x switch { ... }', 'match(x)', 'case(x)'], hint: 'Arrow (=>) on the right.' }],
    tr: [{ question: 'C# 8+ switch expression sözdizimi nedir?', options: ['switch(x) { }', 'x switch { ... }', 'match(x)', 'case(x)'], hint: 'Sağda ok (=>) işareti.' }],
  },
  'C#-104': {
    en: [{ question: 'Why is Span<T> fast?', options: ['It heap-allocates', 'Stored on the stack, no GC overhead', 'It encrypts', 'Parallel'], hint: 'Stack — no GC overhead.' }],
    tr: [{ question: 'Span<T> neden hızlıdır?', options: ["Heap'te tahsis edilir (alloc)", "Stack'te tutulur, GC yükü yoktur", 'Şifreler', 'Paralel çalışır'], hint: 'Stack — GC yükü yok.' }],
  },
  'C#-105': {
    en: [{ question: 'What does string? indicate?', options: ['Always null', 'A string that may be null', 'An empty string', 'An error'], hint: '? → nullable.' }],
    tr: [{ question: 'string? ne anlama gelir?', options: ['Her zaman null', 'Null olabilen bir string', 'Boş bir string', 'Bir hata'], hint: '? → nullable.' }],
  },
  'C#-106': {
    en: [{ question: 'Where is an extension method defined?', options: ['Any class', 'A static class, with a this parameter', 'An abstract class', 'An interface'], hint: 'public static void Foo(this T obj).' }],
    tr: [{ question: 'Extension metot nerede tanımlanır?', options: ['Herhangi bir sınıfta', 'Static bir sınıfta, this parametresiyle', 'Abstract bir sınıfta', "Bir interface'te"], hint: 'public static void Foo(this T obj).' }],
  },
  'C#-107': {
    en: [{ question: 'What are attributes used for?', options: ['A loop', 'Adding metadata', 'An array', 'Type conversion'], hint: 'The [Serializable] example.' }],
    tr: [{ question: "Attribute'lar ne için kullanılır?", options: ['Döngü için', 'Metadata eklemek için', 'Dizi için', 'Tip dönüşümü için'], hint: '[Serializable] örneği.' }],
  },
  'C#-108': {
    en: [{ question: 'What does typeof(T) return?', options: ['A string name', 'A Type object', 'An instance', 'null'], hint: 'A Type metadata object.' }],
    tr: [{ question: 'typeof(T) ne döndürür?', options: ['Bir string ismi', 'Bir Type nesnesi', 'Bir instance', 'null'], hint: 'Bir Type metadata nesnesi.' }],
  },
  'C#-109': {
    en: [{ question: 'What is the main benefit of DI?', options: ['Heavier code', 'Loose coupling', 'Performance', 'Encryption'], hint: 'Reduces dependencies.' }],
    tr: [{ question: "DI'nin temel faydası nedir?", options: ['Daha ağır kod', 'Loose coupling (gevşek bağlılık)', 'Performans', 'Şifreleme'], hint: 'Bağımlılıkları azaltır.' }],
  },
  'C#-110': {
    en: [{ question: 'What does SRP state?', options: ['Multiple responsibilities', 'One responsibility = one class', 'Static only', 'Interface'], hint: 'Single Responsibility.' }],
    tr: [{ question: 'SRP ne belirtir?', options: ['Birden fazla sorumluluk', 'Bir sorumluluk = bir sınıf', 'Sadece static', 'Interface'], hint: 'Single Responsibility (Tek Sorumluluk).' }],
  },
  'C#-111': {
    en: [{ question: 'What does OCP state?', options: ['Everything can be modified', 'Open for extension, closed for modification', 'No inheritance', 'Abstract only'], hint: 'Open for extension.' }],
    tr: [{ question: 'OCP ne belirtir?', options: ['Her şey değiştirilebilir', 'Genişlemeye açık, değişikliğe kapalı', 'Kalıtım yok', 'Sadece abstract'], hint: 'Genişlemeye açık (Open for extension).' }],
  },
  'C#-112': {
    en: [{ question: 'What does LSP state?', options: ['A subclass must be substitutable for its base class', 'Inheritance only', 'Use abstract', 'Delegate'], hint: 'Liskov Substitution.' }],
    tr: [{ question: 'LSP ne belirtir?', options: ['Alt sınıf, temel sınıfın yerine geçebilmelidir', 'Sadece kalıtım', 'Abstract kullanımı', 'Delegate'], hint: 'Liskov Substitution (Yerine Geçme).' }],
  },
  'C#-113': {
    en: [{ question: 'What does ISP recommend?', options: ['Large interfaces', 'Small, specific interfaces', 'All methods in one place', 'Static only'], hint: 'Segregate — split apart.' }],
    tr: [{ question: 'ISP neyi tavsiye eder?', options: ["Büyük interface'ler", "Küçük, spesifik interface'ler", 'Tüm metotlar bir arada', 'Sadece static'], hint: 'Segregate — ayır.' }],
  },
  'C#-114': {
    en: [{ question: 'What does DIP recommend?', options: ['Depend on a concrete class', 'Depend on an abstraction/interface', 'A static class', 'No inheritance'], hint: 'An abstraction layer.' }],
    tr: [{ question: 'DIP neyi tavsiye eder?', options: ['Somut bir sınıfa bağımlılık', "Bir abstraction/interface'e bağımlılık", 'Static bir sınıf', 'Kalıtım yok'], hint: 'Soyutlama (abstraction) katmanı.' }],
  },
  'C#-115': {
    en: [{ question: "What are the A's in the AAA pattern?", options: ['Array-Array-Array', 'Arrange-Act-Assert', 'Add-Apply-Assert', 'Async-Await-Assert'], hint: 'Test structure.' }],
    tr: [{ question: "AAA pattern'indeki A'lar nedir?", options: ['Array-Array-Array', 'Arrange-Act-Assert', 'Add-Apply-Assert', 'Async-Await-Assert'], hint: 'Test yapısı.' }],
  },
  'C#-116': {
    en: [{ question: 'What does the [HttpGet] attribute do?', options: ['A POST request', 'Routes a GET request', 'DELETE', 'PUT'], hint: 'HTTP GET.' }],
    tr: [{ question: "[HttpGet] attribute'u ne yapar?", options: ['Bir POST isteği', 'Bir GET isteğini yönlendirir', 'DELETE', 'PUT'], hint: 'HTTP GET.' }],
  },
  'C#-117': {
    en: [{ question: 'What is Code First?', options: ['Generating a class from the DB', 'Generating the DB from a class', 'SQL only', 'XML'], hint: 'Class → DB.' }],
    tr: [{ question: 'Code First nedir?', options: ["DB'den sınıf oluşturmak", "Sınıftan DB oluşturmak", 'Sadece SQL', 'XML'], hint: 'Sınıf → DB.' }],
  },
  'C#-118': {
    en: [{ question: 'What are the 3 parts of a JWT?', options: ['Header-Payload-Signature', 'User-Pass-Token', 'Key-Value-Salt', 'Start-Body-End'], hint: '3 Base64-encoded parts.' }],
    tr: [{ question: "JWT'nin 3 parçası nedir?", options: ['Header-Payload-Signature', 'User-Pass-Token', 'Key-Value-Salt', 'Start-Body-End'], hint: 'Base64 ile kodlanmış 3 parça.' }],
  },
  'C#-119': {
    en: [{ question: 'What is the advantage of microservices?', options: ['All code in one place', 'Independent deployment', 'Less testing', 'Only one language'], hint: 'Scalability + independence.' }],
    tr: [{ question: 'Mikroservisin avantajı nedir?', options: ['Tüm kod bir arada', 'Bağımsız deployment (dağıtım)', 'Daha az test', 'Sadece tek bir dil'], hint: 'Ölçeklenebilirlik + bağımsızlık.' }],
  },
  'C#-120': {
    en: [
      { question: 'What is the difference between IQueryable and IEnumerable?', options: ['Same', 'IQueryable executes on the DB, IEnumerable in memory', 'IEnumerable is faster', 'There is no difference'], hint: 'Deferred execution.' },
      { question: 'What does a Dependency Injection container do?', options: ['Deletes objects', 'Automatically injects dependencies', 'Creates JWTs', 'Migrates the DB'], hint: 'IoC.' },
    ],
    tr: [
      { question: 'IQueryable ile IEnumerable arasındaki fark nedir?', options: ['Aynı', 'IQueryable veritabanında çalışır, IEnumerable bellekte', 'IEnumerable daha hızlıdır', 'Hiçbir fark yok'], hint: 'Deferred execution (ertelenmiş çalıştırma).' },
      { question: "Dependency Injection container'ı ne yapar?", options: ['Nesneleri siler', 'Bağımlılıkları otomatik olarak enjekte eder', "JWT oluşturur", 'DB migrate eder'], hint: 'IoC (Inversion of Control).' },
    ],
  },

  // ══════════════════════════════ Java — Chapter 1 ══════════════════════════════
  'Java-1': {
    en: [
      { question: 'What is the method to print to the console?', options: ['Console.WriteLine()', 'print()', 'System.out.println()', 'echo()'], hint: 'System.out.println.' },
      { question: "What is Java's entry point?", options: ['start()', 'run()', 'init()', 'public static void main(String[] args)'], hint: 'The main method.' },
    ],
    tr: [
      { question: 'Ekrana çıktı vermek için hangi metot kullanılır?', options: ['Console.WriteLine()', 'print()', 'System.out.println()', 'echo()'], hint: 'System.out.println.' },
      { question: "Java'nın giriş noktası nedir?", options: ['start()', 'run()', 'init()', 'public static void main(String[] args)'], hint: 'main metodu.' },
    ],
  },
  'Java-2': {
    en: [{ question: "What is Java's primitive int type?", options: ['Int', 'INTEGER', 'int', 'integer'], hint: 'Lowercase.' }],
    tr: [{ question: "Java'nın primitif int tipi nedir?", options: ['Int', 'INTEGER', 'int', 'integer'], hint: 'Küçük harfle.' }],
  },
  'Java-3': {
    en: [{ question: 'What is StringBuilder for?', options: ['An immutable string', 'Efficient concatenation', 'An array', 'A file'], hint: 'Fast string appending.' }],
    tr: [{ question: 'StringBuilder ne için kullanılır?', options: ['Değişmez (immutable) bir string', 'Verimli birleştirme', 'Bir dizi', 'Bir dosya'], hint: 'Hızlı string ekleme (append).' }],
  },
  'Java-4': {
    en: [
      { question: 'When does a while loop stop?', options: ['After 10 times', 'When the condition is false', 'When main ends', 'Never'], hint: 'When the condition becomes false.' },
      { question: 'What is for-each ideal for?', options: ['Iterating over a collection', 'An infinite loop', 'Recursion', 'A file'], hint: 'for (T item : col).' },
    ],
    tr: [
      { question: 'while döngüsü ne zaman durur?', options: ['10 kez sonra', 'Koşul false olduğunda', 'main bittiğinde', 'Asla'], hint: 'Koşul false olduğunda.' },
      { question: 'for-each ne için idealdir?', options: ['Bir koleksiyon üzerinde gezinmek için', 'Sonsuz döngü için', 'Rekürsiyon için', 'Dosya için'], hint: 'for (T item : col).' },
    ],
  },
  'Java-5': {
    en: [
      { question: 'An int array with 3 elements?', options: ['int[] arr = {1,2,3};', 'int arr = new int(3);', 'array[3] int;', 'int(3)[] arr;'], hint: 'Curly braces.' },
      { question: 'The length of an array?', options: ['.size', '.length', '.count', '.len'], hint: "Java's .length field." },
    ],
    tr: [
      { question: '3 elemanlı int dizisi?', options: ['int[] arr = {1,2,3};', 'int arr = new int(3);', 'array[3] int;', 'int(3)[] arr;'], hint: 'Küme parantezleri (curly braces).' },
      { question: 'Bir dizinin uzunluğu?', options: ['.size', '.length', '.count', '.len'], hint: "Java'nın .length alanı (field)." },
    ],
  },
  'Java-6': {
    en: [{ question: 'For a new object?', options: ['create', 'new', 'make', 'object'], hint: 'new ClassName().' }],
    tr: [{ question: 'Yeni bir nesne için?', options: ['create', 'new', 'make', 'object'], hint: 'new ClassName().' }],
  },
  'Java-7': {
    en: [{ question: 'Which keyword is used for inheritance?', options: ['implements', 'inherits', 'extends', 'derives'], hint: 'class Dog extends Animal.' }],
    tr: [{ question: 'Kalıtım için hangi anahtar kelime kullanılır?', options: ['implements', 'inherits', 'extends', 'derives'], hint: 'class Dog extends Animal.' }],
  },
  'Java-8': {
    en: [{ question: 'To implement an interface?', options: ['extends', 'implements', 'inherits', 'uses'], hint: 'implements.' }],
    tr: [{ question: 'Bir interface implement etmek için?', options: ['extends', 'implements', 'inherits', 'uses'], hint: 'implements.' }],
  },
  'Java-9': {
    en: [{ question: 'What is needed for a checked exception?', options: ['Only if', 'try-catch or throws', 'import', 'static'], hint: 'It must be handled at compile time.' }],
    tr: [{ question: 'Checked exception için ne gereklidir?', options: ['Sadece if', 'try-catch veya throws', 'import', 'static'], hint: 'Derleme zamanında (compile time) ele alınmalıdır.' }],
  },
  'Java-10': {
    en: [
      { question: 'Which class is a dynamic list?', options: ['Array', 'ArrayList', 'HashSet', 'Stack'], hint: 'java.util.ArrayList.' },
      { question: 'What does HashMap store?', options: ['Only int', 'Key-value pairs', 'An ordered list', 'Bits'], hint: 'Key-value.' },
    ],
    tr: [
      { question: 'Hangi sınıf dinamik bir listedir?', options: ['Array', 'ArrayList', 'HashSet', 'Stack'], hint: 'java.util.ArrayList.' },
      { question: 'HashMap ne saklar?', options: ['Sadece int', 'Anahtar-değer çiftleri', 'Sıralı bir liste', 'Bitler'], hint: 'Key-value.' },
    ],
  },
  'Java-11': {
    en: [{ question: 'What is the main benefit of generics?', options: ['Type-safe with any type', 'Only for int', 'Heavier code', 'Recursion'], hint: 'Type safety + reuse.' }],
    tr: [{ question: "Generics'in temel faydası nedir?", options: ['Her tip ile type-safe olması', 'Sadece int için', 'Daha ağır kod', 'Rekürsiyon'], hint: 'Tip güvenliği (type safety) + yeniden kullanım.' }],
  },
  'Java-12': {
    en: [{ question: 'What does Stream.filter() do?', options: ['Sorts', 'Filters', 'Computes', 'Joins'], hint: 'Filters with a predicate.' }],
    tr: [{ question: 'Stream.filter() ne yapar?', options: ['Sıralar', 'Filtreler', 'Hesaplar', 'Birleştirir'], hint: 'Bir predicate ile filtreler.' }],
  },
  'Java-13': {
    en: [{ question: 'What is the lambda syntax?', options: ['() -> {}', 'lambda() {}', 'fn() {}', 'def() {}'], hint: '() -> expression.' }],
    tr: [{ question: 'Lambda sözdizimi nedir?', options: ['() -> {}', 'lambda() {}', 'fn() {}', 'def() {}'], hint: '() -> expression.' }],
  },
  'Java-14': {
    en: [{ question: 'Why is Optional used?', options: ['For arrays', 'To protect against NullPointerException', 'Performance', 'Encryption'], hint: 'Null safety.' }],
    tr: [{ question: 'Optional neden kullanılır?', options: ['Diziler için', "NullPointerException'dan korunmak için", 'Performans için', 'Şifreleme için'], hint: 'Null güvenliği (null safety).' }],
  },
  'Java-15': {
    en: [{ question: 'To create a thread?', options: ['new Process()', 'new Thread(runnable)', 'Task.run()', 'fork()'], hint: 'new Thread(r).start().' }],
    tr: [{ question: 'Bir thread oluşturmak için?', options: ['new Process()', 'new Thread(runnable)', 'Task.run()', 'fork()'], hint: 'new Thread(r).start().' }],
  },
  'Java-16': {
    en: [{ question: 'What does the Builder pattern do?', options: ['Deletes an object', 'Constructs a complex object step by step', 'Declares an interface', 'Recursion'], hint: 'Step-by-step construction.' }],
    tr: [{ question: 'Builder pattern ne yapar?', options: ['Bir nesneyi siler', 'Karmaşık bir nesneyi adım adım oluşturur', 'Bir interface tanımlar', 'Rekürsiyon'], hint: 'Adım adım oluşturma (construction).' }],
  },
  'Java-17': {
    en: [{ question: 'Why use PreparedStatement?', options: ["It's fast, protects against SQL injection", 'Only for SELECT', 'Reads files', 'Thread safe'], hint: 'Security + performance.' }],
    tr: [{ question: 'PreparedStatement neden kullanılır?', options: ["Hızlıdır, SQL injection'a karşı korur", 'Sadece SELECT için', 'Dosya okur', "Thread safe'tir"], hint: 'Güvenlik + performans.' }],
  },
  'Java-18': {
    en: [{ question: 'What does @Autowired do?', options: ['Creates a method', 'Automatically injects a dependency', 'Connects to a DB', 'Writes logs'], hint: 'Dependency Injection.' }],
    tr: [{ question: '@Autowired ne yapar?', options: ['Bir metot oluşturur', 'Bağımlılığı otomatik olarak enjekte eder', "DB'ye bağlanır", 'Log yazar'], hint: 'Dependency Injection.' }],
  },
  'Java-19': {
    en: [{ question: 'What does @RestController combine?', options: ['@Component + @RequestMapping', '@Controller + @ResponseBody', '@Service + @Repository', '@Bean + @Config'], hint: '@Controller + @ResponseBody.' }],
    tr: [{ question: '@RestController hangi ikisini birleştirir?', options: ['@Component + @RequestMapping', '@Controller + @ResponseBody', '@Service + @Repository', '@Bean + @Config'], hint: '@Controller + @ResponseBody.' }],
  },
  'Java-20': {
    en: [
      { question: 'HashMap is not thread-safe. Use instead?', options: ['HashMap', 'ConcurrentHashMap', 'LinkedList', 'Stack'], hint: 'The concurrent package.' },
      { question: 'What does Stream.collect(Collectors.toList()) return?', options: ['Set', 'List', 'Map', 'Optional'], hint: 'A List collector.' },
    ],
    tr: [
      { question: 'HashMap thread-safe değildir. Onun yerine?', options: ['HashMap', 'ConcurrentHashMap', 'LinkedList', 'Stack'], hint: 'Concurrent paketi.' },
      { question: 'Stream.collect(Collectors.toList()) ne döndürür?', options: ['Set', 'List', 'Map', 'Optional'], hint: 'Bir List collector.' },
    ],
  },

  // ══════════════════════════════ Java — Chapter 2 ══════════════════════════════
  'Java-101': {
    en: [{ question: 'What does a record class generate automatically?', options: ['toString, equals, hashCode, getters', 'Only toString', 'Setters', 'No constructor'], hint: 'Reduces boilerplate.' }],
    tr: [{ question: 'Bir record sınıfı otomatik olarak neyi oluşturur?', options: ['toString, equals, hashCode, getters', 'Sadece toString', 'Setterlar', 'Constructor yok'], hint: 'Boilerplate kodu azaltır.' }],
  },
  'Java-102': {
    en: [{ question: 'What does a sealed class restrict?', options: ['Number of methods', 'Defines the allowed subclasses', 'Number of fields', 'Imports'], hint: 'The permits keyword.' }],
    tr: [{ question: 'sealed class neyi kısıtlar?', options: ['Metot sayısını', 'İzin verilen alt sınıfları belirler', 'Alan (field) sayısını', "Import'ları"], hint: 'permits anahtar kelimesi.' }],
  },
  'Java-103': {
    en: [{ question: 'What character does a text block start with?', options: ['"""', "'''", '##', '`'], hint: 'Three double quotes.' }],
    tr: [{ question: 'Bir text block hangi karakterle başlar?', options: ['"""', "'''", '##', '`'], hint: 'Üç çift tırnak işareti.' }],
  },
  'Java-104': {
    en: [{ question: 'What does a switch expression return?', options: ['void', 'A value (expression result)', 'null', 'An exception'], hint: 'yield or arrow.' }],
    tr: [{ question: 'Bir switch expression ne döndürür?', options: ['void', 'Bir değer (expression sonucu)', 'null', 'Bir exception'], hint: 'yield veya ok (arrow) işareti.' }],
  },
  'Java-105': {
    en: [{ question: 'What is the advantage of a virtual thread?', options: ['Heavy', 'Lighter than platform threads, huge numbers of them', 'Only for I/O', 'GUI'], hint: 'Millions of threads.' }],
    tr: [{ question: "Sanal (virtual) thread'in avantajı nedir?", options: ['Ağırdır', "Platform thread'lerinden daha hafiftir, çok sayıda oluşturulabilir", 'Sadece I/O için', 'GUI için'], hint: 'Milyonlarca thread.' }],
  },
  'Java-106': {
    en: [{ question: 'What does thenApply() do?', options: ['Catches an error', 'Applies a function to the result', 'Creates a thread', 'Connects to a DB'], hint: 'For mapping.' }],
    tr: [{ question: 'thenApply() ne yapar?', options: ['Bir hatayı yakalar', 'Sonuca bir fonksiyon uygular', 'Bir thread oluşturur', "DB'ye bağlanır"], hint: 'Map işlemi için.' }],
  },
  'Java-107': {
    en: [{ question: 'What does the @Test annotation indicate?', options: ['A main method', 'A test method', 'A constructor', 'A static method'], hint: 'A JUnit test.' }],
    tr: [{ question: "@Test annotation'ı neyi belirtir?", options: ['Bir main metodu', 'Bir test metodu', 'Bir constructor', 'Bir static metot'], hint: 'Bir JUnit testi.' }],
  },
  'Java-108': {
    en: [{ question: 'What does Mockito.mock() create?', options: ['A real object', 'A fake/simulated object', 'A class', 'An interface'], hint: 'A test double.' }],
    tr: [{ question: 'Mockito.mock() ne oluşturur?', options: ['Gerçek bir nesne', 'Sahte/simüle edilmiş bir nesne', 'Bir sınıf', 'Bir interface'], hint: 'Bir test double (sahte nesne).' }],
  },
  'Java-109': {
    en: [{ question: 'What is a Maven dependency?', options: ['An external library dependency', 'A class', 'A method', 'A thread'], hint: 'Written in pom.xml.' }],
    tr: [{ question: 'Bir Maven dependency (bağımlılık) nedir?', options: ['Harici bir kütüphane bağımlılığı', 'Bir sınıf', 'Bir metot', 'Bir thread'], hint: 'pom.xml içinde yazılır.' }],
  },
  'Java-110': {
    en: [{ question: 'What is the role of an API Gateway?', options: ['Stores the DB', 'Routes all requests through a single entry point', 'Renders the UI', 'Writes tests'], hint: 'Single entry point.' }],
    tr: [{ question: "API Gateway'in rolü nedir?", options: ["DB'yi saklar", 'Tüm istekleri tek bir noktadan yönlendirir', 'UI render eder', 'Test yazar'], hint: 'Tek giriş noktası (single entry point).' }],
  },
  'Java-111': {
    en: [{ question: 'What is a Kafka Topic?', options: ['A database', 'A category/channel of messages', 'An HTTP endpoint', 'A thread'], hint: 'A message category.' }],
    tr: [{ question: 'Kafka Topic nedir?', options: ['Bir veritabanı', 'Mesajların kategorisi/kanalı', 'Bir HTTP endpoint', 'Bir thread'], hint: 'Mesaj kategorisi.' }],
  },
  'Java-112': {
    en: [{ question: 'What does the Dockerfile FROM directive do?', options: ['Copies a file', 'Defines the base image', 'Opens a port', 'Runs'], hint: 'Base image.' }],
    tr: [{ question: 'Dockerfile FROM direktifi ne yapar?', options: ['Bir dosyayı kopyalar', "Temel (base) image'ı belirler", 'Bir port açar', 'Çalıştırır (run)'], hint: 'Temel image (base image).' }],
  },
  'Java-113': {
    en: [{ question: 'What is the advantage of GraphQL?', options: ['Heavier', 'Request exactly the data you need', 'GET only', 'No caching'], hint: 'No overfetching/underfetching.' }],
    tr: [{ question: "GraphQL'in avantajı nedir?", options: ['Daha ağırdır', 'Tam olarak ihtiyacınız olan veriyi talep edersiniz', 'Sadece GET', 'Cache yoktur'], hint: 'Overfetching/underfetching (fazla/eksik veri çekme) yoktur.' }],
  },
  'Java-114': {
    en: [{ question: 'Authentication vs Authorization?', options: ['The same thing', 'Auth = who you are, Authz = what you are allowed to do', 'Auth = password', 'Authz = password'], hint: 'Who vs what.' }],
    tr: [{ question: 'Authentication vs Authorization?', options: ['Aynı şey', 'Auth = kim olduğun, Authz = neye izinli olduğun', 'Auth = şifre', 'Authz = şifre'], hint: 'Kim vs ne.' }],
  },
  'Java-115': {
    en: [{ question: 'Why is caching used?', options: ['To slow down operations', 'To keep frequently used data in RAM', 'To delete the DB', 'To create threads'], hint: 'Performance.' }],
    tr: [{ question: 'Cache (önbellek) neden kullanılır?', options: ['İşlemi yavaşlatmak için', "Sık kullanılan veriyi RAM'de tutmak için", "DB'yi silmek için", 'Thread oluşturmak için'], hint: 'Performans.' }],
  },
  'Java-116': {
    en: [{ question: 'What is the role of a load balancer?', options: ['A database', 'Distributes requests across servers', 'Compiles code', 'Encrypts'], hint: 'Traffic distribution.' }],
    tr: [{ question: "Load balancer'ın rolü nedir?", options: ['Bir veritabanı', 'İstekleri sunucular arasında dağıtır', 'Kod derler', 'Şifreler'], hint: 'Trafik dağıtımı.' }],
  },
  'Java-117': {
    en: [{ question: 'What does distributed tracing do?', options: ['Deletes code', "Tracks a request's path across all services", 'Backs up the DB', 'Only stores logs'], hint: 'Trace ID.' }],
    tr: [{ question: 'Distributed tracing ne yapar?', options: ['Kodu siler', 'Bir isteğin tüm servisler boyunca izini takip eder', 'DB yedeklemesi yapar', 'Sadece log tutar'], hint: 'Trace ID.' }],
  },
  'Java-118': {
    en: [{ question: 'How is state stored in Event Sourcing?', options: ['Only the final state', 'As a sequence of all events', 'A DB snapshot', 'XML'], hint: 'Replay events.' }],
    tr: [{ question: "Event Sourcing'de state nasıl saklanır?", options: ['Sadece son durum', 'Tüm olayların sırasıyla', "Bir DB snapshot'ı", 'XML'], hint: 'Olayları yeniden oynatma (replay).' }],
  },
  'Java-119': {
    en: [{ question: 'What does the GC (Garbage Collector) do?', options: ['Encrypts', 'Automatically frees unused memory', 'Creates threads', 'Connects to a DB'], hint: 'Automatic memory management.' }],
    tr: [{ question: 'GC (Garbage Collector) ne yapar?', options: ['Şifreler', 'Kullanılmayan belleği otomatik olarak serbest bırakır', 'Thread oluşturur', "DB'ye bağlanır"], hint: 'Otomatik bellek yönetimi.' }],
  },
  'Java-120': {
    en: [
      { question: 'What does the CAP theorem state?', options: ['You can only choose 2 of the 3', 'All 3 are always possible', 'Only for Java', 'REST vs SOAP'], hint: 'Consistency, Availability, Partition tolerance.' },
      { question: 'What is CQRS?', options: ['Command Query Responsibility Segregation', 'Java keyword', 'Thread pattern', 'Annotation'], hint: 'Read/Write separation.' },
    ],
    tr: [
      { question: 'CAP teoremi ne belirtir?', options: ["3'ten sadece 2'si seçilebilir", "Her zaman 3'ü de mümkündür", 'Sadece Java için', 'REST vs SOAP'], hint: 'Consistency, Availability, Partition tolerance.' },
      { question: 'CQRS nedir?', options: ['Command Query Responsibility Segregation', 'Java keyword', 'Thread pattern', 'Annotation'], hint: 'Read/Write (okuma/yazma) ayrımı.' },
    ],
  },

  // ══════════════════════════════ Python — Chapter 1 ══════════════════════════════
  'Python-1': {
    en: [
      { question: 'How to print to the console?', options: ['echo()', 'Console.WriteLine()', 'System.out.println()', 'print()'], hint: 'print("Hello").' },
      { question: 'What is the comment symbol?', options: ['//', '/* */', '#', '--'], hint: 'The # symbol.' },
    ],
    tr: [
      { question: 'Ekrana çıktı vermek için?', options: ['echo()', 'Console.WriteLine()', 'System.out.println()', 'print()'], hint: 'print("Merhaba").' },
      { question: 'Yorum satırı sembolü nedir?', options: ['//', '/* */', '#', '--'], hint: '# sembolü.' },
    ],
  },
  'Python-2': {
    en: [{ question: 'How is a variable created in Python?', options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'], hint: 'No type declaration needed.' }],
    tr: [{ question: "Python'da bir değişken nasıl oluşturulur?", options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'], hint: 'Tip bildirimine gerek yoktur.' }],
  },
  'Python-3': {
    en: [
      { question: 'What does "hello".upper() return?', options: ['hello', 'HELLO', 'Hello', 'Error'], hint: 'All letters uppercase.' },
      { question: 'What is an f-string for?', options: ['A file', 'Embedding variables', 'A function', 'A loop'], hint: 'f"Hello {name}".' },
    ],
    tr: [
      { question: '"hello".upper() ne döndürür?', options: ['hello', 'HELLO', 'Hello', 'Hata'], hint: 'Tüm harfler büyük.' },
      { question: 'f-string ne için kullanılır?', options: ['Bir dosya için', 'Değişken gömmek için', 'Bir fonksiyon için', 'Döngü için'], hint: 'f"Merhaba {name}".' },
    ],
  },
  'Python-4': {
    en: [
      { question: 'What is the list syntax?', options: ['{ }', '( )', '[ ]', '< >'], hint: 'Square brackets.' },
      { question: 'To add an element to the end?', options: ['add()', 'push()', 'append()', 'insert_last()'], hint: 'append().' },
    ],
    tr: [
      { question: 'Liste sözdizimi nedir?', options: ['{ }', '( )', '[ ]', '< >'], hint: 'Köşeli parantezler.' },
      { question: 'Sona bir eleman eklemek için?', options: ['add()', 'push()', 'append()', 'insert_last()'], hint: 'append().' },
    ],
  },
  'Python-5': {
    en: [
      { question: 'How many iterations does range(5) give?', options: ['4', '5', '6', '0'], hint: '0..4, 5 total.' },
      { question: 'To stop while True?', options: ['stop', 'break', 'exit', 'end'], hint: 'break.' },
    ],
    tr: [
      { question: 'range(5) kaç iterasyon yapar?', options: ['4', '5', '6', '0'], hint: '0..4, toplam 5.' },
      { question: "while True'yu durdurmak için?", options: ['stop', 'break', 'exit', 'end'], hint: 'break.' },
    ],
  },
  'Python-6': {
    en: [
      { question: 'What is the keyword for a function?', options: ['function', 'def', 'fn', 'func'], hint: 'def my_func().' },
      { question: 'To return a value?', options: ['return', 'give', 'output', 'yield'], hint: 'return.' },
    ],
    tr: [
      { question: 'Fonksiyon için hangi anahtar kelime kullanılır?', options: ['function', 'def', 'fn', 'func'], hint: 'def my_func().' },
      { question: 'Bir değer döndürmek için?', options: ['return', 'give', 'output', 'yield'], hint: 'return.' },
    ],
  },
  'Python-7': {
    en: [{ question: 'What is Python elif?', options: ['else if', 'error if', 'end if', 'each if'], hint: 'A shorthand for else if.' }],
    tr: [{ question: "Python'da elif nedir?", options: ['else if', 'error if', 'end if', 'each if'], hint: "else if'in kısaltmasıdır." }],
  },
  'Python-8': {
    en: [{ question: 'What is dict syntax?', options: ['[]', '{}', '()', '<>'], hint: '{"key": "value"}.' }],
    tr: [{ question: 'Dict sözdizimi nedir?', options: ['[]', '{}', '()', '<>'], hint: '{"key": "value"}.' }],
  },
  'Python-9': {
    en: [{ question: 'Can a tuple be modified?', options: ['Yes', 'No — it is immutable', 'Only the first element', 'Always'], hint: 'Immutable.' }],
    tr: [{ question: 'Bir tuple değiştirilebilir mi?', options: ['Evet', 'Hayır — immutable (değişmez)', 'Sadece ilk eleman', 'Her zaman'], hint: 'Immutable (değişmez).' }],
  },
  'Python-10': {
    en: [{ question: 'What is a characteristic of a set?', options: ['Ordered', 'No duplicates', 'Indexed', 'Not mutable'], hint: 'Unique elements.' }],
    tr: [{ question: "Bir set'in özelliği nedir?", options: ['Sıralıdır', 'Yinelenen (duplicate) eleman yoktur', 'İndekslidir', 'Mutable değildir'], hint: 'Benzersiz (unique) elemanlar.' }],
  },
  'Python-11': {
    en: [
      { question: 'What is the keyword for a class?', options: ['class', 'struct', 'object', 'type'], hint: 'class MyClass:.' },
      { question: 'What is the constructor method?', options: ['__init__', '__main__', '__start__', '__new__'], hint: '__init__(self).' },
    ],
    tr: [
      { question: 'Sınıf için hangi anahtar kelime kullanılır?', options: ['class', 'struct', 'object', 'type'], hint: 'class MyClass:.' },
      { question: 'Constructor metodu hangisidir?', options: ['__init__', '__main__', '__start__', '__new__'], hint: '__init__(self).' },
    ],
  },
  'Python-12': {
    en: [{ question: 'What is inheritance syntax?', options: ['class Dog(Animal):', 'class Dog extends Animal:', 'class Dog : Animal', 'class Dog implements Animal'], hint: 'The base class in parentheses.' }],
    tr: [{ question: 'Kalıtım sözdizimi nedir?', options: ['class Dog(Animal):', 'class Dog extends Animal:', 'class Dog : Animal', 'class Dog implements Animal'], hint: 'Temel sınıf parantez içinde.' }],
  },
  'Python-13': {
    en: [{ question: 'What does a decorator do?', options: ['Deletes a variable', 'Attaches extra behavior to a function', 'Creates a class', 'Imports'], hint: 'The @decorator pattern.' }],
    tr: [{ question: 'Bir decorator ne yapar?', options: ['Bir değişkeni siler', 'Bir fonksiyona ek davranış ekler', 'Bir sınıf oluşturur', 'Import eder'], hint: "@decorator pattern'i." }],
  },
  'Python-14': {
    en: [{ question: 'What does the yield keyword do?', options: ['Returns a value and pauses', 'Deletes', 'Import', 'Exception'], hint: 'Preserves generator state.' }],
    tr: [{ question: 'yield anahtar kelimesi ne yapar?', options: ['Bir değer döndürür ve duraklar', 'Siler', 'Import', 'Exception'], hint: "Generator'ın durumunu (state) korur." }],
  },
  'Python-15': {
    en: [{ question: 'What does [x*2 for x in range(3)] give?', options: ['[0,2,4]', '[1,2,3]', '[2,4,6]', 'Error'], hint: 'x=0,1,2 → x*2.' }],
    tr: [{ question: '[x*2 for x in range(3)] ne verir?', options: ['[0,2,4]', '[1,2,3]', '[2,4,6]', 'Hata'], hint: 'x=0,1,2 → x*2.' }],
  },
  'Python-16': {
    en: [{ question: 'To read a file?', options: ['file.open()', 'open(f, "r")', 'read(f)', 'File.get()'], hint: 'open() + "r" mode.' }],
    tr: [{ question: 'Bir dosyayı okumak için?', options: ['file.open()', 'open(f, "r")', 'read(f)', 'File.get()'], hint: 'open() + "r" modu.' }],
  },
  'Python-17': {
    en: [{ question: 'How to import a module?', options: ['include', 'import', 'using', 'require'], hint: 'import math.' }],
    tr: [{ question: 'Bir modül nasıl import edilir?', options: ['include', 'import', 'using', 'require'], hint: 'import math.' }],
  },
  'Python-18': {
    en: [{ question: 'To catch an error?', options: ['try-catch', 'try-except', 'try-handle', 'catch'], hint: 'Python: except.' }],
    tr: [{ question: 'Bir hatayı yakalamak için?', options: ['try-catch', 'try-except', 'try-handle', 'catch'], hint: 'Python: except.' }],
  },
  'Python-19': {
    en: [{ question: 'How must a pytest test function be named?', options: ['Starts with test_', '@Test annotation', 'A JUnit method', 'unittest.main()'], hint: 'test_ prefix.' }],
    tr: [{ question: 'Bir pytest test fonksiyonu nasıl adlandırılmalıdır?', options: ['test_ ile başlamalı', "@Test annotation'ı", 'Bir JUnit metodu', 'unittest.main()'], hint: 'test_ ön eki (prefix).' }],
  },
  'Python-20': {
    en: [
      { question: 'What are __dunder__ methods for?', options: ['Hidden methods', 'Magic methods for overriding operators', 'Only for print', 'Import'], hint: 'Like __str__, __add__.' },
      { question: 'What is the GIL (Global Interpreter Lock)?', options: ['Encryption', 'Only one thread executes Python bytecode at a time', 'GC', 'A module'], hint: 'CPython thread limitation.' },
    ],
    tr: [
      { question: '__dunder__ metotlar ne için kullanılır?', options: ['Gizli metotlar', 'Operatörleri override etmek için sihirli (magic) metotlar', 'Sadece print için', 'Import için'], hint: '__str__, __add__ gibi.' },
      { question: 'GIL (Global Interpreter Lock) nedir?', options: ['Şifreleme', 'Aynı anda sadece bir thread Python bytecode çalıştırır', 'GC', 'Bir modül'], hint: "CPython'ın thread sınırlaması." },
    ],
  },

  // ══════════════════════════════ Python — Chapter 2 ══════════════════════════════
  'Python-101': {
    en: [{ question: 'What does an async function return?', options: ['int', 'Coroutine', 'str', 'None'], hint: 'A coroutine object.' }],
    tr: [{ question: 'Bir async fonksiyon ne döndürür?', options: ['int', 'Coroutine', 'str', 'None'], hint: 'Bir coroutine nesnesi.' }],
  },
  'Python-102': {
    en: [{ question: 'What is the purpose of type hints?', options: ['Enforces types', 'Documents code, aids the IDE', 'Performance', 'Encryption'], hint: 'Static analysis.' }],
    tr: [{ question: "Type hint'lerin amacı nedir?", options: ['Tipi zorunlu kılar', "Kodu belgeler, IDE'ye yardımcı olur", 'Performans', 'Şifreleme'], hint: 'Statik analiz.' }],
  },
  'Python-103': {
    en: [{ question: 'What does @dataclass generate?', options: ['Only __init__', '__init__, __repr__, __eq__ automatically', 'An abstract class', 'An interface'], hint: 'Reduces boilerplate.' }],
    tr: [{ question: '@dataclass ne oluşturur?', options: ['Sadece __init__', '__init__, __repr__, __eq__ otomatik olarak', 'Abstract bir sınıf', "Bir interface"], hint: 'Boilerplate kodu azaltır.' }],
  },
  'Python-104': {
    en: [{ question: 'What does the with statement ensure?', options: ['A loop', 'Proper opening and closing of a resource', 'Encryption', 'Import'], hint: 'The RAII pattern.' }],
    tr: [{ question: 'with ifadesi neyi sağlar?', options: ['Bir döngü', 'Bir kaynağın düzgün açılıp kapatılması', 'Şifreleme', 'Import'], hint: "RAII pattern'i." }],
  },
  'Python-105': {
    en: [{ question: 'What is the class of classes in Python?', options: ['object', 'type', 'meta', 'class'], hint: 'type — the default metaclass.' }],
    tr: [{ question: "Python'da sınıfların sınıfı hangisidir?", options: ['object', 'type', 'meta', 'class'], hint: 'type — varsayılan metaclass.' }],
  },
  'Python-106': {
    en: [{ question: 'What does @property do?', options: ['Makes a method behave like a field', 'Reads a file', 'Creates a thread', 'Import'], hint: 'A getter pattern.' }],
    tr: [{ question: '@property ne yapar?', options: ['Bir metodu sahte bir alan (field) gibi gösterir', 'Bir dosya okur', 'Bir thread oluşturur', 'Import'], hint: "Getter pattern'i." }],
  },
  'Python-107': {
    en: [{ question: 'Why is a NumPy ndarray faster than a list?', options: ['Python code', 'Implemented in C, contiguous memory', 'No GIL', 'Async'], hint: 'A contiguous C array.' }],
    tr: [{ question: 'NumPy ndarray, listeden neden daha hızlıdır?', options: ['Python kodu olduğu için', 'C ile implement edildiği, bitişik (contiguous) bellek', 'GIL olmadığı için', 'Async olduğu için'], hint: 'Bitişik (contiguous) bir C dizisi.' }],
  },
  'Python-108': {
    en: [{ question: 'What is a DataFrame?', options: ['A list', 'A 2D table-like data structure', 'A dict', 'A set'], hint: 'Rows + columns.' }],
    tr: [{ question: 'DataFrame nedir?', options: ['Bir liste', 'İki boyutlu, tablo benzeri bir veri yapısı', 'Bir dict', 'Bir set'], hint: 'Satırlar + sütunlar.' }],
  },
  'Python-109': {
    en: [{ question: 'What does train_test_split do?', options: ['Deletes the model', 'Splits data into training/test sets', 'Normalizes', 'Plots'], hint: 'An ML best practice.' }],
    tr: [{ question: 'train_test_split ne yapar?', options: ['Modeli siler', 'Veriyi eğitim/test setlerine böler', 'Normalize eder', 'Grafik çizer'], hint: 'Bir ML en iyi uygulaması (best practice).' }],
  },
  'Python-110': {
    en: [{ question: 'What does FastAPI automatically generate?', options: ['DB schema', 'OpenAPI/Swagger docs', 'Unit tests', 'Docker'], hint: 'The /docs endpoint.' }],
    tr: [{ question: 'FastAPI otomatik olarak neyi oluşturur?', options: ['DB şeması', 'OpenAPI/Swagger dokümantasyonu', 'Unit test', 'Docker'], hint: "/docs endpoint'i." }],
  },
  'Python-111': {
    en: [{ question: 'What is a SQLAlchemy session?', options: ['An HTTP session', 'A unit of work for DB operations', 'A thread', 'A cache'], hint: 'The unit-of-work pattern.' }],
    tr: [{ question: 'SQLAlchemy session nedir?', options: ["Bir HTTP session'u", 'DB işlemleri için bir unit of work', 'Bir thread', 'Bir cache'], hint: "Unit of work pattern'i." }],
  },
  'Python-112': {
    en: [{ question: 'What is a Celery broker?', options: ['A DB', 'A message queue that passes tasks (Redis/RabbitMQ)', 'A web server', 'An ORM'], hint: 'A message broker.' }],
    tr: [{ question: 'Celery broker nedir?', options: ['Bir DB', 'Görevleri (task) ileten bir mesaj kuyruğu (Redis/RabbitMQ)', 'Bir web server', 'Bir ORM'], hint: 'Bir mesaj aracısı (message broker).' }],
  },
  'Python-113': {
    en: [{ question: 'What does requirements.txt do?', options: ['Deletes code', 'Keeps a list of dependencies', 'A Docker image', 'Server config'], hint: 'pip install -r requirements.txt.' }],
    tr: [{ question: 'requirements.txt ne yapar?', options: ['Kodu siler', 'Bağımlılık listesini tutar', "Bir Docker image'ı", 'Sunucu yapılandırması'], hint: 'pip install -r requirements.txt.' }],
  },
  'Python-114': {
    en: [{ question: 'What does monkeypatch do?', options: ['Deletes a class', 'Temporarily replaces an object during a test', 'Import', 'Async'], hint: 'Test isolation.' }],
    tr: [{ question: 'monkeypatch ne yapar?', options: ['Bir sınıfı siler', 'Test sırasında bir nesneyi geçici olarak değiştirir', 'Import', 'Async'], hint: 'Test izolasyonu.' }],
  },
  'Python-115': {
    en: [{ question: 'What does CI do?', options: ['Encrypts', 'Automatically builds + tests code', 'Migrates the DB', 'Deploy only'], hint: 'Continuous Integration.' }],
    tr: [{ question: 'CI ne yapar?', options: ['Şifreler', 'Kodu otomatik olarak build eder + test eder', "DB'yi migrate eder", 'Sadece deploy eder'], hint: 'Continuous Integration (Sürekli Entegrasyon).' }],
  },
  'Python-116': {
    en: [{ question: 'How does WebSocket differ from HTTP?', options: ['The same', 'A persistent bidirectional connection', 'GET only', 'Stateless'], hint: 'Full-duplex.' }],
    tr: [{ question: "WebSocket'in HTTP'den farkı nedir?", options: ['Aynı', 'Kalıcı, çift yönlü (bidirectional) bir bağlantı', 'Sadece GET', 'Stateless (durumsuz)'], hint: 'Full-duplex (tam çift yönlü).' }],
  },
  'Python-117': {
    en: [{ question: 'What does Pydantic do?', options: ['DB ORM', 'Data validation + serialization', 'Web server', 'Async'], hint: 'A data validation library.' }],
    tr: [{ question: 'Pydantic ne yapar?', options: ['DB ORM', 'Veri doğrulama + serialization', 'Web server', 'Async'], hint: 'Bir veri doğrulama kütüphanesi.' }],
  },
  'Python-118': {
    en: [{ question: 'What is LangChain for?', options: ['Game development', 'Building chains/agents with LLMs', 'Web design', 'DB migration'], hint: 'LLM orchestration.' }],
    tr: [{ question: 'LangChain ne için kullanılır?', options: ['Oyun geliştirme', "LLM'ler ile chain/agent oluşturmak", 'Web tasarımı', "DB migrate etmek"], hint: 'LLM orkestrasyon.' }],
  },
  'Python-119': {
    en: [{ question: 'What is horizontal scaling?', options: ['Upgrade the server', 'Add more servers', 'Cache', 'A DB index'], hint: 'Scale out.' }],
    tr: [{ question: 'Horizontal scaling (yatay ölçekleme) nedir?', options: ['Sunucuyu güçlendirmek', 'Daha fazla sunucu eklemek', 'Cache', 'DB index'], hint: 'Scale out (dışa doğru ölçekleme).' }],
  },
  'Python-120': {
    en: [
      { question: 'What is an event loop?', options: ['A thread pool', 'A mechanism that executes asynchronous tasks in sequence', 'GC', 'The import system'], hint: 'The core of asyncio.' },
      { question: 'What does the Python GIL prevent?', options: ['Asynchronous code', 'Multiple threads executing Python bytecode in parallel at the same time', 'Import', 'A decorator'], hint: 'True parallelism in CPython.' },
    ],
    tr: [
      { question: 'Event loop nedir?', options: ['Bir thread havuzu', 'Asenkron görevleri sırayla çalıştıran bir mekanizma', 'GC', 'Import sistemi'], hint: "asyncio'nun çekirdeği." },
      { question: 'Python GIL neyi engeller?', options: ['Asenkron kodu', "Birden fazla thread'in aynı anda paralel Python bytecode çalıştırmasını", 'Import', 'Bir decorator'], hint: "CPython'da gerçek paralellik." },
    ],
  },
};

export function translateChallenges(track, questId, language, fallbackChallenges) {
  const entry = CHALLENGE_TRANSLATIONS[`${track}-${questId}`]?.[language];
  if (!entry) return fallbackChallenges;
  return fallbackChallenges.map((original, i) => {
    const t = entry[i];
    if (!t) return original;
    return { ...original, question: t.question, options: t.options, hint: t.hint };
  });
}
