import React, { useState } from 'react';
import { View } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Editor } from './components/Editor';
import { Courses } from './components/Courses';
import { Profile } from './components/Profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.PRACTICE:
        return <Editor />;
      case View.COURSES:
        return <Courses />;
      case View.PROFILE:
      case View.ACHIEVEMENTS:
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-py-dark font-sans text-py-text selection:bg-py-green/30 selection:text-white">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {currentView !== View.PRACTICE && <Header />}
        
        <div className={`flex-1 ${currentView !== View.PRACTICE ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
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