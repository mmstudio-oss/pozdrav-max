const API_BASE_URL = "https://mmstudio-oss-pozdrav-max-5bd2.twc1.net";

const occasionInput = document.getElementById("occasion");
const visualStyleInput = document.getElementById("visualStyle");
const sourceModeInput = document.getElementById("sourceMode");
const variantCountInput = document.getElementById("variantCount");
const nameInput = document.getElementById("name");
const detailsInput = document.getElementById("details");
const personalFields = document.getElementById("personalFields");
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
      "Пусть каждый день приносит радость, вдохновение и красивые моменты.",
      "Желаю счастья, тепла и исполнения самых важных желаний.",
      "Пусть рядом будут любимые люди, а впереди — только хорошее."
    ],
    soft: [
      "Пусть в жизни будет больше света, тепла и добрых чудес.",
      "Желаю нежности, гармонии и счастливых моментов.",
      "Пусть каждый день дарит улыбки и хорошее настроение."
    ],
    modern: [
      "Желаю энергии, ярких впечатлений и удачи во всём важном.",
      "Пусть всё задуманное складывается легко и красиво.",
      "Больше радости, свободы и сильных моментов впереди."
    ]
  },
  mother: {
    premium: [
      "Спасибо за твою любовь, тепло и заботу. Будь счастлива.",
      "Пусть каждый день будет светлым, спокойным и радостным.",
      "Желаю здоровья, душевного тепла и красивых дней."
    ],
    soft: [
      "Пусть каждый день будет наполнен нежностью и улыбками.",
      "Желаю цветов без повода, тепла в сердце и гармонии.",
      "Пусть забота и любовь всегда возвращаются к тебе."
    ],
    modern: [
      "Пусть будет больше лёгких дней и времени для себя.",
      "Желаю здоровья, радости и приятных событий.",
      "Пусть всё хорошее приходит вовремя."
    ]
  },
  love: {
    premium: [
      "С тобой каждый день становится особенным.",
      "Пусть у нас будет ещё больше тёплых и счастливых моментов.",
      "Ты — очень важный человек в моей жизни."
    ],
    soft: [
      "Пусть рядом всегда будут тепло, нежность и любовь.",
      "Хочу, чтобы у тебя было больше радости и улыбок.",
      "Пусть в сердце всегда живут свет и спокойствие."
    ],
    modern: [
      "Ты — мой человек. И этим сказано многое.",
      "Больше честных чувств, поддержки и счастливых дней.",
      "Спасибо, что делаешь мою жизнь лучше."
    ]
  },
  morning: {
    premium: [
      "Пусть это утро начнётся красиво, а день принесёт хорошие новости.",
      "Желаю вдохновения, лёгкости и приятных встреч.",
      "Пусть день будет светлым и полным поводов для улыбки."
    ],
    soft: [
      "Доброе утро. Пусть день будет тёплым и добрым.",
      "Пусть утро подарит хорошее настроение и лёгкость.",
      "Желаю гармонии и самых приятных событий сегодня."
    ],
    modern: [
      "Пусть день начнётся уверенно и пройдёт отлично.",
      "Хорошего утра, энергии и удачи во всём.",
      "Пусть сегодня всё складывается легко."
    ]
  },
  night: {
    premium: [
      "Пусть ночь будет тихой, красивой и спокойной.",
      "Желаю отпустить всё лишнее и увидеть добрые сны.",
      "Пусть эта ночь подарит уют и настоящий отдых."
    ],
    soft: [
      "Спокойной ночи. Пусть сон будет глубоким и добрым.",
      "Пусть вечер подарит тишину, отдых и уют.",
      "Желаю спокойствия и хорошего пробуждения утром."
    ],
    modern: [
      "Пусть день красиво завершится, а завтра начнётся легко.",
      "Хорошей ночи и полного перезапуска.",
      "Отдыхай. Завтра будет новый хороший день."
    ]
  }
};

const typographyColors = {
  premium: {
    lightTitle: '#fff8ef',
    lightBody: 'rgba(255,250,243,0.98)',
    lightAccent: 'rgba(255,248,238,0.72)',
    darkTitle: '#332322',
    darkBody: 'rgba(43,32,31,0.96)',
    darkAccent: 'rgba(43,32,31,0.62)'
  },
  soft: {
    lightTitle: '#fffaf7',
    lightBody: 'rgba(255,252,248,0.98)',
    lightAccent: 'rgba(255,252,247,0.72)',
    darkTitle: '#4a303b',
    darkBody: 'rgba(58,42,48,0.96)',
    darkAccent: 'rgba(58,42,48,0.62)'
  },
  modern: {
    lightTitle: '#ffffff',
    lightBody: 'rgba(255,255,255,0.97)',
    lightAccent: 'rgba(255,255,255,0.72)',
    darkTitle: '#17191f',
    darkBody: 'rgba(23,25,31,0.94)',
    darkAccent: 'rgba(23,25,31,0.62)'
  }
};

const typographyPresets = {
  premium: [
    { titleFamily: '"Lobster", cursive', titleWeight: 400, bodyFamily: '"Cormorant Garamond", serif', bodyWeight: 600 },
    { titleFamily: '"Pacifico", cursive', titleWeight: 400, bodyFamily: '"PT Serif", serif', bodyWeight: 400 },
    { titleFamily: '"Marck Script", cursive', titleWeight: 400, bodyFamily: '"Prata", serif', bodyWeight: 400 }
  ],
  soft: [
    { titleFamily: '"Bad Script", cursive', titleWeight: 400, bodyFamily: '"Cormorant Garamond", serif', bodyWeight: 600 },
    { titleFamily: '"Marck Script", cursive', titleWeight: 400, bodyFamily: '"PT Serif", serif', bodyWeight: 400 },
    { titleFamily: '"Neucha", cursive', titleWeight: 400, bodyFamily: '"Prata", serif', bodyWeight: 400 }
  ],
  modern: [
    { titleFamily: '"Caveat", cursive', titleWeight: 700, bodyFamily: 'Inter, sans-serif', bodyWeight: 500 },
    { titleFamily: '"Pangolin", cursive', titleWeight: 400, bodyFamily: '"PT Serif", serif', bodyWeight: 400 },
    { titleFamily: '"Neucha", cursive', titleWeight: 400, bodyFamily: 'Inter, sans-serif', bodyWeight: 500 }
  ]
};

function typographyForVariant(visualStyle, variantIndex = 0) {
  const presets = typographyPresets[visualStyle] || typographyPresets.premium;
  const preset = presets[variantIndex % presets.length];
  return {
    ...(typographyColors[visualStyle] || typographyColors.premium),
    ...preset,
    accentFamily: 'Inter, sans-serif',
    accentWeight: 600
  };
}

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

function compactSentence(text, maxLength = 150) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;

  const short = normalized.slice(0, maxLength - 1);
  const lastSpace = short.lastIndexOf(" ");
  return `${(lastSpace > 45 ? short.slice(0, lastSpace) : short).trim()}…`;
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
  const readyMode = sourceModeInput.value === "ready";
  const name = readyMode ? "" : nameInput.value.trim();
  const details = readyMode ? "" : compactSentence(detailsInput.value.trim(), 56);
  let text = chooseVariant(textVariants[occasion][visualStyle]);
  if (details) {
    text += ` Пусть рядом будет всё, что тебе особенно дорого: ${details.toLowerCase()}.`;
  }

  text = compactSentence(text, 170);
  return { occasion, visualStyle, name, details, title: titleFor(occasion, name), text, readyMode };
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

async function getReadyCardVariants(greeting, count) {
  if (!backendConfigured()) {
    throw new Error("Сначала вставьте адрес backend Timeweb в app.js.");
  }

  const response = await fetch(`${API_BASE_URL}/api/ready-card-variants`, {
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
  if (!response.ok) throw new Error(result.error || `Ошибка сервера ${response.status}`);
  if (!Array.isArray(result.images) || !result.images.length) {
    throw new Error("Сервер не вернул готовые открытки из базы.");
  }

  return result.images.map((item) => ({
    imageData: item.imageData,
    sourceLabel: "Готовая открытка",
    readyMade: true
  }));
}

async function getAIVariants(greeting, count) {
  if (!backendConfigured()) {
    throw new Error("Сначала вставьте адрес backend Timeweb в app.js.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 100000);

  try {
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
      }),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Ошибка сервера ${response.status}`);
    }
    if (!Array.isArray(result.images) || !result.images.length) {
      throw new Error("Сервер не вернул варианты изображений.");
    }

    return result.images.map((item) => ({
      imageData: item.imageData,
      sourceLabel: "AI"
    }));
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("AI-генерация заняла слишком много времени. Попробуйте ещё раз.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function textVisualWidth(context, text) {
  const metrics = context.measureText(text);
  const left = Math.abs(metrics.actualBoundingBoxLeft || 0);
  const right = Math.abs(metrics.actualBoundingBoxRight || 0);
  return Math.max(metrics.width || 0, left + right);
}

function wrapText(context, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (current && textVisualWidth(context, candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

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

function findBestTextArea(ctx, canvas, textLength = 0) {
  const candidates = [
    { name: "top-left",     x: 40,  y: 72,  w: 560, h: 640, align: "left" },
    { name: "top-right",    x: 480, y: 72,  w: 560, h: 640, align: "right" },
    { name: "middle-left",  x: 40,  y: 250, w: 560, h: 690, align: "left" },
    { name: "middle-right", x: 480, y: 250, w: 560, h: 690, align: "right" },
    { name: "bottom-left",  x: 40,  y: 600, w: 560, h: 670, align: "left" },
    { name: "bottom-right", x: 480, y: 600, w: 560, h: 670, align: "right" },
    { name: "top-center",   x: 92, y: 72,  w: 896, h: 648, align: "center" },
    { name: "middle-center",x: 92, y: 245, w: 896, h: 720, align: "center" },
    { name: "bottom-center",x: 92, y: 595, w: 896, h: 680, align: "center" }
  ];

  let best = null;

  for (const region of candidates) {
    const analysis = analyzeRegion(
      getImageDataSafe(ctx, region.x, region.y, region.w, region.h)
    );

    const longText = textLength > 62;
    const centerPenalty = region.align === "center" ? (longText ? 0.8 : 5) : 0;
    const bottomPenalty = region.name.startsWith("bottom") ? 1.5 : 0;
    const widthBonus = longText ? region.w * 0.006 : 0;
    const effectiveScore = analysis.score + centerPenalty + bottomPenalty - widthBonus;

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
  const absoluteMin = Math.min(minSize, 48);

  for (let size = startSize; size >= absoluteMin; size -= 2) {
    ctx.font = fontString(weight, size, family);
    const lines = wrapText(ctx, text, maxWidth);
    const widest = lines.reduce((acc, line) => Math.max(acc, textVisualWidth(ctx, line)), 0);

    if (lines.length <= maxLines && widest <= maxWidth) {
      return { size, lines, widest };
    }
  }

  // Если даже минимальный размер не влез — продолжаем уменьшать,
  // но НИКОГДА не разрываем слово по буквам.
  for (let size = absoluteMin - 2; size >= 36; size -= 2) {
    ctx.font = fontString(weight, size, family);
    const lines = wrapText(ctx, text, maxWidth);
    const widest = lines.reduce((acc, line) => Math.max(acc, textVisualWidth(ctx, line)), 0);

    if (lines.length <= maxLines && widest <= maxWidth) {
      return { size, lines, widest };
    }
  }

  ctx.font = fontString(weight, 36, family);
  const lines = wrapText(ctx, text, maxWidth);
  return {
    size: 36,
    lines,
    widest: lines.reduce((acc, line) => Math.max(acc, textVisualWidth(ctx, line)), 0)
  };
}

function safeWidthForAlignment(ctx, x, align, preferredWidth, safeMargin = 58) {
  const leftRoom = Math.max(0, x - safeMargin);
  const rightRoom = Math.max(0, ctx.canvas.width - safeMargin - x);

  if (align === "left") return Math.max(120, Math.min(preferredWidth, rightRoom));
  if (align === "right") return Math.max(120, Math.min(preferredWidth, leftRoom));
  return Math.max(120, Math.min(preferredWidth, 2 * Math.min(leftRoom, rightRoom)));
}

function measureComposition(ctx, greeting, typography, composition, region, sizes) {
  const effectiveAlign = composition.alignOverride || region.align;
  const sidePad = effectiveAlign === "center" ? 44 : 36;
  const preferredWidth = region.w - sidePad * 2;
  const x = effectiveAlign === "left"
    ? region.x + sidePad
    : effectiveAlign === "right"
      ? region.x + region.w - sidePad
      : region.x + region.w / 2;
  const maxWidth = safeWidthForAlignment(ctx, x, effectiveAlign, preferredWidth, 58);

  const titleFit = fitWrappedText(
    ctx,
    greeting.title,
    maxWidth,
    composition.maxTitleLines,
    sizes.title,
    Math.min(86, sizes.title),
    typography.titleWeight,
    typography.titleFamily
  );

  const titleLineHeight = titleFit.size * (greeting.visualStyle === "premium" ? 0.95 : 0.92);
  const titleHeight = titleFit.lines.length * titleLineHeight;
  const titleGap = composition.titleGap;

  ctx.font = fontString(typography.bodyWeight, sizes.body, typography.bodyFamily);
  let bodyLines = wrapText(ctx, greeting.text, maxWidth);
  const bodyLineHeight = sizes.body * (greeting.visualStyle === "modern" ? 1.24 : 1.16);

  if (bodyLines.length > sizes.maxBodyLines) {
    bodyLines = bodyLines.slice(0, sizes.maxBodyLines);
    const last = bodyLines[bodyLines.length - 1] || "";
    if (!last.endsWith("…")) {
      bodyLines[bodyLines.length - 1] = compactSentence(last, Math.max(16, last.length - 1));
    }
  }

  const bodyHeight = bodyLines.length * bodyLineHeight;
  const topPad = 18 + composition.yOffset;
  const bottomPad = 34;
  const brandReserve = 58;
  const totalHeight = topPad + titleHeight + titleGap + bodyHeight + brandReserve + bottomPad;

  return {
    effectiveAlign,
    sidePad,
    x,
    maxWidth,
    titleFit,
    titleLineHeight,
    titleHeight,
    bodyLines,
    bodyLineHeight,
    bodyHeight,
    topPad,
    bottomPad,
    brandReserve,
    totalHeight
  };
}

function fitCardComposition(ctx, greeting, typography, composition, region) {
  const sizes = {
    title: Math.round((greeting.visualStyle === "soft" ? 136 : greeting.visualStyle === "premium" ? 132 : 128) * composition.titleScale),
    body: Math.round((greeting.visualStyle === "modern" ? 38 : 43) * composition.bodyScale),
    minTitle: greeting.visualStyle === "modern" ? 60 : 64,
    minBody: greeting.visualStyle === "modern" ? 27 : 29,
    maxBodyLines: 6
  };

  const maxAvailableHeight = region.h - 22;
  let metrics = measureComposition(ctx, greeting, typography, composition, region, sizes);
  let guard = 0;

  while (guard < 80) {
    const bodyTooTall = metrics.bodyLines.length > sizes.maxBodyLines || metrics.bodyHeight > maxAvailableHeight * 0.50;
    const titleTooTall = metrics.titleHeight > maxAvailableHeight * 0.48;
    const overflow = metrics.totalHeight - maxAvailableHeight;

    if (overflow <= 0 && !bodyTooTall && !titleTooTall) break;

    if (overflow > 0 || bodyTooTall) {
      if (sizes.body > sizes.minBody) {
        sizes.body -= overflow > 36 ? 3 : 2;
      } else if (sizes.maxBodyLines > 5) {
        sizes.maxBodyLines -= 1;
      }
    }

    if (overflow > 0 || titleTooTall || (metrics.bodyLines.length >= 6 && sizes.title > sizes.minTitle)) {
      if (sizes.title > sizes.minTitle) {
        sizes.title -= overflow > 36 ? 3 : 2;
      }
    }

    metrics = measureComposition(ctx, greeting, typography, composition, region, sizes);
    guard += 1;
  }

  return {
    ...metrics,
    titleSize: sizes.title,
    bodySize: sizes.body,
    maxBodyLines: sizes.maxBodyLines
  };
}

const compositionProfiles = [
  {
    name: "editorial-left",
    alignOverride: "left",
    titleScale: 1.04,
    bodyScale: 1.02,
    titleGap: 30,
    yOffset: 0,
    maxTitleLines: 2
  },
  {
    name: "hero-center",
    alignOverride: "center",
    titleScale: 1.08,
    bodyScale: 0.96,
    titleGap: 36,
    yOffset: 24,
    maxTitleLines: 2
  },
  {
    name: "signature-right",
    alignOverride: "right",
    titleScale: 1.05,
    bodyScale: 1.00,
    titleGap: 28,
    yOffset: 8,
    maxTitleLines: 2
  }
];

function compositionForVariant(index) {
  return compositionProfiles[index % compositionProfiles.length];
}

function drawSmartTypography(ctx, greeting, region, variantIndex = 0) {
  const typography = typographyForVariant(greeting.visualStyle, variantIndex);

  const useDarkText = region.brightness >= 185 && region.contrast < 78;
  const titleColor = useDarkText ? typography.darkTitle : typography.lightTitle;
  const bodyColor = useDarkText ? typography.darkBody : typography.lightBody;
  const accentColor = useDarkText ? typography.darkAccent : typography.lightAccent;

  drawFeatheredTextVeil(ctx, region, useDarkText);

  const composition = compositionForVariant(variantIndex);
  const metrics = fitCardComposition(ctx, greeting, typography, composition, region);

  const x = metrics.x;

  ctx.save();
  ctx.textAlign = metrics.effectiveAlign;
  ctx.textBaseline = "top";

  let cursorY = region.y + metrics.topPad;

  ctx.font = fontString(typography.titleWeight, metrics.titleFit.size, typography.titleFamily);
  ctx.fillStyle = titleColor;
  ctx.shadowColor = useDarkText ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.32)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;

  metrics.titleFit.lines.forEach((line, index) => {
    ctx.fillText(line, x, cursorY + index * metrics.titleLineHeight);
  });

  cursorY += metrics.titleHeight + composition.titleGap;

  ctx.font = fontString(typography.bodyWeight, metrics.bodySize, typography.bodyFamily);
  ctx.fillStyle = bodyColor;
  ctx.shadowColor = useDarkText ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  metrics.bodyLines.forEach((line, index) => {
    ctx.fillText(line, x, cursorY + index * metrics.bodyLineHeight);
  });

  const brandText = 'Создано в «Поздравь»';
  const brandY = ctx.canvas.height - 34;
  const brandSize = 17;
  ctx.font = fontString(600, brandSize, 'Inter, sans-serif');
  ctx.fillStyle = accentColor;
  ctx.shadowBlur = 4;

  const brandX = ctx.canvas.width / 2;
  ctx.textAlign = "center";
  ctx.fillText(brandText, brandX, brandY);
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

async function renderVariant(canvas, imageSource, greeting, variantIndex = 0) {
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
  const bestRegion = findBestTextArea(ctx, canvas, greeting.title.length + greeting.text.length);
  drawSmartTypography(ctx, greeting, bestRegion, variantIndex);
}

async function renderReadyVariant(canvas, imageSource) {
  const ctx = canvas.getContext("2d");
  const img = await loadImage(imageSource);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f7f4ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;
  ctx.drawImage(img, x, y, width, height);
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
  setStatus(
    mode === "ai"
      ? "Генерируем 2–3 AI-варианта…"
      : mode === "ready"
        ? "Берём 2–3 готовые открытки из базы…"
        : "Берём 2–3 фото из облачной базы…"
  );

  const items = mode === "ai"
    ? await getAIVariants(greeting, count)
    : mode === "ready"
      ? await getReadyCardVariants(greeting, count)
      : await getPhotoVariants(greeting, count);

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const card = createVariantCard(i, item);
    item.readyMade
      ? await renderReadyVariant(card.canvas, item.imageData)
      : await renderVariant(card.canvas, item.imageData, greeting, i);

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

function updateSourceModeUi() {
  const readyMode = sourceModeInput.value === "ready";
  personalFields.classList.toggle("hidden", readyMode);

  if (readyMode) {
    nameInput.value = "";
    detailsInput.value = "";
  }
}

sourceModeInput.addEventListener("change", updateSourceModeUi);
updateSourceModeUi();

generateButton.addEventListener("click", handleGenerate);
nameInput.addEventListener("keydown", (event) => { if (event.key === "Enter") handleGenerate(); });

try {
  if (window.WebApp && typeof window.WebApp.ready === "function") {
    window.WebApp.ready();
  }
} catch (error) {
  console.warn("MAX Bridge пока недоступен:", error);
}
