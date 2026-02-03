import React, { useState } from 'react';
import { Crown, TrendingUp, ChevronUp, ChevronDown, Minus } from 'lucide-react';

const MOCK_LEADERS = [
  { rank: 1, name: "CyberNinja", xp: 45200, level: 42, avatar: "https://i.pravatar.cc/150?u=1", streak: 150, change: "up" },
  { rank: 2, name: "Pythonista", xp: 44100, level: 40, avatar: "https://i.pravatar.cc/150?u=2", streak: 89, change: "up" },
  { rank: 3, name: "CodeMaster", xp: 42500, level: 38, avatar: "https://i.pravatar.cc/150?u=3", streak: 45, change: "down" },
  { rank: 4, name: "DevOps_King", xp: 38000, level: 35, avatar: "https://i.pravatar.cc/150?u=4", streak: 12, change: "same" },
  { rank: 5, name: "AlgoQueen", xp: 36500, level: 34, avatar: "https://i.pravatar.cc/150?u=5", streak: 30, change: "up" },
  { rank: 6, name: "BugHunter", xp: 34200, level: 32, avatar: "https://i.pravatar.cc/150?u=6", streak: 5, change: "down" },
  { rank: 7, name: "Rusty", xp: 31000, level: 29, avatar: "https://i.pravatar.cc/150?u=7", streak: 21, change: "same" },
  { rank: 8, name: "NetRunner", xp: 29500, level: 28, avatar: "https://i.pravatar.cc/150?u=8", streak: 14, change: "up" },
  { rank: 9, name: "PixelArt", xp: 28200, level: 27, avatar: "https://i.pravatar.cc/150?u=9", streak: 3, change: "down" },
];

const formatXP = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const Leaderboard: React.FC = () => {
  const [league, setLeague] = useState('Diamond');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Таблица лидеров</h1>
          <p className="text-gray-400 max-w-md text-base leading-relaxed">
            Соревнуйтесь с лучшими разработчиками, повышайте ранг и получайте награды.
          </p>
        </div>
        
        {/* League Selector - Larger, Clearer */}
        <div className="bg-[#0a0f0b] border border-py-accent p-1.5 rounded-xl shadow-lg">
           <div className="flex gap-1">
              {['Gold', 'Diamond', 'Master'].map((l) => (
                <button 
                  key={l}
                  onClick={() => setLeague(l)}
                  className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                    league === l 
                    ? 'bg-[#1a2e21] text-white shadow-md border border-white/5' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {l}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Podium - Cleaned up visual noise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12 min-h-[360px]">
        
        {/* 2nd Place */}
        <div className="order-2 md:order-1 bg-[#0c120e] border border-white/5 rounded-3xl p-6 flex flex-col items-center relative h-[300px] justify-end group hover:border-py-accent transition-colors shadow-lg">
           <div className="absolute top-8 size-24 rounded-full border-4 border-gray-400 p-1 bg-[#0c120e]">
             <img src={MOCK_LEADERS[1].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 2" />
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-py-dark font-black size-7 rounded-full flex items-center justify-center text-sm border-4 border-[#0c120e]">2</div>
           </div>
           
           <h3 className="text-xl font-bold text-white mt-4 mb-1">{MOCK_LEADERS[1].name}</h3>
           <p className="text-white font-mono font-black text-xl mb-6 tracking-wide drop-shadow-sm">
             {formatXP(MOCK_LEADERS[1].xp)} XP
           </p>
           
           <div className="w-full pt-4 border-t border-white/10 flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider">
              <span className="text-gray-300">Lvl {MOCK_LEADERS[1].level}</span>
              <span className="text-orange-400 flex items-center gap-1.5">
                  <TrendingUp size={14}/> {MOCK_LEADERS[1].streak}
              </span>
           </div>
        </div>

        {/* 1st Place - Center */}
        <div className="order-1 md:order-2 bg-gradient-to-b from-[#131f17] to-[#0a0f0b] border border-yellow-500/20 rounded-3xl p-8 flex flex-col items-center relative h-[380px] justify-end shadow-[0_0_50px_rgba(234,179,8,0.05)] z-10 transform md:-translate-y-4">
           <div className="absolute -top-8">
             <Crown size={56} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
           </div>
           
           <div className="absolute top-12 size-36 rounded-full border-4 border-yellow-400 p-1 shadow-[0_0_40px_rgba(250,204,21,0.15)] bg-[#0a0f0b]">
             <img src={MOCK_LEADERS[0].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 1" />
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black size-10 rounded-full flex items-center justify-center border-4 border-[#131f17] text-lg">1</div>
           </div>
           
           <h3 className="text-2xl font-black text-white mt-12 mb-2 tracking-tight">{MOCK_LEADERS[0].name}</h3>
           <p className="text-yellow-400 font-mono font-black text-3xl mb-8 drop-shadow-md">{formatXP(MOCK_LEADERS[0].xp)} XP</p>
           
           {/* Detailed stats box for winner - High Contrast */}
           <div className="bg-[#1a251e] rounded-xl w-full flex items-center justify-between p-4 border border-white/10 shadow-inner">
               <div className="flex flex-col items-center w-1/2 border-r border-white/10">
                    <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">УРОВЕНЬ</span>
                    <span className="text-white font-bold text-xl">{MOCK_LEADERS[0].level}</span>
               </div>
               <div className="flex flex-col items-center w-1/2">
                    <span className="text-[10px] uppercase text-gray-400 font-bold mb-1">СТРИК</span>
                    <span className="text-orange-400 font-bold text-xl flex items-center gap-1.5">
                        <TrendingUp size={18}/> {MOCK_LEADERS[0].streak}
                    </span>
               </div>
           </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 md:order-3 bg-[#0c120e] border border-white/5 rounded-3xl p-6 flex flex-col items-center relative h-[300px] justify-end group hover:border-py-accent transition-colors shadow-lg">
          <div className="absolute top-8 size-24 rounded-full border-4 border-orange-700 p-1 bg-[#0c120e]">
             <img src={MOCK_LEADERS[2].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 3" />
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white font-black size-7 rounded-full flex items-center justify-center text-sm border-4 border-[#0c120e]">3</div>
          </div>
          
          <h3 className="text-xl font-bold text-white mt-4 mb-1">{MOCK_LEADERS[2].name}</h3>
           <p className="text-white font-mono font-black text-xl mb-6 tracking-wide drop-shadow-sm">
             {formatXP(MOCK_LEADERS[2].xp)} XP
           </p>
          
          <div className="w-full pt-4 border-t border-white/10 flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider">
              <span className="text-gray-300">Lvl {MOCK_LEADERS[2].level}</span>
              <span className="text-orange-400 flex items-center gap-1.5">
                  <TrendingUp size={14}/> {MOCK_LEADERS[2].streak}
              </span>
          </div>
        </div>
      </div>

      {/* List - Improved alignment and row separation */}
      <div className="bg-[#0c120e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 bg-[#0a0f0b]">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 text-left pl-2">УЧАСТНИК</div>
            <div className="col-span-2 text-center">УРОВЕНЬ</div>
            <div className="col-span-2 text-center">СТРИК</div>
            <div className="col-span-2 text-right pr-2">XP</div>
        </div>
        
        <div className="flex flex-col">
            {MOCK_LEADERS.slice(3).map((user) => (
                <div key={user.rank} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">
                    <div className="col-span-1 flex flex-col items-center justify-center">
                        <span className="font-bold text-white text-base">{user.rank}</span>
                        <div className="mt-0.5 opacity-70">
                            {user.change === 'up' && <ChevronUp size={12} className="text-py-green"/>}
                            {user.change === 'down' && <ChevronDown size={12} className="text-red-500"/>}
                            {user.change === 'same' && <Minus size={12} className="text-gray-600"/>}
                        </div>
                    </div>
                    <div className="col-span-5 flex items-center gap-4 pl-2">
                        <div className="size-11 rounded-full bg-[#151e18] flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                            {user.avatar ? (
                                <img src={user.avatar} className="size-full object-cover" alt={user.name}/>
                            ) : (
                                <span className="text-xs font-bold text-gray-400">{user.name[0]}</span>
                            )}
                        </div>
                        <span className="font-bold text-gray-200 text-sm group-hover:text-white transition-colors">{user.name}</span>
                    </div>
                    <div className="col-span-2 text-center text-sm text-gray-300 font-bold">{user.level}</div>
                    <div className="col-span-2 text-center text-sm text-orange-400 font-bold flex items-center justify-center gap-1.5">
                         <TrendingUp size={16} /> 
                         <span>{user.streak}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-py-green font-bold text-sm tracking-wide pr-2">{formatXP(user.xp)}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};