'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PackageData } from './types';

const PackageInput = dynamic(() => import('./components/PackageInput'), { ssr: false });
const PackageComparison = dynamic(() => import('./components/PackageComparison'), { ssr: false });
const Toaster = dynamic(() => import('react-hot-toast').then(mod => mod.Toaster), { ssr: false });

type Ecosystem = 'npm' | 'go' | 'elixir';

export default function Home() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [ecosystem, setEcosystem] = useState<Ecosystem>('npm');

  return (
    <main className="min-h-screen bg-[#FDF6E3] text-gray-900 border-x-8 border-black max-w-7xl mx-auto shadow-[16px_0_0_0_rgba(0,0,0,0.1),-16px_0_0_0_rgba(0,0,0,0.1)]">
      <div className="border-b-8 border-black p-6 bg-[#FEFBF6]">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl font-black mb-4 uppercase tracking-tighter" style={{ textShadow: '4px 4px 0 #A1D0C9' }}>
            Package Comparer
          </h1>
          <p className="text-xl font-bold uppercase tracking-widest border-2 border-black inline-block px-4 py-2 bg-yellow-100 shadow-[4px_4px_0_0_#000]">
            Analyze ecosystem dependencies side by side
          </p>
        </div>
      </div>

      <div className="flex border-b-8 border-black divide-x-8 divide-black bg-[#E9E4DC] overflow-x-auto font-bold uppercase tracking-wider">
        <button
          onClick={() => setEcosystem('npm')}
          className={`flex-1 py-4 px-6 text-center hover:bg-yellow-200 transition-colors ${ecosystem === 'npm' ? 'bg-yellow-300 shadow-[inset_0_-8px_0_0_#000]' : ''}`}
        >
          NPM (JS/TS)
        </button>
        <button
          onClick={() => setEcosystem('go')}
          className={`flex-1 py-4 px-6 text-center hover:bg-blue-200 transition-colors ${ecosystem === 'go' ? 'bg-blue-300 shadow-[inset_0_-8px_0_0_#000]' : ''}`}
        >
          Go (Golang)
        </button>
        <button
          onClick={() => setEcosystem('elixir')}
          className={`flex-1 py-4 px-6 text-center hover:bg-purple-200 transition-colors ${ecosystem === 'elixir' ? 'bg-purple-300 shadow-[inset_0_-8px_0_0_#000]' : ''}`}
        >
          Elixir (Hex)
        </button>
      </div>

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
            <h2 className="text-2xl font-bold mb-4 uppercase flex items-center gap-2">
              <span className="w-4 h-4 bg-black inline-block"></span>
              {ecosystem} Package Search
            </h2>
            {ecosystem === 'npm' ? (
              <PackageInput onPackagesChange={setPackages} />
            ) : (
              <div className="p-8 border-4 border-dashed border-gray-400 text-center font-bold text-gray-500 uppercase">
                {ecosystem} Comparer is currently under development based on the new architecture plan.
              </div>
            )}
          </div>

          {packages.length === 0 && ecosystem === 'npm' ? (
            <div className="mt-12 text-center">
              <div className="inline-block p-12 border-8 border-black bg-[#D8E2DC] shadow-[12px_12px_0_0_#000] rotate-1 hover:rotate-0 transition-transform">
                <div className="text-7xl mb-6">📊</div>
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Start Comparing Packages
                </h2>
                <p className="text-lg text-gray-800 max-w-md mx-auto leading-relaxed mt-4 font-bold">
                  Search for npm packages above to begin your comparison journey. Get detailed insights about package sizes, dependencies, and more.
                </p>
                <div className="mt-8 text-sm text-gray-600 font-bold bg-white border-2 border-black inline-block px-4 py-2 shadow-[4px_4px_0_0_#000]">
                  Try searching for popular packages like &quot;react&quot;, &quot;lodash&quot;, or &quot;axios&quot;
                </div>
              </div>
            </div>
          ) : ecosystem === 'npm' ? (
            <div className="mt-8">
              <PackageComparison packages={packages} />
            </div>
          ) : null}
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 0 #000',
            fontWeight: 'bold',
            borderRadius: '0',
            textTransform: 'uppercase',
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
