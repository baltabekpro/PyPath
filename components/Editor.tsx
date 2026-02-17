import React, { useState, useRef, useEffect } from 'react';
import { Play, Folder, Settings, ChevronDown, PanelLeftClose, PanelLeftOpen, FileCode, FileText, Sparkles, CheckCircle2, Terminal as TerminalIcon, Bot, HelpCircle, Code, Maximize2, Minimize2, AlertTriangle, Lightbulb, BookOpen, Flag, Scroll, Map, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { AIChat } from './AIChat';
import MonacoEditor from '@monaco-editor/react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { EDITOR_UI, UI_TEXTS } from '../constants';
import { apiGet, missionApi, type MissionData, type MissionFile } from '../api';

const THEORY_HINT_PREFIX = '__THEORY__:';

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

const extractCourseIdFromChapter = (chapter?: string | null): number | null => {
    if (!chapter) return null;
    const match = String(chapter).match(/(\d+)/);
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) && value > 0 ? value : null;
};

const buildTheoryFromMission = (details: MissionData, baseTheory?: string) => {
    const title = details.chapter || 'Задание';
    const description = (details.description || '').trim();
    const objectives = (details.objectives || []).map((item: any) => String(item?.text || '')).filter(Boolean);
    const textBase = `${description} ${objectives.join(' ')}`.toLowerCase();

    if (baseTheory && baseTheory.trim()) {
        return baseTheory.trim();
    }

    if (textBase.includes('цикл') || textBase.includes('for') || textBase.includes('ports')) {
        return [
            `${title}: как написать цикл for`,
            '',
            '1) Сначала создайте список:',
            "ports = [22, 80, 443]",
            '',
            '2) Затем пройдитесь по списку циклом:',
            'for port in ports:',
            "    print('Проверяем порт', port)",
            '',
            'Важно: после строки с for нужен отступ в 4 пробела.',
        ].join('\n');
    }

    if (textBase.includes('if') || textBase.includes('услов')) {
        return [
            `${title}: как написать условие if`,
            '',
            'age = 11',
            'if age >= 10:',
            "    print('Можно')",
            'else:',
            "    print('Пока рано')",
            '',
            'Сначала пишем условие, потом делаем отступ и действие.',
        ].join('\n');
    }

    if (textBase.includes('функц') || textBase.includes('def')) {
        return [
            `${title}: как создать функцию`,
            '',
            'def hello(name):',
            "    print('Привет,', name)",
            '',
            "hello('Миша')",
            '',
            'Функция создаётся через def, а потом её нужно вызвать.',
        ].join('\n');
    }

    return [
        `${title}: мини-шпаргалка`,
        '',
        '1) Выведите текст:',
        "print('Привет, мир!')",
        '',
        '2) Сохраните значение в переменную:',
        'name = "Аня"',
        'print(name)',
        '',
        'Пишите код по шагам и запускайте после каждого небольшого изменения.',
    ].join('\n');
};

const toKidFriendlyHint = (hint: string) => {
    const normalized = (hint || '').trim();
    const lower = normalized.toLowerCase();

    if (!normalized) return '';

    if (lower.includes('for port in ports') || (lower.includes('цикл') && lower.includes('ports'))) {
        return 'Как сделать цикл: сначала список, потом for.\nports = [22, 80, 443]\nfor port in ports:\n    print(port)';
    }

    if (lower.includes('print') && lower.includes('порт')) {
        return 'Внутри цикла добавьте вывод через print.\nfor port in ports:\n    print("Проверяем порт", port)';
    }

    if (lower.includes('access granted') || (lower.includes('верните') && lower.includes('функц'))) {
        return 'Если нужно вернуть текст из функции:\ndef check():\n    return "ACCESS GRANTED"\n\nprint(check())';
    }

    if (lower.includes('if') || lower.includes('услов')) {
        return 'Шаблон условия:\nif условие:\n    действие\nelse:\n    другое_действие';
    }

    if (lower.includes('отступ')) {
        return 'После if/for/def всегда делайте отступ 4 пробела в следующей строке.';
    }

    return normalized;
};

const buildKidFriendlyCommonErrors = (details: MissionData, hintTexts: string[]) => {
    const mapped = hintTexts.map(toKidFriendlyHint).filter(Boolean);
    if (mapped.length > 0) {
        return mapped;
    }

    const textBase = `${details.description || ''} ${(details.objectives || []).map((item: any) => item?.text || '').join(' ')}`.toLowerCase();

    if (textBase.includes('цикл') || textBase.includes('for')) {
        return [
            'Проверьте, что цикл написан с двоеточием: for i in range(3):',
            'Проверьте отступ внутри цикла (4 пробела).',
            'Проверьте, что print находится внутри цикла, а не снаружи.',
        ];
    }

    if (textBase.includes('if') || textBase.includes('услов')) {
        return [
            'После if обязательно ставьте двоеточие: if x > 0:',
            'Сравнение пишется через ==, а не через =.',
            'Проверьте отступы в блоках if/else.',
        ];
    }

    return [
        'Пишите код маленькими шагами и запускайте после каждого шага.',
        'Проверьте имена переменных: одна буква ошибки ломает программу.',
        'Сверьте вывод в консоли с формулировкой задания.',
    ];
};

export const EditorComponent: React.FC = () => {
    const [mission, setMission] = useState<MissionData | null>(null);
    const [missionList, setMissionList] = useState<MissionData[]>([]);
    const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
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
    const [learningStep, setLearningStep] = useState<'theory' | 'practice'>('theory');
  
  // AI Bot State
  const [botEmotion, setBotEmotion] = useState<'idle' | 'thinking' | 'happy' | 'alert'>('idle');
    const [botMessage, setBotMessage] = useState<string | null>(botMessages.initial || textBot.initial);

  const editorRef = useRef<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  const buildMissionLearning = (details: MissionData) => {
      const outputTest = (details.testCases || []).find((testCase: any) => testCase?.type === 'output_contains');
      const objectiveTexts = (details.objectives || [])
          .map((objective: any) => objective?.text)
          .filter(Boolean);
      const allHints = (details.hints || []).filter(Boolean).map((item: any) => String(item));
      const theoryMeta = allHints.find((item) => item.startsWith(THEORY_HINT_PREFIX));
      const theoryText = theoryMeta ? theoryMeta.replace(THEORY_HINT_PREFIX, '').trim() : '';
      const hintTexts = allHints.filter((item) => !item.startsWith(THEORY_HINT_PREFIX));

    const generatedTheory = buildTheoryFromMission(details, theoryText);

      const kidFriendlyErrors = buildKidFriendlyCommonErrors(details, hintTexts);

      return {
          theoryTitle: `Теория: ${details.chapter || 'Задание'}`,
          theoryContent: generatedTheory || learningData.content || textLearning.content || 'Материал загружается',
          expectedOutput: String(outputTest?.value || learningData.expectedOutput || textLearning.expectedOutput || 'Смотрите условие задания'),
          commonErrors: kidFriendlyErrors.length
              ? kidFriendlyErrors
              : (learningData.commonErrors || textLearning.commonErrors || [
                    'Проверьте отступы',
                    'Проверьте имена переменных',
                ]),
          miniCheck: objectiveTexts.length
              ? `Проверьте перед запуском: ${objectiveTexts.slice(0, 3).join('; ')}`
              : (learningData.miniCheck || textLearning.miniCheck || 'Запустите код и сверяйте вывод с условием'),
      };
  };

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

          const missionLearning = buildMissionLearning(details);

          const missionWithTheory = {
              ...details,
              objectives: progress?.objectives || details.objectives || [],
              theory: {
                  title: missionLearning.theoryTitle,
                  content: missionLearning.theoryContent,
              },
              learning: {
                  expectedOutput: missionLearning.expectedOutput,
                  commonErrors: missionLearning.commonErrors,
                  miniCheck: missionLearning.miniCheck,
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
          setLearningStep('theory');
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
          let hasMission = false;
          try {
              const missions = await missionApi.getAll();
              if (missions && missions.length > 0) {
                  hasMission = true;
                  setMissionList(missions);
                  let resolvedCourseId: number | null = null;
                  try {
                      const courses = await apiGet<any[]>('/courses');
                      const activeCourse = (courses || []).find((course: any) => !course?.locked && course?.status === 'in_progress')
                          || (courses || []).find((course: any) => !course?.locked);
                      const candidateId = Number(activeCourse?.id);
                      if (Number.isFinite(candidateId) && candidateId > 0) {
                          resolvedCourseId = candidateId;
                      }
                  } catch {
                  }

                  if (!resolvedCourseId) {
                      const storedCourse = localStorage.getItem('activeCourseId');
                      if (storedCourse) {
                          const parsed = Number(storedCourse);
                          if (Number.isFinite(parsed) && parsed > 0) {
                              resolvedCourseId = parsed;
                          }
                      }
                  }

                  if (resolvedCourseId) {
                      setActiveCourseId(resolvedCourseId);
                      localStorage.setItem('activeCourseId', String(resolvedCourseId));
                  }

                  const preferredIndex = resolvedCourseId
                      ? missions.findIndex((item) => extractCourseIdFromChapter(item.chapter) === resolvedCourseId)
                      : -1;
                  const initialIndex = preferredIndex >= 0 ? preferredIndex : 0;

                  await loadMissionData(missions[initialIndex].id, initialIndex);
                  return;
              }
              setMissionList([]);
              setMission(null);
          } catch (error) {
              console.error('Failed to load mission list:', error);
              setMissionList([]);
              setMission(null);
          } finally {
              if (!hasMission) {
                  setIsLoadingMission(false);
              }
          }
      };
      loadMissions();
  }, []);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
      if (window.innerWidth < 768) {
          setIsSidebarCollapsed(true);
      }

      const storedCourse = localStorage.getItem('activeCourseId');
      if (storedCourse) {
          const parsed = Number(storedCourse);
          if (Number.isFinite(parsed) && parsed > 0) {
              setActiveCourseId(parsed);
          }
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
      if (isLoadingMission) return;
      if (!terminalRef.current) return;

        let disposed = false;
        let term: Terminal | null = null;
        let fitTimeout: number | null = null;
        let initRaf: number | null = null;

        const handleResize = () => {
            const container = terminalRef.current;
            if (!container || container.clientWidth === 0 || container.clientHeight === 0 || !fitAddonRef.current) return;
            try {
                fitAddonRef.current.fit();
            } catch {
            }
        };

        const initTerminal = () => {
            if (disposed || !terminalRef.current || xtermInstance.current) return;
            const container = terminalRef.current;
            if (!container.isConnected || container.clientWidth === 0 || container.clientHeight === 0) {
                initRaf = window.requestAnimationFrame(initTerminal);
                return;
            }

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
            try {
                term.open(container);
            } catch {
                term.dispose();
                return;
            }

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
        };

        initRaf = window.requestAnimationFrame(initTerminal);

        window.addEventListener('resize', handleResize);

        return () => {
            disposed = true;
            window.removeEventListener('resize', handleResize);
            if (initRaf !== null) window.cancelAnimationFrame(initRaf);
            if (fitTimeout !== null) window.clearTimeout(fitTimeout);
            fitAddonRef.current = null;
            if (term) term.dispose();
            xtermInstance.current = null;
        };
    }, [isLoadingMission]);

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
    const result = await missionApi.submit(mission.id, { code, courseId: activeCourseId ?? undefined });

       setMission((prev: any) => ({
          ...prev,
          objectives: result.objectives || prev?.objectives || [],
       }));

       const activeCourseFromProgress = Number(result?.courseProgress?.activeCourseId);
       if (Number.isFinite(activeCourseFromProgress) && activeCourseFromProgress > 0) {
           setActiveCourseId(activeCourseFromProgress);
           localStorage.setItem('activeCourseId', String(activeCourseFromProgress));
       }

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
              if (result.courseProgress?.nextSeasonUnlocked) {
                  term.writeln('\x1b[1;36m> Сезон завершён! Доступен следующий сезон.\x1b[0m');
              }
           setBotEmotion('happy');
           if (!result.analysis) setBotMessage(botMessages.success || textBot.success);
           setShowSuccess(true);
           setTimeout(() => setShowSuccess(false), 3000);
       } else {
           term.writeln('\x1b[31m[ERROR] Mission check failed.\x1b[0m');
           term.writeln(result.message || 'Hint: Проверь условие и ожидаемый вывод.');
              if (result.attemptMeta?.cooldownActive) {
                  term.writeln(`\x1b[33mCooldown: повторите через ${result.attemptMeta.retryAfterSeconds ?? 0} сек.\x1b[0m`);
              } else if (typeof result.attemptMeta?.consecutiveFailures === 'number') {
                  term.writeln(`\x1b[33mНеудачных попыток подряд: ${result.attemptMeta.consecutiveFailures}\x1b[0m`);
              }
           setBotEmotion('alert');
           if (!result.analysis) setBotMessage(result.message || botMessages.error || textBot.error);
       }
       term.write('$ ');
     } catch (error: any) {
         const errorMessage = String(error?.message || 'Не удалось выполнить миссию');
         term.writeln('\x1b[31m[ERROR] Не удалось выполнить миссию\x1b[0m');
         term.writeln(`\x1b[31m${errorMessage}\x1b[0m`);
         if (errorMessage.toLowerCase().includes('not authenticated') || errorMessage.toLowerCase().includes('authentication required')) {
             term.writeln('\x1b[33mПодсказка: войдите в аккаунт заново и повторите запуск.\x1b[0m');
         }
       term.write('$ ');
       setBotEmotion('alert');
         setBotMessage(errorMessage || botMessages.error || textBot.error);
       console.error('Mission submit failed:', error);
    } finally {
       setIsRunning(false);
    }
  };

    // Early return while mission is loading
        if (isLoadingMission) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="inline-block size-12 border-4 border-arcade-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Загрузка миссии...</p>
        </div>
      </div>
    );
  }

    if (!mission || missionList.length === 0) {
        return (
            <div className="flex h-full items-center justify-center bg-[#0F172A] p-6">
                <div className="max-w-lg w-full bg-[#1E293B] border border-white/10 rounded-2xl p-8 text-center">
                    <p className="text-white font-bold mb-2">Арена пока недоступна</p>
                    <p className="text-gray-400 text-sm">Список миссий пуст. Как только задания появятся, вы сможете сразу начать практику.</p>
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

                <div className="bg-[#1E293B] rounded-xl p-4 border border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-2">План урока</p>
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            onClick={() => setLearningStep('theory')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${learningStep === 'theory' ? 'bg-arcade-primary text-white' : 'bg-white/5 text-gray-300'}`}
                        >
                            Шаг 1: Теория
                        </button>
                        <button
                            onClick={() => setLearningStep('practice')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${learningStep === 'practice' ? 'bg-arcade-success text-[#0F172A]' : 'bg-white/5 text-gray-300'}`}
                        >
                            Шаг 2: Практика
                        </button>
                    </div>
                    <p className="text-xs text-gray-300">
                        {learningStep === 'theory'
                            ? 'Сначала прочитайте теорию и подсказки. Потом нажмите «Шаг 2: Практика».'
                            : 'Теперь можно писать код и нажимать «Запуск».'}
                    </p>
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
                                {(mission as any)?.learning?.expectedOutput || learningData.expectedOutput || textLearning.expectedOutput}
                            </div>
                        </div>

                        <div className="bg-[#0F172A]/70 border border-white/5 rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300 mb-2 flex items-center gap-1.5">
                                <AlertTriangle size={12} />
                                {text.commonErrorsTitle}
                            </p>
                            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-4">
                                {(((mission as any)?.learning?.commonErrors) || learningData.commonErrors || []).map((error: string, idx: number) => (
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
                                    {(mission as any)?.learning?.miniCheck || learningData.miniCheck || textLearning.miniCheck}
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

                    {learningStep === 'theory' && (
                        <button
                            onClick={() => setLearningStep('practice')}
                            className="mt-2 w-full py-2 bg-arcade-success/20 hover:bg-arcade-success/35 text-arcade-success text-xs font-bold rounded-lg transition-colors border border-arcade-success/30"
                        >
                            Я прочитал(а), перейти к практике
                        </button>
                    )}
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
                    disabled={isRunning || learningStep !== 'practice'}
                    className="bg-arcade-action text-white px-4 py-1.5 rounded-lg font-black uppercase text-xs flex items-center gap-2 shadow-neon-orange hover:scale-105 transition-transform disabled:opacity-60"
                >
                    {isRunning ? <Sparkles size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    <span>{learningStep === 'practice' ? text.run : 'Сначала теория'}</span>
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