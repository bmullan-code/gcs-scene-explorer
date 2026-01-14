
import React, { useState, useEffect, useCallback } from 'react';
import { GCSService } from './services/gcsService';
import { analyzeScenes } from './services/geminiService';
import { GCSListResponse, GCSObject, Scene, AuthConfig } from './types';
import Breadcrumbs from './components/Breadcrumbs';
import SceneTable from './components/SceneTable';
import ImageGallery from './components/ImageGallery';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthConfig>({
    accessToken: '',
    bucket: '',
    path: ''
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contents, setContents] = useState<GCSListResponse | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchContents = useCallback(async (currentBucket: string, currentPath: string, token: string) => {
    setLoading(true);
    setError(null);
    setGeminiAnalysis(null);
    try {
      const data = await GCSService.listObjects(currentBucket, currentPath, token);
      setContents(data);

      // Reset nested data
      setScenes([]);
      
      // Look for scenes.json
      const scenesFile = data.items?.find(item => item.name.endsWith('scenes.json'));
      if (scenesFile) {
        const response = await GCSService.getObjectMedia(currentBucket, scenesFile.name, token);
        const jsonData = await response.json();
        const scenesArray = jsonData.scenes || (Array.isArray(jsonData) ? jsonData : []);
        setScenes(scenesArray);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.accessToken && auth.bucket) {
      setIsAuthenticated(true);
      fetchContents(auth.bucket, auth.path, auth.accessToken);
    }
  };

  const navigateTo = (newPath: string) => {
    setAuth(prev => ({ ...prev, path: newPath }));
    fetchContents(auth.bucket, newPath, auth.accessToken);
  };

  const triggerAnalysis = async () => {
    if (scenes.length === 0) return;
    setIsAnalyzing(true);
    const analysis = await analyzeScenes(scenes);
    setGeminiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const images = contents?.items?.filter(item => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
  ) || [];

  const folders = contents?.prefixes || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2">GCS Explorer</h1>
          <p className="text-slate-400 text-center text-sm mb-8">Connect to your Google Cloud Storage bucket to explore scenes and assets.</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bucket Name</label>
              <input 
                type="text" 
                placeholder="my-project-assets"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={auth.bucket}
                onChange={(e) => setAuth(prev => ({ ...prev, bucket: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Access Token</label>
              <input 
                type="password" 
                placeholder="OAuth2 Access Token"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={auth.accessToken}
                onChange={(e) => setAuth(prev => ({ ...prev, accessToken: e.target.value }))}
                required
              />
              <p className="text-[10px] text-slate-500 mt-2 italic">Typically generated via 'gcloud auth print-access-token'</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Initial Path (Optional)</label>
              <input 
                type="text" 
                placeholder="folder/subfolder/"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={auth.path}
                onChange={(e) => setAuth(prev => ({ ...prev, path: e.target.value }))}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center space-x-2 mt-2 active:scale-[0.98]"
            >
              <span>Explore Storage</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <h1 className="font-bold text-slate-800">Scene Explorer</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end text-[10px] leading-tight text-slate-400">
               <span>BUCKET</span>
               <span className="font-bold text-slate-700 truncate max-w-[120px]">{auth.bucket}</span>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs bucket={auth.bucket} path={auth.path} onNavigate={navigateTo} />

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start space-x-3">
            <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="font-bold text-sm">Operation Failed</p>
              <p className="text-xs opacity-80">{error}</p>
              <button 
                onClick={() => fetchContents(auth.bucket, auth.path, auth.accessToken)}
                className="mt-2 text-xs font-bold underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium text-sm animate-pulse">Scanning Cloud Storage...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-6">
              <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Folders</h3>
                {folders.length > 0 ? (
                  <div className="space-y-1">
                    {folders.map(folder => (
                      <button
                        key={folder}
                        onClick={() => navigateTo(folder)}
                        className="w-full flex items-start space-x-3 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-sm text-slate-600 hover:text-blue-600 transition-all text-left"
                      >
                        <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                        <span className="break-words flex-1 leading-tight">{folder.split('/').filter(Boolean).pop()}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic px-3">No sub-folders found.</p>
                )}
              </section>

              {scenes.length > 0 && (
                <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">AI Scene Insights</h3>
                  <p className="text-xs opacity-90 mb-4 leading-relaxed">Let Gemini analyze your scene metadata for patterns and summaries.</p>
                  <button
                    onClick={triggerAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-2 bg-white text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <div className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    )}
                    <span>{isAnalyzing ? 'Analyzing...' : 'Generate Insights'}</span>
                  </button>
                </section>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {geminiAnalysis && (
                <div className="bg-white rounded-xl border-2 border-indigo-100 shadow-sm p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <button onClick={() => setGeminiAnalysis(null)} className="text-slate-300 hover:text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                    <h3 className="font-bold text-sm uppercase tracking-wide">Gemini Analysis</h3>
                  </div>
                  <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {geminiAnalysis}
                  </div>
                </div>
              )}

              {scenes.length > 0 ? (
                <SceneTable 
                  scenes={scenes} 
                  bucket={auth.bucket}
                  path={auth.path}
                  token={auth.accessToken}
                />
              ) : (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center mb-8">
                   <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                   <h4 className="text-slate-400 font-medium text-sm">No scenes.json metadata found in this directory.</h4>
                </div>
              )}

              <ImageGallery images={images} token={auth.accessToken} />

              {images.length === 0 && folders.length === 0 && !loading && (
                <div className="py-20 text-center">
                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <h3 className="text-slate-500 font-bold mb-1">Empty Directory</h3>
                  <p className="text-slate-400 text-sm">This path doesn't contain any sub-folders or supported assets.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
