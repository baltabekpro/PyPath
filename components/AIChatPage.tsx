import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Plus, MessageSquare, Trash2, Sparkles, Copy, Check, PanelLeftClose, PanelLeftOpen, Pin, Bug, BookOpen, Lightbulb, Code, Cpu } from 'lucide-react';
import { CURRENT_USER } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSession {
  id: number;
  title: string;
  date: string;
  pinned?: boolean;
}

const MOCK_HISTORY: ChatSession[] = [
  { id: 1, title: 'Объяснение декораторов', date: 'Сегодня', pinned: true },
  { id: 2, title: 'Ошибки в pandas DataFrame', date: 'Вчера' },
  { id: 3, title: 'Генераторы vs Итераторы', date: '12 Марта' },
];

const SUGGESTIONS = [
  { icon: Bug, text: "Найти ошибку", desc: "Вставьте фрагмент кода для отладки" },
  { icon: BookOpen, text: "Объяснить тему", desc: "Asyncio, декораторы или ООП" },
  { icon: Code, text: "Написать тест", desc: "Сгенерировать юнит-тесты для функции" },
  { icon: Lightbulb, text: "Оптимизация", desc: "Улучшить производительность кода" },
];

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: `Привет, ${CURRENT_USER.name}! Я твой персональный AI-ментор.`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    // Simulate AI response
    setTimeout(() => {
      let aiResponseText = "Я понимаю ваш запрос. Дайте мне секунду, чтобы сформировать ответ...";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("цикл")) {
        aiResponseText = "В Python есть два основных типа циклов: `for` и `while`. \n\nЦикл `for` обычно используется для перебора последовательностей (списков, кортежей, строк):\n```python\nfruits = ['apple', 'banana', 'cherry']\nfor fruit in fruits:\n    print(fruit)\n```";
      } else if (lowerText.includes("функц")) {
        aiResponseText = "Функции в Python определяются с помощью ключевого слова `def`. Вот простой пример:\n\n```python\ndef greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('Alex'))\n```\n\nФункции помогают сделать код модульным и переиспользуемым.";
      } else {
        aiResponseText = "Это интересный вопрос по Python! Для решения этой задачи лучше всего использовать встроенные библиотеки, чтобы не изобретать велосипед. \n\nМогу я показать конкретный пример кода?";
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500);
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

  const handleNewChat = () => {
      setMessages([messages[0]]);
      setIsTyping(false);
  };

  return (
    <div className="flex h-full bg-py-dark">
      {/* Sidebar History - Slimmer (w-64) and cleaner */}
      <div className={`${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300 border-r border-py-accent flex flex-col bg-[#0c140e]`}>
        
        {/* Compact Header for Sidebar with Icon Button */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">История</span>
           <button 
             onClick={handleNewChat}
             className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
             title="Новый чат"
           >
             <Plus size={18} />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
          <div className="space-y-1">
            {MOCK_HISTORY.map((chat) => (
              <div key={chat.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors relative">
                <MessageSquare size={16} className={chat.pinned ? 'text-py-green' : 'text-gray-500'} />
                <div className="flex-1 overflow-hidden">
                   <p className="text-sm truncate font-medium">{chat.title}</p>
                   <p className="text-[10px] text-gray-500/80">{chat.date}</p>
                </div>
                {/* Hover Actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0c140e] pl-2 shadow-[-10px_0_10px_#0c140e]">
                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-py-green transition-colors" title="Закрепить">
                        <Pin size={12} fill={chat.pinned ? "currentColor" : "none"}/>
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors" title="Удалить">
                        <Trash2 size={12} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Badge - Compact */}
        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-py-green/5 to-transparent">
           <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
               <div className="size-6 rounded bg-gradient-to-br from-py-green to-blue-500 flex items-center justify-center text-black">
                   <Sparkles size={14} fill="currentColor"/>
               </div>
               <div>
                   <p className="text-xs font-bold text-white leading-none">PyPath Pro</p>
                   <p className="text-[9px] text-gray-400">Управление подпиской</p>
               </div>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-py-dark">
         {/* Header */}
         <div className="h-16 border-b border-py-accent flex items-center px-6 justify-between bg-py-dark/90 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                </button>
                <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                    <div>
                        <h2 className="font-bold text-white leading-none text-lg">Новый диалог</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Cpu size={12} className="text-py-green" />
                            <span className="text-xs text-py-muted font-mono">Model: GPT-4 Turbo</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar flex flex-col">
            {messages.length === 1 ? (
                // Welcome / Empty State View - Scaled Up
                <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full animate-fade-in pb-10">
                    <div className="size-24 bg-py-surface/50 rounded-3xl flex items-center justify-center text-py-green mb-8 shadow-[0_0_50px_rgba(13,242,89,0.1)] border border-py-accent relative">
                        <div className="absolute inset-0 bg-py-green/20 blur-xl rounded-full"></div>
                        <Sparkles size={48} className="relative z-10"/>
                    </div>
                    
                    <h2 className="text-5xl font-bold text-white mb-4 text-center tracking-tight">Чем могу помочь?</h2>
                    <p className="text-py-muted text-center mb-12 max-w-lg text-lg">
                        Я могу объяснить сложный код, найти баги, написать тесты или просто обсудить архитектуру.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                        {SUGGESTIONS.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSend(s.text)}
                                className="flex items-center gap-4 p-5 bg-py-surface border border-py-accent hover:border-py-green hover:shadow-[0_0_15px_rgba(13,242,89,0.1)] hover:bg-[#1a2e21] rounded-2xl transition-all group text-left"
                            >
                                <div className="p-3 bg-py-dark rounded-xl text-py-green group-hover:scale-110 transition-transform border border-white/5">
                                    <s.icon size={24} />
                                </div>
                                <div>
                                    <span className="text-base font-bold text-white block mb-0.5 group-hover:text-py-green transition-colors">{s.text}</span>
                                    <span className="text-sm text-py-muted group-hover:text-gray-300">{s.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // Message List
                <>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start max-w-4xl mx-auto w-full'}`}>
                            {msg.sender === 'ai' && (
                                <div className="size-8 rounded-full bg-py-green flex items-center justify-center text-py-dark shrink-0 mt-1 shadow-[0_0_10px_rgba(13,242,89,0.2)]">
                                    <Bot size={16} />
                                </div>
                            )}
                            
                            <div className={`group relative px-6 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.sender === 'user' 
                                ? 'bg-py-surface border border-py-accent text-white rounded-tr-sm max-w-[80%]' 
                                : 'text-gray-200'
                            }`}>
                                {msg.text.split('```').map((part, index) => {
                                    if (index % 2 === 1) {
                                        // Code block
                                        return (
                                            <div key={index} className="my-3 bg-[#0a0f0b] border border-white/10 rounded-lg p-3 font-mono text-xs text-py-green overflow-x-auto">
                                                {part}
                                            </div>
                                        );
                                    }
                                    return <span key={index}>{part}</span>;
                                })}

                                {msg.sender === 'ai' && (
                                <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                        onClick={() => handleCopy(msg.text, msg.id)}
                                        className="text-gray-400 hover:text-white flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
                                    >
                                        {copiedId === msg.id ? <Check size={12} className="text-py-green" /> : <Copy size={12} />}
                                        {copiedId === msg.id ? 'Скопировано' : 'Копировать'}
                                    </button>
                                </div>
                                )}
                            </div>

                            {msg.sender === 'user' && (
                                <img src={CURRENT_USER.avatar} alt="Me" className="size-8 rounded-full border border-py-accent mt-1" />
                            )}
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4 max-w-4xl mx-auto w-full">
                            <div className="size-8 rounded-full bg-py-green flex items-center justify-center text-py-dark shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="flex items-center gap-1.5 h-10 px-4">
                                <span className="size-2 bg-py-muted/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="size-2 bg-py-muted/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="size-2 bg-py-muted/50 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </>
            )}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="p-6 bg-gradient-to-t from-py-dark to-py-dark/50">
            <div className="max-w-4xl mx-auto relative group">
                <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Задайте вопрос по Python или вставьте код..." 
                    className="w-full bg-[#111813] border border-py-accent rounded-2xl py-4 pl-5 pr-14 text-white placeholder-gray-500 focus:ring-2 focus:ring-py-green/50 focus:border-py-green outline-none transition-all resize-none shadow-xl min-h-[80px] max-h-[300px]"
                    rows={1}
                    style={{ height: 'auto', minHeight: '80px' }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim()}
                    className="absolute right-3 bottom-3 p-2.5 bg-py-green text-py-dark rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:bg-py-accent disabled:text-gray-500 transition-all shadow-lg"
                >
                    <Send size={18} fill={inputValue.trim() ? "currentColor" : "none"} />
                </button>
            </div>
            <p className="text-center text-xs text-py-muted/60 mt-3">
                AI может допускать ошибки. Пожалуйста, проверяйте важный код перед использованием в продакшене.
            </p>
         </div>
      </div>
    </div>
  );
};