
import React from 'react';

interface BreadcrumbsProps {
  bucket: string;
  path: string;
  onNavigate: (newPath: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ bucket, path, onNavigate }) => {
  const parts = path.split('/').filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
      <button
        onClick={() => onNavigate('')}
        className="hover:text-blue-600 font-medium transition-colors"
      >
        gs://{bucket}
      </button>
      {parts.length > 0 && <span className="text-slate-300">/</span>}
      {parts.map((part, index) => {
        const fullPath = parts.slice(0, index + 1).join('/') + '/';
        const isLast = index === parts.length - 1;

        return (
          <React.Fragment key={fullPath}>
            <button
              onClick={() => onNavigate(fullPath)}
              disabled={isLast}
              className={`hover:text-blue-600 transition-colors ${
                isLast ? 'text-slate-900 font-semibold cursor-default' : 'font-medium'
              }`}
            >
              {part}
            </button>
            {!isLast && <span className="text-slate-300">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
