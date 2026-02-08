import React, { useState, useRef, useEffect } from 'react';
import { Play, Folder, Settings, ChevronDown, PanelLeftClose, PanelLeftOpen, FileCode, FileText, Sparkles, CheckCircle2, Terminal as TerminalIcon, Bot, HelpCircle, Code, Maximize2, Minimize2 } from 'lucide-react';
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
  { id: '1', name: 'main_exploit.py', type: 'file', parentId: 'root', language: 'python', content: `def bypass_firewall(ip_address):\n    # TODO: Implement handshake protocol\n    security_level = check_security(ip_address)\n    if security_level > 5:\n        return "ACCESS DENIED"\n    \n    print(f"Connecting to {ip_address}...")\n    return "CONNECTION ESTABLISHED"\n\n# Твой код здесь:` },
  { id: '2', name: 'config.json', type: 'file', parentId: 'root', language: 'json', content: `{\n  "target": "192.168.1.105",\n  "port": 8080,\n  "timeout": 5000\n}` },
  { id: '3', name: 'utils.py', type: 'file', parentId: 'root', language: 'python', content: `import random\n\ndef check_security(ip):\n    return random.randint(1, 10)` },
];

const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <FileCode size={16} className="text-blue-400" />;
    if (name.endsWith('.json')) return <FileText size={16} className="text-yellow-400" />;
    return <FileText size={16} className="text-gray-500" />;
}

export const EditorComponent: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [openFiles, setOpenFiles] = useState<string[]>(['1', '2']);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleEditorBeforeMount = (monaco: any) => {
    // Cyberpunk Theme Definition
    monaco.editor.defineTheme('cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff00ff', fontStyle: 'bold' }, // Neon Pink
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'fb923c' }, // Warm Orange
        { token: 'number', foreground: 'fb923c' }, // Warm Orange
        { token: 'function', foreground: '22d3ee', fontStyle: 'bold' }, // Cyan
        { token: 'delimiter', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#1E293B', // Slate 800
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#334155',
        'editorCursor.foreground': '#F97316',
        'editor.selectionBackground': '#44475a',
        'editorLineNumber.foreground': '#475569',
        'editorIndentGuide.background': '#334155',
      }
    });
  };

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#0F172A',
        foreground: '#10B981', // Terminal Green
        cursor: '#F97316',
        green: '#34D399',
        blue: '#22D3EE',
        red: '#F43F5E',
        yellow: '#FACC15',
        magenta: '#A855F7',
        cyan: '#22D3EE',
      },
      rows: 8,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    setTimeout(() => fit.fit(), 100);
    xtermInstance.current = term;
    fitAddon.current = fit;
    
    // Initial Message
    term.writeln('\x1b[1;36mSystem Link Initialized...\x1b[0m');
    term.writeln('Target: \x1b[33m192.168.1.105\x1b[0m');
    term.write('$ ');

    const handleResize = () => fit.fit();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); term.dispose(); };
  }, []);

  const runCode = () => {
    if (!xtermInstance.current) return;
    setIsRunning(true);
    setIsTerminalOpen(true);
    
    const term = xtermInstance.current;
    term.writeln('');
    term.writeln('\x1b[33m> Executing payload...\x1b[0m');
    
    setTimeout(() => {
       term.writeln('Bypassing firewall...');
       term.writeln('Handshake complete.');
       term.writeln('\x1b[35m[OUTPUT]\x1b[0m CONNECTION ESTABLISHED');
       term.writeln('\x1b[1;32m> Mission Success!\x1b[0m');
       term.writeln('\x1b[90m+100 XP gained\x1b[0m');
       term.write('$ ');
       setIsRunning(false);
       setShowSuccess(true);
       setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  // --- File Tree ---
  const renderTree = (parentId: string | null, depth = 0) => {
    return files.filter(f => f.parentId === parentId).map(node => (
        <div key={node.id} 
            className={`flex items-center gap-3 py-2.5 px-4 cursor-pointer text-sm font-medium font-mono transition-all duration-200 border-l-[3px]
            ${node.id === activeFileId 
                ? 'bg-violet-500/10 border-arcade-primary text-white shadow-[inset_10px_0_20px_-10px_rgba(168,85,247,0.1)]' 
                : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
            style={{ paddingLeft: `${depth * 12 + 16}px` }}
            onClick={() => setActiveFileId(node.id)}
        >
            {node.type === 'folder' ? <Folder size={16} className="text-yellow-400 fill-yellow-400/20" /> : getFileIcon(node.name)}
            <span>{node.name}</span>
        </div>
    ));
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0F172A] font-sans p-2 md:p-4 gap-4 relative">
      
      {/* --- Sidebar: File Manager --- */}
      <aside className={`
          bg-[#0F172A] border border-slate-800/50 rounded-2xl flex flex-col shrink-0 transition-all duration-300 overflow-hidden relative
          shadow-lg backdrop-blur-md
          ${isSidebarCollapsed ? 'w-0 opacity-0 border-0 p-0' : 'w-64'}
      `}>
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/50 bg-[#1E293B]/30 backdrop-blur-md">
           <span className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] font-mono">Файлы миссии</span>
           <button onClick={() => setIsSidebarCollapsed(true)} className="text-gray-500 hover:text-white"><PanelLeftClose size={16}/></button>
        </div>
        
        {/* File List */}
        <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
            {renderTree('root')}
        </div>

        {/* Footer: Settings */}
        <div className="p-3 border-t border-slate-800/50 flex gap-2 bg-[#0F172A]">
            <button className="flex-1 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Settings size={16} />
            </button>
            <button className="flex-1 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <HelpCircle size={16} />
            </button>
        </div>
      </aside>

      {/* --- Main Area: Code Editor --- */}
      <div className="flex flex-1 flex-col relative min-w-0 bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50">
        
        {/* Action Bar (Top Toolbar) */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#0F172A] relative shrink-0 z-20 border-b border-white/5">
            {/* Sidebar Toggle */}
             <div className="w-20">
                {isSidebarCollapsed && (
                    <button 
                        onClick={() => setIsSidebarCollapsed(false)} 
                        className="p-2 bg-slate-800/50 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-slate-700/50"
                    >
                        <PanelLeftOpen size={20}/>
                    </button>
                )}
             </div>

             {/* Center Mission Title */}
             <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <span className="text-[10px] text-arcade-primary font-bold uppercase tracking-[0.2em] mb-0.5 animate-pulse">Миссия 04</span>
                <span className="text-white font-display font-black text-lg tracking-wide shadow-black drop-shadow-lg">Взлом Системы</span>
             </div>

             {/* Right Run Button */}
             <div className="w-20 flex justify-end">
                <button 
                  onClick={runCode}
                  disabled={isRunning}
                  className="
                    group relative
                    bg-gradient-to-r from-orange-500 to-red-600 
                    text-white pl-6 pr-8 py-2.5 rounded-xl font-black uppercase tracking-wider text-sm
                    flex items-center gap-2 
                    shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]
                    transform hover:scale-105 active:scale-95 transition-all duration-200
                    disabled:opacity-70 disabled:cursor-wait
                  "
               >
                  <span className="relative z-10 flex items-center gap-2">
                    {isRunning ? <Sparkles size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                    {isRunning ? '...' : 'ЗАПУСК'}
                  </span>
                  {/* Outer Glow / Glare */}
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
               </button>
             </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 flex flex-col relative">
            
            {/* Tabs Row */}
            <div className="h-10 bg-[#0F172A] flex items-end px-4 gap-1 border-b border-[#1E293B]">
                {openFiles.map(fid => {
                   const f = files.find(x => x.id === fid);
                   if(!f) return null;
                   const isActive = activeFileId === fid;
                   return (
                       <div 
                           key={fid} 
                           className={`
                               relative group px-4 py-2 rounded-t-xl flex items-center gap-2 text-xs font-bold font-mono cursor-pointer transition-all min-w-[120px] justify-center border-t border-l border-r
                               ${isActive 
                                   ? 'bg-[#1E293B] border-[#1E293B] text-white shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-10' 
                                   : 'bg-[#0F172A] border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#1E293B]/50 hover:border-slate-800'}
                           `} 
                           onClick={() => setActiveFileId(fid)}
                       >
                           {/* Active Indicator Line */}
                           {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-arcade-primary shadow-[0_0_10px_#A855F7]"></div>}
                           
                           {getFileIcon(f.name)} 
                           <span>{f.name}</span>
                           <button 
                               onClick={(e) => { e.stopPropagation(); setOpenFiles(openFiles.filter(id => id !== fid)); }}
                               className={`ml-2 p-0.5 rounded-md hover:bg-white/10 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                           >
                               <span className="text-xs">×</span>
                           </button>
                       </div>
                   )
               })}
            </div>

            {/* Monaco Editor */}
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
                            padding: { top: 24 },
                            scrollBeyondLastLine: false,
                            renderLineHighlight: 'line',
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            fontLigatures: true
                        }}
                        onChange={(val) => setFiles(files.map(f => f.id === activeFileId ? {...f, content: val} : f))}
                     />
                 )}
                 
                 {/* Success Overlay */}
                 {showSuccess && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                         <div className="bg-[#0F172A]/90 border border-arcade-success/50 text-white px-10 py-8 rounded-3xl shadow-[0_0_60px_rgba(52,211,153,0.3)] animate-bounce-sm flex flex-col items-center backdrop-blur-xl">
                             <div className="size-20 bg-arcade-success rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_#34D399]">
                                <CheckCircle2 size={48} strokeWidth={3} className="text-[#0F172A]" />
                             </div>
                             <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-arcade-success to-emerald-200">System Hacked!</h2>
                             <p className="font-mono text-lg text-arcade-success font-bold">+100 XP</p>
                         </div>
                     </div>
                 )}
            </div>

            {/* Console / Terminal */}
            <div className={`bg-[#0F172A] border-t border-slate-800 transition-all duration-300 flex flex-col relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isTerminalOpen ? 'h-56' : 'h-10'}`}>
                {/* Terminal Header */}
                <div 
                    className="h-10 flex items-center justify-between px-4 bg-[#0F172A] cursor-pointer hover:bg-[#1E293B] transition-colors border-b border-slate-800/50" 
                    onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                >
                    <div className="flex items-center gap-3">
                        <TerminalIcon size={16} className="text-arcade-mentor" />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Output / Terminal</span>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-black/30 rounded text-[10px] text-green-400 font-mono border border-green-500/20">
                            <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Live
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isTerminalOpen ? <ChevronDown size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500 rotate-180"/>}
                    </div>
                </div>
                
                {/* Xterm Container */}
                <div className="flex-1 p-4 relative bg-[#0c120e] overflow-hidden">
                    <div className="size-full" ref={terminalRef}></div>
                    
                    {/* Floating Oracle Button */}
                    {isTerminalOpen && (
                        <div className="absolute bottom-4 right-4 z-20">
                            <button 
                                className="size-12 bg-arcade-primary text-white rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center justify-center animate-pulse-glow hover:scale-110 transition-transform border-2 border-white/20"
                                onClick={(e) => { e.stopPropagation(); setAiChatOpen(true); }}
                                title="Спросить Оракула"
                            >
                                <Bot size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* Floating AI Chat Integration */}
      {aiChatOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-2xl h-[600px] relative shadow-2xl rounded-2xl overflow-hidden border border-arcade-primary/30">
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