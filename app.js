/*
  После публикации backend на Timeweb вставьте его адрес ниже, например:
  const API_BASE_URL = "https://pozdrav-max-api-xxxx.twc1.net";
*/
const API_BASE_URL = "https://mmstudio-oss-pozdrav-max-5bd2.twc1.net";

const occasionInput = document.getElementById("occasion");
const visualStyleInput = document.getElementById("visualStyle");
const nameInput = document.getElementById("name");
const detailsInput = document.getElementById("details");

const generateButton = document.getElementById("generateButton");
const newVariantButton = document.getElementById("newVariantButton");
const downloadButton = document.getElementById("downloadButton");
const sendMaxButton = document.getElementById("sendMaxButton");

const statusMessage = document.getElementById("statusMessage");
const resultSection = document.getElementById("resultSection");

const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

let generatedImage = null;
let lastImageDataUrl = "";
let lastGreeting = null;
let previousTextIndex = -1;

const textVariants = {
  birthday: {
    premium: [
      "Пусть впереди будет как можно больше ярких событий, красивых открытий и счастливых моментов, которые хочется сохранить в сердце.",
      "Желаю вдохновения, радости, душевного тепла и исполнения самых важных желаний.",
      "Пусть рядом будут любимые люди, а каждый новый день приносит поводы улыбаться."
    ],
    soft: [
      "Пусть каждый день будет наполнен заботой, теплом, светом и добрыми чудесами.",
      "Желаю нежности, гармонии, спокойствия и множества приятных моментов.",
      "Пусть жизнь дарит красоту, хорошие новости и уютные счастливые дни."
    ],
    modern: [
      "Желаю уверенности, энергии, ярких впечатлений и удачи во всём, что действительно важно.",
      "Пусть впереди будет больше сильных моментов, хороших решений и радостных встреч.",
      "Пусть всё задуманное складывается красиво, вовремя и именно так, как хочется."
    ]
  },

  mother: {
    premium: [
      "Спасибо за твою любовь, доброту и тепло. Пусть в жизни будет как можно больше радости, спокойствия и красивых дней.",
      "Пусть рядом всегда будут забота, уют и люди, которые ценят тебя всей душой.",
      "Желаю здоровья, света и тихого счастья, которое остаётся с тобой каждый день."
    ],
    soft: [
      "Пусть каждый день будет наполнен нежностью, улыбками и приятными моментами.",
      "Желаю много цветов без повода, тепла в сердце и спокойствия в душе.",
      "Пусть забота, которую ты даришь другим, возвращается к тебе многократно."
    ],
    modern: [
      "Пусть впереди будет больше лёгких дней, хорошего настроения и времени только для себя.",
      "Желаю здоровья, радости и красивых моментов, которые делают жизнь светлее.",
      "Пусть всё самое доброе и важное приходит к тебе вовремя."
    ]
  },

  love: {
    premium: [
      "С тобой даже самые обычные дни становятся особенными. Спасибо, что ты есть.",
      "Пусть впереди у нас будет ещё больше тёплых разговоров, красивых моментов и счастливых воспоминаний.",
      "Ты — очень важный человек в моей жизни, и я хочу, чтобы ты это всегда чувствовал(а)."
    ],
    soft: [
      "Пусть рядом с тобой всегда будет тепло, нежность и ощущение, что тебя очень любят.",
      "Хочу, чтобы у тебя было больше радости, улыбок и тихого счастья.",
      "Пусть в сердце всегда живут свет, любовь и спокойствие."
    ],
    modern: [
      "Ты — мой человек. И этим сказано очень многое.",
      "Пусть в нашей истории будет ещё больше честных чувств, поддержки и счастливых дней.",
      "Спасибо, что делаешь мою жизнь лучше просто тем, что ты рядом."
    ]
  },

  morning: {
    premium: [
      "Пусть это утро начнётся красиво, а день принесёт хорошие новости и приятные встречи.",
      "Желаю ясных мыслей, вдохновения и лёгкости во всём, что ждёт тебя сегодня.",
      "Пусть день будет светлым, спокойным и полным поводов для улыбки."
    ],
    soft: [
      "Доброе утро. Пусть сегодняшний день будет тёплым, уютным и добрым.",
      "Пусть утро подарит хорошее настроение, а день — радость и лёгкость.",
      "Желаю мягкого начала дня, гармонии и самых приятных событий."
    ],
    modern: [
      "Пусть день начнётся уверенно и пройдёт именно так, как тебе хочется.",
      "Хорошего утра, энергии, ясности и удачи в каждом деле.",
      "Пусть сегодня всё складывается красиво и без лишней суеты."
    ]
  },

  night: {
    premium: [
      "Пусть ночь будет тихой, красивой и спокойной, а утро начнётся с хорошего настроения.",
      "Желаю отпустить всё лишнее, отдохнуть душой и увидеть самые добрые сны.",
      "Пусть эта ночь принесёт отдых, уют и ощущение внутреннего покоя."
    ],
    soft: [
      "Спокойной ночи. Пусть мысли станут легче, а сон будет глубоким и добрым.",
      "Пусть вечер подарит тишину, отдых и мягкое ощущение уюта.",
      "Желаю спокойствия, нежных снов и хорошего пробуждения утром."
    ],
    modern: [
      "Пусть сегодняшний день красиво завершится, а завтра начнётся с новой энергией.",
      "Хорошей ночи, полного перезапуска и спокойного сна.",
      "Отдыхай. Завтра будет новый хороший день."
    ]
  }
};

const styleTypography = {
  premium: {
    titleFamily: '"Playfair Display", serif',
    bodyFamily: 'Inter, sans-serif',
    titleColor: '#fff7ef',
    bodyColor: 'rgba(255,250,243,0.96)',
    tagColor: 'rgba(255,249,240,0.74)',
    align: 'center'
  },
  soft: {
    titleFamily: '"Cormorant Garamond", serif',
    bodyFamily: 'Inter, sans-serif',
    titleColor: '#fffaf6',
    bodyColor: 'rgba(255,252,247,0.97)',
    tagColor: 'rgba(255,252,247,0.76)',
    align: 'center'
  },
  modern: {
    titleFamily: '"Prata", serif',
    bodyFamily: 'Inter, sans-serif',
    titleColor: '#ffffff',
    bodyColor: 'rgba(255,255,255,0.96)',
    tagColor: 'rgba(255,255,255,0.70)',
    align: 'left'
  }
};

function setStatus(text, isError = false) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("error", isError);
}

function chooseVariant(items) {
  if (items.length === 1) return items[0];

  let index;
  do {
    index = Math.floor(Math.random() * items.length);
  } while (index === previousTextIndex);

  previousTextIndex = index;
  return items[index];
}

function titleFor(occasion, name) {
  const hasName = Boolean(name);

  if (!hasName) {
    return {
      birthday: "С днём рождения!",
      mother: "Для самой любимой мамы",
      love: "Для тебя",
      morning: "Доброе утро!",
      night: "Спокойной ночи"
    }[occasion];
  }

  return {
    birthday: `${name}, с днём рождения!`,
    mother: `${name}, это для тебя`,
    love: `${name}, для тебя`,
    morning: `${name}, доброе утро!`,
    night: `${name}, спокойной ночи`
  }[occasion];
}

function buildGreeting() {
  const occasion = occasionInput.value;
  const visualStyle = visualStyleInput.value;
  const name = nameInput.value.trim();
  const details = detailsInput.value.trim();

  let text = chooseVariant(textVariants[occasion][visualStyle]);

  if (details) {
    text += ` Пусть всё, что тебе дорого — ${details.toLowerCase()} — приносит ещё больше радости.`;
  }

  return {
    occasion,
    visualStyle,
    name,
    details,
    title: titleFor(occasion, name),
    text
  };
}

function backendConfigured() {
  return !API_BASE_URL.includes("YOUR-TIMEWEB-BACKEND");
}

function getMaxInitData() {
  try {
    if (window.WebApp && typeof window.WebApp.initData === "string") {
      return window.WebApp.initData;
    }
  } catch (error) {
    console.warn("Не удалось получить initData:", error);
  }

  return "";
}

function wrapText(context, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function fitFontSize(context, text, maxWidth, startSize, minSize, family, weight = 700) {
  let size = startSize;

  while (size > minSize) {
    context.font = `${weight} ${size}px ${family}`;
    if (context.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }

  return minSize;
}

function drawImageCover(img) {
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = img.width / img.height;

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imageRatio > canvasRatio) {
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / canvasRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
}

function drawOverlay(styleKey) {
  const top = ctx.createLinearGradient(0, 0, 0, canvas.height);
  top.addColorStop(0, "rgba(0,0,0,0.02)");
  top.addColorStop(0.38, "rgba(0,0,0,0.08)");
  top.addColorStop(0.70, "rgba(0,0,0,0.18)");
  top.addColorStop(1, styleKey === "soft" ? "rgba(43,28,30,0.46)" : "rgba(8,8,16,0.54)");

  ctx.fillStyle = top;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radial = ctx.createRadialGradient(
    canvas.width * 0.5, canvas.height * 0.22, 40,
    canvas.width * 0.5, canvas.height * 0.22, canvas.width * 0.75
  );
  radial.addColorStop(0, "rgba(255,255,255,0.07)");
  radial.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTagLine(greeting, typography) {
  const labelMap = {
    birthday: "BIRTHDAY",
    mother: "WITH LOVE",
    love: "LOVE",
    morning: "GOOD MORNING",
    night: "GOOD NIGHT"
  };

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = typography.tagColor;
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 10;
  ctx.font = `700 26px Inter, sans-serif`;
  ctx.fillText(labelMap[greeting.occasion], 540, 86);
  ctx.restore();
}

function drawTitleAndBody(greeting) {
  const typography = styleTypography[greeting.visualStyle];
  const leftX = typography.align === "left" ? 120 : 540;
  const maxTextWidth = typography.align === "left" ? 760 : 800;

  ctx.save();
  ctx.textBaseline = "top";
  ctx.textAlign = typography.align;

  const titleSize = fitFontSize(
    ctx,
    greeting.title,
    maxTextWidth,
    greeting.visualStyle === "soft" ? 92 : 82,
    50,
    typography.titleFamily,
    700
  );

  ctx.font = `700 ${titleSize}px ${typography.titleFamily}`;
  const titleLines = wrapText(ctx, greeting.title, maxTextWidth).slice(0, 2);

  let titleY = 800;
  if (titleLines.length === 2) titleY = 760;

  ctx.fillStyle = typography.titleColor;
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 4;

  titleLines.forEach((line, index) => {
    ctx.fillText(line, leftX, titleY + index * (titleSize + 6));
  });

  const bodySize = greeting.visualStyle === "soft" ? 37 : 35;
  ctx.font = `500 ${bodySize}px ${typography.bodyFamily}`;
  const bodyLines = wrapText(ctx, greeting.text, maxTextWidth - 30).slice(0, 8);

  ctx.fillStyle = typography.bodyColor;
  ctx.shadowColor = "rgba(0,0,0,0.20)";
  ctx.shadowBlur = 13;
  ctx.shadowOffsetY = 2;

  let bodyY = titleY + titleLines.length * (titleSize + 10) + 42;
  const bodyLineHeight = bodySize * 1.48;

  bodyLines.forEach((line, index) => {
    ctx.fillText(line, leftX, bodyY + index * bodyLineHeight);
  });

  ctx.font = `600 22px Inter, sans-serif`;
  ctx.fillStyle = typography.tagColor;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 1;
  ctx.fillText("Создано в «Поздравь»", typography.align === "left" ? 120 : 540, 1255);

  ctx.restore();
}

async function renderCard(imageDataUrl, greeting) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      generatedImage = img;
      lastImageDataUrl = imageDataUrl;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawImageCover(img);
      drawOverlay(greeting.visualStyle);
      drawTagLine(greeting, styleTypography[greeting.visualStyle]);
      drawTitleAndBody(greeting);

      resolve();
    };

    img.onerror = () => reject(new Error("Не удалось загрузить AI-изображение."));
    img.src = imageDataUrl;
  });
}

async function requestAIBackground(greeting) {
  const response = await fetch(`${API_BASE_URL}/api/generate-ai-card`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      initData: getMaxInitData(),
      occasion: greeting.occasion,
      visualStyle: greeting.visualStyle,
      recipientName: greeting.name,
      details: greeting.details
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
}

async function generateCard() {
  if (!backendConfigured()) {
    setStatus("Сначала вставьте адрес backend Timeweb в app.js.", true);
    return;
  }

  generateButton.disabled = true;
  newVariantButton.disabled = true;
  setStatus("Создаём AI-фон и собираем открытку…");

  try {
    const greeting = buildGreeting();
    const imageData = await requestAIBackground(greeting);

    lastGreeting = greeting;
    await renderCard(imageData, greeting);

    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    setStatus("Готово! Если не понравился фон — нажмите «Новый AI-вариант». ");
  } catch (error) {
    console.error(error);
    setStatus(`Не удалось создать открытку: ${error.message}`, true);
  } finally {
    generateButton.disabled = false;
    newVariantButton.disabled = false;
  }
}

function downloadPNG() {
  if (!lastGreeting) {
    setStatus("Сначала создайте открытку.", true);
    return;
  }

  const link = document.createElement("a");
  const fileName = (lastGreeting.name || "otkrytka")
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "otkrytka";

  link.download = `pozdrav-${fileName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();

  setStatus("PNG сохранён на устройство.");
}

function canvasAsBase64PNG() {
  return canvas.toDataURL("image/png");
}

async function sendToMax() {
  if (!lastGreeting) {
    setStatus("Сначала создайте открытку.", true);
    return;
  }

  if (
    !window.WebApp ||
    typeof window.WebApp.shareMaxContent !== "function"
  ) {
    setStatus("Отправка в MAX работает только внутри мини-приложения MAX.", true);
    return;
  }

  const initData = getMaxInitData();
  if (!initData) {
    setStatus("MAX не передал данные запуска. Откройте приложение через бота MAX.", true);
    return;
  }

  sendMaxButton.disabled = true;
  setStatus("Загружаем открытку в MAX…");

  try {
    const response = await fetch(`${API_BASE_URL}/api/send-card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        initData,
        imageData: canvasAsBase64PNG(),
        caption: "🎁 Открытка из «Поздравь»"
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || `Ошибка сервера ${response.status}`);
    }

    if (!result.mid) {
      throw new Error("Сервер не вернул идентификатор сообщения.");
    }

    setStatus("Выберите чат в MAX…");

    window.WebApp.shareMaxContent({
      mid: result.mid,
      chatType: "DIALOG"
    });
  } catch (error) {
    console.error(error);
    setStatus(`Не удалось отправить: ${error.message}`, true);
  } finally {
    sendMaxButton.disabled = false;
  }
}

generateButton.addEventListener("click", generateCard);
newVariantButton.addEventListener("click", generateCard);
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
