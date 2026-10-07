import {apiPost} from './api';

// AI Shopping Assistant Service
// This service abstracts the AI provider so it can be configured later
const aiService = {
  // Analyze project requirements and suggest components
  analyzeProjectRequirements: async (userQuery, budget = null) => {
    return await apiPost('/ai/assistant', {
      query: userQuery,
      budget,
      type: 'component_suggestion',
    });
  },

  // Get smart recommendations
  getSmartRecommendations: async (context = {}) => {
    return await apiPost('/ai/recommendations', context);
  },

  // Generate project shopping list
  generateShoppingList: async projectConfig => {
    return await apiPost('/ai/shopping-list', projectConfig);
  },

  // Chat with AI assistant
  chat: async (messages, context = {}) => {
    return await apiPost('/ai/chat', {messages, context});
  },
};

export { aiService };
export default aiService;
