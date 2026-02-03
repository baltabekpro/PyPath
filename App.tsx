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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case View.PRACTICE:
        return <Editor />;
      case View.AI_CHAT:
        return <AIChatPage />;
      case View.COURSES:
        return <Courses setView={setCurrentView} />;
      case View.PROFILE:
        return <Profile setView={setCurrentView} />;
      case View.ACHIEVEMENTS:
        return <Achievements />;
      case View.LEADERBOARD:
        return <Leaderboard />;
      case View.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-py-dark font-sans text-py-text selection:bg-py-green/30 selection:text-white">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Hide header for immersive views like Practice and AI Chat */}
        {currentView !== View.PRACTICE && currentView !== View.AI_CHAT && <Header />}
        
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