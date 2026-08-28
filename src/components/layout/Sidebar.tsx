import React from 'react';
import { Library, Folder, Disc, Settings, Plus } from 'lucide-react';
import { Project, ViewMode } from '../../types';
import { clsx } from 'clsx';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
  onCreateProject?: () => void;
  projects?: Project[];
  onProjectSelect?: (project: Project) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeFilter = 'All',
  onFilterSelect,
  onCreateProject,
  projects = [],
  onProjectSelect,
}) => {
  const mainNavItems = [
    { id: 'library', label: 'Library', icon: Library },
    { id: 'folders', label: 'Folders', icon: Folder },
    { id: 'albums', label: 'Projects', icon: Disc },
  ];

  const recentProjects = projects.slice(0, 5);

  return (
    <aside className="w-64 bg-[#0E0E0E] border-r border-[#282828] h-full flex flex-col justify-between select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-6 border-b border-[#282828] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E5E2E1] rounded-[4px] flex items-center justify-center font-bold text-black text-base">
              D
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-[#E5E2E1]">Dissonant</h1>
              <p className="text-[11px] text-[#E8BDB3]/60">Personal Workspace</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              if (onCreateProject) {
                onCreateProject();
              } else {
                onNavigate('library');
              }
            }}
            className="w-full bg-[#E5E2E1] hover:bg-white text-black font-semibold py-2.5 px-4 rounded-[4px] flex items-center justify-center gap-2 text-xs tracking-wide transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-2 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[#E8BDB3]/50 text-[11px] font-medium">
              Navigation
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id || (currentView === 'library' && activeFilter === item.label);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate('library');
                      if (onFilterSelect) onFilterSelect(item.label);
                    }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] transition-colors text-left cursor-pointer text-xs font-medium',
                      isActive
                        ? 'bg-[#1C1B1B] text-[#E5E2E1]'
                        : 'text-[#E8BDB3]/70 hover:bg-[#131313] hover:text-[#E5E2E1]'
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', isActive ? 'text-[#FF3B00]' : 'text-[#E8BDB3]/50')} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[#E8BDB3]/50 text-[11px] font-medium">
              Recent Projects
            </div>
            <div className="space-y-1 text-xs">
              {recentProjects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    if (onProjectSelect) {
                      onProjectSelect(proj);
                    } else {
                      onNavigate('library');
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 text-[#E8BDB3]/70 hover:text-white truncate transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">{proj.title}</span>
                  <span className="text-[11px] text-[#E8BDB3]/50">{proj.tracksCount || proj.tracks.length}</span>
                </button>
              ))}
              {recentProjects.length === 0 && (
                <p className="px-3 text-[11px] text-[#E8BDB3]/40">No projects yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#282828] bg-[#0E0E0E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2A2A2A] border border-[#282828] flex items-center justify-center font-semibold text-xs text-[#E5E2E1]">
            N
          </div>
          <div className="leading-none">
            <p className="font-semibold text-xs text-[#E5E2E1]">Nocturne</p>
          </div>
        </div>
        <button className="text-[#E8BDB3]/50 hover:text-white p-1 rounded transition-colors cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
