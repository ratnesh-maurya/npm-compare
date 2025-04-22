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

    useEffect(() => {
        const fetchSizeData = async () => {
            const updatedPackages = await Promise.all(
                packages.map(async (pkg) => {
                    try {
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
                    }
                })
            );
            setSizeData(updatedPackages);
        };

        fetchSizeData();
    }, [packages]);

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

    return (
        <div className="space-y-4">
            <div className="h-[300px] sm:h-[400px]">
                <Bar data={chartData} options={options} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sizeData.map((pkg) => (
                    <div key={pkg.name} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <h3 className="font-semibold mb-2 text-sm sm:text-base text-gray-900">{pkg.name}</h3>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600">Minified: {((pkg.size?.minified ?? 0) / 1024).toFixed(2)} KB</p>
                            <p className="text-sm text-gray-600">Gzipped: {((pkg.size?.gzip ?? 0) / 1024).toFixed(2)} KB</p>
                            <p className="text-sm text-gray-600">Total with Dependencies: {((pkg.size?.total ?? 0) / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 