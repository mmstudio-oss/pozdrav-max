// ВАЖНО: замените на технический HTTPS-адрес вашего backend в Timeweb.
// Без /health и без завершающего слеша.
const API_BASE_URL = "https://mmstudio-oss-pozdrav-max-5bd2.twc1.net";

const occasionInput = document.getElementById("occasion");
const nameInput = document.getElementById("name");
const styleInput = document.getElementById("style");
const detailsInput = document.getElementById("details");

const generateButton = document.getElementById("generateButton");
const anotherButton = document.getElementById("anotherButton");
const downloadButton = document.getElementById("downloadButton");
const sendMaxButton = document.getElementById("sendMaxButton");

const resultSection = document.getElementById("resultSection");
const errorMessage = document.getElementById("errorMessage");
const shareStatus = document.getElementById("shareStatus");
const generationBox = document.getElementById("generationBox");
const generationStatus = document.getElementById("generationStatus");

const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

let selectedTemplate = "celebration";
let previousTextIndex = -1;
let lastGreeting = null;
let lastAiImage = null;
let isGenerating = false;

const occasionMeta = {
  birthday: { emoji: "🎂", label: "ДЕНЬ РОЖДЕНИЯ" },
  morning: { emoji: "☀️", label: "ДОБРОЕ УТРО" },
  mother: { emoji: "🌹", label: "ДЛЯ МАМЫ" },
  love: { emoji: "❤️", label: "ДЛЯ ТЕБЯ" },
  night: { emoji: "🌙", label: "ДОБРЫХ СНОВ" },
  newyear: { emoji: "🎄", label: "С НОВЫМ ГОДОМ" },
  march8: { emoji: "💐", label: "8 МАРТА" },
  wedding: { emoji: "💍", label: "СВАДЬБА" },
  graduation: { emoji: "🎓", label: "ВЫПУСКНОЙ" }
};

const textVariants = {
  birthday: {
    warm: [
      "Пусть каждый новый день приносит хорошие новости, тёплые встречи и поводы улыбаться.",
      "Желаю здоровья, счастья, душевного тепла и исполнения самых важных желаний.",
      "Пусть рядом всегда будут любимые люди, а впереди ждут радостные события и новые возможности."
    ],
    fun: [
      "Желаю, чтобы денег было больше, чем непрочитанных сообщений, а выходных — больше, чем понедельников!",
      "Пусть настроение всегда будет на максимуме, а проблемы быстро переходят в архив.",
      "Желаю вкусной еды, отличных людей рядом и как можно меньше срочных дел после 18:00!"
    ],
    beautiful: [
      "Пусть впереди будет много ярких событий, красивых моментов и людей, рядом с которыми легко быть собой.",
      "Пусть каждый день складывается из вдохновения, радости и приятных неожиданностей.",
      "Желаю, чтобы жизнь чаще удивляла добрыми встречами, красивыми местами и счастливыми моментами."
    ],
    short: [
      "Счастья, здоровья, удачи и прекрасного настроения!",
      "Пусть всё задуманное получается легко и вовремя!",
      "Ярких событий, верных людей рядом и исполнения желаний!"
    ]
  },
  morning: {
    warm: [
      "Доброе утро! Пусть сегодняшний день начнётся спокойно, а продолжится приятными событиями.",
      "Пусть утро подарит хорошее настроение, а день — много поводов улыбнуться.",
      "Желаю лёгкого начала дня, хороших новостей и спокойствия во всём."
    ],
    fun: [
      "Доброе утро! Кофе уже готов морально поддерживать тебя — осталось только начать день.",
      "Пусть сегодня всё работает с первого раза, включая настроение!",
      "Желаю, чтобы будильник оказался самой сложной проблемой сегодняшнего дня."
    ],
    beautiful: [
      "Пусть этот день начнётся со света, хороших мыслей и ощущения, что впереди обязательно случится что-то приятное.",
      "Желаю лёгкого утра, ясных мыслей и красивого дня.",
      "Пусть солнце, спокойствие и вдохновение сопровождают тебя весь сегодняшний день."
    ],
    short: [
      "Доброе утро! Пусть день будет удачным.",
      "Хорошего утра и отличного дня!",
      "Пусть сегодня всё сложится хорошо."
    ]
  },
  mother: {
    warm: [
      "Спасибо за твою заботу, доброту и тепло. Пусть у тебя будет как можно больше счастливых и спокойных дней.",
      "Пусть рядом всегда будут любовь, уют и люди, которые ценят тебя так же сильно, как ты этого заслуживаешь.",
      "Спасибо за тепло, которое ты даришь каждый день. Желаю здоровья, радости и много приятных моментов."
    ],
    fun: [
      "Желаю отличного настроения, вкусного чая и хотя бы одного дня без вопросов «а где лежит…?»",
      "Пусть сегодня все домашние дела каким-нибудь чудом сделаются сами!",
      "Желаю отдыха, цветов и полного права сегодня ничего никому не объяснять!"
    ],
    beautiful: [
      "Пусть в твоей жизни будет столько же тепла и красоты, сколько ты даришь другим.",
      "Желаю тебе светлых дней, цветов без повода и много заботы в ответ.",
      "Пусть каждый день приносит спокойствие, нежность и уверенность, что ты очень любима."
    ],
    short: [
      "Мама, спасибо, что ты есть. Люблю тебя!",
      "Счастья, здоровья и много улыбок!",
      "Самой любимой маме — здоровья, тепла и радости!"
    ]
  },
  love: {
    warm: [
      "Спасибо, что делаешь обычные дни особенными. Пусть впереди у нас будет ещё много счастливых моментов.",
      "Просто хочу напомнить, как много ты для меня значишь.",
      "Мне очень повезло, что ты рядом. Пусть у нас будет ещё множество причин улыбаться вместе."
    ],
    fun: [
      "Ты мой любимый человек — даже когда забираешь одеяло ночью.",
      "Официально сообщаю: ты по-прежнему мой самый любимый человек.",
      "Ты — причина моего хорошего настроения. Иногда ещё кофе, но в основном ты."
    ],
    beautiful: [
      "Пусть у нас всегда будет место для нежности, смеха, приключений и тёплых разговоров.",
      "С тобой даже обычные моменты становятся теми, которые хочется запомнить.",
      "Пусть наша история состоит из тёплых встреч, поддержки и множества красивых воспоминаний."
    ],
    short: ["Люблю тебя.", "Ты — мой человек.", "Спасибо, что ты рядом."]
  },
  night: {
    warm: [
      "Спокойной ночи. Пусть сегодняшний день останется позади, а завтра принесёт что-то хорошее.",
      "Желаю спокойных мыслей, уютного вечера и самых добрых снов.",
      "Пусть ночь подарит настоящий отдых, а утро встретит хорошим настроением."
    ],
    fun: [
      "Спокойной ночи! Все важные мысли официально переносятся на завтра.",
      "Пора заряжать и телефон, и себя. Добрых снов!",
      "Всё, рабочий день закрыт. Следующая серия — завтра утром!"
    ],
    beautiful: [
      "Пусть вечер будет тихим, мысли — лёгкими, а сон — глубоким и спокойным.",
      "Пусть ночь подарит отдых, а утро начнётся с хорошего настроения.",
      "Желаю тихой ночи, красивых снов и спокойного пробуждения."
    ],
    short: [
      "Спокойной ночи и добрых снов.",
      "Отдыхай. Завтра будет новый хороший день.",
      "Добрых снов и спокойной ночи."
    ]
  },
  newyear: {
    warm: [
      "Пусть новый год принесёт здоровье, тепло, спокойствие и множество счастливых встреч.",
      "Желаю, чтобы в новом году рядом были любимые люди, а поводов для радости становилось всё больше.",
      "Пусть новый год откроет дорогу добрым переменам, уютным вечерам и мечтам, которые сбываются."
    ],
    fun: [
      "Пусть в новом году дедлайны будут добрее, выходные длиннее, а чудеса случаются без предварительной записи!",
      "Желаю, чтобы новый год обновился без ошибок и работал стабильно все двенадцать месяцев!",
      "Пусть шампанское искрится, настроение не зависает, а удача всегда остаётся онлайн!"
    ],
    beautiful: [
      "Пусть новый год наполнится светом, вдохновением и мгновениями, которые захочется бережно хранить.",
      "Желаю тихого волшебства, красивых встреч и ощущения, что самое хорошее ещё впереди.",
      "Пусть каждый месяц нового года оставляет после себя тёплое воспоминание."
    ],
    short: ["С Новым годом! Счастья, здоровья и чудес!", "Пусть новый год будет добрым и счастливым!", "Тепла, удачи и исполнения желаний!"]
  },
  march8: {
    warm: [
      "Пусть каждый день приносит заботу, уважение, тепло и искренние поводы улыбаться.",
      "Желаю весеннего настроения, душевного тепла и людей рядом, которые умеют ценить и радовать.",
      "Пусть в жизни будет больше цветов без повода, приятных сюрпризов и времени для себя."
    ],
    fun: [
      "Желаю цветов, комплиментов и официального выходного от всех домашних дел!",
      "Пусть весна включает режим: больше солнца, меньше забот и максимум приятных сюрпризов!",
      "Желаю, чтобы сегодня всё было можно, а всё скучное — можно было отложить!"
    ],
    beautiful: [
      "Пусть эта весна принесёт свет, вдохновение и ощущение собственной неповторимости.",
      "Желаю красоты в деталях, нежности в словах и гармонии в каждом новом дне.",
      "Пусть вокруг всегда будет место для цветов, света и искренних чувств."
    ],
    short: ["С 8 Марта! Счастья, любви и весны в душе!", "Тепла, красоты и прекрасного настроения!", "Пусть каждый день радует!"]
  },
  wedding: {
    warm: [
      "Пусть ваша семья будет местом любви, поддержки, доверия и самых тёплых воспоминаний.",
      "Желаю вместе пройти через тысячи счастливых дней, сохраняя нежность и уважение друг к другу.",
      "Пусть ваш общий путь будет наполнен заботой, радостью и ощущением, что дома всегда ждут."
    ],
    fun: [
      "Желаю любви без лимитов, путешествий без отмен и семейного чата только с хорошими новостями!",
      "Пусть спор о том, что смотреть вечером, остаётся самой серьёзной семейной проблемой!",
      "Желаю идеального баланса: много любви, вкусных ужинов и права иногда выбирать сериал по очереди!"
    ],
    beautiful: [
      "Пусть сегодняшний день станет первой страницей долгой и очень красивой семейной истории.",
      "Желаю вам беречь тепло этой встречи и с каждым годом открывать друг в друге что-то новое.",
      "Пусть любовь становится глубже, дом — уютнее, а совместные мечты — реальнее."
    ],
    short: ["С днём свадьбы! Любви и счастья на долгие годы!", "Берегите друг друга и будьте счастливы!", "Любви, гармонии и прекрасной семейной жизни!"]
  },
  graduation: {
    warm: [
      "Пусть знания, друзья и воспоминания этого времени станут хорошей опорой для новых больших шагов.",
      "Желаю смело выбирать свой путь, не бояться перемен и встречать людей, которые помогут расти.",
      "Пусть впереди будет много возможностей, интересных задач и поводов гордиться собой."
    ],
    fun: [
      "Поздравляю! Домашние задания закончились. Теперь начинаются задания, которые никто не объяснил заранее!",
      "Диплом получен — можно официально делать умный вид в любой непонятной ситуации!",
      "Желаю, чтобы взрослая жизнь оказалась интереснее расписания и добрее экзаменаторов!"
    ],
    beautiful: [
      "Сегодня заканчивается одна глава и начинается новая — пусть она будет смелой, яркой и вашей.",
      "Пусть мечты превращаются в планы, планы — в действия, а действия ведут к любимому делу.",
      "Желаю идти вперёд с любопытством, уверенностью и открытым взглядом на мир."
    ],
    short: ["С выпускным! Вперёд к новым вершинам!", "Больших возможностей и смелых решений!", "Пусть всё самое интересное будет впереди!"]
  }
};

document.querySelectorAll(".template-option").forEach((button) => {
  button.addEventListener("click", () => {
    selectedTemplate = button.dataset.template;

    document.querySelectorAll(".template-option").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  });
});

function chooseVariant(items) {
  if (items.length === 1) return items[0];

  let index;
  do {
    index = Math.floor(Math.random() * items.length);
  } while (index === previousTextIndex);

  previousTextIndex = index;
  return items[index];
}

function buildGreeting() {
  const name = nameInput.value.trim();
  const occasion = occasionInput.value;
  const style = styleInput.value;

  const noNameTitles = {
    birthday: "С днём рождения!",
    morning: "Доброе утро!",
    mother: "Для самой любимой мамы",
    love: "Для тебя",
    night: "Спокойной ночи",
    newyear: "С Новым годом!",
    march8: "С 8 Марта!",
    wedding: "С днём свадьбы!",
    graduation: "С выпускным!"
  };

  const namedTitles = {
    birthday: `${name}, с днём рождения!`,
    morning: `${name}, доброе утро!`,
    mother: `${name}, это для тебя`,
    love: `${name}, для тебя`,
    night: `${name}, спокойной ночи`,
    newyear: `${name}, с Новым годом!`,
    march8: `${name}, с 8 Марта!`,
    wedding: `${name}, с днём свадьбы!`,
    graduation: `${name}, с выпускным!`
  };

  return {
    name,
    occasion,
    style,
    title: name ? namedTitles[occasion] : noNameTitles[occasion],
    text: chooseVariant(textVariants[occasion][style])
  };
}

function getMaxInitData() {
  try {
    if (window.WebApp && typeof window.WebApp.initData === "string") {
      return window.WebApp.initData;
    }
  } catch (error) {
    console.warn("Не удалось прочитать initData MAX:", error);
  }
  return "";
}

function loadDataImage(imageData) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Не удалось открыть изображение, полученное от AI."));
    image.src = imageData;
  });
}

function drawCoverImage(image) {
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;
  ctx.drawImage(image, x, y, width, height);
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function fitFontSize(text, maxWidth, startSize, minSize, weight = 800) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function wrapText(text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function fitBodyText(text, maxWidth, maxLines) {
  for (let size = 43; size >= 31; size -= 2) {
    const font = `500 ${size}px Arial, sans-serif`;
    const lines = wrapText(text, maxWidth, font);
    if (lines.length <= maxLines) return { size, font, lines };
  }

  const font = "500 31px Arial, sans-serif";
  return { size: 31, font, lines: wrapText(text, maxWidth, font).slice(0, maxLines) };
}

function renderCard(greeting, image) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCoverImage(image);

  const topShade = ctx.createLinearGradient(0, 0, 0, 360);
  topShade.addColorStop(0, "rgba(0,0,0,0.58)");
  topShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, canvas.width, 380);

  const bottomShade = ctx.createLinearGradient(0, 900, 0, canvas.height);
  bottomShade.addColorStop(0, "rgba(0,0,0,0)");
  bottomShade.addColorStop(1, "rgba(0,0,0,0.66)");
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, 850, canvas.width, 500);

  ctx.fillStyle = "rgba(8, 8, 18, 0.43)";
  roundedRect(ctx, 82, 365, 916, 680, 54);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 2;
  roundedRect(ctx, 82, 365, 916, 680, 54);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  const meta = occasionMeta[greeting.occasion] || occasionMeta.birthday;

  ctx.globalAlpha = 0.9;
  ctx.font = "700 29px Arial, sans-serif";
  ctx.fillText(meta.label, 540, 95);
  ctx.globalAlpha = 1;

  ctx.font = '108px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.fillText(meta.emoji, 540, 238);

  const titleFontSize = fitFontSize(greeting.title, 760, 70, 44, 800);
  const titleFont = `800 ${titleFontSize}px Arial, sans-serif`;
  const titleLines = wrapText(greeting.title, 760, titleFont).slice(0, 2);
  const titleStartY = titleLines.length === 1 ? 485 : 452;

  ctx.font = titleFont;
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 540, titleStartY + index * (titleFontSize + 12));
  });

  const body = fitBodyText(greeting.text, 730, 7);
  const bodyStartY = titleLines.length === 1 ? 650 : 670;
  const lineHeight = body.size * 1.42;

  ctx.font = body.font;
  body.lines.forEach((line, index) => {
    ctx.fillText(line, 540, bodyStartY + index * lineHeight);
  });

  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.globalAlpha = 0.94;
  ctx.font = "600 28px Arial, sans-serif";
  ctx.fillText("🎁  Создано в «Поздравь»", 540, 1250);
  ctx.globalAlpha = 1;

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function setGenerating(active, message = "Alice AI ART создаёт изображение…") {
  isGenerating = active;
  generateButton.disabled = active;
  anotherButton.disabled = active;
  downloadButton.disabled = active;
  sendMaxButton.disabled = active;
  generationStatus.textContent = message;
  generationBox.classList.toggle("hidden", !active);
}

async function requestAiBackground() {
  if (API_BASE_URL.includes("YOUR-TIMEWEB-BACKEND")) {
    throw new Error("Сначала укажите адрес backend Timeweb в app.js.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-ai-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        initData: getMaxInitData(),
        occasion: occasionInput.value,
        style: styleInput.value,
        template: selectedTemplate,
        name: nameInput.value.trim(),
        details: detailsInput.value.trim()
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || `Ошибка сервера ${response.status}`);
    }

    if (!result.imageData) {
      throw new Error("Сервер не вернул изображение.");
    }

    return result.imageData;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Генерация заняла слишком много времени. Попробуйте ещё раз.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateCard() {
  if (isGenerating) return;

  errorMessage.textContent = "";
  shareStatus.textContent = "";
  const greeting = buildGreeting();

  setGenerating(true);

  try {
    const imageData = await requestAiBackground();
    setGenerating(true, "Оформляем открытку…");
    const image = await loadDataImage(imageData);

    lastGreeting = greeting;
    lastAiImage = image;
    renderCard(greeting, image);

    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    errorMessage.textContent = `Не удалось создать открытку: ${error.message}`;
  } finally {
    setGenerating(false);
  }
}

async function anotherVariant() {
  await generateCard();
}

function safeFileName(name) {
  return (name || "otkrytka")
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "otkrytka";
}

function downloadPNG() {
  if (!lastGreeting || !lastAiImage) {
    shareStatus.textContent = "Сначала создайте открытку.";
    return;
  }

  const link = document.createElement("a");
  link.download = `pozdrav-${safeFileName(lastGreeting.name)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  shareStatus.textContent = "PNG сохранён на устройство.";
}

async function sendToMax() {
  if (!lastGreeting || !lastAiImage) {
    shareStatus.textContent = "Сначала создайте открытку.";
    return;
  }

  if (API_BASE_URL.includes("YOUR-TIMEWEB-BACKEND")) {
    shareStatus.textContent = "Сначала укажите адрес backend Timeweb в app.js.";
    return;
  }

  if (!window.WebApp || typeof window.WebApp.shareMaxContent !== "function") {
    shareStatus.textContent = "Отправка работает внутри MAX. В браузере используйте «Скачать PNG».";
    return;
  }

  const initData = getMaxInitData();
  if (!initData) {
    shareStatus.textContent = "MAX не передал данные запуска. Откройте приложение через своего бота.";
    return;
  }

  sendMaxButton.disabled = true;
  shareStatus.textContent = "Загружаем открытку в MAX…";

  try {
    const response = await fetch(`${API_BASE_URL}/api/send-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        imageData: canvas.toDataURL("image/png"),
        caption: "🎁 Ваша AI-открытка из «Поздравь»"
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Ошибка сервера ${response.status}`);
    if (!result.mid) throw new Error("Сервер не вернул mid сообщения.");

    shareStatus.textContent = "Выберите, кому отправить открытку…";
    window.WebApp.shareMaxContent({ mid: result.mid, chatType: "DIALOG" });
  } catch (error) {
    console.error(error);
    shareStatus.textContent = `Не удалось отправить: ${error.message}`;
  } finally {
    sendMaxButton.disabled = false;
  }
}

generateButton.addEventListener("click", generateCard);
anotherButton.addEventListener("click", anotherVariant);
downloadButton.addEventListener("click", downloadPNG);
sendMaxButton.addEventListener("click", sendToMax);

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") generateCard();
});

try {
  if (window.WebApp && typeof window.WebApp.ready === "function") {
    window.WebApp.ready();
  }
} catch (error) {
  console.warn("MAX Bridge пока недоступен:", error);
}
