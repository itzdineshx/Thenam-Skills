import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always default starting experience to /home
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const pathname = window.location.pathname;
    
    // Check hash or path
    if (hash && hash !== '/' && hash !== '/login' && hash !== '/register') {
      return hash.startsWith('/') ? hash : `/${hash}`;
    }
    if (pathname && pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
      return pathname;
    }
    return '/home';
  });

  const [historyStack, setHistoryStack] = useState<string[]>(['/home']);

  useEffect(() => {
    if (window.location.hash !== `#${currentPath}`) {
      window.location.hash = currentPath;
    }
  }, [currentPath]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        setCurrentPath(prevPath => {
          let nextPath = hash.startsWith('/') ? hash : `/${hash}`;
          if (nextPath === '/' || nextPath === '/register' || nextPath === '/auth') {
            nextPath = '/home';
          }
          return prevPath !== nextPath ? nextPath : prevPath;
        });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // Empty dependency array prevents re-binding loop

  const navigate = React.useCallback((path: string) => {
    setCurrentPath(prevPath => {
      let nextPath = path;
      if (nextPath === '/' || nextPath === '/register' || nextPath === '/auth') {
        nextPath = '/home';
      }
      if (prevPath !== nextPath) {
        setHistoryStack(prev => [...prev, nextPath]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return nextPath;
      }
      return prevPath;
    });
  }, []);

  const goBack = React.useCallback(() => {
    setHistoryStack(prevStack => {
      if (prevStack.length > 1) {
        const nextStack = [...prevStack];
        nextStack.pop(); // remove current
        const previous = nextStack[nextStack.length - 1] || '/home';
        
        setCurrentPath(prevPath => {
          if (prevPath !== previous) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return previous;
          }
          return prevPath;
        });
        return nextStack;
      } else {
        setCurrentPath(prevPath => {
          if (prevPath !== '/home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return '/home';
          }
          return prevPath;
        });
        return prevStack;
      }
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    currentPath,
    navigate,
    goBack
  }), [currentPath, navigate, goBack]);

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
