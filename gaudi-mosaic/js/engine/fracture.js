// =====================================================
// GAUDÍ MOSAIC — Motor de fractura
// Múltiples algorismes per crear fragments de ceràmica
// =====================================================

/**
 * Genera fragments a partir d'una ceràmica.
 * L'atzar decideix la forma dels fragments, com en un trencadís real.
 * @param {HTMLCanvasElement} sourceCanvas - Canvas de la ceràmica original
 * @param {string} type - Tipus de fractura: 'voronoi', 'radial', 'organic'
 * @param {number} granularity - 0 (fi) a 1 (gruixut)
 * @returns {Array} Fragments generats
 */
export function generateFragments(sourceCanvas, type = 'voronoi', granularity = 0.5, size = 300) {
  switch (type) {
    case 'radial':
      return fractureRadial(sourceCanvas, granularity, size);
    case 'organic':
      return fractureOrganic(sourceCanvas, granularity, size);
    case 'voronoi':
    default:
      return fractureVoronoi(sourceCanvas, granularity, size);
  }
}

// =====================================================
// VORONOI MILLORAT — amb pertorbació de vores
// =====================================================
function fractureVoronoi(sourceCanvas, granularity, size = 300) {
  // Més fragments si la granularitat és fina
  const numSeeds = Math.floor(lerp(12, 4, granularity));

  // Generar punts llavor aleatòriament
  const seeds = generateRandomSeeds(numSeeds, size);

  // Lloyd relaxation per distribuir millor els punts (2 iteracions)
  relaxSeeds(seeds, size, 2);

  // Assignar cada píxel al llavor més proper (vores netes)
  const assignment = new Int32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let minDist = Infinity, minIdx = 0;
      for (let s = 0; s < seeds.length; s++) {
        const d = (x - seeds[s].x) ** 2 + (y - seeds[s].y) ** 2;
        if (d < minDist) { minDist = d; minIdx = s; }
      }
      assignment[y * size + x] = minIdx;
    }
  }

  return extractFragments(sourceCanvas, assignment, seeds.length, size);
}

// =====================================================
// FRACTURA RADIAL — des d'un punt d'impacte aleatori
// =====================================================
function fractureRadial(sourceCanvas, granularity, size = 300) {
  // Punt d'impacte aleatori (prop del centre, amb variació)
  const impactX = size * 0.33 + Math.random() * size * 0.33;
  const impactY = size * 0.33 + Math.random() * size * 0.33;

  // Sectors radials + anells concèntrics
  const numSectors = Math.floor(lerp(10, 4, granularity));
  const numRings = Math.floor(lerp(5, 2, granularity));
  const maxRadius = Math.sqrt(size * size * 2);

  const assignment = new Int32Array(size * size);
  const totalRegions = numSectors * numRings + 1; // +1 pel centre

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - impactX;
      const dy = y - impactY;
      const r = Math.sqrt(dx * dx + dy * dy);
      let angle = Math.atan2(dy, dx) + Math.PI;

      // Pertorbació determinística per vores netes però irregulars
      const pertScale = size / 300;
      angle += Math.sin(r * 0.15 / pertScale + angle * 3) * 0.15;
      const pertR = r + Math.sin(angle * 5 + r * 0.1 / pertScale) * 8 * pertScale;

      const sector = Math.floor((angle / (Math.PI * 2)) * numSectors) % numSectors;
      const ring = Math.min(Math.floor((pertR / maxRadius) * numRings), numRings - 1);

      // Zona central
      if (pertR < 20 * pertScale) {
        assignment[y * size + x] = totalRegions - 1;
      } else {
        assignment[y * size + x] = ring * numSectors + sector;
      }
    }
  }

  return extractFragments(sourceCanvas, assignment, totalRegions, size);
}

// =====================================================
// FRACTURA ORGÀNICA — vores amb corbes
// =====================================================
function fractureOrganic(sourceCanvas, granularity, size = 300) {
  const numSeeds = Math.floor(lerp(10, 3, granularity));
  const seeds = generateRandomSeeds(numSeeds, size);
  relaxSeeds(seeds, size, 3);

  // Distància amb soroll Simplex-like per crear vores orgàniques
  const assignment = new Int32Array(size * size);
  const sizeRatio = 300 / size; // Escalar soroll per mantenir proporcions
  const noiseScale = (0.03 + granularity * 0.04) * sizeRatio;
  const noiseStrength = (30 + granularity * 40) / sizeRatio;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let minDist = Infinity, minIdx = 0;
      // Soroll determinístic basat en posició
      const noise = Math.sin(x * noiseScale * 7.3 + y * noiseScale * 3.7) *
                    Math.cos(x * noiseScale * 4.1 - y * noiseScale * 5.9) * noiseStrength;

      for (let s = 0; s < seeds.length; s++) {
        const dx = x - seeds[s].x;
        const dy = y - seeds[s].y;
        // Distància amb pertorbació orgànica
        const d = Math.sqrt(dx * dx + dy * dy) + noise * (0.5 + 0.5 * Math.sin(s * 2.1));
        if (d < minDist) { minDist = d; minIdx = s; }
      }
      assignment[y * size + x] = minIdx;
    }
  }

  // Suavitzar assignació per evitar píxels aïllats (artefactes fantasma)
  smoothAssignment(assignment, size, 3);

  return extractFragments(sourceCanvas, assignment, seeds.length, size);
}

// =====================================================
// FUNCIONS AUXILIARS
// =====================================================

/**
 * Genera punts llavor aleatòriament per la fractura.
 * L'atzar decideix les formes, com en un trencadís real.
 */
function generateRandomSeeds(numSeeds, size) {
  const seeds = [];
  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: 10 + Math.random() * (size - 20),
      y: 10 + Math.random() * (size - 20)
    });
  }
  return seeds;
}

/**
 * Suavitza l'assignació de regions per eliminar píxels aïllats (artefactes).
 * Si un píxel té menys de 2 veïns del mateix grup, adopta el grup majoritari.
 */
function smoothAssignment(assignment, size, passes = 2) {
  const temp = new Int32Array(assignment.length);
  for (let pass = 0; pass < passes; pass++) {
    temp.set(assignment);
    for (let y = 1; y < size - 1; y++) {
      for (let x = 1; x < size - 1; x++) {
        const idx = y * size + x;
        const current = temp[idx];
        const up = temp[(y - 1) * size + x];
        const down = temp[(y + 1) * size + x];
        const left = temp[y * size + (x - 1)];
        const right = temp[y * size + (x + 1)];

        let sameCount = 0;
        if (up === current) sameCount++;
        if (down === current) sameCount++;
        if (left === current) sameCount++;
        if (right === current) sameCount++;

        if (sameCount <= 1) {
          // Adoptar el veí majoritari
          const counts = {};
          [up, down, left, right].forEach(n => {
            counts[n] = (counts[n] || 0) + 1;
          });
          let maxC = 0, maxV = current;
          for (const val in counts) {
            if (counts[val] > maxC) { maxC = counts[val]; maxV = parseInt(val); }
          }
          assignment[idx] = maxV;
        }
      }
    }
  }
}

/**
 * Lloyd relaxation — distribueix els punts de forma més uniforme
 */
function relaxSeeds(seeds, size, iterations) {
  for (let iter = 0; iter < iterations; iter++) {
    // Calcular centroide de cada regió
    const sums = seeds.map(() => ({ x: 0, y: 0, count: 0 }));

    // Mostreig espaiat (no cada píxel per rendiment)
    const step = 3;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        let minDist = Infinity, minIdx = 0;
        for (let s = 0; s < seeds.length; s++) {
          const d = (x - seeds[s].x) ** 2 + (y - seeds[s].y) ** 2;
          if (d < minDist) { minDist = d; minIdx = s; }
        }
        sums[minIdx].x += x;
        sums[minIdx].y += y;
        sums[minIdx].count++;
      }
    }

    // Moure llavors cap als centroides
    for (let s = 0; s < seeds.length; s++) {
      if (sums[s].count > 0) {
        seeds[s].x = lerp(seeds[s].x, sums[s].x / sums[s].count, 0.5);
        seeds[s].y = lerp(seeds[s].y, sums[s].y / sums[s].count, 0.5);
      }
    }
  }
}

/**
 * Extreu fragments d'una imatge basant-se en l'assignació de regions
 */
function extractFragments(sourceCanvas, assignment, numRegions, size) {
  // Preparar la imatge font a mida completa
  const srcBig = document.createElement('canvas');
  srcBig.width = srcBig.height = size;
  srcBig.getContext('2d').drawImage(sourceCanvas, 0, 0, size, size);
  const srcData = srcBig.getContext('2d').getImageData(0, 0, size, size);

  const fragments = [];

  for (let s = 0; s < numRegions; s++) {
    // Trobar bounding box
    let minX = size, minY = size, maxX = 0, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (assignment[y * size + x] === s) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          hasPixels = true;
        }
      }
    }

    if (!hasPixels || maxX <= minX || maxY <= minY) continue;

    const fw = maxX - minX + 1;
    const fh = maxY - minY + 1;

    // Descartar fragments massa petits (proporcional a la mida de treball)
    const minFrag = Math.max(8, Math.floor(size * 0.025));
    if (fw < minFrag || fh < minFrag) continue;

    const fragCanvas = document.createElement('canvas');
    fragCanvas.width = fw;
    fragCanvas.height = fh;
    const fCtx = fragCanvas.getContext('2d');
    const fragData = fCtx.createImageData(fw, fh);

    // Extreure els píxels del fragment
    const contourPoints = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (assignment[y * size + x] === s) {
          const si = (y * size + x) * 4;
          const di = ((y - minY) * fw + (x - minX)) * 4;
          fragData.data[di] = srcData.data[si];
          fragData.data[di + 1] = srcData.data[si + 1];
          fragData.data[di + 2] = srcData.data[si + 2];
          fragData.data[di + 3] = 255;

          // Detectar contorn per col·lisió
          const isEdge = (
            x === minX || x === maxX || y === minY || y === maxY ||
            assignment[(y - 1) * size + x] !== s ||
            assignment[(y + 1) * size + x] !== s ||
            assignment[y * size + (x - 1)] !== s ||
            assignment[y * size + (x + 1)] !== s
          );
          if (isEdge) {
            contourPoints.push({ x: x - minX, y: y - minY });
          }
        }
      }
    }

    fCtx.putImageData(fragData, 0, 0);

    // Simplificar el contorn (agafar cada N punts)
    const simplifiedContour = simplifyContour(contourPoints, 8);

    fragments.push({
      canvas: fragCanvas,
      origX: minX,
      origY: minY,
      w: fw,
      h: fh,
      polygon: simplifiedContour
    });
  }

  return fragments;
}

/**
 * Simplifica un contorn agafant punts espaiats
 */
function simplifyContour(points, step) {
  if (points.length <= step) return points;
  // Ordenar per angle des del centre
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
  points.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  const result = [];
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i]);
  }
  return result;
}

/**
 * Anima la fractura — efecte "wow" amb separació, rotació, flash i partícules
 */
export function animateCrack(ctx, fragments, size, progress) {
  ctx.clearRect(0, 0, size, size);

  const centerX = size / 2;
  const centerY = size / 2;

  // Fase 1: flash d'impacte (0–0.15)
  if (progress < 0.15) {
    const flashAlpha = Math.sin((progress / 0.15) * Math.PI) * 0.35;
    ctx.save();
    ctx.fillStyle = `rgba(255,240,210,${flashAlpha})`;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // Moviment dels fragments
  // Fase expansió ràpida (0–0.4) + relaxació suau (0.4–1.0)
  const expandT = Math.min(progress / 0.4, 1);
  const relaxT = progress > 0.4 ? (progress - 0.4) / 0.6 : 0;
  const easeExpand = 1 - Math.pow(1 - expandT, 3); // easeOutCubic
  const easeRelax = relaxT * relaxT * (3 - 2 * relaxT);  // smoothstep

  fragments.forEach((frag) => {
    // Pre-calcular una "seed" estable per fragment (no Math.random() cada frame)
    if (frag._animSeed === undefined) {
      frag._animSeed = Math.random();
      frag._animAngle = Math.random() * 0.3 - 0.15; // rotació màx ±8.5°
    }

    const fragCX = frag.origX + frag.w / 2;
    const fragCY = frag.origY + frag.h / 2;
    const angle = Math.atan2(fragCY - centerY, fragCX - centerX);

    // Distància d'expansió: ràpida al principi, es relaxa després
    const maxDist = 4 + frag._animSeed * 6;
    const finalDist = 2 + frag._animSeed * 2;
    const dist = lerp(maxDist * easeExpand, finalDist, easeRelax);

    const ox = Math.cos(angle) * dist;
    const oy = Math.sin(angle) * dist;

    // Rotació: es fa durant l'expansió i es manté
    const rot = frag._animAngle * easeExpand;

    ctx.save();
    // Ombra creixent
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 3 + 5 * easeExpand;
    ctx.shadowOffsetX = 1 + 2 * easeExpand;
    ctx.shadowOffsetY = 1 + 2 * easeExpand;

    // Translació + rotació al centre del fragment
    ctx.translate(frag.origX + frag.w / 2 + ox, frag.origY + frag.h / 2 + oy);
    ctx.rotate(rot);
    ctx.drawImage(frag.canvas, -frag.w / 2, -frag.h / 2);
    ctx.restore();
  });

  // Partícules de pols als talls (apareixen durant l'expansió, es dissolen)
  if (progress > 0.05 && progress < 0.8) {
    drawDustParticles(ctx, fragments, size, progress);
  }

  // Línies de fractura subtils entre fragments
  if (progress > 0.1) {
    const lineAlpha = Math.min((progress - 0.1) / 0.3, 1) * 0.2;
    drawFractureLines(ctx, fragments, size, lineAlpha, progress);
  }
}

/**
 * Dibuixa partícules de pols als punts de fractura
 */
function drawDustParticles(ctx, fragments, size, progress) {
  // Utilitzar la seed de cada fragment per generar partícules estables
  if (!fragments._particles) {
    const particles = [];
    const centerX = size / 2;
    const centerY = size / 2;

    fragments.forEach(frag => {
      // Generar partícules a les vores del fragment
      const numP = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numP; i++) {
        const edge = Math.random() < 0.5;
        particles.push({
          x: frag.origX + (edge ? 0 : frag.w) + (Math.random() - 0.5) * 6,
          y: frag.origY + Math.random() * frag.h,
          r: 1 + Math.random() * 2.5,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 - 1,
          life: 0.3 + Math.random() * 0.5,
          color: Math.random() > 0.5
            ? `rgba(212,168,67,${0.3 + Math.random() * 0.3})`
            : `rgba(181,168,152,${0.3 + Math.random() * 0.3})`
        });
      }
    });
    fragments._particles = particles;
  }

  ctx.save();
  fragments._particles.forEach(p => {
    const lifeProgress = progress / p.life;
    if (lifeProgress > 1) return;

    const alpha = 1 - lifeProgress;
    const x = p.x + p.vx * progress * 30;
    const y = p.y + p.vy * progress * 30;
    const r = p.r * (1 - lifeProgress * 0.5);

    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Dibuixa línies de fractura subtils als límits entre fragments
 */
function drawFractureLines(ctx, fragments, size, alpha, progress) {
  ctx.save();
  ctx.strokeStyle = `rgba(28,25,20,${alpha})`;
  ctx.lineWidth = 0.5;
  const centerX = size / 2;
  const centerY = size / 2;

  fragments.forEach(frag => {
    if (!frag.polygon || frag.polygon.length < 3) return;

    const expandT = Math.min(progress / 0.4, 1);
    const relaxT = progress > 0.4 ? (progress - 0.4) / 0.6 : 0;
    const easeExpand = 1 - Math.pow(1 - expandT, 3);
    const easeRelax = relaxT * relaxT * (3 - 2 * relaxT);

    const fragCX = frag.origX + frag.w / 2;
    const fragCY = frag.origY + frag.h / 2;
    const angle = Math.atan2(fragCY - centerY, fragCX - centerX);

    const maxDist = 4 + (frag._animSeed || 0.5) * 6;
    const finalDist = 2 + (frag._animSeed || 0.5) * 2;
    const dist = lerp(maxDist * easeExpand, finalDist, easeRelax);
    const ox = Math.cos(angle) * dist;
    const oy = Math.sin(angle) * dist;
    const rot = (frag._animAngle || 0) * easeExpand;

    ctx.save();
    ctx.translate(fragCX + ox, fragCY + oy);
    ctx.rotate(rot);
    ctx.beginPath();
    frag.polygon.forEach((pt, i) => {
      const px = pt.x - frag.w / 2;
      const py = pt.y - frag.h / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

// Utilitats locals
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
