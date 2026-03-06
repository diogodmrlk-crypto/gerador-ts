import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Keys from './pages/Keys';
import Devices from './pages/Devices';
import Packages from './pages/Packages';
import Profile from './pages/Profile';
import LoginSession from './pages/LoginSession';
import { useGeneratorStore } from './store/generatorStore';

type PageType = 'home' | 'keys' | 'devices' | 'packages' | 'profile' | 'login-session';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const { init } = useGeneratorStore();

  useEffect(() => {
    init();
  }, [init]);

  const navigate = (page: PageType) => setCurrentPage(page);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'keys':
        return <Keys onNavigate={navigate} />;
      case 'devices':
        return <Devices onNavigate={navigate} />;
      case 'packages':
        return <Packages onNavigate={navigate} />;
      case 'profile':
        return <Profile onNavigate={navigate} />;
      case 'login-session':
        return <LoginSession onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="phone">
            {renderPage()}
            <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

interface BottomNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

interface PageProps {
  onNavigate: (page: PageType) => void;
}

function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const mainPages: PageType[] = ['home', 'keys', 'devices', 'packages', 'profile'];

  return (
    <div className="bottom-nav">
      {mainPages.map((page) => (
        <div
          key={page}
          id={`nav-${page}`}
          className={`nav-item ${currentPage === page ? 'active' : ''}`}
          onClick={() => onNavigate(page)}
        >
          {page === 'home' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
          {page === 'keys' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6M15.5 7.5l3 3" />
            </svg>
          )}
          {page === 'devices' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          )}
          {page === 'packages' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          )}
          {page === 'profile' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
          <div className="nav-label">{page.charAt(0).toUpperCase() + page.slice(1)}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
