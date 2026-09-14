(function exportI18n(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.FocusForgeI18n = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function createI18n(root) {
  const STORAGE_KEY = 'focusforge:lang';
  const DEFAULT_LANG = 'ru';

  // Названия месяцев/дней недели для истории — не через Intl.DateTimeFormat:
  // ICU-данные для 'uz' есть не во всех браузерах (проверено — часть отдаёт
  // нечитаемый фолбэк вида "M09, Mon"), а тут это не про локализацию чисел,
  // а про сами слова, поэтому держим их в словаре как обычный перевод.
  const MONTH_NAMES = {
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
  };
  const WEEKDAY_SHORT_NAMES = {
    ru: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
    uz: ['yak', 'dush', 'sesh', 'chor', 'pay', 'jum', 'shan']
  };

  // Один ключ — одна строка интерфейса. Для строк с переменными частями
  // (счётчики, имена уровней) используется шаблон с {placeholder} —
  // см. tFormat().
  const translations = {
    ru: {
      meta_title: 'FocusForge — Pomodoro-таймер с геймификацией',
      meta_description: 'FocusForge — фокус-таймер по методике Pomodoro с задачами, XP и стриками. Работает прямо в браузере, без установки.',
      header_cta: 'Попробовать',
      lang_switch_label: 'Язык',
      lang_ru_label: 'RU',
      lang_uz_label: 'UZ',

      hero_eyebrow: 'Pomodoro-таймер с геймификацией',
      hero_title: 'Фокус, который прокачивается вместе с тобой',
      hero_subtitle: 'Помидоро-сессии, задачи на день и XP за прогресс — FocusForge превращает рабочий день в игру, в которую хочется возвращаться.',
      hero_cta: 'Начать фокус-сессию →',

      subscribe_email_label: 'Email',
      subscribe_email_placeholder: 'you@example.com',
      subscribe_submit: 'Узнать первым о запуске',
      subscribe_success: 'Готово! Мы напишем вам, когда личный кабинет будет готов.',
      subscribe_error_network: 'Не получилось отправить email. Проверьте соединение и попробуйте ещё раз.',
      subscribe_error_generic: 'Не получилось отправить email. Попробуйте ещё раз.',

      features_title: 'Что внутри',
      feature_timer_title: 'Таймер',
      feature_timer_text: 'Кольцевой прогресс-бар и понятный отсчёт работы и отдыха по методике Pomodoro.',
      feature_tasks_title: 'Задачи',
      feature_tasks_text: 'Планируй день списком задач, перетаскивай для приоритета и отмечай готовое.',
      feature_gamification_title: 'Геймификация',
      feature_gamification_text: 'XP за задачи и сессии, уровни и стрик дней подряд — прогресс, который видно.',

      app_title: 'Фокус-таймер',
      app_subtitle: 'Работает прямо здесь, в браузере — ничего устанавливать не нужно.',
      history_open_button: 'История',

      timer_mode_group_label: 'Режим таймера',
      mode_work: 'Работа',
      mode_break: 'Отдых',
      timer_mode_focus: 'Фокус',
      timer_start: 'Старт',
      timer_pause: 'Пауза',
      timer_reset: 'Сброс',
      timer_sessions_label: 'Сегодня завершено помидоров:',

      tasks_group_label: 'Список задач',
      tasks_tab_open: 'Задачи',
      tasks_tab_done: 'Сделано',
      tasks_empty_title: 'Запланируй день',
      tasks_empty_hint: 'Каждая строка — задача. Маркеры - / [ ] срежутся автоматически.',
      tasks_bulk_input_label: 'Список задач на день',
      tasks_bulk_input_placeholder: '- [ ] Разобрать почту\n- [ ] Подготовить отчёт\n…',
      tasks_bulk_submit: 'Запланировать',
      tasks_inline_input_label: 'Новая задача',
      tasks_inline_input_placeholder: '+ Новая задача (Enter)',
      tasks_done_empty: 'Пока ничего не закрыто',

      stats_max_level: 'Максимальный уровень',
      stats_xp_to_next: '{current} / {required} XP до Lvl {next}',
      stats_streak: '🔥 {count} дней',
      stats_sessions_today: 'Сессий сегодня: {count}',
      stats_total_xp: 'Всего XP: {count}',

      level_name_1: 'Новичок',
      level_name_2: 'Фокусёр',
      level_name_3: 'Продуктивщик',
      level_name_4: 'Машина',
      level_name_5: 'Легенда',
      level_up_text: 'Level Up! {name} 🎉',

      footer_tagline: 'фокус, который прокачивается вместе с тобой.',

      modal_title: 'Помидор готов!',
      modal_text: 'Отличная работа. Что дальше?',
      modal_again: 'Ещё 🍅',
      modal_break: 'Отдохнуть',

      history_title: 'История',
      history_close: 'Закрыть',
      history_row: '{closed}/{total} задач · {pomodoros} 🍅 · {xp} XP'
    },
    uz: {
      meta_title: 'FocusForge — Gamifikatsiyali Pomodoro-taymer',
      meta_description: "FocusForge — vazifalar, XP va seriyalar bilan Pomodoro usulidagi fokus-taymer. Hech narsa o'rnatmasdan, to'g'ridan-to'g'ri brauzerda ishlaydi.",
      header_cta: "Sinab ko'rish",
      lang_switch_label: 'Til',
      lang_ru_label: 'RU',
      lang_uz_label: 'UZ',

      hero_eyebrow: 'Gamifikatsiyali Pomodoro-taymer',
      hero_title: 'Sen bilan birga rivojlanadigan fokus',
      hero_subtitle: "Pomidor-sessiyalar, kunlik vazifalar va progress uchun XP — FocusForge ish kuningizni qaytib-qaytib o'ynagingiz keladigan o'yinga aylantiradi.",
      hero_cta: 'Fokus-sessiyani boshlash →',

      subscribe_email_label: 'Email',
      subscribe_email_placeholder: 'you@example.com',
      subscribe_submit: "Ishga tushishidan birinchi bo'lib xabardor bo'lish",
      subscribe_success: "Tayyor! Shaxsiy kabinet tayyor bo'lganda sizga yozamiz.",
      subscribe_error_network: "Email yuborilmadi. Ulanishni tekshirib, qayta urinib ko'ring.",
      subscribe_error_generic: "Email yuborilmadi. Qayta urinib ko'ring.",

      features_title: 'Ichida nima bor',
      feature_timer_title: 'Taymer',
      feature_timer_text: "Pomodoro usulida ish va dam olishning aylana progress-bar va tushunarli hisoblagichi.",
      feature_tasks_title: 'Vazifalar',
      feature_tasks_text: "Kuningizni vazifalar ro'yxati bilan rejalashtiring, ustuvorlik uchun surib qo'ying va bajarilganini belgilang.",
      feature_gamification_title: 'Gamifikatsiya',
      feature_gamification_text: "Vazifalar va sessiyalar uchun XP, darajalar va ketma-ket kunlar seriyasi — ko'rinib turgan progress.",

      app_title: 'Fokus-taymer',
      app_subtitle: "To'g'ridan-to'g'ri shu yerda, brauzerda ishlaydi — hech narsa o'rnatish shart emas.",
      history_open_button: 'Tarix',

      timer_mode_group_label: 'Taymer rejimi',
      mode_work: 'Ish',
      mode_break: 'Dam olish',
      timer_mode_focus: 'Fokus',
      timer_start: 'Boshlash',
      timer_pause: 'Pauza',
      timer_reset: 'Bekor qilish',
      timer_sessions_label: 'Bugun tugallangan pomidorlar:',

      tasks_group_label: "Vazifalar ro'yxati",
      tasks_tab_open: 'Vazifalar',
      tasks_tab_done: 'Bajarildi',
      tasks_empty_title: 'Kuningizni rejalashtiring',
      tasks_empty_hint: "Har bir qator — bitta vazifa. - / [ ] belgilari avtomatik olib tashlanadi.",
      tasks_bulk_input_label: "Kunlik vazifalar ro'yxati",
      tasks_bulk_input_placeholder: "- [ ] Pochtani ko'rib chiqish\n- [ ] Hisobot tayyorlash\n…",
      tasks_bulk_submit: 'Rejalashtirish',
      tasks_inline_input_label: 'Yangi vazifa',
      tasks_inline_input_placeholder: '+ Yangi vazifa (Enter)',
      tasks_done_empty: 'Hozircha hech narsa bajarilmagan',

      stats_max_level: 'Maksimal daraja',
      stats_xp_to_next: '{current} / {required} XP Lvl {next} gacha',
      stats_streak: '🔥 {count} kun',
      stats_sessions_today: 'Bugungi sessiyalar: {count}',
      stats_total_xp: 'Jami XP: {count}',

      level_name_1: 'Yangi boshlovchi',
      level_name_2: 'Fokuschi',
      level_name_3: 'Samaradorlik ustasi',
      level_name_4: 'Mashina',
      level_name_5: 'Afsona',
      level_up_text: 'Level Up! {name} 🎉',

      footer_tagline: 'sen bilan birga rivojlanadigan fokus.',

      modal_title: 'Pomidor tayyor!',
      modal_text: 'Ajoyib ish. Keyin nima qilamiz?',
      modal_again: 'Yana 🍅',
      modal_break: 'Dam olish',

      history_title: 'Tarix',
      history_close: 'Yopish',
      history_row: "{closed}/{total} vazifa · {pomodoros} 🍅 · {xp} XP"
    }
  };

  function detectLanguage() {
    try {
      const saved = root.localStorage.getItem(STORAGE_KEY);
      if (saved === 'ru' || saved === 'uz') {
        return saved;
      }
    } catch (error) {
      // localStorage недоступен (приватный режим и т.п.) — падаем на автоопределение.
    }
    const browserLang = String((root.navigator && root.navigator.language) || '').toLowerCase();
    return browserLang.startsWith('uz') ? 'uz' : DEFAULT_LANG;
  }

  let currentLang = detectLanguage();

  function getLanguage() {
    return currentLang;
  }

  function formatHistoryDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[currentLang][date.getMonth()];
    const weekday = WEEKDAY_SHORT_NAMES[currentLang][date.getDay()];
    return `${weekday}, ${day} ${month}`;
  }

  function t(key) {
    const dict = translations[currentLang] || translations[DEFAULT_LANG];
    return (dict && dict[key]) ?? translations[DEFAULT_LANG][key] ?? key;
  }

  function tFormat(key, params) {
    let text = t(key);
    for (const paramKey of Object.keys(params || {})) {
      text = text.replaceAll(`{${paramKey}}`, String(params[paramKey]));
    }
    return text;
  }

  function setLanguage(lang) {
    if (lang !== 'ru' && lang !== 'uz') {
      return;
    }
    currentLang = lang;
    try {
      root.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Сохранить выбор не удалось — язык всё равно применится на текущей сессии.
    }
    applyLanguage();
  }

  function applyLanguage() {
    const document = root.document;
    document.documentElement.lang = currentLang;

    for (const element of document.querySelectorAll('[data-i18n]')) {
      element.textContent = t(element.dataset.i18n);
    }
    for (const element of document.querySelectorAll('[data-i18n-placeholder]')) {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    }
    for (const element of document.querySelectorAll('[data-i18n-aria-label]')) {
      element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
    }
    for (const element of document.querySelectorAll('[data-i18n-content]')) {
      element.setAttribute('content', t(element.dataset.i18nContent));
    }
    for (const element of document.querySelectorAll('[data-lang]')) {
      element.classList.toggle('is-active', element.dataset.lang === currentLang);
    }

    document.dispatchEvent(new CustomEvent('focusforge:langchange', { detail: { lang: currentLang } }));
  }

  function bindSwitcher() {
    const document = root.document;
    for (const button of document.querySelectorAll('[data-lang]')) {
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    }
  }

  function init() {
    bindSwitcher();
    applyLanguage();
  }

  return {
    STORAGE_KEY,
    translations,
    init,
    detectLanguage,
    getLanguage,
    formatHistoryDate,
    setLanguage,
    applyLanguage,
    t,
    tFormat
  };
});
