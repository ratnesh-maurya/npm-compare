'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Ecosystem, PackageData } from './types';

const PackageInput = dynamic(() => import('./components/PackageInput'), { ssr: false });
const PackageComparison = dynamic(() => import('./components/PackageComparison'), { ssr: false });
const GoElixirTool = dynamic(() => import('./components/GoElixirTool'), { ssr: false });
const GenericComparison = dynamic(() => import('./components/GenericComparison'), { ssr: false });
const Toaster = dynamic(() => import('react-hot-toast').then((mod) => mod.Toaster), { ssr: false });

export default function Home() {
  const [packagesByEcosystem, setPackagesByEcosystem] = useState<Record<Ecosystem, PackageData[]>>({
    npm: [],
    go: [],
    elixir: [],
  });
  const [ecosystem, setEcosystem] = useState<Ecosystem>('npm');

  const packages = packagesByEcosystem[ecosystem];

  const updatePackages = (nextPackages: PackageData[]) => {
    setPackagesByEcosystem((prev) => ({
      ...prev,
      [ecosystem]: nextPackages,
    }));
  };

  const labels: Record<Ecosystem, { title: string; subtitle: string }> = {
    npm: {
      title: 'NPM Package Analysis',
      subtitle: 'Compare package size, versions, dependencies, and usage trends.',
    },
    go: {
      title: 'Go Module Analysis',
      subtitle: 'Inspect module versions, dependencies, and update timelines.',
    },
    elixir: {
      title: 'Elixir Hex Analysis',
      subtitle: 'Review Hex package metadata, dependencies, and downloads.',
    },
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
            Multi-Ecosystem Comparator
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">Package Comparison Dashboard</h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Compare npm, Go modules, and Elixir Hex packages in one place with a consistent workflow.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => setEcosystem('npm')}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${ecosystem === 'npm'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
          >
            NPM (JS/TS)
          </button>
          <button
            onClick={() => setEcosystem('go')}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${ecosystem === 'go'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
          >
            Go (Golang)
          </button>
          <button
            onClick={() => setEcosystem('elixir')}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${ecosystem === 'elixir'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
          >
            Elixir (Hex)
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{labels[ecosystem].title}</h2>
          <p className="mt-2 text-slate-600">{labels[ecosystem].subtitle}</p>
        </div>

        <div className="mt-6">
          {ecosystem === 'npm' ? (
            <PackageInput onPackagesChange={updatePackages} />
          ) : (
            <GoElixirTool
              ecosystem={ecosystem}
              packages={packages}
              onPackagesChange={updatePackages}
            />
          )}
        </div>

        <div className="mt-8">
          {ecosystem === 'npm' ? (
            packages.length > 0 ? (
              <PackageComparison packages={packages} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <h3 className="text-xl font-semibold text-slate-800">Start comparing npm packages</h3>
                <p className="mt-2 text-slate-600">
                  Search and select packages above to view size, version, and download insights.
                </p>
              </div>
            )
          ) : (
            <GenericComparison
              packages={packages}
              ecosystemLabel={ecosystem === 'go' ? 'Go module' : 'Hex'}
            />
          )}
        </div>
      </section>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            fontWeight: '500',
            borderRadius: '12px',
          },
          duration: 3000,
        }}
      />
    </main>
  );
}
