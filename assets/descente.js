(() => {
  const body = document.body;
  const page = Number(body.dataset.page) || 0;

  if (!page || document.getElementById("amour-vhs-noise")) return;

  // Progression douce de la page 6 à la page 50
  const progress = Math.max(0, Math.min(1, (page - 6) / 44));
  document.documentElement.style.setProperty(
    "--vhs-progress",
    progress.toFixed(3)
  );

  if (progress <= 0) return;

  const canvas = document.createElement("canvas");
  canvas.id = "amour-vhs-noise";
  canvas.width = 320;
  canvas.height = 180;
  canvas.setAttribute("aria-hidden", "true");
  body.appendChild(canvas);

  const tracking = document.createElement("div");
  tracking.id = "amour-vhs-tracking";
  tracking.setAttribute("aria-hidden", "true");
  body.appendChild(tracking);

  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function drawNoise() {
    const image = context.createImageData(canvas.width, canvas.height);
    const pixels = image.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const value = Math.random() * 255;
      pixels[i] = value;
      pixels[i + 1] = value;
      pixels[i + 2] = value;
      pixels[i + 3] = Math.random() * 65;
    }

    context.putImageData(image, 0, 0);
  }

  drawNoise();

  // Bruit visuel léger, jamais de son ni de flash
  if (!reducedMotion) {
    window.setInterval(drawNoise, 500);
  }
})();
