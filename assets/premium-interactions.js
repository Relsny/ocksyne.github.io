
(() => {
  "use strict";

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const pointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const aliases = new Map([
    ["Explorer mes créations", "Voir mes projets"],
    ["Découvrir mon univers", "Mon parcours"],
    ["Consulter mon document", "Voir le document"],
    ["Serveur DCAS", "Ouvrir le serveur"],
    ["Administration", "Accéder à la gestion"],
    ["RESTER CONNECTÉ", "MES RÉSEAUX"]
  ]);

  // Preserve URLs, navigation and original accessible names.
  function decorateAction(link) {
    if (link.classList.contains("ock-signature-btn")) return;

    const original = link.textContent.replace(/↗/g, "").trim();
    if (!original) return;

    const alternate = aliases.get(original) || "Découvrir davantage";

    link.classList.add("ock-signature-btn");
    link.setAttribute("aria-label", original);

    if (reduced) return;

    const label = document.createElement("span");
    label.className = "ock-signature-label";
    label.setAttribute("aria-hidden", "true");

    const front = document.createElement("span");
    front.className = "ock-label-original";
    front.textContent = original;

    const back = document.createElement("span");
    back.className = "ock-label-alternate";
    back.textContent = alternate;

    label.append(front, back);

    const arrow = document.createElement("span");
    arrow.className = "ock-signature-arrow";
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");

    link.replaceChildren(label, arrow);
  }

  document.querySelectorAll(
    "a.action, a.ock-last-link"
  ).forEach(decorateAction);

  // Lighting follows the pointer locally, not over the entire page.
  if (pointer && !reduced) {
    const cards = document.querySelectorAll(
      ".ock-deadly-card, .ock-explore-card, .panel"
    );

    cards.forEach(card => {
      card.addEventListener("pointermove", event => {
        const box = card.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        card.style.setProperty("--px", x + "px");
        card.style.setProperty("--py", y + "px");
      }, {passive: true});

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--px", "50%");
        card.style.setProperty("--py", "50%");
      });
    });
  }

  console.info("OCKSYNE 4.1 — Signature interactions ready");
})();
