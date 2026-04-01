// =====================================================
// GAUDÍ MOSAIC — Generació procedural de ceràmiques
// Patrons, textures i tipus de ceràmica
// =====================================================

import { PALETTES } from '../data/palettes.js';

/**
 * Genera un patró de ceràmica procedural en un canvas.
 * Usa colors d'una paleta i un dels 10 patrons disponibles.
 * @param {HTMLCanvasElement} canvas - Canvas on dibuixar
 * @param {string} paletteKey - Clau de la paleta de colors
 * @param {number|string} patternType - Índex o nom del patró
 * @param {string} ceramicType - Acabat: glazed, matte, iridescent, rustic
 * @returns {Object} Informació del patró generat
 */
export function generateCeramicPattern(canvas, paletteKey, patternType, ceramicType = 'glazed') {
  const ctx = canvas.getContext('2d');
  const w = canvas.width = 100;
  const h = canvas.height = 100;

  const palette = PALETTES[paletteKey].colors;

  // Color base
  ctx.fillStyle = palette[Math.floor(Math.random() * 3)];
  ctx.fillRect(0, 0, w, h);

  // Dibuixar patró
  const patternFn = PATTERN_GENERATORS[patternType] || PATTERN_GENERATORS.circles;
  patternFn(ctx, w, h, palette);

  // Aplicar textura segons tipus de ceràmica
  applyCeramicTexture(ctx, w, h, ceramicType);

  return { paletteKey, patternType, ceramicType, source: 'procedural' };
}

/**
 * Precarrega textures per una paleta i regenera les rajoles si en troba.
 * Cridar quan canvia el tipus de ceràmica o s'afegeixen textures noves.
 * @param {string} paletteKey - Clau de la paleta
 * @param {string} ceramicType - Tipus de ceràmica
 * @returns {Promise<boolean>} true si s'ha carregat una textura
 */
export async function tryLoadTexture(paletteKey, ceramicType) {
  const img = await loadTexture(paletteKey, ceramicType);
  return img !== null;
}

/**
 * Generadors de patrons
 */
const PATTERN_GENERATORS = {
  circles(ctx, w, h, palette) {
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * w, Math.random() * h,
        10 + Math.random() * 20, 0, Math.PI * 2
      );
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  stripes(ctx, w, h, palette) {
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((Math.random() - 0.5) * 1.5);
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.fillRect(-w, -3 - Math.random() * 10, w * 2, 6 + Math.random() * 14);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  diamonds(ctx, w, h, palette) {
    for (let i = 0; i < 6; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const s = 10 + Math.random() * 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.closePath();
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  organic(ctx, w, h, palette) {
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      ctx.moveTo(sx, sy);
      for (let j = 0; j < 5; j++) {
        ctx.quadraticCurveTo(
          Math.random() * w, Math.random() * h,
          Math.random() * w, Math.random() * h
        );
      }
      ctx.closePath();
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.globalAlpha = 0.4 + Math.random() * 0.4;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  mosaic(ctx, w, h, palette) {
    const cellSize = 12 + Math.random() * 8;
    for (let x = 0; x < w; x += cellSize) {
      for (let y = 0; y < h; y += cellSize) {
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        const gap = 1;
        ctx.fillRect(x + gap, y + gap, cellSize - gap * 2, cellSize - gap * 2);
      }
    }
    ctx.globalAlpha = 1;
  },

  floral(ctx, w, h, palette) {
    // Flors estilitzades
    for (let i = 0; i < 4; i++) {
      const cx = 15 + Math.random() * (w - 30);
      const cy = 15 + Math.random() * (h - 30);
      const petals = 5 + Math.floor(Math.random() * 4);
      const radius = 12 + Math.random() * 15;

      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.6, radius * 0.35, radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.globalAlpha = 0.6 + Math.random() * 0.3;
        ctx.fill();
        ctx.restore();
      }
      // Centre
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = palette[Math.floor(Math.random() * 3)];
      ctx.globalAlpha = 0.9;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  spiral(ctx, w, h, palette) {
    const cx = w / 2, cy = h / 2;
    const turns = 3 + Math.random() * 2;
    const maxR = Math.min(w, h) * 0.45;
    ctx.lineWidth = 3 + Math.random() * 5;

    for (let band = 0; band < 3; band++) {
      ctx.beginPath();
      ctx.strokeStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.globalAlpha = 0.5 + Math.random() * 0.4;
      const offset = band * 0.3;
      for (let t = 0; t < turns * Math.PI * 2; t += 0.1) {
        const r = (t / (turns * Math.PI * 2)) * maxR;
        const x = cx + Math.cos(t + offset) * r;
        const y = cy + Math.sin(t + offset) * r;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  scales(ctx, w, h, palette) {
    // Escates de peix/drac
    const scaleW = 14 + Math.random() * 6;
    const scaleH = 10 + Math.random() * 5;
    let row = 0;
    for (let y = -scaleH; y < h + scaleH; y += scaleH * 0.75) {
      const xOffset = (row % 2) * (scaleW / 2);
      for (let x = -scaleW + xOffset; x < w + scaleW; x += scaleW) {
        ctx.beginPath();
        ctx.arc(x + scaleW / 2, y + scaleH, scaleW / 2, Math.PI, 0);
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
        ctx.globalAlpha = 0.5 + Math.random() * 0.4;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      row++;
    }
    ctx.globalAlpha = 1;
  },

  stainedglass(ctx, w, h, palette) {
    // Vitrall — regions irregulars amb vores gruixudes
    const seeds = [];
    const numSeeds = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numSeeds; i++) {
      seeds.push({ x: Math.random() * w, y: Math.random() * h });
    }

    // Assignació Voronoi simple
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let minD = Infinity, minI = 0, secondD = Infinity;
        for (let s = 0; s < seeds.length; s++) {
          const d = (x - seeds[s].x) ** 2 + (y - seeds[s].y) ** 2;
          if (d < minD) { secondD = minD; minD = d; minI = s; }
          else if (d < secondD) { secondD = d; }
        }
        // Vora del vitrall
        const edgeDist = Math.sqrt(secondD) - Math.sqrt(minD);
        if (edgeDist < 2.5) {
          ctx.fillStyle = '#1C1914';
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = palette[minI % palette.length];
          ctx.globalAlpha = 0.7 + Math.random() * 0.2;
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  },

  granite(ctx, w, h, palette) {
    // Textura de granit / pedra
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const noise = Math.random();
        const ci = Math.floor(noise * palette.length);
        ctx.fillStyle = palette[ci];
        ctx.globalAlpha = 0.3 + noise * 0.5;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // Vetes
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.quadraticCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
      ctx.strokeStyle = palette[Math.floor(Math.random() * 3)];
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};

/**
 * Aplica textura visual segons el tipus de ceràmica.
 * Cada tipus ha de ser visualment ben diferent dels altres.
 */
function applyCeramicTexture(ctx, w, h, ceramicType) {
  switch (ceramicType) {
    case 'glazed': {
      // Vidriat — brillantor intensa amb reflex especular diagonal
      ctx.globalAlpha = 1;
      const glossGrad = ctx.createLinearGradient(0, 0, w * 0.7, h * 0.7);
      glossGrad.addColorStop(0, 'rgba(255,255,255,0)');
      glossGrad.addColorStop(0.35, 'rgba(255,255,255,0)');
      glossGrad.addColorStop(0.45, 'rgba(255,255,255,0.45)');
      glossGrad.addColorStop(0.55, 'rgba(255,255,255,0.3)');
      glossGrad.addColorStop(0.65, 'rgba(255,255,255,0)');
      glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(0, 0, w, h);

      // Reflex radial a la cantonada (efecte vidre)
      const edgeGrad = ctx.createRadialGradient(
        w * 0.2, h * 0.2, 0,
        w * 0.2, h * 0.2, w * 0.45
      );
      edgeGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
      edgeGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
      edgeGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'matte': {
      // Mat — sense brillantor, gra fi, vinyeta fosca
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // Gra fi uniforme
      ctx.globalAlpha = 0.15;
      for (let x = 0; x < w; x += 2) {
        for (let y = 0; y < h; y += 2) {
          const v = Math.floor(Math.random() * 50);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }

      // Vinyeta suau — enfosquiment als marges
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.65);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'iridescent': {
      // Iridiscent — arc de Sant Martí intens amb brillantor
      ctx.globalAlpha = 0.3;
      const iriGrad = ctx.createLinearGradient(0, 0, w, h);
      iriGrad.addColorStop(0, 'rgba(255,50,50,0.6)');
      iriGrad.addColorStop(0.2, 'rgba(255,200,50,0.5)');
      iriGrad.addColorStop(0.4, 'rgba(50,255,100,0.5)');
      iriGrad.addColorStop(0.6, 'rgba(50,150,255,0.6)');
      iriGrad.addColorStop(0.8, 'rgba(200,50,255,0.5)');
      iriGrad.addColorStop(1, 'rgba(255,50,100,0.5)');
      ctx.fillStyle = iriGrad;
      ctx.fillRect(0, 0, w, h);

      // Gradient perpendicular per efecte canviant
      ctx.globalAlpha = 0.2;
      const iriGrad2 = ctx.createLinearGradient(w, 0, 0, h);
      iriGrad2.addColorStop(0, 'rgba(100,255,255,0.5)');
      iriGrad2.addColorStop(0.5, 'rgba(255,100,255,0.4)');
      iriGrad2.addColorStop(1, 'rgba(255,255,100,0.5)');
      ctx.fillStyle = iriGrad2;
      ctx.fillRect(0, 0, w, h);

      // Punts de brillantor (sparkle)
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 5; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sparkle = ctx.createRadialGradient(sx, sy, 0, sx, sy, 6 + Math.random() * 10);
        sparkle.addColorStop(0, 'rgba(255,255,255,0.8)');
        sparkle.addColorStop(0.4, 'rgba(255,255,255,0.15)');
        sparkle.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sparkle;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }

    case 'rustic': {
      // Rústic — soroll intens, esquerdes, taques, rugositat
      ctx.globalAlpha = 0.25;
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          const v = Math.random();
          if (v > 0.3) {
            ctx.fillStyle = v > 0.6
              ? `rgba(0,0,0,${v * 0.45})`
              : `rgba(255,255,255,${v * 0.25})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      // Esquerdes visibles
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        let cx = Math.random() * w;
        let cy = Math.random() * h;
        ctx.moveTo(cx, cy);
        for (let j = 0; j < 6; j++) {
          cx += (Math.random() - 0.5) * 25;
          cy += (Math.random() - 0.5) * 25;
          ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 0.5 + Math.random() * 0.5;
        ctx.stroke();
      }

      // Taques fosques irregulars
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 3; i++) {
        const tx = Math.random() * w;
        const ty = Math.random() * h;
        const tr = 8 + Math.random() * 18;
        const stain = ctx.createRadialGradient(tx, ty, 0, tx, ty, tr);
        stain.addColorStop(0, 'rgba(40,30,20,0.5)');
        stain.addColorStop(1, 'rgba(40,30,20,0)');
        ctx.fillStyle = stain;
        ctx.fillRect(0, 0, w, h);
      }

      // Vinyeta fosca
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.6);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
      break;
    }
  }
  ctx.globalAlpha = 1;
}
