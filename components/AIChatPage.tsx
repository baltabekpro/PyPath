import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Plus, MessageSquare, Trash2, Sparkles, Copy, Check, PanelLeftClose, PanelLeftOpen, Pin, Bug, BookOpen, Lightbulb, Code, Cpu, Terminal, Zap, Activity, Wifi, ShieldAlert, FileCode, Search, Database } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'log' | 'response' | 'error';
}

interface ChatSession {
  id: number;
  title: string;
  date: string;
  type: 'DEBUG' | 'QUERY' | 'SYSTEM';
  status: 'active' | 'archived';
}

const SYSTEM_LOGS: ChatSession[] = [
  { id: 1, title: 'DECORATOR_ANALYSIS', date: '14:20', type: 'QUERY', status: 'active' },
  { id: 2, title: 'DATAFRAME_ERR_FIX', date: 'Yesterday', type: 'DEBUG', status: 'archived' },
  { id: 3, title: 'ASYNC_IO_OPTIMIZE', date: '12 Mar', type: 'SYSTEM', status: 'archived' },
];

const ABILITIES = [
  { 
      id: 'debug', 
      icon: Bug, 
      label: 'DEBUG_PROTOCOL', 
      desc: 'Поиск аномалий и багов', 
      color: 'text-red-500', 
      border: 'border-red-500/30', 
      hoverBorder: 'group-hover:border-red-500', 
      bg: 'group-hover:bg-red-500/10',
      prompt: "Найди ошибку в следующем коде и предложи исправление:"
  },
  { 
      id: 'learn', 
      icon: Database, 
      label: 'KNOWLEDGE_BASE', 
      desc: 'Объяснение архитектуры', 
      color: 'text-purple-500', 
      border: 'border-purple-500/30', 
      hoverBorder: 'group-hover:border-purple-500', 
      bg: 'group-hover:bg-purple-500/10',
      prompt: "Объясни эту концепцию простыми словами с примерами:"
  },
  { 
      id: 'optimize', 
      icon: Zap, 
      label: 'OPTIMIZE_CORE', 
      desc: 'Ускорение алгоритмов', 
      color: 'text-green-500', 
      border: 'border-green-500/30', 
      hoverBorder: 'group-hover:border-green-500', 
      bg: 'group-hover:bg-green-500/10',
      prompt: "Оптимизируй этот код по скорости и памяти:"
  },
  { 
      id: 'test', 
      icon: ShieldAlert, 
      label: 'UNIT_TEST_GEN', 
      desc: 'Генерация тест-кейсов', 
      color: 'text-cyan-500', 
      border: 'border-cyan-500/30', 
      hoverBorder: 'group-hover:border-cyan-500', 
      bg: 'group-hover:bg-cyan-500/10',
      prompt: "Напиши unit-тесты для этой функции:"
  },
];

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: `SYSTEM_READY: Соединение установлено.\nОжидаю ввод данных, ${CURRENT_USER.name}...`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'log'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [syncLevel, setSyncLevel] = useState(67);
  const [coreState, setCoreState] = useState<'idle' | 'processing' | 'active'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string = inputValue) => {
    if (!text.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);
    setCoreState('processing');

    // Simulate AI response
    setTimeout(() => {
      let aiResponseText = "";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("ошибк") || lowerText.includes("bug")) {
        aiResponseText = "SCANNING_CODE_BLOCKS... \n\nОбнаружена логическая ошибка в строке 12. Индекс выходит за пределы массива. \n\nРЕКОМЕНДАЦИЯ:\nИспользуйте `len(arr) - 1` для итерации.";
      } else if (lowerText.includes("оптимизи")) {
        aiResponseText = "ANALYZING_COMPLEXITY... \n\nТекущая сложность O(n^2). \n\nOPTIMIZATION_RESULT:\nИспользование хэш-таблицы позволит снизить сложность до O(n).";
      } else {
        aiResponseText = "QUERY_RECEIVED. Обрабатываю запрос через нейросеть уровня 4...\n\nВот решение вашей задачи с примерами кода.";
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
      setCoreState('active');
      setSyncLevel(prev => Math.min(prev + 2, 100)); // Increase sync
      
      setTimeout(() => setCoreState('idle'), 3000);
    }, 2000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
      setMessages([messages[0]]);
      setIsTyping(false);
      setCoreState('idle');
  };

  return (
    <div className="flex h-full bg-[#050a07] font-mono overflow-hidden relative">
      
      {/* Background Matrix/Grid Effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>
      
      {/* Sidebar: System Logs */}
      <div className={`${isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 border-r border-white/10 flex flex-col bg-[#080c0a] relative z-20`}>
        
        {/* Sync Status Header */}
        <div className="p-6 border-b border-white/10 bg-[#0a110d]">
           <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural Sync</span>
               <span className={`text-xs font-bold ${syncLevel === 100 ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`}>{syncLevel}%</span>
           </div>
           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${syncLevel === 100 ? 'bg-gradient-to-r from-cyan-400 to-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]'}`} 
                  style={{ width: `${syncLevel}%` }}
               ></div>
           </div>
        </div>
        
        {/* Log List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
           <div className="flex items-center justify-between px-3 mb-2">
               <span className="text-[10px] font-bold text-gray-600 uppercase">System Logs</span>
               <button onClick={handleNewSession} className="text-[10px] text-cyan-500 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                   <Plus size={10} /> New
               </button>
           </div>
           
           <div className="space-y-1">
            {SYSTEM_LOGS.map((log) => (
              <div key={log.id} className="group flex items-center gap-3 px-3 py-3 rounded border border-transparent hover:border-cyan-500/20 hover:bg-cyan-500/5 cursor-pointer transition-all">
                <div className={`size-1.5 rounded-full ${log.status === 'active' ? 'bg-cyan-500 animate-pulse' : 'bg-gray-700'}`}></div>
                <div className="flex-1 overflow-hidden">
                   <p className="text-xs font-bold text-gray-300 font-mono truncate group-hover:text-cyan-300">[{log.type}] {log.title}</p>
                   <p className="text-[9px] text-gray-600 font-mono mt-0.5">{log.date} • ID: #{log.id}04X</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 text-[10px] text-gray-600 font-mono flex justify-between">
           <span>CPU: 12%</span>
           <span>RAM: 4.2GB</span>
           <span className="text-cyan-800">CONNECTED</span>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col relative z-10">
         
         {/* Top Bar */}
         <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#050a07]/90 backdrop-blur-sm sticky top-0 z-30">
             <div className="flex items-center gap-4">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-white transition-colors">
                     {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                 </button>
                 <div className="h-4 w-px bg-white/10"></div>
                 <div className="flex items-center gap-2">
                     <Terminal size={14} className="text-cyan-500" />
                     <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Oracle_Terminal_v2.4</span>
                 </div>
             </div>
             <div className="flex items-center gap-3">
                 <div className={`size-2 rounded-full ${coreState === 'idle' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">{coreState === 'idle' ? 'STANDBY' : 'PROCESSING'}</span>
             </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar flex flex-col relative">
            
            {messages.length === 1 ? (
                // EMPTY STATE: THE CORE & ABILITIES
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in py-10">
                    
                    {/* THE CORE ANIMATION */}
                    <div className="relative size-48 md:size-64 mb-16 flex items-center justify-center">
                         {/* Outer Glow */}
                         <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full animate-pulse"></div>
                         
                         {/* Rotating Rings */}
                         <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute inset-4 border border-cyan-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed"></div>
                         <div className="absolute inset-10 border border-blue-500/20 rounded-full animate-[spin_5s_linear_infinite]"></div>

                         {/* The Eye */}
                         <div className="relative z-10 size-24 md:size-32 bg-black rounded-full border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex items-center justify-center overflow-hidden">
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                              <Cpu size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse-glow" />
                         </div>

                         {/* Floating Widgets */}
                         <div className="absolute -right-16 top-0 bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-sm text-[10px] text-cyan-400 font-mono animate-float">
                             BUGS_FIXED: 42
                         </div>
                         <div className="absolute -left-16 bottom-10 bg-black/60 border border-cyan-500/30 p-2 rounded backdrop-blur-sm text-[10px] text-cyan-400 font-mono animate-float" style={{animationDelay: '1.5s'}}>
                             SYS_LOAD: 12%
                         </div>
                    </div>

                    {/* HOLOGRAPHIC CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl px-4">
                        {ABILITIES.map((ability) => (
                            <button 
                                key={ability.id}
                                onClick={() => handleSend(ability.prompt)}
                                className={`
                                    group relative h-40 bg-[#0a0f0b] border border-white/5 rounded-xl p-5 text-left transition-all duration-300
                                    hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${ability.hoverBorder}
                                `}
                            >
                                {/* Hover Gradient bg */}
                                <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${ability.bg}`}></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className={`p-2 rounded-lg bg-black/50 w-fit ${ability.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                                        <ability.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold font-mono text-sm mb-1 text-gray-300 group-hover:text-white transition-colors tracking-wide`}>
                                            {ability.label}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 group-hover:text-gray-400">
                                            {ability.desc}
                                        </p>
                                    </div>
                                </div>
                                {/* Tech decoration corners */}
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className={`size-1.5 rounded-full ${ability.color.replace('text-', 'bg-')}`}></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // CHAT INTERFACE
                <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-4">
                     {messages.map((msg, idx) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className="size-8 rounded bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                    <Bot size={16} />
                                </div>
                            )}
                            
                            <div className={`
                                relative px-5 py-4 text-sm font-mono leading-relaxed max-w-[85%] border
                                ${msg.sender === 'user' 
                                    ? 'bg-cyan-900/10 border-cyan-500/30 text-cyan-100 rounded-2xl rounded-tr-none shadow-[0_0_20px_rgba(6,182,212,0.05)]' 
                                    : 'bg-[#0a0f0b] border-white/10 text-gray-300 rounded-2xl rounded-tl-none shadow-lg'
                                }
                            `}>
                                {/* Header for System Logs */}
                                {msg.type === 'log' && <div className="text-[10px] text-cyan-600 font-bold mb-2 uppercase tracking-widest border-b border-cyan-900/30 pb-1">System Log Entry</div>}

                                {msg.text.split('```').map((part, index) => {
                                    if (index % 2 === 1) {
                                        return (
                                            <div key={index} className="my-3 bg-black/50 border-l-2 border-cyan-500 pl-4 py-2 font-mono text-xs text-cyan-300 overflow-x-auto">
                                                {part}
                                            </div>
                                        );
                                    }
                                    return <span key={index} className="whitespace-pre-wrap">{part}</span>;
                                })}
                            </div>

                            {msg.sender === 'user' && (
                                <img src={CURRENT_USER.avatar} alt="Me" className="size-8 rounded bg-black border border-gray-700 mt-1" />
                            )}
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4 max-w-4xl w-full">
                            <div className="size-8 rounded bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
                                <Activity size={16} />
                            </div>
                            <div className="flex items-center gap-1 text-cyan-500/50 font-mono text-xs h-8">
                                <span>PROCESSING_DATA</span>
                                <span className="animate-bounce">.</span>
                                <span className="animate-bounce delay-100">.</span>
                                <span className="animate-bounce delay-200">.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
         </div>

         {/* TERMINAL INPUT AREA */}
         <div className="p-0 bg-[#050a07] border-t border-white/10 relative z-30">
             
             {/* Input Wrapper */}
             <div className="max-w-4xl mx-auto w-full p-4">
                 <div className="relative group bg-[#080c0a] border border-white/10 rounded-xl overflow-hidden flex items-start transition-all focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    
                    {/* Terminal Prompt Symbol */}
                    <div className="pl-4 pt-4 pr-2 text-cyan-500 font-mono font-bold select-none animate-pulse">
                        {'>_'}
                    </div>

                    <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="ENTER_COMMAND_OR_QUERY..." 
                        className="w-full bg-transparent border-none py-4 pr-14 text-cyan-100 placeholder-cyan-900/50 outline-none font-mono text-sm resize-none min-h-[56px]"
                        rows={1}
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                        }}
                    />

                    <button 
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 bottom-2 p-2 text-cyan-600 hover:text-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                 </div>
             </div>

             {/* SYSTEM STATUS FOOTER */}
             <div className="h-8 bg-[#030504] border-t border-white/5 flex items-center px-6 justify-between text-[10px] font-mono text-gray-600 uppercase tracking-wider">
                 <div className="flex gap-6">
                     <span className="flex items-center gap-1.5 text-green-500/80">
                         <Wifi size={10} /> SYSTEM_ONLINE
                     </span>
                     <span>LATENCY: 14ms</span>
                     <span>CORE_TEMP: 42°C</span>
                 </div>
                 <div className="flex gap-6">
                     <span>ENCRYPTION: AES-256</span>
                     <span className="text-cyan-800">ORACLE_OS V.4.2</span>
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};