import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { LibraryView } from './views/LibraryView';
import { FoldersView } from './views/FoldersView';
import { ProjectsView } from './views/ProjectsView';
import { FolderDetailView } from './views/FolderDetailView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { FolderModal } from './components/ui/FolderModal';
import { ProjectModal } from './components/ui/ProjectModal';
import { MoveProjectModal } from './components/ui/MoveProjectModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { UploadTrackModal } from './components/ui/UploadTrackModal';
import { TrackModal } from './components/ui/TrackModal';
import { AuthModal } from './components/auth/AuthModal';
import { Folder, Project, Track, ViewMode, RouteState } from './types';
import {
  initUserData,
  fsSaveFolder,
  fsDeleteFolder,
  fsSaveProject,
  fsDeleteProject,
  fsMoveProject,
  fsDeleteTrack,
  fsReorderTracks,
  fsUploadCoverImage,
  fsDeleteCoverImage,
} from './services/db';
import { formatTotalDuration } from './services/audio';
import { NEUTRAL_COVER_FALLBACK } from './data/mockData';
import { getDownloadURL } from 'firebase/storage';
import { LogIn, Lock, Music2, ShieldCheck, Database, Loader2, ArrowLeft } from 'lucide-react';

function parseRoute(pathname: string): RouteState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/' || cleanPath === '/library') {
    return { type: 'library' };
  }
  if (cleanPath === '/folders') {
    return { type: 'folders' };
  }
  const folderMatch = cleanPath.match(/^\/folders\/([^/]+)$/);
  if (folderMatch) {
    return { type: 'folder_detail', folderId: decodeURIComponent(folderMatch[1]) };
  }
  if (cleanPath === '/projects') {
    return { type: 'projects' };
  }
  const projectMatch = cleanPath.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return { type: 'project_detail', projectId: decodeURIComponent(projectMatch[1]) };
  }

  return { type: 'library' };
}

function getRoutePath(route: RouteState): string {
  switch (route.type) {
    case 'library':
      return '/library';
    case 'folders':
      return '/folders';
    case 'folder_detail':
      return `/folders/${encodeURIComponent(route.folderId)}`;
    case 'projects':
      return '/projects';
    case 'project_detail':
      return `/projects/${encodeURIComponent(route.projectId)}`;
    default:
      return '/library';
  }
}

export const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [route, setRoute] = useState<RouteState>(() => parseRoute(window.location.pathname));
  const [searchQuery, setSearchQuery] = useState('');

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

  // Sync with browser history popstate (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Canonicalize root URL '/' to '/library' without reloading
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/library');
    }
  }, []);

  const navigate = (to: string | RouteState) => {
    const targetState = typeof to === 'string' ? parseRoute(to) : to;
    const targetPath = typeof to === 'string' ? to : getRoutePath(to);

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setRoute(targetState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    }
  }, [user]);

  // Compute folders with updated itemCount
  const computedFolders = folders.map((folder) => {
    const count = projects.filter((p) => p.folderId === folder.id).length;
    return { ...folder, itemCount: count };
  });

  const selectedProject =
    route.type === 'project_detail'
      ? projects.find((p) => p.id === route.projectId) || null
      : null;

  const selectedFolder =
    route.type === 'folder_detail'
      ? computedFolders.find((f) => f.id === route.folderId) || null
      : null;

  const currentView: ViewMode = route.type;

  const openAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleProjectSelect = (project: Project) => {
    navigate({ type: 'project_detail', projectId: project.id });
  };

  const handleFolderSelect = (folder: Folder) => {
    navigate({ type: 'folder_detail', folderId: folder.id });
  };

  const handleSidebarNavigate = (view: ViewMode) => {
    if (view === 'library') navigate('/library');
    else if (view === 'folders') navigate('/folders');
    else if (view === 'projects') navigate('/projects');
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
  };

  // --- Cover Art Handlers ---
  const handleChangeCover = async (project: Project, file: File) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    // Delete old storage cover if exists
    if (project.coverStoragePath) {
      await fsDeleteCoverImage(project.coverStoragePath);
    }
    const { task, storagePath } = fsUploadCoverImage(user.uid, project.id, file);
    const snapshot = await task;
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const updatedProject: Project = {
      ...project,
      coverUrl: downloadUrl,
      coverStoragePath: storagePath,
    };
    await fsSaveProject(user.uid, updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleRemoveCover = async (project: Project) => {
    if (!user) return;
    if (project.coverStoragePath) {
      await fsDeleteCoverImage(project.coverStoragePath);
    }
    const updatedProject: Project = {
      ...project,
      coverUrl: NEUTRAL_COVER_FALLBACK,
      coverStoragePath: undefined,
    };
    await fsSaveProject(user.uid, updatedProject);
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
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
      if (route.type === 'folder_detail' && route.folderId === deleteTarget.id) {
        navigate('/folders');
      }
    } else if (deleteTarget.type === 'project') {
      const proj = projects.find((p) => p.id === deleteTarget.id);
      await fsDeleteProject(user.uid, deleteTarget.id, proj?.coverStoragePath);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (route.type === 'project_detail' && route.projectId === deleteTarget.id) {
        navigate('/projects');
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
          onNavigate={handleSidebarNavigate}
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
          onBack={
            route.type === 'project_detail'
              ? () => navigate('/projects')
              : route.type === 'folder_detail'
              ? () => navigate('/folders')
              : undefined
          }
          title={
            route.type === 'project_detail'
              ? selectedProject?.title || 'Project'
              : route.type === 'folder_detail'
              ? selectedFolder?.name || 'Folder'
              : undefined
          }
          onOpenAuth={() => openAuth('signin')}
        />

        {/* Scrollable Main Screen Content */}
        <main className="flex-1 overflow-y-auto bg-[#000000]">
          {!user ? (
            /* Logged Out Welcome View */
            <div className="min-h-full flex flex-col items-center justify-center p-5 sm:p-8 text-center max-w-xl mx-auto pb-44">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#131313] border border-[#282828] rounded-[8px] flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
                <Music2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF3B00]" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-[#FF3B00] uppercase mb-2">
                Dissonant Cloud
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#E5E2E1] mb-2.5 sm:mb-3">
                Your Personal Music Workspace
              </h1>
              <p className="text-xs sm:text-sm text-[#E8BDB3]/70 mb-6 sm:mb-8 leading-relaxed max-w-md">
                Sign in to synchronize your folders, music projects, and audio files across devices with isolated cloud storage.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full max-w-xs mb-8 sm:mb-10">
                <button
                  onClick={() => openAuth('signin')}
                  className="flex-1 bg-[#E5E2E1] hover:bg-white text-black font-bold py-2.5 sm:py-3 px-5 rounded-[4px] flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all cursor-pointer min-h-[44px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="flex-1 bg-[#1C1B1B] hover:bg-[#2A2A2A] border border-[#282828] text-white font-bold py-2.5 sm:py-3 px-5 rounded-[4px] flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-all cursor-pointer min-h-[44px]"
                >
                  <span>Create Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full pt-6 sm:pt-8 border-t border-[#282828] text-left">
                <div className="bg-[#0E0E0E] p-3.5 sm:p-4 rounded-[4px] border border-[#1C1B1B]">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3B00] mb-2" />
                  <h4 className="text-xs font-bold text-[#E5E2E1] mb-1">User Isolation</h4>
                  <p className="text-[11px] text-[#E8BDB3]/50">Every project and song is secured under your unique UID.</p>
                </div>
                <div className="bg-[#0E0E0E] p-3.5 sm:p-4 rounded-[4px] border border-[#1C1B1B]">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3B00] mb-2" />
                  <h4 className="text-xs font-bold text-[#E5E2E1] mb-1">Cloud Firestore</h4>
                  <p className="text-[11px] text-[#E8BDB3]/50">Instant metadata sync with real-time playlist ordering.</p>
                </div>
                <div className="bg-[#0E0E0E] p-3.5 sm:p-4 rounded-[4px] border border-[#1C1B1B]">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3B00] mb-2" />
                  <h4 className="text-xs font-bold text-[#E5E2E1] mb-1">Local Audio Cache</h4>
                  <p className="text-[11px] text-[#E8BDB3]/50">High-performance audio processing with zero bandwidth lag.</p>
                </div>
              </div>
            </div>
          ) : dataLoading ? (
            <div className="min-h-full flex flex-col items-center justify-center p-12">
              <Loader2 className="w-7 h-7 animate-spin text-[#FF3B00] mb-3" />
              <span className="text-xs font-bold tracking-widest text-[#E8BDB3]/60 uppercase">
                Loading Your Music...
              </span>
            </div>
          ) : route.type === 'folder_detail' ? (
            selectedFolder ? (
              <FolderDetailView
                folder={selectedFolder}
                projects={projects}
                searchQuery={searchQuery}
                onBack={() => navigate('/folders')}
                onProjectSelect={handleProjectSelect}
                onEditFolder={handleOpenEditFolder}
                onDeleteFolder={handlePromptDeleteFolder}
                onCreateProject={handleOpenCreateProject}
                onEditProject={handleOpenEditProject}
                onMoveProject={handleOpenMoveProject}
                onDeleteProject={handlePromptDeleteProject}
              />
            ) : (
              <div className="py-20 px-8 text-center max-w-md mx-auto space-y-4">
                <p className="text-lg font-bold text-[#E5E2E1]">Folder Not Found</p>
                <p className="text-xs text-[#E8BDB3]/60">The requested folder does not exist or has been deleted.</p>
                <button
                  onClick={() => navigate('/folders')}
                  className="bg-[#1C1B1B] hover:bg-[#2A2A2A] border border-[#282828] text-white text-xs font-semibold py-2 px-4 rounded-[4px] inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Folders</span>
                </button>
              </div>
            )
          ) : route.type === 'project_detail' ? (
            selectedProject ? (
              <ProjectDetailView
                project={selectedProject}
                onEditProject={handleOpenEditProject}
                onMoveProject={handleOpenMoveProject}
                onDeleteProject={handlePromptDeleteProject}
                onUploadTracks={handleOpenUploadTracks}
                onEditTrack={handleOpenEditTrack}
                onDeleteTrack={handlePromptDeleteTrack}
                onReorderTracks={handleReorderTracks}
                onChangeCover={handleChangeCover}
                onRemoveCover={handleRemoveCover}
              />
            ) : (
              <div className="py-20 px-8 text-center max-w-md mx-auto space-y-4">
                <p className="text-lg font-bold text-[#E5E2E1]">Project Not Found</p>
                <p className="text-xs text-[#E8BDB3]/60">The requested project does not exist or has been deleted.</p>
                <button
                  onClick={() => navigate('/projects')}
                  className="bg-[#1C1B1B] hover:bg-[#2A2A2A] border border-[#282828] text-white text-xs font-semibold py-2 px-4 rounded-[4px] inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Projects</span>
                </button>
              </div>
            )
          ) : route.type === 'folders' ? (
            <FoldersView
              folders={computedFolders}
              searchQuery={searchQuery}
              onFolderSelect={handleFolderSelect}
              onCreateFolder={handleOpenCreateFolder}
              onEditFolder={handleOpenEditFolder}
              onDeleteFolder={handlePromptDeleteFolder}
            />
          ) : route.type === 'projects' ? (
            <ProjectsView
              projects={projects}
              searchQuery={searchQuery}
              onProjectSelect={handleProjectSelect}
              onCreateProject={handleOpenCreateProject}
              onEditProject={handleOpenEditProject}
              onMoveProject={handleOpenMoveProject}
              onDeleteProject={handlePromptDeleteProject}
            />
          ) : (
            <LibraryView
              folders={computedFolders}
              projects={projects}
              searchQuery={searchQuery}
              onProjectSelect={handleProjectSelect}
              onFolderSelect={handleFolderSelect}
              onViewAllFolders={() => navigate('/folders')}
              onViewAllProjects={() => navigate('/projects')}
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
          onNavigate={handleSidebarNavigate}
          onOpenAuth={() => openAuth('signin')}
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
