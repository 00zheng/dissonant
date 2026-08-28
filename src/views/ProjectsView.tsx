import React from 'react';
import { Project, ProjectCategory } from '../types';
import { ProjectGrid } from '../components/library/ProjectGrid';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Plus, Disc } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  searchQuery?: string;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
  onEditProject?: (project: Project) => void;
  onMoveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

const CATEGORIES = ['All', 'Album', 'EP', 'Single', 'Stems', 'Demo'];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  searchQuery = '',
  activeCategory,
  onCategoryChange,
  onProjectSelect,
  onCreateProject,
  onEditProject,
  onMoveProject,
  onDeleteProject,
}) => {
  const filteredProjects = projects.filter((project) => {
    // 1. Category Filter
    if (activeCategory !== 'All' && project.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    // 2. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(q) ||
        project.artist.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'All') return projects.length;
    return projects.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length;
  };

  return (
    <div className="py-10 px-8 lg:px-12 space-y-8 max-w-7xl mx-auto pb-36">
      {/* Header bar */}
      <div className="border-b border-[#282828] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Disc className="w-7 h-7 text-[#FF3B00]" />
            <h1 className="text-3xl lg:text-4xl font-bold text-[#E5E2E1] tracking-tight">
              Projects
            </h1>
          </div>
          <p className="text-xs text-[#E8BDB3]/60 mt-1">
            Explore and manage your multi-track recordings, stems, and album releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            onClick={onCreateProject}
            className="gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            count={getCategoryCount(cat)}
            active={activeCategory === cat}
            onClick={() => onCategoryChange(cat)}
          />
        ))}
      </div>

      {/* Projects Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#E5E2E1]">
            {activeCategory === 'All' ? 'All Projects' : `${activeCategory} Projects`}
          </h2>
          <span className="text-xs text-[#E8BDB3]/50">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        <ProjectGrid
          projects={filteredProjects}
          onProjectSelect={onProjectSelect}
          onEditProject={onEditProject}
          onMoveProject={onMoveProject}
          onDeleteProject={onDeleteProject}
          onCreateProject={onCreateProject}
        />
      </section>
    </div>
  );
};
