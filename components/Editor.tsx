import React, { useState, useRef, useEffect } from 'react';
import { Play, Folder, Settings, ChevronDown, PanelLeftClose, PanelLeftOpen, FileCode, FileText, Sparkles, CheckCircle2, Terminal as TerminalIcon, Bot, HelpCircle, Code, Maximize2, Minimize2, AlertTriangle, Lightbulb } from 'lucide-react';
import { AIChat } from './AIChat';
import MonacoEditor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// --- Types ---
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId: string | null;
  isOpen?: boolean;
  language?: string;
}

// --- Mock File System ---
const INITIAL_FILES: FileNode[] = [
  { id: 'root', name: 'mission_04_hack', type: 'folder', parentId: null, isOpen: true },
  { id: '1', name: 'main_exploit.py', type: 'file', parentId: 'root', language: 'python', content: `def bypass_firewall(ip_address):\n    # МИССИЯ: Напиши цикл для перебора портов\n    ports = [80, 443, 8080]\n    \n    # Твой код здесь:\n    for port in ports:\n        print(f"Checking port {port}...")\n        \n    return "ACCESS DENIED"` },
  { id: '2', name: 'config.json', type: 'file', parentId: 'root', language: 'json', content: `{\n  "target": "192.168.1.105",\n  "port": 8080,\n  "timeout": 5000\n}` },
];

const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <FileCode size={16} className="text-blue-400" />;
    if (name.endsWith('.json')) return <FileText size={16} className="text-yellow-400" />;
    return <FileText size={16} className="text-gray-500" />;
}

export const EditorComponent: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [openFiles, setOpenFiles] = useState<string[]>(['1']);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  // AI Bot State
  const [botEmotion, setBotEmotion] = useState<'idle' | 'thinking' | 'happy' | 'alert'>('idle');
  const [botMessage, setBotMessage] = useState<string | null>("Жду твой код, напарник!");

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
      if (window.innerWidth < 768) {
          setIsSidebarCollapsed(true);
      }
  }, []);

  const handleEditorBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme('cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff00ff', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'fb923c' },
        { token: 'function', foreground: '22d3ee', fontStyle: 'bold' },
      ],
      colors: {
        'editor.background': '#1E293B',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#334155',
        'editorCursor.foreground': '#F97316',
        'editor.selectionBackground': '#44475a',
      }
    });
  };

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 12,
      theme: {
        background: '#0F172A',
        foreground: '#10B981',
      },
      rows: 6,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    setTimeout(() => fit.fit(), 100);
    xtermInstance.current = term;
    fitAddon.current = fit;
    
    term.writeln('\x1b[1;36mNeural Link Established...\x1b[0m');
    term.write('$ ');

    const handleResize = () => fit.fit();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); term.dispose(); };
  }, []);

  const runCode = () => {
    if (!xtermInstance.current) return;
    setIsRunning(true);
    setIsTerminalOpen(true);
    setBotEmotion('thinking');
    setBotMessage("Анализирую синтаксис...");
    
    const term = xtermInstance.current;
    term.writeln('');
    term.writeln('\x1b[33m> Running script...\x1b[0m');
    
    setTimeout(() => {
       // Mock logic check
       if (activeFile?.content?.includes('return "ACCESS DENIED"')) {
           term.writeln('\x1b[31m[ERROR] Firewall blocking connection.\x1b[0m');
           term.writeln('Hint: Change return value to "GRANTED"');
           term.write('$ ');
           setBotEmotion('alert');
           setBotMessage("Упс! Файрвол нас не пускает. Проверь return.");
       } else {
           term.writeln('Ports scanned: 80, 443, 8080');
           term.writeln('\x1b[35m[OUTPUT]\x1b[0m ACCESS GRANTED');
           term.writeln('\x1b[1;32m> Mission Complete!\x1b[0m');
           setBotEmotion('happy');
           setBotMessage("Отличная работа! Мы в системе.");
           setShowSuccess(true);
           setTimeout(() => setShowSuccess(false), 3000);
       }
       setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0F172A] font-sans p-2 md:p-4 gap-4 relative pb-20 md:pb-4">
      
      {/* --- Sidebar: File Manager (Hidden on Mobile by default) --- */}
      <aside className={`
          bg-[#0F172A] border border-slate-800/50 rounded-2xl flex flex-col shrink-0 transition-all duration-300 overflow-hidden relative
          shadow-lg backdrop-blur-md absolute md:relative z-20 h-full
          ${isSidebarCollapsed ? 'w-0 opacity-0 border-0 p-0 pointer-events-none md:pointer-events-auto' : 'w-64 left-0'}
      `}>
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/50 bg-[#1E293B]/30">
           <span className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] font-mono">Файлы</span>
           <button onClick={() => setIsSidebarCollapsed(true)} className="text-gray-500 hover:text-white"><PanelLeftClose size={16}/></button>
        </div>
        <div className="flex-1 py-2 overflow-y-auto custom-scrollbar bg-[#0F172A]">
            {files.map(f => (
                 <div key={f.id} className={`flex items-center gap-3 py-2.5 px-4 cursor-pointer text-sm font-medium font-mono border-l-[3px] ${f.id === activeFileId ? 'border-arcade-primary bg-white/5 text-white' : 'border-transparent text-gray-500'}`} onClick={() => setActiveFileId(f.id)}>
                    {getFileIcon(f.name)} <span>{f.name}</span>
                 </div>
            ))}
        </div>
      </aside>

      {/* --- Main Area: Code Editor --- */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50">
        
        {/* Action Bar */}
        <div className="h-14 flex items-center justify-between px-4 bg-[#0F172A] border-b border-white/5 relative z-10">
             <div className="flex items-center gap-2">
                {isSidebarCollapsed && (
                    <button onClick={() => setIsSidebarCollapsed(false)} className="p-2 text-gray-400 hover:text-white"><PanelLeftOpen size={20}/></button>
                )}
                <span className="text-xs font-bold text-gray-400 md:hidden">{activeFile?.name}</span>
             </div>

             <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-50 md:opacity-100">
                <span className="text-[10px] text-arcade-primary font-bold uppercase tracking-[0.2em] animate-pulse">Миссия 04</span>
             </div>

             <button 
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-arcade-action text-white px-4 py-1.5 rounded-lg font-black uppercase text-xs flex items-center gap-2 shadow-neon-orange hover:scale-105 transition-transform"
               >
                  {isRunning ? <Sparkles size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                  <span>RUN</span>
               </button>
        </div>

        {/* Editor Container */}
        <div className="flex-1 flex flex-col relative">
            <div className="flex-1 relative bg-[#1E293B]">
                 {activeFile && (
                     <MonacoEditor
                        height="100%"
                        language={activeFile.language || 'python'}
                        value={activeFile.content}
                        theme="cyberpunk"
                        beforeMount={handleEditorBeforeMount}
                        options={{ 
                            minimap: { enabled: false }, 
                            fontSize: 14, 
                            fontFamily: "'JetBrains Mono', monospace", 
                            padding: { top: 20 },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true
                        }}
                        onChange={(val) => setFiles(files.map(f => f.id === activeFileId ? {...f, content: val} : f))}
                     />
                 )}
                 
                 {/* Success Overlay */}
                 {showSuccess && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                         <div className="bg-[#0F172A]/90 border border-arcade-success/50 text-white px-8 py-6 rounded-3xl shadow-[0_0_60px_rgba(52,211,153,0.3)] animate-bounce-sm flex flex-col items-center">
                             <div className="size-16 bg-arcade-success rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_#34D399]">
                                <CheckCircle2 size={32} strokeWidth={3} className="text-[#0F172A]" />
                             </div>
                             <h2 className="text-2xl font-black mb-1 text-arcade-success">System Hacked!</h2>
                             <p className="font-mono text-sm">+100 XP</p>
                         </div>
                     </div>
                 )}
            </div>

            {/* AI HELPER BOT (Integrated into Editor) */}
            <div className="absolute bottom-4 right-4 z-30 flex items-end gap-3 pointer-events-none">
                {botMessage && (
                    <div className="bg-black/80 backdrop-blur border border-cyan-500/30 text-cyan-100 text-xs px-3 py-2 rounded-xl rounded-br-none mb-8 animate-fade-in max-w-[200px] shadow-lg pointer-events-auto">
                        {botMessage}
                    </div>
                )}
                <button 
                    onClick={() => setAiChatOpen(true)}
                    className={`size-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all hover:scale-110 pointer-events-auto bg-slate-900 ${
                        botEmotion === 'alert' ? 'border-red-500 shadow-red-500/50' : 
                        botEmotion === 'happy' ? 'border-green-500 shadow-green-500/50' : 
                        'border-cyan-500 shadow-cyan-500/50'
                    }`}
                >
                    <Bot size={24} className={`${
                        botEmotion === 'alert' ? 'text-red-400' : 
                        botEmotion === 'happy' ? 'text-green-400' : 
                        'text-cyan-400'
                    }`} />
                </button>
            </div>

            {/* Terminal */}
            <div className={`bg-[#0F172A] border-t border-slate-800 transition-all duration-300 flex flex-col relative z-20 ${isTerminalOpen ? 'h-40 md:h-48' : 'h-8'}`}>
                <div 
                    className="h-8 flex items-center justify-between px-4 bg-[#0F172A] cursor-pointer hover:bg-[#1E293B] border-b border-slate-800/50" 
                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                >
                    <div className="flex items-center gap-2">
                        <TerminalIcon size={12} className="text-arcade-mentor" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono">Terminal Output</span>
                    </div>
                    {isTerminalOpen ? <ChevronDown size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500 rotate-180"/>}
                </div>
                <div className="flex-1 p-2 relative bg-[#0c120e] overflow-hidden">
                    <div className="size-full" ref={terminalRef}></div>
                </div>
            </div>
        </div>

      </div>

      {/* Full AI Chat Overlay */}
      {aiChatOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-lg h-[80%] relative shadow-2xl rounded-2xl overflow-hidden border border-arcade-primary/30 bg-[#0F172A]">
                  <button 
                      onClick={() => setAiChatOpen(false)} 
                      className="absolute top-4 right-4 z-50 text-white hover:text-red-400 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-all"
                  >
                      <Minimize2 size={20} />
                  </button>
                  <AIChat /> 
              </div>
          </div>
      )}
    </div>
  );
};

export const Editor = EditorComponent;