ПОЗДРАВЬ — VERSION 3 ONLINE
==========================

Локальной базы фотографий больше нет.

Режимы:
1. Фото Pixabay — фото ищутся онлайн через Pixabay API.
2. Yandex AI — Alice AI ART 3.0.

Пользователь получает 2 или 3 варианта.

ЧТО ДОБАВИТЬ В TIMEWEB
-----------------------
PIXABAY_API_KEY=ваш_ключ_Pixabay

Оставьте также:
BOT_TOKEN=...
FRONTEND_ORIGIN=https://ВАШ-ЛОГИН.github.io
YANDEX_API_KEY=...
YANDEX_FOLDER_ID=...
INIT_DATA_MAX_AGE_SECONDS=86400
ALLOW_BROWSER_PREVIEW=true

После тестов внутри MAX:
ALLOW_BROWSER_PREVIEW=false

КАК ПОЛУЧИТЬ PIXABAY_API_KEY
----------------------------
Откройте https://pixabay.com/api/docs/ и войдите в аккаунт Pixabay.
Скопируйте свой API key. Не публикуйте его в GitHub.

TIMEWEB
-------
Папка проекта: server
Build: npm install
Start: npm start
Health check: /health

После загрузки файлов в GitHub сделайте Redeploy.

ПРОВЕРКА
--------
https://ВАШ-BACKEND/health

Ожидается:
{
  "ok": true,
  "service": "pozdrav-max-api",
  "version": "3-online",
  "imageModel": "aliceai-image-art-3.0",
  "pixabayConfigured": true,
  "multiVariant": true
}

В этой версии нет backgrounds.json и assets/backgrounds/.
Frontend не получает PIXABAY_API_KEY. Поиск идёт через Timeweb, результаты поиска кешируются сервером на 24 часа, а выбранные изображения Timeweb скачивает перед передачей в приложение.
