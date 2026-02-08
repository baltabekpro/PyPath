import React, { useState, useRef, useEffect } from 'react';
import { Play, Folder, File, X, ChevronRight, ChevronDown, MoreVertical, Search, Plus, Box, PanelLeftClose, PanelLeftOpen, FileJson, FileCode, FileType, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
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
  { id: 'root', name: 'mission_alpha', type: 'folder', parentId: null, isOpen: true },
  { id: '1', name: 'hero.py', type: 'file', parentId: 'root', language: 'python', content: `def attack(enemy):\n    damage = 50\n    enemy.health -= damage\n    print(f"Hit! Enemy HP: {enemy.health}")\n\n# Твой код здесь:` },
  { id: '2', name: 'inventory.py', type: 'file', parentId: 'root', language: 'python', content: `items = ["Sword", "Potion"]` },
];

const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <FileCode size={16} className="text-blue-400" />;
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

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleEditorBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme('arcade-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'f8f8f2' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#1E293B', // Slate 800
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
      fontSize: 14,
      theme: {
        background: '#0F172A',
        foreground: '#e2e8f0',
        cursor: '#F97316',
        green: '#34D399',
        blue: '#22D3EE',
        red: '#F43F5E'
      },
      rows: 8,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    setTimeout(() => fit.fit(), 100);
    xtermInstance.current = term;
    fitAddon.current = fit;
    term.writeln('\x1b[1;36mCode Arcade Terminal Ready...\x1b[0m');
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
    term.clear();
    term.writeln('\x1b[33m> Запуск заклинания...\x1b[0m');
    
    setTimeout(() => {
       term.writeln('Hit! Enemy HP: 50');
       term.writeln('\x1b[1;32m> Успех! Враг повержен!\x1b[0m');
       term.write('$ ');
       setIsRunning(false);
       setShowSuccess(true);
       setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  // --- Helpers for File Tree (Simplified) ---
  const renderTree = (parentId: string | null, depth = 0) => {
    return files.filter(f => f.parentId === parentId).map(node => (
        <div key={node.id} 
            className={`flex items-center gap-2 py-2 px-4 cursor-pointer text-sm font-bold font-mono transition-colors ${node.id === activeFileId ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            style={{ paddingLeft: `${depth * 16 + 16}px` }}
            onClick={() => setActiveFileId(node.id)}
        >
            {node.type === 'folder' ? <Folder size={16} className="text-yellow-400 fill-yellow-400/20" /> : getFileIcon(node.name)}
            <span>{node.name}</span>
        </div>
    ));
  };

  return (
    <div className="flex h-full overflow-hidden bg-arcade-bg font-sans p-4 gap-4">
      {/* Sidebar */}
      <aside className={`bg-arcade-card rounded-3xl border border-white/5 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 p-0 border-0' : 'w-64'}`}>
        <div className="h-12 px-4 flex items-center justify-between bg-black/20">
           <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Файлы Миссии</span>
        </div>
        <div className="flex-1 py-2">{renderTree('root')}</div>
      </aside>

      {/* Editor Main */}
      <div className="flex flex-1 flex-col relative min-w-0 bg-arcade-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        
        {/* Toolbar */}
        <div className="flex h-14 bg-black/20 border-b border-white/5 items-center px-4 gap-4">
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-gray-400 hover:text-white"><PanelLeftOpen size={20}/></button>
           
           {/* Tabs */}
           <div className="flex gap-2">
               {openFiles.map(fid => {
                   const f = files.find(x => x.id === fid);
                   if(!f) return null;
                   return (
                       <div key={fid} className={`px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold cursor-pointer ${activeFileId === fid ? 'bg-arcade-primary text-white shadow-lg' : 'bg-white/5 text-gray-500'}`} onClick={() => setActiveFileId(fid)}>
                           {getFileIcon(f.name)} {f.name}
                       </div>
                   )
               })}
           </div>

           <div className="flex-1"></div>

           {/* BIG RUN BUTTON */}
           <button 
              onClick={runCode}
              disabled={isRunning}
              className="bg-arcade-action text-white px-8 py-2 rounded-xl font-black uppercase tracking-wider flex items-center gap-2 shadow-press hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-press-active border-b-4 border-orange-700 transition-all disabled:opacity-70 disabled:cursor-wait"
           >
              {isRunning ? <Sparkles size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
              {isRunning ? 'Компиляция...' : 'ЗАПУСК'}
           </button>
        </div>

        {/* Editor */}
        <div className="flex-1 relative bg-[#1E293B]">
             {activeFile && (
                 <MonacoEditor
                    height="100%"
                    language="python"
                    value={activeFile.content}
                    theme="arcade-dark"
                    options={{ minimap: { enabled: false }, fontSize: 16, fontFamily: "'JetBrains Mono', monospace", padding: { top: 24 } }}
                    onChange={(val) => setFiles(files.map(f => f.id === activeFileId ? {...f, content: val} : f))}
                 />
             )}
             
             {/* Success Overlay */}
             {showSuccess && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                     <div className="bg-arcade-success text-white px-8 py-6 rounded-3xl shadow-[0_0_50px_rgba(52,211,153,0.5)] animate-bounce-sm flex flex-col items-center">
                         <CheckCircle2 size={64} strokeWidth={3} className="mb-2" />
                         <h2 className="text-3xl font-black">Level Complete!</h2>
                         <p className="font-mono text-lg">+50 XP</p>
                     </div>
                 </div>
             )}
        </div>

        {/* Terminal */}
        <div className={`bg-[#0F172A] border-t border-white/10 transition-all duration-300 flex flex-col ${isTerminalOpen ? 'h-48' : 'h-10'}`}>
            <div className="h-10 flex items-center justify-between px-4 bg-black/30 cursor-pointer" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
                <span className="text-xs font-bold text-arcade-mentor uppercase flex items-center gap-2">
                    <div className="size-2 bg-arcade-mentor rounded-full animate-pulse"></div>
                    Консоль
                </span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isTerminalOpen ? '' : 'rotate-180'}`} />
            </div>
            <div className="flex-1 p-4" ref={terminalRef}></div>
        </div>

      </div>

      <AIChat />
    </div>
  );
};

export const Editor = EditorComponent;