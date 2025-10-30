import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ images, onImagesChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== fileArray.length) {
      alert('Only image files are allowed');
      return;
    }

    // Convert files to base64 for local storage
    Promise.all(
      validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then(base64Images => {
      onImagesChange([...images, ...base64Images]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      background: 'rgba(26, 26, 46, 0.6)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ color: '#00d4ff', marginBottom: '15px', fontSize: '1.1rem' }}>
        📸 Trade Screenshots & Images
      </h3>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        style={{
          border: `2px dashed ${dragOver ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(0, 212, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
          {dragOver ? '📤' : '📷'}
        </div>
        <div style={{ color: dragOver ? '#00d4ff' : '#ccc', fontSize: '1.1rem', marginBottom: '10px' }}>
          {dragOver ? 'Drop images here' : 'Click or drag images here'}
        </div>
        <div style={{ color: '#999', fontSize: '0.9rem' }}>
          Support for PNG, JPG, GIF, WebP formats
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {images.map((image, index) => (
            <div key={index} style={{
              position: 'relative',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <img
                src={image}
                alt={`Trade screenshot ${index + 1}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255, 107, 107, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
                title="Remove image"
              >
                ✕
              </button>

              {/* View full size button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Open image in new tab for full view
                  const newWindow = window.open();
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head><title>Trade Screenshot ${index + 1}</title></head>
                        <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                          <img src="${image}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                        </body>
                      </html>
                    `);
                  }
                }}
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(0, 212, 255, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  backdropFilter: 'blur(4px)'
                }}
                title="View full size"
              >
                🔍
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#999',
          fontSize: '0.9rem',
          padding: '20px'
        }}>
          No images uploaded yet. Add screenshots of your charts, setups, or analysis.
        </div>
      )}

      {/* Image count info */}
      {images.length > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          textAlign: 'center',
          color: '#ccc',
          fontSize: '0.9rem'
        }}>
          {images.length} image{images.length !== 1 ? 's' : ''} uploaded
          {images.length > 0 && (
            <span style={{ marginLeft: '10px', color: '#999' }}>
              (Click image to view full size)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;




























