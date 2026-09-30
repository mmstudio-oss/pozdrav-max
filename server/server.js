import express from "express";
import cors from "cors";
import crypto from "node:crypto";

const app = express();
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";
const YANDEX_API_KEY = process.env.YANDEX_API_KEY || "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID || "";
const INIT_DATA_MAX_AGE_SECONDS = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);
const ALLOW_BROWSER_AI_GENERATION = process.env.ALLOW_BROWSER_AI_GENERATION === "true";

const YANDEX_IMAGE_ENDPOINT = "https://ai.api.cloud.yandex.net/v1/images/generations";
const YANDEX_MODEL = `art://${YANDEX_FOLDER_ID}/aliceai-image-art-3.0`;

for (const [name, value] of Object.entries({
  BOT_TOKEN,
  FRONTEND_ORIGIN,
  YANDEX_API_KEY,
  YANDEX_FOLDER_ID
})) {
  if (!value) {
    console.error(`ОШИБКА: не задана переменная ${name}`);
    process.exit(1);
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === FRONTEND_ORIGIN) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json({ limit: "16mb" }));

const generationRateMap = new Map();
const sendRateMap = new Map();

function rateAllowed(map, key, maxRequests, windowMs) {
  const now = Date.now();
  const current = map.get(key);

  if (!current || now - current.startedAt > windowMs) {
    map.set(key, { startedAt: now, count: 1 });
    return true;
  }

  if (current.count >= maxRequests) return false;
  current.count += 1;
  return true;
}

function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

function validateMaxInitData(initData) {
  if (!initData || typeof initData !== "string") {
    throw new Error("Отсутствует initData MAX.");
  }

  const params = new URLSearchParams(initData);
  const seen = new Set();
  const pairs = [];
  let receivedHash = "";

  for (const [key, value] of params.entries()) {
    if (seen.has(key)) throw new Error(`Параметр ${key} повторяется.`);
    seen.add(key);

    if (key === "hash") receivedHash = value;
    else pairs.push([key, value]);
  }

  if (!receivedHash) throw new Error("В initData отсутствует hash.");

  pairs.sort(([a], [b]) => a.localeCompare(b));
  const launchParams = pairs.map(([key, value]) => `${key}=${value}`).join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(launchParams)
    .digest("hex");

  if (!safeEqualHex(receivedHash, calculatedHash)) {
    throw new Error("Подпись initData MAX не совпала.");
  }

  const authDateRaw = params.get("auth_date");
  if (!authDateRaw || !/^\d+$/.test(authDateRaw)) {
    throw new Error("Некорректный auth_date.");
  }

  const authDate = Number(authDateRaw);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (
    !Number.isFinite(authDate) ||
    authDate > nowSeconds + 60 ||
    nowSeconds - authDate > INIT_DATA_MAX_AGE_SECONDS
  ) {
    throw new Error("Данные запуска MAX устарели.");
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("MAX не передал данные пользователя.");

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    throw new Error("Не удалось разобрать пользователя MAX.");
  }

  if (user?.id == null) throw new Error("В данных MAX отсутствует user.id.");

  return { userId: String(user.id), user, authDate };
}

function getGenerationIdentity(req, initData) {
  if (typeof initData === "string" && initData) {
    const auth = validateMaxInitData(initData);
    return { key: `max:${auth.userId}`, auth };
  }

  if (ALLOW_BROWSER_AI_GENERATION) {
    return { key: `browser:${req.ip || "unknown"}`, auth: null };
  }

  throw new Error("Откройте мини-приложение внутри MAX, чтобы создавать AI-открытки.");
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

const occasionPrompts = {
  birthday: "день рождения, ощущение праздника, красивый подарок, мягкие огни",
  morning: "доброе утро, солнечный свет, свежесть, уютный красивый рассвет",
  mother: "нежная открытка для мамы, цветы, забота, тепло и уют",
  love: "романтическая открытка, нежность, любовь, тёплая атмосфера",
  night: "спокойная ночь, звёзды, луна, мягкий синий свет, уют",
  newyear: "Новый год, праздничные огни, ёлочные украшения, зимнее волшебство",
  march8: "весенняя открытка к 8 Марта, свежие цветы, свет, элегантность",
  wedding: "свадебная открытка, светлая романтика, цветы, торжественная элегантность",
  graduation: "выпускной, новый этап жизни, вдохновение, светлая праздничная атмосфера"
};

const visualPrompts = {
  celebration: "яркий премиальный праздничный дизайн, золотые акценты, кинематографическое боке",
  sunrise: "воздушный светлый дизайн, естественное мягкое освещение, пастельное небо",
  flowers: "нежный эстетичный дизайн, изящные цветы, пастельные оттенки, editorial photography",
  love: "романтичный современный дизайн, глубокие розово-бордовые акценты, мягкий свет",
  night: "кинематографичный премиальный дизайн, глубокие тёмные оттенки, светящиеся детали"
};

const moodPrompts = {
  warm: "душевное и тёплое настроение",
  fun: "лёгкое радостное настроение, живые детали",
  beautiful: "элегантная журнальная эстетика, изысканная композиция",
  short: "минималистичная чистая композиция"
};

function buildImagePrompt({ occasion, style, template, details }) {
  const occasionPart = occasionPrompts[occasion] || occasionPrompts.birthday;
  const visualPart = visualPrompts[template] || visualPrompts.celebration;
  const moodPart = moodPrompts[style] || moodPrompts.warm;
  const safeDetails = cleanText(details, 100);

  const parts = [
    "Вертикальный фон для современной поздравительной открытки",
    occasionPart,
    visualPart,
    moodPart
  ];

  if (safeDetails) {
    parts.push(`Дополнительные визуальные мотивы: ${safeDetails}`);
  }

  parts.push(
    "Главный объект не должен закрывать центр",
    "оставить спокойную область в центре для поздравительного текста",
    "без надписей, без букв, без логотипов, без водяных знаков",
    "высокая детализация"
  );

  return parts.join(". ").slice(0, 500);
}

async function generateYandexImage(prompt) {
  let response;

  try {
    response = await fetch(YANDEX_IMAGE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${YANDEX_API_KEY}`,
        "OpenAI-Project": YANDEX_FOLDER_ID,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        model: YANDEX_MODEL,
        prompt,
        size: "1024x1536"
      }),
      signal: AbortSignal.timeout(120000)
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      throw new Error("Yandex AI Studio не успел ответить. Попробуйте ещё раз.");
    }
    throw new Error("Не удалось подключиться к Yandex AI Studio.");
  }

  const raw = await response.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  if (!response.ok) {
    console.error("Yandex AI Studio error:", response.status, data);
    const serverMessage =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      `HTTP ${response.status}`;

    throw new Error(`Yandex AI Studio: ${serverMessage}`);
  }

  const base64 = data?.data?.[0]?.b64_json;
  if (typeof base64 !== "string" || base64.length < 100) {
    console.error("Yandex AI Studio unexpected response:", data);
    throw new Error("Yandex AI Studio не вернул изображение.");
  }

  return `data:image/png;base64,${base64}`;
}

function dataUrlToPngBuffer(imageData) {
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/png;base64,")) {
    throw new Error("Ожидается PNG в формате data URL.");
  }

  const base64 = imageData.slice("data:image/png;base64,".length);
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64)) {
    throw new Error("Некорректные данные PNG.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0 || buffer.length > 12 * 1024 * 1024) {
    throw new Error("PNG пустой или слишком большой.");
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error("Переданный файл не похож на PNG.");
  }

  return buffer;
}

async function maxFetch(url, options = {}) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  return { response, data };
}

function findImageToken(uploadInfo, uploadResult) {
  if (typeof uploadResult?.token === "string") return uploadResult.token;

  const photos = uploadResult?.photos;
  if (photos && typeof photos === "object") {
    for (const value of Object.values(photos)) {
      if (value && typeof value.token === "string") return value.token;
    }
  }

  if (typeof uploadInfo?.token === "string") return uploadInfo.token;
  return "";
}

async function uploadPngToMax(pngBuffer) {
  const createUpload = await maxFetch("https://platform-api2.max.ru/uploads?type=image", {
    method: "POST",
    headers: { Authorization: BOT_TOKEN, Accept: "application/json" }
  });

  if (!createUpload.response.ok || !createUpload.data?.url) {
    throw new Error(
      `MAX /uploads: ${createUpload.data?.message || createUpload.data?.error || createUpload.response.status}`
    );
  }

  const form = new FormData();
  form.append(
    "data",
    new Blob([pngBuffer], { type: "image/png" }),
    `pozdrav-${Date.now()}.png`
  );

  const uploaded = await maxFetch(createUpload.data.url, {
    method: "POST",
    headers: { Authorization: BOT_TOKEN },
    body: form
  });

  if (!uploaded.response.ok) {
    throw new Error(
      `MAX upload URL: ${uploaded.data?.message || uploaded.data?.error || uploaded.response.status}`
    );
  }

  const token = findImageToken(createUpload.data, uploaded.data);
  if (!token) {
    console.error("Ответ создания upload:", createUpload.data);
    console.error("Ответ upload URL:", uploaded.data);
    throw new Error("MAX не вернул token изображения.");
  }

  return token;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendImageToUser({ userId, token, caption }) {
  const delays = [0, 700, 1500, 3000];
  let lastError = "Неизвестная ошибка MAX.";

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);

    const result = await maxFetch(
      `https://platform-api2.max.ru/messages?user_id=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        headers: {
          Authorization: BOT_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          text: caption || "🎁 Ваша AI-открытка из «Поздравь»",
          attachments: [{ type: "image", payload: { token } }],
          notify: false
        })
      }
    );

    if (result.response.ok) {
      const mid = result.data?.message?.body?.mid || result.data?.body?.mid;
      if (!mid) {
        console.error("Ответ /messages без mid:", result.data);
        throw new Error("MAX отправил сообщение, но не вернул mid.");
      }
      return String(mid);
    }

    const code = result.data?.code || "";
    const message = result.data?.message || result.data?.error || `HTTP ${result.response.status}`;
    lastError = `${code ? `${code}: ` : ""}${message}`;
    if (code !== "attachment.not.ready") break;
  }

  throw new Error(`MAX /messages: ${lastError}`);
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "pozdrav-max-api",
    imageModel: "aliceai-image-art-3.0"
  });
});

app.post("/api/generate-ai-card", async (req, res) => {
  try {
    const { initData, occasion, style, template, details } = req.body || {};
    const identity = getGenerationIdentity(req, initData);

    if (!rateAllowed(generationRateMap, identity.key, 3, 10 * 60 * 1000)) {
      res.status(429).json({
        error: "Лимит AI-генераций: не более 3 открыток за 10 минут. Попробуйте немного позже."
      });
      return;
    }

    const prompt = buildImagePrompt({ occasion, style, template, details });
    const imageData = await generateYandexImage(prompt);

    res.set("Cache-Control", "no-store");
    res.json({ ok: true, imageData });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера.";

    const isAuthError = /initData|подпись|auth_date|пользовател|устарели|внутри MAX/i.test(message);
    res.status(isAuthError ? 401 : 500).json({ error: message });
  }
});

app.post("/api/send-card", async (req, res) => {
  try {
    const { initData, imageData, caption } = req.body || {};
    const auth = validateMaxInitData(initData);

    if (!rateAllowed(sendRateMap, auth.userId, 10, 10 * 60 * 1000)) {
      res.status(429).json({ error: "Слишком много отправок. Попробуйте через несколько минут." });
      return;
    }

    const pngBuffer = dataUrlToPngBuffer(imageData);
    const imageToken = await uploadPngToMax(pngBuffer);
    const mid = await sendImageToUser({
      userId: auth.userId,
      token: imageToken,
      caption: typeof caption === "string" ? caption.slice(0, 300) : "🎁 Ваша AI-открытка из «Поздравь»"
    });

    res.json({ ok: true, mid });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера.";
    const isAuthError = /initData|подпись|auth_date|пользовател|устарели/i.test(message);
    res.status(isAuthError ? 401 : 500).json({ error: message });
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(403).json({ error: "Запрос с этого сайта не разрешён." });
});

app.listen(PORT, () => {
  console.log(`Pozdrav MAX API запущен на порту ${PORT}`);
});
