import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { UploadTrackModal } from './components/ui/UploadTrackModal';
import { TrackModal } from './components/ui/TrackModal';
import { AuthModal } from './components/auth/AuthModal';
import { Folder, Project, Track, ViewMode } from './types';
import {
  initUserData,
  fsSaveFolder,
  fsDeleteFolder,
  fsSaveProject,
  fsDeleteProject,
  fsMoveProject,
  fsDeleteTrack,
  fsReorderTracks,
  dbSaveAudioBlob,
} from './services/db';
import { processAudioUpload, formatTotalDuration } from './services/audio';
import { LogIn, Lock, Music2, ShieldCheck, Database, Loader2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('library');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultFolderIdForProject, setDefaultFolderIdForProject] = useState<string | undefined>(undefined);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [movingProject, setMovingProject] = useState<Project | null>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'folder' | 'project' | 'track';
    id: string;
    name: string;
    item?: Track;
  } | null>(null);

  // Load User Data from Firestore on Auth Change
  useEffect(() => {
    if (user) {
      setDataLoading(true);
      initUserData(user.uid)
        .then(({ folders: loadedFolders, projects: loadedProjects }) => {
          setFolders(loadedFolders);
          setProjects(loadedProjects);
        })
        .catch((err) => {
          console.error('Failed to load user data from Firestore:', err);
        })
        .finally(() => {
          setDataLoading(false);
        });
    } else {
      setFolders([]);
      setProjects([]);
      setSelectedProject(null);
      setSelectedFolder(null);
    }
  }, [user]);

  // Compute folders with updated itemCount
  const computedFolders = folders.map((folder) => {
    const count = projects.filter((p) => p.folderId === folder.id).length;
    return { ...folder, itemCount: count };
  });

  const openAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

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
    if (!user) {
      openAuth('signin');
      return;
    }
    setEditingFolder(null);
    setFolderModalOpen(true);
  };

  const handleOpenEditFolder = (folder: Folder) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    setEditingFolder(folder);
    setFolderModalOpen(true);
  };

  const handleSaveFolder = async (data: { name: string; description: string }) => {
    if (!user) return;
    if (editingFolder) {
      const updated: Folder = {
        ...editingFolder,
        name: data.name,
        description: data.description,
        updatedAt: 'JUST NOW',
      };
      await fsSaveFolder(user.uid, updated);
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
      await fsSaveFolder(user.uid, newFolder);
      setFolders((prev) => [newFolder, ...prev]);
    }
  };

  const handlePromptDeleteFolder = (folder: Folder) => {
    if (!user) return;
    setDeleteTarget({ type: 'folder', id: folder.id, name: folder.name });
    setConfirmModalOpen(true);
  };

  // --- Project Handlers ---
  const handleOpenCreateProject = (defaultFolderId?: string) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    setEditingProject(null);
    setDefaultFolderIdForProject(defaultFolderId);
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (data: Partial<Project>) => {
    if (!user) return;
    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        ...data,
      } as Project;
      await fsSaveProject(user.uid, updated);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProject?.id === updated.id) {
        setSelectedProject(updated);
      }
    } else {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: data.title || 'Untitled Project',
        artist: data.artist || (user.displayName || 'Producer'),
        coverUrl: data.coverUrl || '',
        category: data.category || 'Album',
        folderId: data.folderId,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        tracksCount: 0,
        totalDuration: '00m 00s',
        tags: data.tags || [],
        tracks: [],
      };
      await fsSaveProject(user.uid, newProject);
      setProjects((prev) => [newProject, ...prev]);
    }
  };

  const handleOpenMoveProject = (project: Project) => {
    if (!user) return;
    setMovingProject(project);
    setMoveModalOpen(true);
  };

  const handleMoveProject = async (projectId: string, targetFolderId?: string) => {
    if (!user) return;
    await fsMoveProject(user.uid, projectId, targetFolderId);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, folderId: targetFolderId || undefined } : p))
    );
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => (prev ? { ...prev, folderId: targetFolderId || undefined } : null));
    }
  };

  const handlePromptDeleteProject = (project: Project) => {
    if (!user) return;
    setDeleteTarget({ type: 'project', id: project.id, name: project.title });
    setConfirmModalOpen(true);
  };

  // --- Track Handlers ---
  const handleOpenUploadTracks = () => {
    if (!user) {
      openAuth('signin');
      return;
    }
    if (!selectedProject) return;
    setUploadModalOpen(true);
  };

  const handleUploadTracks = async (newTracks: Track[]) => {
    if (!user || !selectedProject || newTracks.length === 0) return;

    const updatedTracks = [...(selectedProject.tracks || []), ...newTracks];
    const updatedProject: Project = {
      ...selectedProject,
      tracks: updatedTracks,
      tracksCount: updatedTracks.length,
      totalDuration: formatTotalDuration(updatedTracks),
    };

    await fsSaveProject(user.uid, updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);
  };

  const handleOpenEditTrack = (track: Track) => {
    if (!user) return;
    setEditingTrack(track);
    setTrackModalOpen(true);
  };

  const handleSaveTrack = async (trackId: string, data: Partial<Track>) => {
    if (!user || !selectedProject) return;

    const updatedTracks = (selectedProject.tracks || []).map((t) =>
      t.id === trackId ? { ...t, ...data } : t
    );

    const updatedProject: Project = {
      ...selectedProject,
      tracks: updatedTracks,
    };

    await fsSaveProject(user.uid, updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);
  };

  const handlePromptDeleteTrack = (track: Track) => {
    if (!user) return;
    setDeleteTarget({ type: 'track', id: track.id, name: track.title, item: track });
    setConfirmModalOpen(true);
  };

  const handleReorderTracks = async (reorderedTracks: Track[]) => {
    if (!user || !selectedProject) return;

    const updatedProject: Project = {
      ...selectedProject,
      tracks: reorderedTracks,
    };

    await fsReorderTracks(user.uid, reorderedTracks);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setSelectedProject(updatedProject);
  };

  // --- Deletion Handler ---
  const handleConfirmDelete = async () => {
    if (!user || !deleteTarget) return;

    if (deleteTarget.type === 'folder') {
      await fsDeleteFolder(user.uid, deleteTarget.id);
      setFolders((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      setProjects((prev) =>
        prev.map((p) => (p.folderId === deleteTarget.id ? { ...p, folderId: undefined } : p))
      );
      if (selectedFolder?.id === deleteTarget.id) {
        setSelectedFolder(null);
      }
    } else if (deleteTarget.type === 'project') {
      await fsDeleteProject(user.uid, deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (selectedProject?.id === deleteTarget.id) {
        setSelectedProject(null);
        setCurrentView('library');
      }
    } else if (deleteTarget.type === 'track' && selectedProject) {
      await fsDeleteTrack(user.uid, deleteTarget.id, deleteTarget.item?.audioUrl);
      const updatedTracks = (selectedProject.tracks || []).filter((t) => t.id !== deleteTarget.id);
      const updatedProject: Project = {
        ...selectedProject,
        tracks: updatedTracks,
        tracksCount: updatedTracks.length,
        totalDuration: formatTotalDuration(updatedTracks),
      };

      await fsSaveProject(user.uid, updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
      setSelectedProject(updatedProject);
    }

    setDeleteTarget(null);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#000000] text-[#E5E2E1]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF3B00]" />
          <span className="text-xs font-bold tracking-widest text-[#E8BDB3]/60 uppercase">
            Loading Dissonant...
          </span>
        </div>
      </div>
    );
  }

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
          onOpenAuth={() => openAuth('signin')}
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
          onOpenAuth={() => openAuth('signin')}
        />

        {/* Scrollable Main Screen Content */}
        <main className="flex-1 overflow-y-auto bg-[#000000]">
          {!user ? (
            /* Logged Out Welcome View */
            <div className="min-h-full flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-[#131313] border border-[#282828] rounded-[8px] flex items-center justify-center mb-6 shadow-xl">
                <Music2 className="w-8 h-8 text-[#FF3B00]" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-[#FF3B00] uppercase mb-2">
                Dissonant Cloud
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#E5E2E1] mb-3">
                Your Private Studio Workspace
              </h1>
              <p className="text-sm text-[#E8BDB3]/70 mb-8 leading-relaxed">
                Sign in to synchronize your folders, multi-track projects, stem versions, and custom audio sessions across devices with isolated Firestore security.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mb-10">
                <button
                  onClick={() => openAuth('signin')}
                  className="flex-1 bg-[#E5E2E1] hover:bg-white text-black font-bold py-3 px-5 rounded-[4px] flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="flex-1 bg-[#1C1B1B] hover:bg-[#2A2A2A] border border-[#282828] text-white font-bold py-3 px-5 rounded-[4px] flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  <span>Create Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 border-t border-[#282828] text-left">
                <div className="bg-[#0E0E0E] p-4 rounded-[4px] border border-[#1C1B1B]">
                  <ShieldCheck className="w-5 h-5 text-[#FF3B00] mb-2" />
                  <h4 className="text-xs font-bold text-[#E5E2E1] mb-1">User Isolation</h4>
                  <p className="text-[11px] text-[#E8BDB3]/50">Every project and stem is secured under your unique UID.</p>
                </div>
                <div className="bg-[#0E0E0E] p-4 rounded-[4px] border border-[#1C1B1B]">
                  <Database className="w-5 h-5 text-[#FF3B00] mb-2" />
                  <h4 className="text-xs font-bold text-[#E5E2E1] mb-1">Cloud Firestore</h4>
                  <p className="text-[11px] text-[#E8BDB3]/50">Instant metadata sync with real-time playlist ordering.</p>
                </div>
                <div className="bg-[#0E0E0E] p-4 rounded-[4px] border border-[#1C1B1B]">
                  <Lock className="w-5 h-5 text-[#FF3B00] mb-2" />
                  <h4 className="text-xs font-bold text-[#E5E2E1] mb-1">Local Audio Cache</h4>
                  <p className="text-[11px] text-[#E8BDB3]/50">High-performance audio processing with zero bandwidth lag.</p>
                </div>
              </div>
            </div>
          ) : dataLoading ? (
            <div className="min-h-full flex flex-col items-center justify-center p-12">
              <Loader2 className="w-7 h-7 animate-spin text-[#FF3B00] mb-3" />
              <span className="text-xs font-bold tracking-widest text-[#E8BDB3]/60 uppercase">
                Loading Your Cloud Studio...
              </span>
            </div>
          ) : currentView === 'project_detail' && selectedProject ? (
            <ProjectDetailView
              project={selectedProject}
              onEditProject={handleOpenEditProject}
              onMoveProject={handleOpenMoveProject}
              onDeleteProject={handlePromptDeleteProject}
              onUploadTracks={handleOpenUploadTracks}
              onEditTrack={handleOpenEditTrack}
              onDeleteTrack={handlePromptDeleteTrack}
              onReorderTracks={handleReorderTracks}
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
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

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

      <UploadTrackModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadTracks}
        project={selectedProject}
      />

      <TrackModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        onSave={handleSaveTrack}
        track={editingTrack}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === 'folder'
            ? 'Delete Folder'
            : deleteTarget?.type === 'project'
            ? 'Delete Project'
            : 'Remove Track'
        }
        message={
          deleteTarget?.type === 'folder'
            ? `Are you sure you want to delete the folder "${deleteTarget?.name}"? Any projects inside will remain intact in your main library.`
            : deleteTarget?.type === 'project'
            ? `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
            : `Are you sure you want to remove "${deleteTarget?.name}" from this project?`
        }
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
