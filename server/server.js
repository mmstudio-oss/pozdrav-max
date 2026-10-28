import express from "express";
import cors from "cors";
import crypto from "node:crypto";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";
const YANDEX_API_KEY = process.env.YANDEX_API_KEY || "";
const YANDEX_FOLDER_ID = process.env.YANDEX_FOLDER_ID || "";
const PHOTO_LIBRARY_MANIFEST_URL = process.env.PHOTO_LIBRARY_MANIFEST_URL || "";
const ALLOW_BROWSER_AI_GENERATION = String(process.env.ALLOW_BROWSER_PREVIEW || process.env.ALLOW_BROWSER_AI_GENERATION || "false").toLowerCase() === "true";
const INIT_DATA_MAX_AGE_SECONDS = Number(process.env.INIT_DATA_MAX_AGE_SECONDS || 86400);

if (!FRONTEND_ORIGIN) { console.error("ОШИБКА: не задан FRONTEND_ORIGIN"); process.exit(1); }
if (!YANDEX_API_KEY) { console.error("ОШИБКА: не задан YANDEX_API_KEY"); process.exit(1); }
if (!YANDEX_FOLDER_ID) { console.error("ОШИБКА: не задан YANDEX_FOLDER_ID"); process.exit(1); }
if (!BOT_TOKEN) { console.error("ОШИБКА: не задан BOT_TOKEN"); process.exit(1); }

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === FRONTEND_ORIGIN) return callback(null, true);
    callback(new Error("Origin not allowed"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "20mb" }));

const rateMap = new Map();
let photoManifestCache = null;
const PHOTO_MANIFEST_CACHE_MS = 10 * 60 * 1000;
function rateAllowed(key, maxRequests, windowMs) {
  const now = Date.now();
  const current = rateMap.get(key);
  if (!current || now - current.startedAt > windowMs) {
    rateMap.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= maxRequests) return false;
  current.count += 1;
  return true;
}

function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex")); }
  catch { return false; }
}

function validateMaxInitData(initData) {
  if (!initData || typeof initData !== "string") throw new Error("Отсутствует initData MAX.");
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
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(launchParams).digest("hex");
  if (!safeEqualHex(receivedHash, calculatedHash)) throw new Error("Подпись initData MAX не совпала.");
  const authDateRaw = params.get("auth_date");
  if (!authDateRaw || !/^\d+$/.test(authDateRaw)) throw new Error("Некорректный auth_date.");
  const authDate = Number(authDateRaw);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate > nowSeconds + 60 || nowSeconds - authDate > INIT_DATA_MAX_AGE_SECONDS) throw new Error("Данные запуска MAX устарели.");
  const userRaw = params.get("user");
  if (!userRaw) throw new Error("MAX не передал данные пользователя.");
  let user; try { user = JSON.parse(userRaw); } catch { throw new Error("Не удалось разобрать пользователя MAX."); }
  if (user?.id == null) throw new Error("В данных MAX отсутствует user.id.");
  return { userId: String(user.id), user, authDate };
}

function validateOrUseBrowserMode(initData) {
  if (initData) return validateMaxInitData(initData);
  if (!ALLOW_BROWSER_AI_GENERATION) {
    throw new Error("Генерация из обычного браузера запрещена. Откройте приложение через MAX или временно включите ALLOW_BROWSER_AI_GENERATION=true.");
  }
  return { userId: "browser-preview", user: { id: "browser-preview" }, authDate: Math.floor(Date.now() / 1000) };
}

function dataUrlToPngBuffer(imageData) {
  if (typeof imageData !== "string" || !imageData.startsWith("data:image/png;base64,")) throw new Error("Ожидается PNG в формате data URL.");
  const base64 = imageData.slice("data:image/png;base64,".length);
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0 || buffer.length > 8 * 1024 * 1024) throw new Error("PNG пустой или слишком большой.");
  const pngSignature = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(pngSignature)) throw new Error("Переданный файл не похож на PNG.");
  return buffer;
}

function getOccasionMeta(occasion) {
  const map = {
    birthday: { ru: "день рождения", theme: "subtle festive details, soft bokeh, delicate floral elements, refined birthday atmosphere" },
    mother: { ru: "открытка для мамы", theme: "elegant flowers, gentle feminine atmosphere, warm care, peonies or garden flowers" },
    love: { ru: "романтическая открытка", theme: "subtle romantic atmosphere, elegant flowers or warm lights, emotional mood" },
    morning: { ru: "утреннее поздравление", theme: "soft sunlight through the window, morning glow, coffee or flowers, airy calm mood" },
    night: { ru: "пожелание спокойной ночи", theme: "deep blue and violet palette, moonlight, dreamy calm atmosphere, soft glow" }
  };
  return map[occasion] || map.birthday;
}

function getStyleMeta(visualStyle) {
  const map = {
    premium: { style: "luxury editorial, premium lifestyle magazine aesthetic, cinematic lighting, refined composition, rich depth, expensive look", palette: "elegant color palette, warm highlights, sophisticated contrast" },
    soft: { style: "soft pastel editorial, airy elegant mood, delicate composition, romantic refined aesthetic", palette: "pastel palette, soft creamy tones, subtle blush and floral colors" },
    modern: { style: "minimal modern editorial, clean premium composition, fashionable contemporary design, polished visual balance", palette: "clean refined palette, stylish contrast, elegant dark or neutral accents" }
  };
  return map[visualStyle] || map.premium;
}

const promptVariations = [
  "Variation: more airy composition with visible negative space.",
  "Variation: slightly more floral decorative accents and soft bokeh.",
  "Variation: cleaner minimal composition with elegant focal depth."
];

function buildPrompt({ occasion, visualStyle, recipientName, details, variantIndex }) {
  const occasionMeta = getOccasionMeta(occasion);
  const styleMeta = getStyleMeta(visualStyle);
  const personHint = details ? `Inspiration from the recipient: ${details}.` : "";
  const nameHint = recipientName ? `The card is intended for a person named ${recipientName}, but do not render any text or letters.` : "";
  const variation = promptVariations[variantIndex % promptVariations.length] || "";
  return [
    "Premium vertical greeting card background.",
    `Occasion: ${occasionMeta.ru}.`,
    styleMeta.style + ".",
    styleMeta.palette + ".",
    occasionMeta.theme + ".",
    personHint,
    nameHint,
    variation,
    "Beautiful elegant composition with a clear focal atmosphere.",
    "Leave clean negative space for typography in the lower third of the image.",
    "No text, no letters, no words, no caption, no logo, no watermark.",
    "High detail, tasteful, expensive, aesthetically pleasing, visually balanced."
  ].filter(Boolean).join(" ");
}

async function maxFetch(url, options = {}) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let data = {};
  if (raw) {
    try { data = JSON.parse(raw); }
    catch { data = { raw }; }
  }
  return { response, data };
}

async function generateOneImageWithYandex({ occasion, visualStyle, recipientName, details, variantIndex }) {
  const prompt = buildPrompt({ occasion, visualStyle, recipientName, details, variantIndex });
  const response = await fetch("https://ai.api.cloud.yandex.net/v1/images/generations", {
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
  });
  const raw = await response.text();
  let data = {};
  if (raw) {
    try { data = JSON.parse(raw); }
    catch { data = { raw }; }
  }
  if (!response.ok) {
    throw new Error(`Yandex AI Studio: ${data?.message || data?.error || response.status}`);
  }
  const b64 = data?.data?.[0]?.b64_json || data?.result?.image || data?.image;
  if (!b64 || typeof b64 !== "string") throw new Error("Yandex не вернул изображение.");
  return { imageData: `data:image/png;base64,${b64}`, promptPreview: prompt };
}


function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function validateManifestUrl() {
  if (!PHOTO_LIBRARY_MANIFEST_URL) {
    throw new Error("Облачная база фото не настроена: добавьте PHOTO_LIBRARY_MANIFEST_URL в Timeweb.");
  }

  let url;
  try {
    url = new URL(PHOTO_LIBRARY_MANIFEST_URL);
  } catch {
    throw new Error("PHOTO_LIBRARY_MANIFEST_URL содержит некорректный URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("PHOTO_LIBRARY_MANIFEST_URL должен начинаться с https://");
  }

  return url;
}

async function loadPhotoManifest() {
  const manifestUrl = validateManifestUrl();

  if (photoManifestCache && photoManifestCache.expiresAt > Date.now()) {
    return photoManifestCache;
  }

  const response = await fetch(manifestUrl, {
    headers: { Accept: "application/json" }
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Не удалось загрузить manifest.json из S3: HTTP ${response.status}`);
  }

  if (raw.length > 1024 * 1024) {
    throw new Error("manifest.json слишком большой.");
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch {
    throw new Error("manifest.json содержит некорректный JSON.");
  }

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("manifest.json имеет неправильную структуру.");
  }

  photoManifestCache = {
    manifest,
    manifestUrl,
    origin: manifestUrl.origin,
    expiresAt: Date.now() + PHOTO_MANIFEST_CACHE_MS
  };

  return photoManifestCache;
}

function getManifestEntries(manifest, occasion, visualStyle) {
  const exact = manifest?.[occasion]?.[visualStyle];
  if (Array.isArray(exact) && exact.length) return exact;

  const occasionBlock = manifest?.[occasion];
  if (occasionBlock && typeof occasionBlock === "object") {
    const combined = Object.values(occasionBlock)
      .filter(Array.isArray)
      .flat();
    if (combined.length) return combined;
  }

  const fallback = manifest?.default;
  if (Array.isArray(fallback) && fallback.length) return fallback;

  return [];
}

function resolvePhotoUrl(entry, manifestUrl, allowedOrigin) {
  const raw = typeof entry === "string" ? entry : entry?.url || entry?.file;

  if (!raw || typeof raw !== "string") {
    throw new Error("В manifest.json найдено некорректное описание фотографии.");
  }

  let url;
  try {
    url = new URL(raw, manifestUrl);
  } catch {
    throw new Error("В manifest.json найден некорректный URL фотографии.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Фотографии в облачной базе должны быть доступны по HTTPS.");
  }

  if (url.origin !== allowedOrigin) {
    throw new Error("Фотографии должны находиться в том же S3-домене, что и manifest.json.");
  }

  return url;
}

async function downloadCloudPhoto(url) {
  const response = await fetch(url, {
    headers: { Accept: "image/*" }
  });

  if (!response.ok) {
    throw new Error(`Не удалось скачать фото из S3: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Объект в S3 не является изображением.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0 || buffer.length > 12 * 1024 * 1024) {
    throw new Error("Фото из S3 пустое или слишком большое.");
  }

  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function getCloudPhotoVariants({ occasion, visualStyle, variantCount }) {
  const loaded = await loadPhotoManifest();
  const entries = getManifestEntries(loaded.manifest, occasion, visualStyle);

  if (entries.length < variantCount) {
    throw new Error(`В облачной базе недостаточно фото для ${occasion}/${visualStyle}. Нужно минимум ${variantCount}.`);
  }

  const candidates = shuffle(entries);
  const images = [];

  for (const entry of candidates) {
    if (images.length >= variantCount) break;

    try {
      const url = resolvePhotoUrl(entry, loaded.manifestUrl, loaded.origin);
      const imageData = await downloadCloudPhoto(url);
      images.push({ imageData });
    } catch (error) {
      console.warn("Пропускаем фото из облачной базы:", error.message);
    }
  }

  if (images.length < variantCount) {
    throw new Error("Не удалось загрузить достаточно фотографий из облачной базы.");
  }

  return images;
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
    throw new Error(`MAX /uploads: ${createUpload.data?.message || createUpload.data?.error || createUpload.response.status}`);
  }
  const form = new FormData();
  form.append("data", new Blob([pngBuffer], { type: "image/png" }), `pozdrav-${Date.now()}.png`);
  const uploaded = await maxFetch(createUpload.data.url, {
    method: "POST",
    headers: { Authorization: BOT_TOKEN },
    body: form
  });
  if (!uploaded.response.ok) {
    throw new Error(`MAX upload URL: ${uploaded.data?.message || uploaded.data?.error || uploaded.response.status}`);
  }
  const token = findImageToken(createUpload.data, uploaded.data);
  if (!token) throw new Error("MAX не вернул token изображения.");
  return token;
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function sendImageToUser({ userId, token, caption }) {
  const delays = [0, 700, 1500, 3000];
  let lastError = "Неизвестная ошибка MAX.";
  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (attempt > 0) await sleep(delays[attempt]);
    const result = await maxFetch(`https://platform-api2.max.ru/messages?user_id=${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: {
        Authorization: BOT_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        text: caption || "🎁 Открытка из «Поздравь»",
        attachments: [{ type: "image", payload: { token } }],
        notify: false
      })
    });
    if (result.response.ok) {
      const mid = result.data?.message?.body?.mid || result.data?.body?.mid;
      if (!mid) throw new Error("MAX отправил сообщение, но не вернул mid.");
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
    version: "4.6-bottom-brand",
    imageModel: "aliceai-image-art-3.0",
    cloudPhotoLibraryConfigured: Boolean(PHOTO_LIBRARY_MANIFEST_URL),
    multiVariant: true
  });
});

app.post("/api/photo-variants", async (req, res) => {
  try {
    const { initData, occasion = "birthday", visualStyle = "premium", variantCount = 3 } = req.body || {};
    const auth = validateOrUseBrowserMode(initData);
    const count = Math.min(3, Math.max(2, Number(variantCount || 3)));
    const rateKey = `cloud-photos:${auth.userId}`;

    if (!rateAllowed(rateKey, 30, 10 * 60 * 1000)) {
      return res.status(429).json({ error: "Слишком много запросов к фотобазе. Попробуйте через несколько минут." });
    }

    const images = await getCloudPhotoVariants({
      occasion,
      visualStyle,
      variantCount: count
    });

    res.json({ ok: true, provider: "timeweb-s3", images });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера.";
    const authError = /initData|подпись|auth_date|устарели|пользовател/i.test(message);
    res.status(authError ? 401 : 500).json({ error: message });
  }
});

app.post("/api/generate-ai-cards", async (req, res) => {
  try {
    const { initData, occasion = "birthday", visualStyle = "premium", recipientName = "", details = "", variantCount = 2 } = req.body || {};
    const auth = validateOrUseBrowserMode(initData);
    const count = Math.min(3, Math.max(2, Number(variantCount || 2)));
    const rateKey = `gen:${auth.userId}`;
    if (!rateAllowed(rateKey, 3, 10 * 60 * 1000)) {
      return res.status(429).json({ error: "Слишком много AI-генераций. Попробуйте через несколько минут." });
    }
    const images = [];
    for (let i = 0; i < count; i += 1) {
      const generated = await generateOneImageWithYandex({
        occasion,
        visualStyle,
        recipientName: String(recipientName || "").slice(0, 40),
        details: String(details || "").slice(0, 180),
        variantIndex: i
      });
      images.push(generated);
    }
    res.json({ ok: true, images });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера.";
    const authError = /initData|подпись|auth_date|устарели|пользовател/i.test(message);
    res.status(authError ? 401 : 500).json({ error: message });
  }
});

app.post("/api/send-card", async (req, res) => {
  try {
    const { initData, imageData, caption } = req.body || {};
    const auth = validateMaxInitData(initData);
    const rateKey = `send:${auth.userId}`;
    if (!rateAllowed(rateKey, 10, 10 * 60 * 1000)) {
      return res.status(429).json({ error: "Слишком много отправок. Попробуйте через несколько минут." });
    }
    const pngBuffer = dataUrlToPngBuffer(imageData);
    const imageToken = await uploadPngToMax(pngBuffer);
    const mid = await sendImageToUser({
      userId: auth.userId,
      token: imageToken,
      caption: typeof caption === "string" ? caption.slice(0, 300) : "🎁 Открытка из «Поздравь»"
    });
    res.json({ ok: true, mid });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера.";
    const authError = /initData|подпись|auth_date|устарели|пользовател/i.test(message);
    res.status(authError ? 401 : 500).json({ error: message });
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(403).json({ error: "Запрос с этого сайта не разрешён." });
});

app.listen(PORT, () => {
  console.log(`Pozdrav MAX API v4.1 Smart Text запущен на порту ${PORT}`);
});
