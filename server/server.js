import express from "express";
import cors from "cors";
import crypto from "node:crypto";
const app = express();
const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";
const YANDEX_API_KEY = process.env.YANDEX_API_KEY || "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID || "";
const ALLOW_BROWSER_AI_GENERATION =
  String(process.env.ALLOW_BROWSER_AI_GENERATION || "false").toLowerCase() === "true";
const INIT_DATA_MAX_AGE_SECONDS = Number(
  process.env.INIT_DATA_MAX_AGE_SECONDS || 86400
);
if (!FRONTEND_ORIGIN) {
  console.error("ОШИБКА: не задан FRONTEND_ORIGIN");
  process.exit(1);
}
if (!YANDEX_API_KEY) {
  console.error("ОШИБКА: не задан YANDEX_API_KEY");
  process.exit(1);
}
if (!YANDEX_FOLDER_ID) {
  console.error("ОШИБКА: не задан YANDEX_FOLDER_ID");
  process.exit(1);
}
if (!BOT_TOKEN) {
  console.error("ОШИБКА: не задан BOT_TOKEN");
  process.exit(1);
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
app.use(
  express.json({
    limit: "12mb"
  })
);
const rateMap = new Map();
function rateAllowed(key, maxRequests, windowMs) {
  const now = Date.now();
  const current = rateMap.get(key);
  if (!current || now - current.startedAt > windowMs) {
    rateMap.set(key, {
      startedAt: now,
      count: 1
    });
    return true;
  }
  if (current.count >= maxRequests) {
    return false;
  }
  current.count += 1;
  return true;
}
function safeEqualHex(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    a.length !== b.length
  ) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a, "hex"),
      Buffer.from(b, "hex")
    );
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
    if (seen.has(key)) {
      throw new Error(`Параметр ${key} повторяется.`);
    }
    seen.add(key);
    if (key === "hash") {
      receivedHash = value;
    } else {
      pairs.push([key, value]);
    }
  }
  if (!receivedHash) {
    throw new Error("В initData отсутствует hash.");
  }
  pairs.sort(([a], [b]) => a.localeCompare(b));
  const launchParams = pairs
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
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
  if (!userRaw) {
    throw new Error("MAX не передал данные пользователя.");
  }
  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    throw new Error("Не удалось разобрать пользователя MAX.");
  }
  if (user?.id == null) {
    throw new Error("В данных MAX отсутствует user.id.");
  }
  return {
    userId: String(user.id),
    user,
    authDate
  };
}
function validateOrUseBrowserMode(initData) {
  if (initData) {
    return validateMaxInitData(initData);
  }
  if (!ALLOW_BROWSER_AI_GENERATION) {
    throw new Error(
      "Генерация из обычного браузера запрещена. Откройте приложение через MAX или временно включите ALLOW_BROWSER_AI_GENERATION=true."
    );
  }
  return {
    userId: "browser-preview",
    user: {
      id: "browser-preview"
    },
    authDate: Math.floor(Date.now() / 1000)
  };
}
function dataUrlToPngBuffer(imageData) {
  if (
    typeof imageData !== "string" ||
    !imageData.startsWith("data:image/png;base64,")
  ) {
    throw new Error("Ожидается PNG в формате data URL.");
  }
  const base64 = imageData.slice("data:image/png;base64,".length);
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) {
    throw new Error("PNG пустой или слишком большой.");
  }
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a
  ]);
  if (
    buffer.length < 8 ||
    !buffer.subarray(0, 8).equals(pngSignature)
  ) {
    throw new Error("Переданный файл не похож на PNG.");
  }
  return buffer;
}
function getOccasionMeta(occasion) {
  const map = {
    birthday: {
      ru: "день рождения",
      theme: "subtle festive details, soft bokeh, delicate floral elements, refined birthday atmosphere"
    },
    mother: {
      ru: "открытка для мамы",
      theme: "elegant flowers, gentle feminine atmosphere, warm care, peonies or garden flowers"
    },
    love: {
      ru: "романтическая открытка",
      theme: "subtle romantic atmosphere, elegant flowers or warm lights, emotional mood"
    },
    morning: {
      ru: "утреннее поздравление",
      theme: "soft sunlight through the window, morning glow, coffee or flowers, airy calm mood"
    },
    night: {
      ru: "пожелание спокойной ночи",
      theme: "deep blue and violet palette, moonlight, dreamy calm atmosphere, soft glow"
    }
  };
  return map[occasion] || map.birthday;
}
function getStyleMeta(visualStyle) {
  const map = {
    premium: {
      style: "luxury editorial, premium lifestyle magazine aesthetic, cinematic lighting, refined composition, rich depth, expensive look",
      palette: "elegant color palette, warm highlights, sophisticated contrast"
    },
    soft: {
      style: "soft pastel editorial, airy elegant mood, delicate composition, romantic refined aesthetic",
      palette: "pastel palette, soft creamy tones, subtle blush and floral colors"
    },
    modern: {
      style: "minimal modern editorial, clean premium composition, fashionable contemporary design, polished visual balance",
      palette: "clean refined palette, stylish contrast, elegant dark or neutral accents"
    }
  };
  return map[visualStyle] || map.premium;
}
function buildPrompt({
  occasion,
  visualStyle,
  recipientName,
  details
}) {
  const occasionMeta = getOccasionMeta(occasion);
  const styleMeta = getStyleMeta(visualStyle);
  const personHint = details
    ? `Inspiration from the recipient: ${details}.`
    : "";
  const nameHint = recipientName
    ? `The card is intended for a person named ${recipientName}, but do not render any text or letters.`
    : "";
  return [
    "Premium vertical greeting card background.",
    `Occasion: ${occasionMeta.ru}.`,
    styleMeta.style + ".",
    styleMeta.palette + ".",
    occasionMeta.theme + ".",
    personHint,
    nameHint,
    "Beautiful elegant composition with a clear focal atmosphere.",
    "Leave clean negative space for typography in the lower third of the image.",
    "No text, no letters, no words, no caption, no logo, no watermark.",
    "High detail, tasteful, expensive, aesthetically pleasing, visually balanced."
  ]
    .filter(Boolean)
    .join(" ");
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
  return {
    response,
    data
  };
}
async function generateImageWithYandex({
  occasion,
  visualStyle,
  recipientName,
  details
}) {
  const prompt = buildPrompt({
    occasion,
    visualStyle,
    recipientName,
    details
  });
  const response = await fetch(
    "https://ai.api.cloud.yandex.net/v1/images/generations",
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${YANDEX_API_KEY}`,
        "Content-Type": "application/json",
        "x-folder-id": YANDEX_FOLDER_ID
      },
      body: JSON.stringify({
        model: `art://${YANDEX_FOLDER_ID}/aliceai-image-art-3.0`,
        prompt,
        size: "1024x1536"
      })
    }
  );
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
    throw new Error(
      `Yandex AI Studio: ${
        data?.message || data?.error || response.status
      }`
    );
  }
  const b64 =
    data?.data?.[0]?.b64_json ||
    data?.result?.image ||
    data?.image;
  if (!b64 || typeof b64 !== "string") {
    console.error("Ответ Yandex:", data);
    throw new Error("Yandex не вернул изображение.");
  }
  return {
    imageData: `data:image/png;base64,${b64}`,
    promptPreview: prompt
  };
}
function findImageToken(uploadInfo, uploadResult) {
  if (typeof uploadResult?.token === "string") {
    return uploadResult.token;
  }
  const photos = uploadResult?.photos;
  if (photos && typeof photos === "object") {
    for (const value of Object.values(photos)) {
      if (value && typeof value.token === "string") {
        return value.token;
      }
    }
  }
  if (typeof uploadInfo?.token === "string") {
    return uploadInfo.token;
  }
  return "";
}
async function uploadPngToMax(pngBuffer) {
  const createUpload = await maxFetch(
    "https://platform-api2.max.ru/uploads?type=image",
    {
      method: "POST",
      headers: {
        Authorization: BOT_TOKEN,
        Accept: "application/json"
      }
    }
  );
  if (!createUpload.response.ok || !createUpload.data?.url) {
    throw new Error(
      `MAX /uploads: ${
        createUpload.data?.message ||
        createUpload.data?.error ||
        createUpload.response.status
      }`
    );
  }
  const form = new FormData();
  form.append(
    "data",
    new Blob([pngBuffer], { type: "image/png" }),
    `pozdrav-${Date.now()}.png`
  );
  const uploaded = await maxFetch(
    createUpload.data.url,
    {
      method: "POST",
      headers: {
        Authorization: BOT_TOKEN
      },
      body: form
    }
  );
  if (!uploaded.response.ok) {
    throw new Error(
      `MAX upload URL: ${
        uploaded.data?.message ||
        uploaded.data?.error ||
        uploaded.response.status
      }`
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
async function sendImageToUser({
  userId,
  token,
  caption
}) {
  const delays = [0, 700, 1500, 3000];
  let lastError = "Неизвестная ошибка MAX.";
  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (attempt > 0) await sleep(delays[attempt]);
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
          text: caption || "🎁 Открытка из «Поздравь»",
          attachments: [
            {
              type: "image",
              payload: {
                token
              }
            }
          ],
          notify: false
        })
      }
    );
    if (result.response.ok) {
      const mid =
        result.data?.message?.body?.mid ||
        result.data?.body?.mid;
      if (!mid) {
        console.error("Ответ /messages без mid:", result.data);
        throw new Error("MAX отправил сообщение, но не вернул mid.");
      }
      return String(mid);
    }
    const code = result.data?.code || "";
    const message =
      result.data?.message ||
      result.data?.error ||
      `HTTP ${result.response.status}`;
    lastError = `${code ? `${code}: ` : ""}${message}`;
    if (code !== "attachment.not.ready") {
      break;
    }
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
    const {
      initData,
      occasion = "birthday",
      visualStyle = "premium",
      recipientName = "",
      details = ""
    } = req.body || {};
    const auth = validateOrUseBrowserMode(initData);
    const rateKey = `gen:${auth.userId}`;
    if (!rateAllowed(rateKey, 3, 10 * 60 * 1000)) {
      res.status(429).json({
        error: "Слишком много AI-генераций. Попробуйте через несколько минут."
      });
      return;
    }
    const generated = await generateImageWithYandex({
      occasion,
      visualStyle,
      recipientName: String(recipientName || "").slice(0, 40),
      details: String(details || "").slice(0, 180)
    });
    res.json({
      ok: true,
      imageData: generated.imageData,
      promptPreview: generated.promptPreview
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "Внутренняя ошибка сервера.";
    const authError =
      /initData|подпись|auth_date|устарели|пользовател/i.test(message);
    res.status(authError ? 401 : 500).json({
      error: message
    });
  }
});
app.post("/api/send-card", async (req, res) => {
  try {
    const { initData, imageData, caption } = req.body || {};
    const auth = validateMaxInitData(initData);
    const rateKey = `send:${auth.userId}`;
    if (!rateAllowed(rateKey, 10, 10 * 60 * 1000)) {
      res.status(429).json({
        error: "Слишком много отправок. Попробуйте через несколько минут."
      });
      return;
    }
    const pngBuffer = dataUrlToPngBuffer(imageData);
    const imageToken = await uploadPngToMax(pngBuffer);
    const mid = await sendImageToUser({
      userId: auth.userId,
      token: imageToken,
      caption:
        typeof caption === "string"
          ? caption.slice(0, 300)
          : "🎁 Открытка из «Поздравь»"
    });
    res.json({
      ok: true,
      mid
    });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : "Внутренняя ошибка сервера.";
    const authError =
      /initData|подпись|auth_date|устарели|пользовател/i.test(message);
    res.status(authError ? 401 : 500).json({
      error: message
    });
  }
});
app.use((error, req, res, next) => {
  console.error(error);
  res.status(403).json({
    error: "Запрос с этого сайта не разрешён."
  });
});
app.listen(PORT, () => {
  console.log(`Pozdrav MAX API v2 запущен на порту ${PORT}`);
});