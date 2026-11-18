import QRCode from 'qrcode';

export const DEFAULT_SHARED_GIFT_URL = 'https://madeforpams.ai.studio';

export interface HeartQrOptions {
  recipientLabel?: string;
  headline?: string;
  subtitle?: string;
  footerTop?: string;
  footerBottom?: string;
}

export interface HeartQrMatrixData {
  moduleCount: number;
  qrBits: Uint8Array;
  lobeDots: Array<{ col: number; row: number; scale: number }>;
}

function deterministicHash(a: number, b: number): number {
  let n = Math.imul(a * 374761393 + b * 668265263, 1274126177);
  n = (n ^ (n >>> 13)) >>> 0;
  return (n % 1000) / 1000;
}

export function isFinderCell(row: number, col: number, n: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= n - 7;
  const inBottomLeft = row >= n - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

export function buildHeartQrMatrix(url: string): HeartQrMatrixData {
  const qr = QRCode.create(url || DEFAULT_SHARED_GIFT_URL, {
    errorCorrectionLevel: 'H',
  });
  const n = qr.modules.size;
  const qrBits = new Uint8Array(qr.modules.data);
  const mid = (n - 1) / 2;
  const lobeRadius = mid * 0.94;
  const quietMargin = 1.85;

  const lobeDots: Array<{ col: number; row: number; scale: number }> = [];
  const minBound = -Math.ceil(lobeRadius + 4);

  for (let row = minBound; row < n; row++) {
    for (let col = minBound; col < n; col++) {
      // Never draw decorative dots inside the QR matrix or its quiet-zone channel,
      // and keep the top-center cleft (both col < 0 and row < 0) clean so the heart dip reads crisply
      if (col >= -quietMargin && row >= -quietMargin) continue;
      if (col < 0 && row < 0) continue;

      const inLeftLobe =
        col < -quietMargin &&
        row >= 1 &&
        row <= n - 2 &&
        Math.hypot(col + quietMargin * 0.85, row - mid) <= lobeRadius;

      const inRightLobe =
        row < -quietMargin &&
        col >= 1 &&
        col <= n - 2 &&
        Math.hypot(col - mid, row + quietMargin * 0.85) <= lobeRadius;

      if (!inLeftLobe && !inRightLobe) continue;

      // Keep crisp edge contour + organic QR-density mosaic matching the real matrix
      const dist = inLeftLobe
        ? Math.hypot(col + quietMargin * 0.85, row - mid)
        : Math.hypot(col - mid, row + quietMargin * 0.85);
      const isOuterRim = dist > lobeRadius - 1.15;
      const h = deterministicHash(col + 100, row + 100);

      if (isOuterRim ? h > 0.18 : h > 0.44) {
        lobeDots.push({
          col,
          row,
          scale: isOuterRim ? 0.86 : 0.92,
        });
      }
    }
  }

  return { moduleCount: n, qrBits, lobeDots };
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawVectorHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.translate(cx, cy);
  const s = size / 32;
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.bezierCurveTo(-18, 1, -18, -11, -9, -15);
  ctx.bezierCurveTo(-3.5, -17.5, 0, -12, 0, -9);
  ctx.bezierCurveTo(0, -12, 3.5, -17.5, 9, -15);
  ctx.bezierCurveTo(18, -11, 18, 1, 0, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawHeartQrCardToCanvas(
  canvas: HTMLCanvasElement,
  url: string,
  options: HeartQrOptions = {}
) {
  const width = 1080;
  const height = 1620;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const recipientLabel = options.recipientLabel ?? 'For Pams';
  const headline = options.headline ?? 'Open me';
  const subtitle = options.subtitle ?? 'A surprise is waiting for you';
  const footerTop = options.footerTop ?? 'Scan with your camera';
  const footerBottom = options.footerBottom ?? 'Made for Pams ♥';

  ctx.clearRect(0, 0, width, height);

  // Outer soft rounded card clip
  ctx.save();
  drawRoundedRectPath(ctx, 0, 0, width, height, 68);
  ctx.clip();

  // 1. Warm Blush-Parchment Watercolor Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#efe1dc');
  bgGrad.addColorStop(0.42, '#f2e6ea');
  bgGrad.addColorStop(1, '#f4eff2');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const warmGlow = ctx.createRadialGradient(180, 140, 20, 220, 180, 560);
  warmGlow.addColorStop(0, 'rgba(222, 165, 148, 0.28)');
  warmGlow.addColorStop(1, 'rgba(222, 165, 148, 0)');
  ctx.fillStyle = warmGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Painterly Burgundy & Lilac Corner Petal Sweeps (matching reference card layout)
  // Top-right deep plum petal sweep
  ctx.save();
  ctx.fillStyle = '#8b3556';
  ctx.beginPath();
  ctx.moveTo(width * 0.56, 0);
  ctx.bezierCurveTo(width * 0.65, 220, width * 0.88, 250, width, 210);
  ctx.lineTo(width, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Mid-left small burgundy petal
  ctx.save();
  ctx.fillStyle = '#8f3f60';
  ctx.beginPath();
  ctx.moveTo(0, 515);
  ctx.quadraticCurveTo(108, 540, 112, 608);
  ctx.quadraticCurveTo(50, 622, 0, 605);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Left soft lilac leaf
  ctx.save();
  ctx.fillStyle = '#beabc1';
  ctx.beginPath();
  ctx.moveTo(0, 780);
  ctx.quadraticCurveTo(96, 875, 58, 1085);
  ctx.quadraticCurveTo(22, 1055, 0, 995);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right soft lilac leaf
  ctx.save();
  ctx.fillStyle = '#b9a3bc';
  ctx.beginPath();
  ctx.moveTo(width, 795);
  ctx.quadraticCurveTo(width - 125, 920, width - 68, 1170);
  ctx.quadraticCurveTo(width - 20, 1125, width, 1065);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bottom-left pale lilac watercolor corner sweep
  ctx.save();
  ctx.fillStyle = 'rgba(196, 174, 200, 0.58)';
  ctx.beginPath();
  ctx.moveTo(0, height - 245);
  ctx.bezierCurveTo(210, height - 245, 360, height - 135, 395, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Delicate tiny accent hearts tucked gently near copy
  drawVectorHeart(ctx, 185, 290, 26, '#5c1f3c', 0.92);
  drawVectorHeart(ctx, 882, 1025, 28, '#aa97b0', 0.85);
  drawVectorHeart(ctx, 250, 1280, 22, '#aa97b0', 0.78);

  // 3. Header Ornament + Typography
  // Minimalist emblem flourish above "For Pams"
  ctx.save();
  ctx.fillStyle = '#3f182a';
  ctx.beginPath();
  ctx.arc(width / 2 - 78, 116, 4.5, 0, Math.PI * 2);
  ctx.arc(width / 2 + 78, 116, 4.5, 0, Math.PI * 2);
  ctx.fill();
  drawVectorHeart(ctx, width / 2, 118, 22, '#3f182a', 0.92);
  ctx.restore();

  // "For Pams"
  ctx.fillStyle = '#5c1e3c';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 600 48px Georgia, "Playfair Display", serif';
  ctx.fillText(recipientLabel, width / 2, 185);

  // "Open me ♥"
  ctx.font = '700 92px Georgia, "Playfair Display", serif';
  const headlineWidth = ctx.measureText(headline).width;
  const totalHeadW = headlineWidth + 74;
  const textCenterX = width / 2 - totalHeadW / 2 + headlineWidth / 2;
  ctx.fillStyle = '#240c17';
  ctx.fillText(headline, textCenterX, 292);
  drawVectorHeart(ctx, textCenterX + headlineWidth / 2 + 44, 294, 58, '#4f1431', 1);

  // Subtitle
  ctx.font = '500 35px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#4e3542';
  ctx.fillText(subtitle, width / 2, 368);

  // 4. Rotated 45° Heart-Shaped Scannable QR Code
  const { moduleCount, qrBits, lobeDots } = buildHeartQrMatrix(url);
  const cx = width / 2;
  const cy = 838;
  // Scale cell size dynamically so heart width remains ~690px regardless of URL length
  const cell = Math.min(18.5, 492 / moduleCount);
  const halfMatrix = (moduleCount * cell) / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.translate(-halfMatrix, -halfMatrix);

  const darkPlum = '#521535';
  const finderPlum = '#3f0c27';

  // Draw rounded data modules (skipping the 3 finder pattern regions so we render crisp eyes)
  ctx.fillStyle = darkPlum;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isFinderCell(row, col, moduleCount)) continue;
      if (!qrBits[row * moduleCount + col]) continue;

      const x = col * cell + cell * 0.08;
      const y = row * cell + cell * 0.08;
      const s = cell * 0.84;
      drawRoundedRectPath(ctx, x, y, s, s, cell * 0.24);
      ctx.fill();
    }
  }

  // Draw the 3 crisp rounded Finder Eyes (Top-Left -> Top Center, Top-Right -> Right, Bottom-Left -> Left)
  const finderOrigins: Array<[number, number]> = [
    [0, 0],
    [0, moduleCount - 7],
    [moduleCount - 7, 0],
  ];

  for (const [fRow, fCol] of finderOrigins) {
    const fx = fCol * cell;
    const fy = fRow * cell;
    const outerSize = 7 * cell;

    // Outer solid dark frame
    ctx.fillStyle = finderPlum;
    drawRoundedRectPath(ctx, fx, fy, outerSize, outerSize, cell * 1.65);
    ctx.fill();

    // Inner quiet ring carved back in soft card cream
    ctx.fillStyle = '#f3e9ec';
    drawRoundedRectPath(ctx, fx + cell, fy + cell, 5 * cell, 5 * cell, cell * 1.15);
    ctx.fill();

    // Solid center eye
    ctx.fillStyle = finderPlum;
    drawRoundedRectPath(ctx, fx + 2 * cell, fy + 2 * cell, 3 * cell, 3 * cell, cell * 0.75);
    ctx.fill();
  }

  // Draw upper-left and upper-right heart lobe decorative mosaic modules (outside quiet zone)
  ctx.fillStyle = '#621d41';
  for (const dot of lobeDots) {
    const s = cell * dot.scale;
    const pad = (cell - s) / 2;
    drawRoundedRectPath(ctx, dot.col * cell + pad, dot.row * cell + pad, s, s, cell * 0.26);
    ctx.fill();
  }

  ctx.restore();

  // 5. Bottom Caption
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7b4c63';
  ctx.font = 'italic 500 35px Georgia, "Playfair Display", serif';
  ctx.fillText(footerTop, width / 2, height - 186);

  ctx.fillStyle = '#8b5e74';
  ctx.font = '500 30px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(footerBottom, width / 2, height - 130);

  ctx.restore();
}
