import React, { useState } from 'react';
import { View } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Courses } from './components/Courses';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';
import { AIChatPage } from './components/AIChatPage';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={handleViewChange} />;
      case View.PRACTICE:
        return <Editor />;
      case View.AI_CHAT:
        return <AIChatPage />;
      case View.COURSES:
        return <Courses setView={handleViewChange} />;
      case View.PROFILE:
        return <Profile setView={handleViewChange} />;
      case View.ACHIEVEMENTS:
        return <Achievements />;
      case View.LEADERBOARD:
        return <Leaderboard />;
      case View.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard setView={handleViewChange} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-py-dark font-sans text-py-text selection:bg-py-green/30 selection:text-white relative">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <Sidebar 
        currentView={currentView} 
        setView={handleViewChange} 
        isMobileOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full transition-all duration-300">
        {/* Mobile Header Toggle for Immersive Views */}
        {(currentView === View.PRACTICE || currentView === View.AI_CHAT) && (
           <div className="md:hidden absolute top-4 left-4 z-20">
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-2 bg-py-surface border border-py-accent rounded-lg text-gray-400 hover:text-white"
               >
                 <Menu size={20} />
               </button>
           </div>
        )}

        {/* Main Header */}
        {currentView !== View.PRACTICE && currentView !== View.AI_CHAT && (
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        )}
        
        <div className={`flex-1 ${
            currentView !== View.PRACTICE && currentView !== View.AI_CHAT 
            ? 'overflow-y-auto custom-scrollbar' 
            : 'overflow-hidden'
        }`}>
          {renderView()}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #28392e;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #0df259;
        }
      `}</style>
    </div>
  );
};

export default App;