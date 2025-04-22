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

    useEffect(() => {
        const fetchDownloadData = async () => {
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
        };

        fetchDownloadData();
    }, [packages]);

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
            <div className="h-[300px] sm:h-[400px]">
                <Line data={chartData} options={options} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloadData.map((pkg) => (
                    <div key={pkg.name} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900">{pkg.name}</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Weekly</span>
                                <span className="text-sm font-medium text-gray-900">{(pkg.downloads?.weekly ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Monthly</span>
                                <span className="text-sm font-medium text-gray-900">{(pkg.downloads?.monthly ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total</span>
                                <span className="text-sm font-medium text-gray-900">{(pkg.downloads?.total ?? 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 