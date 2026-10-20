
(() => {
  "use strict";
  const word = document.getElementById("ock-changing-word");
  if (!word) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const words = ["coder.", "imaginer.", "concevoir.", "créer."];
  let index = 0;

  window.setInterval(() => {
    if (document.hidden) return;
    word.classList.add("ock-word-out");

    window.setTimeout(() => {
      index = (index + 1) % words.length;
      word.textContent = words[index];
      word.classList.remove("ock-word-out");
    }, 380);
  }, 3400);
})();
