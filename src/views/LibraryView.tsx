import React from 'react';
import { Folder, Project } from '../types';
import { ProjectGrid } from '../components/library/ProjectGrid';
import { FolderList } from '../components/library/FolderList';

interface LibraryViewProps {
  folders: Folder[];
  projects: Project[];
  searchQuery: string;
  onProjectSelect: (project: Project) => void;
  onFolderSelect: (folder: Folder) => void;
  activeFilterTab: string;
  onFilterChange: (filter: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  folders,
  projects,
  searchQuery,
  onProjectSelect,
  onFolderSelect,
}) => {
  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    return (
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="py-10 px-8 lg:px-12 space-y-12 max-w-7xl mx-auto pb-36">
      {/* Simple Library Title */}
      <div className="border-b border-[#282828] pb-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
          Library
        </h1>
      </div>

      {/* 1. Folders Section */}
      {!searchQuery && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#E5E2E1]">Folders</h2>
          <FolderList folders={folders} onFolderSelect={onFolderSelect} />
        </section>
      )}

      {/* 2. Projects Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-[#E5E2E1]">Projects</h2>
        <ProjectGrid projects={filteredProjects} onProjectSelect={onProjectSelect} />
      </section>
    </div>
  );
};

