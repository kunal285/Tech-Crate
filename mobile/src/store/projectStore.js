import {create} from 'zustand';
import projectService from '../services/projectService';

const useProjectStore = create((set, get) => ({
  projects: [],
  projectKits: [],
  featuredKits: [],
  currentProject: null,
  currentKit: null,
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

  fetchProjects: async (params = {}) => {
    set({isLoading: true, error: null});
    const result = await projectService.getProjects(params);
    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.projects || result.data?.kits || []);
      set({projects: items, isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
  },

  fetchProjectKits: async (params = {}) => {
    set({isLoading: true, error: null});
    const result = await projectService.getProjectKits(params);
    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.kits || result.data?.projects || []);
      set({projectKits: items, isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
  },

  fetchFeaturedKits: async () => {
    set({isLoadingFeatured: true, featuredError: null});
    const result = await projectService.getFeaturedKits(6);
    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data?.kits || result.data?.projects || []);
      set({featuredKits: items, isLoadingFeatured: false});
    } else {
      set({featuredError: result.message, isLoadingFeatured: false});
    }
    return result;
  },

  fetchProject: async id => {
    set({isLoading: true, currentProject: null});
    const result = await projectService.getProject(id);
    if (result.success) {
      set({currentProject: result.data.project, isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
  },

  fetchProjectKit: async id => {
    set({isLoading: true, currentKit: null});
    const result = await projectService.getProjectKit(id);
    if (result.success) {
      set({currentKit: result.data.kit, isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
  },

  // Project Builder
  setBuilderConfig: config => {
    set(state => ({builderConfig: {...state.builderConfig, ...config}}));
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
    const {builderConfig} = get();
    set({isLoading: true, error: null});
    const result = await projectService.buildProject(builderConfig);
    if (result.success) {
      set({builderResult: result.data, isLoading: false});
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  clearError: () => set({error: null}),
}));

export { useProjectStore };
export default useProjectStore;
