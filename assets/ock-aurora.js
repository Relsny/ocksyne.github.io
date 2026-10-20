
(() => {
  "use strict";

  const canvas = document.getElementById("ock-aurora-canvas");
  const sky = document.getElementById("sky");

  if (!canvas || !sky) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Adaptation des rideaux du fichier aurore-boucle.
  const LOOP = 12;
  const RES = 240;
  const FPS = 30;
  const TP = Math.PI * 2;

  const CUR = [
    [.60,.08,1.2,1,0,.46,1],
    [.52,.07,1.8,-1,.3,.38,.8],
    [.66,.06,2.3,2,.6,.30,.6]
  ];

  const STOPS = [
    [0,255,247,234],
    [.1,255,198,112],
    [.38,255,122,22],
    [.72,172,52,6],
    [1,62,16,0]
  ];

  const lut = new Float32Array(768);

  for (let i = 0; i < 256; i++) {
    const u = i / 255;
    let k = 1;

    while (k < STOPS.length - 1 && u > STOPS[k][0]) {
      k++;
    }

    const a = STOPS[k - 1];
    const b = STOPS[k];
    const t = (u - a[0]) / (b[0] - a[0]);

    for (let c = 0; c < 3; c++) {
      lut[i * 3 + c] =
        a[c + 1] + (b[c + 1] - a[c + 1]) * t;
    }
  }

  let W = 0;
  let H = 0;
  let img;
  let vignette;
  let YC = [];
  let SW = [];
  let RW = [];

  function resize() {
    const rect = sky.getBoundingClientRect();

    W = RES;
    H = Math.max(
      80,
      Math.round(RES * rect.height / Math.max(1, rect.width))
    );

    canvas.width = W;
    canvas.height = H;

    img = ctx.createImageData(W, H);
    vignette = new Float32Array(W * H);

    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const x = i / (W - 1);
        const y = j / (H - 1);

        vignette[j * W + i] = Math.max(
          0,
          1 - .3 * (
            Math.pow((x - .5) * 1.6, 2) +
            Math.pow((y - .45) * 1.1, 2)
          )
        );
      }
    }

    YC = [];
    SW = [];
    RW = [];

    for (let k = 0; k < 3; k++) {
      YC[k] = new Float32Array(W);
      SW[k] = new Float32Array(W);
      RW[k] = new Float32Array(H);
    }
  }

  function draw(phase) {
    if (!img) return;

    const pixels = img.data;
    let n = 0;

    for (let k = 0; k < 3; k++) {
      const C = CUR[k];

      for (let i = 0; i < W; i++) {
        const x = i / (W - 1);

        YC[k][i] =
          C[0] +
          C[1] * Math.sin(
            TP * (C[2] * x + C[3] * phase + C[4])
          ) +
          .025 * Math.sin(
            TP * (3.7 * x - 2 * phase + 3 * C[4])
          );

        const s = .5 + .5 * Math.sin(
          TP * (1.1 * x - C[3] * phase + C[4])
        );

        SW[k][i] = Math.min(
          1,
          Math.max(0, Math.pow(s, 1.4) * 1.1 + .12)
        );
      }

      for (let j = 0; j < H; j++) {
        const y = j / (H - 1);
        RW[k][j] = .05 * Math.sin(
          TP * (2 * y - C[3] * phase + C[4])
        );
      }
    }

    for (let j = 0; j < H; j++) {
      const y = j / (H - 1);
      const y2 = y * y;

      const r0 = 9 + y2 * 26;
      const g0 = 9 + y2 * 13;
      const b0 = 9 + y2 * 5;

      for (let i = 0; i < W; i++) {
        const x = i / (W - 1);

        let r = r0;
        let g = g0;
        let b = b0;

        for (let k = 0; k < 3; k++) {
          const C = CUR[k];
          const length = C[5];
          const depth = YC[k][i] - y;

          if (depth < -.14 || depth > length * 4.5) {
            continue;
          }

          const intensity = depth > 0
            ? Math.exp(-depth / length)
            : Math.exp(-Math.pow(depth / .035, 2));

          const warpedX =
            x + RW[k][j] + .12 * (y - .4);

          const speed = C[3];
          const offset = C[4];

          const wave = (
            Math.sin(TP * (
              17 * warpedX + phase * speed + offset
            )) +
            Math.sin(TP * (
              29 * warpedX - phase * 2 * speed + 1.3
            )) +
            Math.sin(TP * (
              43 * warpedX + phase * 3 + 2.1
            ))
          ) / 3;

          const alpha =
            C[6] *
            intensity *
            (.72 + .28 * wave) *
            SW[k][i] *
            .95;

          const colorIndex = (
            (
              depth <= 0
                ? 0
                : Math.min(1, depth / (1.3 * length))
            ) * 255 | 0
          ) * 3;

          r += lut[colorIndex] * alpha;
          g += lut[colorIndex + 1] * alpha;
          b += lut[colorIndex + 2] * alpha;
        }

        const v = vignette[j * W + i];

        pixels[n++] = Math.min(255, r) * v;
        pixels[n++] = Math.min(255, g) * v;
        pixels[n++] = Math.min(255, b) * v;
        pixels[n++] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }

  const reduced = matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let last = 0;

  function tick(timestamp) {
    if (!document.hidden && timestamp - last >= 1000 / FPS) {
      last = timestamp;
      draw(((timestamp / 1000) % LOOP) / LOOP);
    }

    requestAnimationFrame(tick);
  }

  resize();

  if (reduced) {
    draw(.3);
  } else {
    requestAnimationFrame(tick);
  }

  addEventListener("resize", () => {
    resize();
    if (reduced) draw(.3);
  }, {passive:true});

  console.info("OCKSYNE — Aurora Borealis 5.2 active");
})();
