import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Save, Trash2, RefreshCw } from 'lucide-react';
import { APP_LANGUAGE } from '../constants';
import { apiDelete, apiGet, apiPost, apiPut } from '../api';

type Tab = 'courses' | 'missions';

interface AdminPanelProps {
  isAdmin: boolean;
}

const THEORY_HINT_PREFIX = '__THEORY__:';

const getEmptyCourseForm = (isKz: boolean) => ({
  title: '',
  description: '',
  totalLessons: 5,
  icon: 'Terminal',
  color: 'text-arcade-success',
  difficulty: isKz ? 'Орташа' : 'Средний',
  isBoss: false,
  locked: true,
});

const getEmptyMissionForm = (isKz: boolean) => ({
  id: '',
  title: '',
  chapter: isKz ? 'Бөлім 1' : 'Глава 1',
  description: '',
  difficulty: isKz ? 'Орташа' : 'Средний',
  xpReward: 50,
  starterCode: isKz ? 'print("Сәлем, PyPath")\n' : 'print("Привет, PyPath")\n',
  expectedOutput: isKz ? 'Сәлем, PyPath' : 'Привет, PyPath',
  theoryText: isKz ? 'Оқушыға не істеу керек және не үшін маңызды екенін түсіндіріңіз.' : 'Объясните ученику, что нужно сделать и почему это важно.',
  hintsText: isKz ? 'Шегіністерді тексеріңіз\nКодты қайта іске қосыңыз' : 'Проверьте отступы\nЗапустите код ещё раз',
  objectivesText: isKz ? 'Консольге сәлемдесуді шығарыңыз' : 'Выведите приветствие в консоль',
});

export const AdminPanel: React.FC<AdminPanelProps> = ({ isAdmin }) => {
  const isKz = APP_LANGUAGE === 'kz';
  const emptyCourseForm = getEmptyCourseForm(isKz);
  const emptyMissionForm = getEmptyMissionForm(isKz);
  const t = {
    accessDenied: isKz ? 'Қолжетімділік шектелген' : 'Доступ запрещён',
    onlyAdmins: isKz ? 'Бұл бөлім тек әкімшілерге қолжетімді.' : 'Этот раздел доступен только администраторам.',
    title: isKz ? 'Әкім панелі' : 'Админка',
    subtitle: isKz ? 'Курстар мен тапсырмаларды басқару' : 'Простое управление курсами и заданиями',
    refresh: isKz ? 'Жаңарту' : 'Обновить',
    courses: isKz ? 'Курстар' : 'Курсы',
    missions: isKz ? 'Тапсырмалар' : 'Задания',
    save: isKz ? 'Сақтау' : 'Сохранить',
    clear: isKz ? 'Тазалау' : 'Очистить',
    edit: isKz ? 'Өңдеу' : 'Изменить',
    copy: isKz ? 'Көшірме' : 'Копия',
    delete: isKz ? 'Жою' : 'Удалить',
    loading: isKz ? 'Жүктеу...' : 'Загрузка...',
    courseList: isKz ? 'Курс тізімі' : 'Список курсов',
    missionList: isKz ? 'Тапсырмалар тізімі' : 'Список заданий',
    lessonWord: isKz ? 'сабақ' : 'уроков',
    locked: isKz ? 'Жабық' : 'Locked',
    open: isKz ? 'Ашық' : 'Open',
    createCourse: isKz ? 'Курс құру' : 'Создать курс',
    editCourse: isKz ? 'Курсты өңдеу' : 'Редактировать курс',
    createMission: isKz ? 'Тапсырма құру' : 'Создать задание',
    editMission: isKz ? 'Тапсырманы өңдеу' : 'Редактировать задание',
    courseName: isKz ? 'Атауы' : 'Название',
    courseDescription: isKz ? 'Сипаттама' : 'Описание',
    difficulty: isKz ? 'Қиындық' : 'Сложность',
    icon: isKz ? 'Белгіше (Terminal)' : 'Иконка (Terminal)',
    color: isKz ? 'Түс (text-arcade-success)' : 'Цвет (text-arcade-success)',
    finalCourse: isKz ? 'Финалдық курс' : 'Финальный курс',
    hiddenForStudents: isKz ? 'Оқушылардан жасыру' : 'Скрыть для учеников',
    missionId: isKz ? 'Тапсырма ID' : 'ID задания',
    chapter: isKz ? 'Бөлім' : 'Глава',
    applyExample: isKz ? 'Үлгі қою' : 'Подставить пример',
    theoryForStudent: isKz ? 'Оқушыға теория (не және не үшін)' : 'Теория для ученика (что и почему нужно сделать)',
    starterCode: isKz ? 'Бастапқы код' : 'Код-заготовка',
    expectedOutput: isKz ? 'Күтілетін мәтін (мысалы: Сәлем)' : 'Ожидаемый текст в выводе (например: Привет)',
    missionGoals: isKz ? 'Тапсырма мақсаттары (әр жолға біреуден)' : 'Цели задания (каждая с новой строки)',
    studentHints: isKz ? 'Оқушыға кеңестер (әр жолға біреуден)' : 'Подсказки ученику (каждая с новой строки)',
    missionCheckInfo: isKz ? 'Тексеру күтілетін мәтін мен кодтың қатесіз іске қосылуына негізделеді.' : 'Проверка задания будет идти по ожидаемому тексту в выводе и по факту запуска без ошибок.',
    xpLabel: 'XP',
    courseUpdated: isKz ? 'Курс жаңартылды' : 'Курс обновлён',
    courseCreated: isKz ? 'Курс құрылды' : 'Курс создан',
    enterCourseName: isKz ? 'Курс атауын енгізіңіз' : 'Введите название курса',
    enterCourseDescription: isKz ? 'Курс сипаттамасын енгізіңіз' : 'Введите описание курса',
    cannotSaveCourse: isKz ? 'Курсты сақтау мүмкін болмады' : 'Не удалось сохранить курс',
    courseDeleted: isKz ? 'Курс жойылды' : 'Курс удалён',
    cannotDeleteCourse: isKz ? 'Курсты жою мүмкін болмады' : 'Не удалось удалить курс',
    missionUpdated: isKz ? 'Тапсырма жаңартылды' : 'Миссия обновлена',
    missionCreated: isKz ? 'Тапсырма құрылды' : 'Миссия создана',
    enterMissionId: isKz ? 'Тапсырма ID енгізіңіз' : 'Введите ID задания',
    enterMissionName: isKz ? 'Тапсырма атауын енгізіңіз' : 'Введите название задания',
    enterMissionDescription: isKz ? 'Тапсырма сипаттамасын енгізіңіз' : 'Введите описание задания',
    cannotSaveMission: isKz ? 'Тапсырманы сақтау мүмкін болмады' : 'Не удалось сохранить миссию',
    missionDeleted: isKz ? 'Тапсырма жойылды' : 'Миссия удалена',
    cannotDeleteMission: isKz ? 'Тапсырманы жою мүмкін болмады' : 'Не удалось удалить миссию',
    demoApplied: isKz ? 'Дайын үлгі қойылды' : 'Готовый пример подставлен',
    duplicateCourseCreated: isKz ? 'Курс көшірмесі формаға қойылды. Өрістерді тексеріп, сақтаңыз.' : 'Копия курса создана в форме. Проверьте поля и сохраните.',
    duplicateMissionCreated: isKz ? 'Тапсырма көшірмесі жасалды. ID тексеріп, сақтаңыз.' : 'Копия задания создана. Проверьте ID и сохраните.',
  };
  const formFieldClass = 'w-full bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-arcade-primary focus:outline-none shadow-inner transition-colors placeholder-slate-500 dark:placeholder-slate-400';
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

  const splitHintsAndTheory = (hints: any[]) => {
    const normalizedHints = (hints || []).filter(Boolean).map((item) => String(item));
    const theoryMeta = normalizedHints.find((item) => item.startsWith(THEORY_HINT_PREFIX));
    const theoryText = theoryMeta ? theoryMeta.replace(THEORY_HINT_PREFIX, '').trim() : '';
    const plainHints = normalizedHints.filter((item) => !item.startsWith(THEORY_HINT_PREFIX));
    return { theoryText, plainHints };
  };

  const buildMissionPayload = () => {
    const expectedOutput = missionForm.expectedOutput.trim();
    const objectiveLines = normalizeLines(missionForm.objectivesText);
    const hints = normalizeLines(missionForm.hintsText);
    const theoryText = missionForm.theoryText.trim();

    const serializedHints = theoryText
      ? [`${THEORY_HINT_PREFIX}${theoryText}`, ...hints]
      : hints;

    const objectives = objectiveLines.length
      ? objectiveLines.map((text) => ({ text, testCaseId: expectedOutput ? 'tc_output' : undefined }))
      : expectedOutput
        ? [{ text: isKz ? `Консольге шығарыңыз: ${expectedOutput}` : `Выведите в консоль: ${expectedOutput}`, testCaseId: 'tc_output' }]
        : [];

    const testCases: any[] = [
      {
        id: 'tc_runtime',
        type: 'returncode_equals',
        value: 0,
        label: isKz ? 'Код қатесіз іске қосылады' : 'Код запускается без ошибок',
      },
    ];

    if (expectedOutput) {
      testCases.unshift({
        id: 'tc_output',
        type: 'output_contains',
        value: expectedOutput,
        label: isKz ? `Нәтижеде бар: ${expectedOutput}` : `Вывод содержит: ${expectedOutput}`,
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
      hints: serializedHints,
      objectives,
      testCases,
    };
  };

  const applyDemoMissionTemplate = () => {
    setMissionForm((prev) => ({
      ...prev,
      chapter: isKz ? 'Бөлім 1' : 'Глава 1',
      difficulty: isKz ? 'Жеңіл' : 'Лёгкий',
      title: prev.title || (isKz ? 'Бірінші тапсырма' : 'Первое задание'),
      description: prev.description || (isKz ? 'Код жазып, консольде қажетті нәтижені алыңыз.' : 'Напишите код и получите нужный вывод в консоли.'),
      starterCode: isKz ? 'def main():\n    print("Сәлем, PyPath")\n\nmain()\n' : 'def main():\n    print("Привет, PyPath")\n\nmain()\n',
      expectedOutput: isKz ? 'Сәлем, PyPath' : 'Привет, PyPath',
      theoryText: isKz ? 'Функция кодты реттеуге көмектеседі. Бұл тапсырмада функция құрып, оны шақырыңыз.' : 'Функция помогает организовать код. В этом задании создайте функцию и вызовите её.',
      hintsText: isKz ? 'main функциясын жасаңыз\nФункцияны файл соңында шақырыңыз' : 'Создайте функцию main\nВызовите функцию в конце файла',
      objectivesText: isKz ? 'Консольге сәлемдесу шығарыңыз\nБағдарламаны қатесіз іске қосыңыз' : 'Выведите приветствие в консоль\nЗапустите программу без ошибок',
    }));
    showMessage(t.demoApplied);
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
        throw new Error(t.enterCourseName);
      }
      if (!payload.description) {
        throw new Error(t.enterCourseDescription);
      }

      if (editingCourseId) {
        await apiPut(`/courses/${editingCourseId}`, payload);
        showMessage(t.courseUpdated);
      } else {
        await apiPost('/courses', payload);
        showMessage(t.courseCreated);
      }
      setCourseForm(emptyCourseForm);
      setEditingCourseId(null);
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || t.cannotSaveCourse);
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
      difficulty: course.difficulty || (isKz ? 'Орташа' : 'Средний'),
      isBoss: Boolean(course.isBoss),
      locked: Boolean(course.locked),
    });
  };

  const duplicateCourse = (course: any) => {
    setEditingCourseId(null);
    setCourseForm({
      title: `${course.title || (isKz ? 'Жаңа курс' : 'Новый курс')} (${isKz ? 'көшірме' : 'копия'})`,
      description: course.description || '',
      totalLessons: Number(course.totalLessons || 1),
      icon: course.icon || 'Terminal',
      color: course.color || 'text-arcade-success',
      difficulty: course.difficulty || (isKz ? 'Орташа' : 'Средний'),
      isBoss: Boolean(course.isBoss),
      locked: true,
    });
    showMessage(t.duplicateCourseCreated);
  };

  const removeCourse = async (id: number) => {
    setSaving(true);
    try {
      await apiDelete(`/courses/${id}`);
      showMessage(t.courseDeleted);
      if (editingCourseId === id) {
        setEditingCourseId(null);
        setCourseForm(emptyCourseForm);
      }
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || t.cannotDeleteCourse);
    } finally {
      setSaving(false);
    }
  };

  const submitMission = async () => {
    setSaving(true);
    try {
      const payload = buildMissionPayload();

      if (!editingMissionId && !payload.id) {
        throw new Error(t.enterMissionId);
      }
      if (!payload.title) {
        throw new Error(t.enterMissionName);
      }
      if (!payload.description) {
        throw new Error(t.enterMissionDescription);
      }

      if (editingMissionId) {
        await apiPut(`/missions/${editingMissionId}`, payload);
        showMessage(t.missionUpdated);
      } else {
        await apiPost('/missions', payload);
        showMessage(t.missionCreated);
      }

      setMissionForm(emptyMissionForm);
      setEditingMissionId(null);
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || t.cannotSaveMission);
    } finally {
      setSaving(false);
    }
  };

  const editMission = (mission: any) => {
    const outputCase = (mission.testCases || []).find((testCase: any) => testCase?.type === 'output_contains');
    const { theoryText, plainHints } = splitHintsAndTheory(mission.hints || []);
    setEditingMissionId(String(mission.id));
    setMissionForm({
      id: String(mission.id || ''),
      title: mission.title || '',
      chapter: mission.chapter || (isKz ? 'Бөлім' : 'Глава'),
      description: mission.description || '',
      difficulty: mission.difficulty || (isKz ? 'Орташа' : 'Средний'),
      xpReward: Number(mission.xpReward || 0),
      starterCode: mission.starterCode || (isKz ? 'print("Сәлем, PyPath")\n' : 'print("Привет, PyPath")\n'),
      expectedOutput: String(outputCase?.value || ''),
      theoryText: theoryText || mission.description || '',
      hintsText: plainHints.join('\n'),
      objectivesText: (mission.objectives || []).map((o: any) => o?.text).filter(Boolean).join('\n'),
    });
  };

  const duplicateMission = (mission: any) => {
    const sourceId = String(mission.id || 'mission');
    const duplicatedId = `${sourceId}_copy_${Date.now().toString().slice(-5)}`;
    const outputCase = (mission.testCases || []).find((testCase: any) => testCase?.type === 'output_contains');
    const { theoryText, plainHints } = splitHintsAndTheory(mission.hints || []);

    setEditingMissionId(null);
    setMissionForm({
      id: duplicatedId,
      title: `${mission.title || sourceId} (${isKz ? 'көшірме' : 'копия'})`,
      chapter: mission.chapter || (isKz ? 'Бөлім' : 'Глава'),
      description: mission.description || '',
      difficulty: mission.difficulty || (isKz ? 'Орташа' : 'Средний'),
      xpReward: Number(mission.xpReward || 0),
      starterCode: mission.starterCode || (isKz ? 'print("Сәлем, PyPath")\n' : 'print("Привет, PyPath")\n'),
      expectedOutput: String(outputCase?.value || ''),
      theoryText: theoryText || mission.description || '',
      hintsText: plainHints.join('\n'),
      objectivesText: (mission.objectives || []).map((o: any) => o?.text).filter(Boolean).join('\n'),
    });

    showMessage(t.duplicateMissionCreated);
  };

  const removeMission = async (id: string) => {
    setSaving(true);
    try {
      await apiDelete(`/missions/${id}`);
      showMessage(t.missionDeleted);
      if (editingMissionId === id) {
        setEditingMissionId(null);
        setMissionForm(emptyMissionForm);
      }
      await loadData();
    } catch (e: any) {
      showMessage(e?.message || t.cannotDeleteMission);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#1E293B] border border-red-300 dark:border-red-500/30 rounded-3xl shadow-2xl p-6 text-center animate-float-up">
          <ShieldAlert className="mx-auto mb-3 text-red-400" />
          <h2 className="text-slate-900 dark:text-white text-xl font-black mb-2">{t.accessDenied}</h2>
          <p className="text-slate-600 dark:text-gray-400">{t.onlyAdmins}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pt-6 pb-24 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm">{t.subtitle}</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
        >
          <RefreshCw size={16} /> {t.refresh}
        </button>
      </div>

      {message && (
        <div className="bg-arcade-primary/10 border border-arcade-primary/40 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 dark:text-white">
          {message}
        </div>
      )}

      <div className="flex gap-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'courses' ? 'bg-arcade-primary text-white' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          {t.courses}
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === 'missions' ? 'bg-arcade-primary text-white' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          {t.missions}
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 space-y-4 animate-float-up">
            <h3 className="text-slate-900 dark:text-white font-bold">{editingCourseId ? `${t.editCourse} #${editingCourseId}` : t.createCourse}</h3>
            <input className={formFieldClass} placeholder={t.courseName} value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className={`${formFieldClass} min-h-24`} placeholder={t.courseDescription} value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className={formFieldClass} type="number" min={1} value={courseForm.totalLessons} onChange={(e) => setCourseForm((p) => ({ ...p, totalLessons: Number(e.target.value) }))} />
              <input className={formFieldClass} placeholder={t.difficulty} value={courseForm.difficulty} onChange={(e) => setCourseForm((p) => ({ ...p, difficulty: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={formFieldClass} placeholder={t.icon} value={courseForm.icon} onChange={(e) => setCourseForm((p) => ({ ...p, icon: e.target.value }))} />
              <input className={formFieldClass} placeholder={t.color} value={courseForm.color} onChange={(e) => setCourseForm((p) => ({ ...p, color: e.target.value }))} />
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-gray-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={courseForm.isBoss} onChange={(e) => setCourseForm((p) => ({ ...p, isBoss: e.target.checked }))} /> {t.finalCourse}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={courseForm.locked} onChange={(e) => setCourseForm((p) => ({ ...p, locked: e.target.checked }))} /> {t.hiddenForStudents}</label>
            </div>
            <div className="flex gap-3">
              <button onClick={submitCourse} disabled={saving} className="px-4 py-2 rounded-lg bg-arcade-primary text-white font-bold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> {t.save}</button>
              {editingCourseId && <button onClick={() => { setEditingCourseId(null); setCourseForm(emptyCourseForm); }} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 dark:text-white">{t.clear}</button>}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar animate-float-up">
            <h3 className="text-slate-900 dark:text-white font-bold">{t.courseList} ({courses.length})</h3>
            {loading ? <p className="text-slate-500 dark:text-gray-400">{t.loading}</p> : courses.map((course) => (
              <div key={course.id} className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-slate-900 dark:text-white font-bold">#{course.id} {course.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">{course.difficulty} • {course.totalLessons} {t.lessonWord} • {course.locked ? t.locked : t.open}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editCourse(course)} className="px-3 py-1.5 text-xs rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 dark:text-white">{t.edit}</button>
                  <button onClick={() => duplicateCourse(course)} className="px-3 py-1.5 text-xs rounded bg-arcade-primary/20 text-arcade-primary">{t.copy}</button>
                  <button onClick={() => removeCourse(course.id)} className="px-3 py-1.5 text-xs rounded bg-red-500/20 text-red-300 flex items-center gap-1"><Trash2 size={12} /> {t.delete}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 space-y-4 animate-float-up">
            <h3 className="text-slate-900 dark:text-white font-bold">{editingMissionId ? `${t.editMission} ${editingMissionId}` : t.createMission}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className={formFieldClass} placeholder={t.missionId} value={missionForm.id} disabled={Boolean(editingMissionId)} onChange={(e) => setMissionForm((p) => ({ ...p, id: e.target.value }))} />
              <input className={formFieldClass} placeholder={t.xpLabel} type="number" value={missionForm.xpReward} onChange={(e) => setMissionForm((p) => ({ ...p, xpReward: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={formFieldClass} placeholder={t.chapter} value={missionForm.chapter} onChange={(e) => setMissionForm((p) => ({ ...p, chapter: e.target.value }))} />
              <input className={formFieldClass} placeholder={t.difficulty} value={missionForm.difficulty} onChange={(e) => setMissionForm((p) => ({ ...p, difficulty: e.target.value }))} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={applyDemoMissionTemplate} type="button" className="px-3 py-1.5 text-xs rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 dark:text-white">{t.applyExample}</button>
            </div>
            <input className={formFieldClass} placeholder={t.courseName} value={missionForm.title} onChange={(e) => setMissionForm((p) => ({ ...p, title: e.target.value }))} />
            <textarea className={`${formFieldClass} min-h-20`} placeholder={t.courseDescription} value={missionForm.description} onChange={(e) => setMissionForm((p) => ({ ...p, description: e.target.value }))} />
            <textarea className={`${formFieldClass} min-h-20`} placeholder={t.theoryForStudent} value={missionForm.theoryText} onChange={(e) => setMissionForm((p) => ({ ...p, theoryText: e.target.value }))} />
            <textarea className={`${formFieldClass} min-h-24 font-mono text-xs`} placeholder={t.starterCode} value={missionForm.starterCode} onChange={(e) => setMissionForm((p) => ({ ...p, starterCode: e.target.value }))} />
            <input className={formFieldClass} placeholder={t.expectedOutput} value={missionForm.expectedOutput} onChange={(e) => setMissionForm((p) => ({ ...p, expectedOutput: e.target.value }))} />
            <textarea className={`${formFieldClass} min-h-16`} placeholder={t.missionGoals} value={missionForm.objectivesText} onChange={(e) => setMissionForm((p) => ({ ...p, objectivesText: e.target.value }))} />
            <textarea className={`${formFieldClass} min-h-16`} placeholder={t.studentHints} value={missionForm.hintsText} onChange={(e) => setMissionForm((p) => ({ ...p, hintsText: e.target.value }))} />
            <p className="text-xs text-slate-500 dark:text-gray-400">{t.missionCheckInfo}</p>
            <div className="flex gap-3">
              <button onClick={submitMission} disabled={saving} className="px-4 py-2 rounded-lg bg-arcade-primary text-white font-bold flex items-center gap-2 disabled:opacity-50"><Save size={16} /> {t.save}</button>
              {editingMissionId && <button onClick={() => { setEditingMissionId(null); setMissionForm(emptyMissionForm); }} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 dark:text-white">{t.clear}</button>}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar animate-float-up">
            <h3 className="text-slate-900 dark:text-white font-bold">{t.missionList} ({sortedMissions.length})</h3>
            {loading ? <p className="text-slate-500 dark:text-gray-400">{t.loading}</p> : sortedMissions.map((mission) => (
              <div key={mission.id} className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white font-bold truncate">{mission.id}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{mission.title} • {t.xpLabel} {mission.xpReward}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editMission(mission)} className="px-3 py-1.5 text-xs rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 dark:text-white">{t.edit}</button>
                  <button onClick={() => duplicateMission(mission)} className="px-3 py-1.5 text-xs rounded bg-arcade-primary/20 text-arcade-primary">{t.copy}</button>
                  <button onClick={() => removeMission(mission.id)} className="px-3 py-1.5 text-xs rounded bg-red-500/20 text-red-300 flex items-center gap-1"><Trash2 size={12} /> {t.delete}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
