import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Folder } from '../../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderData: { name: string; description: string }) => void;
  initialFolder?: Folder | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFolder,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialFolder) {
      setName(initialFolder.name);
      setDescription(initialFolder.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initialFolder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialFolder ? 'Rename Folder' : 'Create New Folder'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Folder Name
          </label>
          <Input
            placeholder="e.g. 2026 Music, Piano, Practice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Description (Optional)
          </label>
          <Input
            placeholder="e.g. Practice recordings and song sketches"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#282828]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" disabled={!name.trim()}>
            {initialFolder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
