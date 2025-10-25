export type ReconstructionStyle = 'mosaic' | 'circles' | 'paletteQuantization';

export interface HistogramDataPoint {
  intensity: number;
  r: number;
  g: number;
  b: number;
}

export interface ColorPaletteItem {
  hex: string;
  count: number;
}

export interface ImageProperties {
  width: number;
  height: number;
  pixelCount: number;
}

export interface AnalysisResult {
  properties: ImageProperties;
  histogram: HistogramDataPoint[];
  palette: ColorPaletteItem[];
}