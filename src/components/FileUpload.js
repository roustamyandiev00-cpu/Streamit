'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
// Button component removed - using regular button elements

export default function FileUpload({ 
  onUpload, 
  accept = 'image/*', 
  type = 'thumbnail',
  currentFile = null,
  className = '' 
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onUpload(result.url, result.filename);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    onUpload(null, null);
  };

  return (
    <div className={`w-full ${className}`}>
      {currentFile ? (
        <div className="relative inline-block group">
          {type === 'thumbnail' ? (
            <img 
              src={currentFile} 
              alt="Thumbnail"
              className="w-[200px] h-[112px] object-cover rounded-lg border border-border"
            />
          ) : (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg text-muted-foreground border border-border">
              <Image size={24} />
              <span>File uploaded</span>
            </div>
          )}
          <button
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md hover:scale-110 transition-transform bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer flex items-center justify-center"
            onClick={removeFile}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/40
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <Loader2 size={32} className="animate-spin text-primary" />
            ) : (
              <Upload size={32} className={`transition-colors ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
            
            <div className="text-sm">
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                  <p className="text-xs mt-1 text-muted-foreground">Supports: {accept}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
