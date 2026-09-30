ПОЗДРАВЬ — ЭТАП 3
==================

Что изменилось
--------------
• Имя получателя теперь НЕОБЯЗАТЕЛЬНО.
• Добавлен backend.
• Backend проверяет подписанный initData MAX.
• PNG загружается в MAX Bot API.
• Бот отправляет PNG пользователю и получает mid.
• Mini App вызывает shareMaxContent({ mid, chatType: "DIALOG" }).

Структура
---------
index.html
style.css
app.js
render.yaml
server/
  server.js
  package.json
  .env.example
  .gitignore

1. Обновите GitHub
------------------
В репозитории pozdrav-max замените старые:
  index.html
  style.css
  app.js

И добавьте:
  render.yaml
  папку server целиком

Нажмите Commit changes.

ВАЖНО: настоящий BOT_TOKEN в GitHub НЕ добавлять.

2. Разместите backend
---------------------
Один из простых вариантов — Render.

Создайте Web Service из вашего GitHub-репозитория pozdrav-max.
Если настраиваете вручную:
  Root Directory: server
  Build Command: npm install
  Start Command: npm start

Если используете Blueprint/render.yaml, часть параметров заполнится автоматически.

3. Добавьте секреты/переменные окружения на хостинге
----------------------------------------------------
BOT_TOKEN = токен вашего чат-бота MAX

FRONTEND_ORIGIN = origin GitHub Pages

Пример:
сайт:
  https://ivan123.github.io/pozdrav-max/

FRONTEND_ORIGIN:
  https://ivan123.github.io

INIT_DATA_MAX_AGE_SECONDS = 86400

4. Проверьте backend
--------------------
После Deploy вы получите адрес вроде:
  https://pozdrav-max-api.onrender.com

Откройте:
  https://pozdrav-max-api.onrender.com/health

Ожидаемый ответ:
  {"ok":true,"service":"pozdrav-max-api"}

5. Укажите адрес backend во frontend
------------------------------------
В app.js найдите:
  const API_BASE_URL = "https://YOUR-BACKEND.onrender.com";

Замените на свой адрес, например:
  const API_BASE_URL = "https://pozdrav-max-api.onrender.com";

Сделайте Commit changes. GitHub Pages обновится автоматически.

6. Тестируйте внутри MAX
------------------------
Обычный браузер не содержит подписанный window.WebApp.initData.
Поэтому прямую отправку тестируйте:

MAX -> ваш бот -> открыть Mini App -> создать открытку -> Отправить в MAX

Что происходит:
1) frontend отправляет PNG и initData на backend;
2) backend проверяет подпись;
3) backend загружает PNG в MAX;
4) бот отправляет PNG вам;
5) MAX возвращает mid;
6) приложение открывает выбор чата для пересылки.

Проверка без имени
------------------
Поле «Имя» оставьте пустым.
Для дня рождения заголовок будет:
  С днём рождения!

Безопасность
------------
• BOT_TOKEN хранится только в переменных окружения backend.
• Не вставляйте BOT_TOKEN в app.js, index.html или style.css.
• Backend валидирует HMAC-подпись initData MAX.
• Есть простой лимит: 10 отправок на пользователя за 10 минут.

TLS/сертификат
--------------
Актуальная документация MAX предупреждает, что для platform-api2.max.ru
может потребоваться сертификат Минцифры в доверенном хранилище.
Если хостинг выдаёт TLS/certificate error, добавьте официальный сертификат
в trust store / NODE_EXTRA_CA_CERTS или используйте хостинг, где он поддержан.
НЕ отключайте TLS-проверку через NODE_TLS_REJECT_UNAUTHORIZED=0.
