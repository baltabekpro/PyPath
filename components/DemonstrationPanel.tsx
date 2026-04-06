import React, { useEffect, useState } from 'react';
import { X, Code, FileText, Activity, Filter, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { APP_LANGUAGE } from '../constants';
import { apiGet } from '../api';

interface DemonstrationPanelProps {
  visible: boolean;
  onClose: () => void;
}

interface ScaffoldingRule {
  id: string;
  description: string;
  active: boolean;
}

interface ScaffoldingStatus {
  enabled: boolean;
  rules: ScaffoldingRule[];
  system_prompt_preview: string;
}

interface ValidationLogEntry {
  timestamp: string;
  user_id: string;
  request_type: string;
  validation_passed: boolean;
  rules_applied: string[];
  rules_violated: string[];
  code_line_count: number;
  has_leading_question: boolean;
  is_complete_solution: boolean;
  confidence_score: number;
}

interface ValidationLogsResponse {
  logs: ValidationLogEntry[];
  total_count: number;
}

type TabType = 'prompt' | 'rules' | 'logs' | 'examples';

export const DemonstrationPanel: React.FC<DemonstrationPanelProps> = ({ visible, onClose }) => {
  const isKz = APP_LANGUAGE === 'kz';
  const t = {
    title: isKz ? 'Скаффолдинг демонстрациясы' : 'Демонстрация скаффолдинга',
    subtitle: isKz ? 'Ментор режимінің техникалық іске асырылуы' : 'Техническая реализация режима ментора',
    tabPrompt: isKz ? 'Жүйелік нұсқау' : 'Системный промпт',
    tabRules: isKz ? 'Ережелер' : 'Правила',
    tabLogs: isKz ? 'Тексеру журналы' : 'Журнал валидации',
    tabExamples: isKz ? 'Мысалдар' : 'Примеры',
    loading: isKz ? 'Жүктеу...' : 'Загрузка...',
    error: isKz ? 'Қате орын алды' : 'Произошла ошибка',
    scaffoldingEnabled: isKz ? 'Скаффолдинг қосулы' : 'Скаффолдинг включен',
    scaffoldingDisabled: isKz ? 'Скаффолдинг өшірулі' : 'Скаффолдинг выключен',
    activeRules: isKz ? 'Белсенді ережелер' : 'Активные правила',
    systemPromptPreview: isKz ? 'Жүйелік нұсқау алдын ала қарау' : 'Предпросмотр системного промпта',
    recentLogs: isKz ? 'Соңғы тексерулер' : 'Последние валидации',
    filterByUser: isKz ? 'Пайдаланушы бойынша сүзу' : 'Фильтр по пользователю',
    allUsers: isKz ? 'Барлық пайдаланушылар' : 'Все пользователи',
    requestType: isKz ? 'Сұрау түрі' : 'Тип запроса',
    validationPassed: isKz ? 'Тексеру өтті' : 'Валидация пройдена',
    validationFailed: isKz ? 'Тексеру сәтсіз' : 'Валидация не пройдена',
    rulesApplied: isKz ? 'Қолданылған ережелер' : 'Применённые правила',
    rulesViolated: isKz ? 'Бұзылған ережелер' : 'Нарушенные правила',
    codeLines: isKz ? 'Код жолдары' : 'Строк кода',
    hasQuestion: isKz ? 'Сұрақ бар' : 'Есть вопрос',
    completeSolution: isKz ? 'Толық шешім' : 'Полное решение',
    confidence: isKz ? 'Сенімділік' : 'Уверенность',
    exampleHint: isKz ? 'Кеңес мысалы' : 'Пример подсказки',
    exampleComplete: isKz ? 'Толық шешім мысалы' : 'Пример полного решения',
    userQuestion: isKz ? 'Пайдаланушы сұрағы' : 'Вопрос пользователя',
    aiResponse: isKz ? 'AI жауабы' : 'Ответ AI',
    hintExample: {
      question: isKz 
        ? 'Тізімді қалай сұрыптауға болады?' 
        : 'Как отсортировать список?',
      response: isKz
        ? 'Тізімді сұрыптау үшін бірнеше тәсіл бар:\n\n1. **sorted()** функциясын қолданыңыз - бұл жаңа сұрыпталған тізім қайтарады\n2. **.sort()** әдісін қолданыңыз - бұл тізімді орнында өзгертеді\n\n**Сұрақ:** Сізге жаңа тізім қажет пе, әлде бар тізімді өзгерткіңіз келе ме?\n\nМысал синтаксис:\n```python\nnumbers = [3, 1, 2]\nresult = sorted(numbers)\n```\n\nОсы екі тәсілдің айырмашылығын түсінесіз бе?'
        : 'Для сортировки списка есть несколько подходов:\n\n1. **sorted()** функция - возвращает новый отсортированный список\n2. **.sort()** метод - изменяет список на месте\n\n**Вопрос:** Вам нужен новый список или изменить существующий?\n\nПример синтаксиса:\n```python\nnumbers = [3, 1, 2]\nresult = sorted(numbers)\n```\n\nПонимаете разницу между этими двумя подходами?'
    },
    completeExample: {
      question: isKz
        ? 'Тізімді сұрыптайтын функция жазыңыз'
        : 'Напиши функцию для сортировки списка',
      response: isKz
        ? '```python\ndef sort_list(items):\n    return sorted(items)\n\nnumbers = [3, 1, 4, 1, 5]\nsorted_numbers = sort_list(numbers)\nprint(sorted_numbers)  # [1, 1, 3, 4, 5]\n```\n\nБұл функция тізімді өсу ретімен сұрыптайды.'
        : '```python\ndef sort_list(items):\n    return sorted(items)\n\nnumbers = [3, 1, 4, 1, 5]\nsorted_numbers = sort_list(numbers)\nprint(sorted_numbers)  # [1, 1, 3, 4, 5]\n```\n\nЭта функция сортирует список по возрастанию.'
    },
    comparisonNote: isKz
      ? '⚠️ Скаффолдинг режимі толық шешімдерді блоктайды және кеңестер береді'
      : '⚠️ Режим скаффолдинга блокирует полные решения и предоставляет подсказки',
    noLogs: isKz ? 'Журнал жазбалары жоқ' : 'Нет записей в журнале',
    refresh: isKz ? 'Жаңарту' : 'Обновить',
  };

  const [activeTab, setActiveTab] = useState<TabType>('prompt');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ScaffoldingStatus | null>(null);
  const [logs, setLogs] = useState<ValidationLogEntry[]>([]);
  const [userFilter, setUserFilter] = useState<string>('');
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusData, logsData] = await Promise.all([
        apiGet<ScaffoldingStatus>('/ai/scaffolding/status'),
        apiGet<ValidationLogsResponse>('/ai/scaffolding/logs?limit=50'),
      ]);
      setStatus(statusData);
      setLogs(logsData.logs || []);
    } catch (e: any) {
      setError(e?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const filteredLogs = userFilter
    ? logs.filter(log => log.user_id.toLowerCase().includes(userFilter.toLowerCase()))
    : logs;

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user_id)));

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
          <div>
            <h2 className="text-slate-900 dark:text-white font-display font-black text-lg">{t.title}</h2>
            <p className="text-xs text-slate-600 dark:text-gray-400">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 p-2 shrink-0">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'prompt'
                ? 'bg-arcade-primary text-white'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={16} />
            {t.tabPrompt}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-arcade-primary text-white'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap size={16} />
            {t.tabRules}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-arcade-primary text-white'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity size={16} />
            {t.tabLogs}
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'examples'
                ? 'bg-arcade-primary text-white'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code size={16} />
            {t.tabExamples}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 dark:text-gray-400">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* System Prompt Tab */}
              {activeTab === 'prompt' && status && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 dark:text-white font-bold">{t.systemPromptPreview}</h3>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        status.enabled
                          ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {status.enabled ? t.scaffoldingEnabled : t.scaffoldingDisabled}
                    </span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-gray-200 whitespace-pre-wrap max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {status.system_prompt_preview}
                  </div>
                </div>
              )}

              {/* Rules Tab */}
              {activeTab === 'rules' && status && (
                <div className="space-y-4">
                  <h3 className="text-slate-900 dark:text-white font-bold">{t.activeRules}</h3>
                  <div className="space-y-3">
                    {status.rules.map((rule, index) => (
                      <div
                        key={rule.id}
                        className={`bg-slate-50 dark:bg-slate-800 border rounded-xl p-4 ${
                          rule.active
                            ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10'
                            : 'border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                              rule.active
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-gray-400'
                            }`}
                          >
                            {rule.active ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 dark:text-white font-bold text-sm">
                              {rule.id}
                            </p>
                            <p className="text-slate-600 dark:text-gray-300 text-sm mt-1">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-slate-900 dark:text-white font-bold">{t.recentLogs}</h3>
                    <button
                      onClick={loadData}
                      className="px-3 py-1.5 text-xs rounded-lg bg-arcade-primary/10 text-arcade-primary hover:bg-arcade-primary/20 transition-colors"
                    >
                      {t.refresh}
                    </button>
                  </div>

                  {/* User Filter */}
                  <div className="flex items-center gap-3">
                    <Filter size={16} className="text-slate-500 dark:text-gray-400" />
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-arcade-primary focus:outline-none"
                    >
                      <option value="">{t.allUsers}</option>
                      {uniqueUsers.map((userId) => (
                        <option key={userId} value={userId}>
                          {userId}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Logs List */}
                  {filteredLogs.length === 0 ? (
                    <p className="text-slate-500 dark:text-gray-400 text-center py-8">{t.noLogs}</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredLogs.map((log, index) => (
                        <div
                          key={index}
                          className={`bg-slate-50 dark:bg-slate-800 border rounded-xl p-4 ${
                            log.validation_passed
                              ? 'border-green-500/30'
                              : 'border-orange-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    log.validation_passed
                                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                  }`}
                                >
                                  {log.validation_passed ? t.validationPassed : t.validationFailed}
                                </span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  {log.request_type}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500 dark:text-gray-400">{t.codeLines}:</span>{' '}
                                  <span className="text-slate-900 dark:text-white font-bold">{log.code_line_count}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 dark:text-gray-400">{t.confidence}:</span>{' '}
                                  <span className="text-slate-900 dark:text-white font-bold">
                                    {(log.confidence_score * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 dark:text-gray-400">{t.hasQuestion}:</span>{' '}
                                  <span className="text-slate-900 dark:text-white font-bold">
                                    {log.has_leading_question ? '✓' : '✗'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 dark:text-gray-400">{t.completeSolution}:</span>{' '}
                                  <span className="text-slate-900 dark:text-white font-bold">
                                    {log.is_complete_solution ? '✓' : '✗'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLogExpansion(index)}
                              className="p-1 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              {expandedLogs.has(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>

                          {expandedLogs.has(index) && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                              {log.rules_applied.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                                    {t.rulesApplied}:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {log.rules_applied.map((rule) => (
                                      <span
                                        key={rule}
                                        className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                      >
                                        {rule}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {log.rules_violated.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-1">
                                    {t.rulesViolated}:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {log.rules_violated.map((rule) => (
                                      <span
                                        key={rule}
                                        className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400"
                                      >
                                        {rule}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Examples Tab */}
              {activeTab === 'examples' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                      {t.comparisonNote}
                    </p>
                  </div>

                  {/* Hint Example */}
                  <div className="space-y-3">
                    <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-500" />
                      {t.exampleHint}
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {t.userQuestion}
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {t.hintExample.question}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {t.aiResponse}
                        </p>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-sm text-slate-800 dark:text-gray-200 whitespace-pre-wrap">
                          {t.hintExample.response}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete Solution Example (Blocked) */}
                  <div className="space-y-3">
                    <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                      <AlertCircle size={18} className="text-orange-500" />
                      {t.exampleComplete}
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-orange-500/30 rounded-xl p-4 space-y-3 opacity-60">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {t.userQuestion}
                        </p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {t.completeExample.question}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {t.aiResponse}
                        </p>
                        <div className="bg-white dark:bg-slate-900 border border-orange-500/30 rounded-lg p-3 text-sm text-slate-800 dark:text-gray-200 whitespace-pre-wrap relative">
                          <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30">
                              ⚠️ {isKz ? 'Блокталған' : 'Заблокировано'}
                            </span>
                          </div>
                          {t.completeExample.response}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
