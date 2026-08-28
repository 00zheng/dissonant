import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Upload, Music, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { Project, Track } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fsUploadAudioFile } from '../../services/db';
import { processAudioUpload } from '../../services/audio';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (tracks: Track[]) => void;
  project: Project | null;
}

type UploadItem = {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  track?: Track;
};

export const UploadTrackModal: React.FC<UploadTrackModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  project,
}) => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on modal open/close
  useEffect(() => {
    if (!isOpen) {
      setUploads([]);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!project) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      addFiles(filesArr);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const audioFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('audio/') ||
        /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)
      );
      addFiles(audioFiles);
    }
  };

  const addFiles = (files: File[]) => {
    const newUploads = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));
    setUploads(prev => [...prev, ...newUploads]);
  };

  const handleRemoveFile = (index: number) => {
    if (isUploading) return;
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUpload = (index: number, update: Partial<UploadItem>) => {
    setUploads(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...update };
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (uploads.length === 0 || !user || !project || isUploading) return;
    setIsUploading(true);

    const completedTracks: Track[] = [];
    let hasErrors = false;

    for (let i = 0; i < uploads.length; i++) {
      if (uploads[i].status === 'success') continue;
      
      updateUpload(i, { status: 'uploading', progress: 0, error: undefined });
      try {
        const trackId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { task, storagePath } = fsUploadAudioFile(user.uid, trackId, uploads[i].file);

        await new Promise<void>((resolve, reject) => {
          task.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              updateUpload(i, { progress });
            },
            (error) => {
              reject(error);
            },
            () => {
              resolve();
            }
          );
        });

        // After successful upload, process metadata
        const track = await processAudioUpload(uploads[i].file, project.artist, project.coverUrl, storagePath, trackId);
        updateUpload(i, { status: 'success', progress: 100, track });
        completedTracks.push(track);
      } catch (err: any) {
        console.error('Upload error:', err);
        updateUpload(i, { status: 'error', error: err.message || 'Upload failed' });
        hasErrors = true;
      }
    }

    setIsUploading(false);
    
    if (completedTracks.length > 0) {
      onUpload(completedTracks);
    }

    // Auto-close if no errors
    if (!hasErrors) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isUploading) onClose();
      }}
      title={`Upload Audio Tracks to "${project.title}"`}
    >
      <div className="space-y-5">
        {/* Dropzone Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-[8px] p-8 text-center transition-all ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${
            isDragging
              ? 'border-[#FF3B00] bg-[#FF3B00]/10'
              : 'border-[#282828] hover:border-[#FF3B00]/60 bg-[#131313]'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
            multiple
            className="hidden"
            disabled={isUploading}
          />

          <div className="w-12 h-12 rounded-full bg-[#1C1B1B] border border-[#282828] mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-[#FF3B00]" />
          </div>

          <p className="text-sm font-semibold text-[#E5E2E1]">
            Click to upload or drag & drop audio files
          </p>
          <p className="text-xs text-[#E8BDB3]/60 mt-1">
            Supports MP3, WAV, OGG, M4A, FLAC, AAC
          </p>
        </div>

        {/* Selected File List */}
        {uploads.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <p className="text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider">
              Files to Upload ({uploads.length})
            </p>
            {uploads.map((upload, idx) => (
              <div
                key={idx}
                className="flex flex-col p-2.5 rounded-[4px] bg-[#131313] border border-[#282828] text-xs relative overflow-hidden"
              >
                {/* Progress Background */}
                {upload.status === 'uploading' && (
                   <div 
                     className="absolute left-0 top-0 bottom-0 bg-[#FF3B00]/20 transition-all duration-200"
                     style={{ width: `${upload.progress}%` }}
                   />
                )}
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {upload.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : upload.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <Music className="w-4 h-4 text-[#FF3B00] shrink-0" />
                    )}
                    <span className="truncate text-[#E5E2E1]">{upload.file.name}</span>
                    <span className="text-[10px] text-[#E8BDB3]/50 shrink-0">
                      ({(upload.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  
                  {upload.status === 'pending' && !isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="text-xs text-[#E8BDB3]/60 hover:text-[#FF3B00] transition-colors ml-2"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  {upload.status === 'uploading' && (
                    <span className="text-xs text-[#FF3B00] ml-2">{Math.round(upload.progress)}%</span>
                  )}
                </div>
                
                {/* Error message */}
                {upload.status === 'error' && upload.error && (
                  <div className="text-red-400 text-[10px] mt-1 relative z-10">
                    {upload.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#282828]">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={uploads.length === 0 || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </span>
            ) : (
              `Upload ${uploads.length > 0 ? `${uploads.length} Tracks` : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
