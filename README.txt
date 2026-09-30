ПОЗДРАВЬ — ЭТАП 4: YANDEX AI STUDIO + ALICE AI ART 3.0
=======================================================

Что теперь работает
-------------------
• Фон открытки генерируется через Yandex AI Studio / Alice AI ART 3.0.
• API-ключ Yandex хранится только на backend.
• Модель получает повод, стиль и необязательные детали о человеке.
• AI специально просим НЕ рисовать текст и буквы.
• Русское поздравление приложение накладывает на Canvas само.
• Кнопка «Другой вариант» делает НОВУЮ AI-генерацию.
• Готовую открытку можно скачать PNG или отправить в MAX.
• Для AI-генераций стоит лимит: 3 генерации на пользователя за 10 минут.

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

=======================================================
1. ЗАМЕНИТЕ ФАЙЛЫ В GITHUB
=======================================================

В репозитории pozdrav-max замените:
  index.html
  style.css
  app.js
  README.txt

Папку server тоже замените целиком файлами из этого архива.

ВАЖНО:
реальные BOT_TOKEN, YANDEX_API_KEY и YANDEX_FOLDER_ID в GitHub не добавлять.

=======================================================
2. СОЗДАЙТЕ API-КЛЮЧ YANDEX AI STUDIO
=======================================================

Откройте Yandex AI Studio.
Создайте API-ключ для AI Studio с доступом к генерации изображений.
Для Alice AI ART сервисному аккаунту нужен доступ к image generation.

Нам понадобятся два значения:
  YANDEX_API_KEY
  YANDEX_FOLDER_ID

Folder ID — это идентификатор каталога Yandex Cloud.
В интерфейсе AI Studio наведите курсор на название каталога вверху и скопируйте ID.

Документация Yandex:
https://aistudio.yandex.ru/ru/docs/ai-studio/operations/get-api-key
https://aistudio.yandex.ru/ru/docs/ai-studio/operations/generation/images-generation

=======================================================
3. ДОБАВЬТЕ ПЕРЕМЕННЫЕ В TIMEWEB
=======================================================

В Timeweb Cloud -> ваше приложение -> переменные окружения добавьте:

BOT_TOKEN = ваш токен бота MAX
FRONTEND_ORIGIN = https://ВАШ-ЛОГИН.github.io
YANDEX_API_KEY = ваш API-ключ Yandex AI Studio
YANDEX_FOLDER_ID = ID каталога Yandex Cloud
INIT_DATA_MAX_AGE_SECONDS = 86400
ALLOW_BROWSER_AI_GENERATION = false

Для GitHub Pages вида:
  https://ivan123.github.io/pozdrav-max/

правильный FRONTEND_ORIGIN:
  https://ivan123.github.io

=======================================================
4. НАСТРОЙКИ TIMEWEB APP PLATFORM
=======================================================

Тип: Backend / Node.js
Папка проекта: server
Build command: npm install
Start command: npm start
Health check: /health

Если Timeweb спрашивает порт вручную:
  3000

После Deploy откройте:
  https://ВАШ-TIMEWEB-ДОМЕН/health

Ожидаемый ответ примерно:
  {"ok":true,"service":"pozdrav-max-api","imageModel":"aliceai-image-art-3.0"}

=======================================================
5. ВСТАВЬТЕ АДРЕС BACKEND В app.js
=======================================================

В app.js в самом верху найдите:

const API_BASE_URL = "https://YOUR-TIMEWEB-BACKEND";

Замените на технический HTTPS-домен приложения Timeweb, например:

const API_BASE_URL = "https://pozdrav-max-api-1234.twc1.net";

НЕ добавляйте /health в конце.

Сохраните и сделайте Commit changes в GitHub.

=======================================================
6. КАК РАБОТАЕТ ГЕНЕРАЦИЯ
=======================================================

1) Пользователь выбирает повод, стиль и вводит детали.
2) Frontend отправляет только параметры и MAX initData на Timeweb backend.
3) Backend проверяет подпись MAX.
4) Backend формирует безопасный prompt длиной до 500 символов.
5) Backend вызывает:
   https://ai.api.cloud.yandex.net/v1/images/generations
6) Модель:
   art://<YANDEX_FOLDER_ID>/aliceai-image-art-3.0
7) Размер изображения:
   1024x1536
8) Yandex возвращает изображение в Base64.
9) Frontend помещает AI-картинку на Canvas 1080x1350 и накладывает точный русский текст.
10) Пользователь скачивает PNG или отправляет его в MAX.

=======================================================
7. ТЕСТ ВНУТРИ MAX
=======================================================

По умолчанию AI-генерация защищена MAX initData.
Поэтому основной тест:

MAX -> ваш бот -> открыть Mini App -> Создать AI-открытку

Если открыть GitHub Pages просто в обычном браузере, сервер ответит:
  «Откройте мини-приложение внутри MAX...»

Это сделано специально, чтобы посторонние не тратили ваш баланс Yandex.

Для КОРОТКОГО теста вне MAX можно временно поставить в Timeweb:
  ALLOW_BROWSER_AI_GENERATION=true

После теста ОБЯЗАТЕЛЬНО вернуть:
  ALLOW_BROWSER_AI_GENERATION=false

=======================================================
8. БЕЗОПАСНОСТЬ И РАСХОДЫ
=======================================================

• YANDEX_API_KEY не находится во frontend.
• BOT_TOKEN не находится во frontend.
• Backend проверяет подпись MAX.
• AI endpoint ограничен 3 генерациями за 10 минут на пользователя.
• Отправка в MAX ограничена 10 отправками за 10 минут.
• Не включайте ALLOW_BROWSER_AI_GENERATION=true на постоянной основе.

=======================================================
9. ЕСЛИ AI НЕ ГЕНЕРИРУЕТ
=======================================================

Проверьте по порядку:

1) /health открывается.
2) В Timeweb есть YANDEX_API_KEY.
3) В Timeweb есть YANDEX_FOLDER_ID.
4) У сервисного аккаунта есть право на генерацию изображений.
5) API-ключ создан с областью действия image generation.
6) В app.js указан правильный HTTPS backend.
7) FRONTEND_ORIGIN совпадает с origin GitHub Pages.
8) Для продакшена приложение открыто именно внутри MAX.

Если Yandex вернёт ошибку, backend покажет её в логах Timeweb и кратко передаст в приложение.
