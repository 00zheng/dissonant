import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { LibraryView } from './views/LibraryView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { MOCK_FOLDERS, MOCK_PROJECTS } from './data/mockData';
import { Folder, Project, ViewMode } from './types';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('library');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setCurrentView('library');
  };

  const handleBackToLibrary = () => {
    setSelectedProject(null);
    setCurrentView('library');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-[#E5E2E1]">
      {/* Desktop Navigation Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            if (view === 'library') setSelectedProject(null);
          }}
          activeFilter={activeFilter}
          onFilterSelect={(filter) => setActiveFilter(filter)}
        />
      </div>

      {/* Main View Shell */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBack={selectedProject ? handleBackToLibrary : undefined}
          title={selectedProject ? selectedProject.title : undefined}
        />

        {/* Scrollable Main Screen Content */}
        <main className="flex-1 overflow-y-auto bg-[#000000]">
          {currentView === 'project_detail' && selectedProject ? (
            <ProjectDetailView project={selectedProject} />
          ) : (
            <LibraryView
              folders={MOCK_FOLDERS}
              projects={MOCK_PROJECTS}
              searchQuery={searchQuery}
              onProjectSelect={handleProjectSelect}
              onFolderSelect={handleFolderSelect}
              activeFilterTab={activeFilter}
              onFilterChange={setActiveFilter}
            />
          )}
        </main>

        {/* Mobile Navigation */}
        <MobileNav
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            if (view === 'library') setSelectedProject(null);
          }}
        />

        {/* Fixed Bottom Audio Player */}
        <PlayerBar />
      </div>
    </div>
  );
};

export function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}

export default App;
