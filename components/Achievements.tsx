import React, { useState } from 'react';
import { Trophy, Sparkles, Share2, X } from 'lucide-react';
import { ACHIEVEMENTS, getIconComponent } from '../constants';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
type Category = 'all' | 'coding' | 'community' | 'streak' | 'secret';

const RARITY_STYLES = {
    common: {
        border: 'border-slate-500',
        bg: 'bg-slate-800',
        glow: '',
        text: 'text-slate-300',
        iconBg: 'bg-slate-700',
        name: 'Обычный'
    },
    rare: {
        border: 'border-cyan-500',
        bg: 'bg-slate-900',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
        text: 'text-cyan-400',
        iconBg: 'bg-cyan-950',
        name: 'Редкий'
    },
    epic: {
        border: 'border-purple-500',
        bg: 'bg-[#1e1b2e]',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        text: 'text-purple-400',
        iconBg: 'bg-purple-950',
        name: 'Эпический'
    },
    legendary: {
        border: 'border-amber-400',
        bg: 'bg-gradient-to-br from-slate-900 to-amber-950',
        glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse-glow',
        text: 'text-amber-400',
        iconBg: 'bg-amber-900/50',
        name: 'Легендарный'
    }
};

export const Achievements: React.FC = () => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [filter, setFilter] = useState<Category>('all');

    const unlockedCount = ACHIEVEMENTS.filter((a: any) => a.unlocked).length;
    const totalCount = ACHIEVEMENTS.length;
    const completionPercent = Math.round((unlockedCount / totalCount) * 100);
    
    // Calculate Rank
    let rank = "Новичок";
    if (completionPercent > 30) rank = "Искатель";
    if (completionPercent > 60) rank = "Хранитель Байт";
    if (completionPercent > 90) rank = "Легендарный Архивариус";

    const filteredList = ACHIEVEMENTS.filter((a: any) => filter === 'all' || a.category === filter);
    const selectedAchievement = ACHIEVEMENTS.find((a: any) => a.id === selectedId);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pt-6 min-h-screen">
            
            {/* Header: Collector's Dashboard */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -top-20 -right-20 size-64 bg-arcade-primary/20 blur-[80px] rounded-full"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-20 md:size-24 bg-black/40 rounded-full border-4 border-arcade-action flex items-center justify-center shadow-neon-orange relative">
                            <Trophy size={40} className="text-arcade-action fill-arcade-action/20" />
                            <div className="absolute -bottom-2 bg-arcade-action text-white text-xs font-black px-2 py-0.5 rounded-md">
                                {completionPercent}%
                            </div>
                        </div>
                        <div>
                            <p className="text-arcade-muted text-sm font-bold uppercase tracking-widest mb-1">Ранг Коллекционера</p>
                            <h1 className="text-3xl md:text-4xl font-display font-black text-white">{rank}</h1>
                            <p className="text-sm text-gray-400 mt-1">Собрано <span className="text-white font-bold">{unlockedCount}</span> из <span className="text-white font-bold">{totalCount}</span> артефактов</p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-8 text-center bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div>
                            <p className="text-2xl font-black text-white">1250</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Очки (AP)</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div>
                            <p className="text-2xl font-black text-arcade-action">4</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Редких</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div>
                            <p className="text-2xl font-black text-amber-400">0</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Легенд</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar-none">
                {[
                    { id: 'all', label: 'Все' },
                    { id: 'coding', label: 'Кодинг' },
                    { id: 'community', label: 'Сообщество' },
                    { id: 'streak', label: 'Стрик' },
                    { id: 'secret', label: 'Скрытые' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as Category)}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border
                            ${filter === tab.id 
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Trophy Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredList.map((ach: any) => {
                    const style = RARITY_STYLES[ach.rarity as Rarity];
                    const isSecret = ach.category === 'secret' && !ach.unlocked;
                    const IconComponent = getIconComponent(ach.icon);

                    return (
                        <div 
                            key={ach.id}
                            onClick={() => setSelectedId(ach.id)}
                            className={`
                                group relative aspect-[4/5] rounded-2xl p-1 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10
                                ${ach.unlocked 
                                    ? `bg-slate-900 ${style.glow}` 
                                    : 'bg-slate-900/50 opacity-80 hover:opacity-100'}
                            `}
                        >
                            {/* Card Border / Frame */}
                            <div className={`
                                absolute inset-0 rounded-2xl border-2 ${ach.unlocked ? style.border : 'border-slate-700'} 
                                opacity-60 group-hover:opacity-100 transition-opacity
                            `}></div>

                            {/* Inner Content */}
                            <div className={`
                                h-full w-full rounded-xl bg-[#0F172A] relative overflow-hidden flex flex-col items-center justify-between p-4
                                ${ach.unlocked ? '' : 'grayscale'}
                            `}>
                                {/* Background Effect for Rarity */}
                                {ach.unlocked && (
                                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-${style.text.split('-')[1]}-500/20`}></div>
                                )}

                                {/* Rarity Gem/Header */}
                                <div className="w-full flex justify-between items-start z-10">
                                    {ach.unlocked ? (
                                        <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/40 border border-white/10 ${style.text}`}>
                                            {style.name}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-black/40 text-gray-500">
                                            Locked
                                        </div>
                                    )}
                                    {ach.unlocked && ach.rarity === 'legendary' && (
                                        <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
                                    )}
                                </div>

                                {/* Icon */}
                                <div className={`
                                    relative z-10 size-16 md:size-20 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg
                                    ${ach.unlocked ? style.iconBg : 'bg-slate-800'}
                                `}>
                                    <IconComponent
                                        size={32} 
                                        strokeWidth={1.5} 
                                        className={`
                                            transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6
                                            ${ach.unlocked ? style.text : 'text-gray-600'}
                                        `}
                                    />
                                    {/* Shine effect for unlocked */}
                                    {ach.unlocked && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:200%_200%] animate-shine"></div>}
                                </div>

                                {/* Text */}
                                <div className="z-10 text-center w-full">
                                    <h3 className={`font-bold text-sm md:text-base leading-tight mb-1 truncate ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {isSecret ? '?? ??? ??' : ach.title}
                                    </h3>
                                    {!ach.unlocked && (
                                        <div className="w-full h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${ach.progress > 0 ? 'bg-blue-500' : 'bg-transparent'}`} 
                                                style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DETAIL MODAL */}
            {selectedAchievement && (() => {
                const style = RARITY_STYLES[selectedAchievement.rarity as Rarity];
                const isSecret = selectedAchievement.category === 'secret' && !selectedAchievement.unlocked;
                const IconComponent = getIconComponent(selectedAchievement.icon);

                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedId(null)}></div>
                        
                        <div className={`
                            relative w-full max-w-md bg-[#0F172A] border-2 ${selectedAchievement.unlocked ? style.border : 'border-slate-600'} 
                            rounded-3xl p-1 shadow-2xl animate-float-up overflow-hidden
                        `}>
                            {/* Close Button */}
                            <button onClick={() => setSelectedId(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors">
                                <X size={20} />
                            </button>

                            <div className="bg-[#1E293B] rounded-[1.3rem] p-6 flex flex-col items-center text-center relative overflow-hidden h-full">
                                {/* Background Ambient Light */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b ${selectedAchievement.unlocked ? `from-${style.text.split('-')[1]}-500/20` : 'from-gray-500/10'} to-transparent pointer-events-none`}></div>

                                {/* Rarity Badge */}
                                <div className={`relative z-10 px-3 py-1 rounded-full border border-white/10 bg-black/40 text-xs font-black uppercase tracking-widest mb-6 ${selectedAchievement.unlocked ? style.text : 'text-gray-500'}`}>
                                    {style.name}
                                </div>

                                {/* Big Icon */}
                                <div className={`
                                    relative z-10 size-32 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/10
                                    ${selectedAchievement.unlocked ? style.iconBg : 'bg-slate-800 grayscale'}
                                    ${selectedAchievement.rarity === 'legendary' && selectedAchievement.unlocked ? 'animate-pulse-glow' : ''}
                                `}>
                                    <IconComponent size={64} className={selectedAchievement.unlocked ? style.text : 'text-gray-500'} strokeWidth={1.5} />
                                    {selectedAchievement.unlocked && <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-50"></div>}
                                </div>

                                {/* Content */}
                                <h2 className={`relative z-10 text-2xl md:text-3xl font-display font-black mb-2 ${selectedAchievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                                    {isSecret ? 'Засекречено' : selectedAchievement.title}
                                </h2>
                                
                                <p className="relative z-10 text-gray-400 text-sm mb-4 max-w-xs">
                                    {isSecret ? 'Выполните скрытое условие, чтобы открыть этот артефакт.' : selectedAchievement.description}
                                </p>

                                {/* Flavor Text (Only unlocked) */}
                                {selectedAchievement.unlocked && (
                                    <div className="relative z-10 bg-black/30 p-3 rounded-xl border border-white/5 mb-6 italic text-gray-300 text-sm font-serif">
                                        "{selectedAchievement.flavorText}"
                                    </div>
                                )}

                                {/* Progress Bar (Only locked) */}
                                {!selectedAchievement.unlocked && (
                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-white/5 mb-6">
                                        <div 
                                            className="h-full bg-gradient-to-r from-arcade-action to-red-500 shadow-neon-orange" 
                                            style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                                        ></div>
                                    </div>
                                )}

                                {/* Stats Footer */}
                                <div className="w-full grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Владеют</span>
                                        <span className="text-white font-bold">{selectedAchievement.globalRate}%</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Награда</span>
                                        <span className="text-arcade-primary font-bold">+{selectedAchievement.xpReward} XP</span>
                                    </div>
                                </div>

                                {/* Share Button */}
                                {selectedAchievement.unlocked && (
                                    <button className="mt-6 w-full py-3 bg-white text-black rounded-xl font-black uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                        <Share2 size={18} />
                                        Похвастаться
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};