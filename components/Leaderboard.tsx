import React, { useState, useMemo, useEffect } from 'react';
import { Crown, ChevronUp, ChevronDown, Minus, Globe, Shield, Zap, Gem, Medal, Sword } from 'lucide-react';
import { APP_LANGUAGE, CURRENT_USER, UI_TEXTS } from '../constants';
import { apiGet } from '../api';

const formatXP = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const getTierIcon = (tier: string) => {
    switch(tier) {
        case 'diamond': return <Gem size={16} className="text-cyan-400 fill-cyan-400/20" />;
        case 'platinum': return <Shield size={16} className="text-violet-400 fill-violet-400/20" />;
        case 'gold': return <Crown size={16} className="text-yellow-400 fill-yellow-400/20" />;
        case 'silver': return <Medal size={16} className="text-slate-300 fill-slate-300/20" />;
        case 'bronze': return <Medal size={16} className="text-orange-700 fill-orange-700/20" />;
        default: return <Zap size={16} />;
    }
};

const getTierColor = (tier: string) => {
    switch(tier) {
        case 'diamond': return 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
        case 'platinum': return 'border-violet-500 shadow-[0_0_15px_rgba(167,139,250,0.3)]';
        case 'gold': return 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
        case 'silver': return 'border-slate-400';
        case 'bronze': return 'border-orange-700';
        default: return 'border-gray-700';
    }
}

export const Leaderboard: React.FC = () => {
    const isKz = APP_LANGUAGE === 'kz';
    const scope: 'global' = 'global';
    const period: 'all' = 'all';
    const [leaders, setLeaders] = useState<any[]>([]);
    const text = UI_TEXTS?.leaderboard ?? {};
    const localText = {
        world: isKz ? 'Әлем' : 'Мир',
        all: isKz ? 'Барлығы' : 'Все',
        emptyTitle: isKz ? 'Рейтинг әзірге бос' : 'Рейтинг пока пуст',
        emptyDescription: isKz ? 'Ойыншылар нәтижелері пайда болғанда, лидерлер кестесі осында көрсетіледі.' : 'Как только появятся результаты игроков, таблица лидеров отобразится здесь.',
    };

  useEffect(() => {
      const loadLeaderboard = async () => {
          try {
              const data = await apiGet<any[]>(`/leaderboard?scope=${scope}&period=${period}`);
              setLeaders(data);
          } catch {
              setLeaders([]);
          }
      };

      loadLeaderboard();
  }, []);

  const displayedLeaders = useMemo(() => {
      // Re-rank after filtering for display purposes
      return [...leaders].sort((a, b) => b.xp - a.xp).map((l, idx) => ({ ...l, displayRank: idx + 1 }));
  }, [leaders]);

  const topThree = displayedLeaders.slice(0, 3);
  const list = displayedLeaders.slice(3);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-200/40 dark:from-indigo-900/20 to-transparent pointer-events-none" />
      
      {/* Header & Filters */}
      <div className="p-6 md:px-8 pb-0 z-10 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-8">
              <div>
                  <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white italic uppercase tracking-tighter transform -skew-x-6">
                      {text.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-arcade-action to-red-500">{text.titleHighlight}</span>
                  </h1>
                  <p className="text-arcade-muted font-bold mt-1">{text.season}</p>
              </div>

              {/* Filters */}
              <div className="flex bg-white dark:bg-[#1E293B] p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                    <div className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-arcade-primary text-white shadow-lg">
                                        <Globe size={16} /> {text?.scopes?.global || localText.world}
                                    </div>
              </div>
          </div>

          <div className="flex justify-center mb-6">
               <div className="flex gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md">
                                     <div className="px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white text-slate-900 shadow-neon-white">
                                         {text?.periods?.all || localText.all}
                                     </div>
               </div>
          </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-32">
          {displayedLeaders.length === 0 && (
              <div className="max-w-3xl mx-auto mb-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-slate-900 dark:text-white font-bold mb-2">{localText.emptyTitle}</p>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">{localText.emptyDescription}</p>
              </div>
          )}
          
          {/* PODIUM (Only if we have enough users) */}
          {displayedLeaders.length >= 3 && (
            <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 min-h-[320px]">
              
              {/* 2nd Place */}
              <div className="flex flex-col items-center group">
                  <div className="relative mb-4">
                      <div className="size-20 md:size-24 rounded-full border-4 border-slate-300 shadow-[0_0_30px_rgba(203,213,225,0.3)] z-10 relative overflow-hidden bg-slate-800">
                          <img src={topThree[1].avatar} className="size-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 dark:text-slate-100 font-black px-2 py-0.5 rounded text-xs z-20 shadow-lg border-2 border-slate-900">
                          #2
                      </div>
                  </div>
                  <div className="bg-gradient-to-b from-slate-800 to-slate-900/50 p-4 rounded-t-2xl border-t-2 border-slate-300 w-28 md:w-40 text-center h-[180px] flex flex-col justify-end relative shadow-[0_0_30px_rgba(148,163,184,0.1)] group-hover:-translate-y-2 transition-transform">
                      <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">{topThree[1].title}</div>
                      <div className="text-white font-bold text-sm md:text-base truncate">{topThree[1].name}</div>
                      <div className="text-slate-400 font-mono text-xs mt-1">{formatXP(topThree[1].xp)} XP</div>
                  </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center z-10 group">
                   <div className="relative mb-4">
                      <Crown size={40} className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 fill-yellow-400 animate-bounce-sm drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                      <div className="size-28 md:size-32 rounded-full border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.5)] z-10 relative overflow-hidden bg-yellow-900/20 ring-4 ring-yellow-400/20">
                          <img src={topThree[0].avatar} className="size-full object-cover" />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 font-black px-3 py-1 rounded-lg text-sm z-20 shadow-[0_0_20px_rgba(234,179,8,0.6)] border-2 border-yellow-950 flex items-center gap-1">
                          <Sword size={12} fill="currentColor" /> #1
                      </div>
                  </div>
                  <div className="bg-gradient-to-b from-yellow-900/40 to-slate-900/50 p-6 rounded-t-3xl border-t-4 border-yellow-400 w-36 md:w-52 text-center h-[220px] flex flex-col justify-end relative shadow-[0_0_60px_rgba(234,179,8,0.15)] group-hover:-translate-y-2 transition-transform backdrop-blur-sm">
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 rounded-t-3xl"></div>
                      <div className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-1 drop-shadow-sm">{topThree[0].title}</div>
                      <div className="text-white font-black text-lg md:text-xl truncate">{topThree[0].name}</div>
                      <div className="text-yellow-200/80 font-mono text-sm mt-1 font-bold">{formatXP(topThree[0].xp)} XP</div>
                  </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center group">
                  <div className="relative mb-4">
                      <div className="size-20 md:size-24 rounded-full border-4 border-orange-700 shadow-[0_0_30px_rgba(194,65,12,0.3)] z-10 relative overflow-hidden bg-slate-800">
                          <img src={topThree[2].avatar} className="size-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white font-black px-2 py-0.5 rounded text-xs z-20 shadow-lg border-2 border-slate-900">
                          #3
                      </div>
                  </div>
                  <div className="bg-gradient-to-b from-slate-800 to-slate-900/50 p-4 rounded-t-2xl border-t-2 border-orange-700 w-28 md:w-40 text-center h-[160px] flex flex-col justify-end relative shadow-[0_0_30px_rgba(194,65,12,0.1)] group-hover:-translate-y-2 transition-transform">
                      <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">{topThree[2].title}</div>
                      <div className="text-white font-bold text-sm md:text-base truncate">{topThree[2].name}</div>
                      <div className="text-slate-400 font-mono text-xs mt-1">{formatXP(topThree[2].xp)} XP</div>
                  </div>
              </div>
            </div>
          )}

          {/* THE LIST */}
          <div className="space-y-3 max-w-4xl mx-auto">
              {list.map((player) => (
                  <div 
                    key={player.name}
                    className={`bg-[#1E293B] hover:bg-[#283548] border ${player.name === CURRENT_USER.name ? 'border-arcade-primary/50 bg-arcade-primary/5' : 'border-white/5'} hover:border-white/10 rounded-xl p-4 flex items-center gap-4 md:gap-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg group`}
                  >
                      {/* Rank */}
                      <div className="font-mono font-bold text-slate-500 dark:text-gray-400 text-xl w-8 text-center group-hover:text-slate-900 dark:group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {player.displayRank}
                      </div>

                      {/* Change Indicator */}
                      <div className="flex flex-col items-center w-8">
                          {player.change === 'up' && <ChevronUp size={20} className="text-arcade-success" />}
                          {player.change === 'down' && <ChevronDown size={20} className="text-arcade-danger" />}
                          {player.change === 'same' && <Minus size={20} className="text-gray-600 dark:text-gray-400" />}
                          {player.changeAmount && (
                              <span className={`text-[10px] font-bold ${player.change === 'up' ? 'text-arcade-success' : 'text-arcade-danger'}`}>
                                  {player.change === 'up' ? '+' : '-'}{player.changeAmount}
                              </span>
                          )}
                      </div>

                      {/* Avatar & Info */}
                      <div className="flex items-center gap-4 flex-1">
                          <div className={`size-12 rounded-full border-2 ${getTierColor(player.tier)} p-0.5`}>
                              <img src={player.avatar} className="size-full rounded-full bg-black object-cover" />
                          </div>
                          <div>
                              <div className="flex items-center gap-2">
                                  <h3 className={`font-bold text-base md:text-lg ${player.name === CURRENT_USER.name ? 'text-arcade-primary' : 'text-slate-900 dark:text-white'}`}>{player.name}</h3>
                                  <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-100 dark:bg-black/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-gray-400 border border-white/5">
                                      {getTierIcon(player.tier)}
                                      <span>{player.league}</span>
                                  </div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">{player.title}</p>
                          </div>
                      </div>

                      {/* XP Badge */}
                      <div className="bg-arcade-action/10 text-arcade-action border border-arcade-action/20 px-3 md:px-4 py-1 md:py-2 rounded-full font-mono font-bold text-sm md:text-base whitespace-nowrap shadow-neon-orange/20">
                          {formatXP(player.xp)} XP
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Sticky Current User Stats */}
      <div className="absolute bottom-0 left-0 w-full bg-[#1E293B]/95 backdrop-blur-xl border-t border-arcade-primary/30 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                <div className="font-mono font-black text-white text-xl w-8 text-center">{CURRENT_USER.rank ?? 0}</div>
                   <div className="size-12 rounded-full border-2 border-arcade-primary p-0.5 shadow-neon-purple relative">
                        <img src={CURRENT_USER.avatar} className="size-full rounded-full bg-black object-cover" />
                        <div className="absolute -top-1 -right-1 bg-arcade-primary text-white text-[10px] font-bold px-1.5 rounded-full border border-[#1E293B]">{text.youBadge}</div>
                   </div>
                   <div className="hidden sm:block">
                       <h3 className="font-bold text-white">{CURRENT_USER.name}</h3>
                       <p className="text-xs text-arcade-mentor font-medium">{text.currentUserSubtitle}</p>
                   </div>
               </div>
               
               <div className="flex items-center gap-6">
                   <div className="text-right hidden md:block">
                       <p className="text-[10px] text-slate-600 dark:text-gray-400 font-bold uppercase">{text.nextRank}</p>
                       <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                           <div className="h-full bg-arcade-primary w-[75%] rounded-full shadow-[0_0_10px_#A855F7]"></div>
                       </div>
                   </div>
                   <div className="text-white font-mono font-black text-xl">
                       {formatXP(CURRENT_USER.xp)} XP
                   </div>
               </div>
          </div>
      </div>

    </div>
  );
};