const occasionInput = document.getElementById("occasion");
const nameInput = document.getElementById("name");
const styleInput = document.getElementById("style");
const detailsInput = document.getElementById("details");

const generateButton =
  document.getElementById("generateButton");

const resultSection =
  document.getElementById("resultSection");

const greetingTitle =
  document.getElementById("greetingTitle");

const greetingText =
  document.getElementById("greetingText");

const shareButton =
  document.getElementById("shareButton");

const anotherButton =
  document.getElementById("anotherButton");

const editButton =
  document.getElementById("editButton");

const errorMessage =
  document.getElementById("errorMessage");

const shareStatus =
  document.getElementById("shareStatus");


const textVariants = {
  birthday: {
    warm: [
      "Пусть каждый новый день приносит хорошие новости, тёплые встречи и поводы улыбаться.",
      "Желаю здоровья, счастья, душевного тепла и исполнения самых важных желаний."
    ],

    fun: [
      "Желаю, чтобы денег было больше, чем непрочитанных сообщений, а выходных — больше, чем понедельников!",
      "Пусть настроение всегда будет на максимуме, а проблемы быстро переходят в архив."
    ],

    beautiful: [
      "Пусть впереди будет много ярких событий, красивых моментов и людей, рядом с которыми легко быть собой.",
      "Пусть каждый день складывается из вдохновения, радости и приятных неожиданностей."
    ],

    short: [
      "Счастья, здоровья, удачи и прекрасного настроения!",
      "Пусть всё задуманное получается легко и вовремя!"
    ]
  },

  morning: {
    warm: [
      "Доброе утро! Пусть сегодняшний день начнётся спокойно, а продолжится приятными событиями.",
      "Пусть утро подарит хорошее настроение, а день — много поводов улыбнуться."
    ],

    fun: [
      "Доброе утро! Кофе уже готов морально поддерживать тебя — осталось только начать день.",
      "Пусть сегодня всё работает с первого раза, включая настроение!"
    ],

    beautiful: [
      "Пусть этот день начнётся со света, хороших мыслей и ощущения, что впереди обязательно случится что-то приятное.",
      "Желаю лёгкого утра, ясных мыслей и красивого дня."
    ],

    short: [
      "Доброе утро! Пусть день будет удачным ☀️",
      "Хорошего утра и отличного дня!"
    ]
  },

  mother: {
    warm: [
      "Спасибо за твою заботу, доброту и тепло. Пусть у тебя будет как можно больше счастливых и спокойных дней.",
      "Пусть рядом всегда будут любовь, уют и люди, которые ценят тебя так же сильно, как ты этого заслуживаешь."
    ],

    fun: [
      "Желаю отличного настроения, вкусного чая и хотя бы одного дня без вопросов «а где лежит…?» 😄",
      "Пусть сегодня все домашние дела каким-нибудь чудом сделаются сами!"
    ],

    beautiful: [
      "Пусть в твоей жизни будет столько же тепла и красоты, сколько ты даришь другим.",
      "Желаю тебе светлых дней, цветов без повода и много заботы в ответ."
    ],

    short: [
      "Мама, спасибо, что ты есть. Люблю тебя! 🌹",
      "Мама, счастья тебе, здоровья и много улыбок!"
    ]
  },

  love: {
    warm: [
      "Спасибо, что делаешь обычные дни особенными. Пусть впереди у нас будет ещё много счастливых моментов.",
      "Просто хочу напомнить, как много ты для меня значишь."
    ],

    fun: [
      "Ты мой любимый человек — даже когда забираешь одеяло ночью 😄",
      "Официально сообщаю: ты по-прежнему мой самый любимый человек."
    ],

    beautiful: [
      "Пусть у нас всегда будет место для нежности, смеха, приключений и тёплых разговоров.",
      "С тобой даже обычные моменты становятся теми, которые хочется запомнить."
    ],

    short: [
      "Люблю тебя ❤️",
      "Ты — мой человек."
    ]
  },

  night: {
    warm: [
      "Спокойной ночи. Пусть сегодняшний день останется позади, а завтра принесёт что-то хорошее.",
      "Желаю спокойных мыслей, уютного вечера и самых добрых снов."
    ],

    fun: [
      "Спокойной ночи! Все важные мысли официально переносятся на завтра 😄",
      "Пора заряжать и телефон, и себя. Добрых снов!"
    ],

    beautiful: [
      "Пусть вечер будет тихим, мысли — лёгкими, а сон — глубоким и спокойным.",
      "Пусть ночь подарит отдых, а утро начнётся с хорошего настроения."
    ],

    short: [
      "Спокойной ночи и добрых снов 🌙",
      "Отдыхай. Завтра будет новый хороший день."
    ]
  }
};


let lastVariant = -1;


function getDisplayTitle(name, occasion) {
  if (occasion === "birthday") {
    return `${name}, с днём рождения!`;
  }

  if (occasion === "morning") {
    return `${name}, доброе утро!`;
  }

  if (occasion === "mother") {
    return `${name}, это для тебя 🌹`;
  }

  if (occasion === "love") {
    return `${name}, для тебя ❤️`;
  }

  return `${name}, спокойной ночи 🌙`;
}


function chooseVariant(items) {
  if (items.length === 1) {
    return items[0];
  }

  let index;

  do {
    index = Math.floor(Math.random() * items.length);
  } while (index === lastVariant);

  lastVariant = index;

  return items[index];
}


function createGreeting() {
  const name = nameInput.value.trim();

  if (!name) {
    errorMessage.textContent = "Введите имя получателя.";
    nameInput.focus();
    return;
  }

  errorMessage.textContent = "";
  shareStatus.textContent = "";

  const occasion = occasionInput.value;
  const style = styleInput.value;
  const details = detailsInput.value.trim();

  const title =
    getDisplayTitle(name, occasion);

  const variants =
    textVariants[occasion][style];

  let text =
    chooseVariant(variants);

  if (details) {
    text += ` И пусть то, что тебе дорого — ${details.toLowerCase()} — приносит ещё больше радости.`;
  }

  greetingTitle.textContent = title;
  greetingText.textContent = text;

  resultSection.classList.remove("hidden");

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function getShareText() {
  return `${greetingTitle.textContent}\n\n${greetingText.textContent}`;
}


function shareToMax() {
  const text = getShareText();

  if (
    window.WebApp &&
    typeof window.WebApp.shareMaxContent === "function"
  ) {
    try {
      window.WebApp.shareMaxContent({
        text
      });

      shareStatus.textContent =
        "Открываем выбор чата в MAX…";
    } catch (error) {
      console.error(error);

      shareStatus.textContent =
        "Не удалось открыть отправку. Проверьте приложение внутри MAX.";
    }

    return;
  }

  shareStatus.textContent =
    "Сейчас приложение открыто вне MAX. После подключения к боту эта кнопка будет открывать выбор чата.";
}


generateButton.addEventListener(
  "click",
  createGreeting
);


anotherButton.addEventListener(
  "click",
  createGreeting
);


editButton.addEventListener(
  "click",
  () => {
    nameInput.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
);


shareButton.addEventListener(
  "click",
  shareToMax
);


nameInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      createGreeting();
    }
  }
);


// Если MAX Bridge доступен,
// сообщаем платформе, что интерфейс готов.
try {
  if (
    window.WebApp &&
    typeof window.WebApp.ready === "function"
  ) {
    window.WebApp.ready();
  }
} catch (error) {
  console.warn(
    "MAX Bridge пока недоступен:",
    error
  );
}
