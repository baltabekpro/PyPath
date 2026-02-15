import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, Image, Code, Hash, TrendingUp, Search, Filter } from 'lucide-react';
import { CURRENT_USER, POSTS } from '../constants';

const TOP_TAGS = [
  { name: "Python", count: 1250 },
  { name: "Django", count: 850 },
  { name: "MachineLearning", count: 620 },
  { name: "Beginners", count: 450 },
  { name: "Career", count: 320 }
];

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'popular' | 'new'>('popular');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2">Сообщество</h1>
           <p className="text-py-muted">Обсуждайте код, делитесь опытом и находите менторов.</p>
        </div>
        <button className="bg-py-green text-py-dark px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity">
            Новый пост
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Create Post Input */}
            <div className="bg-py-surface border border-py-accent rounded-2xl p-4">
                <div className="flex gap-4">
                    <img src={CURRENT_USER.avatar} className="size-10 rounded-full border border-py-accent" alt="Me" />
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="О чем хотите рассказать?" 
                            className="w-full bg-transparent text-white placeholder-py-muted/70 outline-none text-sm mb-4"
                        />
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/5 rounded-lg text-py-green transition-colors"><Image size={18}/></button>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-py-green transition-colors"><Code size={18}/></button>
                                <button className="p-2 hover:bg-white/5 rounded-lg text-py-green transition-colors"><Hash size={18}/></button>
                            </div>
                            <button className="text-xs font-bold text-py-muted hover:text-white transition-colors">Предпросмотр</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 border-b border-py-accent pb-2">
                <button 
                    onClick={() => setActiveTab('popular')}
                    className={`pb-2 px-2 text-sm font-bold transition-colors relative ${activeTab === 'popular' ? 'text-white' : 'text-py-muted hover:text-white'}`}
                >
                    Популярное
                    {activeTab === 'popular' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-py-green rounded-full shadow-[0_0_8px_#0df259]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('new')}
                    className={`pb-2 px-2 text-sm font-bold transition-colors relative ${activeTab === 'new' ? 'text-white' : 'text-py-muted hover:text-white'}`}
                >
                    Свежее
                    {activeTab === 'new' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-py-green rounded-full shadow-[0_0_8px_#0df259]"></div>}
                </button>
                <div className="ml-auto flex items-center gap-2 text-py-muted hover:text-white cursor-pointer">
                    <Filter size={16} />
                    <span className="text-xs">Фильтры</span>
                </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {POSTS.map((post: any) => (
                    <div key={post.id} className="bg-py-surface border border-py-accent rounded-2xl p-6 hover:border-py-green/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img src={post.author.avatar} alt={post.author.name} className="size-10 rounded-full border border-py-accent" />
                                <div>
                                    <h4 className="font-bold text-white text-sm">{post.author.name}</h4>
                                    <p className="text-xs text-py-muted">{post.time} • Уровень {post.author.level}</p>
                                </div>
                            </div>
                            <button className="text-py-muted hover:text-white"><MoreHorizontal size={18}/></button>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            {post.content}
                        </p>

                        {post.code && (
                            <div className="bg-py-dark rounded-xl p-4 mb-4 border border-py-accent font-mono text-xs text-py-green overflow-x-auto">
                                <pre>{post.code}</pre>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-py-accent/50 text-py-muted px-2 py-1 rounded-md hover:text-py-green cursor-pointer transition-colors">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                            <button className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.liked ? 'text-red-500' : 'text-py-muted hover:text-red-500'}`}>
                                <Heart size={18} fill={post.liked ? "currentColor" : "none"} />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm font-medium text-py-muted hover:text-py-green transition-colors">
                                <MessageSquare size={18} />
                                <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm font-medium text-py-muted hover:text-white transition-colors ml-auto">
                                <Share2 size={18} />
                                <span>Поделиться</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-py-muted" size={16} />
                <input 
                    type="text" 
                    placeholder="Поиск по обсуждениям..." 
                    className="w-full bg-py-surface border border-py-accent rounded-xl py-3 pl-10 pr-4 text-sm focus:border-py-green text-white placeholder-py-muted outline-none transition-all"
                />
            </div>

            {/* Trending Tags */}
            <div className="bg-py-surface border border-py-accent rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-py-green" />
                    Популярные темы
                </h3>
                <div className="space-y-3">
                    {TOP_TAGS.map((tag, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <span className="text-py-muted group-hover:text-py-green transition-colors text-sm">#{tag.name}</span>
                            <span className="text-xs text-py-accent bg-py-green/10 px-2 py-0.5 rounded-full text-py-green font-bold">{tag.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-py-surface border border-py-accent rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Топ участников</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="relative">
                                <img src={`https://i.pravatar.cc/150?u=${i+10}`} className="size-10 rounded-full" alt="User" />
                                <div className="absolute -top-1 -right-1 bg-py-dark rounded-full p-0.5">
                                    <div className="bg-yellow-500 text-[8px] font-bold text-black size-4 flex items-center justify-center rounded-full">
                                        {i}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-white hover:text-py-green cursor-pointer">User_{99+i}</h5>
                                <p className="text-xs text-py-muted">{1500 - i*100} репутации</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};