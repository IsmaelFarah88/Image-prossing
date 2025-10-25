
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageAnalysisDisplay } from './components/ImageAnalysisDisplay';
import { analyzeImage } from './services/imageAnalyzer';
import type { AnalysisResult } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExplanationPage } from './components/ExplanationPage';

type Page = 'analyzer' | 'explanation';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('analyzer');

  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      try {
        const analysisResult = await analyzeImage(src);
        setAnalysis(analysisResult);
      } catch (err) {
        setError('Failed to analyze the image. Please try a different one.');
        setImageSrc(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = () => {
    setImageSrc(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  const renderPage = () => {
    if (currentPage === 'explanation') {
      return <ExplanationPage />;
    }

    return (
      <>
        {!imageSrc && !isLoading && <ImageUploader onImageUpload={handleImageUpload} />}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg">Analyzing your image...</p>
            <p className="text-sm text-gray-400">This may take a moment for larger images.</p>
          </div>
        )}

        {error && (
          <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {imageSrc && analysis && (
          <ImageAnalysisDisplay 
            imageSrc={imageSrc} 
            analysis={analysis}
            onReset={handleReset} 
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200 font-sans">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
