
import React, { useState } from 'react';
import { Scene } from '../types';
import { AuthenticatedImage } from './AuthenticatedImage';

interface SceneTableProps {
  scenes: Scene[];
  bucket: string;
  path: string;
  token: string;
}

const SceneTable: React.FC<SceneTableProps> = ({ scenes, bucket, path, token }) => {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  if (!scenes || scenes.length === 0) return null;

  const headers = Object.keys(scenes[0]).filter(k => typeof scenes[0][k] !== 'object');

  // Helper to find potential image filename in scene object
  const getImageFromScene = (scene: Scene): string | null => {
    const potentialKeys = ['image', 'img', 'filename', 'file', 'thumbnail', 'asset'];
    for (const key of potentialKeys) {
      const val = scene[key];
      if (typeof val === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(val)) {
        return val;
      }
    }
    return null;
  };

  return (
    <div className="mb-8">
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Scene Metadata</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            {scenes.length} Entries
          </span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              {headers.map(header => (
                <th key={header} className="px-6 py-3">{header}</th>
              ))}
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scenes.map((scene, idx) => (
              <tr 
                key={idx} 
                className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedScene(scene)}
              >
                {headers.map(header => (
                  <td key={header} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap overflow-hidden max-w-[200px] truncate">
                    {String(scene[header])}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-wider">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedScene && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-sm transition-all animate-in fade-in duration-200"
          onClick={() => setSelectedScene(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Scene Details</h3>
                <p className="text-xs text-slate-500 font-medium">Full metadata record and referenced image</p>
              </div>
              <button 
                onClick={() => setSelectedScene(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Metadata Fields */}
                <div className="space-y-4">
                  {Object.entries(selectedScene).map(([key, value]) => (
                    <div key={key} className="group border-b border-slate-50 pb-3 last:border-0">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                        {key}
                      </label>
                      <div className="text-sm text-slate-700 bg-slate-50/50 p-2 rounded border border-slate-100 font-mono break-words whitespace-pre-wrap">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Referenced Image */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Referenced Asset
                  </label>
                  {getImageFromScene(selectedScene) ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video relative">
                      <AuthenticatedImage 
                        bucket={bucket}
                        name={`${path}${getImageFromScene(selectedScene)}`}
                        token={token}
                        alt="Scene Asset"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400 space-y-2 aspect-video">
                       <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       <p className="text-xs font-medium">No valid image reference found in metadata.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={() => setSelectedScene(null)}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneTable;
