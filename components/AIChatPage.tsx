import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Cpu, Zap, Activity, Terminal, Clock, Hash, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { AI_CHAT_PAGE_DATA, APP_LANGUAGE, CURRENT_USER, UI_TEXTS, getIconComponent } from '../constants';
import { aiChat } from '../api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'log' | 'response' | 'error';
}

interface ChatSummary {
    id: string;
    title: string;
    updatedAt: string;
    lastMessage: string;
}

export const AIChatPage: React.FC = () => {
    const isKz = APP_LANGUAGE === 'kz';
    const locale = isKz ? 'kk-KZ' : 'ru-RU';
    const lt = {
        fallbackError: isKz ? 'Кешіріңіз, қате орын алды. Қайтадан көріңіз!' : 'Извини, произошла ошибка. Попробуй еще раз!',
        newChat: isKz ? 'Жаңа чат' : 'Новый чат',
        noChats: isKz ? 'Чаттар әлі жоқ. Бастау үшін + басыңыз.' : 'Чатов пока нет. Нажмите + чтобы начать.',
    };
  const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coreState, setCoreState] = useState<'idle' | 'processing' | 'active'>('idle');
    const abilities = AI_CHAT_PAGE_DATA?.abilities ?? [];
    const responses = AI_CHAT_PAGE_DATA?.responses ?? {};
        const text = UI_TEXTS?.aiChatPage ?? {};
  const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatHistoryLogs = chats.map((chat) => ({
        id: chat.id,
        code: chat.id === activeChatId ? 'ACTIVE' : 'CHAT',
        status: 'success' as const,
        msg: chat.title,
        time: new Date(chat.updatedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
        preview: chat.lastMessage,
    }));

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

    const formatMessage = (value: string) => {
        const escaped = escapeHtml(value);
        const withCode = escaped.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-cyan-500/20 rounded-lg p-3 my-2 overflow-x-auto text-xs"><code>$1</code></pre>');
        const withBold = withCode.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const withInlineCode = withBold.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-black/40 px-1 py-0.5 rounded text-indigo-600 dark:text-cyan-300">$1</code>');
        const withHeadings = withInlineCode.replace(/^###\s+(.*)$/gm, '<div class="font-bold text-indigo-700 dark:text-cyan-300 mt-2 mb-1">$1</div>');
        return { __html: withHeadings.replace(/\n/g, '<br/>') };
    };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
                        timestamp: new Date(item.timestamp),
                    })) as Message[];
                setMessages(mapped);
                setChats(history.chats || []);
                setActiveChatId(history.active_chat_id || (history.chats?.[0]?.id ?? null));
            } catch {
            }
        };

        loadHistory();
    }, []);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

        const currentChatId = activeChatId || `chat_${Date.now()}`;
        if (!activeChatId) {
            setActiveChatId(currentChatId);
        }

                const assistantMessageId = (Date.now() + 1).toString();

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
        setMessages(prev => [...prev, { id: assistantMessageId, text: '', sender: 'ai', timestamp: new Date() }]);
    setInputValue('');
    setIsTyping(true);
    setCoreState('processing');

    try {
            // Call real AI API with live streaming updates
                        let streamedText = '';
                        const response = await aiChat.sendMessageStream(
                                text,
                                CURRENT_USER.id,
                                currentChatId,
                                undefined,
                                undefined,
                                (chunk) => {
                                        streamedText += chunk;
                                        setMessages(prev => prev.map((msg) =>
                                                msg.id === assistantMessageId
                                                        ? { ...msg, text: streamedText, timestamp: new Date() }
                                                        : msg
                                        ));
                                }
                        );
      
      const newAiMsg: Message = {
                id: assistantMessageId,
        text: response.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
            setMessages(prev => prev.map((msg) => msg.id === assistantMessageId ? newAiMsg : msg));
      setIsTyping(false);
      setCoreState('active');
      setTimeout(() => setCoreState('idle'), 2000);

            try {
                const history = await aiChat.getHistory(CURRENT_USER.id);
                setChats(history.chats || []);
                setActiveChatId(history.active_chat_id || currentChatId);
            } catch {
            }
    } catch (error) {
      console.error('AI chat error:', error);
      // Fallback to mock response
      const fallbackMsg: Message = {
                id: assistantMessageId,
                text: responses.default || lt.fallbackError,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };
            setMessages(prev => prev.map((msg) => msg.id === assistantMessageId ? fallbackMsg : msg));
      setIsTyping(false);
      setCoreState('idle');
    }
  };

    const handleNewChat = () => {
        const newChatId = `chat_${Date.now()}`;
        const now = new Date().toISOString();
        const newChat: ChatSummary = {
            id: newChatId,
            title: lt.newChat,
            updatedAt: now,
            lastMessage: '',
        };
        setChats((prev) => [newChat, ...prev.filter((c) => c.id !== newChatId)]);
        setActiveChatId(newChatId);
        setMessages([]);
        setInputValue('');
    };

    const handleSelectChat = async (chatId: string) => {
        setActiveChatId(chatId);
        try {
            const history = await aiChat.getHistory(CURRENT_USER.id, chatId);
            setChats(history.chats || []);
            const mapped = (history.items || [])
                .filter((item) => (item?.sender === 'user' || item?.sender === 'ai') && String(item?.text || '').trim().length > 0)
                .map((item) => ({
                    id: item.id,
                    text: item.text,
                    sender: item.sender,
                    timestamp: new Date(item.timestamp),
                })) as Message[];
            setMessages(mapped);
        } catch {
            setMessages([]);
        }
    };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-[#0c120e] text-slate-900 dark:text-slate-100 font-mono overflow-hidden relative">
      
      {/* Background Grid & Effects */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.25)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(15,23,42,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.9)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-60 dark:opacity-50"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/60 to-slate-50 dark:via-[#0F172A]/50 dark:to-[#0F172A] pointer-events-none"></div>

      {/* --- LEFT SIDEBAR: NEURAL HISTORY --- */}
      <aside className="hidden md:flex w-72 bg-white/90 dark:bg-[#0F172A]/90 border-r border-slate-200 dark:border-cyan-900/30 flex-col backdrop-blur-md relative z-20">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-cyan-900/30 bg-slate-100/80 dark:bg-cyan-950/10">
              <div className="flex items-center min-w-0">
                  <Activity size={18} className="text-indigo-600 dark:text-cyan-400 mr-3 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 dark:text-cyan-100 tracking-[0.2em] truncate">{text.neuralHistory}</span>
              </div>
              <button
                onClick={handleNewChat}
                className="shrink-0 ml-2 p-2 rounded bg-indigo-100 dark:bg-cyan-900/20 hover:bg-indigo-200 dark:hover:bg-cyan-500/20 border border-indigo-300 dark:border-cyan-500/30 text-indigo-700 dark:text-cyan-300"
                                title={lt.newChat}
              >
                <Plus size={14} />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {chatHistoryLogs.map((log: any, index: number) => (
                  <button key={`${log?.id ?? log?.code ?? 'log'}-${index}`} onClick={() => handleSelectChat(log.id)} className={`w-full text-left group p-3 rounded bg-slate-50 dark:bg-[#0B1121] border transition-all cursor-pointer ${log.id === activeChatId ? 'border-indigo-500/60 dark:border-cyan-500/60' : 'border-slate-200 dark:border-cyan-900/20 hover:border-indigo-500/40 dark:hover:border-cyan-500/30'}`}>
                      <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              log.status === 'success' ? 'bg-green-500/10 text-green-400' :
                              log.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                              {log.code}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                              <Clock size={10} /> {log.time}
                          </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium group-hover:text-indigo-700 dark:group-hover:text-cyan-200 truncate">{log.msg}</p>
                      {log.preview ? <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-400 truncate mt-1">{log.preview}</p> : null}
                  </button>
              ))}
              {chatHistoryLogs.length === 0 ? (
                                <div className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">{lt.noChats}</div>
              ) : null}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-cyan-900/30 bg-slate-100/70 dark:bg-cyan-950/5">
              <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-indigo-100 dark:bg-cyan-900/20 flex items-center justify-center border border-indigo-300 dark:border-cyan-500/20">
                      <Hash size={16} className="text-indigo-600 dark:text-cyan-500"/>
                  </div>
                  <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{text.systemUptimeLabel}</div>
                      <div className="text-xs font-bold text-indigo-700 dark:text-cyan-300">{AI_CHAT_PAGE_DATA?.systemUptime || text.systemUptime}</div>
                  </div>
              </div>
          </div>
      </aside>

      {/* --- MAIN AREA: SYNCHRONIZATION CENTER --- */}
      <main className="flex-1 flex flex-col relative z-10">
          
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-cyan-900/30 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-sm z-30">
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-cyan-400">
                      <Cpu size={20} />
                      <h1 className="font-display font-black tracking-wider text-lg">{text.syncCenter}</h1>
                  </div>
                  <div className="h-4 w-px bg-slate-300 dark:bg-cyan-900/50"></div>
                  <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${coreState === 'processing' ? 'bg-yellow-400 animate-ping' : 'bg-green-500'}`}></span>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 dark:text-cyan-200 uppercase tracking-widest">
                          {coreState === 'processing' ? text.processing : text.ready}
                      </span>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] text-indigo-600 dark:text-cyan-600 font-mono">{AI_CHAT_PAGE_DATA?.version || text.version}</span>
              </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
              
              {/* --- 3D CORE ANIMATION (Background/Center) --- */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 pointer-events-none ${messages.length > 0 ? 'opacity-20 scale-75 -translate-y-20 blur-sm' : 'opacity-100'}`}>
                  <div className="relative size-96">
                      {/* Outer Rings */}
                      <div className={`absolute inset-0 border border-cyan-500/20 rounded-full border-dashed animate-[spin_20s_linear_infinite] ${coreState === 'processing' ? 'border-yellow-500/30 duration-[5s]' : ''}`}></div>
                      <div className={`absolute inset-8 border border-cyan-400/30 rounded-full animate-[spin_15s_linear_infinite_reverse] ${coreState === 'processing' ? 'border-yellow-400/40 duration-[3s]' : ''}`}></div>
                      <div className="absolute inset-20 border-2 border-cyan-300/10 rounded-full animate-pulse"></div>
                      
                      {/* Gyroscope Rings (3D Effect Simulation) */}
                      <div className={`absolute inset-10 border border-cyan-500/40 rounded-full animate-[spin_8s_linear_infinite]`} style={{ transform: 'rotateX(60deg)' }}></div>
                      <div className={`absolute inset-10 border border-purple-500/40 rounded-full animate-[spin_10s_linear_infinite_reverse]`} style={{ transform: 'rotateY(60deg)' }}></div>

                      {/* Central Core Orb */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`size-32 rounded-full bg-cyan-900/20 backdrop-blur-xl border border-cyan-400/50 flex items-center justify-center shadow-[0_0_60px_rgba(34,211,238,0.3)] transition-all duration-500 ${coreState === 'processing' ? 'shadow-[0_0_80px_rgba(250,204,21,0.5)] bg-yellow-900/20 border-yellow-400/50' : ''}`}>
                              <Bot size={48} className={`text-cyan-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] ${coreState === 'processing' ? 'animate-bounce text-yellow-100' : ''}`} />
                          </div>
                      </div>
                      
                      {/* Particles */}
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] animate-ping"></div>
                  </div>
              </div>

              {/* --- CHAT INTERFACE --- */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 flex flex-col">
                  
                  {/* Empty State Welcome */}
                  {messages.length === 0 && (
                      <div className="m-auto text-center max-w-md animate-fade-in relative mt-[400px] md:mt-[350px]">
                          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-cyan-950/50 text-indigo-700 dark:text-cyan-300 px-4 py-2 rounded-full border border-indigo-300 dark:border-cyan-500/30 mb-6 backdrop-blur-md shadow-lg">
                              <Sparkles size={16} />
                              <span className="text-xs font-bold uppercase tracking-wider">{text.mentorActivated}</span>
                          </div>
                          
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {abilities.map((ability: any, index: number) => {
                                  const AbilityIcon = getIconComponent(ability.icon);
                                  return (
                                      <button 
                                                                                key={`${ability?.id ?? ability?.label ?? 'ability'}-${index}`}
                                        onClick={() => handleSend(ability.prompt)}
                                                                                className="bg-white/90 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-cyan-900/50 p-4 rounded-xl hover:bg-indigo-50 dark:hover:bg-cyan-900/20 hover:border-indigo-300 dark:hover:border-cyan-500/50 transition-all group backdrop-blur-sm"
                                      >
                                          <AbilityIcon size={24} className={`${ability.color} mb-2 mx-auto`} />
                                                                                    <div className="text-[10px] font-bold text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-wider">{ability.label}</div>
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {/* Messages Stream */}
                  <div className="space-y-6 w-full max-w-3xl mx-auto pb-4">
                      {messages.map((msg, index: number) => (
                          <div key={`${msg?.id ?? msg?.timestamp?.toISOString?.() ?? 'msg'}-${msg?.sender ?? 'unknown'}-${index}`} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-500`}>
                              {/* Avatar */}
                              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-lg ${
                                  msg.sender === 'user' 
                                    ? 'bg-indigo-600 border-indigo-400/30' 
                                    : 'bg-slate-100 dark:bg-cyan-950 border-slate-300 dark:border-cyan-500/30'
                              }`}>
                                  {msg.sender === 'user' 
                                    ? <img src={CURRENT_USER.avatar} className="size-full rounded-xl" />
                                                                        : <Bot size={20} className="text-indigo-600 dark:text-cyan-400" />
                                  }
                              </div>

                              {/* Bubble */}
                              <div className={`
                                  max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-xl backdrop-blur-sm border
                                  ${msg.sender === 'user'
                                      ? 'bg-indigo-100 dark:bg-indigo-600/20 border-indigo-300 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-100 rounded-tr-none'
                                      : 'bg-white dark:bg-[#0F172A]/80 border-slate-200 dark:border-cyan-500/20 text-slate-800 dark:text-slate-200 dark:text-cyan-50 rounded-tl-none'
                                  }
                              `}>
                                  {msg.sender === 'ai' && <div className="text-[10px] font-bold text-indigo-600 dark:text-cyan-500 mb-2 uppercase tracking-widest flex items-center gap-2"><Terminal size={10}/> {text.responseOutput}</div>}
                                  {msg.sender === 'ai' ? (
                                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={formatMessage(msg.text)} />
                                  ) : (
                                      <div className="whitespace-pre-wrap">{msg.text}</div>
                                  )}
                              </div>
                          </div>
                      ))}
                      
                      {isTyping && (
                          <div className="flex gap-4">
                              <div className="size-10 rounded-xl bg-slate-100 dark:bg-cyan-950 border border-slate-300 dark:border-cyan-500/30 flex items-center justify-center shrink-0">
                                  <Activity size={20} className="text-cyan-400 animate-pulse" />
                              </div>
                              <div className="bg-white dark:bg-[#0F172A]/60 border border-slate-200 dark:border-cyan-500/20 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                                  <span className="size-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                  <span className="size-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                  <span className="size-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                              </div>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>
              </div>

              {/* --- INPUT DECK --- */}
              <div className="p-4 md:p-6 bg-slate-100/90 dark:bg-[#0F172A]/90 border-t border-slate-200 dark:border-cyan-900/30 backdrop-blur-md relative z-20">
                  <div className="max-w-3xl mx-auto relative group">
                      <div className="absolute inset-0 bg-indigo-500/5 dark:bg-cyan-500/5 rounded-2xl blur-sm group-focus-within:bg-indigo-500/10 dark:group-focus-within:bg-cyan-500/10 transition-colors"></div>
                      <div className="relative bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-cyan-900/50 rounded-2xl flex items-center p-2 shadow-inner group-focus-within:border-arcade-primary transition-colors">
                          <div className="pl-3 pr-2 text-indigo-600 dark:text-cyan-500">
                              <ChevronRight size={20} className="animate-pulse" />
                          </div>
                          <input 
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              placeholder={AI_CHAT_PAGE_DATA?.inputPlaceholder || text.inputPlaceholder} 
                              className="w-full bg-transparent border-none text-slate-900 dark:text-cyan-100 placeholder-slate-500 dark:placeholder-cyan-700/50 focus:ring-0 outline-none h-10 font-mono text-sm"
                          />
                          <button 
                              onClick={() => handleSend()}
                              disabled={!inputValue.trim()}
                              className="p-2 bg-indigo-100 dark:bg-cyan-900/30 text-indigo-600 dark:text-cyan-400 rounded-xl hover:bg-indigo-500 dark:hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-indigo-100 dark:disabled:hover:bg-cyan-900/30 disabled:hover:text-indigo-600 dark:disabled:hover:text-cyan-400"
                          >
                              <Send size={18} />
                          </button>
                      </div>
                  </div>
                  <div className="text-center mt-3">
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">{text.safeNotice}</p>
                  </div>
              </div>

          </div>
      </main>
    </div>
  );
};