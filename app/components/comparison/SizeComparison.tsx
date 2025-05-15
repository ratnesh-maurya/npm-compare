'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { PackageData } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BundlePhobiaResponse {
    size: number;
    gzip: number;
    dependencySizes: Array<{
        name: string;
        approximateSize: number;
    }>;
}

interface SizeComparisonProps {
    packages: PackageData[];
}

export default function SizeComparison({ packages }: SizeComparisonProps) {
    const [sizeData, setSizeData] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingPackages, setLoadingPackages] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchSizeData = async () => {
            setIsLoading(true);
            const updatedPackages = await Promise.all(
                packages.map(async (pkg) => {
                    try {
                        setLoadingPackages(prev => new Set(prev).add(pkg.name));
                        const response = await fetch(
                            `https://bundlephobia.com/api/size?package=${pkg.name}@${pkg.version}`
                        );
                        const data: BundlePhobiaResponse = await response.json();

                        return {
                            ...pkg,
                            size: {
                                gzip: data.gzip,
                                minified: data.size,
                                total: data.dependencySizes.reduce(
                                    (acc, dep) => acc + dep.approximateSize,
                                    0
                                ),
                            },
                        };
                    } catch (err) {
                        console.error('Error fetching size data for', pkg.name, err);
                        toast.error(`Failed to fetch size data for ${pkg.name}`);
                        return pkg;
                    } finally {
                        setLoadingPackages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(pkg.name);
                            return newSet;
                        });
                    }
                })
            );
            setSizeData(updatedPackages);
            setIsLoading(false);
        };

        fetchSizeData();
    }, [packages]);

    const handlePackageClick = async (pkg: PackageData) => {
        if (loadingPackages.has(pkg.name)) return;

        setLoadingPackages(prev => new Set(prev).add(pkg.name));
        try {
            const response = await fetch(
                `https://bundlephobia.com/api/size?package=${pkg.name}@${pkg.version}`
            );
            const data: BundlePhobiaResponse = await response.json();

            setSizeData(prev => prev.map(item =>
                item.name === pkg.name
                    ? {
                        ...item,
                        size: {
                            gzip: data.gzip,
                            minified: data.size,
                            total: data.dependencySizes.reduce(
                                (acc, dep) => acc + dep.approximateSize,
                                0
                            ),
                        },
                    }
                    : item
            ));
        } catch (err) {
            console.error('Error fetching size data for', pkg.name, err);
            toast.error(`Failed to fetch size data for ${pkg.name}`);
        } finally {
            setLoadingPackages(prev => {
                const newSet = new Set(prev);
                newSet.delete(pkg.name);
                return newSet;
            });
        }
    };

    const chartData = {
        labels: sizeData.map((pkg) => pkg.name),
        datasets: [
            {
                label: 'Minified Size (KB)',
                data: sizeData.map((pkg) => (pkg.size?.minified ?? 0) / 1024),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Gzipped Size (KB)',
                data: sizeData.map((pkg) => (pkg.size?.gzip ?? 0) / 1024),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12,
                        family: 'Inter',
                    },
                    padding: window.innerWidth < 640 ? 10 : 20,
                },
            },
            title: {
                display: true,
                text: 'Package Size Comparison',
                font: {
                    size: window.innerWidth < 640 ? 14 : 16,
                    family: 'Inter',
                    weight: 'bold' as const,
                },
                padding: {
                    bottom: window.innerWidth < 640 ? 10 : 20,
                },
                maxWidth: window.innerWidth < 640 ? 200 : 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Size (KB)',
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12,
                        family: 'Inter',
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: window.innerWidth < 640 ? 10 : 12,
                    },
                    maxRotation: window.innerWidth < 640 ? 45 : 0,
                },
            },
        },
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 py-12">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                    <LoadingSpinner size="lg" color="blue" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 animate-pulse">
                        Analyzing Package Sizes
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md">
                        Fetching bundle size information from BundlePhobia...
                    </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="h-[300px] sm:h-[400px] bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <Bar data={chartData} options={options} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {sizeData.map((pkg) => (
                    <div
                        key={pkg.name}
                        className="group bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] sm:col-span-2 lg:col-span-2 cursor-pointer"
                        onClick={() => handlePackageClick(pkg)}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-4">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate max-w-[200px] sm:max-w-[300px]">{pkg.name}</h3>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full font-medium mt-1 sm:mt-0 whitespace-nowrap">{pkg.version}</span>
                        </div>
                        {loadingPackages.has(pkg.name) ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg animate-pulse"></div>
                                    <LoadingSpinner size="md" color="blue" />
                                </div>
                                <p className="text-sm text-gray-600 animate-pulse">Updating package data...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-xl hover:from-blue-50/70 hover:to-blue-50/50 transition-all duration-200">
                                    <span className="text-sm font-medium text-gray-600 truncate mr-2 max-w-[60%]">Minified</span>
                                    <span className="text-sm font-bold text-blue-600 whitespace-nowrap">{((pkg.size?.minified ?? 0) / 1024).toFixed(2)} KB</span>
                                </div>
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-green-50/50 to-green-50/30 rounded-xl hover:from-green-50/70 hover:to-green-50/50 transition-all duration-200">
                                    <span className="text-sm font-medium text-gray-600 truncate mr-2 max-w-[60%]">Gzipped</span>
                                    <span className="text-sm font-bold text-green-600 whitespace-nowrap">{((pkg.size?.gzip ?? 0) / 1024).toFixed(2)} KB</span>
                                </div>
                                <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-purple-50/50 to-purple-50/30 rounded-xl hover:from-purple-50/70 hover:to-purple-50/50 transition-all duration-200">
                                    <span className="text-sm font-medium text-gray-600 truncate mr-2 max-w-[60%]">Total with Dependencies</span>
                                    <span className="text-sm font-bold text-purple-600 whitespace-nowrap">{((pkg.size?.total ?? 0) / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
} 