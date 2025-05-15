'use client';

import { useState } from 'react';
import PackageInput from './components/PackageInput';
import PackageComparison from './components/PackageComparison';
import { Toaster } from 'react-hot-toast';
import { PackageData } from './types';

export default function Home() {
  const [packages, setPackages] = useState<PackageData[]>([]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px] animate-[grid_20s_linear_infinite]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(120,119,198,0.05),rgba(255,255,255,0))] animate-pulse-slower" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 p-2 px-4 mb-4 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 text-sm font-medium shadow-sm animate-fade-in-up [animation-delay:200ms]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Compare npm packages with ease</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 animate-fade-in-up [animation-delay:400ms]">
            NPM Package Comparator
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:600ms]">
            Compare npm packages side by side. Analyze versions, dependencies, downloads, and more...
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative z-10 animate-fade-in-up [animation-delay:800ms]">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse-slow"></div>
            <div className="relative">
              <PackageInput onPackagesChange={setPackages} />
            </div>
          </div>

          {packages.length === 0 ? (
            <div className="mt-12 sm:mt-16 text-center animate-fade-in-up [animation-delay:1000ms] relative z-0">
              <div className="inline-block p-8 sm:p-10 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>
                  <div className="relative text-5xl sm:text-7xl mb-4 transform hover:scale-110 transition-transform duration-300 animate-float">🔍</div>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 animate-fade-in-up [animation-delay:1200ms]">
                  Start Comparing Packages
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed animate-fade-in-up [animation-delay:1400ms]">
                  Search for npm packages above to begin your comparison journey. Get detailed insights about package sizes, dependencies, and more.
                </p>
                <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500 animate-fade-in-up [animation-delay:1600ms]">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
                <div className="mt-6 text-xs text-gray-400 animate-fade-in-up [animation-delay:1800ms]">
                  Try searching for popular packages like &quot;react&quot;, &quot;lodash&quot;, or &quot;axios&quot;
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 sm:mt-8 animate-fade-in-up [animation-delay:1000ms]">
              <PackageComparison packages={packages} />
            </div>
          )}
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          duration: 3000,
        }}
      />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes grid {
          0% { background-position: 0 0; }
          100% { background-position: 14px 24px; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slower {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-gradient {
          animation: gradient 15s ease infinite;
          background-size: 200% 200%;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}