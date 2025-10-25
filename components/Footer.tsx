import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-8">
      <div className="container mx-auto px-4 md:px-8 text-center text-gray-500 text-sm">
        <p>Created by Ismael Farah</p>
        <p className="mt-1">Built with React, TypeScript, and Tailwind CSS.</p>
      </div>
    </footer>
  );
};