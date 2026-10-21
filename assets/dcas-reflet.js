
// OCKSYNE_DCAS_REFLETS_INTERACTIFS_V1
(() => {
  "use strict";

  const logo = document.querySelector(".dcas-reflet");
  if (!logo) return;

  const style = logo.style;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glare = [-0.38, -0.48];
  const tau = Math.PI * 2;

  let tx = -.55, ty = -.6;
  let x = tx, y = ty;
  let angle = 0;
  let lastMove = performance.now();

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  if (!reduce) {
    document.addEventListener("pointermove", event => {
      const rect = logo.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      tx = clamp(
        (event.clientX - rect.left - rect.width / 2) /
        (rect.width / 2), -1.8, 1.8
      );
      ty = clamp(
        (event.clientY - rect.top - rect.height / 2) /
        (rect.height / 2), -1.8, 1.8
      );

      lastMove = performance.now();
    }, { passive: true });
  }

  function frame(time) {
    if (!reduce && time - lastMove > 2500) {
      const a = time / 14000 * tau;
      tx = Math.cos(a) * .95;
      ty = Math.sin(a) * .75 - .1;
    }

    const smoothing = reduce ? 1 : .12;
    x += (tx - x) * smoothing;
    y += (ty - y) * smoothing;

    const distance = Math.hypot(x, y);
    if (distance > .03) angle = Math.atan2(x, -y);

    const divisor = Math.abs(Math.sin(angle)) +
                    Math.abs(Math.cos(angle));

    const position = 50 + 50 * Math.min(distance, 1.5) / divisor;
    const brightness = .45 + .55 * Math.min(1, distance);
    const glareDistance = Math.hypot(x - glare[0], y - glare[1]);

    style.setProperty("--lx", (50 + x * 50).toFixed(2) + "%");
    style.setProperty("--ly", (50 + y * 50).toFixed(2) + "%");
    style.setProperty("--ox", (50 - x * 45).toFixed(2) + "%");
    style.setProperty("--oy", (50 - y * 45).toFixed(2) + "%");
    style.setProperty("--ang", angle * 180 / Math.PI + "deg");
    style.setProperty("--pos", position.toFixed(2) + "%");
    style.setProperty("--k", brightness.toFixed(3));
    style.setProperty("--damp",
      (clamp(glareDistance / .9, 0, 1) * .88).toFixed(3));

    if (!reduce) {
      style.setProperty("--rx",
        (-clamp(y, -1, 1) * 7).toFixed(2) + "deg");
      style.setProperty("--ry",
        (clamp(x, -1, 1) * 9).toFixed(2) + "deg");
      requestAnimationFrame(frame);
    }
  }

  if (reduce) frame(performance.now());
  else requestAnimationFrame(frame);
})();
