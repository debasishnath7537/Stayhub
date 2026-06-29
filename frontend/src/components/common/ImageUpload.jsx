import React, { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5001';

export default function ImageUpload({ images, onChange, maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (images.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Upload failed');

      // Add new URLs to the existing ones
      onChange([...images, ...data.urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition relative">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploading || images.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-semibold">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <UploadCloud className="w-8 h-8" />
            <p className="text-sm font-medium">Click or drag images to upload</p>
            <p className="text-xs text-gray-400">Max {maxFiles} files (JPEG, PNG, WEBP)</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
              <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
