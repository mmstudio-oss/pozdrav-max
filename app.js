const occasionInput = document.getElementById("occasion");
const nameInput = document.getElementById("name");
const styleInput = document.getElementById("style");
const detailsInput = document.getElementById("details");

const generateButton = document.getElementById("generateButton");
const anotherButton = document.getElementById("anotherButton");
const downloadButton = document.getElementById("downloadButton");
const shareFileButton = document.getElementById("shareFileButton");

const resultSection = document.getElementById("resultSection");
const errorMessage = document.getElementById("errorMessage");
const shareStatus = document.getElementById("shareStatus");

const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

let selectedTemplate = "celebration";
let previousTextIndex = -1;
let lastGreeting = null;


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
      "Доброе утро! Желаю, чтобы сегодня будильник оказался самой сложной проблемой дня."
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
      "Мама, счастья тебе, здоровья и много улыбок!",
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
    short: [
      "Люблю тебя.",
      "Ты — мой человек.",
      "Спасибо, что ты рядом."
    ]
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
  }
};


const templates = {
  celebration: {
    colors: ["#ff4f9a", "#7c3aed", "#ffad42"],
    foreground: "#ffffff",
    panel: "rgba(255,255,255,0.18)",
    emoji: "🎉",
    title: "ПРАЗДНИК"
  },
  sunrise: {
    colors: ["#6dc8ff", "#ffe1a6", "#ff8b63"],
    foreground: "#28324a",
    panel: "rgba(255,255,255,0.52)",
    emoji: "☀️",
    title: "ХОРОШЕГО ДНЯ"
  },
  flowers: {
    colors: ["#fff0f5", "#edb6ce", "#cdb8ff"],
    foreground: "#5a2948",
    panel: "rgba(255,255,255,0.62)",
    emoji: "🌸",
    title: "С ТЕПЛОМ"
  },
  love: {
    colors: ["#ff5678", "#ff8f70", "#7348c7"],
    foreground: "#ffffff",
    panel: "rgba(255,255,255,0.18)",
    emoji: "❤️",
    title: "ДЛЯ ТЕБЯ"
  },
  night: {
    colors: ["#10152f", "#392b78", "#6b3fa0"],
    foreground: "#ffffff",
    panel: "rgba(255,255,255,0.12)",
    emoji: "🌙",
    title: "ДОБРЫХ СНОВ"
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

    if (lastGreeting) {
      renderCard(lastGreeting);
    }
  });
});


function chooseVariant(items) {
  if (items.length === 1) {
    return items[0];
  }

  let index;

  do {
    index = Math.floor(Math.random() * items.length);
  } while (index === previousTextIndex);

  previousTextIndex = index;
  return items[index];
}


function buildGreeting() {
  const name = nameInput.value.trim();

  if (!name) {
    errorMessage.textContent = "Введите имя получателя.";
    nameInput.focus();
    return null;
  }

  errorMessage.textContent = "";

  const occasion = occasionInput.value;
  const style = styleInput.value;
  const details = detailsInput.value.trim();

  const titles = {
    birthday: `${name}, с днём рождения!`,
    morning: `${name}, доброе утро!`,
    mother: `${name}, это для тебя`,
    love: `${name}, для тебя`,
    night: `${name}, спокойной ночи`
  };

  let text = chooseVariant(textVariants[occasion][style]);

  if (details) {
    text += ` И пусть ${details.toLowerCase()} приносит ещё больше радости.`;
  }

  return {
    name,
    occasion,
    style,
    title: titles[occasion],
    text
  };
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


function drawBackground(template) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  gradient.addColorStop(0, template.colors[0]);
  gradient.addColorStop(0.56, template.colors[1]);
  gradient.addColorStop(1, template.colors[2]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Мягкие декоративные круги
  const bubbles = [
    [110, 165, 190, 0.12],
    [930, 210, 250, 0.10],
    [870, 1110, 290, 0.10],
    [120, 1130, 220, 0.08]
  ];

  bubbles.forEach(([x, y, r, alpha]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });

  // Мелкие точки
  for (let i = 0; i < 16; i += 1) {
    const x = 70 + ((i * 137) % 950);
    const y = 95 + ((i * 211) % 1120);
    const radius = 4 + (i % 4) * 3;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.22 + (i % 3) * 0.08})`;
    ctx.fill();
  }
}


function fitFontSize(text, maxWidth, startSize, minSize, weight = 800) {
  let size = startSize;

  while (size > minSize) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`;

    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }

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

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}


function renderCard(greeting) {
  const template = templates[selectedTemplate];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(template);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Верхняя маленькая подпись
  ctx.fillStyle = template.foreground;
  ctx.globalAlpha = 0.78;
  ctx.font = "700 30px Arial, sans-serif";
  ctx.fillText(template.title, 540, 105);
  ctx.globalAlpha = 1;

  // Эмодзи
  ctx.font = '128px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.fillText(template.emoji, 540, 235);

  // Основная полупрозрачная панель
  ctx.fillStyle = template.panel;
  roundedRect(ctx, 90, 350, 900, 700, 58);
  ctx.fill();

  // Имя / заголовок
  const titleFontSize = fitFontSize(greeting.title, 760, 72, 46, 800);

  ctx.fillStyle = template.foreground;
  ctx.font = `800 ${titleFontSize}px Arial, sans-serif`;

  const titleLines = wrapText(
    greeting.title,
    760,
    `800 ${titleFontSize}px Arial, sans-serif`
  ).slice(0, 2);

  let titleY = titleLines.length === 1 ? 470 : 445;

  titleLines.forEach((line, index) => {
    ctx.fillText(line, 540, titleY + index * (titleFontSize + 12));
  });

  // Текст поздравления
  const bodyFontSize = 42;
  const bodyFont = `500 ${bodyFontSize}px Arial, sans-serif`;

  ctx.font = bodyFont;

  const bodyLines = wrapText(greeting.text, 720, bodyFont).slice(0, 8);

  let bodyY = titleLines.length === 1 ? 620 : 640;
  const lineHeight = 59;

  bodyLines.forEach((line, index) => {
    ctx.fillText(line, 540, bodyY + index * lineHeight);
  });

  // Нижняя подпись
  ctx.globalAlpha = 0.86;
  ctx.font = "600 29px Arial, sans-serif";
  ctx.fillText("🎁  Создано в «Поздравь»", 540, 1245);
  ctx.globalAlpha = 1;
}


function generateCard() {
  const greeting = buildGreeting();

  if (!greeting) {
    return;
  }

  lastGreeting = greeting;
  renderCard(greeting);

  resultSection.classList.remove("hidden");

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function anotherVariant() {
  if (!lastGreeting) {
    generateCard();
    return;
  }

  const newGreeting = buildGreeting();

  if (!newGreeting) {
    return;
  }

  lastGreeting = newGreeting;
  renderCard(newGreeting);
}


function safeFileName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "otkrytka";
}


function downloadPNG() {
  if (!lastGreeting) {
    shareStatus.textContent = "Сначала создайте открытку.";
    return;
  }

  const link = document.createElement("a");

  link.download = `pozdrav-${safeFileName(lastGreeting.name)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();

  shareStatus.textContent = "PNG сохранён на устройство.";
}


async function canvasToFile() {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Не удалось создать PNG."));
        return;
      }

      resolve(
        new File(
          [blob],
          `pozdrav-${safeFileName(lastGreeting?.name || "otkrytka")}.png`,
          { type: "image/png" }
        )
      );
    }, "image/png");
  });
}


async function sharePNG() {
  if (!lastGreeting) {
    shareStatus.textContent = "Сначала создайте открытку.";
    return;
  }

  try {
    const file = await canvasToFile();

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: "Открытка «Поздравь»",
        text: "Персональная открытка"
      });

      shareStatus.textContent = "Открытка передана в меню «Поделиться».";
      return;
    }

    shareStatus.textContent =
      "На этом устройстве передача PNG через системное меню недоступна. Нажмите «Скачать PNG».";
  } catch (error) {
    if (error.name === "AbortError") {
      shareStatus.textContent = "Отправка отменена.";
      return;
    }

    console.error(error);

    shareStatus.textContent =
      "Не удалось открыть меню отправки. Можно сохранить открытку кнопкой «Скачать PNG».";
  }
}


generateButton.addEventListener("click", generateCard);
anotherButton.addEventListener("click", anotherVariant);
downloadButton.addEventListener("click", downloadPNG);
shareFileButton.addEventListener("click", sharePNG);

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateCard();
  }
});

try {
  if (window.WebApp && typeof window.WebApp.ready === "function") {
    window.WebApp.ready();
  }
} catch (error) {
  console.warn("MAX Bridge пока недоступен:", error);
}
