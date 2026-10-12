ПОЗДРАВЬ — VERSION 3
=====================

Что нового в v3
---------------
1. Появилось 2 режима:
   - 📸 Готовая база фонов
   - ✨ Yandex AI
2. Пользователю сразу выдаётся 2 или 3 варианта.
3. Каждую открытку можно:
   - скачать отдельно
   - отправить отдельно в MAX
4. В проект добавлена локальная библиотека готовых фонов:
   backgrounds.json
   assets/backgrounds/*.jpg
5. Сохранилась красивая типографика из v2.

Структура
---------
index.html
style.css
app.js
backgrounds.json
assets/backgrounds/
README.txt
server/
  server.js
  package.json
  .env.example
  .gitignore

Что загрузить в GitHub
----------------------
Замените весь проект содержимым этого архива.

Что важно в app.js
------------------
Вставьте ваш backend Timeweb:
const API_BASE_URL = "https://YOUR-TIMEWEB-BACKEND";

Пример:
const API_BASE_URL = "https://pozdrav-max-api-xxxx.twc1.net";

Настройка Timeweb
-----------------
Папка проекта:
server

Build:
npm install

Start:
npm start

Health check:
/health

Переменные Timeweb
------------------
BOT_TOKEN=...
FRONTEND_ORIGIN=https://ВАШ-ЛОГИН.github.io
YANDEX_API_KEY=...
YANDEX_FOLDER_ID=...
INIT_DATA_MAX_AGE_SECONDS=86400
ALLOW_BROWSER_AI_GENERATION=true

Проверка backend
----------------
Откройте:
https://ВАШ-БЭКЕНД/health

Должно быть:
{
  "ok": true,
  "service": "pozdrav-max-api",
  "imageModel": "aliceai-image-art-3.0",
  "multiVariant": true
}

Как заменить базу фонов на свои фотографии
------------------------------------------
1. Загрузите свои JPG/PNG в папку:
   assets/backgrounds/
2. Откройте backgrounds.json
3. Добавьте пути к нужным файлам по категориям.

Пример:
"birthday": {
  "premium": [
    "assets/backgrounds/my-birthday-1.jpg",
    "assets/backgrounds/my-birthday-2.jpg"
  ]
}

Если хотите использовать сторонний сайт
--------------------------------------
Проще всего оставить v3 как есть, а потом заменить local library
на API Pixabay / Pexels через backend.

Redeploy
--------
После замены файлов в GitHub сделайте Redeploy в Timeweb.
