'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PackageData } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface PackageInputProps {
    onPackagesChange: (packages: PackageData[]) => void;
}

interface NpmSearchResult {
    objects: Array<{
        package: {
            name: string;
            version: string;
            description: string;
            repository?: {
                url: string;
            };
            keywords?: string[];
            license?: string;
            author?: {
                name: string;
            };
            maintainers?: Array<{
                name: string;
                email: string;
            }>;
        };
    }>;
}

export default function PackageInput({ onPackagesChange }: PackageInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedPackages, setSelectedPackages] = useState<PackageData[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSuggestions = async (query: string, pageNum: number = 1) => {
        try {
            setIsLoading(true);
            const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=20&from=${(pageNum - 1) * 20}`);
            const data: NpmSearchResult = await response.json();
            const newSuggestions = data.objects.map((pkg) => pkg.package.name);

            if (pageNum === 1) {
                setSuggestions(newSuggestions);
            } else {
                setSuggestions(prev => [...prev, ...newSuggestions]);
            }

            setHasMore(data.objects.length === 20);
            setPage(pageNum);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            toast.error('Failed to fetch package suggestions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setPage(1);
        if (value.length > 2) {
            fetchSuggestions(value, 1);
        } else {
            setSuggestions([]);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
        const target = e.target as HTMLUListElement;
        if (
            target.scrollHeight - target.scrollTop === target.clientHeight &&
            !isLoading &&
            hasMore &&
            inputValue.length > 2
        ) {
            fetchSuggestions(inputValue, page + 1);
        }
    };

    const handlePackageSelect = async (packageName: string) => {
        try {
            const response = await fetch(`https://registry.npmjs.org/${packageName}`);
            const data = await response.json();

            const latestVersion = data['dist-tags'].latest;
            const packageInfo = data.versions[latestVersion];

            const newPackage: PackageData = {
                name: packageName,
                version: latestVersion,
                description: packageInfo.description,
                repository: packageInfo.repository?.url || '',
                keywords: packageInfo.keywords || [],
                license: packageInfo.license || '',
                author: packageInfo.author?.name || '',
                maintainers: packageInfo.maintainers || [],
                time: {
                    created: data.time.created,
                    modified: data.time.modified
                }
            };

            setSelectedPackages([...selectedPackages, newPackage]);
            onPackagesChange([...selectedPackages, newPackage]);
            setInputValue('');
            setSuggestions([]);
        } catch (err) {
            console.error('Error fetching package:', err);
            toast.error(`Failed to fetch package ${packageName}`);
        }
    };

    const removePackage = (packageName: string) => {
        const updatedPackages = selectedPackages.filter(pkg => pkg.name !== packageName);
        setSelectedPackages(updatedPackages);
        onPackagesChange(updatedPackages);
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <MagnifyingGlassIcon className="ml-4 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Search for npm packages..."
                        className="flex-1 bg-transparent px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    {isLoading && (
                        <div className="pr-4">
                            <LoadingSpinner size="sm" color="black" />
                        </div>
                    )}
                </div>
                {suggestions.length > 0 && (
                    <ul
                        className="absolute z-10 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
                        onScroll={handleScroll}
                    >
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion}
                                className="cursor-pointer border-b border-slate-100 px-4 py-3 text-base text-slate-700 transition-colors last:border-b-0 hover:bg-blue-50"
                                onClick={() => handlePackageSelect(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                        {isLoading && (
                            <li className="flex items-center justify-center bg-slate-50 px-4 py-3 text-slate-600">
                                <LoadingSpinner size="sm" color="black" />
                                <span className="ml-2">Loading more...</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {selectedPackages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {selectedPackages.map((pkg) => (
                        <div
                            key={pkg.name}
                            className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5"
                        >
                            <span className="text-sm font-medium text-slate-700">{pkg.name}</span>
                            <button
                                onClick={() => removePackage(pkg.name)}
                                className="ml-2 rounded-full px-2 text-slate-500 transition-colors hover:text-red-600"
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
