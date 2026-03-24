'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Ecosystem, PackageData } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface GoElixirToolProps {
  ecosystem: Extract<Ecosystem, 'go' | 'elixir'>;
  packages: PackageData[];
  onPackagesChange: (packages: PackageData[]) => void;
}

interface HexPackageResponse {
  name: string;
  meta?: {
    description?: string;
    licenses?: string[];
    links?: Record<string, string>;
  };
  downloads?: {
    all?: number;
    recent?: number;
  };
  latest_version: string;
  inserted_at?: string;
  updated_at?: string;
}

interface HexReleaseResponse {
  requirements?: Record<string, { requirement: string }>;
}

interface GoLatestResponse {
  Version: string;
  Time: string;
}

function parseGoModDependencies(goMod: string): Record<string, string> {
  const dependencies: Record<string, string> = {};
  const lines = goMod.split('\n').map((line) => line.trim());

  for (const line of lines) {
    if (!line || line.startsWith('//') || line === ')' || line === 'require (') {
      continue;
    }

    if (line.startsWith('require ')) {
      const single = line.replace(/^require\s+/, '').split(/\s+/);
      if (single.length >= 2) {
        dependencies[single[0]] = single[1];
      }
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length >= 2 && parts[0].includes('.')) {
      dependencies[parts[0]] = parts[1];
    }
  }

  return dependencies;
}

async function fetchGoModule(moduleName: string): Promise<PackageData> {
  const encodedPath = moduleName
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

  const latestResponse = await fetch(`https://proxy.golang.org/${encodedPath}/@latest`);
  if (!latestResponse.ok) {
    throw new Error('Go module not found');
  }

  const latestData: GoLatestResponse = await latestResponse.json();

  let dependencies: Record<string, string> = {};
  try {
    const modResponse = await fetch(
      `https://proxy.golang.org/${encodedPath}/@v/${latestData.Version}.mod`
    );
    if (modResponse.ok) {
      const goMod = await modResponse.text();
      dependencies = parseGoModDependencies(goMod);
    }
  } catch {
    // Best-effort dependency parsing for Go modules.
  }

  return {
    ecosystem: 'go',
    name: moduleName,
    version: latestData.Version,
    description: 'Go module package',
    repository: `https://pkg.go.dev/${moduleName}`,
    keywords: ['go', 'module'],
    license: '',
    author: '',
    maintainers: [],
    time: {
      created: latestData.Time,
      modified: latestData.Time,
    },
    dependencies,
  };
}

async function fetchHexPackage(packageName: string): Promise<PackageData> {
  const pkgResponse = await fetch(`https://hex.pm/api/packages/${encodeURIComponent(packageName)}`);
  if (!pkgResponse.ok) {
    throw new Error('Hex package not found');
  }

  const pkgData: HexPackageResponse = await pkgResponse.json();

  let dependencies: Record<string, string> = {};
  try {
    const releaseResponse = await fetch(
      `https://hex.pm/api/packages/${encodeURIComponent(packageName)}/releases/${pkgData.latest_version}`
    );
    if (releaseResponse.ok) {
      const releaseData: HexReleaseResponse = await releaseResponse.json();
      dependencies = Object.fromEntries(
        Object.entries(releaseData.requirements ?? {}).map(([key, value]) => [
          key,
          value.requirement,
        ])
      );
    }
  } catch {
    // Best-effort dependency parsing for Hex packages.
  }

  const links = pkgData.meta?.links ?? {};
  const repository =
    links.GitHub || links.github || links.Repository || links.repository || links.Homepage || '';

  const updatedAt = pkgData.updated_at ?? new Date().toISOString();

  return {
    ecosystem: 'elixir',
    name: pkgData.name,
    version: pkgData.latest_version,
    description: pkgData.meta?.description ?? 'Elixir package from Hex.pm',
    repository,
    keywords: ['elixir', 'hex'],
    license: (pkgData.meta?.licenses ?? []).join(', '),
    author: '',
    maintainers: [],
    time: {
      created: pkgData.inserted_at ?? updatedAt,
      modified: updatedAt,
    },
    downloads: {
      weekly: pkgData.downloads?.recent ?? 0,
      monthly: pkgData.downloads?.recent ? pkgData.downloads.recent * 4 : 0,
      total: pkgData.downloads?.all ?? 0,
    },
    dependencies,
  };
}

export default function GoElixirTool({ ecosystem, packages, onPackagesChange }: GoElixirToolProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const labels = useMemo(
    () => ({
      go: {
        title: 'Go Module Comparator',
        placeholder: 'Enter module path, e.g. github.com/gin-gonic/gin',
        hint: 'Use full module paths from pkg.go.dev.',
      },
      elixir: {
        title: 'Elixir Hex Comparator',
        placeholder: 'Enter Hex package, e.g. phoenix',
        hint: 'Use package names from hex.pm.',
      },
    }),
    []
  );

  const handleAdd = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Please enter a package name');
      return;
    }

    if (packages.some((pkg) => pkg.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Package already added');
      return;
    }

    setIsLoading(true);
    try {
      const nextPackage =
        ecosystem === 'go' ? await fetchGoModule(trimmed) : await fetchHexPackage(trimmed);
      const nextPackages = [...packages, nextPackage];
      onPackagesChange(nextPackages);
      setQuery('');
      toast.success(`${nextPackage.name} added`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add package';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const removePackage = (name: string) => {
    onPackagesChange(packages.filter((pkg) => pkg.name !== name));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{labels[ecosystem].title}</h3>
        <p className="text-sm text-slate-500 mt-1">{labels[ecosystem].hint}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleAdd();
            }
          }}
          placeholder={labels[ecosystem].placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Adding...</span>
            </>
          ) : (
            <>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add
            </>
          )}
        </button>
      </div>

      {packages.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5"
            >
              <span className="text-sm font-medium text-slate-700">{pkg.name}</span>
              <button
                type="button"
                onClick={() => removePackage(pkg.name)}
                className="ml-2 rounded-full px-2 text-slate-500 hover:text-red-600"
                aria-label={`Remove ${pkg.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
