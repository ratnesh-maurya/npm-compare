export interface PackageData {
  name: string;
  version: string;
  description: string;
  repository: string;
  keywords: string[];
  license: string;
  author: string;
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  time: {
    created: string;
    modified: string;
  };
  size?: {
    gzip: number;
    minified: number;
    total: number;
  };
  downloads?: {
    weekly: number;
    monthly: number;
    total: number;
  };
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface ComparisonSection {
  title: string;
  component: React.ComponentType<{ packages: PackageData[] }>;
}
