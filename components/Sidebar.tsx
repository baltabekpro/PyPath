import React from 'react';
import { View } from '../types';
import { LayoutDashboard, BookOpen, Code2, Users, Settings, Trophy, Terminal, BarChart2 } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'Главная', icon: LayoutDashboard },
    { view: View.COURSES, label: 'Курсы', icon: BookOpen },
    { view: View.PRACTICE, label: 'Практика', icon: Code2 },
    { view: View.LEADERBOARD, label: 'Рейтинг', icon: BarChart2 },
    { view: View.COMMUNITY, label: 'Сообщество', icon: Users },
    { view: View.ACHIEVEMENTS, label: 'Достижения', icon: Trophy },
    { view: View.SETTINGS, label: 'Настройки', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-py-accent bg-py-dark flex flex-col justify-between p-6 h-screen shrink-0">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="size-10 bg-py-green rounded-xl flex items-center justify-center text-py-dark shadow-[0_0_15px_rgba(13,242,89,0.3)]">
            <Terminal size={24} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-none tracking-tight text-white">PyPath</h1>
            <p className="text-py-muted text-xs">AI Python Learning</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.view
                  ? 'bg-py-green/10 text-py-green font-semibold'
                  : 'text-py-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} strokeWidth={currentView === item.view ? 2.5 : 2} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mini Profile Status */}
      <div className="flex flex-col gap-4">
        <div className="bg-py-surface/50 backdrop-blur-md p-4 rounded-xl border border-py-green/20">
          <p className="text-xs text-py-muted mb-2">Ваш уровень</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white">Младший Профи</span>
            <span className="text-xs text-py-green">75%</span>
          </div>
          <div className="w-full bg-py-accent h-1.5 rounded-full overflow-hidden">
            <div className="bg-py-green h-1.5 rounded-full w-3/4 shadow-[0_0_10px_#0df259]"></div>
          </div>
        </div>

        <button 
          onClick={() => setView(View.PRACTICE)}
          className="w-full bg-py-green text-py-dark font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(13,242,89,0.2)]"
        >
          <Code2 size={20} />
          <span>Начать код</span>
        </button>
      </div>
    </aside>
  );
};