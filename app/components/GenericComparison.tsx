'use client';

import { PackageData } from '../types';

interface GenericComparisonProps {
  packages: PackageData[];
  ecosystemLabel: string;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }
  return parsed.toLocaleDateString();
}

function formatDownloads(value?: number): string {
  if (!value) {
    return 'N/A';
  }
  return value.toLocaleString();
}

export default function GenericComparison({ packages, ecosystemLabel }: GenericComparisonProps) {
  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
        <p className="text-slate-600 font-medium">Add at least one {ecosystemLabel} package to compare.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <article
            key={pkg.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 break-all">{pkg.name}</h3>
              <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {pkg.version}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">{pkg.description || 'No description provided.'}</p>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Updated</dt>
                <dd className="font-medium text-slate-800">{formatDate(pkg.time.modified)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Dependencies</dt>
                <dd className="font-medium text-slate-800">
                  {Object.keys(pkg.dependencies ?? {}).length}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Downloads (total)</dt>
                <dd className="font-medium text-slate-800">{formatDownloads(pkg.downloads?.total)}</dd>
              </div>
            </dl>

            {pkg.repository ? (
              <a
                href={pkg.repository}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View repository
              </a>
            ) : null}
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Package</th>
              <th className="px-4 py-3 text-left font-semibold">Version</th>
              <th className="px-4 py-3 text-left font-semibold">Dependencies</th>
              <th className="px-4 py-3 text-left font-semibold">Updated</th>
              <th className="px-4 py-3 text-left font-semibold">Total Downloads</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.name} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900 break-all">{pkg.name}</td>
                <td className="px-4 py-3 text-slate-700">{pkg.version}</td>
                <td className="px-4 py-3 text-slate-700">{Object.keys(pkg.dependencies ?? {}).length}</td>
                <td className="px-4 py-3 text-slate-700">{formatDate(pkg.time.modified)}</td>
                <td className="px-4 py-3 text-slate-700">{formatDownloads(pkg.downloads?.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
