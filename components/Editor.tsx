import React, { useState, useRef, useEffect } from 'react';
import { Play, Folder, Settings, ChevronDown, PanelLeftClose, PanelLeftOpen, FileCode, FileText, Sparkles, CheckCircle2, Terminal as TerminalIcon, Bot, HelpCircle, Code, Maximize2, Minimize2, AlertTriangle, Lightbulb, BookOpen, Flag, Scroll, Map, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { AIChat } from './AIChat';
import MonacoEditor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { EDITOR_UI, UI_TEXTS } from '../constants';
import { missionApi, type MissionData, type MissionFile } from '../api';

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

const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <FileCode size={16} className="text-blue-400" />;
    if (name.endsWith('.json')) return <FileText size={16} className="text-yellow-400" />;
    return <FileText size={16} className="text-gray-500" />;
}

export const EditorComponent: React.FC = () => {
    const [mission, setMission] = useState<MissionData | null>(null);
    const [missionList, setMissionList] = useState<MissionData[]>([]);
    const [activeMissionIndex, setActiveMissionIndex] = useState(0);
    const [isLoadingMission, setIsLoadingMission] = useState(true);
    const [isSavingCode, setIsSavingCode] = useState(false);
    const learningData = EDITOR_UI?.learning ?? {};
    const botMessages = EDITOR_UI?.botMessages ?? {};
    const text = UI_TEXTS?.editor ?? {};
    const textLearning = text.learning ?? {};
    const textBot = text.botMessages ?? {};

    const [files, setFiles] = useState<FileNode[]>([
        { id: 'root', name: 'project', type: 'folder', parentId: null, isOpen: true },
        { id: 'main', name: 'main.py', type: 'file', language: 'python', content: '# Write your code here\n', parentId: 'root' },
    ]);
    const [activeFileId, setActiveFileId] = useState<string>('main');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'mission' | 'files'>('mission');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  // AI Bot State
  const [botEmotion, setBotEmotion] = useState<'idle' | 'thinking' | 'happy' | 'alert'>('idle');
    const [botMessage, setBotMessage] = useState<string | null>(botMessages.initial || textBot.initial);

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  const mapFilesToEditorNodes = (workspaceFiles: MissionFile[], missionId: string): FileNode[] => {
      const normalized = (workspaceFiles || []).map((item) => ({
          id: item.id,
          name: item.name,
          type: (item.type as 'file' | 'folder') || 'file',
          content: item.content,
          language: item.language,
          parentId: item.parentId ?? 'root',
      }));

      const hasRoot = normalized.some((file) => file.id === 'root');
      return hasRoot
          ? normalized
          : [{ id: 'root', name: missionId || 'project', type: 'folder', parentId: null, isOpen: true }, ...normalized];
  };

  const loadMissionData = async (missionId: string, index: number) => {
      setIsLoadingMission(true);
      try {
          const [details, workspace, progress] = await Promise.all([
              missionApi.getById(missionId),
              missionApi.getWorkspace(missionId),
              missionApi.getProgress(missionId),
          ]);

          const missionWithTheory = {
              ...details,
              objectives: progress?.objectives || details.objectives || [],
              theory: {
                  title: learningData.title || textLearning.title || 'Теория',
                  content: learningData.content || textLearning.content || 'Материал загружается',
              },
          } as any;

          const workspaceFiles = workspace?.files?.length
              ? workspace.files
              : [{
                  id: 'main',
                  name: 'main.py',
                  type: 'file',
                  language: 'python',
                  content: details.starterCode || '# Write your code here\n',
                  parentId: 'root',
                }];

          const editorFiles = mapFilesToEditorNodes(workspaceFiles, missionWithTheory.id);

          setMission(missionWithTheory);
          setFiles(editorFiles);
          setActiveFileId(workspace?.activeFileId || editorFiles.find((f) => f.type === 'file')?.id || 'main');
          setActiveMissionIndex(index);
      } catch (error) {
          console.error('Failed to load mission data:', error);
      } finally {
          setIsLoadingMission(false);
      }
  };

  // Load missions list
  useEffect(() => {
      const loadMissions = async () => {
          try {
              const missions = await missionApi.getAll();
              if (missions && missions.length > 0) {
                  setMissionList(missions);
                  await loadMissionData(missions[0].id, 0);
              }
          } catch (error) {
              console.error('Failed to load mission list:', error);
          }
      };
      loadMissions();
  }, []);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
      if (window.innerWidth < 768) {
          setIsSidebarCollapsed(true);
      }
  }, []);

  const saveWorkspace = async (showSaving = false) => {
      if (!mission?.id) return;
      if (showSaving) setIsSavingCode(true);
      try {
          await missionApi.saveWorkspace(mission.id, {
              files: files
                  .filter((f) => f.id !== 'root')
                  .map((f) => ({
                      id: f.id,
                      name: f.name,
                      type: f.type,
                      content: f.content,
                      language: f.language,
                      parentId: f.parentId,
                  })),
              activeFileId,
          });
      } catch (error) {
          console.error('Failed to save workspace:', error);
      } finally {
          if (showSaving) setIsSavingCode(false);
      }
  };

  useEffect(() => {
      if (!mission?.id || isLoadingMission) return;
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
          saveWorkspace();
      }, 800);
      return () => {
          if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      };
  }, [files, activeFileId, mission?.id, isLoadingMission]);

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

        let disposed = false;
        let term: Terminal | null = null;
        let fitTimeout: number | null = null;

        const handleResize = () => {
            const container = terminalRef.current;
            if (!container || container.clientWidth === 0 || container.clientHeight === 0 || !fitAddonRef.current) return;
            try {
                fitAddonRef.current.fit();
            } catch {
            }
        };

        const initTimeout = window.setTimeout(() => {
            if (disposed || !terminalRef.current || xtermInstance.current) return;

            term = new Terminal({
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
            fitAddonRef.current = fit;
            term.loadAddon(fit);
            term.open(terminalRef.current);

            fitTimeout = window.setTimeout(() => {
                const container = terminalRef.current;
                if (!container || container.clientWidth === 0 || container.clientHeight === 0 || !fitAddonRef.current) return;
                try {
                    fitAddonRef.current.fit();
                } catch {
                }
            }, 100);

            xtermInstance.current = term;
            term.writeln('\x1b[1;36mNeural Link Established...\x1b[0m');
            term.write('$ ');
        }, 0);

        window.addEventListener('resize', handleResize);

        return () => {
            disposed = true;
            window.removeEventListener('resize', handleResize);
            window.clearTimeout(initTimeout);
            if (fitTimeout !== null) window.clearTimeout(fitTimeout);
            fitAddonRef.current = null;
            if (term) term.dispose();
            xtermInstance.current = null;
        };
  }, []);

    useEffect(() => {
        if (!isTerminalOpen || !fitAddonRef.current) return;
        const raf = window.requestAnimationFrame(() => {
            const container = terminalRef.current;
            if (!container || container.clientWidth === 0 || container.clientHeight === 0 || !fitAddonRef.current) return;
            try {
                fitAddonRef.current.fit();
            } catch {
            }
        });

        return () => window.cancelAnimationFrame(raf);
    }, [isTerminalOpen]);

    const switchMission = async (nextIndex: number) => {
            if (nextIndex < 0 || nextIndex >= missionList.length) return;
            await saveWorkspace();
            await loadMissionData(missionList[nextIndex].id, nextIndex);
    };

    const runCode = async () => {
    if (!xtermInstance.current || !mission?.id) return;
    setIsRunning(true);
    setIsTerminalOpen(true);
    setBotEmotion('thinking');
    setBotMessage(botMessages.running || textBot.running);
    
    const term = xtermInstance.current;
    term.writeln('');
    term.writeln('\x1b[33m> Running script...\x1b[0m');

    try {
       await saveWorkspace();
       const code = activeFile?.content || '';
       const result = await missionApi.submit(mission.id, { code });

       setMission((prev: any) => ({
          ...prev,
          objectives: result.objectives || prev?.objectives || [],
       }));

         if (result.terminalOutput) {
             result.terminalOutput.split('\n').forEach((line) => {
              if (line.trim()) term.writeln(line);
          });
       }

         if (result.terminalError) {
          term.writeln('\x1b[31m[stderr]\x1b[0m');
             result.terminalError.split('\n').forEach((line) => {
              if (line.trim()) term.writeln(`\x1b[31m${line}\x1b[0m`);
          });
       }

       if (result.analysis) {
          setBotEmotion(result.success ? 'happy' : 'alert');
          setBotMessage(result.analysis);
       }

       if (result.success) {
           term.writeln(`\x1b[1;32m> ${result.message} (+${result.xpEarned} XP)\x1b[0m`);
           setBotEmotion('happy');
           if (!result.analysis) setBotMessage(botMessages.success || textBot.success);
           setShowSuccess(true);
           setTimeout(() => setShowSuccess(false), 3000);
       } else {
           term.writeln('\x1b[31m[ERROR] Mission check failed.\x1b[0m');
           term.writeln(result.message || 'Hint: Проверь условие и ожидаемый вывод.');
           setBotEmotion('alert');
           if (!result.analysis) setBotMessage(result.message || botMessages.error || textBot.error);
       }
       term.write('$ ');
    } catch (error) {
       term.writeln('\x1b[31m[ERROR] Не удалось выполнить миссию\x1b[0m');
       term.write('$ ');
       setBotEmotion('alert');
       setBotMessage(botMessages.error || textBot.error);
       console.error('Mission submit failed:', error);
    } finally {
       setIsRunning(false);
    }
  };

  // Early return if mission is not loaded yet
    if (isLoadingMission || !mission) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="inline-block size-12 border-4 border-arcade-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Загрузка миссии...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#0F172A] font-sans p-2 md:p-4 gap-4 relative pb-20 md:pb-4">
      
      {/* --- Sidebar: Mission & Files --- */}
      <aside className={`
          bg-[#0F172A] border border-slate-800/50 rounded-2xl flex flex-col shrink-0 transition-all duration-300 overflow-hidden relative
          shadow-lg backdrop-blur-md absolute md:relative z-20 h-full
          ${isSidebarCollapsed ? 'w-0 opacity-0 border-0 p-0 pointer-events-none md:pointer-events-auto' : 'w-80 left-0'}
      `}>
        {/* Tab Switcher */}
        <div className="flex items-center p-2 gap-2 bg-[#1E293B]/50 border-b border-white/5">
            <button 
                onClick={() => setSidebarTab('mission')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sidebarTab === 'mission' ? 'bg-arcade-primary text-white shadow-neon-purple' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
                <Flag size={14} /> {text.missionTab}
            </button>
            <button 
                onClick={() => setSidebarTab('files')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sidebarTab === 'files' ? 'bg-arcade-primary text-white shadow-neon-purple' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
                <Folder size={14} /> {text.filesTab}
            </button>
            <button onClick={() => setIsSidebarCollapsed(true)} className="p-2 text-gray-500 hover:text-white"><PanelLeftClose size={16}/></button>
        </div>

        {/* --- MISSION TAB --- */}
        {sidebarTab === 'mission' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 bg-[#0F172A]">
                
                {/* Header */}
                <div>
                    <div className="text-[10px] text-arcade-action font-bold uppercase tracking-widest mb-1">{mission.chapter}</div>
                    <h2 className="text-xl font-display font-black text-white leading-tight">{mission.title}</h2>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{mission.description}</p>
                </div>

                {/* Objectives */}
                <div className="bg-[#1E293B] rounded-xl p-4 border border-white/5">
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-arcade-success"/>
                        {text.goalsTitle}
                    </h3>
                    <div className="space-y-3">
                        {(mission.objectives || []).map((obj: any) => (
                            <div key={obj.id} className="flex items-start gap-3 text-sm">
                                <div className={`mt-0.5 size-4 rounded border flex items-center justify-center shrink-0 ${obj.completed ? 'bg-arcade-success border-arcade-success' : 'border-gray-600 bg-transparent'}`}>
                                    {obj.completed && <CheckCircle2 size={12} className="text-[#0F172A]" strokeWidth={3} />}
                                </div>
                                <span className={obj.completed ? 'text-gray-500 line-through' : 'text-gray-200'}>{obj.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Theory Card */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-xl p-4 border border-indigo-500/30">
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen size={14} />
                        {text.knowledgeBaseTitle}
                    </h3>
                    <div className="text-sm text-gray-300 space-y-2">
                         <p className="font-bold text-white">{mission.theory.title}</p>
                         <div className="text-xs opacity-80 whitespace-pre-wrap font-mono bg-black/30 p-2 rounded-lg border border-white/5">
                             {mission.theory.content}
                         </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="bg-[#0F172A]/70 border border-white/5 rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-2">{text.expectedOutputLabel}</p>
                            <div className="font-mono text-xs text-emerald-200 bg-black/30 rounded-md p-2 border border-emerald-500/20">
                                {learningData.expectedOutput || textLearning.expectedOutput}
                            </div>
                        </div>

                        <div className="bg-[#0F172A]/70 border border-white/5 rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300 mb-2 flex items-center gap-1.5">
                                <AlertTriangle size={12} />
                                {text.commonErrorsTitle}
                            </p>
                            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4">
                                {(learningData.commonErrors || []).map((error: string, idx: number) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1 flex items-center gap-1.5">
                                <HelpCircle size={12} />
                                {text.miniCheckTitle}
                            </p>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                    {learningData.miniCheck || textLearning.miniCheck}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { setAiChatOpen(true); }}
                        className="mt-4 w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 text-xs font-bold rounded-lg transition-colors border border-indigo-500/30 flex items-center justify-center gap-2"
                    >
                        <Bot size={14} />
                        {text.askMentor}
                    </button>
                </div>

            </div>
        )}

        {/* --- FILES TAB --- */}
        {sidebarTab === 'files' && (
            <div className="flex-1 py-2 overflow-y-auto custom-scrollbar bg-[#0F172A]">
                     {files.filter(f => f.type === 'file').map(f => (
                     <div key={f.id} className={`flex items-center gap-3 py-2.5 px-4 cursor-pointer text-sm font-medium font-mono border-l-[3px] ${f.id === activeFileId ? 'border-arcade-primary bg-white/5 text-white' : 'border-transparent text-gray-500'}`} onClick={() => setActiveFileId(f.id)}>
                        {getFileIcon(f.name)} <span>{f.name}</span>
                     </div>
                ))}
            </div>
        )}
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
                {!isSidebarCollapsed && <span className="text-xs font-bold text-gray-500 font-mono hidden md:inline-block">/ {activeFile?.name}</span>}
             </div>

             <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-50 md:opacity-100">
                     <span className="text-[10px] text-arcade-primary font-bold uppercase tracking-[0.2em] animate-pulse">{mission.chapter} • {activeMissionIndex + 1}/{missionList.length}</span>
             </div>

             <div className="flex items-center gap-2">
                <button
                    onClick={() => switchMission(activeMissionIndex - 1)}
                    disabled={activeMissionIndex <= 0 || isRunning}
                    className="p-2 rounded-lg border border-slate-700 text-gray-300 disabled:opacity-40"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => saveWorkspace(true)}
                    disabled={isSavingCode || isRunning}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-gray-200 text-xs font-bold uppercase flex items-center gap-1.5 disabled:opacity-50"
                >
                    <Save size={14} /> {isSavingCode ? 'Saving...' : 'Save'}
                </button>
                <button 
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-arcade-action text-white px-4 py-1.5 rounded-lg font-black uppercase text-xs flex items-center gap-2 shadow-neon-orange hover:scale-105 transition-transform disabled:opacity-60"
                >
                    {isRunning ? <Sparkles size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    <span>{text.run}</span>
                </button>
                <button
                    onClick={() => switchMission(activeMissionIndex + 1)}
                    disabled={activeMissionIndex >= missionList.length - 1 || isRunning}
                    className="p-2 rounded-lg border border-slate-700 text-gray-300 disabled:opacity-40"
                >
                    <ChevronRight size={16} />
                </button>
             </div>
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
                                onChange={(val) => setFiles((prev) => prev.map(f => f.id === activeFileId ? {...f, content: val || ''} : f))}
                     />
                 )}
                 
                 {/* Success Overlay */}
                 {showSuccess && (
                     <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                         <div className="bg-[#0F172A]/90 border border-arcade-success/50 text-white px-8 py-6 rounded-3xl shadow-[0_0_60px_rgba(52,211,153,0.3)] animate-bounce-sm flex flex-col items-center">
                             <div className="size-16 bg-arcade-success rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_#34D399]">
                                <CheckCircle2 size={32} strokeWidth={3} className="text-[#0F172A]" />
                             </div>
                             <h2 className="text-2xl font-black mb-1 text-arcade-success">{text.successTitle}</h2>
                             <p className="font-mono text-sm">{text.successXp}</p>
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
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono">{text.terminalTitle}</span>
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
                  <AIChat embedded /> 
              </div>
          </div>
      )}
    </div>
  );
};

export const Editor = EditorComponent;