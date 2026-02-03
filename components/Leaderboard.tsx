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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 md:space-y-12 animate-fade-in pb-20 pt-6">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Таблица лидеров</h1>
          <p className="text-py-muted max-w-md text-sm md:text-base leading-relaxed">
            Соревнуйтесь с лучшими разработчиками, повышайте ранг и получайте награды.
          </p>
        </div>
        
        {/* League Selector */}
        <div className="bg-[#0a0f0b] border border-py-accent p-1.5 rounded-xl shadow-lg w-full md:w-auto overflow-x-auto">
           <div className="flex gap-1 min-w-max">
              {['Gold', 'Diamond', 'Master'].map((l) => (
                <button 
                  key={l}
                  onClick={() => setLeague(l)}
                  className={`px-6 md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                    league === l 
                    ? 'bg-[#1f2e25] text-white shadow-md border border-white/5' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {l}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Podium - Fixed crown overlap */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 items-end mb-12 min-h-[280px] md:min-h-[360px]">
        
        {/* 2nd Place */}
        <div className="order-1 bg-[#0c120e] border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-6 flex flex-col items-center relative h-[220px] md:h-[300px] justify-end group hover:border-py-accent transition-colors shadow-lg">
           <div className="absolute top-4 md:top-8 size-16 md:size-24 rounded-full border-4 border-gray-500 p-1 bg-[#0c120e]">
             <img src={MOCK_LEADERS[1].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 2" />
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-500 text-py-dark font-black size-5 md:size-7 rounded-full flex items-center justify-center text-xs md:text-sm border-4 border-[#0c120e]">2</div>
           </div>
           
           <h3 className="text-xs md:text-xl font-bold text-white mt-4 mb-1 text-center truncate w-full">{MOCK_LEADERS[1].name}</h3>
           <p className="text-white font-mono font-black text-sm md:text-xl mb-4 md:mb-6 tracking-wide drop-shadow-sm">
             {formatXP(MOCK_LEADERS[1].xp)}
           </p>
           
           <div className="w-full pt-2 md:pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-6 text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <span className="text-gray-400">Lvl {MOCK_LEADERS[1].level}</span>
              <span className="text-orange-400 flex items-center gap-1.5">
                  <TrendingUp size={14}/> {MOCK_LEADERS[1].streak}
              </span>
           </div>
        </div>

        {/* 1st Place - Center */}
        <div className="order-2 bg-gradient-to-b from-[#1a2e21] to-[#0a0f0b] border border-yellow-500/20 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center relative h-[280px] md:h-[380px] justify-end shadow-[0_0_50px_rgba(234,179,8,0.05)] z-10 transform -translate-y-2 md:-translate-y-4 overflow-visible">
           {/* Crown moved up */}
           <div className="absolute -top-8 md:-top-10">
             <Crown size={48} md:size={64} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]" />
           </div>
           
           <div className="absolute top-8 md:top-12 size-24 md:size-36 rounded-full border-4 border-yellow-400 p-1 shadow-[0_0_40px_rgba(250,204,21,0.15)] bg-[#0a0f0b]">
             <img src={MOCK_LEADERS[0].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 1" />
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black font-black size-8 md:size-10 rounded-full flex items-center justify-center border-4 border-[#1a2e21] text-sm md:text-lg">1</div>
           </div>
           
           <h3 className="text-sm md:text-2xl font-black text-white mt-8 md:mt-12 mb-1 md:mb-2 tracking-tight text-center truncate w-full">{MOCK_LEADERS[0].name}</h3>
           <p className="text-yellow-400 font-mono font-black text-lg md:text-3xl mb-4 md:mb-8 drop-shadow-md">{formatXP(MOCK_LEADERS[0].xp)}</p>
           
           <div className="bg-[#111c15] rounded-xl w-full flex items-center justify-between p-2 md:p-4 border border-white/10 shadow-inner">
               <div className="flex flex-col items-center w-1/2 border-r border-white/10">
                    <span className="text-[8px] md:text-[10px] uppercase text-gray-400 font-bold mb-1">УРОВЕНЬ</span>
                    <span className="text-white font-bold text-sm md:text-xl">{MOCK_LEADERS[0].level}</span>
               </div>
               <div className="flex flex-col items-center w-1/2">
                    <span className="text-[8px] md:text-[10px] uppercase text-gray-400 font-bold mb-1">СТРИК</span>
                    <span className="text-orange-400 font-bold text-sm md:text-xl flex items-center gap-1.5">
                        <TrendingUp size={14} md:size={18}/> {MOCK_LEADERS[0].streak}
                    </span>
               </div>
           </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 bg-[#0c120e] border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-6 flex flex-col items-center relative h-[220px] md:h-[300px] justify-end group hover:border-py-accent transition-colors shadow-lg">
          <div className="absolute top-4 md:top-8 size-16 md:size-24 rounded-full border-4 border-orange-700 p-1 bg-[#0c120e]">
             <img src={MOCK_LEADERS[2].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 3" />
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white font-black size-5 md:size-7 rounded-full flex items-center justify-center text-xs md:text-sm border-4 border-[#0c120e]">3</div>
          </div>
          
          <h3 className="text-xs md:text-xl font-bold text-white mt-4 mb-1 text-center truncate w-full">{MOCK_LEADERS[2].name}</h3>
           <p className="text-white font-mono font-black text-sm md:text-xl mb-4 md:mb-6 tracking-wide drop-shadow-sm">
             {formatXP(MOCK_LEADERS[2].xp)}
           </p>
          
          <div className="w-full pt-2 md:pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-6 text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <span className="text-gray-400">Lvl {MOCK_LEADERS[2].level}</span>
              <span className="text-orange-400 flex items-center gap-1.5">
                  <TrendingUp size={14}/> {MOCK_LEADERS[2].streak}
              </span>
          </div>
        </div>
      </div>

      {/* List - Added zebra striping and better spacing */}
      <div className="bg-[#0c120e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
        <div className="min-w-[600px]">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 bg-[#0a0f0b]">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5 text-left pl-4">УЧАСТНИК</div>
                <div className="col-span-2 text-center">УРОВЕНЬ</div>
                <div className="col-span-2 text-center">СТРИК</div>
                <div className="col-span-2 text-right pr-4">XP</div>
            </div>
            
            <div className="flex flex-col">
                {MOCK_LEADERS.slice(3).map((user, index) => (
                    <div key={user.rank} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0 even:bg-white/[0.02]">
                        <div className="col-span-1 flex flex-col items-center justify-center">
                            <span className="font-bold text-white text-base opacity-80">{user.rank}</span>
                        </div>
                        <div className="col-span-5 flex items-center gap-4 pl-4">
                            <div className="size-10 rounded-full bg-[#151e18] flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                                {user.avatar ? (
                                    <img src={user.avatar} className="size-full object-cover" alt={user.name}/>
                                ) : (
                                    <span className="text-xs font-bold text-gray-400">{user.name[0]}</span>
                                )}
                            </div>
                            <div>
                                <span className="font-bold text-gray-200 text-sm group-hover:text-white transition-colors block">{user.name}</span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    {user.change === 'up' && <ChevronUp size={10} className="text-py-green"/>}
                                    {user.change === 'down' && <ChevronDown size={10} className="text-red-500"/>}
                                    {user.change === 'same' && <Minus size={10} className="text-gray-600"/>}
                                    <span>Rank change</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 text-center text-sm text-gray-400 font-bold">{user.level}</div>
                        <div className="col-span-2 text-center text-sm text-orange-400 font-bold flex items-center justify-center gap-1.5">
                            <TrendingUp size={16} /> 
                            <span>{user.streak}</span>
                        </div>
                        <div className="col-span-2 text-right font-mono text-py-green font-bold text-sm tracking-wide pr-4">{formatXP(user.xp)}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};