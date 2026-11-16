import type { FrameStyle, PhotoFilter } from '../types';

interface RenderOptions {
  imageSrc: string;
  frameStyle: FrameStyle;
  filter: PhotoFilter;
  guestName: string;
  caption?: string;
  dateStr?: string;
  eventTitle?: string;
  hashtag?: string;
}

export async function renderFramedPhoto(options: RenderOptions): Promise<string> {
  const {
    imageSrc,
    frameStyle,
    filter,
    guestName,
    caption = '',
    dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    eventTitle = 'Candid Moments',
    hashtag = '#candidwedding',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Standard dimensions for high-res output
        const baseWidth = 1080;
        let baseHeight = 1350; // 4:5 default

        if (frameStyle === 'polaroid') {
          baseHeight = 1320;
        } else if (frameStyle === 'film35mm') {
          baseHeight = 1200;
        } else if (frameStyle === 'gold_luxury') {
          baseHeight = 1350;
        }

        canvas.width = baseWidth;
        canvas.height = baseHeight;

        // 1. Draw Frame Background
        drawFrameBackground(ctx, baseWidth, baseHeight, frameStyle);

        // 2. Define Image Area according to frame style
        const photoBox = getPhotoBox(baseWidth, baseHeight, frameStyle);

        // Create temporary canvas for filtered photo
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = photoBox.w;
        tempCanvas.height = photoBox.h;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // Crop and draw source image to fill photoBox
          drawImageProp(tempCtx, img, 0, 0, photoBox.w, photoBox.h, 0.5, 0.5);

          // Apply selected color filter
          applyPhotoFilter(tempCtx, photoBox.w, photoBox.h, filter);

          // Draw filtered photo onto main canvas
          ctx.drawImage(tempCanvas, photoBox.x, photoBox.y);
        }

        // 3. Draw Frame Overlays (borders, inner shadows, sprockets, text)
        drawFrameForeground(ctx, baseWidth, baseHeight, photoBox, frameStyle, {
          guestName,
          caption,
          dateStr,
          eventTitle,
          hashtag,
        });

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
}

function getPhotoBox(width: number, height: number, frame: FrameStyle) {
  switch (frame) {
    case 'polaroid':
      // Classic polaroid: square-ish photo, big bottom chin
      return {
        x: 64,
        y: 64,
        w: width - 128,
        h: height - 260,
      };
    case 'film35mm':
      // 35mm film strip with sprockets top and bottom
      return {
        x: 60,
        y: 140,
        w: width - 120,
        h: height - 280,
      };
    case 'gold_luxury':
      return {
        x: 60,
        y: 60,
        w: width - 120,
        h: height - 230,
      };
    case 'kraft':
      return {
        x: 70,
        y: 70,
        w: width - 140,
        h: height - 240,
      };
    case 'editorial':
    default:
      return {
        x: 48,
        y: 48,
        w: width - 96,
        h: height - 210,
      };
  }
}

function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameStyle
) {
  if (frame === 'polaroid') {
    // Warm vintage white cardstock
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, w, h);
    // Subtle textured paper noise
    addPaperTexture(ctx, w, h, 0.02);
  } else if (frame === 'film35mm') {
    // Dark analog film base
    ctx.fillStyle = '#1A1817';
    ctx.fillRect(0, 0, w, h);
  } else if (frame === 'gold_luxury') {
    // Rich cream with champagne gold foil border
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(0, 0, w, h);
  } else if (frame === 'kraft') {
    // Vintage kraft brown paper
    ctx.fillStyle = '#DFD2BE';
    ctx.fillRect(0, 0, w, h);
    addPaperTexture(ctx, w, h, 0.05);
  } else {
    // Editorial crisp warm white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }
}

function drawFrameForeground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  box: { x: number; y: number; w: number; h: number },
  frame: FrameStyle,
  info: {
    guestName: string;
    caption: string;
    dateStr: string;
    eventTitle: string;
    hashtag: string;
  }
) {
  ctx.save();

  if (frame === 'polaroid') {
    // Subtle inner shadow on photo cutout
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // Bottom handwritten caption
    const textY = box.y + box.h + 80;
    ctx.fillStyle = '#2C2825';
    ctx.textAlign = 'center';

    if (info.caption) {
      ctx.font = '36px "Caveat", cursive, sans-serif';
      ctx.fillText(`"${info.caption}"`, w / 2, textY);
    } else {
      ctx.font = '34px "Playfair Display", Georgia, serif';
      ctx.fillText(info.eventTitle, w / 2, textY);
    }

    // Secondary subtext: guest name & date
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#7C746E';
    const subtext = `${info.guestName ? `Oleh: ${info.guestName} • ` : ''}${info.dateStr} • ${info.hashtag}`;
    ctx.fillText(subtext, w / 2, textY + 54);
  } else if (frame === 'film35mm') {
    // Draw 35mm film sprockets (top and bottom)
    drawFilmSprockets(ctx, w, h);

    // Film edge codes
    ctx.fillStyle = '#E89838';
    ctx.font = 'bold 20px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`▶ KODAK 400 • ISO 400 • EXP ${Math.floor(Math.random() * 24 + 1)}`, 70, 115);
    ctx.textAlign = 'right';
    ctx.fillText(`${info.eventTitle.toUpperCase()}`, w - 70, 115);

    // Bottom caption
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E5E0D8';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    const botText = `${info.caption ? `"${info.caption}" ` : ''}${info.guestName ? `[Snap by ${info.guestName}]` : ''}`;
    ctx.fillText(botText || info.hashtag, w / 2, h - 60);
  } else if (frame === 'gold_luxury') {
    // Double gold foil pinstripe border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, w - 48, h - 48);
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Gold accent corners
    drawGoldCorners(ctx, 24, 24, w - 48, h - 48);

    // Bottom elegant text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#DFCCA2';
    ctx.font = 'italic 34px "Playfair Display", Georgia, serif';
    ctx.fillText(info.eventTitle, w / 2, box.y + box.h + 65);

    ctx.fillStyle = '#A39985';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${info.guestName ? `${info.guestName} • ` : ''}${info.dateStr} • ${info.hashtag}`,
      w / 2,
      box.y + box.h + 105
    );
  } else if (frame === 'kraft') {
    // Kraft paper border with vintage stamp
    ctx.strokeStyle = 'rgba(92, 70, 48, 0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#46382C';
    ctx.font = '36px "Caveat", cursive, sans-serif';
    ctx.fillText(info.caption || info.eventTitle, w / 2, box.y + box.h + 75);

    ctx.font = '22px "Space Mono", monospace';
    ctx.fillStyle = '#6E5C4E';
    ctx.fillText(`SNAPSHOT // ${info.guestName.toUpperCase() || 'GUEST'} // ${info.dateStr}`, w / 2, box.y + box.h + 120);
  } else {
    // Clean editorial frame
    ctx.strokeStyle = '#EBE7DE';
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1F1E1C';
    ctx.font = 'bold 26px "Playfair Display", serif';
    ctx.fillText(info.eventTitle, box.x, box.y + box.h + 60);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#7A756D';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(info.dateStr, box.x + box.w, box.y + box.h + 60);

    if (info.caption) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#4A463F';
      ctx.font = 'italic 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`"${info.caption}" — ${info.guestName || 'Tamu'}`, box.x, box.y + box.h + 100);
    }
  }

  ctx.restore();
}

function drawFilmSprockets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const holeWidth = 24;
  const holeHeight = 36;
  const holeRadius = 6;
  const gap = 38;

  ctx.fillStyle = '#080808';

  // Top sprockets
  for (let x = 30; x < w - 30; x += holeWidth + gap) {
    drawRoundedRect(ctx, x, 32, holeWidth, holeHeight, holeRadius);
  }

  // Bottom sprockets
  for (let x = 30; x < w - 30; x += holeWidth + gap) {
    drawRoundedRect(ctx, x, h - 68, holeWidth, holeHeight, holeRadius);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawGoldCorners(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const len = 30;
  ctx.strokeStyle = '#F0D478';
  ctx.lineWidth = 3;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - 6, y + len);
  ctx.lineTo(x - 6, y - 6);
  ctx.lineTo(x + len, y - 6);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w + 6 - len, y - 6);
  ctx.lineTo(x + w + 6, y - 6);
  ctx.lineTo(x + w + 6, y - 6 + len);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - 6, y + h + 6 - len);
  ctx.lineTo(x - 6, y + h + 6);
  ctx.lineTo(x - 6 + len, y + h + 6);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w + 6 - len, y + h + 6);
  ctx.lineTo(x + w + 6, y + h + 6);
  ctx.lineTo(x + w + 6, y + h + 6);
  ctx.stroke();
}

function applyPhotoFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filter: PhotoFilter
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  if (filter === 'kodak90s') {
    // Warm retro tint, high contrast, golden yellow lift
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      r = r * 1.15 + 10;
      g = g * 1.05 + 5;
      b = b * 0.88 - 5;

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }
  } else if (filter === 'fuji_clean') {
    // Crisp green/cyan tone, clean modern editorial
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * 0.98);
      d[i + 1] = Math.min(255, d[i + 1] * 1.08 + 4);
      d[i + 2] = Math.min(255, d[i + 2] * 1.1 + 8);
    }
  } else if (filter === 'bw_noir') {
    // Rich contrast black and white
    for (let i = 0; i < d.length; i += 4) {
      const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // High contrast S-curve
      const contrast = 1.25;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const val = Math.min(255, Math.max(0, factor * (avg - 128) + 128));

      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
  } else if (filter === 'golden_hour') {
    // Dreamy sunset warmth
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * 1.2 + 20);
      d[i + 1] = Math.min(255, d[i + 1] * 1.08 + 10);
      d[i + 2] = Math.min(255, d[i + 2] * 0.85);
    }
  } else if (filter === 'vintage_warm') {
    // Sepia faded warmth
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189 + 15);
      d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  }

  // Add subtle analog film grain
  for (let i = 0; i < d.length; i += 4) {
    const grain = (Math.random() - 0.5) * 16;
    d[i] = Math.min(255, Math.max(0, d[i] + grain));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + grain));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + grain));
  }

  ctx.putImageData(imgData, 0, 0);
}

function addPaperTexture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  alpha: number
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * alpha;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  offsetX: number = 0.5,
  offsetY: number = 0.5
) {
  let nw = img.naturalWidth;
  let nh = img.naturalHeight;
  let ar = nw / nh;
  let targetAr = w / h;

  let sx = 0;
  let sy = 0;
  let sw = nw;
  let sh = nh;

  if (ar > targetAr) {
    sw = nh * targetAr;
    sx = (nw - sw) * offsetX;
  } else {
    sh = nw / targetAr;
    sy = (nh - sh) * offsetY;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
