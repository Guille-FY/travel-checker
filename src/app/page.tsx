'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import LoginPage from '@/components/LoginPage';

const MapChart = dynamic(() => import('@/components/MapChart'), { ssr: false });

// Icons as SVG components
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile
  const [visitedCount, setVisitedCount] = useState(0);
  const totalCountries = 195; // Approximate number of countries

  useEffect(() => {
    // Check if desktop and expand sidebar
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setSidebarCollapsed(false);
    }

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user.id ?? null);
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setLoading(false);
    });

    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(prefersDark.matches);
    if (prefersDark.matches) {
      document.body.classList.add('dark');
    }

    // Listen for system theme changes
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
      document.body.classList.toggle('dark', e.matches);
    };
    prefersDark.addEventListener('change', handleThemeChange);

    return () => {
      subscription.unsubscribe();
      prefersDark.removeEventListener('change', handleThemeChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark', newDarkMode);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleVisitedCountUpdate = (count: number) => {
    setVisitedCount(count);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!userId) {
    return <LoginPage />;
  }

  const percentage = Math.round((visitedCount / totalCountries) * 100);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Travel Tracker</div>
          <div className="sidebar-subtitle">Explore the world, country by country</div>
        </div>

        <div className="sidebar-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{visitedCount}</div>
              <div className="stat-label">Visited</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalCountries - visitedCount}</div>
              <div className="stat-label">To Visit</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="progress-section">
            <div className="progress-header">
              <div className="progress-title">Global Progress</div>
              <div className="progress-percentage">{percentage}%</div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>

          {/* Info Section */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <GlobeIcon />
              </div>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '2px'
                }}>
                  How it works
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              Click on any country on the map to mark it as visited.
              Your selections are saved automatically and you can access them
              from any device.
            </div>
          </div>

          {/* Author Credit */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '20px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            textAlign: 'center'
          }}>
            Made by <a href="https://www.guillermofy.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Guillermo Fuentes Yago</a>
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            onClick={toggleDarkMode}
            className="btn-icon"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside >

      {/* Mobile Overlay */}
      {
        !sidebarCollapsed && (
          <div
            className="mobile-overlay"
            onClick={() => setSidebarCollapsed(true)}
          />
        )
      }

      {/* Toggle Sidebar Button (Mobile) - MOVED */}
      <button
        className="toggle-sidebar-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? <MenuIcon /> : <CloseIcon />}
      </button>

      {/* Map Wrapper */}
      <div className="map-wrapper">
        {/* Map Component */}
        <MapChart
          userId={userId}
          darkMode={darkMode}
          onVisitedCountChange={handleVisitedCountUpdate}
        />
      </div>
    </div >
  );
}
