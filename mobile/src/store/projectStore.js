import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import projectService from '../services/projectService';
import { FALLBACK_PROJECT_KITS } from '../data/fallbackData';

const useProjectStore = create((set, get) => ({
  projects: FALLBACK_PROJECT_KITS,
  projectKits: FALLBACK_PROJECT_KITS,
  featuredKits: FALLBACK_PROJECT_KITS,
  currentProject: null,
  currentKit: null,
  isLoading: false,
  error: null,
  builderConfig: {
    projectType: null,
    microcontroller: null,
    sensors: [],
    modules: [],
    powerSupply: null,
  },
  builderResult: null,
  isLoadingFeatured: false,
  featuredError: null,

  initCache: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({
            projects: parsed,
            projectKits: parsed,
            featuredKits: parsed,
          });
        }
      }
    } catch {}
  },

  fetchProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectService.getProjects(params);
      if (result.success) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data?.projects || result.data?.kits || [];
        if (items.length > 0) {
          set({ projects: items, isLoading: false });
          AsyncStorage.setItem(STORAGE_KEYS.PROJECTS_CACHE, JSON.stringify(items)).catch(() => {});
        } else {
          set({ isLoading: false });
        }
        return result;
      }
    } catch {}
    set({ isLoading: false });
  },

  fetchProjectKits: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await projectService.getProjectKits(params);
      if (result.success) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data?.kits || result.data?.projects || [];
        if (items.length > 0) {
          set({ projectKits: items, isLoading: false });
          AsyncStorage.setItem(STORAGE_KEYS.PROJECTS_CACHE, JSON.stringify(items)).catch(() => {});
        } else {
          set({ isLoading: false });
        }
        return result;
      }
    } catch {}
    set({ isLoading: false });
  },

  fetchFeaturedKits: async () => {
    set({ isLoadingFeatured: true, featuredError: null });
    try {
      const result = await projectService.getFeaturedKits(6);
      if (result.success) {
        const items = Array.isArray(result.data)
          ? result.data
          : result.data?.kits || result.data?.projects || [];
        if (items.length > 0) {
          set({ featuredKits: items, isLoadingFeatured: false });
        } else {
          set({ isLoadingFeatured: false });
        }
        return result;
      }
    } catch {}
    set({ isLoadingFeatured: false });
    return { success: true, data: get().featuredKits };
  },

  fetchProject: async id => {
    set({ isLoading: true, currentProject: null });
    const existing = get().projects.find(p => (p._id || p.id) === id);
    if (existing) {
      set({ currentProject: existing, isLoading: false });
    }
    try {
      const result = await projectService.getProject(id);
      if (result.success && result.data) {
        const item = result.data?.project || result.data?.kit || result.data;
        if (item && typeof item === 'object') {
          set({ currentProject: item, isLoading: false });
          return { success: true, data: { project: item } };
        }
      }
    } catch {}
    return { success: !!existing, data: { project: existing } };
  },

  fetchProjectKit: async id => {
    set({ isLoading: true, currentKit: null });
    const existing = get().projectKits.find(k => (k._id || k.id) === id);
    if (existing) {
      set({ currentKit: existing, isLoading: false });
    }
    try {
      const result = await projectService.getProjectKit(id);
      if (result.success && result.data) {
        const item = result.data?.kit || result.data?.project || result.data;
        if (item && typeof item === 'object') {
          set({ currentKit: item, isLoading: false });
          return { success: true, data: { kit: item } };
        }
      }
    } catch {}
    return { success: !!existing, data: { kit: existing } };
  },

  // Project Builder
  setBuilderConfig: config => {
    set(state => ({ builderConfig: { ...state.builderConfig, ...config } }));
  },

  resetBuilder: () => {
    set({
      builderConfig: {
        projectType: null,
        microcontroller: null,
        sensors: [],
        modules: [],
        powerSupply: null,
      },
      builderResult: null,
    });
  },

  generateProject: async () => {
    const { builderConfig } = get();
    set({ isLoading: true, error: null });
    try {
      const result = await projectService.buildProject(builderConfig);
      if (result.success) {
        set({ builderResult: result.data, isLoading: false });
        return result;
      }
    } catch {}
    set({ isLoading: false });
    return { success: false };
  },

  clearError: () => set({ error: null }),
}));

// Initialize cache on startup
useProjectStore.getState().initCache();

export { useProjectStore };
export default useProjectStore;
