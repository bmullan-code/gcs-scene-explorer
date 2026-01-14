
import React, { useState } from 'react';
import { GCSObject } from '../types';
import { AuthenticatedImage } from './AuthenticatedImage';

interface ImageGalleryProps {
  images: GCSObject[];
  token: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, token }) => {
  const [selectedImage, setSelectedImage] = useState<GCSObject | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Media Collection</h3>
        <span className="text-sm text-slate-500 font-medium">{images.length} items</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {images.map((img) => (
          <button 
            key={img.id} 
            onClick={() => setSelectedImage(img)}
            className="group relative bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="aspect-square bg-slate-100 relative">
               <AuthenticatedImage 
                  bucket={img.bucket} 
                  name={img.name} 
                  token={token} 
                  alt={img.name} 
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
               </div>
            </div>
            <div className="p-2 truncate text-[10px] text-slate-500 bg-white border-t border-slate-50">
              {img.name.split('/').pop()}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/95 backdrop-blur-sm transition-all animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-white/5 rounded-xl p-1 shadow-2xl overflow-hidden flex items-center justify-center">
              <AuthenticatedImage 
                bucket={selectedImage.bucket} 
                name={selectedImage.name} 
                token={token} 
                alt={selectedImage.name} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>

            <div className="mt-6 text-center w-full max-w-2xl">
              <h4 className="text-white font-bold truncate text-lg">
                {selectedImage.name.split('/').pop()}
              </h4>
              <p className="text-slate-400 text-sm mt-1">
                {selectedImage.name}
              </p>
              <div className="flex justify-center items-center space-x-4 mt-4 text-xs font-semibold text-slate-300">
                <span className="px-3 py-1 bg-white/10 rounded-full">Size: {(parseInt(selectedImage.size) / 1024).toFixed(2)} KB</span>
                <span className="px-3 py-1 bg-white/10 rounded-full">Type: {selectedImage.contentType}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
