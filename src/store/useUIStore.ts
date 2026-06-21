import { create } from 'zustand';

interface UIStoreState {
  // Navigation / Modals overlay states
  activePanel: 'reflection' | 'logs' | 'projection' | 'community' | null;
  logActionModalOpen: boolean;
  
  // Accessibility features
  highContrastMode: boolean; // Shift green palette to blue-to-yellow transitions
  screenReaderMirrorText: string; // Accessible speech feedback updating in realtime
  prefersReducedMotion: boolean;
  
  // Action dispatchers
  setActivePanel: (panel: 'reflection' | 'logs' | 'projection' | 'community' | null) => void;
  setLogActionModalOpen: (open: boolean) => void;
  toggleHighContrastMode: () => void;
  setScreenReaderMirrorText: (text: string) => void;
  setPrefersReducedMotion: (active: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  activePanel: null,
  logActionModalOpen: false,
  highContrastMode: false,
  screenReaderMirrorText: 'Welcome to your sanctuary. Your forest is currently flourishing.',
  prefersReducedMotion: false,
  
  setActivePanel: (activePanel) => set({ activePanel }),
  setLogActionModalOpen: (logActionModalOpen) => set({ logActionModalOpen }),
  toggleHighContrastMode: () => set((state) => ({ highContrastMode: !state.highContrastMode })),
  setScreenReaderMirrorText: (screenReaderMirrorText) => set({ screenReaderMirrorText }),
  setPrefersReducedMotion: (prefersReducedMotion) => set({ prefersReducedMotion })
}));
