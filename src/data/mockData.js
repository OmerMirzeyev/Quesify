// Roadmap themed levels with C# multiple-choice questions
export const initialQuestsCSharp = [
  {
    id: 1,
    levelName: "Level 1: Variables",
    title: "C# Dəyişənləri və Tiplər",
    topic: "Variables",
    icon: "📦",
    difficulty: "Asan",
    xpReward: 100,
    goldReward: 50,
    isCodingQuest: true,
    description: "C# proqramlaşma dilində ən çox istifadə olunan dəyişən tipləri və onların bəyan edilməsi qaydalarını mənimsəyin.",
    challenges: [
      {
        question: "C# dilində tam ədədləri (məsələn, -5, 42, 1000) saxlamaq üçün hansı məlumat tipindən istifadə olunur?",
        options: ["double", "char", "int", "string"],
        correctIndex: 2,
        hint: "Bu tip 'integer' sözünün qısaltmasıdır və 32-bitlik tam ədədləri ifadə edir."
      },
      {
        question: "Aşağıdakılardan hansı məntiqi dəyər (true/false) saxlayır?",
        options: ["bool", "string", "float", "char"],
        correctIndex: 0,
        hint: "Boolean cəbrindən gələn addır."
      },
      {
        question: "Ondalıq ədədləri (məs. 3.14) saxlamaq üçün ən dəqiq tip hansıdır?",
        options: ["int", "double", "string", "bool"],
        correctIndex: 1,
        hint: "İkiqat həssasiyyətli sürüşən nöqtəli (double precision floating point)."
      }
    ]
  },
  {
    id: 2,
    levelName: "Level 2: Loops",
    title: "Döngülər və İterasiya",
    topic: "Loops",
    icon: "🔄",
    difficulty: "Orta",
    xpReward: 150,
    goldReward: 75,
    isCodingQuest: true,
    description: "for, while və do-while döngülərinin işləmə məntiqini anlamaq və massivlər üzərində gəzmək.",
    challenges: [
      {
        question: "Aşağıdakı C# for döngüsü neçə dəfə işləyəcək?\nfor (int i = 0; i < 5; i++) { Console.WriteLine(i); }",
        options: ["4 dəfə", "5 dəfə", "6 dəfə", "Sonsuz sayda"],
        correctIndex: 1,
        hint: "i=0-dan başlayaraq hər addımda 1 artır və i < 5 şərti ödənildiyi müddətdə davam edir."
      },
      {
        question: "Hansı döngü növü şərtin doğru və ya yanlış olmasından asılı olmayaraq ən azı 1 dəfə işləyir?",
        options: ["for", "while", "do-while", "foreach"],
        correctIndex: 2,
        hint: "Blok işlədikdən SONRA şərt yoxlanılır."
      }
    ]
  },
  {
    id: 3,
    levelName: "Level 3: Arrays",
    title: "Massivlər ilə İş",
    topic: "Arrays",
    icon: "📊",
    difficulty: "Orta",
    xpReward: 180,
    goldReward: 90,
    isCodingQuest: true,
    description: "Eyni tipli məlumat yığınlarını (massivləri) yaratmaq, indeksləmək və onların üzərində dövrlər vasitəsilə gəzmək.",
    challenges: [
      {
        question: "C#-da 5 elementli tam ədəd massivi təyin etmək üçün hansı sintaksis doğrudur?",
        options: ["int[] arr = new int[5];", "int arr = new int(5);", "array int arr = 5;", "int[5] arr = new int[];"],
        correctIndex: 0,
        hint: "Əvvəlcə tip və mötərizələr yazılır (int[]), sonra new ilə yaddaşdan ölçü qədər yer ayrılır."
      },
      {
        question: "Massivin ilk elementinə çatmaq üçün hansı indeks istifadə olunur?",
        options: ["1", "0", "-1", "length"],
        correctIndex: 1,
        hint: "Proqramlaşdırmada sayma sıfırdan başlayır."
      }
    ]
  },
  {
    id: 4,
    levelName: "Level 4: OOP Basics",
    title: "Obyektyönümlü Proqramlaşma",
    topic: "OOP Basics",
    icon: "🏛️",
    difficulty: "Çətin",
    xpReward: 250,
    goldReward: 120,
    isCodingQuest: true,
    description: "OOP (Object-Oriented Programming) əsas prinsipləri: Siniflər (Classes) və Obyektlər (Objects).",
    challenges: [
      {
        question: "C# dilində bir sinifdən (Class) yeni bir obyekt (Object) yaratmaq üçün hansı açar sözündən (keyword) istifadə olunur?",
        options: ["class", "create", "new", "this"],
        correctIndex: 2,
        hint: "Bu açar söz yaddaşda obyekt üçün yer ayırır və onun konstruktorunu çağırır."
      },
      {
        question: "Hansı prinsip obyektin bəzi xüsusiyyətlərini gizlətməyə (private) xidmət edir?",
        options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
        correctIndex: 2,
        hint: "Məlumatı bir kapsul içinə alıb kənardan müdaxiləni məhdudlaşdırmaqdır."
      }
    ]
  }
];

// ─── Java Track ───────────────────────────────────────────────────────────
export const initialQuestsJava = [
  {
    id: 1,
    levelName: "Level 1: Java Basics",
    title: "Java Giriş və Sintaksis",
    topic: "Basics",
    icon: "☕",
    difficulty: "Asan",
    xpReward: 100,
    goldReward: 50,
    isCodingQuest: true,
    description: "Java proqramlaşdırma dilinin əsas sintaksis qaydalarını və Hello World proqramını öyrənin.",
    challenges: [
      {
        question: "Java-da ekrana mətn çıxarmaq üçün hansı metoddan istifadə olunur?",
        options: ["Console.WriteLine()", "print()", "System.out.println()", "echo()"],
        correctIndex: 2,
        hint: "System sinfinin out obyektinin println() metodu Java-nın standart çıxış metodudur."
      },
      {
        question: "Java proqramının başlanğıc nöqtəsi hansı metoddur?",
        options: ["start()", "run()", "init()", "public static void main(String[] args)"],
        correctIndex: 3,
        hint: "Hər Java proqramının icrası bu imzalı metoddan başlayır."
      },
      {
        question: "Java-da tam ədəd (integer) tipi hansıdır?",
        options: ["Int", "INTEGER", "int", "integer"],
        correctIndex: 2,
        hint: "Java həssas registerdir – kiçik hərflə yazılan primitiv tipdir."
      }
    ]
  },
  {
    id: 2,
    levelName: "Level 2: OOP Konsepti",
    title: "Java Siniflər və Obyektlər",
    topic: "OOP",
    icon: "🏛️",
    difficulty: "Orta",
    xpReward: 150,
    goldReward: 75,
    isCodingQuest: true,
    description: "Java-da obyekt yönümlü proqramlaşdırmanın əsas anlayışlarını mənimsəyin.",
    challenges: [
      {
        question: "Java-da yeni bir obyekt yaratmaq üçün hansı açar söz istifadə olunur?",
        options: ["create", "new", "make", "object"],
        correctIndex: 1,
        hint: "Bu açar söz yaddaşda obyekt üçün yer ayırır və konstruktoru çağırır."
      },
      {
        question: "Java-da miras alma üçün hansı açar sözdən istifadə olunur?",
        options: ["implements", "inherits", "extends", "derives"],
        correctIndex: 2,
        hint: "'class Dog extends Animal' nümunəsinə baxın."
      }
    ]
  },
  {
    id: 3,
    levelName: "Level 3: Collections",
    title: "Java ArrayList və Kolleksiyalar",
    topic: "Collections",
    icon: "📋",
    difficulty: "Çətin",
    xpReward: 200,
    goldReward: 100,
    isCodingQuest: true,
    description: "Java-nın ArrayList, HashMap kimi güclü kolleksiya siniflərini öyrənin.",
    challenges: [
      {
        question: "Java-da dinamik ölçülü siyahı üçün hansı sinif istifadə olunur?",
        options: ["Array", "LinkedList", "ArrayList", "Vector"],
        correctIndex: 2,
        hint: "java.util paketindəki bu sinif avtomatik böyüyən massiv kimi çalışır."
      }
    ]
  }
];

// ─── Python Track ─────────────────────────────────────────────────────────
export const initialQuestsPython = [
  {
    id: 1,
    levelName: "Level 1: Python Basics",
    title: "Python Giriş və print()",
    topic: "Basics",
    icon: "🐍",
    difficulty: "Asan",
    xpReward: 100,
    goldReward: 50,
    isCodingQuest: true,
    description: "Python proqramlaşdırma dilinin sadə sintaksisi, dəyişənlər və print() funksiyasını öyrənin.",
    challenges: [
      {
        question: "Python-da ekrana mətn çıxarmaq üçün hansı funksiyadan istifadə olunur?",
        options: ["echo()", "Console.WriteLine()", "System.out.println()", "print()"],
        correctIndex: 3,
        hint: "Python-un ən sadə çıxış funksiyasıdır – mötərizə içinə mətni yazın."
      },
      {
        question: "Python-da şərh (comment) əlavə etmək üçün hansı simvoldan istifadə olunur?",
        options: ["//", "/* */", "#", "--"],
        correctIndex: 2,
        hint: "Bu simvoldan sonra yazılan hər şey Python tərəfindən icra olunmur."
      },
      {
        question: "Python-da dinamik tipli dəyişən necə yaradılır?",
        options: ["int x = 5", "var x = 5", "x = 5", "let x = 5"],
        correctIndex: 2,
        hint: "Python-da tip elanına ehtiyac yoxdur – sadəcə dəyər mənimsədin."
      }
    ]
  },
  {
    id: 2,
    levelName: "Level 2: Siyahılar",
    title: "Python Listlər (Lists)",
    topic: "Lists",
    icon: "📝",
    difficulty: "Orta",
    xpReward: 150,
    goldReward: 75,
    isCodingQuest: true,
    description: "Python-da list (siyahı) məlumat strukturunu, indeks əməliyyatlarını öyrənin.",
    challenges: [
      {
        question: "Python-da list yaratmaq üçün hansı simvollardan istifadə olunur?",
        options: ["{ }", "( )", "[ ]", "< >"],
        correctIndex: 2,
        hint: "my_list = [1, 2, 3] – kvadrat mötərizə istifadə olunur."
      },
      {
        question: "Python list-ə element əlavə etmək üçün hansı metod istifadə olunur?",
        options: ["add()", "push()", "append()", "insert_last()"],
        correctIndex: 2,
        hint: "Bu metod elementi siyahının sonuna əlavə edir."
      }
    ]
  },
  {
    id: 3,
    levelName: "Level 3: Funksiyalar",
    title: "Python def ilə Funksiyalar",
    topic: "Functions",
    icon: "⚡",
    difficulty: "Çətin",
    xpReward: 200,
    goldReward: 100,
    isCodingQuest: true,
    description: "Python-da funksiyaları def açar sözü ilə necə yaratacağınızı öyrənin.",
    challenges: [
      {
        question: "Python-da funksiya təyin etmək üçün hansı açar sözdən istifadə olunur?",
        options: ["function", "def", "fn", "func"],
        correctIndex: 1,
        hint: "'def' sözü 'define' (müəyyənləşdirmək) sözünün qısaltmasıdır."
      }
    ]
  }
];

export const shopItems = [
  // ─── Gaming Avatars ───────────────────────────────────────────────────────
  {
    id: 1, name: "Steve (Minecraft)", emoji: "🟫",
    type: "Avatar", itemType: "avatar", price: 150, rarity: "Epic",
    game: "Minecraft", gameColor: "#4a7c2e",
    gameBg: "linear-gradient(135deg, #4a7c2e22 0%, #1a3a0c22 100%)",
    gameBorder: "rgba(74,124,46,0.4)",
    desc: "Minecraft'ın ikonik kahramanı, dünyaları inşa eder!"
  },
  {
    id: 2, name: "Creeper (Minecraft)", emoji: "💚",
    type: "Avatar", itemType: "avatar", price: 180, rarity: "Rare",
    game: "Minecraft", gameColor: "#22c55e",
    gameBg: "linear-gradient(135deg, #22c55e22 0%, #15803d22 100%)",
    gameBorder: "rgba(34,197,94,0.4)",
    desc: "Ssss... dikkatli ol! Patlayan Minecraft düşmanı."
  },
  {
    id: 3, name: "Jett (Valorant)", emoji: "🌬️",
    type: "Avatar", itemType: "avatar", price: 250, rarity: "Legendary",
    game: "Valorant", gameColor: "#06b6d4",
    gameBg: "linear-gradient(135deg, #06b6d422 0%, #0e749222 100%)",
    gameBorder: "rgba(6,182,212,0.5)",
    desc: "Valorant'ın en hızlı Ajan'ı. Rüzgar gibi geçer!"
  },
  {
    id: 4, name: "Reyna (Valorant)", emoji: "👁️",
    type: "Avatar", itemType: "avatar", price: 300, rarity: "Legendary",
    game: "Valorant", gameColor: "#8b5cf6",
    gameBg: "linear-gradient(135deg, #8b5cf622 0%, #5b21b622 100%)",
    gameBorder: "rgba(139,92,246,0.5)",
    desc: "Soul Harvest! Valorant'ın en güçlü duelist'i."
  },
  {
    id: 7, name: "Galaktik Proqramçı", emoji: "🚀",
    type: "Avatar", itemType: "avatar", price: 200, rarity: "Epic",
    game: "Questify", gameColor: "#f59e0b",
    gameBg: "linear-gradient(135deg, #f59e0b22 0%, #b4530a22 100%)",
    gameBorder: "rgba(245,158,11,0.4)",
    desc: "Questify'ın orijinal galaktik proqramçı avatarı."
  },
  // ─── Badges ───────────────────────────────────────────────────────────────
  {
    id: 2001, name: "C# Usta Nişanı", emoji: "🏆",
    type: "Nişan", itemType: "badge", price: 200, rarity: "Legendary",
    game: "Questify", gameColor: "#a855f7",
    gameBg: "linear-gradient(135deg, #a855f722 0%, #6d28d922 100%)",
    gameBorder: "rgba(168,85,247,0.4)",
    desc: "C# dilinin ustasısınız — bu nişan bunu kanıtlıyor!"
  },
  {
    id: 2002, name: "Kod Ninzya Nişanı", emoji: "🥷",
    type: "Nişan", itemType: "badge", price: 100, rarity: "Rare",
    game: "Questify", gameColor: "#94a3b8",
    gameBg: "linear-gradient(135deg, #94a3b822 0%, #47556922 100%)",
    gameBorder: "rgba(148,163,184,0.35)",
    desc: "Gölgede ilerleyen, kod ustası ninja."
  },
  // ─── Consumables ──────────────────────────────────────────────────────────
  {
    id: 5, name: "Can İksiri", emoji: "💖",
    type: "İksir", itemType: "potion_heart", price: 50, rarity: "Common",
    game: "RPG", gameColor: "#ef4444",
    gameBg: "linear-gradient(135deg, #ef444422 0%, #7f1d1d22 100%)",
    gameBorder: "rgba(239,68,68,0.35)",
    desc: "1 Can hakkı geri kazanın. Həftəlik limit: 1 dəfə."
  },
  {
    id: 6, name: "50/50 Joker", emoji: "🃏",
    type: "Joker", itemType: "joker_5050", price: 75, rarity: "Rare",
    game: "Quiz", gameColor: "#f59e0b",
    gameBg: "linear-gradient(135deg, #f59e0b22 0%, #78350f22 100%)",
    gameBorder: "rgba(245,158,11,0.4)",
    desc: "Sual zamanı 2 yanlış variantı aradan qaldırır. Bir dəfə istifadə edilə bilər."
  },
];

export const spinRewards = [
  { label: "+10 🪙", value: 10, type: "gold", color: "#f59e0b" },
  { label: "+50 🪙", value: 50, type: "gold", color: "#06b6d4" },
  { label: "+20 XP", value: 20, type: "xp", color: "#22c55e" },
  { label: "Yenidən", value: 0, type: "none", color: "#475569" },
  { label: "+100 🪙", value: 100, type: "gold", color: "#ec4899" },
  { label: "+30 XP", value: 30, type: "xp", color: "#8b5cf6" },
  { label: "+25 🪙", value: 25, type: "gold", color: "#ef4444" },
  { label: "JACKPOT!", value: 200, type: "gold", color: "#fbbf24" },
];

// AI Simulated Question Bot Repository — deep pool per language track
export const aiQuestionsPool = {
  'C#': [
    { topic: 'Variables', challenge: { question: 'C# dilində tam ədədləri saxlamaq üçün hansı tip istifadə olunur?', options: ['double', 'char', 'int', 'string'], correctIndex: 2, hint: 'Integer tipi 32-bitlik tam ədədlər üçündür.' } },
    { topic: 'Variables', challenge: { question: 'C#-da məntiqi dəyərlər (true/false) hansı tipdə saxlanılır?', options: ['bool', 'bit', 'logic', 'boolean'], correctIndex: 0, hint: 'C# primitiv tipi bool-dur.' } },
    { topic: 'Loops', challenge: { question: 'for (int i = 0; i < 4; i++) döngüsü neçə dəfə icra olunur?', options: ['3', '4', '5', 'Sonsuz'], correctIndex: 1, hint: 'i 0,1,2,3 olduqda şərt ödənilir.' } },
    { topic: 'Loops', challenge: { question: 'Hansı döngü ən azı bir dəfə mütləq icra olunur?', options: ['for', 'while', 'do-while', 'foreach'], correctIndex: 2, hint: 'Şərt blokdan sonra yoxlanılır.' } },
    { topic: 'Arrays', challenge: { question: '5 elementli int massivi yaratmaq üçün doğru sintaksis hansıdır?', options: ['int[] arr = new int[5];', 'int arr = new int(5);', 'array int[5];', 'int[5] arr;'], correctIndex: 0, hint: 'new int[5] yaddaş ayırır.' } },
    { topic: 'Arrays', challenge: { question: 'Massivin son elementinə çatmaq üçün hansı ifadə doğrudur?', options: ['arr[length]', 'arr[length - 1]', 'arr[-1]', 'arr.last()'], correctIndex: 1, hint: 'İndekslər 0-dan başlayır.' } },
    { topic: 'Classes', challenge: { question: 'C#-da yeni obyekt yaratmaq üçün hansı açar söz istifadə olunur?', options: ['create', 'new', 'make', 'object'], correctIndex: 1, hint: 'Konstruktoru çağırır və yaddaş ayırır.' } },
    { topic: 'Classes', challenge: { question: 'Sinif üzvlərini gizlətmək üçün hansı access modifier istifadə olunur?', options: ['public', 'private', 'open', 'hide'], correctIndex: 1, hint: 'Encapsulation prinsipinə uyğundur.' } },
    { topic: 'Strings', challenge: { question: 'String uzunluğunu almaq üçün hansı property/metod istifadə olunur?', options: ['.size', '.count', '.Length', '.len()'], correctIndex: 2, hint: 'C#-da Length property-sidir.' } },
    { topic: 'Strings', challenge: { question: '"Salam" + " Dünya" ifadəsi nə qaytarır?', options: ['Salam Dünya', 'Salam+Dünya', 'Xəta', 'null'], correctIndex: 0, hint: '+ operatoru string birləşdirmə edir.' } },
    { topic: 'Methods', challenge: { question: 'Metod heç nə qaytarmırsa hansı return tipi yazılır?', options: ['null', 'void', 'empty', 'none'], correctIndex: 1, hint: 'void — geri dönüşsüz metod.' } },
    { topic: 'Algorithms', challenge: { question: 'Linear axtarış (linear search) massivdə elementi necə tapır?', options: ['Binary bölünmə ilə', 'Sıralama ilə', 'Başdan sona bir-bir yoxlayaraq', 'Hash cədvəli ilə'], correctIndex: 2, hint: 'Hər element ardıcıl yoxlanılır.' } },
    { topic: 'Algorithms', challenge: { question: 'Bubble sort alqoritminin əsas ideyası nədir?', options: ['Massivi yarıya bölüb axtarış', 'Qonşu elementləri müqayisə edib dəyişdirmək', 'Hash funksiyası ilə indeksləmək', 'Rekursiv birləşdirmə'], correctIndex: 1, hint: 'Kiçik elementlər "üzə" qalxır.' } },
    { topic: 'Inheritance', challenge: { question: 'Varislik almaq üçün sinif adından sonra hansı simvol yazılır?', options: [':', '->', 'extends', 'implements'], correctIndex: 0, hint: 'class Dog : Animal formatı.' } },
    { topic: 'OOP', challenge: { question: 'Polimorfizm nə deməkdir?', options: ['Eyni interfeys, fərqli davranış', 'Yalnız bir sinif', 'Massiv yaratmaq', 'Döngü istifadəsi'], correctIndex: 0, hint: 'Bir metod müxtəlif obyektlərdə fərqli işləyə bilər.' } },
    { topic: 'Conditionals', challenge: { question: 'if-else if-else zanjirində ilk doğru şərt tapılanda nə baş verir?', options: ['Hamısı icra olunur', 'Yalnız həmin blok icra olunur, qalanı atlanır', 'Xəta verir', 'Sonsuz döngü'], correctIndex: 1, hint: 'Yalnız bir branch seçilir.' } },
    { topic: 'Collections', challenge: { question: 'List<T> massivdən fərqli olaraq nəyi dəstəkləyir?', options: ['Sabit ölçü', 'Dinamik böyümə', 'Yalnız string', 'Yalnız int'], correctIndex: 1, hint: 'Element əlavə/silmə asandır.' } },
    { topic: 'Exceptions', challenge: { question: 'Xətaları tutmaq üçün hansı blok istifadə olunur?', options: ['catch-try', 'try-catch', 'error-handle', 'finally-only'], correctIndex: 1, hint: 'try blokunda kod, catch-də xəta tutulur.' } },
  ],
  Java: [
    { topic: 'Basics', challenge: { question: 'Java-da ekrana çıxış üçün standart metod hansıdır?', options: ['Console.WriteLine()', 'print()', 'System.out.println()', 'echo()'], correctIndex: 2, hint: 'System.out obyektinin println metodu.' } },
    { topic: 'Basics', challenge: { question: 'Java proqramının giriş nöqtəsi hansı metoddur?', options: ['start()', 'run()', 'main()', 'public static void main(String[] args)'], correctIndex: 3, hint: 'JVM bu metoddan başlayır.' } },
    { topic: 'Variables', challenge: { question: 'Java primitiv tam ədəd tipi hansıdır?', options: ['Integer', 'INT', 'int', 'number'], correctIndex: 2, hint: 'Kiçik hərflə yazılır.' } },
    { topic: 'Loops', challenge: { question: 'while döngüsü nə vaxt dayanır?', options: ['10 dəfədən sonra', 'Şərt false olduqda', 'main bitəndə', 'Heç vaxt'], correctIndex: 1, hint: 'Şərt yoxlanılır, false olarsa çıxır.' } },
    { topic: 'Loops', challenge: { question: 'for-each döngüsü (enhanced for) nə üçün idealdır?', options: ['Kolleksiya üzərində gəzmək', 'Sonsuz döngü', 'Rekursiya', 'Fayl yazmaq'], correctIndex: 0, hint: 'for (Type item : collection) sintaksisi.' } },
    { topic: 'Arrays', challenge: { question: 'Java-da 3 elementli int massivi necə yaradılır?', options: ['int[] arr = {1, 2, 3};', 'int arr = new int(3);', 'array[3] int;', 'int(3)[] arr;'], correctIndex: 0, hint: 'Mötərizə və ya new int[3] istifadə olunur.' } },
    { topic: 'Arrays', challenge: { question: 'Massivin uzunluğu hansı property ilə alınır?', options: ['.size', '.length', '.count', '.len'], correctIndex: 1, hint: 'Java massivlərində length field-dir.' } },
    { topic: 'Classes', challenge: { question: 'Java-da obyekt yaratmaq üçün hansı açar söz lazımdır?', options: ['create', 'new', 'alloc', 'instance'], correctIndex: 1, hint: 'new ClassName() sintaksisi.' } },
    { topic: 'Classes', challenge: { question: 'Miras almaq üçün hansı açar söz istifadə olunur?', options: ['implements', 'inherits', 'extends', 'derives'], correctIndex: 2, hint: 'class Dog extends Animal.' } },
    { topic: 'Strings', challenge: { question: 'String obyektini yaratmaq üçün hansı ifadə doğrudur?', options: ['String s = "Salam";', 'string s = new string;', 'Str s = "Salam";', 'char[] s = "Salam";'], correctIndex: 0, hint: 'String literal və ya new String().' } },
    { topic: 'Strings', challenge: { question: 'StringBuilder nə üçün istifadə olunur?', options: ['Sabit string', 'Effektiv string birləşdirmə', 'Massiv yaratmaq', 'Fayl oxumaq'], correctIndex: 1, hint: 'Çox sayda + əməliyyatında sürətlidir.' } },
    { topic: 'Collections', challenge: { question: 'Dinamik siyahı üçün ən çox istifadə olunan sinif hansıdır?', options: ['Array', 'ArrayList', 'HashSet', 'Stack'], correctIndex: 1, hint: 'java.util.ArrayList.' } },
    { topic: 'Collections', challenge: { question: 'HashMap nə saxlayır?', options: ['Yalnız ədədlər', 'Açar-dəyər cütləri', 'Sıralı siyahı', 'Bitlər'], correctIndex: 1, hint: 'Key-value strukturu.' } },
    { topic: 'OOP', challenge: { question: 'Interface implement etmək üçün hansı açar söz istifadə olunur?', options: ['extends', 'implements', 'inherits', 'uses'], correctIndex: 1, hint: 'class MyClass implements MyInterface.' } },
    { topic: 'Algorithms', challenge: { question: 'Binary search hansı şərtdə işləyir?', options: ['Massiv sıralı olmalıdır', 'Massiv boş olmalıdır', 'Yalnız string massivində', 'Heç vaxt'], correctIndex: 0, hint: 'Orta elementlə müqayisə edərək yarıya bölür.' } },
    { topic: 'Algorithms', challenge: { question: 'Factorial hesablamaq üçün hansı yanaşma tez-tez istifadə olunur?', options: ['Rekursiya və ya döngü', 'Yalnız switch', 'Yalnız interface', 'Serialization'], correctIndex: 0, hint: 'n! = n * (n-1)!.' } },
    { topic: 'Exceptions', challenge: { question: 'Yoxlanılan exception (checked) tutmaq üçün nə lazımdır?', options: ['Yalnız if', 'try-catch və ya throws', 'import', 'static'], correctIndex: 1, hint: 'Compile zamanı tutulmalıdır.' } },
    { topic: 'Modifiers', challenge: { question: 'static açar sözü metod üçün nə deməkdir?', options: ['Obyekt olmadan çağırıla bilər', 'Yalnız private', 'Heç vaxt override oluna bilməz', 'Abstract deməkdir'], correctIndex: 0, hint: 'ClassName.method() ilə çağırılır.' } },
  ],
  Python: [
    { topic: 'Basics', challenge: { question: 'Python-da ekrana çıxış funksiyası hansıdır?', options: ['echo()', 'Console.WriteLine()', 'System.out.println()', 'print()'], correctIndex: 3, hint: 'print("Salam") — ən sadə çıxış.' } },
    { topic: 'Basics', challenge: { question: 'Python-da şərh (comment) hansı simvolla başlayır?', options: ['//', '/*', '#', '--'], correctIndex: 2, hint: '# sətirdən sonrakı hər şey şərhdir.' } },
    { topic: 'Variables', challenge: { question: 'Python-da dəyişən necə yaradılır?', options: ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'], correctIndex: 2, hint: 'Tip elanı lazım deyil — dinamik tip.' } },
    { topic: 'Loops', challenge: { question: 'range(5) for döngüsündə neçə iterasiya olur?', options: ['4', '5', '6', '0'], correctIndex: 1, hint: '0, 1, 2, 3, 4 — cəmi 5.' } },
    { topic: 'Loops', challenge: { question: 'while True: döngüsü necə dayandırılır?', options: ['Avtomatik', 'break ilə', 'Yalnız F5', 'Heç vaxt dayanmır'], correctIndex: 1, hint: 'break açar sözü döngünü kəsir.' } },
    { topic: 'Lists', challenge: { question: 'Python list sintaksisi hansıdır?', options: ['{1, 2}', '(1, 2)', '[1, 2, 3]', '<1, 2>'], correctIndex: 2, hint: 'Kvadrat mötərizə istifadə olunur.' } },
    { topic: 'Lists', challenge: { question: 'List-ə sona element əlavə etmək üçün hansı metod?', options: ['add()', 'push()', 'append()', 'insert_last()'], correctIndex: 2, hint: 'my_list.append(item).' } },
    { topic: 'Lists', challenge: { question: 'List slicing: arr[1:4] nə qaytarır?', options: ['1-ci element', '1-dən 3-ə qədər (4 daxil deyil)', 'Bütün list', 'Son element'], correctIndex: 1, hint: 'Başlanğıc daxil, son excluded.' } },
    { topic: 'Functions', challenge: { question: 'Funksiya təyin etmək üçün hansı açar söz?', options: ['function', 'def', 'fn', 'func'], correctIndex: 1, hint: 'def my_func(): formatı.' } },
    { topic: 'Functions', challenge: { question: 'Funksiyadan dəyər qaytarmaq üçün hansı açar söz?', options: ['return', 'give', 'output', 'yield-only'], correctIndex: 0, hint: 'return ifadəsi dəyəri geri verir.' } },
    { topic: 'Strings', challenge: { question: '"hello".upper() nə qaytarır?', options: ['hello', 'HELLO', 'Hello', 'Xəta'], correctIndex: 1, hint: 'upper() bütün hərfləri böyük edir.' } },
    { topic: 'Strings', challenge: { question: 'f-string (f"...") nə üçün istifadə olunur?', options: ['Fayl açmaq', 'Dəyişən daxil etmək', 'Funksiya yaratmaq', 'Loop'], correctIndex: 1, hint: 'f"Salam {name}" formatı.' } },
    { topic: 'Classes', challenge: { question: 'Python-da sinif təyin etmək üçün hansı açar söz?', options: ['class', 'struct', 'object', 'type'], correctIndex: 0, hint: 'class MyClass: sintaksisi.' } },
    { topic: 'Classes', challenge: { question: 'Obyekt konstruktoru hansı metoddur?', options: ['__init__', '__main__', '__start__', '__new__only'], correctIndex: 0, hint: '__init__(self, ...) obyekt yaradılanda çağırılır.' } },
    { topic: 'Dictionaries', challenge: { question: 'Python dict (lüğət) hansı simvolla yazılır?', options: ['[]', '{}', '()', '<>'], correctIndex: 1, hint: '{"açar": "dəyər"} formatı.' } },
    { topic: 'Algorithms', challenge: { question: 'List comprehension [x*2 for x in range(3)] nə qaytarır?', options: ['[0, 2, 4]', '[1, 2, 3]', '[2, 4, 6]', 'Xəta'], correctIndex: 0, hint: 'x 0,1,2 olduqda x*2 hesablanır.' } },
    { topic: 'Algorithms', challenge: { question: 'len([10, 20, 30]) nə qaytarır?', options: ['30', '3', '10', '0'], correctIndex: 1, hint: 'len() element sayını verir.' } },
    { topic: 'Conditionals', challenge: { question: 'Python-da elif nə deməkdir?', options: ['else if', 'error if', 'end if', 'each if'], correctIndex: 0, hint: 'else if-in qısa formasıdır.' } },
    { topic: 'Modules', challenge: { question: 'Modul import etmək üçün hansı açar söz?', options: ['include', 'import', 'using', 'require-only-js'], correctIndex: 1, hint: 'import math — standart sintaksis.' } },
  ],
};

/** Pick a random question for the given language track */
export function getRandomAiQuestion(language) {
  const pool = aiQuestionsPool[language] || aiQuestionsPool['C#'];
  return pool[Math.floor(Math.random() * pool.length)];
}
