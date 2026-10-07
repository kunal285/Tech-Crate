import { useAuthStore } from './authStore';

// useAdminAuthStore aliases useAuthStore to prevent duplicate state divergency
export const useAdminAuthStore = useAuthStore;
export default useAuthStore;
