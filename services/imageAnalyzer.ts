import type { AnalysisResult, HistogramDataPoint, ColorPaletteItem } from '../types';

function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

export const analyzeImage = (imageDataUrl: string): Promise<AnalysisResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      const properties = {
        width: img.width,
        height: img.height,
        pixelCount: img.width * img.height,
      };

      const rValues = new Array(256).fill(0);
      const gValues = new Array(256).fill(0);
      const bValues = new Array(256).fill(0);
      
      for (let i = 0; i < data.length; i += 4) {
        rValues[data[i]]++;
        gValues[data[i + 1]]++;
        bValues[data[i + 2]]++;
      }

      const histogram: HistogramDataPoint[] = [];
      for (let i = 0; i < 256; i++) {
        histogram.push({ intensity: i, r: rValues[i], g: gValues[i], b: bValues[i] });
      }

      const colorMap: { [key: string]: number } = {};
      const sampleRate = Math.max(1, Math.floor(properties.pixelCount / 20000));
      
      for (let i = 0; i < data.length; i += 4 * sampleRate) {
        const r = data[i] >> 4;
        const g = data[i + 1] >> 4;
        const b = data[i + 2] >> 4;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }

      const sortedColors = Object.entries(colorMap).sort(([, countA], [, countB]) => countB - countA);
      
      const palette: ColorPaletteItem[] = sortedColors.slice(0, 10).map(([key, count]) => {
        const [r, g, b] = key.split(',').map(v => parseInt(v, 10));
        const hex = rgbToHex(r << 4, g << 4, b << 4);
        return { hex, count };
      });

      resolve({ properties, histogram, palette });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = imageDataUrl;
  });
};

const yieldToBrowser = () => new Promise(resolve => requestAnimationFrame(resolve));

export const reconstructAsMosaic = async (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  blockSize: number,
  onProgress: (progress: number) => void,
  isCancelled: () => boolean
): Promise<void> => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) return;

  tempCanvas.width = img.naturalWidth;
  tempCanvas.height = img.naturalHeight;
  tempCtx.drawImage(img, 0, 0);

  const totalRows = Math.ceil(img.naturalHeight / blockSize);
  let currentRow = 0;

  for (let y = 0; y < img.naturalHeight; y += blockSize) {
    if (isCancelled()) return;
    for (let x = 0; x < img.naturalWidth; x += blockSize) {
      const w = Math.min(blockSize, img.naturalWidth - x);
      const h = Math.min(blockSize, img.naturalHeight - y);
      try {
        const imageData = tempCtx.getImageData(x, y, w, h);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        const pixelCount = data.length / 4;
        if(pixelCount > 0) {
            r = Math.floor(r / pixelCount);
            g = Math.floor(g / pixelCount);
            b = Math.floor(b / pixelCount);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, w, h);
        }
      } catch (e) {
        console.error(`Could not get image data for mosaic tile at ${x},${y}:`, e);
      }
    }
    currentRow++;
    onProgress(currentRow / totalRows);
    await yieldToBrowser();
  }
};

export const reconstructAsCircles = async (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  numCircles: number,
  minRadius: number,
  maxRadius: number,
  onProgress: (progress: number) => void,
  isCancelled: () => boolean
): Promise<void> => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) return;

  tempCanvas.width = img.naturalWidth;
  tempCanvas.height = img.naturalHeight;
  tempCtx.drawImage(img, 0, 0);

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);

  const batchSize = Math.ceil(numCircles / 200); // Aim for ~200 frames

  for (let i = 0; i < numCircles; i++) {
    if (isCancelled()) return;
    
    const x = Math.floor(Math.random() * img.naturalWidth);
    const y = Math.floor(Math.random() * img.naturalHeight);
    
    try {
        const pixel = tempCtx.getImageData(x, y, 1, 1).data;
        const r = pixel[0], g = pixel[1], b = pixel[2];
        
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const radius = minRadius + (maxRadius - minRadius) * brightness;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    } catch(e) { /* ignore */ }
    
    if (i % batchSize === 0) {
      onProgress(i / numCircles);
      await yieldToBrowser();
    }
  }
  onProgress(1);
};


export const reconstructWithPalette = async (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  palette: ColorPaletteItem[],
  onProgress: (progress: number) => void,
  isCancelled: () => boolean
): Promise<void> => {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) return;

  tempCanvas.width = img.naturalWidth;
  tempCanvas.height = img.naturalHeight;
  tempCtx.drawImage(img, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  const data = imageData.data;
  const paletteRgb = palette.map(p => hexToRgb(p.hex)).filter(Boolean) as [number, number, number][];

  if(paletteRgb.length === 0) return;

  const findClosestColor = (r: number, g: number, b: number): [number, number, number] => {
    let minDistance = Infinity;
    let closestColor = paletteRgb[0];
    for (const color of paletteRgb) {
      const distance = Math.sqrt(
        Math.pow(r - color[0], 2) + Math.pow(g - color[1], 2) + Math.pow(b - color[2], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }
    return closestColor;
  };

  const rowsPerBatch = 10;
  const totalRows = img.naturalHeight;
  
  for (let y = 0; y < totalRows; y++) {
    if(isCancelled()) return;
    for (let x = 0; x < img.naturalWidth; x++) {
      const i = (y * img.naturalWidth + x) * 4;
      const closest = findClosestColor(data[i], data[i + 1], data[i + 2]);
      data[i] = closest[0];
      data[i + 1] = closest[1];
      data[i + 2] = closest[2];
    }
    if(y % rowsPerBatch === 0){
        ctx.putImageData(imageData, 0, 0);
        onProgress(y / totalRows);
        await yieldToBrowser();
    }
  }
  ctx.putImageData(imageData, 0, 0);
  onProgress(1);
};