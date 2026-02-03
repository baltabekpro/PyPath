import React, { useState, useRef, useEffect } from 'react';
import { Play, Folder, File, X, ChevronRight, ChevronDown, MoreVertical, Search, Plus, Box, PanelLeftClose, PanelLeftOpen, FileJson, FileCode, FileType, FileText } from 'lucide-react';
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
  { id: 'root', name: 'project_alpha', type: 'folder', parentId: null, isOpen: true },
  
  // Main Script
  { id: '1', name: 'main.py', type: 'file', parentId: 'root', language: 'python', content: `from typing import List
from dataclasses import dataclass
from utils.analytics import calculate_metrics

@dataclass
class User:
    id: int
    username: str
    is_active: bool = True

def process_users(users: List[User]) -> None:
    """
    Main processing loop for user data.
    """
    print(f"Processing {len(users)} users...")
    
    active_users = [u for u in users if u.is_active]
    
    # Calculate engagement score
    metrics = calculate_metrics(active_users)
    print(f"Engagement Score: {metrics['score']:.2f}")

if __name__ == "__main__":
    # Mock data
    users_db = [
        User(1, "alex_dev"),
        User(2, "marie_ai", is_active=False),
        User(3, "ivan_coder")
    ]
    
    process_users(users_db)` },

  // Utils Folder
  { id: '2', name: 'utils', type: 'folder', parentId: 'root', isOpen: true },
  
  // Helper Script
  { id: '3', name: 'analytics.py', type: 'file', parentId: '2', language: 'python', content: `def calculate_metrics(data: list) -> dict:
    """
    Calculates basic performance metrics.
    """
    if not data:
        return {"score": 0.0}
        
    base_score = len(data) * 1.5
    bonus = 10 if len(data) > 5 else 0
    
    return {
        "score": base_score + bonus,
        "count": len(data)
    }` },

  // Config Files
  { id: '4', name: 'requirements.txt', type: 'file', parentId: 'root', language: 'text', content: `pandas==2.1.0\nnumpy==1.26.0\nrequests>=2.31.0` },
  { id: '5', name: 'config.json', type: 'file', parentId: 'root', language: 'json', content: `{\n  "env": "development",\n  "debug": true,\n  "max_retries": 3\n}` },
];

const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <FileCode size={14} className="text-blue-400" />;
    if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
    if (name.endsWith('.txt')) return <FileText size={14} className="text-gray-400" />;
    return <FileType size={14} className="text-gray-500" />;
}

export const EditorComponent: React.FC = () => {
  // --- State ---
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [openFiles, setOpenFiles] = useState<string[]>(['1', '3']);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Refs
  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  // --- Monaco Setup ---
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  const handleEditorBeforeMount = (monaco: any) => {
    // Define custom PyPath theme with better contrast and coloring
    monaco.editor.defineTheme('pypath-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' }, // Pink
        { token: 'identifier', foreground: 'f8f8f2' }, // White
        { token: 'type.identifier', foreground: '8be9fd' }, // Cyan
        { token: 'string', foreground: 'f1fa8c' }, // Light Yellow
        { token: 'number', foreground: 'bd93f9' }, // Purple
        { token: 'delimiter', foreground: 'f8f8f2' },
        { token: 'function', foreground: '50fa7b' }, // Green
      ],
      colors: {
        'editor.background': '#050806',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#1f2e25',
        'editorLineNumber.foreground': '#4a5b51', 
        'editorLineNumber.activeForeground': '#0df259',
        'editor.selectionBackground': '#44475a',
        'editorCursor.foreground': '#0df259',
        'editorWhitespace.foreground': '#3b4252',
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: value } : f));
    }
  };

  // --- Xterm Setup ---
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"Fira Code", monospace',
      fontSize: 13,
      theme: {
        background: '#0c120e',
        foreground: '#e2e8f0',
        cursor: '#0df259',
        selectionBackground: '#0df25944',
        black: '#000000',
        red: '#ff5555',
        green: '#0df259',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#bbbbbb',
      },
      rows: 10,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    
    // Fit needs to happen after the element is visible/sized
    setTimeout(() => fit.fit(), 100);
    
    xtermInstance.current = term;
    fitAddon.current = fit;

    term.writeln('\x1b[1;34mPyPath Terminal v1.0\x1b[0m');
    term.write('\r\n$ ');

    // Basic Shell Simulation
    let currentLine = '';
    term.onData(e => {
      switch (e) {
        case '\r': // Enter
          term.write('\r\n');
          handleCommand(currentLine, term);
          currentLine = '';
          break;
        case '\u007F': // Backspace
          if (currentLine.length > 0) {
            term.write('\b \b');
            currentLine = currentLine.substring(0, currentLine.length - 1);
          }
          break;
        default:
          term.write(e);
          currentLine += e;
      }
    });

    const handleResize = () => fit.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Resize terminal when toggled
  useEffect(() => {
    if (isTerminalOpen && fitAddon.current) {
      setTimeout(() => fitAddon.current?.fit(), 50); // Small delay for layout transition
    }
  }, [isTerminalOpen, isSidebarCollapsed]); // Also fit when sidebar changes

  const handleCommand = (cmd: string, term: Terminal) => {
    const trimmed = cmd.trim();
    if (trimmed === 'clear') {
      term.clear();
    } else if (trimmed.startsWith('python')) {
      term.writeln('\x1b[36m>> Processing 3 users...\x1b[0m');
      term.writeln('Engagement Score: \x1b[32m3.00\x1b[0m');
    } else if (trimmed === 'ls') {
        term.writeln('\x1b[34mmain.py\x1b[0m  \x1b[34mutils/\x1b[0m  requirements.txt  config.json');
    } else if (trimmed === 'help') {
        term.writeln('Available commands: python, ls, clear');
    } else if (trimmed) {
      term.writeln(`\x1b[31mcommand not found: ${trimmed}\x1b[0m`);
    }
    term.write('$ ');
  };

  // --- Execution Simulation ---
  const runCode = () => {
    if (!xtermInstance.current) return;
    setIsTerminalOpen(true);
    
    const term = xtermInstance.current;
    term.write('python main.py\r\n');
    
    setTimeout(() => {
       term.writeln('\x1b[36m>> Starting process...\x1b[0m');
       term.writeln('Processing 3 users...');
       term.writeln('Engagement Score: \x1b[1;32m3.00\x1b[0m');
       term.write('$ ');
    }, 400);
  };

  // --- File System Actions ---
  const toggleFolder = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
  };

  const openFile = (id: string) => {
    if (!openFiles.includes(id)) {
      setOpenFiles([...openFiles, id]);
    }
    setActiveFileId(id);
  };

  const closeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newOpen = openFiles.filter(fid => fid !== id);
    setOpenFiles(newOpen);
    if (activeFileId === id && newOpen.length > 0) {
      setActiveFileId(newOpen[newOpen.length - 1]);
    } else if (newOpen.length === 0) {
      setActiveFileId('');
    }
  };

  // --- Render Helpers ---
  const renderTree = (parentId: string | null, depth = 0) => {
    return files
      .filter(f => f.parentId === parentId)
      .map(node => (
        <div key={node.id}>
          <div 
            className={`flex items-center gap-2 py-1.5 cursor-pointer text-sm transition-all border-l-2 relative group ${
              node.id === activeFileId 
                ? 'bg-white/5 text-white border-py-green' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'
            }`}
            style={{ 
                paddingLeft: `${depth * 16 + 12}px`,
                paddingRight: '12px'
            }} 
            onClick={() => node.type === 'folder' ? toggleFolder(node.id) : openFile(node.id)}
          >
            {node.type === 'folder' ? (
              <>
                <span className="text-gray-600 group-hover:text-white transition-colors">
                     {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <Folder size={14} className={node.isOpen ? 'text-py-green fill-py-green/20' : 'text-gray-500'} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                 <span className="w-3.5"></span> 
                 {getFileIcon(node.name)}
              </div>
            )}
            <span className="truncate font-medium">{node.name}</span>
          </div>
          {node.type === 'folder' && node.isOpen && renderTree(node.id, depth + 1)}
        </div>
      ));
  };

  return (
    <div className="flex h-full overflow-hidden bg-editor-bg font-sans">
      {/* Sidebar - File Explorer */}
      <aside className={`border-r border-py-accent bg-editor-sidebar flex flex-col shrink-0 select-none transition-all duration-300 ${isSidebarCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-64 opacity-100'}`}>
        <div className="h-10 px-3 flex items-center justify-between border-b border-py-accent bg-[#0a0f0b]">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Проект</span>
           <div className="flex gap-2 text-gray-500">
              <Plus size={16} className="hover:text-white cursor-pointer transition-colors"/>
              <MoreVertical size={16} className="hover:text-white cursor-pointer transition-colors"/>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
           {renderTree('root')}
        </div>
      </aside>

      {/* Main Editor Area */}
      <div className="flex flex-1 flex-col relative min-w-0 bg-[#050806]">
        
        {/* Top Bar: Tabs & Actions */}
        <div className="flex h-10 bg-[#0a0f0b] border-b border-py-accent overflow-hidden">
          {/* Sidebar Toggle */}
          <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
             className="px-3 border-r border-py-accent text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
             title="Toggle Sidebar"
          >
             {isSidebarCollapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}
          </button>

          {/* Scrollable Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar-hide">
             {openFiles.map(fid => {
               const file = files.find(f => f.id === fid);
               if (!file) return null;
               const isActive = activeFileId === fid;
               
               return (
                 <div 
                    key={fid}
                    onClick={() => setActiveFileId(fid)}
                    className={`flex items-center justify-center gap-2 px-4 min-w-[140px] max-w-[200px] border-r border-py-accent cursor-pointer text-sm select-none group transition-colors relative ${
                      isActive 
                        ? 'bg-[#1f2e25] text-white font-medium' 
                        : 'bg-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
                    }`}
                 >
                    {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-py-green shadow-[0_0_8px_#0df259]"></div>}
                    {getFileIcon(file.name)}
                    <span className="truncate flex-1 pt-0.5">{file.name}</span>
                    <button 
                      onClick={(e) => closeFile(e, fid)}
                      className={`rounded-md p-0.5 transition-all ${
                          isActive ? 'opacity-100 hover:bg-white/10' : 'opacity-0 group-hover:opacity-100 hover:bg-white/10'
                      }`}
                    >
                      <X size={12} />
                    </button>
                 </div>
               )
             })}
          </div>

          {/* Spacer to push actions to right, but allow them to sit next to tabs if plenty of space */}
          <div className="flex-1"></div>

          {/* Actions Bar - Moved closer */}
          <div className="flex items-center gap-2 px-3 border-l border-py-accent bg-[#0a0f0b]">
             <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><Search size={16}/></button>
             <button 
                onClick={runCode}
                className="ml-2 px-4 py-1.5 bg-py-green text-py-dark rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-lg shadow-py-green/10"
             >
                <Play size={14} fill="currentColor"/> 
                Run
             </button>
          </div>
        </div>

        {/* Monaco Editor Integration */}
        <div className="flex-1 relative min-h-0 bg-[#050806]">
            {activeFile ? (
                 <MonacoEditor
                    height="100%"
                    language={activeFile.language || 'python'}
                    value={activeFile.content}
                    theme="pypath-dark"
                    beforeMount={handleEditorBeforeMount}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Fira Code', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        lineNumbersMinChars: 3,
                        renderLineHighlight: 'line',
                        contextmenu: true,
                    }}
                 />
            ) : (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-500 select-none bg-[#050806]">
                   <Box size={40} className="opacity-50 mb-4"/>
                   <p className="text-xs">Выберите файл для редактирования</p>
                </div>
            )}
        </div>

        {/* Xterm.js Terminal Panel */}
        <div className={`border-t border-py-accent bg-[#0c120e] flex flex-col transition-all duration-300 ${isTerminalOpen ? 'h-48' : 'h-9'}`}>
           <div 
             className="flex items-center justify-between px-4 py-2 border-b border-py-accent/50 cursor-pointer hover:bg-white/5 group select-none"
             onClick={() => setIsTerminalOpen(!isTerminalOpen)}
           >
              <div className="flex gap-6 text-[11px] font-bold tracking-wider uppercase">
                 <span className="text-white border-b-2 border-py-green pb-1.5">Терминал</span>
                 <span className="text-gray-500 group-hover:text-gray-300 transition-colors">Вывод</span>
              </div>
              <div className="flex items-center gap-3">
                 <ChevronDown size={14} className={`text-gray-500 transition-transform ${isTerminalOpen ? '' : 'rotate-180'}`} />
                 <X size={14} className="text-gray-500 hover:text-white" onClick={(e) => { e.stopPropagation(); xtermInstance.current?.clear(); }}/>
              </div>
           </div>
           
           <div className={`flex-1 relative bg-[#0c120e] pl-4 pb-2 ${!isTerminalOpen && 'hidden'}`}>
               <div ref={terminalRef} className="h-full w-full" />
           </div>
        </div>
      </div>

      <AIChat />
    </div>
  );
};

export const Editor = EditorComponent;