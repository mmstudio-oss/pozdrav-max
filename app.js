const API_BASE_URL = "https://mmstudio-oss-pozdrav-max-5bd2.twc1.net";

const occasionInput = document.getElementById("occasion");
const visualStyleInput = document.getElementById("visualStyle");
const sourceModeInput = document.getElementById("sourceMode");
const variantCountInput = document.getElementById("variantCount");
const nameInput = document.getElementById("name");
const detailsInput = document.getElementById("details");
const generateButton = document.getElementById("generateButton");
const statusMessage = document.getElementById("statusMessage");
const resultsSection = document.getElementById("resultsSection");
const resultsGrid = document.getElementById("resultsGrid");
const variantTemplate = document.getElementById("variantTemplate");

let currentCards = [];
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
    titleFamily: '"Marck Script", cursive',
    titleWeight: 400,
    bodyFamily: '"Cormorant Garamond", serif',
    bodyWeight: 600,
    accentFamily: 'Inter, sans-serif',
    accentWeight: 700,
    lightTitle: '#fff8ef',
    lightBody: 'rgba(255,250,243,0.98)',
    lightAccent: 'rgba(255,248,238,0.78)',
    darkTitle: '#332322',
    darkBody: 'rgba(43,32,31,0.96)',
    darkAccent: 'rgba(43,32,31,0.70)'
  },
  soft: {
    titleFamily: '"Bad Script", cursive',
    titleWeight: 400,
    bodyFamily: '"Cormorant Garamond", serif',
    bodyWeight: 600,
    accentFamily: 'Inter, sans-serif',
    accentWeight: 600,
    lightTitle: '#fffaf7',
    lightBody: 'rgba(255,252,248,0.98)',
    lightAccent: 'rgba(255,252,247,0.78)',
    darkTitle: '#4a303b',
    darkBody: 'rgba(58,42,48,0.96)',
    darkAccent: 'rgba(58,42,48,0.68)'
  },
  modern: {
    titleFamily: '"Caveat", cursive',
    titleWeight: 700,
    bodyFamily: 'Inter, sans-serif',
    bodyWeight: 500,
    accentFamily: 'Inter, sans-serif',
    accentWeight: 700,
    lightTitle: '#ffffff',
    lightBody: 'rgba(255,255,255,0.97)',
    lightAccent: 'rgba(255,255,255,0.72)',
    darkTitle: '#17191f',
    darkBody: 'rgba(23,25,31,0.94)',
    darkAccent: 'rgba(23,25,31,0.68)'
  }
};

function setStatus(text, isError = false) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("error", isError);
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
  if (!name) {
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
  return { occasion, visualStyle, name, details, title: titleFor(occasion, name), text };
}

async function getPhotoVariants(greeting, count) {
  if (!backendConfigured()) {
    throw new Error("Сначала вставьте адрес backend Timeweb в app.js.");
  }

  const response = await fetch(`${API_BASE_URL}/api/photo-variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      initData: getMaxInitData(),
      occasion: greeting.occasion,
      visualStyle: greeting.visualStyle,
      variantCount: count
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || `Ошибка сервера ${response.status}`);
  }

  if (!Array.isArray(result.images) || !result.images.length) {
    throw new Error("Сервер не вернул фотографии из облачной базы.");
  }

  return result.images.map((item) => ({
    imageData: item.imageData,
    sourceLabel: "Облако"
  }));
}

async function getAIVariants(greeting, count) {
  if (!backendConfigured()) {
    throw new Error("Сначала вставьте адрес backend Timeweb в app.js.");
  }
  const response = await fetch(`${API_BASE_URL}/api/generate-ai-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      initData: getMaxInitData(),
      occasion: greeting.occasion,
      visualStyle: greeting.visualStyle,
      recipientName: greeting.name,
      details: greeting.details,
      variantCount: count
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Ошибка сервера ${response.status}`);
  }
  if (!Array.isArray(result.images) || !result.images.length) {
    throw new Error("Сервер не вернул варианты изображений.");
  }
  return result.images.map((item) => ({ imageData: item.imageData, sourceLabel: "AI" }));
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

function drawImageCover(ctx, canvas, img) {
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = img.width / img.height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imageRatio > canvasRatio) {
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / canvasRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
}

function getImageDataSafe(ctx, x, y, width, height) {
  try {
    return ctx.getImageData(
      Math.max(0, Math.round(x)),
      Math.max(0, Math.round(y)),
      Math.max(1, Math.round(width)),
      Math.max(1, Math.round(height))
    );
  } catch (error) {
    console.warn("Не удалось проанализировать область изображения:", error);
    return null;
  }
}

function analyzeRegion(imageData) {
  if (!imageData) {
    return { score: Number.MAX_SAFE_INTEGER, brightness: 110, contrast: 100 };
  }

  const { data, width, height } = imageData;
  const step = 6;
  let samples = 0;
  let brightnessSum = 0;
  let brightnessSqSum = 0;
  let localEdges = 0;
  let saturationSum = 0;

  const brightnessAt = (x, y) => {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  for (let y = 0; y < height - step; y += step) {
    for (let x = 0; x < width - step; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const value = 0.299 * r + 0.587 * g + 0.114 * b;
      const right = brightnessAt(x + step, y);
      const down = brightnessAt(x, y + step);
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);

      brightnessSum += value;
      brightnessSqSum += value * value;
      localEdges += Math.abs(value - right) + Math.abs(value - down);
      saturationSum += maxC - minC;
      samples += 1;
    }
  }

  if (!samples) {
    return { score: Number.MAX_SAFE_INTEGER, brightness: 110, contrast: 100 };
  }

  const brightness = brightnessSum / samples;
  const variance = Math.max(0, brightnessSqSum / samples - brightness * brightness);
  const contrast = Math.sqrt(variance);
  const edges = localEdges / samples;
  const saturation = saturationSum / samples;

  // Чем меньше число, тем спокойнее участок. Контраст и мелкие границы
  // штрафуются сильнее всего: именно они мешают читать текст.
  const score = edges * 1.15 + contrast * 0.95 + saturation * 0.12;

  return { score, brightness, contrast };
}

function findBestTextArea(ctx, canvas) {
  const candidates = [
    { name: "top-left",     x: 55,  y: 90,  w: 520, h: 585, align: "left" },
    { name: "top-right",    x: 505, y: 90,  w: 520, h: 585, align: "right" },
    { name: "middle-left",  x: 55,  y: 300, w: 520, h: 620, align: "left" },
    { name: "middle-right", x: 505, y: 300, w: 520, h: 620, align: "right" },
    { name: "bottom-left",  x: 55,  y: 650, w: 520, h: 610, align: "left" },
    { name: "bottom-right", x: 505, y: 650, w: 520, h: 610, align: "right" },
    { name: "top-center",   x: 110, y: 90,  w: 860, h: 600, align: "center" },
    { name: "bottom-center",x: 110, y: 645, w: 860, h: 615, align: "center" }
  ];

  let best = null;

  for (const region of candidates) {
    const analysis = analyzeRegion(
      getImageDataSafe(ctx, region.x, region.y, region.w, region.h)
    );

    // Небольшое предпочтение боковым зонам: композиция обычно выглядит
    // естественнее и меньше перекрывает центральный объект фотографии.
    const centerPenalty = region.align === "center" ? 5 : 0;
    const bottomPenalty = region.name.startsWith("bottom") ? 1.5 : 0;
    const effectiveScore = analysis.score + centerPenalty + bottomPenalty;

    if (!best || effectiveScore < best.effectiveScore) {
      best = {
        ...region,
        ...analysis,
        effectiveScore
      };
    }
  }

  return best || {
    name: "bottom-center",
    x: 110,
    y: 645,
    w: 860,
    h: 615,
    align: "center",
    brightness: 100,
    contrast: 60
  };
}

function drawFeatheredTextVeil(ctx, region, useDarkText) {
  // Это не плашка: только мягкая растушёвка без видимой рамки.
  const padX = 90;
  const padY = 78;
  const x = Math.max(0, region.x - padX);
  const y = Math.max(0, region.y - padY);
  const w = Math.min(ctx.canvas.width - x, region.w + padX * 2);
  const h = Math.min(ctx.canvas.height - y, region.h + padY * 2);

  const gradient = ctx.createRadialGradient(
    region.x + region.w / 2,
    region.y + region.h / 2,
    Math.min(region.w, region.h) * 0.10,
    region.x + region.w / 2,
    region.y + region.h / 2,
    Math.max(region.w, region.h) * 0.72
  );

  if (useDarkText) {
    gradient.addColorStop(0, "rgba(255,255,255,0.20)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.10)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
  } else {
    gradient.addColorStop(0, "rgba(0,0,0,0.28)");
    gradient.addColorStop(0.55, "rgba(0,0,0,0.13)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  }

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function fontString(weight, size, family) {
  return `${weight} ${size}px ${family}`;
}

function fitWrappedText(ctx, text, maxWidth, maxLines, startSize, minSize, weight, family) {
  for (let size = startSize; size >= minSize; size -= 2) {
    ctx.font = fontString(weight, size, family);
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) {
      return { size, lines };
    }
  }

  ctx.font = fontString(weight, minSize, family);
  return {
    size: minSize,
    lines: wrapText(ctx, text, maxWidth).slice(0, maxLines)
  };
}

function occasionAccent(occasion) {
  return {
    birthday: "С особым днём",
    mother: "С любовью",
    love: "От всего сердца",
    morning: "Для хорошего дня",
    night: "С теплом"
  }[occasion] || "С теплом";
}

function drawSmartTypography(ctx, greeting, region) {
  const typography = styleTypography[greeting.visualStyle];

  // На очень светлом участке пишем тёмным, на остальных — светлым.
  // Порог слегка повышен, чтобы светлый текст чаще использовался на фото.
  const useDarkText = region.brightness >= 185 && region.contrast < 78;

  const titleColor = useDarkText ? typography.darkTitle : typography.lightTitle;
  const bodyColor = useDarkText ? typography.darkBody : typography.lightBody;
  const accentColor = useDarkText ? typography.darkAccent : typography.lightAccent;

  drawFeatheredTextVeil(ctx, region, useDarkText);

  const sidePad = region.align === "center" ? 38 : 28;
  const maxWidth = region.w - sidePad * 2;
  const x = region.align === "left"
    ? region.x + sidePad
    : region.align === "right"
      ? region.x + region.w - sidePad
      : region.x + region.w / 2;

  ctx.save();
  ctx.textAlign = region.align;
  ctx.textBaseline = "top";

  // Маленькая служебная строка.
  const accentSize = greeting.visualStyle === "modern" ? 27 : 26;
  ctx.font = fontString(typography.accentWeight, accentSize, typography.accentFamily);
  ctx.fillStyle = accentColor;
  ctx.shadowColor = useDarkText ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 1;
  ctx.fillText(occasionAccent(greeting.occasion), x, region.y + 12);

  // Рукописный заголовок — заметно крупнее основного текста.
  const titleFit = fitWrappedText(
    ctx,
    greeting.title,
    maxWidth,
    3,
    greeting.visualStyle === "soft" ? 126 : 116,
    72,
    typography.titleWeight,
    typography.titleFamily
  );

  const titleLineHeight = titleFit.size * 0.98;
  let cursorY = region.y + 58;

  ctx.font = fontString(typography.titleWeight, titleFit.size, typography.titleFamily);
  ctx.fillStyle = titleColor;
  ctx.shadowColor = useDarkText ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.34)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;

  titleFit.lines.forEach((line, index) => {
    ctx.fillText(line, x, cursorY + index * titleLineHeight);
  });

  cursorY += titleFit.lines.length * titleLineHeight + 30;

  // Основной текст автоматически уменьшается, если поздравление длинное.
  const availableBodyHeight = Math.max(190, region.y + region.h - cursorY - 56);
  let bodySize = greeting.visualStyle === "modern" ? 42 : 46;
  const minBodySize = greeting.visualStyle === "modern" ? 30 : 32;
  let bodyLines = [];
  let bodyLineHeight = 0;

  while (bodySize >= minBodySize) {
    ctx.font = fontString(typography.bodyWeight, bodySize, typography.bodyFamily);
    bodyLines = wrapText(ctx, greeting.text, maxWidth);
    bodyLineHeight = bodySize * (greeting.visualStyle === "modern" ? 1.34 : 1.24);

    if (bodyLines.length * bodyLineHeight <= availableBodyHeight && bodyLines.length <= 7) {
      break;
    }

    bodySize -= 2;
  }

  bodyLines = bodyLines.slice(0, 7);
  ctx.font = fontString(typography.bodyWeight, bodySize, typography.bodyFamily);
  ctx.fillStyle = bodyColor;
  ctx.shadowColor = useDarkText ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.27)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  bodyLines.forEach((line, index) => {
    ctx.fillText(line, x, cursorY + index * bodyLineHeight);
  });

  // Миниатюрная подпись внизу выбранной зоны.
  const brandY = Math.min(region.y + region.h - 32, 1282);
  ctx.font = fontString(600, 23, 'Inter, sans-serif');
  ctx.fillStyle = accentColor;
  ctx.shadowBlur = 5;
  ctx.fillText("Поздравь", x, brandY);

  ctx.restore();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось загрузить изображение."));
    img.src = src;
  });
}

async function renderVariant(canvas, imageSource, greeting) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const img = await loadImage(imageSource);

  // Ждём web-шрифты, чтобы Canvas не успел отрисовать системный fallback.
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (error) {
      console.warn("Шрифты ещё загружаются:", error);
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawImageCover(ctx, canvas, img);

  // Анализ выполняется по чистой фотографии, до любых затемнений и текста.
  const bestRegion = findBestTextArea(ctx, canvas);
  drawSmartTypography(ctx, greeting, bestRegion);
}

function cardFileName(greeting, idx) {
  const base = (greeting.name || greeting.occasion || "otkrytka")
    .trim().toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "otkrytka";
  return `pozdrav-${base}-${idx + 1}.png`;
}

async function sendCanvasToMax(canvas) {
  if (!window.WebApp || typeof window.WebApp.shareMaxContent !== "function") {
    throw new Error("Отправка в MAX работает только внутри мини-приложения MAX.");
  }
  const initData = getMaxInitData();
  if (!initData) {
    throw new Error("MAX не передал данные запуска. Откройте приложение через бота MAX.");
  }
  const response = await fetch(`${API_BASE_URL}/api/send-card`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      initData,
      imageData: canvas.toDataURL("image/png"),
      caption: "🎁 Открытка из «Поздравь»"
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Ошибка сервера ${response.status}`);
  if (!result.mid) throw new Error("Сервер не вернул идентификатор сообщения.");
  window.WebApp.shareMaxContent({ mid: result.mid, chatType: "DIALOG" });
}

function clearResults() {
  resultsGrid.innerHTML = "";
  currentCards = [];
}

function createVariantCard(index, item) {
  const node = variantTemplate.content.firstElementChild.cloneNode(true);
  const canvas = node.querySelector("canvas");
  const title = node.querySelector(".variant-title");
  const label = node.querySelector(".variant-source");

  title.textContent = `Вариант ${index + 1}`;
  label.textContent = item.sourceLabel;

  resultsGrid.appendChild(node);

  return {
    node,
    canvas,
    downloadButton: node.querySelector(".js-download"),
    sendButton: node.querySelector(".js-send")
  };
}

async function buildVariants() {
  const greeting = buildGreeting();
  const count = Math.min(3, Math.max(2, Number(variantCountInput.value || 2)));
  const mode = sourceModeInput.value;
  clearResults();
  setStatus(mode === "ai" ? "Генерируем 2–3 AI-варианта…" : "Берём 2–3 фото из облачной базы…");

  const items = mode === "ai"
    ? await getAIVariants(greeting, count)
    : await getPhotoVariants(greeting, count);

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const card = createVariantCard(i, item);
    await renderVariant(card.canvas, item.imageData, greeting);

    card.downloadButton.addEventListener("click", async () => {
      const link = document.createElement("a");
      link.download = cardFileName(greeting, i);
      link.href = card.canvas.toDataURL("image/png");
      link.click();
      setStatus(`Вариант ${i + 1} сохранён.`);
    });

    card.sendButton.addEventListener("click", async () => {
      card.sendButton.disabled = true;
      try {
        setStatus(`Отправляем вариант ${i + 1} в MAX…`);
        await sendCanvasToMax(card.canvas);
        setStatus("Выберите чат в MAX…");
      } catch (error) {
        console.error(error);
        setStatus(`Не удалось отправить: ${error.message}`, true);
      } finally {
        card.sendButton.disabled = false;
      }
    });

    currentCards.push(card);
  }

  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus("Готово! Выберите лучший вариант или создайте новые.");
}

async function handleGenerate() {
  generateButton.disabled = true;
  try {
    await buildVariants();
  } catch (error) {
    console.error(error);
    setStatus(`Не удалось создать варианты: ${error.message}`, true);
  } finally {
    generateButton.disabled = false;
  }
}

generateButton.addEventListener("click", handleGenerate);
nameInput.addEventListener("keydown", (event) => { if (event.key === "Enter") handleGenerate(); });

try {
  if (window.WebApp && typeof window.WebApp.ready === "function") {
    window.WebApp.ready();
  }
} catch (error) {
  console.warn("MAX Bridge пока недоступен:", error);
}
