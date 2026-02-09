import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Plus, Bug, Zap, ShieldAlert, Database, Cpu, Activity, PanelLeftClose, PanelLeftOpen, Terminal } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'log' | 'response' | 'error';
}

const ABILITIES = [
  { id: 'debug', icon: Bug, label: 'DEBUG_PROTOCOL', desc: 'Поиск багов', color: 'text-red-500', bg: 'group-hover:bg-red-500/10', border: 'border-red-500/30', hoverBorder: 'group-hover:border-red-500', prompt: "Найди ошибку в коде:" },
  { id: 'learn', icon: Database, label: 'KNOWLEDGE_BASE', desc: 'Теория', color: 'text-purple-500', bg: 'group-hover:bg-purple-500/10', border: 'border-purple-500/30', hoverBorder: 'group-hover:border-purple-500', prompt: "Объясни тему:" },
  { id: 'optimize', icon: Zap, label: 'OPTIMIZE_CORE', desc: 'Ускорение', color: 'text-green-500', bg: 'group-hover:bg-green-500/10', border: 'border-green-500/30', hoverBorder: 'group-hover:border-green-500', prompt: "Как оптимизировать:" },
  { id: 'test', icon: ShieldAlert, label: 'UNIT_TEST_GEN', desc: 'Тесты', color: 'text-cyan-500', bg: 'group-hover:bg-cyan-500/10', border: 'border-cyan-500/30', hoverBorder: 'group-hover:border-cyan-500', prompt: "Напиши тест:" },
];

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: `SYNC_CENTER: Соединение установлено.\nПривет, ${CURRENT_USER.name}. Я вижу, ты остановился на Главе 3: "Циклы Хаоса". Нужна помощь с циклом 'while'?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'log'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [coreState, setCoreState] = useState<'idle' | 'processing' | 'active'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (window.innerWidth < 768) setIsSidebarOpen(false);
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

    setTimeout(() => {
      let aiResponseText = "ANALYZING_QUERY... \n\n";
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("цикл") || lowerText.includes("while")) {
          aiResponseText += "Цикл `while` выполняется, пока условие истинно. \n\nПример:\n```python\nenergy = 0\nwhile energy < 100:\n    print('Charging...')\n    energy += 10\n```\nБудь осторожен с бесконечными циклами!";
      } else {
          aiResponseText += "Запрос принят. Обрабатываю данные через нейросеть...";
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
      setTimeout(() => setCoreState('idle'), 3000);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-[#050a07] font-mono overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>
      
      {/* Sidebar: Logs (Hidden on Mobile) */}
      <div className={`${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 border-r border-white/10 flex flex-col bg-[#080c0a] relative z-20 hidden md:flex`}>
        <div className="p-4 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-widest">
            Neural History
        </div>
        <div className="flex-1 p-2 space-y-1">
            <div className="p-2 bg-white/5 rounded text-xs text-cyan-400 font-bold border-l-2 border-cyan-400">Current Session</div>
            <div className="p-2 text-xs text-gray-500 hover:text-white cursor-pointer">Log: Loop_Error_Fix</div>
            <div className="p-2 text-xs text-gray-500 hover:text-white cursor-pointer">Log: Variable_Init</div>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col relative z-10">
         
         {/* Top Bar */}
         <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-[#050a07]/90 backdrop-blur-sm sticky top-0 z-30">
             <div className="flex items-center gap-4">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-white transition-colors hidden md:block">
                     {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                 </button>
                 <div className="flex items-center gap-2">
                     <Terminal size={14} className="text-cyan-500" />
                     <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Центр Синхронизации</span>
                 </div>
             </div>
             <div className="flex items-center gap-3">
                 <div className={`size-2 rounded-full ${coreState === 'idle' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">{coreState === 'idle' ? 'ONLINE' : 'THINKING'}</span>
             </div>
         </div>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col relative pb-20 md:pb-4">
            {messages.length === 1 && (
                 <div className="mb-8 p-4">
                     <div className="flex items-center justify-center mb-8">
                         <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                            <Cpu size={64} className="text-cyan-400 relative z-10 animate-float" />
                         </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                        {ABILITIES.map((ability) => (
                            <button 
                                key={ability.id}
                                onClick={() => handleSend(ability.prompt)}
                                className={`bg-[#0a0f0b] border border-white/5 rounded-xl p-3 text-left hover:bg-white/5 transition-all group hover:scale-[1.02] ${ability.hoverBorder}`}
                            >
                                <ability.icon size={20} className={`${ability.color} mb-2`} />
                                <div className="text-xs font-bold text-gray-300 group-hover:text-white">{ability.label}</div>
                                <div className="text-[10px] text-gray-600">{ability.desc}</div>
                            </button>
                        ))}
                     </div>
                 </div>
            )}

            <div className="space-y-6 max-w-3xl mx-auto w-full">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className="size-8 rounded bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                                <Bot size={16} />
                            </div>
                        )}
                        <div className={`px-4 py-3 text-sm font-mono max-w-[85%] border ${
                            msg.sender === 'user' 
                                ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-100 rounded-2xl rounded-tr-none' 
                                : 'bg-[#0a0f0b] border-white/10 text-gray-300 rounded-2xl rounded-tl-none'
                        }`}>
                            {msg.type === 'log' && <div className="text-[10px] text-cyan-600 font-bold mb-1 uppercase tracking-widest">System Message</div>}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                         <div className="size-8 rounded bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <Activity size={16} className="animate-pulse"/>
                        </div>
                        <div className="text-xs text-gray-500 font-mono py-2">печатает...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
         </div>

         {/* Input */}
         <div className="p-4 bg-[#050a07] border-t border-white/10 relative z-30 mb-16 md:mb-0">
             <div className="max-w-3xl mx-auto relative group bg-[#080c0a] border border-white/10 rounded-xl overflow-hidden flex items-center">
                <div className="pl-4 pr-2 text-cyan-500 font-mono font-bold select-none">{'>_'}</div>
                <input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Введите команду..." 
                    className="w-full bg-transparent border-none py-3 pr-12 text-cyan-100 placeholder-cyan-900/50 outline-none font-mono text-sm"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 p-2 text-cyan-600 hover:text-cyan-400 disabled:opacity-20 transition-colors"
                >
                    <Send size={16} />
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};