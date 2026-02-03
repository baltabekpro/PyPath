import React, { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, ChevronUp, ChevronDown, Shield, Minus } from 'lucide-react';
import { CURRENT_USER } from '../constants';

const MOCK_LEADERS = [
  { rank: 1, name: "CyberNinja", xp: 45200, level: 42, avatar: "https://i.pravatar.cc/150?u=1", streak: 150, change: "up" },
  { rank: 2, name: "Pythonista", xp: 44100, level: 40, avatar: "https://i.pravatar.cc/150?u=2", streak: 89, change: "up" },
  { rank: 3, name: "CodeMaster", xp: 42500, level: 38, avatar: "https://i.pravatar.cc/150?u=3", streak: 45, change: "down" },
  { rank: 4, name: "DevOps_King", xp: 38000, level: 35, avatar: "https://i.pravatar.cc/150?u=4", streak: 12, change: "same" },
  { rank: 5, name: "AlgoQueen", xp: 36500, level: 34, avatar: "https://i.pravatar.cc/150?u=5", streak: 30, change: "up" },
  { rank: 6, name: "BugHunter", xp: 34200, level: 32, avatar: "https://i.pravatar.cc/150?u=6", streak: 5, change: "down" },
  { rank: 7, name: "Rusty", xp: 31000, level: 29, avatar: "https://i.pravatar.cc/150?u=7", streak: 21, change: "same" },
];

export const Leaderboard: React.FC = () => {
  const [league, setLeague] = useState('Diamond');

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Таблица лидеров</h1>
          <p className="text-py-muted">Соревнуйтесь с лучшими разработчиками в лиге.</p>
        </div>
        
        {/* League Selector */}
        <div className="flex bg-py-surface border border-py-accent rounded-xl p-1">
          {['Gold', 'Diamond', 'Master'].map((l) => (
            <button 
              key={l}
              onClick={() => setLeague(l)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                league === l 
                ? 'bg-py-green text-py-dark shadow-lg' 
                : 'text-py-muted hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12 min-h-[300px]">
        {/* 2nd Place */}
        <div className="order-2 md:order-1 bg-py-surface/50 border border-py-accent rounded-t-3xl rounded-b-xl p-6 flex flex-col items-center relative h-64 justify-end hover:bg-py-surface transition-colors">
          <div className="absolute -top-8 size-20 rounded-full border-4 border-gray-400 overflow-hidden shadow-[0_0_20px_rgba(156,163,175,0.3)]">
             <img src={MOCK_LEADERS[1].avatar} className="w-full h-full object-cover" alt="Rank 2" />
          </div>
          <div className="absolute -top-12 bg-gray-400 text-py-dark font-black size-8 rounded-full flex items-center justify-center border-2 border-py-dark z-10">2</div>
          <h3 className="text-xl font-bold text-white mt-8">{MOCK_LEADERS[1].name}</h3>
          <p className="text-py-green font-mono font-bold mb-2">{MOCK_LEADERS[1].xp.toLocaleString()} XP</p>
          <div className="text-xs text-py-muted bg-py-dark/50 px-3 py-1 rounded-full">Lvl {MOCK_LEADERS[1].level}</div>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2 bg-gradient-to-b from-py-surface to-py-green/10 border border-py-green/50 rounded-t-3xl rounded-b-xl p-6 flex flex-col items-center relative h-80 justify-end shadow-[0_0_30px_rgba(13,242,89,0.1)]">
           <div className="absolute -top-16">
             <Crown size={48} className="text-yellow-400 fill-yellow-400 animate-bounce" />
           </div>
           <div className="absolute -top-10 size-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.4)]">
             <img src={MOCK_LEADERS[0].avatar} className="w-full h-full object-cover" alt="Rank 1" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-10">{MOCK_LEADERS[0].name}</h3>
          <p className="text-yellow-400 font-mono font-bold text-lg mb-2">{MOCK_LEADERS[0].xp.toLocaleString()} XP</p>
          <div className="flex gap-2">
             <div className="text-xs text-py-muted bg-py-dark/50 px-3 py-1 rounded-full">Lvl {MOCK_LEADERS[0].level}</div>
             <div className="text-xs text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12}/> {MOCK_LEADERS[0].streak}
             </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 md:order-3 bg-py-surface/50 border border-py-accent rounded-t-3xl rounded-b-xl p-6 flex flex-col items-center relative h-56 justify-end hover:bg-py-surface transition-colors">
          <div className="absolute -top-8 size-20 rounded-full border-4 border-orange-700 overflow-hidden shadow-[0_0_20px_rgba(194,65,12,0.3)]">
             <img src={MOCK_LEADERS[2].avatar} className="w-full h-full object-cover" alt="Rank 3" />
          </div>
          <div className="absolute -top-12 bg-orange-700 text-py-dark font-black size-8 rounded-full flex items-center justify-center border-2 border-py-dark z-10">3</div>
          <h3 className="text-xl font-bold text-white mt-8">{MOCK_LEADERS[2].name}</h3>
          <p className="text-py-green font-mono font-bold mb-2">{MOCK_LEADERS[2].xp.toLocaleString()} XP</p>
          <div className="text-xs text-py-muted bg-py-dark/50 px-3 py-1 rounded-full">Lvl {MOCK_LEADERS[2].level}</div>
        </div>
      </div>

      {/* List */}
      <div className="bg-py-surface border border-py-accent rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-py-muted uppercase tracking-wider border-b border-py-accent">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Участник</div>
            <div className="col-span-2 text-center">Уровень</div>
            <div className="col-span-2 text-center">Стрик</div>
            <div className="col-span-2 text-right">XP</div>
        </div>
        
        <div className="divide-y divide-white/5">
            {MOCK_LEADERS.slice(3).map((user) => (
                <div key={user.rank} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                    <div className="col-span-1 text-center font-bold text-py-muted flex items-center justify-center gap-1">
                        {user.change === 'up' && <ChevronUp size={12} className="text-py-green"/>}
                        {user.change === 'down' && <ChevronDown size={12} className="text-red-500"/>}
                        {user.change === 'same' && <Minus size={12} className="text-py-muted"/>}
                        {user.rank}
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                        <img src={user.avatar} className="size-8 rounded-full" alt={user.name}/>
                        <span className="font-bold text-white">{user.name}</span>
                    </div>
                    <div className="col-span-2 text-center text-sm text-py-muted">{user.level}</div>
                    <div className="col-span-2 text-center text-sm text-orange-400 font-bold flex items-center justify-center gap-1">
                         <TrendingUp size={14} /> {user.streak}
                    </div>
                    <div className="col-span-2 text-right font-mono text-py-green">{user.xp.toLocaleString()}</div>
                </div>
            ))}
            
            {/* Current User Row (Sticky or Separated) */}
            <div className="grid grid-cols-12 gap-4 p-4 items-center bg-py-green/10 border-t border-py-green/30">
                 <div className="col-span-1 text-center font-bold text-white">{CURRENT_USER.rank}</div>
                 <div className="col-span-5 flex items-center gap-3">
                        <img src={CURRENT_USER.avatar} className="size-8 rounded-full border border-py-green" alt="Me"/>
                        <span className="font-bold text-white">{CURRENT_USER.name} (Вы)</span>
                </div>
                <div className="col-span-2 text-center text-sm text-white">{CURRENT_USER.levelNum}</div>
                <div className="col-span-2 text-center text-sm text-orange-400 font-bold flex items-center justify-center gap-1">
                     <TrendingUp size={14} /> {CURRENT_USER.streak}
                </div>
                <div className="col-span-2 text-right font-mono text-py-green">{CURRENT_USER.xp.toLocaleString()}</div>
            </div>
        </div>
      </div>
    </div>
  );
};