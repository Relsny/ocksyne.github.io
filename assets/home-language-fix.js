
// OCKSYNE_HOME_LANGUAGE_FIX_V2
(() => {
  "use strict";

  const translations = {
    en: "Welcome to my website! Explore the different pages to discover my profile, my journey, my projects and my creations. Feel free to browse the site to learn more about me and my world!",
    pl: "Witaj na mojej stronie! Odkryj poszczególne podstrony, aby poznać mój profil, moją historię, projekty i twórczość. Zapraszam do zwiedzania strony, aby dowiedzieć się więcej o mnie i moim świecie!"
  };

  let language = "fr";

  try {
    language = localStorage.getItem("ocksyne-language") || "fr";
  } catch (_) {}

  const normalize = value =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim();

  function removeButtons() {
    document.querySelectorAll("a,button").forEach(element => {
      if (element.closest("nav, .navlinks, .ock-language")) return;

      const text = normalize(element.textContent);

      if (
        /^Voir Deadly\.io(?:\s*↗|\s*→)?$/i.test(text) ||
        /^Mon parcours(?:\s*↗|\s*→)?$/i.test(text)
      ) {
        element.remove();
      }
    });
  }

  function isWelcome(text) {
    text = normalize(text);
    return text.startsWith("Bienvenue sur mon site") &&
           text.includes("mon univers");
  }

  function translateWelcome() {
    if (!translations[language]) return;

    const translated = translations[language];

    // Premier cas : paragraphe ou titre avec texte direct.
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
      if (!node.parentElement ||
          node.parentElement.closest(
            "script,style,textarea,nav,.ock-language"
          )) continue;

      if (isWelcome(node.nodeValue)) {
        if (normalize(node.nodeValue) !== translated) {
          node.nodeValue = translated;
        }
      }
    }

    // Deuxième cas : texte réparti sur plusieurs éléments
    // par une animation ou une mise en forme.
    const elements = document.querySelectorAll(
      "main p, main h1, main h2, main h3, " +
      "main .hero p, main .hero div, " +
      "main .hero strong, .hero p, .hero div, " +
      "main .welcome, main .intro"
    );

    for (const element of elements) {
      if (!isWelcome(element.textContent)) continue;

      const nestedWelcome = [...element.children].some(
        child => isWelcome(child.textContent)
      );

      if (nestedWelcome) continue;

      if (normalize(element.textContent) !== translated) {
        element.textContent = translated;
      }

      break;
    }
  }

  let applying = false;

  function apply() {
    if (applying) return;
    applying = true;

    try {
      removeButtons();
      translateWelcome();
    } finally {
      applying = false;
    }
  }

  apply();

  // Prend en compte les textes et boutons créés après
  // le chargement par les scripts et animations.
  const observer = new MutationObserver(() => {
    if (!applying) apply();
  });

  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true
  });
})();
