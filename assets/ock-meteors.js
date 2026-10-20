
(() => {
  "use strict";

  const sky = document.getElementById("sky");
  if (!sky || !Element.prototype.animate) return;

  const reduced = matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduced) return;

  const random = (a, b) => a + Math.random() * (b - a);
  let timer = null;
  let active = null;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(launch, random(2000, 9500));
  }

  function launch() {
    if (document.hidden || !sky.isConnected) {
      schedule();
      return;
    }

    const bounds = sky.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      schedule();
      return;
    }

    const star = document.createElement("span");
    star.className = "ock-meteor";
    star.setAttribute("aria-hidden", "true");

    star.style.left = random(5, 65) + "%";
    star.style.top = random(5, 55) + "%";
    star.style.setProperty(
      "--meteor-size",
      random(70, 155) + "px"
    );

    sky.appendChild(star);
    active = star;

    const distance = random(145, 390);
    const angle = random(15, 35) * Math.PI / 180;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rotation = angle * 180 / Math.PI;

    const animation = star.animate([
      {
        opacity: 0,
        transform: `translate3d(0,0,0) rotate(${rotation}deg)`,
        offset: 0
      },
      {
        opacity: 1,
        transform: `translate3d(${dx*.15}px,${dy*.15}px,0) rotate(${rotation}deg)`,
        offset: .15
      },
      {
        opacity: .9,
        transform: `translate3d(${dx*.65}px,${dy*.65}px,0) rotate(${rotation}deg)`,
        offset: .65
      },
      {
        opacity: 0,
        transform: `translate3d(${dx}px,${dy}px,0) rotate(${rotation}deg)`,
        offset: 1
      }
    ], {
      duration: random(550, 1150),
      easing: "linear",
      fill: "forwards"
    });

    animation.finished.then(() => {
      star.remove();
      active = null;
      schedule();
    }).catch(() => {
      star.remove();
      active = null;
      schedule();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active) {
      active.remove();
      active = null;
    }
  });

  timer = setTimeout(launch, random(1000, 3500));

  console.info("OCKSYNE — Natural shooting stars enabled");
})();
