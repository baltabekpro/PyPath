import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Save, Trash2, RefreshCw } from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api';

type Tab = 'courses' | 'missions';

interface AdminPanelProps {
  isAdmin: boolean;
}

const emptyCourseForm = {
  title: '',
  description: '',
  totalLessons: 5,
  icon: 'Terminal',
  color: 'text-arcade-success',
  difficulty: 'Средний',
  isBoss: false,
  locked: true,
};

const emptyMissionForm = {
  id: '',
  title: '',
  chapter: 'Глава 1',
  description: '',
  difficulty: 'Средний',
  xpReward: 50,
  starterCode: 'print("Привет, PyPath")\n',
  expectedOutput: 'Привет, PyPath',
  hintsText: 'Проверьте отступы\nЗапустите код ещё раз',
  objectivesText: 'Выведите приветствие в консоль',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ isAdmin }) => {
  const [activeTab, setActiveTab] = useState<Tab>('courses');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [courses, setCourses] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  const [missionForm, setMissionForm] = useState(emptyMissionForm);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  const sortedMissions = useMemo(() => [...missions].sort((a, b) => String(a.id).localeCompare(String(b.id))), [missions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, missionsData] = await Promise.all([
        apiGet<any[]>('/courses'),
        apiGet<any[]>('/missions'),
      ]);
      setCourses(coursesData || []);
      setMissions(missionsData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2200);
  };

  const normalizeLines = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  const buildMissionPayload = () => {
    const expectedOutput = missionForm.expectedOutput.trim();
    const objectiveLines = normalizeLines(missionForm.objectivesText);
    const hints = normalizeLines(missionForm.hintsText);

    const objectives = objectiveLines.length
      ? objectiveLines.map((text) => ({ text, testCaseId: expectedOutput ? 'tc_output' : undefined }))
      : expectedOutput
        ? [{ text: `Выведите в консоль: ${expectedOutput}`, testCaseId: 'tc_output' }]
        : [];

    const testCases: any[] = [
      {
        id: 'tc_runtime',
        type: 'returncode_equals',
        value: 0,
        label: 'Код запускается без ошибок',
      },
    ];

    if (expectedOutput) {
      testCases.unshift({
        id: 'tc_output',
        type: 'output_contains',
        value: expectedOutput,
        label: `Вывод содержит: ${expectedOutput}`,
      });
    }

    return {
      id: missionForm.id.trim(),
      title: missionForm.title.trim(),
      chapter: missionForm.chapter.trim(),
      description: missionForm.description.trim(),
      difficulty: missionForm.difficulty.trim(),
      xpReward: Number(missionForm.xpReward),
      starterCode: missionForm.starterCode,
      hints,
      objectives,
      testCases,
    };
  };

  const applyDemoMissionTemplate = () => {
    setMissionForm((prev) => ({
      ...prev,
      chapter: 'Глава 1',
      difficulty: 'Лёгкий',
      title: prev.title || 'Первое задание',
      description: prev.description || 'Напишите код и получите нужный вывод в консоли.',
      starterCode: 'def main():\n    print("Привет, PyPath")\n\nmain()\n',
      expectedOutput: 'Привет, PyPath',
      hintsText: 'Создайте функцию main\nВызовите функцию в конце файла',
      objectivesText: 'Выведите приветствие в консоль\nЗапустите программу без ошибок',
    }));
    showMessage('Готовый пример подставлен');
  };

  const submitCourse = async () => {
    setSaving(true);
    try {
      const payload = {
        ...courseForm,
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
      };
      if (!payload.title) {
        throw new Error('Введите название курса');
      }
      if (!payload.description) {
        throw new Error('Введите описание курса');
      }

      if (editingCourseId) {
        await apiPut(`/courses/${editingCourseId}`, payload);
        showMessage('Курс обновлён');
      } else {
        await apiPost('/courses', payload);
        showMessage('Курс создан');
      }
      setCourseForm(emptyCourseForm);
      setEditingCourseId(null);
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || 'Не удалось сохранить курс');
    } finally {
      setSaving(false);
    }
  };

  const editCourse = (course: any) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      totalLessons: Number(course.totalLessons || 1),
      icon: course.icon || 'Terminal',
      color: course.color || 'text-arcade-success',
      difficulty: course.difficulty || 'Средний',
      isBoss: Boolean(course.isBoss),
      locked: Boolean(course.locked),
    });
  };

  const duplicateCourse = (course: any) => {
    setEditingCourseId(null);
    setCourseForm({
      title: `${course.title || 'Новый курс'} (копия)`,
      description: course.description || '',
      totalLessons: Number(course.totalLessons || 1),
      icon: course.icon || 'Terminal',
      color: course.color || 'text-arcade-success',
      difficulty: course.difficulty || 'Средний',
      isBoss: Boolean(course.isBoss),
      locked: true,
    });
    showMessage('Копия курса создана в форме. Проверьте поля и сохраните.');
  };

  const removeCourse = async (id: number) => {
    setSaving(true);
    try {
      await apiDelete(`/courses/${id}`);
      showMessage('Курс удалён');
      if (editingCourseId === id) {
        setEditingCourseId(null);
        setCourseForm(emptyCourseForm);
      }
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || 'Не удалось удалить курс');
    } finally {
      setSaving(false);
    }
  };

  const submitMission = async () => {
    setSaving(true);
    try {
      const payload = buildMissionPayload();

      if (!editingMissionId && !payload.id) {
        throw new Error('Введите ID задания');
      }
      if (!payload.title) {
        throw new Error('Введите название задания');
      }
      if (!payload.description) {
        throw new Error('Введите описание задания');
      }

      if (editingMissionId) {
        await apiPut(`/missions/${editingMissionId}`, payload);
        showMessage('Миссия обновлена');
      } else {
        await apiPost('/missions', payload);
        showMessage('Миссия создана');
      }

      setMissionForm(emptyMissionForm);
      setEditingMissionId(null);
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || 'Не удалось сохранить миссию');
    } finally {
      setSaving(false);
    }
  };

  const editMission = (mission: any) => {
    const outputCase = (mission.testCases || []).find((testCase: any) => testCase?.type === 'output_contains');
    setEditingMissionId(String(mission.id));
    setMissionForm({
      id: String(mission.id || ''),
      title: mission.title || '',
      chapter: mission.chapter || 'Глава',
      description: mission.description || '',
      difficulty: mission.difficulty || 'Средний',
      xpReward: Number(mission.xpReward || 0),
      starterCode: mission.starterCode || 'print("Привет, PyPath")\n',
      expectedOutput: String(outputCase?.value || ''),
      hintsText: (mission.hints || []).join('\n'),
      objectivesText: (mission.objectives || []).map((o: any) => o?.text).filter(Boolean).join('\n'),
    });
  };

  const duplicateMission = (mission: any) => {
    const sourceId = String(mission.id || 'mission');
    const duplicatedId = `${sourceId}_copy_${Date.now().toString().slice(-5)}`;
    const outputCase = (mission.testCases || []).find((testCase: any) => testCase?.type === 'output_contains');

    setEditingMissionId(null);
    setMissionForm({
      id: duplicatedId,
      title: `${mission.title || sourceId} (копия)`,
      chapter: mission.chapter || 'Глава',
      description: mission.description || '',
      difficulty: mission.difficulty || 'Средний',
      xpReward: Number(mission.xpReward || 0),
      starterCode: mission.starterCode || 'print("Привет, PyPath")\n',
      expectedOutput: String(outputCase?.value || ''),
      hintsText: (mission.hints || []).join('\n'),
      objectivesText: (mission.objectives || []).map((o: any) => o?.text).filter(Boolean).join('\n'),
    });

    showMessage('Копия задания создана. Проверьте ID и сохраните.');
  };

  const removeMission = async (id: string) => {
    setSaving(true);
    try {
      await apiDelete(`/missions/${id}`);
      showMessage('Миссия удалена');
      if (editingMissionId === id) {
        setEditingMissionId(null);
        setMissionForm(emptyMissionForm);
      }
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || 'Не удалось удалить миссию');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="bg-[#1E293B] border border-red-500/30 rounded-2xl p-6 text-center">
          <ShieldAlert className="mx-auto mb-3 text-red-400" />
          <h2 className="text-white text-xl font-black mb-2">Доступ запрещён</h2>
          <p className="text-gray-400">Этот раздел доступен только администраторам.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pt-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-white">Админка</h1>
          <p className="text-gray-400 text-sm">Простое управление курсами и заданиями</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Обновить
        </button>
      </div>

      {message && (
        <div className="bg-arcade-primary/20 border border-arcade-primary/40 rounded-xl px-4 py-3 text-sm text-white">
          {message}
        </div>
      )}

      <div className="flex gap-2 bg-[#0F172A] border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'courses' ? 'bg-arcade-primary text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Курсы
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'missions' ? 'bg-arcade-primary text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Задания
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold">{editingCourseId ? `Редактировать курс #${editingCourseId}` : 'Создать курс'}</h3>
            <input className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Название" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white min-h-24" placeholder="Описание" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" type="number" min={1} value={courseForm.totalLessons} onChange={(e) => setCourseForm((p) => ({ ...p, totalLessons: Number(e.target.value) }))} />
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Сложность" value={courseForm.difficulty} onChange={(e) => setCourseForm((p) => ({ ...p, difficulty: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Иконка (Terminal)" value={courseForm.icon} onChange={(e) => setCourseForm((p) => ({ ...p, icon: e.target.value }))} />
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Цвет (text-arcade-success)" value={courseForm.color} onChange={(e) => setCourseForm((p) => ({ ...p, color: e.target.value }))} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={courseForm.isBoss} onChange={(e) => setCourseForm((p) => ({ ...p, isBoss: e.target.checked }))} /> Финальный курс</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={courseForm.locked} onChange={(e) => setCourseForm((p) => ({ ...p, locked: e.target.checked }))} /> Скрыть для учеников</label>
            </div>
            <div className="flex gap-3">
              <button onClick={submitCourse} disabled={saving} className="px-4 py-2 rounded-lg bg-arcade-primary text-white font-bold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> Сохранить</button>
              {editingCourseId && <button onClick={() => { setEditingCourseId(null); setCourseForm(emptyCourseForm); }} className="px-4 py-2 rounded-lg bg-white/10 text-white">Очистить</button>}
            </div>
          </div>

          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-bold">Список курсов ({courses.length})</h3>
            {loading ? <p className="text-gray-400">Загрузка...</p> : courses.map((course) => (
              <div key={course.id} className="bg-[#0F172A] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-bold">#{course.id} {course.title}</p>
                  <p className="text-xs text-gray-400">{course.difficulty} • {course.totalLessons} уроков • {course.locked ? 'Locked' : 'Open'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCourse(course)} className="px-3 py-1.5 text-xs rounded bg-white/10 text-white">Изменить</button>
                  <button onClick={() => duplicateCourse(course)} className="px-3 py-1.5 text-xs rounded bg-arcade-primary/20 text-arcade-primary">Копия</button>
                  <button onClick={() => removeCourse(course.id)} className="px-3 py-1.5 text-xs rounded bg-red-500/20 text-red-300 flex items-center gap-1"><Trash2 size={12} /> Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold">{editingMissionId ? `Редактировать задание ${editingMissionId}` : 'Создать задание'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="ID задания" value={missionForm.id} disabled={Boolean(editingMissionId)} onChange={(e) => setMissionForm((p) => ({ ...p, id: e.target.value }))} />
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="XP" type="number" value={missionForm.xpReward} onChange={(e) => setMissionForm((p) => ({ ...p, xpReward: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Глава" value={missionForm.chapter} onChange={(e) => setMissionForm((p) => ({ ...p, chapter: e.target.value }))} />
              <input className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Сложность" value={missionForm.difficulty} onChange={(e) => setMissionForm((p) => ({ ...p, difficulty: e.target.value }))} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={applyDemoMissionTemplate} type="button" className="px-3 py-1.5 text-xs rounded bg-white/10 text-white">Подставить пример</button>
            </div>
            <input className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Название" value={missionForm.title} onChange={(e) => setMissionForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white min-h-20" placeholder="Описание" value={missionForm.description} onChange={(e) => setMissionForm((p) => ({ ...p, description: e.target.value }))} />
            <textarea className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white min-h-24 font-mono text-xs" placeholder="Код-заготовка" value={missionForm.starterCode} onChange={(e) => setMissionForm((p) => ({ ...p, starterCode: e.target.value }))} />
            <input className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Ожидаемый текст в выводе (например: Привет)" value={missionForm.expectedOutput} onChange={(e) => setMissionForm((p) => ({ ...p, expectedOutput: e.target.value }))} />
            <textarea className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white min-h-16" placeholder="Цели задания (каждая с новой строки)" value={missionForm.objectivesText} onChange={(e) => setMissionForm((p) => ({ ...p, objectivesText: e.target.value }))} />
            <textarea className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white min-h-16" placeholder="Подсказки ученику (каждая с новой строки)" value={missionForm.hintsText} onChange={(e) => setMissionForm((p) => ({ ...p, hintsText: e.target.value }))} />
            <p className="text-xs text-gray-400">Проверка задания будет идти по ожидаемому тексту в выводе и по факту запуска без ошибок.</p>
            <div className="flex gap-3">
              <button onClick={submitMission} disabled={saving} className="px-4 py-2 rounded-lg bg-arcade-primary text-white font-bold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> Сохранить</button>
              {editingMissionId && <button onClick={() => { setEditingMissionId(null); setMissionForm(emptyMissionForm); }} className="px-4 py-2 rounded-lg bg-white/10 text-white">Очистить</button>}
            </div>
          </div>

          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-bold">Список заданий ({sortedMissions.length})</h3>
            {loading ? <p className="text-gray-400">Загрузка...</p> : sortedMissions.map((mission) => (
              <div key={mission.id} className="bg-[#0F172A] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-bold truncate">{mission.id}</p>
                  <p className="text-xs text-gray-400 truncate">{mission.title} • XP {mission.xpReward}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editMission(mission)} className="px-3 py-1.5 text-xs rounded bg-white/10 text-white">Изменить</button>
                  <button onClick={() => duplicateMission(mission)} className="px-3 py-1.5 text-xs rounded bg-arcade-primary/20 text-arcade-primary">Копия</button>
                  <button onClick={() => removeMission(mission.id)} className="px-3 py-1.5 text-xs rounded bg-red-500/20 text-red-300 flex items-center gap-1"><Trash2 size={12} /> Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
