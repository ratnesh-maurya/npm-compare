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
                <div className="flex items-center border-4 border-black shadow-[4px_4px_0_0_#000] bg-white transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[2px_2px_0_0_#000]">
                    <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-black ml-4 font-bold" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Search for npm packages..."
                        className="flex-1 py-3 sm:py-4 px-3 sm:px-4 focus:outline-none text-base sm:text-lg font-bold text-black placeholder-gray-500 bg-transparent uppercase"
                    />
                    {isLoading && (
                        <div className="pr-4">
                            <LoadingSpinner size="sm" color="black" />
                        </div>
                    )}
                </div>
                {suggestions.length > 0 && (
                    <ul
                        className="absolute z-10 w-full mt-2 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] max-h-96 overflow-y-auto"
                        onScroll={handleScroll}
                    >
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion}
                                className="px-4 py-3 hover:bg-yellow-200 cursor-pointer text-base font-bold text-black border-b-4 border-black last:border-b-0 uppercase transition-colors"
                                onClick={() => handlePackageSelect(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                        {isLoading && (
                            <li className="px-4 py-3 flex items-center justify-center font-bold text-black uppercase bg-gray-100">
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
                            className="flex items-center bg-[#D8E2DC] text-black border-4 border-black px-4 py-2 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all"
                        >
                            <span className="text-base font-black uppercase tracking-wider">{pkg.name}</span>
                            <button
                                onClick={() => removePackage(pkg.name)}
                                className="ml-3 bg-black text-white hover:bg-red-500 w-6 h-6 flex items-center justify-center font-black transition-colors"
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
