// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER METADATA — drives the multi-map chapter selector
// ─────────────────────────────────────────────────────────────────────────────
export const CHAPTER_META = {
  'C#': [
    { index: 0, title: 'Fəsil 1: Əsaslar',       subtitle: 'Dəyişənlər, Döngülər, Massivlər',   icon: '📦', color: '#8b5cf6' },
    { index: 1, title: 'Fəsil 2: OOP & İrəliləmiş', subtitle: 'Siniflər, LINQ, Generics',          icon: '🏛️', color: '#06b6d4' },
  ],
  Java: [
    { index: 0, title: 'Fəsil 1: Əsaslar',       subtitle: 'Sintaksis, OOP, Kolleksiyalar',      icon: '☕', color: '#f59e0b' },
    { index: 1, title: 'Fəsil 2: İrəliləmiş',     subtitle: 'Generics, Streams, Patterns',        icon: '⚙️', color: '#22c55e' },
  ],
  Python: [
    { index: 0, title: 'Fəsil 1: Əsaslar',       subtitle: 'Print, Siyahılar, Funksiyalar',      icon: '🐍', color: '#22c55e' },
    { index: 1, title: 'Fəsil 2: İrəliləmiş',     subtitle: 'OOP, Dekorator, Async',              icon: '🚀', color: '#ec4899' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// C# — CHAPTER 1 (20 levels, IDs 1–20)
// ─────────────────────────────────────────────────────────────────────────────
export const initialQuestsCSharp = [
  {
    id: 1, levelName: 'Level 1: Variables', title: 'C# Dəyişənlər və Tiplər', topic: 'Variables',
    icon: '📦', difficulty: 'Asan', xpReward: 100, goldReward: 50, isCodingQuest: true,
    description: 'C# proqramlaşma dilində ən çox istifadə olunan dəyişən tipləri.',
    challenges: [
      { question: 'C# dilində tam ədədləri saxlamaq üçün hansı tip?', options: ['double', 'char', 'int', 'string'], correctIndex: 2, hint: 'Integer → int.' },
      { question: 'Məntiqi dəyər (true/false) saxlayan tip?', options: ['bool', 'string', 'float', 'char'], correctIndex: 0, hint: 'bool — Boolean.' },
    ]
  },
  {
    id: 2, levelName: 'Level 2: Loops', title: 'Döngülər', topic: 'Loops',
    icon: '🔄', difficulty: 'Orta', xpReward: 150, goldReward: 75, isCodingQuest: true,
    description: 'for, while və do-while döngülərinin işləmə məntiqini anlayın.',
    challenges: [
      { question: 'for (int i=0; i<5; i++) neçə dəfə işləyəcək?', options: ['4', '5', '6', 'Sonsuz'], correctIndex: 1, hint: 'i=0..4, cəmi 5 dəfə.' },
      { question: 'Hansı döngü ən azı 1 dəfə işləyir?', options: ['for', 'while', 'do-while', 'foreach'], correctIndex: 2, hint: 'Şərt blokdan sonra.' },
    ]
  },
  {
    id: 3, levelName: 'Level 3: Arrays', title: 'Massivlər', topic: 'Arrays',
    icon: '📊', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true,
    description: 'Massivlər yaratmaq, indeksləmək, üzərindən gəzmək.',
    challenges: [
      { question: '5 elementli int massivi?', options: ['int[] arr = new int[5];', 'int arr = new int(5);', 'array int arr = 5;', 'int[5] arr;'], correctIndex: 0, hint: 'new int[5].' },
      { question: 'Massivin ilk elementi?', options: ['arr[1]', 'arr[0]', 'arr[-1]', 'arr.first'], correctIndex: 1, hint: 'Sıfırdan başlayır.' },
    ]
  },
  {
    id: 4, levelName: 'Level 4: Strings', title: 'String Əməliyyatları', topic: 'Strings',
    icon: '📝', difficulty: 'Asan', xpReward: 120, goldReward: 60, isCodingQuest: true,
    description: 'String birləşdirmə, uzunluq, alt sətir əməliyyatları.',
    challenges: [
      { question: 'String uzunluğu üçün?', options: ['.size', '.count', '.Length', '.len()'], correctIndex: 2, hint: 'C#-da Length property-si.' },
      { question: '"Salam" + " Dünya" nə verir?', options: ['Salam Dünya', 'Salam+Dünya', 'Xəta', 'null'], correctIndex: 0, hint: '+ operatoru birləşdirmə edir.' },
    ]
  },
  {
    id: 5, levelName: 'Level 5: Methods', title: 'Metodlar', topic: 'Methods',
    icon: '⚡', difficulty: 'Orta', xpReward: 160, goldReward: 80, isCodingQuest: true,
    description: 'C# metodlarının parametrləri, dönüş tipləri, overloading.',
    challenges: [
      { question: 'Heç nə qaytarmayan metodun return tipi?', options: ['null', 'void', 'empty', 'none'], correctIndex: 1, hint: 'void — geri dönüşsüz.' },
      { question: 'Metod overloading nədir?', options: ['Eyni ad, fərqli parametr', 'Eyni parametr, fərqli ad', 'Rekursiya', 'Həmişə static'], correctIndex: 0, hint: 'Eyni ad, fərqli imza.' },
    ]
  },
  {
    id: 6, levelName: 'Level 6: Conditionals', title: 'Şərt Operatorları', topic: 'Conditionals',
    icon: '🔀', difficulty: 'Asan', xpReward: 110, goldReward: 55, isCodingQuest: true,
    description: 'if, else if, else, switch-case konstruksiyaları.',
    challenges: [
      { question: 'if-else if zəncirində ilk doğru şərt tapılanda?', options: ['Hamısı icra', 'Yalnız o blok, qalanı atlanır', 'Xəta', 'Sonsuz döngü'], correctIndex: 1, hint: 'Yalnız bir branch.' },
      { question: 'switch case-də break olmasa?', options: ['Xəta', 'Növbəti case-ə keçir', 'İcra dayanır', 'null'], correctIndex: 1, hint: 'Fall-through baş verir.' },
    ]
  },
  {
    id: 7, levelName: 'Level 7: OOP Basics', title: 'OOP Əsasları', topic: 'OOP',
    icon: '🏛️', difficulty: 'Çətin', xpReward: 250, goldReward: 120, isCodingQuest: true,
    description: 'Siniflər, obyektlər, konstruktorlar.',
    challenges: [
      { question: 'Yeni obyekt yaratmaq üçün açar söz?', options: ['class', 'create', 'new', 'this'], correctIndex: 2, hint: 'new konstruktor çağırır.' },
      { question: 'Hansı prinsip məlumatı gizlədır?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correctIndex: 2, hint: 'Encapsulation — kapsul.' },
    ]
  },
  {
    id: 8, levelName: 'Level 8: Inheritance', title: 'Varislik', topic: 'Inheritance',
    icon: '👑', difficulty: 'Çətin', xpReward: 220, goldReward: 110, isCodingQuest: true,
    description: 'C#-da sinif varisliyi, base keyword, method override.',
    challenges: [
      { question: 'Varislik almaq üçün simvol?', options: [':', '->', 'extends', 'implements'], correctIndex: 0, hint: 'class Dog : Animal.' },
      { question: 'Base sinif metodunu çağırmaq üçün?', options: ['super()', 'base()', 'parent()', 'root()'], correctIndex: 1, hint: 'C#-da base açar sözü.' },
    ]
  },
  {
    id: 9, levelName: 'Level 9: Interfaces', title: 'İnterfeyslər', topic: 'Interfaces',
    icon: '🔌', difficulty: 'Çətin', xpReward: 240, goldReward: 120, isCodingQuest: true,
    description: 'Interface təyini, implement edilməsi, çoxlu interfeyslik.',
    challenges: [
      { question: 'Interface metodlarının standart gövdəsi?', options: ['Var', 'Yoxdur (abstract)', 'Həmişə virtual', 'Yalnız static'], correctIndex: 1, hint: 'Abstract by default.' },
      { question: 'Bir sinif neçə interface implement edə bilər?', options: ['1', '2', '3', 'Sınırsız'], correctIndex: 3, hint: 'C# çoxlu interface dəstəkləyir.' },
    ]
  },
  {
    id: 10, levelName: 'Level 10: Exceptions', title: 'İstisna İdarəsi', topic: 'Exceptions',
    icon: '⚠️', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true,
    description: 'try-catch-finally, custom exception, throw keyword.',
    challenges: [
      { question: 'Xətaları tutmaq üçün blok?', options: ['catch-try', 'try-catch', 'error-handle', 'finally'], correctIndex: 1, hint: 'try → catch.' },
      { question: 'finally bloku nə zaman işləyir?', options: ['Yalnız xəta olduqda', 'Həmişə', 'Yalnız uğurlu', 'Heç vaxt'], correctIndex: 1, hint: 'Həmişə icra olunur.' },
    ]
  },
  {
    id: 11, levelName: 'Level 11: Collections', title: 'List və Dictionary', topic: 'Collections',
    icon: '📋', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true,
    description: 'List<T>, Dictionary<K,V>, Queue, Stack.',
    challenges: [
      { question: 'List<T> massivdən fərqi?', options: ['Sabit ölçü', 'Dinamik böyümə', 'Yalnız string', 'Yalnız int'], correctIndex: 1, hint: 'Dinamik böyüyür.' },
      { question: 'Dictionary<K,V> nə saxlayır?', options: ['Yalnız int', 'Açar-dəyər cütü', 'Sıralı siyahı', 'Bitlər'], correctIndex: 1, hint: 'Key-value.' },
    ]
  },
  {
    id: 12, levelName: 'Level 12: Polymorphism', title: 'Polimorfizm', topic: 'OOP',
    icon: '🌀', difficulty: 'Çətin', xpReward: 260, goldReward: 130, isCodingQuest: true,
    description: 'virtual/override, runtime polimorfizm, abstract siniflər.',
    challenges: [
      { question: 'Polimorfizm nə deməkdir?', options: ['Eyni interfeys, fərqli davranış', 'Yalnız bir sinif', 'Massiv yaratmaq', 'Döngü'], correctIndex: 0, hint: 'Override ilə.' },
      { question: 'Abstract sinif nə üçün?', options: ['Birbaşa istifadə', 'Yalnız miras üçün baza', 'Static metodlar', 'Interface deyil'], correctIndex: 1, hint: 'Instansiya yaradıla bilməz.' },
    ]
  },
  {
    id: 13, levelName: 'Level 13: Delegates', title: 'Delegatlar & Events', topic: 'Delegates',
    icon: '📡', difficulty: 'Çətin', xpReward: 270, goldReward: 135, isCodingQuest: true,
    description: 'Delegate tipləri, event sistemi, callback pattern.',
    challenges: [
      { question: 'Delegate nədir?', options: ['Tip növü', 'Metod referansını saxlayan tip', 'Interface', 'Massiv'], correctIndex: 1, hint: 'Metod işarəçisi.' },
      { question: 'Action<T> nə növ delegate?', options: ['Nəsə qaytarır', 'Void qaytarır', 'Bool qaytarır', 'Xəta atır'], correctIndex: 1, hint: 'Action → void.' },
    ]
  },
  {
    id: 14, levelName: 'Level 14: Generics', title: 'Generics', topic: 'Generics',
    icon: '🧬', difficulty: 'Çətin', xpReward: 280, goldReward: 140, isCodingQuest: true,
    description: 'Generic siniflər, metodlar, constraints.',
    challenges: [
      { question: 'Generic metod nə üçün faydalıdır?', options: ['Hər tip üçün eyni kod', 'Yalnız int', 'Daha ağır kod', 'Recursiya'], correctIndex: 0, hint: 'Tip parametrli.' },
      { question: 'T : class constraint nə məna daşıyır?', options: ['T mütləq sinif olmalıdır', 'T yalnız string', 'T void', 'T interface'], correctIndex: 0, hint: 'Referans tip şərti.' },
    ]
  },
  {
    id: 15, levelName: 'Level 15: LINQ', title: 'LINQ Sorğuları', topic: 'LINQ',
    icon: '🔍', difficulty: 'Çətin', xpReward: 300, goldReward: 150, isCodingQuest: true,
    description: 'LINQ query syntax, lambda, Where/Select/OrderBy.',
    challenges: [
      { question: 'LINQ Where() nə edir?', options: ['Elementi silir', 'Şərtə görə filtrləyir', 'Sıralayır', 'Birləşdirir'], correctIndex: 1, hint: 'Filter əməliyyatı.' },
      { question: 'LINQ Select() nə edir?', options: ['Silir', 'Proeksiya/dönüşüm', 'Sayır', 'Xəta atır'], correctIndex: 1, hint: 'Map əməliyyatı.' },
    ]
  },
  {
    id: 16, levelName: 'Level 16: Async/Await', title: 'Asinxron Proqramlaşdırma', topic: 'Async',
    icon: '⏳', difficulty: 'Çətin', xpReward: 310, goldReward: 155, isCodingQuest: true,
    description: 'Task, async/await, asinxron metodlar.',
    challenges: [
      { question: 'async metod mütləq nə qaytarmalıdır?', options: ['void', 'Task və ya Task<T>', 'int', 'string'], correctIndex: 1, hint: 'Task — asinxron əməliyyat.' },
      { question: 'await açar sözü nə edir?', options: ['Blok edir', 'Task tamamlanana gözləyir', 'İplik yaradır', 'İpliyi öldürür'], correctIndex: 1, hint: 'Gözləmə - blok etmədən.' },
    ]
  },
  {
    id: 17, levelName: 'Level 17: File I/O', title: 'Fayl Əməliyyatları', topic: 'FileIO',
    icon: '💾', difficulty: 'Orta', xpReward: 210, goldReward: 105, isCodingQuest: true,
    description: 'File.Read/Write, StreamReader, StreamWriter.',
    challenges: [
      { question: 'Faylı oxumaq üçün ən sadə metod?', options: ['File.Read()', 'File.ReadAllText()', 'Stream.Get()', 'IO.Load()'], correctIndex: 1, hint: 'ReadAllText bütün faylı verir.' },
      { question: 'StreamWriter nə üçün?', options: ['Fayl oxumaq', 'Faylı silmək', 'Faylə yazı yazmaq', 'Sıkıştırma'], correctIndex: 2, hint: 'Write → fayla.' },
    ]
  },
  {
    id: 18, levelName: 'Level 18: Patterns', title: 'Design Patterns', topic: 'Patterns',
    icon: '🧩', difficulty: 'Çətin', xpReward: 320, goldReward: 160, isCodingQuest: true,
    description: 'Singleton, Factory, Observer pattern əsasları.',
    challenges: [
      { question: 'Singleton patternin məqsədi?', options: ['Çoxlu nüsxə', 'Yalnız bir nüsxə', 'Abstract sinif', 'Static deyil'], correctIndex: 1, hint: 'Tək instansiya.' },
      { question: 'Factory pattern nə edir?', options: ['Obyekt yaradılmasını gizlədir', 'Obyekti silir', 'Interface bildirir', 'Döngü'], correctIndex: 0, hint: 'Creational pattern.' },
    ]
  },
  {
    id: 19, levelName: 'Level 19: Algorithms', title: 'Alqoritmlər', topic: 'Algorithms',
    icon: '🧠', difficulty: 'Çətin', xpReward: 330, goldReward: 165, isCodingQuest: true,
    description: 'Linear search, Binary search, Bubble sort.',
    challenges: [
      { question: 'Binary search üçün şərt?', options: ['Massiv sıralı olmalı', 'Boş olmalı', 'Yalnız string', 'Heç vaxt'], correctIndex: 0, hint: 'Sıralı massivdə yarıya bölür.' },
      { question: 'Bubble sort nə edir?', options: ['Yarıya bölür', 'Qonşu elementləri müqayisə edib dəyişir', 'Hash', 'Rekursiya'], correctIndex: 1, hint: 'Qonşu müqayisə.' },
    ]
  },
  {
    id: 20, levelName: 'Level 20: Final Boss', title: 'Ən Böyük Sınaq 🏆', topic: 'Mixed',
    icon: '🏆', difficulty: 'Çətin', xpReward: 500, goldReward: 250, isCodingQuest: true,
    description: 'Bütün öyrəndiklərinizi bu son sınaqda birləşdirin!',
    challenges: [
      { question: 'Hansı access modifier yalnız həmin sinifin daxilindən çağırılır?', options: ['public', 'protected', 'private', 'internal'], correctIndex: 2, hint: 'Encapsulation → private.' },
      { question: 'IEnumerable<T> hansı pattern-i dəstəkləyir?', options: ['Singleton', 'Iterator', 'Factory', 'Observer'], correctIndex: 1, hint: 'foreach döngüsü.' },
      { question: 'async void metodlar harada istifadə olunur?', options: ['Hər yerdə', 'Yalnız event handler-lərdə', 'LINQ', 'Konstruktor'], correctIndex: 1, hint: 'Event handler xüsusi haldır.' },
    ]
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// C# — CHAPTER 2 (20 levels, IDs 101–120)
// ─────────────────────────────────────────────────────────────────────────────
export const initialQuestsCSharpCh2 = [
  { id: 101, levelName: 'Level 1: Tuples', title: 'Tuple & ValueTuple', topic: 'Tuples', icon: '🎯', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'Çoxlu dəyər qaytarmaq üçün Tuple istifadəsi.', challenges: [{ question: 'C# 7+ ValueTuple sintaksisi?', options: ['(int, string)', 'Tuple(int, string)', '[int, string]', '{int, string}'], correctIndex: 0, hint: '(int x, string y) forması.' }] },
  { id: 102, levelName: 'Level 2: Records', title: 'Record Types', topic: 'Records', icon: '📄', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true, description: 'C# 9 record tipləri, immutability.', challenges: [{ question: 'Record tipinin əsas üstünlüyü?', options: ['Mutable', 'Immutable dəyər semantikası', 'Interface yoxdur', 'Yalnız static'], correctIndex: 1, hint: 'Dəyişdirilməz məlumat.' }] },
  { id: 103, levelName: 'Level 3: Pattern Match', title: 'Pattern Matching', topic: 'Patterns', icon: '🎭', difficulty: 'Çətin', xpReward: 230, goldReward: 115, isCodingQuest: true, description: 'switch expression, is pattern, when guard.', challenges: [{ question: 'C# 8+ switch expression sintaksisi?', options: ['switch(x) { }', 'x switch { ... }', 'match(x)', 'case(x)'], correctIndex: 1, hint: 'Sağda arrow (=>).' }] },
  { id: 104, levelName: 'Level 4: Span<T>', title: 'Span<T> & Memory', topic: 'Memory', icon: '⚙️', difficulty: 'Çətin', xpReward: 260, goldReward: 130, isCodingQuest: true, description: 'Stack-allocated Span, yaddaş effektivliyi.', challenges: [{ question: 'Span<T> niyə sürətlidir?', options: ['Heap alloc edir', 'Stack-də saxlanır, GC yoxdur', 'Şifrələyir', 'Paralel'], correctIndex: 1, hint: 'Stack — GC yükü yoxdur.' }] },
  { id: 105, levelName: 'Level 5: Nullable', title: 'Nullable Reference Types', topic: 'Nullable', icon: '❓', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true, description: 'Nullable annotation, null-safety.', challenges: [{ question: 'string? nə bildirir?', options: ['Həmişə null', 'Null ola bilən string', 'Boş string', 'Xəta'], correctIndex: 1, hint: '? → nullable.' }] },
  { id: 106, levelName: 'Level 6: Extension Methods', title: 'Extension Metodlar', topic: 'ExtensionMethods', icon: '🔧', difficulty: 'Orta', xpReward: 210, goldReward: 105, isCodingQuest: true, description: 'Mövcud tiplərə yeni metodlar əlavə etmək.', challenges: [{ question: 'Extension metod harada təyin olunur?', options: ['Hərhansı sinif', 'Static sinif, this parametr ilə', 'Abstract sinif', 'Interface'], correctIndex: 1, hint: 'public static void Foo(this T obj).' }] },
  { id: 107, levelName: 'Level 7: Attributes', title: 'Atributlar', topic: 'Attributes', icon: '🏷️', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true, description: 'Custom attribute, reflection ilə metadata oxuma.', challenges: [{ question: 'Atributlar nə üçün istifadə olunur?', options: ['Döngü', 'Metadata əlavə etmək', 'Massiv', 'Tip dönüşümü'], correctIndex: 1, hint: '[Serializable] nümunəsi.' }] },
  { id: 108, levelName: 'Level 8: Reflection', title: 'Refleksiya', topic: 'Reflection', icon: '🔭', difficulty: 'Çətin', xpReward: 270, goldReward: 135, isCodingQuest: true, description: 'Runtime-da tip məlumatı oxuma, dinamik çağırış.', challenges: [{ question: 'typeof(T) nə qaytarır?', options: ['String adı', 'Type obyekti', 'Instance', 'null'], correctIndex: 1, hint: 'Type metadata obyekti.' }] },
  { id: 109, levelName: 'Level 9: DI Pattern', title: 'Dependency Injection', topic: 'DI', icon: '💉', difficulty: 'Çətin', xpReward: 280, goldReward: 140, isCodingQuest: true, description: 'Constructor injection, IoC container.', challenges: [{ question: 'DI-nin əsas faydası?', options: ['Daha ağır kod', 'Loose coupling', 'Performans', 'Şifrələmə'], correctIndex: 1, hint: 'Asılılıqları azaldır.' }] },
  { id: 110, levelName: 'Level 10: SOLID-S', title: 'SOLID: Single Responsibility', topic: 'SOLID', icon: '🧱', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: 'SRP — bir sinif yalnız bir məsuliyyət daşıyır.', challenges: [{ question: 'SRP nə bildirir?', options: ['Çoxlu məsuliyyət', 'Bir məsuliyyət = bir sinif', 'Static yalnız', 'Interface'], correctIndex: 1, hint: 'Single Responsibility.' }] },
  { id: 111, levelName: 'Level 11: SOLID-O', title: 'SOLID: Open/Closed', topic: 'SOLID', icon: '🔒', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: 'OCP — genişlənməyə açıq, dəyişikliyə qapalı.', challenges: [{ question: 'OCP nə bildirir?', options: ['Hər şey dəyişdirilə bilər', 'Genişlənməyə açıq, dəyişkliyə qapalı', 'Miras yoxdur', 'Abstract yalnız'], correctIndex: 1, hint: 'Open for extension.' }] },
  { id: 112, levelName: 'Level 12: SOLID-L', title: 'SOLID: Liskov', topic: 'SOLID', icon: '🔄', difficulty: 'Çətin', xpReward: 300, goldReward: 150, isCodingQuest: true, description: 'LSP — alt sinif, baza sinifi yerini almalıdır.', challenges: [{ question: 'LSP nə bildirir?', options: ['Alt sinif baza ilə əvəz oluna bilməlidir', 'Yalnız miras', 'Abstract istifadə', 'Delegat'], correctIndex: 0, hint: 'Liskov Substitution.' }] },
  { id: 113, levelName: 'Level 13: SOLID-I', title: 'SOLID: Interface Segregation', topic: 'SOLID', icon: '✂️', difficulty: 'Çətin', xpReward: 300, goldReward: 150, isCodingQuest: true, description: 'ISP — böyük interfeyslər kiçiltmək.', challenges: [{ question: 'ISP nəyi tövsiyə edir?', options: ['Böyük interfeysler', 'Kiçik, spesifik interfeyslər', 'Bütün metodlar bir yerdə', 'Static yalnız'], correctIndex: 1, hint: 'Segregate — ayır.' }] },
  { id: 114, levelName: 'Level 14: SOLID-D', title: 'SOLID: Dependency Inversion', topic: 'SOLID', icon: '🔃', difficulty: 'Çətin', xpReward: 310, goldReward: 155, isCodingQuest: true, description: 'DIP — abstraksiyalara etibar et, konkretlərə yox.', challenges: [{ question: 'DIP nə tövsiyə edir?', options: ['Konkret sinifə asılılıq', 'Abstract/interface-ə asılılıq', 'Static sinif', 'Miras yox'], correctIndex: 1, hint: 'Abstrakt qat.' }] },
  { id: 115, levelName: 'Level 15: Unit Testing', title: 'Unit Test Əsasları', topic: 'Testing', icon: '🧪', difficulty: 'Orta', xpReward: 220, goldReward: 110, isCodingQuest: true, description: 'xUnit, Arrange-Act-Assert pattern.', challenges: [{ question: 'AAA pattern-in A-ları?', options: ['Array-Array-Array', 'Arrange-Act-Assert', 'Add-Apply-Assert', 'Async-Await-Assert'], correctIndex: 1, hint: 'Test quruluşu.' }] },
  { id: 116, levelName: 'Level 16: ASP.NET Intro', title: 'ASP.NET Core Giriş', topic: 'ASPNET', icon: '🌐', difficulty: 'Çətin', xpReward: 320, goldReward: 160, isCodingQuest: true, description: 'Controller, Route, IActionResult.', challenges: [{ question: '[HttpGet] attribute nə edir?', options: ['POST sorğusu', 'GET sorğusunu marşrutlaşdırır', 'DELETE', 'PUT'], correctIndex: 1, hint: 'HTTP GET.' }] },
  { id: 117, levelName: 'Level 17: Entity Framework', title: 'Entity Framework Core', topic: 'EF', icon: '🗄️', difficulty: 'Çətin', xpReward: 330, goldReward: 165, isCodingQuest: true, description: 'DbContext, Code First, Migration.', challenges: [{ question: 'Code First nədir?', options: ['DB-dən sinif', 'Sinifdən DB yaratmaq', 'SQL only', 'XML'], correctIndex: 1, hint: 'Sinif → DB.' }] },
  { id: 118, levelName: 'Level 18: JWT Auth', title: 'JWT Authentication', topic: 'Auth', icon: '🔑', difficulty: 'Çətin', xpReward: 340, goldReward: 170, isCodingQuest: true, description: 'JSON Web Token, Bearer token, Claims.', challenges: [{ question: 'JWT-nin 3 hissəsi?', options: ['Header-Payload-Signature', 'User-Pass-Token', 'Key-Value-Salt', 'Start-Body-End'], correctIndex: 0, hint: 'Base64 kodlanmış 3 hissə.' }] },
  { id: 119, levelName: 'Level 19: Microservices', title: 'Mikroxidmət Arxitekturası', topic: 'Microservices', icon: '🔬', difficulty: 'Çətin', xpReward: 360, goldReward: 180, isCodingQuest: true, description: 'Monolith vs Microservice, API Gateway.', challenges: [{ question: 'Mikroxidmətin üstünlüyü?', options: ['Bütün kod bir yerdə', 'Müstəqil deployment', 'Daha az test', 'Yalnız bir dil'], correctIndex: 1, hint: 'Scalability + independence.' }] },
  { id: 120, levelName: 'Level 20: C# Master 🏆', title: 'C# Ustası Sınağı 🏆', topic: 'Mixed', icon: '🚀', difficulty: 'Çətin', xpReward: 600, goldReward: 300, isCodingQuest: true, description: 'Bütün Fəsil 2 biliklərinin son imtahanı!', challenges: [{ question: 'IQueryable vs IEnumerable fərqi?', options: ['Eyni', 'IQueryable DB-də icra, IEnumerable yaddaşda', 'IEnumerable sürətli', 'Heç fərq yoxdur'], correctIndex: 1, hint: 'Deferred execution.' }, { question: 'Dependency Injection konteyner nə edir?', options: ['Obyekt silir', 'Asılılıqları avtomatik inject edir', 'JWT yaradır', 'DB migrate'], correctIndex: 1, hint: 'IoC.' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// JAVA — CHAPTER 1 (20 levels, IDs 1–20)
// ─────────────────────────────────────────────────────────────────────────────
export const initialQuestsJava = [
  { id: 1, levelName: 'Level 1: Java Basics', title: 'Java Giriş', topic: 'Basics', icon: '☕', difficulty: 'Asan', xpReward: 100, goldReward: 50, isCodingQuest: true, description: 'Sintaksis, Hello World.', challenges: [{ question: 'Ekrana çıxış metodu?', options: ['Console.WriteLine()', 'print()', 'System.out.println()', 'echo()'], correctIndex: 2, hint: 'System.out.println.' }, { question: 'Java giriş nöqtəsi?', options: ['start()', 'run()', 'init()', 'public static void main(String[] args)'], correctIndex: 3, hint: 'main metodu.' }] },
  { id: 2, levelName: 'Level 2: Variables', title: 'Dəyişənlər', topic: 'Variables', icon: '📦', difficulty: 'Asan', xpReward: 110, goldReward: 55, isCodingQuest: true, description: 'Primitiv tiplər, dəyişən bəyanı.', challenges: [{ question: 'Java primitiv int tipi?', options: ['Int', 'INTEGER', 'int', 'integer'], correctIndex: 2, hint: 'Kiçik hərflə.' }] },
  { id: 3, levelName: 'Level 3: Strings', title: 'String İşləmə', topic: 'Strings', icon: '📝', difficulty: 'Asan', xpReward: 120, goldReward: 60, isCodingQuest: true, description: 'String metodları, birləşdirmə.', challenges: [{ question: 'StringBuilder nə üçün?', options: ['Sabit string', 'Effektiv birləşdirmə', 'Massiv', 'Fayl'], correctIndex: 1, hint: 'Sürətli string append.' }] },
  { id: 4, levelName: 'Level 4: Loops', title: 'Döngülər', topic: 'Loops', icon: '🔄', difficulty: 'Orta', xpReward: 140, goldReward: 70, isCodingQuest: true, description: 'for, while, do-while, foreach.', challenges: [{ question: 'while döngüsü nə vaxt dayanır?', options: ['10 dəfə', 'Şərt false', 'main bitir', 'Heç vaxt'], correctIndex: 1, hint: 'Şərt false olduqda.' }, { question: 'for-each nə üçün idealdır?', options: ['Kolleksiya üzərində', 'Sonsuz döngü', 'Rekursiya', 'Fayl'], correctIndex: 0, hint: 'for (T item : col).' }] },
  { id: 5, levelName: 'Level 5: Arrays', title: 'Massivlər', topic: 'Arrays', icon: '📊', difficulty: 'Orta', xpReward: 150, goldReward: 75, isCodingQuest: true, description: 'Massiv yaratma, gəzmə.', challenges: [{ question: '3 elementli int massiv?', options: ['int[] arr = {1,2,3};', 'int arr = new int(3);', 'array[3] int;', 'int(3)[] arr;'], correctIndex: 0, hint: 'Fiqurlu mötərizə.' }, { question: 'Massivin uzunluğu?', options: ['.size', '.length', '.count', '.len'], correctIndex: 1, hint: 'Java .length field.' }] },
  { id: 6, levelName: 'Level 6: OOP Basics', title: 'Sinif və Obyekt', topic: 'OOP', icon: '🏛️', difficulty: 'Orta', xpReward: 160, goldReward: 80, isCodingQuest: true, description: 'Sinif, konstruktor, instansiya.', challenges: [{ question: 'Yeni obyekt üçün?', options: ['create', 'new', 'make', 'object'], correctIndex: 1, hint: 'new ClassName().' }] },
  { id: 7, levelName: 'Level 7: Inheritance', title: 'Miras Alma', topic: 'Inheritance', icon: '👑', difficulty: 'Orta', xpReward: 170, goldReward: 85, isCodingQuest: true, description: 'extends, super, method override.', challenges: [{ question: 'Miras üçün açar söz?', options: ['implements', 'inherits', 'extends', 'derives'], correctIndex: 2, hint: 'class Dog extends Animal.' }] },
  { id: 8, levelName: 'Level 8: Interfaces', title: 'İnterfeyslər', topic: 'Interfaces', icon: '🔌', difficulty: 'Orta', xpReward: 175, goldReward: 88, isCodingQuest: true, description: 'Interface, implement, default method.', challenges: [{ question: 'Interface implement etmək üçün?', options: ['extends', 'implements', 'inherits', 'uses'], correctIndex: 1, hint: 'implements.' }] },
  { id: 9, levelName: 'Level 9: Exceptions', title: 'İstisna İdarəsi', topic: 'Exceptions', icon: '⚠️', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'try-catch, checked/unchecked exceptions.', challenges: [{ question: 'Checked exception üçün nə lazım?', options: ['Yalnız if', 'try-catch və ya throws', 'import', 'static'], correctIndex: 1, hint: 'Compile zamanı tutulmalıdır.' }] },
  { id: 10, levelName: 'Level 10: Collections', title: 'Kolleksiyalar', topic: 'Collections', icon: '📋', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true, description: 'ArrayList, HashMap, LinkedList.', challenges: [{ question: 'Dinamik siyahı sinfi?', options: ['Array', 'ArrayList', 'HashSet', 'Stack'], correctIndex: 1, hint: 'java.util.ArrayList.' }, { question: 'HashMap nə saxlayır?', options: ['Yalnız int', 'Açar-dəyər', 'Sıralı siyahı', 'Bitlər'], correctIndex: 1, hint: 'Key-value.' }] },
  { id: 11, levelName: 'Level 11: Generics', title: 'Generics', topic: 'Generics', icon: '🧬', difficulty: 'Çətin', xpReward: 220, goldReward: 110, isCodingQuest: true, description: 'Generic tip parametrləri, bounded type.', challenges: [{ question: 'Generics əsas faydası?', options: ['Hər tip ilə type-safe', 'Yalnız int', 'Ağır kod', 'Rekursiya'], correctIndex: 0, hint: 'Type safety + reuse.' }] },
  { id: 12, levelName: 'Level 12: Streams', title: 'Java Streams API', topic: 'Streams', icon: '🌊', difficulty: 'Çətin', xpReward: 240, goldReward: 120, isCodingQuest: true, description: 'Stream filter/map/collect, lambda.', challenges: [{ question: 'Stream.filter() nə edir?', options: ['Sıralayır', 'Filtrləyir', 'Hesablayır', 'Birləşdirir'], correctIndex: 1, hint: 'Predicate ilə filter.' }] },
  { id: 13, levelName: 'Level 13: Lambda', title: 'Lambda İfadələri', topic: 'Lambda', icon: '⚡', difficulty: 'Çətin', xpReward: 250, goldReward: 125, isCodingQuest: true, description: 'Lambda syntax, functional interface.', challenges: [{ question: 'Lambda sintaksisi?', options: ['() -> {}', 'lambda() {}', 'fn() {}', 'def() {}'], correctIndex: 0, hint: '() -> expression.' }] },
  { id: 14, levelName: 'Level 14: Optionals', title: 'Optional<T>', topic: 'Optionals', icon: '❓', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true, description: 'Null-safe dəyər, Optional.of, orElse.', challenges: [{ question: 'Optional niyə istifadə olunur?', options: ['Massiv üçün', 'NullPointerException-dan qorunmaq', 'Performans', 'Şifrələmə'], correctIndex: 1, hint: 'Null safety.' }] },
  { id: 15, levelName: 'Level 15: Threads', title: 'Çoxlu İplik (Multithreading)', topic: 'Threads', icon: '🧵', difficulty: 'Çətin', xpReward: 270, goldReward: 135, isCodingQuest: true, description: 'Thread, Runnable, synchronized.', challenges: [{ question: 'Thread yaratmaq üçün?', options: ['new Process()', 'new Thread(runnable)', 'Task.run()', 'fork()'], correctIndex: 1, hint: 'new Thread(r).start().' }] },
  { id: 16, levelName: 'Level 16: Design Patterns', title: 'Design Patterns', topic: 'Patterns', icon: '🧩', difficulty: 'Çətin', xpReward: 280, goldReward: 140, isCodingQuest: true, description: 'Singleton, Factory, Builder, Strategy.', challenges: [{ question: 'Builder pattern nə edir?', options: ['Obyekti silir', 'Mürəkkəb obyekt addım-addım qurur', 'Interface bildirir', 'Rekursiya'], correctIndex: 1, hint: 'Step-by-step construction.' }] },
  { id: 17, levelName: 'Level 17: JDBC', title: 'JDBC & Verilənlər Bazası', topic: 'JDBC', icon: '🗄️', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: 'Connection, PreparedStatement, ResultSet.', challenges: [{ question: 'PreparedStatement niyə?', options: ['Sürətlidir, SQL injection qarşı qoruyur', 'Yalnız SELECT', 'Fayl oxuyur', 'Thread safe'], correctIndex: 0, hint: 'Security + performance.' }] },
  { id: 18, levelName: 'Level 18: Spring Basics', title: 'Spring Framework Giriş', topic: 'Spring', icon: '🌱', difficulty: 'Çətin', xpReward: 310, goldReward: 155, isCodingQuest: true, description: '@Component, @Autowired, IoC container.', challenges: [{ question: '@Autowired nə edir?', options: ['Metod yaradır', 'Asılılığı avtomatik inject edir', 'DB connect', 'Log yazır'], correctIndex: 1, hint: 'Dependency Injection.' }] },
  { id: 19, levelName: 'Level 19: Spring Boot', title: 'Spring Boot REST API', topic: 'SpringBoot', icon: '🌐', difficulty: 'Çətin', xpReward: 330, goldReward: 165, isCodingQuest: true, description: '@RestController, @GetMapping, ResponseEntity.', challenges: [{ question: '@RestController nə birləşdirir?', options: ['@Component + @RequestMapping', '@Controller + @ResponseBody', '@Service + @Repository', '@Bean + @Config'], correctIndex: 1, hint: '@Controller + @ResponseBody.' }] },
  { id: 20, levelName: 'Level 20: Java Master 🏆', title: 'Java Ustası Sınağı 🏆', topic: 'Mixed', icon: '🏆', difficulty: 'Çətin', xpReward: 600, goldReward: 300, isCodingQuest: true, description: 'Java Ch1 biliklərinin son imtahanı!', challenges: [{ question: 'HashMap thread-safe deyil. Əvəzinə?', options: ['HashMap', 'ConcurrentHashMap', 'LinkedList', 'Stack'], correctIndex: 1, hint: 'Concurrent paket.' }, { question: 'Stream.collect(Collectors.toList()) nə qaytarır?', options: ['Set', 'List', 'Map', 'Optional'], correctIndex: 1, hint: 'List collector.' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// JAVA — CHAPTER 2 (20 levels, IDs 101–120)
// ─────────────────────────────────────────────────────────────────────────────
export const initialQuestsJavaCh2 = [
  { id: 101, levelName: 'Level 1: Records', title: 'Java Records (Java 16+)', topic: 'Records', icon: '📄', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'Immutable data class, record keyword.', challenges: [{ question: 'Record sinfi avtomatik nə yaradır?', options: ['toString, equals, hashCode, getters', 'Yalnız toString', 'Setters', 'Constructor yox'], correctIndex: 0, hint: 'Boilerplate azaldır.' }] },
  { id: 102, levelName: 'Level 2: Sealed Classes', title: 'Sealed Siniflər', topic: 'Sealed', icon: '🔒', difficulty: 'Çətin', xpReward: 210, goldReward: 105, isCodingQuest: true, description: 'sealed + permits, pattern matching.', challenges: [{ question: 'sealed class nə məhdudlaşdırır?', options: ['Metod sayı', 'Alt sinifləri müəyyən edir', 'Field sayı', 'Import'], correctIndex: 1, hint: 'permits key.' }] },
  { id: 103, levelName: 'Level 3: Text Blocks', title: 'Text Blocks', topic: 'Strings', icon: '📝', difficulty: 'Asan', xpReward: 150, goldReward: 75, isCodingQuest: true, description: 'Multi-line string, """ syntax.', challenges: [{ question: 'Text block hansı simvolla başlayır?', options: ['"""', "'''", '##', '`'], correctIndex: 0, hint: 'Üç qoşa dırnaq.' }] },
  { id: 104, levelName: 'Level 4: Pattern Match Switch', title: 'Pattern Matching Switch', topic: 'Patterns', icon: '🎭', difficulty: 'Çətin', xpReward: 240, goldReward: 120, isCodingQuest: true, description: 'Java 21 switch expression + patterns.', challenges: [{ question: 'Switch expression nə qaytarır?', options: ['void', 'Dəyər (expression result)', 'null', 'Exception'], correctIndex: 1, hint: 'yield or arrow.' }] },
  { id: 105, levelName: 'Level 5: Virtual Threads', title: 'Virtual Threads (Java 21)', topic: 'Threads', icon: '🧵', difficulty: 'Çətin', xpReward: 260, goldReward: 130, isCodingQuest: true, description: 'Project Loom, lightweight threads.', challenges: [{ question: 'Virtual thread üstünlüyü?', options: ['Ağır', 'Platform thread-dən yüngül, çox say', 'Yalnız I/O', 'GUI'], correctIndex: 1, hint: 'Millions of threads.' }] },
  { id: 106, levelName: 'Level 6: CompletableFuture', title: 'CompletableFuture', topic: 'Async', icon: '⏳', difficulty: 'Çətin', xpReward: 270, goldReward: 135, isCodingQuest: true, description: 'Asinxron Java, thenApply, exceptionally.', challenges: [{ question: 'thenApply() nə edir?', options: ['Xəta tutur', 'Nəticəyə funksiya tətbiq edir', 'İplik yaradır', 'DB connect'], correctIndex: 1, hint: 'Map üçün.' }] },
  { id: 107, levelName: 'Level 7: JUnit 5', title: 'JUnit 5 Test', topic: 'Testing', icon: '🧪', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true, description: '@Test, @BeforeEach, Assertions.', challenges: [{ question: '@Test annotation nə bildirir?', options: ['Main metod', 'Test metodu', 'Constructor', 'Static metod'], correctIndex: 1, hint: 'JUnit test.' }] },
  { id: 108, levelName: 'Level 8: Mockito', title: 'Mockito Mocking', topic: 'Testing', icon: '🎭', difficulty: 'Çətin', xpReward: 240, goldReward: 120, isCodingQuest: true, description: 'Mock, stub, verify pattern.', challenges: [{ question: 'Mockito.mock() nə yaradır?', options: ['Real obyekt', 'Saxta/simulyasiya obyekti', 'Sinif', 'Interface'], correctIndex: 1, hint: 'Test double.' }] },
  { id: 109, levelName: 'Level 9: Maven/Gradle', title: 'Build Alətləri', topic: 'Build', icon: '⚙️', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true, description: 'pom.xml, dependencies, build lifecycle.', challenges: [{ question: 'Maven dependency nədir?', options: ['Xarici kitabxana asılılığı', 'Sinif', 'Metod', 'Thread'], correctIndex: 0, hint: 'pom.xml-də yazılır.' }] },
  { id: 110, levelName: 'Level 10: Microservices', title: 'Mikroxidmət Arxitekturası', topic: 'Microservices', icon: '🔬', difficulty: 'Çətin', xpReward: 280, goldReward: 140, isCodingQuest: true, description: 'REST API, service boundary, API gateway.', challenges: [{ question: 'API Gateway rolu?', options: ['DB saxlar', 'Bütün istəkləri bir nöqtədən yönləndirir', 'UI render', 'Test yazır'], correctIndex: 1, hint: 'Single entry point.' }] },
  { id: 111, levelName: 'Level 11: Kafka Basics', title: 'Apache Kafka Giriş', topic: 'Kafka', icon: '📡', difficulty: 'Çətin', xpReward: 300, goldReward: 150, isCodingQuest: true, description: 'Producer, Consumer, Topic.', challenges: [{ question: 'Kafka Topic nədir?', options: ['Verilənlər bazası', 'Mesajların kateqoriyası/kanalı', 'HTTP endpoint', 'Thread'], correctIndex: 1, hint: 'Message category.' }] },
  { id: 112, levelName: 'Level 12: Docker & Java', title: 'Java + Docker', topic: 'Docker', icon: '🐳', difficulty: 'Çətin', xpReward: 310, goldReward: 155, isCodingQuest: true, description: 'Dockerfile, image, container.', challenges: [{ question: 'Dockerfile FROM direktivi nə edir?', options: ['Faylı kopyalayır', 'Baza image müəyyən edir', 'Port açır', 'Run edir'], correctIndex: 1, hint: 'Base image.' }] },
  { id: 113, levelName: 'Level 13: REST vs GraphQL', title: 'REST vs GraphQL', topic: 'API', icon: '🌐', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: 'REST endpoint-ləri vs GraphQL query-ləri.', challenges: [{ question: 'GraphQL üstünlüyü?', options: ['Daha ağır', 'Lazım olan məlumatı dəqiq tələb et', 'Yalnız GET', 'Cache yoxdur'], correctIndex: 1, hint: 'Overfetching/underfetching yoxdur.' }] },
  { id: 114, levelName: 'Level 14: Security', title: 'Spring Security', topic: 'Security', icon: '🔑', difficulty: 'Çətin', xpReward: 320, goldReward: 160, isCodingQuest: true, description: 'Authentication, Authorization, JWT.', challenges: [{ question: 'Authentication vs Authorization?', options: ['Eyni şey', 'Auth = kim olduğun, Authz = nəyə icazən var', 'Auth = şifrə', 'Authz = şifrə'], correctIndex: 1, hint: 'Who vs what.' }] },
  { id: 115, levelName: 'Level 15: Caching', title: 'Keşləmə (Caching)', topic: 'Performance', icon: '⚡', difficulty: 'Orta', xpReward: 220, goldReward: 110, isCodingQuest: true, description: '@Cacheable, Redis, cache strategies.', challenges: [{ question: 'Cache niyə istifadə olunur?', options: ['Əməliyyatı ləngitmək', 'Tez-tez istifadə olunan məlumatı RAM-da saxlamaq', 'DB silmək', 'Thread yaratmaq'], correctIndex: 1, hint: 'Performance.' }] },
  { id: 116, levelName: 'Level 16: Load Balancing', title: 'Yük Balanslaşdırma', topic: 'Infrastructure', icon: '⚖️', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: 'Round-robin, sticky session, health check.', challenges: [{ question: 'Load balancer rolu?', options: ['Verilənlər bazası', 'İstəkləri server-lər arasında bölür', 'Kod compile edir', 'Şifrələyir'], correctIndex: 1, hint: 'Traffic distribution.' }] },
  { id: 117, levelName: 'Level 17: Observability', title: 'Monitoring & Logging', topic: 'Observability', icon: '📊', difficulty: 'Orta', xpReward: 210, goldReward: 105, isCodingQuest: true, description: 'Metrics, tracing, Micrometer, Prometheus.', challenges: [{ question: 'Distributed tracing nə edir?', options: ['Kodu siler', 'Sorğunun bütün servislər üzrə yolunu izləyir', 'DB backup', 'Log saxlayır yalnız'], correctIndex: 1, hint: 'Trace ID.' }] },
  { id: 118, levelName: 'Level 18: Event Sourcing', title: 'Event Sourcing Pattern', topic: 'Patterns', icon: '📜', difficulty: 'Çətin', xpReward: 340, goldReward: 170, isCodingQuest: true, description: 'State from events, CQRS əsasları.', challenges: [{ question: 'Event Sourcing-də state necə saxlanır?', options: ['Son hal yalnız', 'Bütün hadisələr ardıcıllıqla', 'DB snapshot', 'XML'], correctIndex: 1, hint: 'Replay events.' }] },
  { id: 119, levelName: 'Level 19: Performance Tuning', title: 'JVM Performance', topic: 'Performance', icon: '🏎️', difficulty: 'Çətin', xpReward: 350, goldReward: 175, isCodingQuest: true, description: 'GC tuning, heap analysis, profiling.', challenges: [{ question: 'GC (Garbage Collector) nə edir?', options: ['Şifrələyir', 'İstifadəsiz yaddaş avtomatik azad edir', 'Thread yaradır', 'DB connect'], correctIndex: 1, hint: 'Automatic memory management.' }] },
  { id: 120, levelName: 'Level 20: Java Senior 🏆', title: 'Java Senior Sınağı 🏆', topic: 'Mixed', icon: '🚀', difficulty: 'Çətin', xpReward: 700, goldReward: 350, isCodingQuest: true, description: 'Java Ch2 — Son böyük imtahan!', challenges: [{ question: 'CAP teoremi nə bildirir?', options: ['3-dən yalnız 2-ni seçmək olar', 'Hər zaman 3-ü mümkün', 'Yalnız Java üçün', 'REST vs SOAP'], correctIndex: 0, hint: 'Consistency, Availability, Partition tolerance.' }, { question: 'CQRS nədir?', options: ['Command Query Responsibility Segregation', 'Java keyword', 'Thread pattern', 'Annotation'], correctIndex: 0, hint: 'Read/Write separation.' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// PYTHON — CHAPTER 1 (20 levels, IDs 1–20)
// ─────────────────────────────────────────────────────────────────────────────
export const initialQuestsPython = [
  { id: 1, levelName: 'Level 1: Python Basics', title: 'Python Giriş', topic: 'Basics', icon: '🐍', difficulty: 'Asan', xpReward: 100, goldReward: 50, isCodingQuest: true, description: 'print(), şərhlər, dəyişənlər.', challenges: [{ question: 'Ekrana çıxış?', options: ['echo()', 'Console.WriteLine()', 'System.out.println()', 'print()'], correctIndex: 3, hint: 'print("Salam").' }, { question: 'Şərh simvolu?', options: ['//', '/* */', '#', '--'], correctIndex: 2, hint: '# simvolu.' }] },
  { id: 2, levelName: 'Level 2: Variables', title: 'Dəyişənlər', topic: 'Variables', icon: '📦', difficulty: 'Asan', xpReward: 110, goldReward: 55, isCodingQuest: true, description: 'Dinamik tipləmə, tip dönüşümü.', challenges: [{ question: 'Python dəyişən necə yaradılır?', options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'], correctIndex: 2, hint: 'Tip elanı lazım deyil.' }] },
  { id: 3, levelName: 'Level 3: Strings', title: 'String Əməliyyatları', topic: 'Strings', icon: '📝', difficulty: 'Asan', xpReward: 120, goldReward: 60, isCodingQuest: true, description: 'f-string, upper, lower, split.', challenges: [{ question: '"hello".upper() nə verir?', options: ['hello', 'HELLO', 'Hello', 'Xəta'], correctIndex: 1, hint: 'Bütün hərflər böyük.' }, { question: 'f-string nə üçün?', options: ['Fayl', 'Dəyişən daxil etmək', 'Funksiya', 'Loop'], correctIndex: 1, hint: 'f"Salam {name}".' }] },
  { id: 4, levelName: 'Level 4: Lists', title: 'Siyahılar (Lists)', topic: 'Lists', icon: '📋', difficulty: 'Orta', xpReward: 140, goldReward: 70, isCodingQuest: true, description: 'List yaratma, indeks, append, slicing.', challenges: [{ question: 'List sintaksisi?', options: ['{ }', '( )', '[ ]', '< >'], correctIndex: 2, hint: 'Kvadrat mötərizə.' }, { question: 'Sona element əlavə?', options: ['add()', 'push()', 'append()', 'insert_last()'], correctIndex: 2, hint: 'append().' }] },
  { id: 5, levelName: 'Level 5: Loops', title: 'Döngülər', topic: 'Loops', icon: '🔄', difficulty: 'Orta', xpReward: 140, goldReward: 70, isCodingQuest: true, description: 'for, while, range, break, continue.', challenges: [{ question: 'range(5) neçə iterasiya?', options: ['4', '5', '6', '0'], correctIndex: 1, hint: '0..4, cəmi 5.' }, { question: 'while True dayandırmaq üçün?', options: ['stop', 'break', 'exit', 'end'], correctIndex: 1, hint: 'break.' }] },
  { id: 6, levelName: 'Level 6: Functions', title: 'Funksiyalar', topic: 'Functions', icon: '⚡', difficulty: 'Orta', xpReward: 160, goldReward: 80, isCodingQuest: true, description: 'def, return, default parametrlər, *args.', challenges: [{ question: 'Funksiya üçün açar söz?', options: ['function', 'def', 'fn', 'func'], correctIndex: 1, hint: 'def my_func().' }, { question: 'Dəyər qaytarmaq üçün?', options: ['return', 'give', 'output', 'yield'], correctIndex: 0, hint: 'return.' }] },
  { id: 7, levelName: 'Level 7: Conditionals', title: 'Şərt Operatorları', topic: 'Conditionals', icon: '🔀', difficulty: 'Asan', xpReward: 120, goldReward: 60, isCodingQuest: true, description: 'if, elif, else, ternary operator.', challenges: [{ question: 'Python elif nədir?', options: ['else if', 'error if', 'end if', 'each if'], correctIndex: 0, hint: 'else if qısaltması.' }] },
  { id: 8, levelName: 'Level 8: Dictionaries', title: 'Lüğətlər (Dicts)', topic: 'Dictionaries', icon: '📖', difficulty: 'Orta', xpReward: 160, goldReward: 80, isCodingQuest: true, description: 'dict yaratma, get, update, iteration.', challenges: [{ question: 'Dict sintaksisi?', options: ['[]', '{}', '()', '<>'], correctIndex: 1, hint: '{"key": "value"}.' }] },
  { id: 9, levelName: 'Level 9: Tuples', title: 'Demetlər (Tuples)', topic: 'Tuples', icon: '📌', difficulty: 'Asan', xpReward: 130, goldReward: 65, isCodingQuest: true, description: 'Immutable tuple, unpacking.', challenges: [{ question: 'Tuple dəyişdirilə bilər?', options: ['Bəli', 'Xeyr — immutable', 'Yalnız ilk element', 'Həmişə'], correctIndex: 1, hint: 'Immutable.' }] },
  { id: 10, levelName: 'Level 10: Sets', title: 'Çoxluqlar (Sets)', topic: 'Sets', icon: '🔵', difficulty: 'Orta', xpReward: 150, goldReward: 75, isCodingQuest: true, description: 'Unikal elementlər, set əməliyyatları.', challenges: [{ question: 'Set-in xüsusiyyəti?', options: ['Sıralı', 'Dublikat yoxdur', 'Indeksli', 'Mutable yox'], correctIndex: 1, hint: 'Unique elements.' }] },
  { id: 11, levelName: 'Level 11: OOP', title: 'Sinif və Obyekt', topic: 'OOP', icon: '🏛️', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'class, __init__, self, metodlar.', challenges: [{ question: 'Sinif üçün açar söz?', options: ['class', 'struct', 'object', 'type'], correctIndex: 0, hint: 'class MyClass:.' }, { question: 'Konstruktor metod?', options: ['__init__', '__main__', '__start__', '__new__'], correctIndex: 0, hint: '__init__(self).' }] },
  { id: 12, levelName: 'Level 12: Inheritance', title: 'Miras Alma', topic: 'Inheritance', icon: '👑', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true, description: 'super(), method override, MRO.', challenges: [{ question: 'Miras alma sintaksisi?', options: ['class Dog(Animal):', 'class Dog extends Animal:', 'class Dog : Animal', 'class Dog implements Animal'], correctIndex: 0, hint: 'Mötərizə içinə baza sinif.' }] },
  { id: 13, levelName: 'Level 13: Decorators', title: 'Dekoratorlar', topic: 'Decorators', icon: '🎀', difficulty: 'Çətin', xpReward: 230, goldReward: 115, isCodingQuest: true, description: '@decorator syntax, funksiya sarmalama.', challenges: [{ question: 'Dekorator nə edir?', options: ['Dəyişkəni silir', 'Funksiyaya əlavə davranış qoşur', 'Sinif yaradır', 'Import edir'], correctIndex: 1, hint: '@decorator pattern.' }] },
  { id: 14, levelName: 'Level 14: Generators', title: 'Generator Funksiyalar', topic: 'Generators', icon: '⚙️', difficulty: 'Çətin', xpReward: 240, goldReward: 120, isCodingQuest: true, description: 'yield, generator iterator, lazy evaluation.', challenges: [{ question: 'yield açar sözü nə edir?', options: ['Dəyər qaytarır və dayandırır', 'Silir', 'Import', 'Exception'], correctIndex: 0, hint: 'Generator state-i qoruyur.' }] },
  { id: 15, levelName: 'Level 15: Comprehensions', title: 'List Comprehension', topic: 'Comprehensions', icon: '🔍', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true, description: '[x for x in ...], dict/set comprehension.', challenges: [{ question: '[x*2 for x in range(3)] nə verir?', options: ['[0,2,4]', '[1,2,3]', '[2,4,6]', 'Xəta'], correctIndex: 0, hint: 'x=0,1,2 → x*2.' }] },
  { id: 16, levelName: 'Level 16: File I/O', title: 'Fayl Əməliyyatları', topic: 'FileIO', icon: '💾', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'open(), read, write, with statement.', challenges: [{ question: 'Fayl oxumaq üçün?', options: ['file.open()', 'open(f, "r")', 'read(f)', 'File.get()'], correctIndex: 1, hint: 'open() + "r" mode.' }] },
  { id: 17, levelName: 'Level 17: Modules', title: 'Modullar & Paketlər', topic: 'Modules', icon: '📦', difficulty: 'Asan', xpReward: 130, goldReward: 65, isCodingQuest: true, description: 'import, from ... import, __init__.py.', challenges: [{ question: 'Modul import?', options: ['include', 'import', 'using', 'require'], correctIndex: 1, hint: 'import math.' }] },
  { id: 18, levelName: 'Level 18: Error Handling', title: 'İstisna İdarəsi', topic: 'Exceptions', icon: '⚠️', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'try/except/finally, custom exception.', challenges: [{ question: 'Xəta tutmaq üçün?', options: ['try-catch', 'try-except', 'try-handle', 'catch'], correctIndex: 1, hint: 'Python: except.' }] },
  { id: 19, levelName: 'Level 19: Testing', title: 'pytest İlə Test', topic: 'Testing', icon: '🧪', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true, description: 'pytest, assert, fixture, parametrize.', challenges: [{ question: 'pytest test funksiyası necə adlanır?', options: ['test_ ilə başlayır', '@Test annotation', 'JUnit metodu', 'unittest.main()'], correctIndex: 0, hint: 'test_ prefix.' }] },
  { id: 20, levelName: 'Level 20: Python Master 🏆', title: 'Python Ustası Sınağı 🏆', topic: 'Mixed', icon: '🏆', difficulty: 'Çətin', xpReward: 600, goldReward: 300, isCodingQuest: true, description: 'Python Ch1 — Son böyük imtahan!', challenges: [{ question: '__dunder__ metodlar nə üçün?', options: ['Gizli metodlar', 'Operatorları override etmək üçün sehrli metodlar', 'Yalnız print', 'Import'], correctIndex: 1, hint: '__str__, __add__ kimi.' }, { question: 'GIL (Global Interpreter Lock) nədir?', options: ['Şifrələmə', 'Eyni anda yalnız bir thread Python bytecode icra edir', 'GC', 'Modul'], correctIndex: 1, hint: 'CPython thread limitasiyası.' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// PYTHON — CHAPTER 2 (20 levels, IDs 101–120)
// ─────────────────────────────────────────────────────────────────────────────
export const initialQuestsPythonCh2 = [
  { id: 101, levelName: 'Level 1: Async/Await', title: 'Asinxron Python', topic: 'Async', icon: '⏳', difficulty: 'Çətin', xpReward: 220, goldReward: 110, isCodingQuest: true, description: 'asyncio, async def, await, event loop.', challenges: [{ question: 'async funksiya nə qaytarır?', options: ['int', 'Coroutine', 'str', 'None'], correctIndex: 1, hint: 'Coroutine object.' }] },
  { id: 102, levelName: 'Level 2: Type Hints', title: 'Tip Annotasiyaları', topic: 'TypeHints', icon: '🔖', difficulty: 'Orta', xpReward: 180, goldReward: 90, isCodingQuest: true, description: 'def f(x: int) -> str: syntax.', challenges: [{ question: 'Type hint-lərin məqsədi?', options: ['Tip enforce edir', 'Kodu sənədləşdirir, IDE yardımı', 'Performans', 'Şifrələmə'], correctIndex: 1, hint: 'Static analysis.' }] },
  { id: 103, levelName: 'Level 3: Dataclasses', title: '@dataclass Dekoratoru', topic: 'Dataclasses', icon: '📄', difficulty: 'Orta', xpReward: 190, goldReward: 95, isCodingQuest: true, description: 'Avtomatik __init__, __repr__, __eq__.', challenges: [{ question: '@dataclass nə yaradır?', options: ['Yalnız __init__', '__init__, __repr__, __eq__ avtomatik', 'Abstract sinif', 'Interface'], correctIndex: 1, hint: 'Boilerplate azaldır.' }] },
  { id: 104, levelName: 'Level 4: Context Managers', title: 'Context Manager', topic: 'ContextManagers', icon: '🔧', difficulty: 'Çətin', xpReward: 230, goldReward: 115, isCodingQuest: true, description: 'with statement, __enter__/__exit__.', challenges: [{ question: 'with statement nəyi təmin edir?', options: ['Döngü', 'Resursun düzgün açılıb bağlanması', 'Şifrələmə', 'Import'], correctIndex: 1, hint: 'RAII pattern.' }] },
  { id: 105, levelName: 'Level 5: Metaclasses', title: 'Metasiniflər', topic: 'Metaclasses', icon: '🧬', difficulty: 'Çətin', xpReward: 270, goldReward: 135, isCodingQuest: true, description: 'type(), metaclass=, sinif yaradılış prosesi.', challenges: [{ question: 'Python-da siniflərin sinfi hansıdır?', options: ['object', 'type', 'meta', 'class'], correctIndex: 1, hint: 'type — metaclass by default.' }] },
  { id: 106, levelName: 'Level 6: Descriptors', title: 'Deskriptorlar', topic: 'Descriptors', icon: '🔭', difficulty: 'Çətin', xpReward: 260, goldReward: 130, isCodingQuest: true, description: '__get__, __set__, property deskriptoru.', challenges: [{ question: '@property nə edir?', options: ['Metodu saxta field kimi göstərir', 'Faylı oxuyur', 'Thread yaradır', 'Import'], correctIndex: 0, hint: 'Getter pattern.' }] },
  { id: 107, levelName: 'Level 7: NumPy Basics', title: 'NumPy Əsasları', topic: 'NumPy', icon: '🔢', difficulty: 'Orta', xpReward: 200, goldReward: 100, isCodingQuest: true, description: 'ndarray, broadcasting, vectorized ops.', challenges: [{ question: 'NumPy ndarray list-dən sürətlidir çünki?', options: ['Python kodu', 'C ilə implement, contiguous memory', 'GIL yoxdur', 'Async'], correctIndex: 1, hint: 'Contiguous C array.' }] },
  { id: 108, levelName: 'Level 8: Pandas Basics', title: 'Pandas DataFrame', topic: 'Pandas', icon: '🐼', difficulty: 'Orta', xpReward: 210, goldReward: 105, isCodingQuest: true, description: 'DataFrame, Series, groupby, merge.', challenges: [{ question: 'DataFrame nədir?', options: ['List', '2D cədvəl-like məlumat strukturu', 'Dict', 'Set'], correctIndex: 1, hint: 'Rows + columns.' }] },
  { id: 109, levelName: 'Level 9: ML Intro', title: 'Machine Learning Giriş', topic: 'ML', icon: '🤖', difficulty: 'Çətin', xpReward: 280, goldReward: 140, isCodingQuest: true, description: 'scikit-learn, train/test split, model fit.', challenges: [{ question: 'train_test_split nə edir?', options: ['Modeli silir', 'Məlumatı öyrənmə/sınaq hissələrinə bölür', 'Normallaşdırır', 'Plotlaşdırır'], correctIndex: 1, hint: 'ML best practice.' }] },
  { id: 110, levelName: 'Level 10: FastAPI', title: 'FastAPI REST API', topic: 'FastAPI', icon: '🚀', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: '@app.get, Pydantic model, async endpoint.', challenges: [{ question: 'FastAPI avtomatik nə yaradır?', options: ['DB schema', 'OpenAPI/Swagger docs', 'Unit test', 'Docker'], correctIndex: 1, hint: '/docs endpoint.' }] },
  { id: 111, levelName: 'Level 11: SQLAlchemy', title: 'SQLAlchemy ORM', topic: 'ORM', icon: '🗄️', difficulty: 'Çətin', xpReward: 300, goldReward: 150, isCodingQuest: true, description: 'Model, session, query, relationship.', challenges: [{ question: 'SQLAlchemy session nədir?', options: ['HTTP session', 'DB əməliyyatları üçün unit of work', 'Thread', 'Cache'], correctIndex: 1, hint: 'Unit of work pattern.' }] },
  { id: 112, levelName: 'Level 12: Celery', title: 'Celery Task Queue', topic: 'TaskQueue', icon: '🌿', difficulty: 'Çətin', xpReward: 310, goldReward: 155, isCodingQuest: true, description: '@task, delay, apply_async, broker.', challenges: [{ question: 'Celery broker nədir?', options: ['DB', 'Tapşırıqları ötürən mesaj növbəsi (Redis/RabbitMQ)', 'Web server', 'ORM'], correctIndex: 1, hint: 'Message broker.' }] },
  { id: 113, levelName: 'Level 13: Docker + Python', title: 'Python + Docker', topic: 'Docker', icon: '🐳', difficulty: 'Çətin', xpReward: 290, goldReward: 145, isCodingQuest: true, description: 'Dockerfile, requirements.txt, multi-stage.', challenges: [{ question: 'requirements.txt nə edir?', options: ['Kodu siler', 'Asılılıq siyahısını saxlayır', 'Docker image', 'Server config'], correctIndex: 1, hint: 'pip install -r requirements.txt.' }] },
  { id: 114, levelName: 'Level 14: Testing Advanced', title: 'Pytest + Mock', topic: 'Testing', icon: '🧪', difficulty: 'Çətin', xpReward: 270, goldReward: 135, isCodingQuest: true, description: 'monkeypatch, fixtures, parametrize.', challenges: [{ question: 'monkeypatch nə edir?', options: ['Sinif silir', 'Test zamanı obyekti müvəqqəti əvəz edir', 'Import', 'Async'], correctIndex: 1, hint: 'Test isolation.' }] },
  { id: 115, levelName: 'Level 15: CI/CD', title: 'CI/CD Pipeline', topic: 'DevOps', icon: '🔄', difficulty: 'Orta', xpReward: 220, goldReward: 110, isCodingQuest: true, description: 'GitHub Actions, pipeline stages.', challenges: [{ question: 'CI nə edir?', options: ['Şifrələyir', 'Kodu avtomatik build + test edir', 'DB migrate', 'Deploy yalnız'], correctIndex: 1, hint: 'Continuous Integration.' }] },
  { id: 116, levelName: 'Level 16: WebSockets', title: 'WebSocket İlə Real-time', topic: 'WebSockets', icon: '📡', difficulty: 'Çətin', xpReward: 300, goldReward: 150, isCodingQuest: true, description: 'websockets library, full-duplex.', challenges: [{ question: 'WebSocket HTTP-dən fərqi?', options: ['Eyni', 'Daimi bidireksional bağlantı', 'Yalnız GET', 'Stateless'], correctIndex: 1, hint: 'Full-duplex.' }] },
  { id: 117, levelName: 'Level 17: Pydantic', title: 'Pydantic Validasiya', topic: 'Pydantic', icon: '✅', difficulty: 'Orta', xpReward: 210, goldReward: 105, isCodingQuest: true, description: 'BaseModel, Field, validator.', challenges: [{ question: 'Pydantic nə edir?', options: ['DB ORM', 'Məlumat validasiyası + serialization', 'Web server', 'Async'], correctIndex: 1, hint: 'Data validation library.' }] },
  { id: 118, levelName: 'Level 18: LLM Integration', title: 'AI/LLM İnteqrasiyası', topic: 'AI', icon: '🧠', difficulty: 'Çətin', xpReward: 350, goldReward: 175, isCodingQuest: true, description: 'OpenAI API, LangChain əsasları.', challenges: [{ question: 'LangChain nə üçün?', options: ['Oyun inkişafı', 'LLM-lərlə chain/agent qurmaq', 'Web dizayn', 'DB migrate'], correctIndex: 1, hint: 'LLM orchestration.' }] },
  { id: 119, levelName: 'Level 19: System Design', title: 'Sistem Dizaynı', topic: 'SystemDesign', icon: '🏗️', difficulty: 'Çətin', xpReward: 360, goldReward: 180, isCodingQuest: true, description: 'Scalability, availability, data partitioning.', challenges: [{ question: 'Horizontal scaling nədir?', options: ['Serveri gücləndir', 'Daha çox server əlavə et', 'Cache', 'DB index'], correctIndex: 1, hint: 'Scale out.' }] },
  { id: 120, levelName: 'Level 20: Python Senior 🏆', title: 'Python Senior Sınağı 🏆', topic: 'Mixed', icon: '🚀', difficulty: 'Çətin', xpReward: 700, goldReward: 350, isCodingQuest: true, description: 'Python Ch2 — Son böyük imtahan!', challenges: [{ question: 'Event loop nədir?', options: ['Thread havuzu', 'Asinxron tapşırıqları ardıcıl icra edən mexanizm', 'GC', 'Import sistemi'], correctIndex: 1, hint: 'asyncio core.' }, { question: 'Python GIL nəyi maneə edir?', options: ['Asinxron kod', 'Eyni anda çoxlu thread paralel Python bytecode icra etməsini', 'Import', 'Dekorator'], correctIndex: 1, hint: 'True parallelism in CPython.' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Chapter quest map — consumed by AppContext & QuestsGrid
// ─────────────────────────────────────────────────────────────────────────────
export const QUESTS_BY_CHAPTER = {
  'C#':    [initialQuestsCSharp, initialQuestsCSharpCh2],
  Java:    [initialQuestsJava,   initialQuestsJavaCh2],
  Python:  [initialQuestsPython, initialQuestsPythonCh2],
};

// ─────────────────────────────────────────────────────────────────────────────
// Shop items (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
export const shopItems = [
  { id: 1, name: 'Steve (Minecraft)', emoji: '🟫', type: 'Avatar', itemType: 'avatar', price: 150, rarity: 'Epic', game: 'Minecraft', gameColor: '#4a7c2e', gameBg: 'linear-gradient(135deg, #4a7c2e22 0%, #1a3a0c22 100%)', gameBorder: 'rgba(74,124,46,0.4)', desc: "Minecraft'ın ikonik kahramanı!" },
  { id: 2, name: 'Creeper (Minecraft)', emoji: '💚', type: 'Avatar', itemType: 'avatar', price: 180, rarity: 'Rare', game: 'Minecraft', gameColor: '#22c55e', gameBg: 'linear-gradient(135deg, #22c55e22 0%, #15803d22 100%)', gameBorder: 'rgba(34,197,94,0.4)', desc: 'Ssss... Patlayan düşman.' },
  { id: 3, name: 'Jett (Valorant)', emoji: '🌬️', type: 'Avatar', itemType: 'avatar', price: 250, rarity: 'Legendary', game: 'Valorant', gameColor: '#06b6d4', gameBg: 'linear-gradient(135deg, #06b6d422 0%, #0e749222 100%)', gameBorder: 'rgba(6,182,212,0.5)', desc: "Valorant'ın ən sürətli Ajan'ı!" },
  { id: 4, name: 'Reyna (Valorant)', emoji: '👁️', type: 'Avatar', itemType: 'avatar', price: 300, rarity: 'Legendary', game: 'Valorant', gameColor: '#8b5cf6', gameBg: 'linear-gradient(135deg, #8b5cf622 0%, #5b21b622 100%)', gameBorder: 'rgba(139,92,246,0.5)', desc: 'Soul Harvest! Ən güclü duelist.' },
  { id: 7, name: 'Galaktik Proqramçı', emoji: '🚀', type: 'Avatar', itemType: 'avatar', price: 200, rarity: 'Epic', game: 'Questify', gameColor: '#f59e0b', gameBg: 'linear-gradient(135deg, #f59e0b22 0%, #b4530a22 100%)', gameBorder: 'rgba(245,158,11,0.4)', desc: "Questify'ın galaktik avatarı." },
  { id: 2001, name: 'C# Usta Nişanı', emoji: '🏆', type: 'Nişan', itemType: 'badge', price: 200, rarity: 'Legendary', game: 'Questify', gameColor: '#a855f7', gameBg: 'linear-gradient(135deg, #a855f722 0%, #6d28d922 100%)', gameBorder: 'rgba(168,85,247,0.4)', desc: 'C# dilinin ustasısınız!' },
  { id: 2002, name: 'Kod Ninzya Nişanı', emoji: '🥷', type: 'Nişan', itemType: 'badge', price: 100, rarity: 'Rare', game: 'Questify', gameColor: '#94a3b8', gameBg: 'linear-gradient(135deg, #94a3b822 0%, #47556922 100%)', gameBorder: 'rgba(148,163,184,0.35)', desc: 'Gölgede ilerleyen kod ustası.' },
  { id: 5, name: 'Can İksiri', emoji: '💖', type: 'İksir', itemType: 'potion_heart', price: 50, rarity: 'Common', game: 'RPG', gameColor: '#ef4444', gameBg: 'linear-gradient(135deg, #ef444422 0%, #7f1d1d22 100%)', gameBorder: 'rgba(239,68,68,0.35)', desc: '1 Can hakkı geri. Həftəlik: 1 dəfə.' },
  { id: 6, name: '50/50 Joker', emoji: '🃏', type: 'Joker', itemType: 'joker_5050', price: 75, rarity: 'Rare', game: 'Quiz', gameColor: '#f59e0b', gameBg: 'linear-gradient(135deg, #f59e0b22 0%, #78350f22 100%)', gameBorder: 'rgba(245,158,11,0.4)', desc: '2 yanlış variantı silir.' },
];

export const spinRewards = [
  { label: '+20 🪙', value: 20, type: 'gold',  color: '#f59e0b' },
  { label: '+50 🪙', value: 50, type: 'gold',  color: '#06b6d4' },
  { label: '+1 ❤️',  value: 1,  type: 'heart', color: '#ef4444' },
  { label: 'Try Again', value: 0, type: 'none', color: '#475569' },
  { label: '+20 🪙', value: 20, type: 'gold',  color: '#f59e0b' },
  { label: '+50 🪙', value: 50, type: 'gold',  color: '#22c55e' },
  { label: '+1 ❤️',  value: 1,  type: 'heart', color: '#ec4899' },
  { label: 'Try Again', value: 0, type: 'none', color: '#334155' },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI Q pool & helper (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
export const aiQuestionsPool = {
  'C#': [
    { topic: 'Variables', challenge: { question: 'C# dilində tam ədədləri saxlamaq üçün hansı tip?', options: ['double','char','int','string'], correctIndex: 2, hint: 'int.' } },
    { topic: 'Loops',     challenge: { question: 'for (int i=0; i<4; i++) neçə dəfə?', options: ['3','4','5','Sonsuz'], correctIndex: 1, hint: '0..3.' } },
    { topic: 'OOP',       challenge: { question: 'Yeni obyekt üçün açar söz?', options: ['class','create','new','this'], correctIndex: 2, hint: 'new.' } },
  ],
  Java: [
    { topic: 'Basics',    challenge: { question: 'Java ekrana çıxış?', options: ['Console.WriteLine()','print()','System.out.println()','echo()'], correctIndex: 2, hint: 'System.out.println.' } },
    { topic: 'OOP',       challenge: { question: 'Miras açar sözü?', options: ['implements','inherits','extends','derives'], correctIndex: 2, hint: 'extends.' } },
  ],
  Python: [
    { topic: 'Basics',    challenge: { question: 'Python çıxış funksiyası?', options: ['echo()','Console.WriteLine()','System.out.println()','print()'], correctIndex: 3, hint: 'print().' } },
    { topic: 'Functions', challenge: { question: 'Funksiya açar sözü?', options: ['function','def','fn','func'], correctIndex: 1, hint: 'def.' } },
  ],
};

export function getRandomAiQuestion(language) {
  const pool = aiQuestionsPool[language] || aiQuestionsPool['C#'];
  return pool[Math.floor(Math.random() * pool.length)];
}
