import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Folder, Project } from '../../types';
import { Folder as FolderIcon } from 'lucide-react';

interface MoveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (projectId: string, folderId?: string) => void;
  project: Project | null;
  folders: Folder[];
}

export const MoveProjectModal: React.FC<MoveProjectModalProps> = ({
  isOpen,
  onClose,
  onMove,
  project,
  folders,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(
    project?.folderId
  );

  if (!project) return null;

  const handleConfirm = () => {
    onMove(project.id, selectedFolderId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Move "${project.title}"`}>
      <div className="space-y-4">
        <p className="text-xs text-[#E8BDB3]/70">
          Select a destination folder for this project:
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedFolderId(undefined)}
            className={`w-full flex items-center justify-between p-3 rounded-[4px] border transition-colors cursor-pointer text-left text-xs ${
              !selectedFolderId
                ? 'bg-[#201F1F] border-[#FF3B00] text-white font-semibold'
                : 'bg-[#131313] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderIcon className="w-4 h-4 text-[#E8BDB3]/60" />
              <span>No Folder (Root Library)</span>
            </div>
            {!selectedFolderId && (
              <span className="text-[10px] uppercase font-bold text-[#FF3B00]">Selected</span>
            )}
          </button>

          {folders.map((f) => {
            const isSelected = selectedFolderId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)}
                className={`w-full flex items-center justify-between p-3 rounded-[4px] border transition-colors cursor-pointer text-left text-xs ${
                  isSelected
                    ? 'bg-[#201F1F] border-[#FF3B00] text-white font-semibold'
                    : 'bg-[#131313] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderIcon className="w-4 h-4 text-[#FF3B00]" />
                  <span>{f.name}</span>
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase font-bold text-[#FF3B00]">Selected</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#282828]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleConfirm}>
            Move Project
          </Button>
        </div>
      </div>
    </Modal>
  );
};
