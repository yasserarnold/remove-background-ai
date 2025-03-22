import React, { useState, useCallback, useEffect } from 'react';
import { Moon, Sun, Upload, Download, Image as ImageIcon, Trash2, XCircle, HelpCircle, Eraser } from 'lucide-react';

const API_KEY = 'VmJGpWq1EW9zFUxvQ1Su82Lh';
const API_URL = 'https://api.remove.bg/v1.0/removebg';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setProcessedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
    setOriginalFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      setError('Please upload a valid image file');
    }
  }, [handleImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const removeBackground = useCallback(async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image_file', originalFile);
    formData.append('size', 'auto');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to remove background. Please try again.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [originalFile]);

  const resetImage = useCallback(() => {
    setSelectedImage(null);
    setProcessedImage(null);
    setError(null);
    setOriginalFile(null);
  }, []);

  const cancelProcessing = useCallback(() => {
    setIsProcessing(false);
    setError(null);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="fixed w-full top-0 z-50 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Eraser className="w-5 h-5 text-white transform -rotate-90" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              RemoveBG AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onMouseEnter={() => setShowTooltip('help')}
              onMouseLeave={() => setShowTooltip(null)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
            >
              <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              {showTooltip === 'help' && (
                <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm">
                  Upload an image and let AI remove its background automatically!
                </div>
              )}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6 text-gray-200" />
              ) : (
                <Moon className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
            Remove Image Background
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Remove backgrounds from images in seconds with AI-powered precision
          </p>
        </section>

        {/* Upload Section */}
        <section className="max-w-2xl mx-auto mb-16">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isHovering
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsHovering(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsHovering(true);
            }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={processedImage || selectedImage}
                  alt="Selected"
                  className="max-h-[400px] mx-auto rounded-lg"
                  loading="lazy"
                />
                {error && (
                  <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="flex justify-center gap-4">
                  {!processedImage && !isProcessing && (
                    <button
                      onClick={removeBackground}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                    >
                      Remove Background
                    </button>
                  )}
                  {isProcessing && (
                    <div className="flex gap-4">
                      <div className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center">
                        <span className="animate-pulse">Processing...</span>
                      </div>
                      <button
                        onClick={cancelProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                  {processedImage && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = processedImage;
                        link.download = 'removed-background.png';
                        link.click();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={resetImage}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    New Project
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  Drop your image here
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                  <span className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center mx-auto inline-flex transition-colors">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Image
                  </span>
                </label>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { number: '10M+', label: 'Images Processed Monthly' },
            { number: '100%', label: 'Removal Accuracy' },
            { number: '5M+', label: 'Happy Users' }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg transition-transform hover:scale-105"
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">
            Perfect for Every Need
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { title: 'Products', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200' },
              { title: 'People', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
              { title: 'Cars', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200' },
              { title: 'Real Estate', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200' },
              { title: 'Animals', image: 'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=200' },
              { title: 'Graphics', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200' }
            ].map((useCase, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden group cursor-pointer transition-transform hover:scale-105"
              >
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-24 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                  <span className="text-white text-sm font-medium">{useCase.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
          © 2025 RemoveBG AI By Yasser Arafa. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;