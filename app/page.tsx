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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
            NPM Package Comparator
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Compare npm packages side by side. Analyze versions, dependencies, downloads, and more...
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <PackageInput onPackagesChange={setPackages} />

          {packages.length === 0 ? (
            <div className="mt-12 sm:mt-16 text-center">
              <div className="inline-block p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">Start Comparing Packages</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Search for npm packages above to begin your comparison journey
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 sm:mt-8">
              <PackageComparison packages={packages} />
            </div>
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
}