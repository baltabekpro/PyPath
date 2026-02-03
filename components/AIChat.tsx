import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, MessageSquare, Bot, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Привет! Я твой AI-ментор. Вижу, ты работаешь с pandas. Могу помочь с оптимизацией кода или объяснить сложные концепции.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
        scrollToBottom();
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing and response
    setTimeout(() => {
      let aiResponseText = "Интересный вопрос. Давай разберем подробнее.";
      
      // Simple keyword matching for demo
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("ошибк") || lowerText.includes("баг") || lowerText.includes("error")) {
          aiResponseText = "Похоже на проблему с типами данных. Попробуй проверить df.dtypes перед операцией.";
      } else if (lowerText.includes("код") || lowerText.includes("пример")) {
          aiResponseText = "Конечно! Вот пример использования apply для этой задачи:\n\ndf['new_col'] = df['col'].apply(lambda x: x*2)";
      } else if (lowerText.includes("спасибо")) {
          aiResponseText = "Всегда пожалуйста! Обращайся, если застрянешь.";
      } else if (lowerText.includes("оптимиз")) {
          aiResponseText = "Для оптимизации лучше использовать векторизированные операции numpy вместо циклов.";
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // Floating Trigger Button - Positioned higher (bottom-20) to avoid covering terminal
  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-8 z-50 size-14 bg-py-green text-py-dark rounded-full shadow-[0_0_20px_rgba(13,242,89,0.3)] flex items-center justify-center hover:scale-110 transition-transform animate-bounce-in group ring-2 ring-white/10"
          >
              <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full animate-pulse"></div>
              <Sparkles size={24} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform"/>
          </button>
      );
  }

  return (
    <div className={`fixed bottom-20 right-8 z-50 bg-py-dark/95 backdrop-blur-xl border border-py-green/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/10 ${isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[500px]'}`}>
      
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-py-green/20 to-py-dark p-3 border-b border-white/10 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-py-green/20 p-1.5 rounded-lg text-py-green">
             <Bot size={18} />
          </div>
          <div>
              <h3 className="text-sm font-bold text-white leading-none">PyPath AI</h3>
              <p className="text-[10px] text-py-green flex items-center gap-1 mt-0.5">
                  <span className="size-1.5 bg-py-green rounded-full animate-pulse"></span>
                  Online
              </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
             <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-py-muted hover:text-white transition-colors"
             >
                 {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 hover:bg-red-500/20 rounded-lg text-py-muted hover:text-red-400 transition-colors"
             >
                 <X size={14} />
             </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f0b] custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.sender === 'user' 
                            ? 'bg-py-green text-py-dark font-medium rounded-tr-sm' 
                            : 'bg-py-surface border border-white/5 text-gray-200 rounded-tl-sm'
                        }`}>
                            {msg.text.split('\n').map((line, i) => (
                                <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                            ))}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-py-surface border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                            <span className="size-2 bg-py-muted/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="size-2 bg-py-muted/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="size-2 bg-py-muted/50 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-py-dark border-t border-white/10">
                <div className="relative flex items-center gap-2">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Спроси о коде..." 
                        className="w-full bg-py-surface border border-py-accent rounded-xl py-2.5 pl-4 pr-10 text-sm text-white placeholder-py-muted focus:ring-1 focus:ring-py-green focus:border-py-green outline-none transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="absolute right-1.5 top-1.5 p-1.5 bg-py-green/10 text-py-green rounded-lg hover:bg-py-green hover:text-py-dark disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-py-green transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
          </>
      )}
    </div>
  );
};