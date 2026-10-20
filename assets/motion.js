
(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Animated headline letters.
  if (!reduce) {
    document.querySelectorAll(".intro h1, .page-hero h1").forEach(title => {
      const original = title.textContent.trim();
      title.setAttribute("aria-label", original);

      let index = 0;
      Array.from(title.childNodes).forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;

        const fragment = document.createDocumentFragment();

        Array.from(node.textContent).forEach(character => {
          const span = document.createElement("span");
          span.className = "motion-letter";
          span.textContent = character;
          span.setAttribute("aria-hidden", "true");
          span.style.setProperty("--letter-index", index);
          index++;
          fragment.appendChild(span);
        });

        node.replaceWith(fragment);
      });
    });
  }

  // Rotating professional identities on the homepage.
  const intro = document.querySelector(".intro");
  const kicker = intro?.querySelector(".kicker");

  if (intro && kicker) {
    const phrases = [
      "Développeur web",
      "Créateur de Deadly.io",
      "Fondateur de DCAS Studio",
      "Création et design numérique"
    ];

    const container = document.createElement("div");
    container.className = "motion-rotator";

    const text = document.createElement("span");
    text.className = "motion-rotator-text";
    text.textContent = phrases[0];
    text.setAttribute("aria-live", "off");

    container.appendChild(text);
    kicker.insertAdjacentElement("afterend", container);

    if (!reduce) {
      let position = 0;

      setInterval(() => {
        if (document.hidden) return;

        text.classList.add("is-leaving");

        setTimeout(() => {
          position = (position + 1) % phrases.length;
          text.textContent = phrases[position];
          text.classList.remove("is-leaving");
        }, 360);
      }, 3600);
    }
  }

  // Sliding text on navigation and action buttons.
  if (!reduce) {
    document.querySelectorAll(".navlinks a, .actions .action").forEach(link => {
      if (link.querySelector("img, svg, .motion-copy")) return;

      const label = link.textContent.trim();
      if (!label) return;

      const copy = document.createElement("span");
      copy.className = "motion-copy";
      copy.setAttribute("aria-hidden", "true");

      const front = document.createElement("span");
      front.className = "motion-copy-front";
      front.textContent = label;

      const back = document.createElement("span");
      back.className = "motion-copy-back";
      back.textContent = label;

      copy.append(front, back);
      link.textContent = "";
      link.appendChild(copy);
      link.classList.add("motion-link");
      link.setAttribute("aria-label", label);
    });
  }

  // Scroll reveal.
  if (!reduce && "IntersectionObserver" in window) {
    const elements = document.querySelectorAll(
      "main > .section, main > .actions, main > .ock-community, " +
      ".page-hero, .cards .panel, .v2-card, .v2-feature"
    );

    elements.forEach((element, i) => {
      element.setAttribute("data-motion-reveal", "");
      element.style.setProperty("--motion-delay", (i % 3) * 80 + "ms");
    });

    document.body.classList.add("motion-ready");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .06, rootMargin: "0px 0px -20px 0px" });

    elements.forEach(element => observer.observe(element));
  }

  // Soft cursor lighting and restrained card tilt.
  if (!reduce && finePointer) {
    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    document.addEventListener("pointermove", event => {
      lastX = event.clientX;
      lastY = event.clientY;

      if (frame) return;
      frame = requestAnimationFrame(() => {
        document.body.style.setProperty("--mx", lastX + "px");
        document.body.style.setProperty("--my", lastY + "px");
        frame = 0;
      });
    }, { passive: true });

    document.querySelectorAll(".panel, .ock-stat, .v2-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;

        card.style.setProperty("--tilt-x", (-y * 4).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (x * 4).toFixed(2) + "deg");
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  console.info("OCKSYNE 4.0 — Motion system loaded");
})();
