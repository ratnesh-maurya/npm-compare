'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Ecosystem, PackageData } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface GoElixirToolProps {
  ecosystem: Extract<Ecosystem, 'go' | 'elixir'>;
  packages: PackageData[];
  onPackagesChange: (packages: PackageData[]) => void;
}

interface GoSearchResult {
  path: string;
  synopsis: string;
  version: string;
}

interface HexSearchResult {
  name: string;
  description: string;
  version: string;
}

type SearchResult =
  | { type: 'go'; path: string; synopsis: string }
  | { type: 'elixir'; name: string; description: string };

interface HexPackageResponse {
  name: string;
  meta?: {
    description?: string;
    licenses?: string[];
    links?: Record<string, string>;
  };
  downloads?: { all?: number; recent?: number };
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
    if (!line || line.startsWith('//') || line === ')' || line === 'require (') continue;
    if (line.startsWith('require ')) {
      const single = line.replace(/^require\s+/, '').split(/\s+/);
      if (single.length >= 2) dependencies[single[0]] = single[1];
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
  if (!latestResponse.ok) throw new Error('Go module not found');

  const latestData: GoLatestResponse = await latestResponse.json();

  let dependencies: Record<string, string> = {};
  try {
    const modResponse = await fetch(
      `https://proxy.golang.org/${encodedPath}/@v/${latestData.Version}.mod`
    );
    if (modResponse.ok) {
      dependencies = parseGoModDependencies(await modResponse.text());
    }
  } catch {
    // best-effort
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
    time: { created: latestData.Time, modified: latestData.Time },
    dependencies,
  };
}

async function fetchHexPackage(packageName: string): Promise<PackageData> {
  const pkgResponse = await fetch(
    `https://hex.pm/api/packages/${encodeURIComponent(packageName)}`
  );
  if (!pkgResponse.ok) throw new Error('Hex package not found');

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
    // best-effort
  }

  const links = pkgData.meta?.links ?? {};
  const repository =
    links.GitHub ?? links.github ?? links.Repository ?? links.repository ?? links.Homepage ?? '';
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
    time: { created: pkgData.inserted_at ?? updatedAt, modified: updatedAt },
    downloads: {
      weekly: pkgData.downloads?.recent ?? 0,
      monthly: pkgData.downloads?.recent ? pkgData.downloads.recent * 4 : 0,
      total: pkgData.downloads?.all ?? 0,
    },
    dependencies,
  };
}

export default function GoElixirTool({ ecosystem, packages, onPackagesChange }: GoElixirToolProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = {
    go: {
      placeholder: 'Search Go modules, e.g. gin, cobra, zerolog…',
      hint: 'Searches pkg.go.dev. Use the full module path if needed.',
    },
    elixir: {
      placeholder: 'Search Hex packages, e.g. phoenix, ecto…',
      hint: 'Searches hex.pm packages by name.',
    },
  };

  const searchPackages = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const endpoint =
        ecosystem === 'go'
          ? `/api/go-search?q=${encodeURIComponent(query)}`
          : `/api/hex-search?q=${encodeURIComponent(query)}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        setSuggestions([]);
        return;
      }

      if (ecosystem === 'go') {
        const data: { results: GoSearchResult[] } = await res.json();
        setSuggestions(
          data.results.map((r) => ({ type: 'go' as const, path: r.path, synopsis: r.synopsis }))
        );
      } else {
        const data: { results: HexSearchResult[] } = await res.json();
        setSuggestions(
          data.results.map((r) => ({
            type: 'elixir' as const,
            name: r.name,
            description: r.description,
          }))
        );
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void searchPackages(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelect = async (identifier: string) => {
    setSuggestions([]);
    setInputValue('');

    if (packages.some((pkg) => pkg.name.toLowerCase() === identifier.toLowerCase())) {
      toast.error('Package already added');
      return;
    }

    setIsAdding(true);
    try {
      const pkg =
        ecosystem === 'go'
          ? await fetchGoModule(identifier)
          : await fetchHexPackage(identifier);
      onPackagesChange([...packages, pkg]);
      toast.success(`${pkg.name} added`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add package');
    } finally {
      setIsAdding(false);
    }
  };

  const removePackage = (name: string) => {
    onPackagesChange(packages.filter((pkg) => pkg.name !== name));
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
          <MagnifyingGlassIcon className="ml-4 h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={config[ecosystem].placeholder}
            className="flex-1 bg-transparent px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {(isSearching || isAdding) && (
            <div className="pr-4">
              <LoadingSpinner size="sm" color="black" />
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            {suggestions.map((result) => {
              const id = result.type === 'go' ? result.path : result.name;
              const label = id;
              const sub = result.type === 'go' ? result.synopsis : result.description;
              return (
                <li
                  key={id}
                  className="cursor-pointer border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-blue-50"
                  onClick={() => void handleSelect(id)}
                >
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  {sub && <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{sub}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-500">{config[ecosystem].hint}</p>

      {packages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5"
            >
              <span className="text-sm font-medium text-slate-700">{pkg.name}</span>
              <button
                type="button"
                onClick={() => removePackage(pkg.name)}
                className="ml-2 rounded-full px-2 text-slate-500 transition-colors hover:text-red-600"
                aria-label={`Remove ${pkg.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
