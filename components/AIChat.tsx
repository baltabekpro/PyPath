import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Zap, Bot, ChevronRight, AlertCircle } from 'lucide-react';
import { AI_CHAT_DATA, CURRENT_USER, UI_TEXTS, getIconComponent } from '../constants';
import { aiChat } from '../api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'hint' | 'error';
}

interface AIChatProps {
    embedded?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ embedded = false }) => {
    const [isOpen, setIsOpen] = useState(embedded);
  const [oracleState, setOracleState] = useState<'idle' | 'analyzing' | 'alert'>('idle');
  const [energy, setEnergy] = useState(5);
  const [inputValue, setInputValue] = useState('');
    const quickActions = AI_CHAT_DATA?.quickActions ?? [];
    const responses = AI_CHAT_DATA?.responses ?? {};
        const text = UI_TEXTS?.aiChat ?? {};
        const initialMessage = (AI_CHAT_DATA?.welcomeMessage || '').replace('{name}', CURRENT_USER.name);
  const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: initialMessage, sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    const formatMessage = (value: string) => {
        const escaped = escapeHtml(value);
        const withCode = escaped.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg p-2 my-2 overflow-x-auto text-xs"><code>$1</code></pre>');
        const withBold = withCode.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const withInlineCode = withBold.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-black/30 px-1 py-0.5 rounded text-indigo-700 dark:text-cyan-300">$1</code>');
        return { __html: withInlineCode.replace(/\n/g, '<br/>') };
    };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

    useEffect(() => {
        if (embedded && !isOpen) {
            setIsOpen(true);
        }
    }, [embedded, isOpen]);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await aiChat.getHistory(CURRENT_USER.id);
                const mapped = (history.items || [])
                    .filter((item) => (item?.sender === 'user' || item?.sender === 'ai') && String(item?.text || '').trim().length > 0)
                    .map((item) => ({
                        id: item.id,
                        text: item.text,
                        sender: item.sender,
                        type: 'text' as const,
                    }));
                if (mapped.length > 0) {
                    setMessages(mapped);
                }
            } catch {
            }
        };

        loadHistory();
    }, []);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setOracleState('analyzing');
    setIsTyping(true);

    try {
      // Call real AI API
      const response = await aiChat.sendMessage(text, CURRENT_USER.id);
      
      // Determine message type based on keywords
      let msgType: 'text' | 'hint' | 'error' = 'text';
      const lower = text.toLowerCase();
      
      if (lower.includes('ошибк') || lower.includes('не так') || lower.includes('bug')) {
        msgType = 'error';
        setOracleState('alert');
        setTimeout(() => setOracleState('idle'), 5000);
      } else if (lower.includes('подсказк') || lower.includes('hint')) {
        msgType = 'hint';
        if (energy > 0) {
          setEnergy(e => e - 1);
        }
      }

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response.response, 
        sender: 'ai', 
        type: msgType 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      if (msgType === 'text') {
        setOracleState('idle');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      // Fallback to mock response on error
      const fallbackMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: responses.default || 'Извини, произошла ошибка. Попробуй еще раз!', 
        sender: 'ai',
        type: 'error'
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setIsTyping(false);
      setOracleState('idle');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSend();
  };

  return (
    <>
        {/* Floating Orb Trigger */}
        {!embedded && (
        <div className={`fixed bottom-8 right-8 z-50 flex flex-col items-center gap-4 transition-all duration-500 ${isOpen ? 'translate-y-[20px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
            <button 
                onClick={() => setIsOpen(true)}
                className="relative group cursor-pointer"
            >
                {/* Core Orb */}
                <div className={`size-16 rounded-full bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-float overflow-hidden backdrop-blur-md`}>
                    <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-900/80 to-blue-600/20 transition-all duration-1000 ${oracleState === 'alert' ? 'from-orange-900/80 to-red-600/20' : ''}`}></div>
                    
                    {/* Inner Core */}
                    <div className={`size-8 rounded-full bg-cyan-400 blur-md opacity-60 animate-pulse-glow ${oracleState === 'alert' ? 'bg-orange-500' : ''}`}></div>
                    
                    {/* Mascott Icon */}
                    <Bot size={28} className={`relative z-20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors duration-300 ${oracleState === 'alert' ? 'text-orange-900 dark:text-orange-100' : ''}`} />
                </div>

                {/* Rotating Rings (Analyzing State) */}
                <div className={`absolute top-0 left-0 size-full rounded-full border border-cyan-400/30 -z-10 scale-125 transition-all duration-700 ${oracleState === 'analyzing' ? 'animate-[spin_2s_linear_infinite] opacity-100 border-dashed' : 'opacity-0'}`}></div>
                <div className={`absolute top-0 left-0 size-full rounded-full border border-blue-500/30 -z-10 scale-150 transition-all duration-700 ${oracleState === 'analyzing' ? 'animate-[spin_3s_linear_infinite_reverse] opacity-100 border-dotted' : 'opacity-0'}`}></div>

                {/* Idle Glow Ring */}
                <div className={`absolute top-0 left-0 size-full rounded-full border border-cyan-500/20 -z-10 scale-110 animate-ping opacity-20 ${oracleState !== 'analyzing' ? 'block' : 'hidden'}`}></div>
            </button>
            <div className="bg-black/60 backdrop-blur text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                {AI_CHAT_DATA?.oracleBadge || text.oracleBadge}
            </div>
        </div>
        )}

        {/* Chat Overlay */}
        {(isOpen || embedded) && (
            <div className={embedded ? 'w-full h-full flex flex-col' : 'fixed bottom-8 right-8 z-[60] w-[380px] h-[600px] flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right'}>
                
                {/* Glassmorphism Container */}
                <div className="relative flex-1 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 backdrop-blur-xl border border-slate-200 dark:border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
                    
                    {/* Header */}
                    <div className="h-16 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`size-10 rounded-full bg-white dark:bg-slate-800 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] ${oracleState === 'analyzing' ? 'animate-pulse' : ''}`}>
                                <Bot size={20} className="text-indigo-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 dark:text-white font-display font-black tracking-wide text-sm">{text.title}</h3>
                                <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                                    <span className="size-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                                    {AI_CHAT_DATA?.statusLabel || text.statusLabel}
                                </p>
                            </div>
                        </div>
                        
                        {/* Energy Bar */}
                        <div className={`flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5 ${embedded ? 'mr-10' : ''}`}>
                            <Zap size={12} className={energy > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-600 dark:text-gray-400"} />
                            <span className="text-xs font-mono font-bold text-yellow-100">{energy}/5</span>
                        </div>

                        {!embedded && (
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-2 -right-2 p-4 text-slate-600 dark:text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-slate-100 dark:to-black/20">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                {msg.sender === 'ai' && (
                                    <div className="size-8 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mr-3 mt-1 shadow-lg">
                                        {msg.type === 'error' ? <AlertCircle size={16} className="text-orange-500" /> : <Bot size={16} />}
                                    </div>
                                )}
                                <div className={`
                                    max-w-[80%] rounded-2xl p-3 text-sm font-medium leading-relaxed shadow-lg
                                    ${msg.sender === 'user' 
                                        ? 'bg-cyan-600 text-white rounded-tr-none' 
                                        : msg.type === 'error'
                                            ? 'bg-orange-100 dark:bg-orange-900/20 border border-orange-500/30 text-orange-900 dark:text-orange-100 rounded-tl-none'
                                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-100 rounded-tl-none'
                                    }
                                `}>
                                    {msg.sender === 'ai' ? (
                                        <div dangerouslySetInnerHTML={formatMessage(msg.text)} />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start items-center gap-3">
                                <div className="size-8 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                                    <span className="size-1.5 bg-cyan-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="size-1.5 bg-cyan-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="size-1.5 bg-cyan-500/50 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/10 backdrop-blur-md">
                        {/* Quick Actions */}
                        <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar-none mb-2">
                            {quickActions.map((action: any, i: number) => {
                                const ActionIcon = getIconComponent(action.icon);
                                return (
                                    <button 
                                        key={action.label} 
                                        onClick={() => handleSend(action.prompt)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-cyan-900/30 border border-indigo-300 dark:border-cyan-500/20 hover:border-indigo-500 dark:hover:border-cyan-500/50 rounded-lg text-xs text-indigo-700 dark:text-cyan-300 font-bold transition-all flex items-center gap-1.5 group active:scale-95"
                                    >
                                        <ActionIcon size={12} className="group-hover:text-cyan-400" />
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Input Field */}
                        <div className="relative group">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress} 
                                placeholder={AI_CHAT_DATA?.inputPlaceholder || text.inputPlaceholder} 
                                className="w-full bg-transparent border-b border-slate-300 dark:border-white/10 py-3 pl-2 pr-10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-arcade-primary outline-none transition-colors font-mono text-sm"
                            />
                            <div className="absolute bottom-0 left-0 h-[1px] bg-cyan-500 w-0 group-focus-within:w-full transition-all duration-500"></div>
                            <button 
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim()}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-cyan-600 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-cyan-600 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements behind chat */}
                <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full -z-10 pointer-events-none"></div>
            </div>
        )}
    </>
  );
};