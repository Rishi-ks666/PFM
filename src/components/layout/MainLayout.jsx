import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import CommandPalette from '../ui/CommandPalette';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const navigate = useNavigate();

  // Cmd+K global keyboard shortcut
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setIsCommandOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCommandSelect = (action) => {
    setIsCommandOpen(false);
    if (action.href) navigate(action.href);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-slate-50 overflow-hidden">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Navbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          onCommandPalette={() => setIsCommandOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 sm:pb-6 lg:pb-8 bg-[#0A0A0F] relative custom-scrollbar">
          <Outlet />
        </main>
      </div>

      <BottomNav />

      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
        onSelect={handleCommandSelect} 
      />
    </div>
  );
}
