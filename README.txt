ПОЗДРАВЬ — YANDEX AI STUDIO v2
==================================

Что нового в v2
---------------
1. Новый premium-подход к промптам:
   - больше editorial / luxury / cinematic эстетики;
   - просьба оставить clean negative space в нижней трети;
   - AI не рисует текст.
2. Убрана плашка под текст.
3. Текст рисуется прямо поверх изображения.
4. Добавлены красивые шрифты:
   - Premium: Playfair Display + Inter
   - Soft: Cormorant Garamond + Inter
   - Modern: Prata + Inter
5. Добавлен мягкий тёмный градиент поверх фона для лучшей читаемости.
6. Имя по-прежнему необязательное.

Структура
---------
index.html
style.css
app.js
README.txt
server/
  server.js
  package.json
  .env.example
  .gitignore

Что загрузить на GitHub
-----------------------
Замени у себя:
- index.html
- style.css
- app.js
- README.txt
- server/server.js
- server/package.json
- server/.env.example
- server/.gitignore

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

ВАЖНО
-----
В app.js обязательно вставь свой backend Timeweb:

const API_BASE_URL = "https://YOUR-TIMEWEB-BACKEND";

Пример:
const API_BASE_URL = "https://pozdrav-max-api-xxxx.twc1.net";

Проверка
--------
1. Открой:
   https://ВАШ-БЭКЕНД/health

Должно быть:
{
  "ok": true,
  "service": "pozdrav-max-api",
  "imageModel": "aliceai-image-art-3.0"
}

2. Открой GitHub Pages.
3. Создай открытку.
4. Если всё работает — появится красивая AI-картинка и текст поверх неё.

Если снова нужен redeploy
-------------------------
Timeweb Cloud -> App Platform -> приложение -> Деплой
-> выбрать последний коммит -> Запустить деплой / Повторить деплой

Совет по качеству
-----------------
Если картинка получилась перегруженной:
- убери длинное описание;
- попробуй стиль Premium или Soft;
- нажми "Новый AI-вариант".
