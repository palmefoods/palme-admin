import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, Loader, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ImageUpload = ({ onUploadComplete, initialImage, label = "Upload Image" }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(initialImage || '');
  const [fileType, setFileType] = useState('image'); 

  
  useEffect(() => {
    setPreview(initialImage || '');
  }, [initialImage]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file); 

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const secureUrl = res.data.url;
      const type = res.data.type || 'image'; 
      setPreview(secureUrl);
      setFileType(type);
      onUploadComplete(secureUrl); 

    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Check your internet or file size.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = (e) => {
    e.preventDefault(); 
    setPreview('');
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</label>
      
      {preview ? (
        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
          {fileType === 'video' || preview.endsWith('.mp4') ? (
             <video src={preview} controls className="w-full h-full object-cover" />
          ) : (
             <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          )}
          
          <button 
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-40 flex flex-col items-center justify-center cursor-pointer group">
          {loading ? (
            <div className="text-palmeGreen flex flex-col items-center animate-pulse">
               <Loader size={30} className="animate-spin mb-2" />
               <span className="text-xs font-bold">Uploading to Cloud...</span>
            </div>
          ) : (
            <>
              <UploadCloud size={32} className="text-gray-400 group-hover:text-palmeGreen mb-2 transition-colors" />
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">Click to Upload</p>
              <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, MP4</p>
            </>
          )}
          
          <input 
            type="file" 
            accept="image/*,video/*" 
            onChange={handleFileChange}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;