import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Folder, Project, ProjectCategory } from '../../types';
import { NEUTRAL_COVER_FALLBACK } from '../../data/mockData';

const CATEGORIES: ProjectCategory[] = ['Album', 'EP', 'Single', 'Stems', 'Demo'];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  folders: Folder[];
  initialProject?: Project | null;
  defaultFolderId?: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  folders,
  initialProject,
  defaultFolderId
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Album');
  const [folderId, setFolderId] = useState<string>('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setArtist(initialProject.artist);
      setCategory(initialProject.category);
      setFolderId(initialProject.folderId || '');
      setTags(initialProject.tags ? initialProject.tags.join(', ') : '');
    } else {
      setTitle('');
      setArtist('');
      setCategory('Album');
      setFolderId(defaultFolderId || '');
      setTags('');
    }
  }, [initialProject, isOpen, defaultFolderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const projectData: Partial<Project> = {
      title: title.trim(),
      artist: artist.trim(),
      category,
      folderId: folderId || undefined,
      tags: parsedTags,
      coverUrl: initialProject?.coverUrl || NEUTRAL_COVER_FALLBACK,
      tracksCount: initialProject?.tracksCount || 0,
      totalDuration: initialProject?.totalDuration || '00m 00s',
      releaseDate: initialProject?.releaseDate || new Date().toISOString().split('T')[0],
      tracks: initialProject?.tracks || [],
    };

    onSave(projectData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProject ? 'Rename Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Project Title
          </label>
          <Input
            placeholder="e.g. Album Ideas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Artist / Performer
          </label>
          <Input
            placeholder="e.g. Alex"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Folder (Optional)
          </label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full bg-[#1C1B1B] text-[#E5E2E1] border border-[#282828] rounded-[4px] py-2.5 px-3 text-sm focus:outline-none focus:border-[#FF3B00]"
          >
            <option value="">No Folder (Root)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Tags (comma separated)
          </label>
          <Input
            placeholder="e.g. Piano, Lo-fi, Acoustic"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#282828]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" disabled={!title.trim() || !artist.trim()}>
            {initialProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
