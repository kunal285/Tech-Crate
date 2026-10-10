'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

// Optional contexts if needed by components
export const ThemeContext = createContext({ theme: 'dark' });
export const AdminContext = createContext({});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useAdmin() {
  return useContext(AdminContext);
}

export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
    useAuthStore.getState().initAuth?.();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      <AdminContext.Provider value={{ user, isReady: mounted }}>
        {/* Render children without layout shift or hydration mismatch */}
        {children}
      </AdminContext.Provider>
    </ThemeContext.Provider>
  );
}
