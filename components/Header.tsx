
import React from 'react';

type Page = 'analyzer' | 'explanation';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg w-full sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h1 className="text-2xl font-bold tracking-tight text-white">
            Image Analysis Tool
            </h1>
        </div>
        <nav className="flex items-center space-x-2">
            <NavButton isActive={currentPage === 'analyzer'} onClick={() => onNavigate('analyzer')}>
                Analyzer
            </NavButton>
            <NavButton isActive={currentPage === 'explanation'} onClick={() => onNavigate('explanation')}>
                How It Works
            </NavButton>
        </nav>
      </div>
    </header>
  );
};
