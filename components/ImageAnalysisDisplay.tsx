import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { AnalysisResult, ReconstructionStyle } from '../types';
import { HistogramChart } from './HistogramChart';
import { ColorPalette } from './ColorPalette';
import { reconstructAsMosaic, reconstructAsCircles, reconstructWithPalette } from '../services/imageAnalyzer';

interface ImageAnalysisDisplayProps {
  imageSrc: string;
  analysis: AnalysisResult;
  onReset: () => void;
}

const ControlButton: React.FC<{ active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, disabled, onClick, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
      active
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step?: number; disabled?: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, min, max, step = 1, disabled, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-400 mb-1">{label}: <span className="font-semibold text-gray-200">{value}</span></label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
    />
  </div>
);

export const ImageAnalysisDisplay: React.FC<ImageAnalysisDisplayProps> = ({ imageSrc, analysis, onReset }) => {
  const [reconstructionStyle, setReconstructionStyle] = useState<ReconstructionStyle>('mosaic');
  
  const [blockSize, setBlockSize] = useState(20);
  const [numCircles, setNumCircles] = useState(15000);
  const [minRadius, setMinRadius] = useState(1);
  const [maxRadius, setMaxRadius] = useState(5);
  
  const [isAnalysisVisible, setAnalysisVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number>(0);

  const drawReconstruction = useCallback(async (isReplay: boolean = false) => {
    if (!isReplay && isAnimating) return;
    
    cancelAnimationFrame(animationFrameId.current);
    const animationId = Date.now();
    animationFrameId.current = animationId;

    const isCancelled = () => animationFrameId.current !== animationId;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.complete || img.naturalHeight === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setIsAnimating(true);
    setProgress(0);

    try {
      if (reconstructionStyle === 'mosaic') {
        await reconstructAsMosaic(ctx, img, blockSize, setProgress, isCancelled);
      } else if (reconstructionStyle === 'circles') {
        await reconstructAsCircles(ctx, img, numCircles, minRadius, maxRadius, setProgress, isCancelled);
      } else if (reconstructionStyle === 'paletteQuantization') {
        await reconstructWithPalette(ctx, img, analysis.palette, setProgress, isCancelled);
      }
    } catch(e) {
      console.error("Reconstruction failed:", e);
    } finally {
      if (!isCancelled()) {
        setIsAnimating(false);
        setProgress(1);
      }
    }
  }, [reconstructionStyle, blockSize, numCircles, minRadius, maxRadius, analysis.palette, isAnimating]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      drawReconstruction();
    };
  }, [imageSrc]);

  useEffect(() => {
    drawReconstruction();
  }, [blockSize, numCircles, minRadius, maxRadius, reconstructionStyle]);


  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center">Original Image</h2>
          <div className="bg-gray-800 p-2 rounded-lg shadow-lg w-full">
            <img src={imageSrc} alt="User upload" className="w-full h-auto object-contain rounded" />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-center">Reconstructed Image</h2>
          <div className="bg-gray-800 p-2 rounded-lg shadow-lg w-full relative">
            <canvas ref={canvasRef} className="w-full h-auto object-contain rounded" />
            {isAnimating && (
                <div className="absolute bottom-2 left-2 right-2 px-2">
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Reconstruction Controls</h3>
            <button
                onClick={() => drawReconstruction(true)}
                disabled={isAnimating}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
                </svg>
                Replay Animation
            </button>
        </div>
        <div className="flex items-center gap-4">
          <ControlButton active={reconstructionStyle === 'mosaic'} onClick={() => setReconstructionStyle('mosaic')} disabled={isAnimating}>Mosaic</ControlButton>
          <ControlButton active={reconstructionStyle === 'circles'} onClick={() => setReconstructionStyle('circles')} disabled={isAnimating}>Circles</ControlButton>
          <ControlButton active={reconstructionStyle === 'paletteQuantization'} onClick={() => setReconstructionStyle('paletteQuantization')} disabled={isAnimating}>Palette</ControlButton>
        </div>
        
        <div className="pt-2">
            {reconstructionStyle === 'mosaic' && (
              <div className="animate-fade-in">
                <Slider label="Block Size" value={blockSize} min={4} max={100} onChange={e => setBlockSize(Number(e.target.value))} disabled={isAnimating} />
              </div>
            )}
            {reconstructionStyle === 'circles' && (
              <div className="animate-fade-in grid md:grid-cols-3 gap-4">
                <Slider label="Number of Circles" value={numCircles} min={1000} max={50000} step={100} onChange={e => setNumCircles(Number(e.target.value))} disabled={isAnimating} />
                <Slider label="Min Radius" value={minRadius} min={0.5} max={10} step={0.5} onChange={e => setMinRadius(Number(e.target.value))} disabled={isAnimating} />
                <Slider label="Max Radius" value={maxRadius} min={1} max={20} step={0.5} onChange={e => setMaxRadius(Number(e.target.value))} disabled={isAnimating} />
              </div>
            )}
            {reconstructionStyle === 'paletteQuantization' && (
                <div className="animate-fade-in text-sm text-gray-400">
                    <p>This mode reconstructs the image using only the 10 most dominant colors found. No additional controls are needed.</p>
                </div>
            )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-white font-semibold"
        >
          Analyze Another Image
        </button>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <button onClick={() => setAnalysisVisible(!isAnalysisVisible)} className="text-lg font-semibold w-full text-left flex justify-between items-center">
          <span>Detailed Analysis</span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isAnalysisVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isAnalysisVisible && (
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-8 animate-fade-in">
             <div>
              <h2 className="text-xl font-semibold mb-2">Properties</h2>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li><span className="font-medium text-gray-400">Dimensions:</span> {analysis.properties.width} x {analysis.properties.height} px</li>
                  <li><span className="font-medium text-gray-400">Total Pixels:</span> {analysis.properties.pixelCount.toLocaleString()}</li>
                </ul>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Dominant Colors</h2>
               <ColorPalette palette={analysis.palette} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Color Distribution</h2>
              <div className="bg-gray-800/50 p-4 rounded-lg h-80">
                <HistogramChart data={analysis.histogram} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};