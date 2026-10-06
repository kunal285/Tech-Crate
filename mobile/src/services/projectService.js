import {apiGet, apiPost, apiPut, apiUpload} from './api';

const projectService = {
  // Get all projects
  getProjects: async (params = {}) => {
    return await apiGet('/projects', params);
  },

  // Get single project
  getProject: async id => {
    return await apiGet(`/projects/${id}`);
  },

  // Get project kits
  getProjectKits: async (params = {}) => {
    return await apiGet('/project-kits', params);
  },

  // Get single project kit
  getProjectKit: async id => {
    return await apiGet(`/project-kits/${id}`);
  },

  // Featured project kits
  getFeaturedKits: async (limit = 6) => {
    return await apiGet('/project-kits/featured', {limit});
  },

  // Search projects
  searchProjects: async (query, filters = {}) => {
    return await apiGet('/projects/search', {q: query, ...filters});
  },

  // Project Builder - Generate component list
  buildProject: async projectConfig => {
    return await apiPost('/project-builder/generate', projectConfig);
  },

  // Add project kit to cart (all components)
  addKitToCart: async kitId => {
    return await apiPost(`/project-kits/${kitId}/add-to-cart`);
  },

  // Download project resource
  downloadResource: async (projectId, resourceType) => {
    return await apiGet(`/projects/${projectId}/resources/${resourceType}`);
  },

  // Seller: Create project kit
  createProjectKit: async kitData => {
    return await apiPost('/seller/project-kits', kitData);
  },

  // Seller: Update project kit
  updateProjectKit: async (id, kitData) => {
    return await apiPut(`/seller/project-kits/${id}`, kitData);
  },

  // Seller: Upload project resources
  uploadProjectResources: async (kitId, formData, onProgress) => {
    return await apiUpload(
      `/seller/project-kits/${kitId}/resources`,
      formData,
      onProgress,
    );
  },

  // Get related projects
  getRelatedProjects: async (projectId, limit = 4) => {
    return await apiGet(`/projects/${projectId}/related`, {limit});
  },
};

export { projectService };
export default projectService;
