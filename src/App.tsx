import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { LibraryView } from './views/LibraryView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { FolderModal } from './components/ui/FolderModal';
import { ProjectModal } from './components/ui/ProjectModal';
import { MoveProjectModal } from './components/ui/MoveProjectModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { Folder, Project, ViewMode } from './types';
import {
  initDB,
  dbSaveFolder,
  dbDeleteFolder,
  dbSaveProject,
  dbDeleteProject,
  dbMoveProject,
} from './services/db';

export const AppContent: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('library');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modal States
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultFolderIdForProject, setDefaultFolderIdForProject] = useState<string | undefined>(undefined);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [movingProject, setMovingProject] = useState<Project | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'folder' | 'project';
    id: string;
    name: string;
  } | null>(null);

  // Initialize DB on Mount
  useEffect(() => {
    initDB().then(({ folders: loadedFolders, projects: loadedProjects }) => {
      setFolders(loadedFolders);
      setProjects(loadedProjects);
    });
  }, []);

  // Compute folders with updated itemCount
  const computedFolders = folders.map((folder) => {
    const count = projects.filter((p) => p.folderId === folder.id).length;
    return { ...folder, itemCount: count };
  });

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFolderSelect = (folder: Folder | null) => {
    setSelectedFolder(folder);
    setCurrentView('library');
  };

  const handleBackToLibrary = () => {
    setSelectedProject(null);
    setCurrentView('library');
  };

  // --- Folder Handlers ---
  const handleOpenCreateFolder = () => {
    setEditingFolder(null);
    setFolderModalOpen(true);
  };

  const handleOpenEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (data: { name: string; description: string }) => {
    if (editingFolder) {
      const updated: Folder = {
        ...editingFolder,
        name: data.name,
        description: data.description,
        updatedAt: 'JUST NOW',
      };
      await dbSaveFolder(updated);
      setFolders((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      if (selectedFolder?.id === updated.id) {
        setSelectedFolder(updated);
      }
    } else {
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: data.name,
        description: data.description,
        itemCount: 0,
        updatedAt: 'JUST NOW',
      };
      await dbSaveFolder(newFolder);
      setFolders((prev) => [newFolder, ...prev]);
    }
  };

  const handlePromptDeleteFolder = (folder: Folder) => {
    setDeleteTarget({ type: 'folder', id: folder.id, name: folder.name });
    setConfirmModalOpen(true);
  };

  // --- Project Handlers ---
  const handleOpenCreateProject = (defaultFolderId?: string) => {
    setEditingProject(null);
    setDefaultFolderIdForProject(defaultFolderId);
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (data: Partial<Project>) => {
    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        ...data,
      } as Project;
      await dbSaveProject(updated);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProject?.id === updated.id) {
        setSelectedProject(updated);
      }
    } else {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: data.title || 'Untitled Project',
        artist: data.artist || 'Unknown Artist',
        coverUrl: data.coverUrl || '',
        category: data.category || 'Album',
        folderId: data.folderId,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        tracksCount: 0,
        totalDuration: '00m 00s',
        tags: data.tags || [],
        tracks: [],
      };
      await dbSaveProject(newProject);
      setProjects((prev) => [newProject, ...prev]);
    }
  };

  const handleOpenMoveProject = (project: Project) => {
    setMovingProject(project);
    setMoveModalOpen(true);
  };

  const handleMoveProject = async (projectId: string, targetFolderId?: string) => {
    const updated = await dbMoveProject(projectId, targetFolderId);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    if (selectedProject?.id === projectId) {
      setSelectedProject(updated);
    }
  };

  const handlePromptDeleteProject = (project: Project) => {
    setDeleteTarget({ type: 'project', id: project.id, name: project.title });
    setConfirmModalOpen(true);
  };

  // --- Delete Handler ---
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'folder') {
      await dbDeleteFolder(deleteTarget.id);
      setFolders((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setProjects((prev) =>
        prev.map((p) => (p.folderId === deleteTarget.id ? { ...p, folderId: undefined } : p))
      );
      if (selectedFolder?.id === deleteTarget.id) {
        setSelectedFolder(null);
      }
    } else if (deleteTarget.type === 'project') {
      await dbDeleteProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (selectedProject?.id === deleteTarget.id) {
        setSelectedProject(null);
        setCurrentView('library');
      }
    }
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-[#E5E2E1]">
      {/* Desktop Navigation Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            if (view === 'library') {
              setSelectedProject(null);
              setSelectedFolder(null);
            }
          }}
          activeFilter={activeFilter}
          onFilterSelect={(filter) => {
            setActiveFilter(filter);
            if (filter === 'Folders') setSelectedFolder(null);
          }}
          onCreateProject={() => handleOpenCreateProject()}
          projects={projects}
          onProjectSelect={handleProjectSelect}
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
            <ProjectDetailView
              project={selectedProject}
              onEditProject={handleOpenEditProject}
              onMoveProject={handleOpenMoveProject}
              onDeleteProject={handlePromptDeleteProject}
            />
          ) : (
            <LibraryView
              folders={computedFolders}
              projects={projects}
              searchQuery={searchQuery}
              selectedFolder={selectedFolder}
              onProjectSelect={handleProjectSelect}
              onFolderSelect={handleFolderSelect}
              activeFilterTab={activeFilter}
              onFilterChange={setActiveFilter}
              onCreateFolder={handleOpenCreateFolder}
              onEditFolder={handleOpenEditFolder}
              onDeleteFolder={handlePromptDeleteFolder}
              onCreateProject={handleOpenCreateProject}
              onEditProject={handleOpenEditProject}
              onMoveProject={handleOpenMoveProject}
              onDeleteProject={handlePromptDeleteProject}
            />
          )}
        </main>

        {/* Mobile Navigation */}
        <MobileNav
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            if (view === 'library') {
              setSelectedProject(null);
              setSelectedFolder(null);
            }
          }}
        />

        {/* Fixed Bottom Audio Player */}
        <PlayerBar />
      </div>

      {/* Dialog Modals */}
      <FolderModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onSave={handleSaveFolder}
        initialFolder={editingFolder}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleSaveProject}
        folders={computedFolders}
        initialProject={editingProject}
        defaultFolderId={defaultFolderIdForProject}
      />

      <MoveProjectModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        onMove={handleMoveProject}
        project={movingProject}
        folders={computedFolders}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === 'folder' ? 'Delete Folder' : 'Delete Project'
        }
        message={
          deleteTarget?.type === 'folder'
            ? `Are you sure you want to delete the folder "${deleteTarget?.name}"? Any projects inside will remain intact in your main library.`
            : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
      />
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
