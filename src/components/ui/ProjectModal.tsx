import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Folder, Project, ProjectCategory } from '../../types';

const CATEGORIES: ProjectCategory[] = ['Album', 'EP', 'Single', 'Stems', 'Demo'];

const createSvgCover = (title: string, bg1: string = '#0E0E0E', bg2: string = '#1C1B1B', accent: string = '#FF3B00') => {
  const encodedSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}" />
          <stop offset="100%" stop-color="${bg2}" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)" />
      <rect x="30" y="30" width="340" height="340" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.3" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="${accent}" stroke-width="3" />
      <circle cx="200" cy="200" r="40" fill="${accent}" />
      <line x1="200" y1="30" x2="200" y2="370" stroke="${accent}" stroke-width="1" stroke-opacity="0.4" />
      <line x1="30" y1="200" x2="370" y2="200" stroke="${accent}" stroke-width="1" stroke-opacity="0.4" />
      <text x="45" y="355" font-family="sans-serif" font-size="20" font-weight="800" fill="#E5E2E1" letter-spacing="2">${title.toUpperCase()}</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encodedSvg}`;
};

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
      coverUrl: initialProject?.coverUrl || createSvgCover(title.trim()),
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
