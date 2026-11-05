// ============================================================
// 01-firebase.js — Firebase, константы, утилиты
// ВСЁ ГЛОБАЛЬНОЕ лежит на window, чтобы другие файлы видели
// ============================================================

// ============ FIREBASE ============
const firebaseConfig = {
    apiKey: "AIzaSyB1RMZq_dgr4fB5UYUyiSbF9NljAzOO-O8",
    authDomain: "kotogram-fc725.firebaseapp.com",
    databaseURL: "https://kotogram-fc725-default-rtdb.firebaseio.com",
    projectId: "kotogram-fc725",
    storageBucket: "kotogram-fc725.firebasestorage.app",
    messagingSenderId: "870727971853",
    appId: "1:870727971853:web:1802670c59c983e2aa1144"
};
firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

// ============ КОНСТАНТЫ ============
window.HARDCODED_MASTER_KEY = 'K0t0gr@mM@sterKey2024!';
window.MASTER_KEY = localStorage.getItem('kotogram_master_key') || '';
window.isMasterKeyValid = (window.MASTER_KEY === window.HARDCODED_MASTER_KEY);

window.IMG = {
    baron:   '51.png',
    strazh:  '52.png',
    geroy:   '53.png',
    aspid:   '54.png',
    skvid:   '55.png',
    glava:   '56.png',
    elita:   '57.png',
    titan:   '58.png',
    prints:  '59.png',
    knyaz:   '60.png',
    gertsog: '61.png',
    token:   '70.png',
    case:    '77.png',
    chest_closed: 'chest_turntable-1.webp',
    chest_open:   'i (18).web',
    mob1: 'mob-zombie.avif',
    mob2: 'mobs-enderman.avif',
    mob3: 'mob-sheep.avif',
    mob4: '90360fa82ce7e8051c4e9daa8cb4574a.jpg',
    mob5: '1585182676_552px-strider.png',
    mob6: '61390fbf6973b0fe18e0abd46b1c756e.png',
    gold_cat: 'gold_cat.png'
};

window.ROLES = {
    igrok:    { name: "Игрок",  emoji: "🎮", level: 1,  cls: "role-igrok",    img: null },
    baron:    { name: "Барон",  emoji: "🎩", level: 2,  cls: "role-baron",    img: IMG.baron },
    strazh:   { name: "Страж",  emoji: "🛡️", level: 3,  cls: "role-strazh",   img: IMG.strazh },
    geroy:    { name: "Герой",  emoji: "⚔️", level: 4,  cls: "role-geroy",    img: IMG.geroy },
    aspid:    { name: "Аспид",  emoji: "🐍", level: 5,  cls: "role-aspid",    img: IMG.aspid },
    skvid:    { name: "Сквид",  emoji: "🦑", level: 6,  cls: "role-skvid",    img: IMG.skvid },
    glava:    { name: "Глава",  emoji: "👑", level: 7,  cls: "role-glava",    img: IMG.glava },
    elita:    { name: "Элита",  emoji: "💎", level: 8,  cls: "role-elita",    img: IMG.elita },
    titan:    { name: "Титан",  emoji: "🔱", level: 9,  cls: "role-titan",    img: IMG.titan },
    prints:   { name: "Принц",  emoji: "🤴", level: 10, cls: "role-prints",   img: IMG.prints },
    knyaz:    { name: "Князь",  emoji: "👑✨", level: 11, cls: "role-knyaz",  img: IMG.knyaz },
    gertsog:  { name: "Герцог", emoji: "🏰", level: 12, cls: "role-gertsog",  img: IMG.gertsog }
};

window.THEMES = {
    light:         { name: '☀️ Светлая',        cls: '',                      req: null,            reqText: 'Для всех',          tp: 'tp-light' },
    dark:          { name: '🌙 Тёмная',         cls: 'dark',                  req: null,            reqText: 'Для всех',          tp: 'tp-dark' },
    bronze:        { name: '🎩 Бронзовая',      cls: 'theme-bronze',          req: 'baron',         reqText: 'Барон+',            tp: 'tp-bronze' },
    silver:        { name: '🛡️ Серебряная',     cls: 'theme-silver',          req: 'strazh',        reqText: 'Страж+',            tp: 'tp-silver' },
    royal_blue:    { name: '⚔️ Королевская',    cls: 'theme-royal_blue',      req: 'geroy',         reqText: 'Герой+',            tp: 'tp-royal_blue' },
    poison:        { name: '🐍 Ядовитая',       cls: 'theme-poison',          req: 'aspid',         reqText: 'Аспид+',            tp: 'tp-poison' },
    shadow:        { name: '🦑 Теневая',        cls: 'theme-shadow',          req: 'skvid',         reqText: 'Сквид+',            tp: 'tp-shadow' },
    gold:          { name: '👑 Золотая',        cls: 'theme-gold',            req: 'glava',         reqText: 'Глава+',            tp: 'tp-gold' },
    aqua:          { name: '💎 Бирюзовая',      cls: 'theme-aqua',            req: 'elita',         reqText: 'Элита+',            tp: 'tp-aqua' },
    titan_orange:  { name: '🔱 Оранжевая',      cls: 'theme-titan_orange',    req: 'titan',         reqText: 'Титан+',            tp: 'tp-titan_orange' },
    purple_gold:   { name: '🤴 Пурпур+золото',  cls: 'theme-purple_gold',     req: 'prints',        reqText: 'Принц+',            tp: 'tp-purple_gold' },
    rainbow:       { name: '👑✨ Радужная',     cls: 'theme-rainbow',         req: 'knyaz',         reqText: 'Князь+',            tp: 'tp-rainbow' },
    royal_blood:   { name: '🏰 Кровь+золото',   cls: 'theme-royal_blood',     req: 'gertsog',       reqText: 'Герцог+',           tp: 'tp-royal_blood' },
    custom:        { name: '🌈 Своя тема',      cls: 'theme-custom',          req: 'custom',        reqText: 'Токен-Шоп (5💎)',   tp: 'tp-custom' }
};

window.ROLE_THEMES = {
    igrok:   { cls: 'theme-igrok',        label: '🎮 Серая классика',    desc: 'Стандартный серый фон' },
    baron:   { cls: 'theme-baron',        label: '🎩 Бронзовый стиль',   desc: 'Тёплый бронзовый оттенок' },
    strazh:  { cls: 'theme-strazh',       label: '🛡️ Серебряный',       desc: 'Металлический серый' },
    geroy:   { cls: 'theme-geroy',        label: '⚔️ Синий герой',      desc: 'Глубокий синий градиент' },
    aspid:   { cls: 'theme-aspid',        label: '🐍 Зелёный яд',       desc: 'Тёмно-зелёный градиент' },
    skvid:   { cls: 'theme-skvid',        label: '🦑 Фиолетовая тень',  desc: 'Глубокий пурпур' },
    glava:   { cls: 'theme-glava',        label: '👑 Золотой лидер',    desc: 'Золотой фон, чёрный текст' },
    elita:   { cls: 'theme-elita',        label: '💎 Голубая элита',    desc: 'Бирюзовый премиум' },
    titan:   { cls: 'theme-titan',        label: '🔱 Оранжевый титан',  desc: 'Яркий оранжевый' },
    prints:  { cls: 'theme-prints',       label: '🤴 Пурпур принца',    desc: 'Пурпур + золото' },
    knyaz:   { cls: 'theme-knyaz',        label: '👑✨ Радуга князя',   desc: 'Переливы всех цветов' },
    gertsog: { cls: 'theme-gertsog',      label: '🏰 Золото+кровь',     desc: 'Пульсирующий красно-золотой' }
};

window.ROLE_ABILITIES = {
    igrok: { subtitle: 'Базовый уровень', features: [ { icon: '🎮', name: 'Игры', desc: 'Марио, слоты, блэкджек, рыбалка' }, { icon: '💬', name: 'Общий чат', desc: 'Общайся со всеми' }, { icon: '📩', name: 'Личные сообщения', desc: 'Пиши кому хочешь' }, { icon: '🛒', name: 'Магазин', desc: 'Покупка котостей за койны' }, { icon: '🎯', name: 'Квесты', desc: 'Ежедневные и еженедельные' }, { icon: '🔨', name: 'Аукцион', desc: 'Участие в торгах' } ] },
    baron: { subtitle: 'Первый шаг к величию', features: [ { icon: '✅', name: 'Всё от Игрока', desc: 'Все базовые возможности' }, { icon: '🎨', name: 'Бронзовая тема', desc: 'Открывает тему 🎩' }, { icon: '🏅', name: 'Бейдж Барона', desc: 'Особая отметка' }, { icon: '💬', name: 'Приоритет в чате', desc: 'Сообщения выделены' }, { icon: '🖼️', name: 'Своя аватарка', desc: 'Можешь загрузить своё фото' } ] },
    strazh: { subtitle: 'Страж порядка', features: [ { icon: '✅', name: 'Всё от Барона', desc: 'Все прошлые возможности' }, { icon: '🛡️', name: 'Серебряная тема', desc: 'Открывает тему 🛡️' }, { icon: '🛡️', name: 'Иммунитет к муту', desc: 'Никто ниже не может замутить' }, { icon: '⚡', name: 'Быстрая поддержка', desc: 'Отвечают первыми' }, { icon: '📈', name: '+10% койнов', desc: 'Бонус к наградам' } ] },
    geroy: { subtitle: 'Герой Котограма', features: [ { icon: '✅', name: 'Всё от Стража', desc: 'Все прошлые возможности' }, { icon: '⚔️', name: 'Королевская тема', desc: 'Открывает тему ⚔️' }, { icon: '⚔️', name: 'Эксклюзивные квесты', desc: '5 дополнительных' }, { icon: '🎖️', name: 'Кастомный бейдж', desc: 'Свой эмодзи у ника' }, { icon: '💰', name: '+25% в игре', desc: 'Больше за победы' } ] },
    aspid: { subtitle: 'Ядовитый мститель', features: [ { icon: '✅', name: 'Всё от Героя', desc: 'Все прошлые возможности' }, { icon: '🐍', name: 'Ядовитая тема', desc: 'Открывает тему 🐍' }, { icon: '🐍', name: 'Мут на 1 час', desc: 'Мутить Игроков' }, { icon: '💚', name: 'Зелёный ник', desc: 'Выделяйся в чате' }, { icon: '📈', name: '+35% койнов', desc: 'Бонус к наградам' } ] },
    skvid: { subtitle: 'Тень в сети', features: [ { icon: '✅', name: 'Всё от Аспида', desc: 'Все прошлые возможности' }, { icon: '🦑', name: 'Теневая тема', desc: 'Открывает тему 🦑' }, { icon: '🦑', name: 'Анонимный режим', desc: 'Пиши без ника' }, { icon: '👻', name: 'Скрытие онлайна', desc: 'Никто не видит тебя' }, { icon: '📈', name: '+50% койнов', desc: 'Бонус к наградам' } ] },
    glava: { subtitle: 'Глава клана', features: [ { icon: '✅', name: 'Всё от Сквида', desc: 'Все прошлые возможности' }, { icon: '👑', name: 'Золотая тема', desc: 'Открывает тему 👑' }, { icon: '👑', name: 'Создание квестов', desc: 'Свои задания' }, { icon: '💼', name: 'VIP-бейдж', desc: 'Золотая отметка' }, { icon: '📈', name: '+75% койнов', desc: 'Бонус к наградам' } ] },
    elita: { subtitle: 'Элита общества', features: [ { icon: '✅', name: 'Всё от Главы', desc: 'Все прошлые возможности' }, { icon: '💎', name: 'Бирюзовая тема', desc: 'Открывает тему 💎' }, { icon: '💎', name: 'Приватный чат', desc: 'Свой закрытый канал' }, { icon: '🎁', name: 'Подарки друзьям', desc: 'Дари койны' }, { icon: '📈', name: '×2 койнов', desc: 'Двойные награды' } ] },
    titan: { subtitle: 'Титан силы', features: [ { icon: '✅', name: 'Всё от Элиты', desc: 'Все прошлые возможности' }, { icon: '🔱', name: 'Оранжевая тема', desc: 'Открывает тему 🔱' }, { icon: '🔱', name: 'Кик из чата', desc: 'На 24 часа' }, { icon: '⚡', name: '×2 в игре', desc: 'Двойные койны' }, { icon: '📈', name: '×2.5 койнов', desc: 'Бонус к наградам' } ] },
    prints: { subtitle: 'Принц крови', features: [ { icon: '✅', name: 'Всё от Титана', desc: 'Все прошлые возможности' }, { icon: '🤴', name: 'Пурпур+золото тема', desc: 'Открывает тему 🤴' }, { icon: '🤴', name: 'Мут навсегда', desc: 'Мутить кого угодно ниже' }, { icon: '🎭', name: 'Свой статус', desc: 'Напиши статус' }, { icon: '📈', name: '×3 койнов', desc: 'Бонус к наградам' } ] },
    knyaz: { subtitle: 'Князь тьмы', features: [ { icon: '✅', name: 'Всё от Принца', desc: 'Все прошлые возможности' }, { icon: '👑✨', name: 'Радужная тема', desc: 'Открывает тему 🌈' }, { icon: '👑✨', name: 'Теневой бан', desc: 'Скрыть юзера' }, { icon: '📋', name: 'Доступ к аудиту', desc: 'Видишь все логи' }, { icon: '📈', name: '×4 койнов', desc: 'Бонус к наградам' } ] },
    gertsog: { subtitle: '🏰 Вершина власти', features: [ { icon: '✅', name: 'Всё от Князя', desc: 'Все прошлые возможности' }, { icon: '🏰', name: 'Кровь+золото тема', desc: 'Открывает тему 🏰' }, { icon: '🏰', name: 'Модерация', desc: 'Бан/мут кого угодно' }, { icon: '👑', name: 'Золотой ник', desc: 'Максимальное выделение' }, { icon: '📈', name: '×5 койнов', desc: 'Бонус к наградам' } ] }
};

window.ROLE_PRICES = {
    baron:   { d30: 4.9,   d90: 12.9, forever: 24.9 },
    strazh:  { d30: 8.9,   d90: 22.9, forever: 44.9 },
    geroy:   { d30: 14.9,  d90: 37.9, forever: 69.9 },
    aspid:   { d30: 22.9,  d90: 57.9, forever: 109.9 },
    skvid:   { d30: 29.9,  d90: 74.9, forever: 139.9 },
    glava:   { d30: 39.9,  d90: 99.9, forever: 189.9 },
    elita:   { d30: 59.9,  d90: 149.9, forever: 279.9 },
    titan:   { d30: 89.9,  d90: 219.9, forever: 399.9 },
    prints:  { d30: 129.9, d90: 319.9, forever: 599.9 },
    knyaz:   { d30: 189.9, d90: 459.9, forever: 799.9 },
    gertsog: { d30: 249.9, d90: 599.9, forever: 999.9 }
};

window.CASE_DROP = [
    { role: 'baron',  chance: 22 }, { role: 'strazh', chance: 18 },
    { role: 'geroy',  chance: 15 }, { role: 'aspid',  chance: 12 },
    { role: 'skvid',  chance: 10 }, { role: 'glava',  chance: 8  },
    { role: 'elita',  chance: 6  }, { role: 'titan',  chance: 4  },
    { role: 'prints', chance: 3  }, { role: 'knyaz',  chance: 2  }
];

window.DEFAULT_USERS = [
    { username: "Филипп", password: "Ph!1ipp_K0t2025", role: "admin", coins: "Infinity", tokens: "Infinity" },
    { username: "Фёдор", password: "F3d0r_K0t#777", role: "user", coins: 150, tokens: 0 },
    { username: "Слава", password: "Sl@v@_11!!XX", role: "user", coins: 0, tokens: 0 },
    { username: "Коля Шмелев", password: "Shm3l3v#88xK", role: "user", coins: 0, tokens: 0 },
    { username: "Коля Демаков", password: "D3m@kov_77qQ", role: "user", coins: 0, tokens: 0 },
    { username: "Даня", password: "D@ny@_Pro2025!", role: "user", coins: 0, tokens: 0 },
    { username: "Марк", password: "M@rk_K0t#228", role: "user", coins: 0, tokens: 0 },
    { username: "Костя", password: "K0styan$ecure", role: "user", coins: 0, tokens: 0 },
    { username: "Миша", password: "M!sha_333@Cat", role: "user", coins: 0, tokens: 0 },
    { username: "Ваня", password: "V@nya_007#Boss", role: "user", coins: 0, tokens: 0 },
    { username: "Тестер1", password: "T3st#1111", role: "tester", coins: 500, tokens: 0 },
    { username: "Тестер2", password: "T3st#2222", role: "tester", coins: 500, tokens: 0 },
    { username: "Тестер3", password: "T3st#3333", role: "tester", coins: 500, tokens: 0 }
];

window.RESERVED_NAMES = ['Филипп', 'филипп', 'admin', 'админ', 'system', 'система', 'Тестер1', 'Тестер2', 'Тестер3'];

window.PROMO = {
    "KOTOSTART": 50, "BIGKOT": 100, "MEOW50": 50, "GOLDEN100": 100, "LUCKY777": 77,
    "KOTO2025": 200, "MEOWKING": 500, "KOTIK777": 77, "SUPERCAT": 300, "FELIX2025": 250,
    "MURMUR": 150, "KOTOFEY": 400, "BARSIK": 350, "PUSHOK": 100, "MURZIK": 180,
    "KOTVASYA": 220, "VASILIY": 300, "LEOPOLD": 275, "MATROSKIN": 225, "KOTOVSKIY": 320,
    "ЖЫГУЛИ": 175, "PAWSOF": 210, "KOTOLAND": 550, "SUPERKOT": 450, "KOTOMASTER": 600
};

window.SHOP = [
    { name:"🌿 Золотая черемша", price:500 },
    { name:"💎 Бриллиантовая котость", price:700 },
    { name:"💜 Аметистовая котость", price:900 },
    { name:"🔷 Синий бриллиант котость", price:1000 },
    { name:"🔴 Рубиновая котость", price:1500 },
    { name:"🟢 Бог котостей (зелёный свет)", price:2500 }
];

window.WHEEL_PRIZES = [
    { prize: 1, prob: 0.10 }, { prize: 5, prob: 0.15 },
    { prize: 10, prob: 0.15 }, { prize: 100, prob: 0.30 },
    { prize: 200, prob: 0.20 }, { prize: 300, prob: 0.10 }
];
const totalProb = WHEEL_PRIZES.reduce((sum, item) => sum + item.prob, 0);
WHEEL_PRIZES.forEach(item => item.prob /= totalProb);
window.WHEEL_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#845ef7'];

window.DAILY_QUESTS = [
    { id: 'msg3', desc: 'Отправить 3 сообщения', target: 3, reward: 10, type: 'daily' },
    { id: 'wheel1', desc: 'Прокрутить колесо', target: 1, reward: 20, type: 'daily' },
    { id: 'buy1', desc: 'Купить 1 товар', target: 1, reward: 30, type: 'daily' },
    { id: 'slot1', desc: 'Крутить слоты 1 раз', target: 1, reward: 15, type: 'daily' },
    { id: 'slot5', desc: 'Крутить слоты 5 раз', target: 5, reward: 50, type: 'daily' },
    { id: 'fish1', desc: 'Поймать 1 рыбу', target: 1, reward: 20, type: 'daily' },
    { id: 'bj1', desc: 'Сыграть в Блэкджек 1 раз', target: 1, reward: 25, type: 'daily' }
];
window.WEEKLY_QUESTS = [
    { id: 'msg20', desc: 'Отправить 20 сообщений', target: 20, reward: 100, type: 'weekly' },
    { id: 'wheel5', desc: 'Прокрутить колесо 5 раз', target: 5, reward: 150, type: 'weekly' },
    { id: 'buy3', desc: 'Купить 3 товара', target: 3, reward: 200, type: 'weekly' },
    { id: 'fish10', desc: 'Поймать 10 рыб', target: 10, reward: 300, type: 'weekly' },
    { id: 'bj10', desc: 'Сыграть в Блэкджек 10 раз', target: 10, reward: 250, type: 'weekly' }
];
window.ACHIEVEMENTS = {
    buyer: { emoji: '🛒', name: 'Покупатель', desc: 'Купить 1 товар' },
    chatter: { emoji: '💬', name: 'Болтун', desc: 'Отправить 10 сообщений' },
    lucky: { emoji: '🎰', name: 'Счастливчик', desc: 'Выиграть 300🐾 в колесе' },
    auctioneer: { emoji: '🔨', name: 'Аукционер', desc: 'Сделать ставку' },
    admin: { emoji: '👑', name: 'Админ', desc: 'Быть админом' },
    slots_player: { emoji: '🎰', name: 'Слот-игрок', desc: 'Крутить слоты' },
    slot_jackpot: { emoji: '💎', name: 'Джекпот', desc: 'Выиграть ×25+ в слотах' },
    fisher: { emoji: '🎣', name: 'Рыбак', desc: 'Поймать 10 рыб' },
    master_fisher: { emoji: '🏆', name: 'Мастер-рыбак', desc: 'Поймать 100 рыб' },
    legend_fisher: { emoji: '🐉', name: 'Легенда', desc: 'Поймать Кото-Рыбу' },
    investor: { emoji: '💎', name: 'Инвестор', desc: 'Вложить в Вин-Топ 5000+ 🐾' },
    clan_leader: { emoji: '🏰', name: 'Лидер клана', desc: 'Создать клан' },
    bj_player: { emoji: '🃏', name: 'Картёжник', desc: 'Сыграть в Блэкджек' },
    bj_blackjack: { emoji: '🎉', name: 'Блэкджек!', desc: 'Собрать 21 с двух карт' },
    theme_collector: { emoji: '🎨', name: 'Коллекционер тем', desc: 'Открыть 5+ тем' },
    stickman_fighter: { emoji: '🥊', name: 'Боец', desc: 'Выиграть в Stickman Fight' }
};

window.TOKEN_SHOP_ITEMS = [
   { id: 'kotos_custom', icon: '🖌️', img: '10253124742.jpg', name: 'Котость на заказ', price: 5, cat: 'Котости', desc: 'Уникальная котость — её тебе нарисует админ в ближайшее время.' },
    { id: 'emoji_custom', icon: '🎭', img: null, name: 'Кастомный эмодзи', price: 3, cat: 'Котости', desc: 'Твой личный смайл рядом с ником в чате.' },
    { id: 'theme_custom', icon: '🌈', img: null, name: 'Своя тема', price: 5, cat: 'Котости', desc: 'Открывает тему 🌈 в модалке выбора темы.' },
    { id: 'nick_anim', icon: '✨', img: null, name: 'Анимация ника', price: 4, cat: 'Котости', desc: 'Введи: огонь, вода, молния или радуга' },
    { id: 'avatar_custom', icon: '🐱', img: 'https://i.pinimg.com/736x/48/11/b7/4811b79d92aa70e602b16cca5727a198.jpg', name: 'Свой аватар', price: 3, cat: 'Котости', desc: 'Откроет загрузку фото на аватар (сразу).' },
    { id: 'vip_badge', icon: '👑', img: null, name: 'VIP-бейдж', price: 2, cat: 'Статус', desc: 'Особая отметка VIP в профиле.' },
    { id: 'verified', icon: '⭐', img: null, name: 'Проверенный', price: 3, cat: 'Статус', desc: 'Синяя галочка ✅ у ника, как в TikTok.' },
    { id: 'tourn_badge', icon: '🏆', img: null, name: 'Бейдж турнира', price: 2, cat: 'Статус', desc: 'Значок победителя.' },
    { id: 'legend_badge', icon: '🎖️', img: null, name: 'Легенда', price: 5, cat: 'Статус', desc: 'Редкий бейдж для легенд.' },
    { id: 'status_custom', icon: '🎭', img: null, name: 'Свой статус', price: 4, cat: 'Статус', desc: 'Строка под ником в профиле.' },
    { id: 'boost_2x', icon: '⚡', img: null, name: '×2 койнов 24ч', price: 3, cat: 'Бусты', desc: 'Удвоение заработков на сутки.' },
    { id: 'boost_fish', icon: '🎣', img: null, name: '×2 клёва 24ч', price: 2, cat: 'Бусты', desc: 'Шанс поймать рыбу +50% на сутки.' },
    { id: 'free_spin', icon: '🎰', img: null, name: '3 бесплатных спина', price: 2, cat: 'Бусты', desc: 'Три прокрутки колеса.' },
    { id: 'broadcast', icon: '📢', img: null, name: 'Broadcast всем', price: 5, cat: 'Особое', desc: 'Отправь сообщение всем игрокам сразу.' },
    { id: 'invite_friend', icon: '🎫', img: null, name: 'Приглашение друга', price: 2, cat: 'Особое', desc: 'Особый доступ для друга.' },
    { id: 'promo_own', icon: '🔑', img: null, name: 'Свой промокод', price: 10, cat: 'Особое', desc: 'Создать свой промокод (заявка админу).' },
    { id: 'unban_self', icon: '🔓', img: null, name: 'Разбан себя', price: 20, cat: 'Особое', desc: 'Снять свой бан (если есть).' },
    { id: 'nick_change', icon: '✏️', img: null, name: 'Сменить ник', price: 15, cat: 'Особое', desc: 'Заявка админу на смену ника.' }
];

// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
window.currentUser = null;
window.activeTab = 'coins';
window.anticheatInterval = null;
window.lastBalances = {};
window.isSpinning = false;
window.aiAnticheatInterval = null;
window.aiLastBalances = JSON.parse(localStorage.getItem('ai_last_balances') || '{}');
window.banTimerInterval = null;
window.originalAdmin = null;
window.unreadCount = 0;
window.lastMessageTimestamp = 0;
window.audioCtx = null;
window.onlineUsers = {};
window.wipeCountdownInterval = null;
window.maintenanceInterval = null;
window.currentTheme = localStorage.getItem('kotogram_theme') || 'light';
window.mario = { x: 50, y: 400, w: 30, h: 40, vy: 0, speed: 5, jumpForce: -12, onGround: false };
window.platforms = []; window.coins = []; window.enemies = []; window.bullets = [];
window.gameScore = 0; window.gameKotocoinBuffer = 0; window.gameCameraX = 0;
window.gameLoopId = null; window.gameKeys = {}; window.gameActive = false;
window.gameCtx = null; window.gameCanvas = null;
window.keydownHandler = null; window.keyupHandler = null; window.gameFrameCount = 0;
window.GRAVITY = 0.6; window.CANVAS_WIDTH = 800; window.CANVAS_HEIGHT = 500;
window.slotSpinning = false; window.slotSessionSpins = 0; window.slotSessionWin = 0;
window.fishingActive = false; window.fishingTimeout = null; window.fishingCatchTimeout = null;
window.WIN_TOP_DAILY_LIMIT = 5000;
window.CLAN_MAX_MEMBERS = 5;
window.CLAN_INVEST_PER_LEVEL = 10000;
window.CLAN_EMOJIS = ['🏰','⚔️','🐱','🐉','🦁','🐺','🦅','🔥','❄️','⚡','🌊','💎','👑','🛡️','🌙','⭐','🌹','☠️'];

// ============ УТИЛИТЫ ============
window.$ = id => document.getElementById(id);
window.toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3000); };
window.esc = (s) => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
window.ea = (s) => String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
window.fc = (c) => c===Infinity||c==="Infinity"?'∞':c;
window.ft = (t) => t===Infinity||t==="Infinity"?'∞':(t||0);

window.roleIcon = (roleKey, size) => {
    const r = ROLES[roleKey];
    if (!r) return '';
    const cls = size === 'lg' ? 'role-img-lg' : 'role-img';
    if (r.img) return `<img src="${r.img}" class="${cls}" alt="${r.name}" onerror="this.outerHTML='<span style=\\'font-size:${size === 'lg' ? '48px' : '18px'};\\'>${r.emoji}</span>'">`;
    return `<span style="font-size:${size === 'lg' ? '48px' : '18px'};">${r.emoji}</span>`;
};
window.tokenIcon = (size) => { const s = size || 20; return `<img src="${IMG.token}" style="width:${s}px;height:${s}px;vertical-align:middle;image-rendering:pixelated;" onerror="this.outerHTML='💎'">`; };
window.caseIcon = (size) => { const s = size || 20; return `<img src="${IMG.case}" style="width:${s}px;height:${s}px;vertical-align:middle;image-rendering:pixelated;" onerror="this.outerHTML='🎁'">`; };
window.avatarHTML = (name, userData, size) => {
    const s = size || 44;
    const img = userData && userData.avatarUrl;
    if (img) return `<div class="avatar" style="width:${s}px;height:${s}px;"><img src="${img}" class="avatar-img" onerror="this.outerHTML='${name.charAt(0).toUpperCase()}'"></div>`;
    return `<div class="avatar" style="width:${s}px;height:${s}px;">${name.charAt(0).toUpperCase()}</div>`;
};
window.nickHTML = (name, userData) => {
    const anim = userData && userData.nickAnim;
    const cls = anim ? `nick-${anim}` : '';
    const verified = userData && userData.verified ? '<span class="verified-badge"></span>' : '';
    const vipB = userData && userData.vipBadge ? ' <span class="badge" style="background:linear-gradient(135deg,#ffd700,#b8860b);color:#000;">👑VIP</span>' : '';
    const tourB = userData && userData.tournamentBadge ? ' <span class="badge" style="background:#ff9800;color:#fff;">🏆</span>' : '';
    const legB = userData && userData.legendBadge ? ' <span class="badge" style="background:#9c27b0;color:#fff;">🎖️</span>' : '';
    const wipeB = userData && userData.totalWipes ? ` <span class="badge" style="background:#37474f;color:#fff;">💀${userData.totalWipes}</span>` : '';
    return `<span class="${cls}">${esc(name)}</span>${verified}${vipB}${tourB}${legB}${wipeB}`;
};
window.getCurrentVipRole = (user) => {
    if (!user || !user.vipRole || !user.vipExpiresAt) return null;
    if (user.vipExpiresAt === -1) return user.vipRole;
    if (Date.now() < user.vipExpiresAt) return user.vipRole;
    return null;
};

// ============ ИНИЦИАЛИЗАЦИЯ БАЗЫ ============
db.ref('config').once('value').then(snap => {
    if (!snap.exists()) {
        const u = {};
        DEFAULT_USERS.forEach(x => u[x.username] = { password: x.password, role: x.role, coins: x.coins, tokens: x.username === 'Филипп' ? 'Infinity' : (x.tokens || 0), vipRole: null, vipExpiresAt: null, clanId: null, freeCase: 0 });
        db.ref('users').set(u);
        db.ref('messages').set([]);
        db.ref('tournaments').set([]);
        db.ref('exchanges').set([]);
        db.ref('orders').set([]);
        db.ref('usedPromos').set({});
        db.ref('privateChats').set({});
        db.ref('bans').set({});
        db.ref('mutes').set({});
        db.ref('auditLog').set([]);
        db.ref('questProgress').set({});
        db.ref('auction').set({ status: 'active', item: '🎁 Таинственный приз', highestBid: 0, highestBidder: '', bids: {} });
        db.ref('achievements').set({});
        db.ref('gameScores').set({});
        db.ref('tokenRequests').set([]);
        db.ref('fishingStats').set({});
        db.ref('clans').set({});
        db.ref('transfers').set([]);
        db.ref('config').set({ wipeCount: 0, lastWipe: 0, maintenance: { active: false } });
    }
    db.ref('users/Филипп/role').once('value').then(s => {
        if (s.val() !== 'admin') {
            db.ref('users/Филипп/role').set('admin');
            db.ref('users/Филипп/coins').set('Infinity');
            db.ref('users/Филипп/tokens').set('Infinity');
        }
    });
});