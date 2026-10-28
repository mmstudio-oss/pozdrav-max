ПОЗДРАВЬ — V4.9 FONTS + READY CARDS
=====================================

НОВОЕ В 4.9
------------
- Больше разных рукописных шрифтов для вариантов открыток.
- Новый источник: «Готовая открытка с текстом».
- В готовом режиме имя и описание скрываются и не используются.
- Готовые открытки берутся из раздела ready в том же manifest.json.
- Готовая открытка показывается целиком, без нового текста поверх.
- Для готовых открыток используйте JPG/PNG 4:5, оптимально 1080×1350.
- После обновления backend нужен Redeploy в Timeweb.

СТРУКТУРА ГОТОВЫХ ОТКРЫТОК
----------------------------
ready/birthday/premium/
ready/birthday/soft/
ready/birthday/modern/
ready/mother/...
ready/love/...
ready/morning/...
ready/night/...

ПОЗДРАВЬ — VERSION 4.1 SMART TEXT
==================================

НОВОЕ В 4.1
------------
- Текст больше не привязан к нижней части открытки.
- Приложение анализирует 8 зон изображения и выбирает наиболее спокойную.
- Светлый или тёмный текст выбирается по яркости найденной области.
- Заголовок — крупный рукописный шрифт.
- Основной текст — другой шрифт и меньший размер.
- Длинное поздравление автоматически уменьшается, чтобы поместиться.
- Видимой прямоугольной плашки нет: используется только мягкая растушёвка вокруг текста.
- Premium: Marck Script + Cormorant Garamond.
- Soft: Bad Script + Cormorant Garamond.
- Modern: Caveat + Inter.

Эта версия использует российские сервисы:

1. Timeweb Cloud S3 — онлайн-база готовых фотографий.
2. Yandex AI Studio + Alice AI ART 3.0 — уникальные AI-фоны.
3. Timeweb App Platform — backend.

Freepik в эту версию не включен.

ВАЖНО: локальной папки с фотобазой в GitHub нет.
Фотографии лежат отдельно в Timeweb S3 и могут обновляться без изменения кода приложения.

КАК ЭТО РАБОТАЕТ
----------------
Пользователь выбирает:

☁️ Фото из облачной базы
или
✨ Yandex AI

Приложение сразу показывает 2 или 3 варианта.

Для облачной базы backend загружает manifest.json из Timeweb S3,
выбирает случайные фотографии нужной категории и отдает их приложению.
Canvas накладывает текст и делает готовую открытку.

СТРУКТУРА GITHUB
-----------------
index.html
style.css
app.js
manifest.example.json   <- только пример, его надо загрузить в S3 как manifest.json
README.txt
server/
  server.js
  package.json
  .env.example
  .gitignore

1. СОЗДАТЬ S3 В TIMEWEB
-----------------------
Timeweb Cloud -> Хранилище S3 -> Создать.

Выберите публичный бакет.
Например имя:
pozdrav-cards

2. СОЗДАТЬ ПАПКИ В БАКЕТЕ
-------------------------
Рекомендуемая структура:

birthday/premium/
birthday/soft/
birthday/modern/

mother/premium/
mother/soft/
mother/modern/

love/premium/
love/soft/
love/modern/

morning/premium/
morning/soft/
morning/modern/

night/premium/
night/soft/
night/modern/

В каждую категорию загрузите хотя бы 3 вертикальных JPG/PNG.
Лучше 10-30 фотографий на каждую категорию.

3. MANIFEST.JSON
----------------
В проекте есть:
manifest.example.json

Скопируйте его и назовите:
manifest.json

Если имена ваших файлов отличаются — исправьте их в JSON.

Затем загрузите manifest.json В КОРЕНЬ того же S3-бакета.

Например:
https://pozdrav-cards.s3.twcstorage.ru/manifest.json

В manifest можно использовать относительные пути:

{
  "birthday": {
    "premium": [
      "birthday/premium/01.jpg",
      "birthday/premium/02.jpg",
      "birthday/premium/03.jpg"
    ]
  }
}

Все картинки и manifest.json должны лежать в одном публичном S3-бакете.

4. TIMEWEB APP PLATFORM — ENV
-----------------------------
Добавьте:

PHOTO_LIBRARY_MANIFEST_URL=https://ВАШ-БАКЕТ.s3.twcstorage.ru/manifest.json

Также оставьте:

BOT_TOKEN=...
FRONTEND_ORIGIN=https://ВАШ-ЛОГИН.github.io
YANDEX_API_KEY=...
YANDEX_FOLDER_ID=...
INIT_DATA_MAX_AGE_SECONDS=86400
ALLOW_BROWSER_PREVIEW=true

После тестов внутри MAX:
ALLOW_BROWSER_PREVIEW=false

5. APP.JS
---------
В app.js вставьте адрес backend:

const API_BASE_URL = "https://YOUR-TIMEWEB-BACKEND";

Например:

const API_BASE_URL = "https://pozdrav-max-api-xxxx.twc1.net";

6. TIMEWEB APP PLATFORM
-----------------------
Project directory:
server

Build:
npm install

Start:
npm start

Health check:
/health

После загрузки новых файлов в GitHub сделайте Redeploy.

7. ПРОВЕРКА
-----------
Откройте:

https://ВАШ-BACKEND/health

Должно быть примерно:

{
  "ok": true,
  "service": "pozdrav-max-api",
  "version": "4.1-smart-text",
  "imageModel": "aliceai-image-art-3.0",
  "cloudPhotoLibraryConfigured": true,
  "multiVariant": true
}

Если:
"cloudPhotoLibraryConfigured": false

значит PHOTO_LIBRARY_MANIFEST_URL не задан в Timeweb.

8. ВАЖНО ПРО АВТОРСКИЕ ПРАВА
-----------------------------
Загружайте в свою S3-базу только фотографии, которые вы имеете право использовать:
ваши собственные, купленные по подходящей лицензии или разрешенные для такого использования.

Преимущество этой версии: внешний фотосток не может заблокировать приложение Cloudflare,
а база открыток полностью под вашим контролем.
