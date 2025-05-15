'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
        <div className="space-y-4">
            <div className="relative">
                <div className="flex items-center border-2 border-gray-200 rounded-xl shadow-sm bg-white">
                    <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-3" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Search for npm packages..."
                        className="flex-1 py-2 sm:py-3 px-3 sm:px-4 focus:outline-none text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-transparent"
                    />
                    {isLoading && (
                        <div className="pr-3">
                            <LoadingSpinner size="sm" color="blue" />
                        </div>
                    )}
                </div>
                {suggestions.length > 0 && (
                    <ul
                        className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto"
                        onScroll={handleScroll}
                    >
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion}
                                className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer text-sm sm:text-base text-gray-900 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                onClick={() => handlePackageSelect(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                        {isLoading && (
                            <li className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center text-sm sm:text-base text-gray-500">
                                <LoadingSpinner size="sm" color="gray" />
                                <span className="ml-2">Loading more packages...</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {selectedPackages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedPackages.map((pkg) => (
                        <div
                            key={pkg.name}
                            className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200"
                        >
                            <span className="text-sm sm:text-base font-medium">{pkg.name}</span>
                            <button
                                onClick={() => removePackage(pkg.name)}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-bold transition-colors duration-200"
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
