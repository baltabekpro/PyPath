import React from 'react';
import { View } from '../types';
import { LayoutDashboard, BookOpen, Code2, Settings, Trophy, BarChart2, Bot, Terminal } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'Главная', icon: LayoutDashboard },
    { view: View.COURSES, label: 'Курсы', icon: BookOpen },
    { view: View.PRACTICE, label: 'Практика', icon: Code2 },
    { view: View.AI_CHAT, label: 'AI Ментор', icon: Bot },
    { view: View.LEADERBOARD, label: 'Рейтинг', icon: BarChart2 },
    { view: View.ACHIEVEMENTS, label: 'Достижения', icon: Trophy },
    { view: View.SETTINGS, label: 'Настройки', icon: Settings },
  ];

  // Button should only be hidden in Practice view (editor)
  const shouldHideCTA = currentView === View.PRACTICE;

  return (
    <aside className="w-72 border-r border-py-accent/50 bg-[#0a100c] flex flex-col justify-between p-6 h-screen shrink-0 relative z-20 transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4 px-2 mt-2 cursor-pointer group" onClick={() => setView(View.DASHBOARD)}>
          <div className="size-10 bg-py-green rounded-xl flex items-center justify-center text-py-dark shadow-[0_0_20px_rgba(13,242,89,0.2)] group-hover:shadow-[0_0_25px_rgba(13,242,89,0.4)] transition-all duration-300">
            <Terminal size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black leading-none tracking-tight text-white mb-0.5">PyPath</h1>
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.25em] uppercase group-hover:text-py-green transition-colors">Learning</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                currentView === item.view
                  ? 'bg-gradient-to-r from-py-green/10 to-transparent text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Active Indicator Line */}
              {currentView === item.view && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-py-green rounded-r-full shadow-[0_0_12px_#0df259]"></div>
              )}

              <item.icon 
                size={22} 
                className={`transition-colors duration-300 ${currentView === item.view ? 'text-py-green' : 'text-gray-500 group-hover:text-white'}`}
                strokeWidth={2} 
              />
              <span className="text-[15px] tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col gap-6">
        
        {/* Integrated Level Status - Simplified visual */}
        <div className="px-5 py-4 rounded-2xl bg-[#111913]/50 border border-white/5 hover:border-white/10 transition-colors group cursor-pointer">
          <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Младший Профи</span>
              <span className="text-[10px] text-py-green font-bold bg-py-green/10 px-2 py-0.5 rounded-lg border border-py-green/20">Lvl 14</span>
          </div>
          
          <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden mb-2">
            <div className="bg-py-green h-full rounded-full w-3/4 shadow-[0_0_8px_#0df259]"></div>
          </div>
          <p className="text-[10px] text-gray-500 text-right font-medium tracking-wide">750 XP до уровня 15</p>
        </div>

        {/* Secondary CTA - Changed to Outline/Calmer style */}
        {!shouldHideCTA && (
            <button 
            onClick={() => setView(View.PRACTICE)}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-py-green border border-py-green/30 bg-[#0d1f14] hover:bg-py-green hover:text-py-dark hover:border-py-green transition-all duration-300 group shadow-lg shadow-black/20"
            >
            <Code2 size={20} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform"/>
            <span>Песочница</span>
            </button>
        )}
      </div>
    </aside>
  );
};