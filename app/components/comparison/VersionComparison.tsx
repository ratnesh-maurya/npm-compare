'use client';

import { useEffect, useState } from 'react';
import { PackageData } from '../../types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

interface VersionComparisonProps {
    packages: PackageData[];
}

export default function VersionComparison({ packages }: VersionComparisonProps) {
    const [versionData, setVersionData] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVersionData = async () => {
            setIsLoading(true);
            const updatedPackages = await Promise.all(
                packages.map(async (pkg) => {
                    try {
                        const response = await fetch(`https://registry.npmjs.org/${pkg.name}`);
                        const data = await response.json();

                        const latestVersion = data['dist-tags'].latest;
                        const packageInfo = data.versions[latestVersion];

                        return {
                            ...pkg,
                            version: latestVersion,
                            dependencies: packageInfo.dependencies || {},
                            peerDependencies: packageInfo.peerDependencies || {},
                        };
                    } catch (error) {
                        toast.error(`Failed to fetch version data for ${pkg.name}`);
                        console.log(error);
                        return pkg;
                    }
                })
            );
            setVersionData(updatedPackages);
            setIsLoading(false);
        };

        fetchVersionData();
    }, [packages]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <LoadingSpinner size="lg" color="blue" />
                <p className="text-gray-600 text-sm sm:text-base font-medium">Loading version information...</p>
            </div>
        );
    }

    // const options = {
    //     responsive: true,
    //     maintainAspectRatio: false,
    //     plugins: {
    //         legend: {
    //             position: 'top' as const,
    //             labels: {
    //                 font: {
    //                     size: window.innerWidth < 640 ? 10 : 12,
    //                     family: 'Inter',
    //                 },
    //                 padding: window.innerWidth < 640 ? 10 : 20,
    //             },
    //         },
    //         title: {
    //             display: true,
    //             text: 'Version History',
    //             font: {
    //                 size: window.innerWidth < 640 ? 14 : 16,
    //                 family: 'Inter',
    //                 weight: 'bold' as const,
    //             },
    //             padding: {
    //                 bottom: window.innerWidth < 640 ? 10 : 20,
    //             },
    //         },
    //     },
    //     scales: {
    //         y: {
    //             beginAtZero: true,
    //             title: {
    //                 display: true,
    //                 text: 'Version',
    //                 font: {
    //                     size: window.innerWidth < 640 ? 10 : 12,
    //                     family: 'Inter',
    //                 },
    //             },
    //             grid: {
    //                 color: 'rgba(0, 0, 0, 0.05)',
    //             },
    //             ticks: {
    //                 font: {
    //                     size: window.innerWidth < 640 ? 10 : 12,
    //                 },
    //                 callback: function (tickValue: string | number) {
    //                     const value = Number(tickValue);
    //                     return value.toFixed(1);
    //                 }
    //             },
    //         },
    //         x: {
    //             grid: {
    //                 display: false,
    //             },
    //             ticks: {
    //                 font: {
    //                     size: window.innerWidth < 640 ? 10 : 12,
    //                 },
    //                 maxRotation: window.innerWidth < 640 ? 45 : 0,
    //             },
    //         },
    //     },
    // };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {versionData.map((pkg) => (
                    <div
                        key={pkg.name}
                        className="group bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:scale-[1.02]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{pkg.name}</h3>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium group-hover:bg-blue-100 transition-colors duration-200">
                                v{pkg.version}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {pkg.dependencies && Object.keys(pkg.dependencies).length > 0 && (
                                <div className="bg-blue-50/50 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Dependencies
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(pkg.dependencies).map(([name, version]) => (
                                            <div key={name} className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                                                <span className="text-sm font-medium text-gray-700">{name}</span>
                                                <span className="text-sm text-blue-600 font-medium">{version}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pkg.peerDependencies && Object.keys(pkg.peerDependencies).length > 0 && (
                                <div className="bg-purple-50/50 rounded-xl p-4">
                                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Peer Dependencies
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(pkg.peerDependencies).map(([name, version]) => (
                                            <div key={name} className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                                                <span className="text-sm font-medium text-gray-700">{name}</span>
                                                <span className="text-sm text-purple-600 font-medium">{version}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 