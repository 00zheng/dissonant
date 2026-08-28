import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Upload, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project } from '../../types';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  project: Project | null;
}

export const UploadTrackModal: React.FC<UploadTrackModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  project,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
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
      setSelectedFiles((prev) => [...prev, ...audioFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedFiles([]);
        onClose();
      }}
      title={`Upload Audio Tracks to "${project.title}"`}
    >
      <div className="space-y-5">
        {/* Dropzone Container */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-all ${
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
        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <p className="text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider">
              Files to Upload ({selectedFiles.length})
            </p>
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#131313] border border-[#282828] text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Music className="w-4 h-4 text-[#FF3B00] shrink-0" />
                  <span className="truncate text-[#E5E2E1]">{file.name}</span>
                  <span className="text-[10px] text-[#E8BDB3]/50 shrink-0">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(idx);
                  }}
                  className="text-xs text-[#FF3B00] hover:underline cursor-pointer ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#282828]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={selectedFiles.length === 0}
          >
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Tracks` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
