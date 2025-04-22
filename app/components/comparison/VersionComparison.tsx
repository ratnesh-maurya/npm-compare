'use client';

import { useEffect, useState } from 'react';
import { PackageData } from '../../types';
import toast from 'react-hot-toast';

interface VersionComparisonProps {
    packages: PackageData[];
}

export default function VersionComparison({ packages }: VersionComparisonProps) {
    const [versionData, setVersionData] = useState<PackageData[]>([]);

    useEffect(() => {
        const fetchVersionData = async () => {
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
        };

        fetchVersionData();
    }, [packages]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {versionData.map((pkg) => (
                    <div key={pkg.name} className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2 text-black">{pkg.name}</h3>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-black">Version Information</h4>
                                <p className="text-black">Latest Version: {pkg.version}</p>
                            </div>

                            {pkg.dependencies && Object.keys(pkg.dependencies).length > 0 && (
                                <div>
                                    <h4 className="font-medium text-black">Dependencies</h4>
                                    <ul className="list-disc list-inside">
                                        {Object.entries(pkg.dependencies).map(([name, version]) => (
                                            <li key={name} className="text-sm text-black">
                                                {name}: {version}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {pkg.peerDependencies && Object.keys(pkg.peerDependencies).length > 0 && (
                                <div>
                                    <h4 className="font-medium text-black">Peer Dependencies</h4>
                                    <ul className="list-disc list-inside">
                                        {Object.entries(pkg.peerDependencies).map(([name, version]) => (
                                            <li key={name} className="text-sm text-black">
                                                {name}: {version}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 