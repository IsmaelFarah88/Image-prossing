
import React from 'react';
import type { ColorPaletteItem } from '../types';

interface ColorPaletteProps {
  palette: ColorPaletteItem[];
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ palette }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <div className="flex flex-wrap gap-3">
        {palette.map((color, index) => (
          <div key={index} className="flex flex-col items-center group">
            <div 
              className="w-12 h-12 rounded-md border-2 border-gray-700 shadow-md" 
              style={{ backgroundColor: color.hex }}
            ></div>
            <span className="mt-1 text-xs text-gray-400 group-hover:text-white transition-colors">{color.hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
