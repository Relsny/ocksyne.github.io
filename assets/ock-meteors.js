
(() => {
  "use strict";

  const sky = document.getElementById("sky");
  if (!sky || typeof Element.prototype.animate !== "function") return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const random = (min, max) =>
    min + Math.random() * (max - min);

  const timers = new Set();
  const particles = new Set();

  function schedule(callback, min, max) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, random(min, max));

    timers.add(timer);
  }

  function animateOnce(element, frames, duration) {
    particles.add(element);
    sky.appendChild(element);

    const animation = element.animate(frames, {
      duration,
      easing: "linear",
      iterations: 1,
      fill: "forwards"
    });

    const remove = () => {
      element.remove();
      particles.delete(element);
    };

    animation.onfinish = remove;
    animation.oncancel = remove;
  }

  function spawnStar() {
    if (!document.hidden && sky.isConnected) {
      const star = document.createElement("span");
      star.className = "ock-natural-star";
      star.setAttribute("aria-hidden", "true");

      const size = random(1, 3.2);

      star.style.left = random(3, 97) + "%";
      star.style.top = random(3, 82) + "%";
      star.style.setProperty("--star-size", size + "px");

      const brightness = random(.45, 1);

      animateOnce(star, [
        {opacity: 0, offset: 0},
        {opacity: brightness, offset: .3},
        {opacity: brightness, offset: .57},
        {opacity: 0, offset: 1}
      ], random(1100, 3300));
    }

    schedule(spawnStar, 300, 1500);
  }

  function spawnComet() {
    if (!document.hidden && sky.isConnected) {
      const box = sky.getBoundingClientRect();

      if (box.width > 0 && box.height > 0) {
        const comet = document.createElement("span");
        comet.className = "ock-natural-comet";
        comet.setAttribute("aria-hidden", "true");

        const direction = Math.random() < .5 ? 1 : -1;
        const length = random(65, 155);
        const distance = random(130, 350);
        const angle = random(18, 37) * Math.PI / 180;

        const dx = direction * Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const degrees = direction === 1
          ? angle * 180 / Math.PI
          : 180 - angle * 180 / Math.PI;

        comet.style.left = random(12, 88) + "%";
        comet.style.top = random(4, 56) + "%";
        comet.style.setProperty("--comet-length", length + "px");
        comet.style.setProperty(
          "--comet-width",
          random(1, 2.3) + "px"
        );

        const position = fraction =>
          "translate3d(" +
          (dx * fraction) + "px," +
          (dy * fraction) + "px,0) rotate(" +
          degrees + "deg)";

        animateOnce(comet, [
          {
            opacity: 0,
            transform: position(0),
            offset: 0
          },
          {
            opacity: 1,
            transform: position(.18),
            offset: .18
          },
          {
            opacity: .9,
            transform: position(.7),
            offset: .7
          },
          {
            opacity: 0,
            transform: position(1),
            offset: 1
          }
        ], random(650, 1250));
      }
    }

    schedule(spawnComet, 2500, 8500);
  }

  schedule(spawnStar, 200, 900);
  schedule(spawnComet, 1200, 3500);

  console.info("OCKSYNE — Natural Sky V2 active");
})();
