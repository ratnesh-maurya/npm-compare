'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PackageData } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface DownloadsComparisonProps {
    packages: PackageData[];
}

interface DownloadData {
    downloads: number;
    start: string;
    end: string;
    package: string;
}

interface TotalDownloadData {
    downloads: Array<{
        downloads: number;
        day: string;
    }>;
}

// interface ChartValue {
//     value: number;
//     label: string;
// }

export default function DownloadsComparison({ packages }: DownloadsComparisonProps) {
    const [downloadData, setDownloadData] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDownloadData = async () => {
            setIsLoading(true);
            const updatedPackages = await Promise.all(
                packages.map(async (pkg) => {
                    try {
                        // Fetch weekly downloads
                        const weeklyResponse = await fetch(
                            `https://api.npmjs.org/downloads/point/last-week/${pkg.name}`
                        );
                        const weeklyData: DownloadData = await weeklyResponse.json();

                        // Fetch monthly downloads
                        const monthlyResponse = await fetch(
                            `https://api.npmjs.org/downloads/point/last-month/${pkg.name}`
                        );
                        const monthlyData: DownloadData = await monthlyResponse.json();

                        // Fetch total downloads
                        const totalResponse = await fetch(
                            `https://api.npmjs.org/downloads/range/2010-01-01:${new Date().toISOString().split('T')[0]}/${pkg.name}`
                        );
                        const totalData: TotalDownloadData = await totalResponse.json();
                        const totalDownloads = totalData.downloads.reduce((acc, day) => acc + day.downloads, 0);

                        console.log('Download data for', pkg.name, {
                            weekly: weeklyData.downloads,
                            monthly: monthlyData.downloads,
                            total: totalDownloads
                        });

                        return {
                            ...pkg,
                            downloads: {
                                weekly: weeklyData.downloads || 0,
                                monthly: monthlyData.downloads || 0,
                                total: totalDownloads || 0,
                            },
                        };
                    } catch (err) {
                        console.error('Error fetching download data for', pkg.name, err);
                        toast.error(`Failed to fetch download data for ${pkg.name}`);
                        return pkg;
                    }
                })
            );
            setDownloadData(updatedPackages);
            setIsLoading(false);
        };

        fetchDownloadData();
    }, [packages]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <LoadingSpinner size="lg" color="blue" />
                <p className="text-gray-600 text-sm sm:text-base font-medium">Loading download statistics...</p>
            </div>
        );
    }

    const chartData = {
        labels: downloadData.map((pkg) => pkg.name),
        datasets: [
            {
                label: 'Weekly Downloads',
                data: downloadData.map((pkg) => pkg.downloads?.weekly || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                tension: 0.1,
            },
            {
                label: 'Monthly Downloads',
                data: downloadData.map((pkg) => pkg.downloads?.monthly || 0),
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2,
                tension: 0.1,
            },
            {
                label: 'Total Downloads',
                data: downloadData.map((pkg) => pkg.downloads?.total || 0),
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 2,
                tension: 0.1,
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
                text: 'Download Statistics',
                font: {
                    size: window.innerWidth < 640 ? 14 : 16,
                    family: 'Inter',
                    weight: 'bold' as const,
                },
                padding: {
                    bottom: window.innerWidth < 640 ? 10 : 20,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Downloads',
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
                    callback: function (tickValue: string | number) {
                        const value = Number(tickValue);
                        if (window.innerWidth < 640) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                            if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
                        }
                        return value.toLocaleString();
                    }
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

    return (
        <div className="space-y-6">
            <div className="h-[300px] sm:h-[400px] bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <Line data={chartData} options={options} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {downloadData.map((pkg) => (
                    <div
                        key={pkg.name}
                        className="group bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:scale-[1.02]"
                    >
                        <h3 className="font-bold mb-4 text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{pkg.name}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-600">Weekly</span>
                                </div>
                                <span className="text-sm font-bold text-blue-600">{(pkg.downloads?.weekly ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-600">Monthly</span>
                                </div>
                                <span className="text-sm font-bold text-green-600">{(pkg.downloads?.monthly ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-600">Total</span>
                                </div>
                                <span className="text-sm font-bold text-purple-600">{(pkg.downloads?.total ?? 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 