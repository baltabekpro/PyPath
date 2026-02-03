import React, { useState } from 'react';
import { Play, Bug, TerminalSquare, Folder, File, Settings, Database, Share2, History, X, Send, Sparkles } from 'lucide-react';

export const Editor: React.FC = () => {
  const [output, setOutput] = useState<string[]>([
    "Microsoft Windows [Version 10.0.19045.4170]",
    "(env) C:\\Users\\PyPath\\learning_bot> python main.py"
  ]);

  const runCode = () => {
      setOutput(prev => [...prev, "Запуск PyPath...", "score: 30.0", "(env) C:\\Users\\PyPath\\learning_bot> "]);
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-editor-bg">
      {/* Sidebar - File Explorer */}
      <aside className="w-64 border-r border-py-accent bg-editor-sidebar flex flex-col">
        <div className="p-4 border-b border-py-accent">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-py-muted/60">ПРОВОДНИК</h2>
          </div>
          <p className="text-py-green text-sm font-medium truncate">проект: learning_bot</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-py-green/10 text-py-green text-sm cursor-pointer">
            <File size={16} />
            <span>main.py</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-py-muted hover:bg-white/5 rounded-lg text-sm cursor-pointer">
            <Folder size={16} />
            <span>utils</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-py-muted hover:bg-white/5 rounded-lg text-sm cursor-pointer pl-8">
            <File size={16} />
            <span>helpers.py</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-py-muted hover:bg-white/5 rounded-lg text-sm cursor-pointer">
            <Settings size={16} />
            <span>config.json</span>
          </div>
           <div className="flex items-center gap-2 px-3 py-2 text-py-muted hover:bg-white/5 rounded-lg text-sm cursor-pointer">
            <Database size={16} />
            <span>database.db</span>
          </div>
        </nav>
      </aside>

      {/* Main Editor Area */}
      <div className="flex flex-1 flex-col relative">
        {/* Editor Tabs/Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-py-accent bg-editor-bg px-4 h-10">
          <div className="flex items-center gap-2 text-sm text-py-muted">
             <span>проекты</span>
             <span>/</span>
             <span>learning_bot</span>
             <span>/</span>
             <span className="text-white font-medium">main.py</span>
          </div>
          <div className="flex gap-2">
             <button className="p-1 hover:text-white text-py-muted transition-colors"><Share2 size={16}/></button>
             <button className="p-1 hover:text-white text-py-muted transition-colors"><History size={16}/></button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto font-mono text-sm leading-relaxed p-6 bg-[#0a0f0b] text-gray-300">
           <div className="flex gap-4">
             <div className="text-right text-py-muted/30 select-none pr-4 border-r border-white/5 flex flex-col gap-1">
               {Array.from({length: 15}).map((_, i) => <span key={i}>{i + 1}</span>)}
             </div>
             <div className="flex-1 flex flex-col gap-1">
                <div><span className="text-[#c678dd]">import</span> pandas <span className="text-[#c678dd]">as</span> pd</div>
                <div><span className="text-[#c678dd]">import</span> os</div>
                <div className="h-4"></div>
                <div><span className="text-[#c678dd]">def</span> <span className="text-[#61afef]">calculate_pypath</span>(data):</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#5c6370] italic"># AI Tip: Use vectorization for speed</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;result = data.mean() * <span className="text-[#d19a66]">1.5</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#c678dd]">return</span> result</div>
                <div className="h-4"></div>
                <div><span className="text-[#c678dd]">if</span> __name__ == <span className="text-[#98c379]">'__main__'</span>:</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e5c07b]">print</span>(<span className="text-[#98c379]">'Running PyPath...'</span>)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;df = pd.DataFrame&#123;<span className="text-[#98c379]">'score'</span>: [<span className="text-[#d19a66]">10</span>, <span className="text-[#d19a66]">20</span>, <span className="text-[#d19a66]">30</span>]&#125;</div>
                <div className="flex items-center">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e5c07b]">print</span>(<span className="text-[#61afef]">calculate_pypath</span>(df)) <span className="w-2 h-5 bg-py-green/80 animate-pulse ml-1"></span></div>
             </div>
           </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute right-8 bottom-48 flex flex-col gap-3 z-10">
            <button onClick={runCode} className="flex items-center gap-2 rounded-xl bg-py-green px-6 py-3 text-py-dark font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(13,242,89,0.4)]">
                <Play size={18} fill="currentColor" />
                Запуск
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-py-accent border border-py-green/30 px-6 py-3 text-white font-bold hover:bg-py-surface transition-all">
                <Bug size={18} className="text-py-green"/>
                Отладка
            </button>
        </div>

        {/* Terminal */}
        <div className="h-40 border-t border-py-accent bg-[#0c140e] flex flex-col">
           <div className="flex items-center gap-6 px-4 py-2 border-b border-white/5 text-xs font-bold tracking-wider">
              <button className="text-py-green border-b-2 border-py-green pb-1">ТЕРМИНАЛ</button>
              <button className="text-py-muted hover:text-white pb-1 transition-colors">ВЫВОД</button>
              <button className="text-py-muted hover:text-white pb-1 transition-colors">КОНСОЛЬ ОТЛАДКИ</button>
           </div>
           <div className="p-4 font-mono text-xs text-py-muted/80 overflow-y-auto">
             {output.map((line, i) => (
                 <p key={i} className={line.startsWith('Запуск') ? 'text-py-green font-bold my-1' : ''}>{line}</p>
             ))}
             <span className="animate-pulse">_</span>
           </div>
        </div>
      </div>

      {/* AI Chat Bubble Mockup */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
        <div className="bg-py-dark border border-py-green/30 rounded-2xl w-80 shadow-2xl flex flex-col overflow-hidden ring-1 ring-py-green/20">
            <div className="bg-py-green/10 p-3 border-b border-py-green/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-py-green" size={16}/>
                    <span className="text-sm font-bold text-white">ИИ Помощник</span>
                </div>
                <button className="text-py-muted hover:text-white"><X size={16}/></button>
            </div>
            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3 text-sm bg-[#0f1912]">
                <div className="bg-py-accent p-3 rounded-lg rounded-tl-none self-start max-w-[90%] text-white">
                    Привет! Вижу, ты используешь pandas. Нужна помощь с оптимизацией `calculate_pypath`?
                </div>
                <div className="bg-py-green/20 p-3 rounded-lg rounded-tr-none self-end max-w-[90%] text-white">
                    Да, предложи лучший подход.
                </div>
            </div>
            <div className="p-3 border-t border-py-accent bg-py-dark">
                <div className="relative">
                    <input type="text" placeholder="Спросить ИИ..." className="w-full bg-py-accent border-none rounded-lg py-2 pl-3 pr-10 text-xs focus:ring-1 focus:ring-py-green text-white placeholder-py-muted"/>
                    <button className="absolute right-2 top-1.5 text-py-green hover:text-white transition-colors">
                        <Send size={14}/>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};