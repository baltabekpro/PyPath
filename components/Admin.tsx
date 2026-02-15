import React, { useState } from 'react';
import { 
  Shield, Users, BookOpen, TrendingUp, MessageSquare, Award, 
  Edit, Trash2, Plus, Search, Filter, CheckCircle, 
  XCircle, Lock, Unlock, Eye, BarChart3, Activity, UserPlus,
  Download, RefreshCw, AlertTriangle, Clock,
  CheckSquare, Square, ChevronLeft, ChevronRight, X,
  Calendar, Zap, Target, ArrowUpDown, ArrowUp, ArrowDown,
  UserCog
} from 'lucide-react';
import { COURSES, LEADERBOARD, POSTS, ACHIEVEMENTS } from '../constants';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

type AdminTab = 'overview' | 'users' | 'courses' | 'posts' | 'achievements';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  status: 'active' | 'inactive' | 'banned';
  role: 'user' | 'admin';
  registeredDate: string;
}

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<'name' | 'email' | 'level' | 'xp' | 'streak'>('xp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Array<{id: number, type: 'success' | 'warning' | 'error', message: string}>>([]);
  const [adminLogs, setAdminLogs] = useState<Array<{id: number, action: string, timestamp: string, user: string}>>([
    { id: 1, action: 'Изменен статус пользователя CyberNinja на inactive', timestamp: '2024-02-16 14:23', user: 'Neo_Coder' },
    { id: 2, action: 'Создан новый курс "Глава 9: ИИ и ML"', timestamp: '2024-02-16 13:15', user: 'Neo_Coder' },
    { id: 3, action: 'Удален пост #42', timestamp: '2024-02-16 12:05', user: 'Neo_Coder' },
  ]);
  
  // Mock data для пользователей (в реальности это данные из БД)
  const [users, setUsers] = useState<User[]>([
    { 
      id: 'u_1337', 
      name: 'Neo_Coder', 
      email: 'neo@matrix.com', 
      level: 5, 
      xp: 450, 
      streak: 12, 
      status: 'active', 
      role: 'admin',
      registeredDate: '2024-01-15'
    },
    ...LEADERBOARD.slice(0, 8).map((user, idx) => ({
      id: `u_${1000 + idx}`,
      name: user.name,
      email: `${user.name.toLowerCase()}@pypath.dev`,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      status: 'active' as const,
      role: 'user' as const,
      registeredDate: `2024-${String(idx + 1).padStart(2, '0')}-20`
    }))
  ]);

  const [courses, setCourses] = useState(COURSES);
  const [posts, setPosts] = useState(POSTS);
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);

  // Данные для графиков
  const userGrowthData = [
    { month: 'Янв', users: 120 },
    { month: 'Фев', users: 145 },
    { month: 'Мар', users: 189 },
    { month: 'Апр', users: 234 },
    { month: 'Май', users: 298 },
    { month: 'Июн', users: 356 },
    { month: 'Июл', users: 423 },
  ];

  const activityData = [
    { day: 'Пн', active: 45, total: 120 },
    { day: 'Вт', active: 52, total: 125 },
    { day: 'Ср', active: 48, total: 130 },
    { day: 'Чт', active: 61, total: 135 },
    { day: 'Пт', active: 55, total: 140 },
    { day: 'Сб', active: 32, total: 145 },
    { day: 'Вс', active: 28, total: 150 },
  ];

  const courseCompletionData = [
    { name: 'Завершено', value: 345, color: '#4ade80' },
    { name: 'В процессе', value: 189, color: '#60a5fa' },
    { name: 'Не начато', value: 78, color: '#94a3b8' },
  ];

  // Статистика
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalCourses: courses.length,
    totalXp: users.reduce((sum, u) => sum + u.xp, 0),
    avgXpPerUser: Math.round(users.reduce((sum, u) => sum + u.xp, 0) / users.length),
    newUsersToday: 5,
    activeNow: 12,
  };

  // Handlers
  const addLog = (action: string) => {
    const newLog = {
      id: adminLogs.length + 1,
      action,
      timestamp: new Date().toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      user: 'Neo_Coder'
    };
    setAdminLogs([newLog, ...adminLogs]);
  };

  const handleUserStatusToggle = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: newStatus }
        : u
    ));
    addLog(`Изменен статус пользователя ${user.name} на ${newStatus}`);
    showNotification('success', `Статус пользователя ${user.name} изменен на ${newStatus}`);
  };

  const handleUserRoleToggle = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, role: newRole }
        : u
    ));
    addLog(`Изменена роль пользователя ${user.name} на ${newRole}`);
    showNotification('success', `Роль пользователя ${user.name} изменена на ${newRole}`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    setUsers(users.filter(u => u.id !== userId));
    addLog(`Удален пользователь ${user.name}`);
    showNotification('warning', `Пользователь ${user.name} удален`);
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;
    
    if (action === 'delete') {
      if (!confirm(`Вы уверены, что хотите удалить ${selectedUsers.length} пользователей?`)) return;
      setUsers(users.filter(u => !selectedUsers.includes(u.id)));
      addLog(`Удалено пользователей: ${selectedUsers.length}`);
      showNotification('warning', `Удалено пользователей: ${selectedUsers.length}`);
    } else {
      const newStatus = action === 'activate' ? 'active' : 'inactive';
      setUsers(users.map(u => 
        selectedUsers.includes(u.id) ? { ...u, status: newStatus as any } : u
      ));
      addLog(`Массовое изменение статуса ${selectedUsers.length} пользователей на ${newStatus}`);
      showNotification('success', `Статус изменен у ${selectedUsers.length} пользователей`);
    }
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const dataToExport = getFilteredUsers();
    
    if (format === 'json') {
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `users_export_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else {
      const headers = ['ID', 'Name', 'Email', 'Level', 'XP', 'Status', 'Role', 'Registered'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(u => [
          u.id, u.name, u.email, u.level, u.xp, u.status, u.role, u.registeredDate
        ].join(','))
      ].join('\n');
      
      const dataUri = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    addLog(`Экспортировано ${dataToExport.length} пользователей в формате ${format.toUpperCase()}`);
  };

  const getFilteredUsers = () => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const getPaginatedUsers = () => {
    const filtered = getFilteredUsers();
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const showNotification = (type: 'success' | 'warning' | 'error', message: string) => {
    const newNotification = {
      id: Date.now(),
      type,
      message
    };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 3000);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({...user});
    setShowEditModal(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    addLog(`Обновлены данные пользователя ${editingUser.name}`);
    showNotification('success', `Пользователь ${editingUser.name} успешно обновлен`);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const totalPages = Math.ceil(getFilteredUsers().length / itemsPerPage);

  const handleCourseToggleLock = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    setCourses(courses.map(c => 
      c.id === courseId ? { ...c, locked: !c.locked } : c
    ));
    addLog(`${course.locked ? 'Разблокирован' : 'Заблокирован'} курс "${course.title}"`);
  };

  const handleDeleteCourse = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !confirm('Вы уверены, что хотите удалить этот курс?')) return;
    
    setCourses(courses.filter(c => c.id !== courseId));
    addLog(`Удален курс "${course.title}"`);
  };

  const handleDeletePost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !confirm('Вы уверены, что хотите удалить этот пост?')) return;
    
    setPosts(posts.filter(p => p.id !== postId));
    addLog(`Удален пост #${postId} от ${post.author.name}`);
  };

  const handleDeleteAchievement = (achievementId: number) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || !confirm('Вы уверены, что хотите удалить это достижение?')) return;
    
    setAchievements(achievements.filter(a => a.id !== achievementId));
    addLog(`Удалено достижение "${achievement.title}"`);
  };

  // Tab content
  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 className="text-py-green" size={28} />
        Обзор системы
      </h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-py-surface border border-py-accent rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Всего пользователей</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
              <p className="text-green-400 text-xs mt-1">+{stats.newUsersToday} сегодня</p>
            </div>
            <Users className="text-blue-400" size={40} />
          </div>
        </div>

        <div className="bg-py-surface border border-py-accent rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Активных сейчас</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeNow}</p>
              <p className="text-gray-400 text-xs mt-1">онлайн</p>
            </div>
            <Activity className="text-green-400" size={40} />
          </div>
        </div>

        <div className="bg-py-surface border border-py-accent rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Всего курсов</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalCourses}</p>
              <p className="text-gray-400 text-xs mt-1">опубликовано</p>
            </div>
            <BookOpen className="text-purple-400" size={40} />
          </div>
        </div>

        <div className="bg-py-surface border border-py-accent rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Средний XP</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.avgXpPerUser}</p>
              <p className="text-gray-400 text-xs mt-1">на пользователя</p>
            </div>
            <TrendingUp className="text-yellow-400" size={40} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* User Growth Chart */}
        <div className="bg-py-surface border border-py-accent rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Рост пользователей</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="users" stroke="#4ade80" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Chart */}
        <div className="bg-py-surface border border-py-accent rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Активность за неделю</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Bar dataKey="active" fill="#60a5fa" name="Активные" />
              <Bar dataKey="total" fill="#94a3b8" name="Всего" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Course Completion Pie */}
        <div className="bg-py-surface border border-py-accent rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Завершение курсов</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={courseCompletionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {courseCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-sm mt-2">
            {courseCompletionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-py-surface border border-py-accent rounded-lg p-6 md:col-span-2">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-py-green" />
            Последняя активность
          </h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            <div className="flex items-start gap-3 pb-3 border-b border-py-accent">
              <UserPlus className="text-green-400 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-white text-sm">Новый пользователь: <span className="text-py-green font-semibold">AlexCoder_99</span></p>
                <p className="text-gray-400 text-xs">2 минуты назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-py-accent">
              <CheckCircle className="text-blue-400 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-white text-sm">Курс завершен: <span className="text-blue-400 font-semibold">Python Basics</span></p>
                <p className="text-gray-400 text-xs">15 минут назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-py-accent">
              <MessageSquare className="text-yellow-400 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-white text-sm">Новый пост от: <span className="text-yellow-400 font-semibold">DevMaster</span></p>
                <p className="text-gray-400 text-xs">30 минут назад</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="text-purple-400 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-white text-sm">Достижение: <span className="text-purple-400 font-semibold">Воин Кода</span></p>
                <p className="text-gray-400 text-xs">1 час назад</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Logs */}
      <div className="bg-py-surface border border-py-accent rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-py-green" />
          Журнал действий администратора
        </h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {adminLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm p-2 hover:bg-py-dark/30 rounded">
              <AlertTriangle className="text-py-green flex-shrink-0 mt-0.5" size={16} />
              <div className="flex-1">
                <p className="text-white">{log.action}</p>
                <p className="text-gray-400 text-xs">{log.timestamp} • {log.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const paginatedUsers = getPaginatedUsers();
    const filteredUsersCount = getFilteredUsers().length;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-py-green" size={28} />
            Управление пользователями
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => exportData('json')}
              className="px-3 py-2 bg-py-surface border border-py-accent rounded-lg text-gray-400 hover:text-py-green hover:border-py-green flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              JSON
            </button>
            <button 
              onClick={() => exportData('csv')}
              className="px-3 py-2 bg-py-surface border border-py-accent rounded-lg text-gray-400 hover:text-py-green hover:border-py-green flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              CSV
            </button>
            <button className="px-4 py-2 bg-py-green text-py-dark rounded-lg hover:bg-py-green/90 font-semibold flex items-center gap-2">
              <Plus size={18} />
              Добавить
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-py-surface border border-py-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-py-green"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 ${showFilters ? 'bg-py-green text-py-dark' : 'bg-py-surface text-white'} border border-py-accent rounded-lg hover:border-py-green flex items-center gap-2`}
          >
            <Filter size={18} />
            Фильтры
            {(filterRole !== 'all' || filterStatus !== 'all') && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-py-surface border border-py-accent rounded-lg p-4 animate-fade-in">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Роль</label>
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                >
                  <option value="all">Все роли</option>
                  <option value="admin">Администраторы</option>
                  <option value="user">Пользователи</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Статус</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                >
                  <option value="all">Все статусы</option>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                  <option value="banned">Заблокированные</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterRole('all');
                    setFilterStatus('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-gray-400 hover:text-white hover:border-py-green flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Сбросить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-py-green/10 border border-py-green rounded-lg p-4 flex items-center justify-between animate-fade-in">
            <span className="text-white font-semibold">
              Выбрано: {selectedUsers.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm font-semibold"
              >
                Активировать
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 text-sm font-semibold"
              >
                Деактивировать
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm font-semibold"
              >
                Удалить
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30 text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Показано {paginatedUsers.length} из {filteredUsersCount} пользователей</span>
          <span>Всего в системе: {users.length}</span>
        </div>

        {/* Users Table */}
        <div className="bg-py-surface border border-py-accent rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-py-dark/50 border-b border-py-accent">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-py-green"
                    >
                      {selectedUsers.length === getFilteredUsers().length ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-py-green"
                    >
                      Пользователь
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                      {sortField !== 'name' && <ArrowUpDown size={14} className="opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-py-green"
                    >
                      Email
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                      {sortField !== 'email' && <ArrowUpDown size={14} className="opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('level')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-py-green"
                    >
                      Уровень
                      {sortField === 'level' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                      {sortField !== 'level' && <ArrowUpDown size={14} className="opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('xp')}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-py-green"
                    >
                      XP
                      {sortField === 'xp' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                      {sortField !== 'xp' && <ArrowUpDown size={14} className="opacity-30" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Статус</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Роль</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-py-accent hover:bg-py-dark/30">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleUserSelection(user.id)}
                        className="text-gray-400 hover:text-py-green"
                      >
                        {selectedUsers.includes(user.id) ? (
                          <CheckSquare size={18} className="text-py-green" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-py-green to-py-blue flex items-center justify-center text-white font-bold">
                          {user.name[0]}
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-white font-semibold">{user.level}</td>
                    <td className="px-4 py-3 text-py-green font-semibold">{user.xp.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {user.status === 'active' ? 'Активен' : user.status === 'inactive' ? 'Неактивен' : 'Заблокирован'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                        {user.role === 'admin' ? 'Админ' : 'Юзер'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUserStatusToggle(user.id)}
                          className="p-1.5 hover:bg-py-dark rounded text-gray-400 hover:text-py-green"
                          title={user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                        >
                          {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button 
                          onClick={() => handleUserRoleToggle(user.id)}
                          className="p-1.5 hover:bg-py-dark rounded text-gray-400 hover:text-purple-400"
                          title="Изменить роль"
                        >
                          <Shield size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 hover:bg-py-dark rounded text-gray-400 hover:text-blue-400"
                          title="Просмотр"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 hover:bg-py-dark rounded text-gray-400 hover:text-yellow-400"
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 hover:bg-py-dark rounded text-gray-400 hover:text-red-400"
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-py-surface border border-py-accent rounded-lg text-white hover:border-py-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Назад
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg font-semibold ${
                        currentPage === page
                          ? 'bg-py-green text-py-dark'
                          : 'bg-py-surface text-gray-400 hover:text-white border border-py-accent'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-py-surface border border-py-accent rounded-lg text-white hover:border-py-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Вперед
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-py-green" size={28} />
          Управление курсами
        </h2>
        <button className="px-4 py-2 bg-py-green text-py-dark rounded-lg hover:bg-py-green/90 font-semibold flex items-center gap-2">
          <Plus size={18} />
          Создать курс
        </button>
      </div>

      <div className="grid gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-py-surface border border-py-accent rounded-lg p-5 hover:border-py-green transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  {course.locked && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded flex items-center gap-1">
                      <Lock size={12} />
                      Заблокирован
                    </span>
                  )}
                  {course.isBoss && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                      БОСС
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    Уроков: <span className="text-white font-semibold">{course.totalLessons}</span>
                  </span>
                  <span className="text-gray-400">
                    Сложность: <span className="text-py-green font-semibold">{course.difficulty}</span>
                  </span>
                  <span className="text-gray-400">
                    Прогресс: <span className="text-py-blue font-semibold">{course.progress}%</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCourseToggleLock(course.id)}
                  className={`p-2 rounded border ${
                    course.locked 
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  }`}
                  title={course.locked ? 'Разблокировать' : 'Заблокировать'}
                >
                  {course.locked ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
                <button className="p-2 rounded border border-py-accent text-gray-400 hover:text-blue-400 hover:border-blue-400">
                  <Eye size={18} />
                </button>
                <button className="p-2 rounded border border-py-accent text-gray-400 hover:text-yellow-400 hover:border-yellow-400">
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 rounded border border-py-accent text-gray-400 hover:text-red-400 hover:border-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <MessageSquare className="text-py-green" size={28} />
        Модерация постов
      </h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-py-surface border border-py-accent rounded-lg p-5">
            <div className="flex items-start gap-4">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold">{post.author.name}</span>
                  <span className="text-xs text-gray-400">• {post.time}</span>
                  <span className="px-2 py-0.5 bg-py-blue/20 text-py-blue text-xs rounded">
                    Уровень {post.author.level}
                  </span>
                </div>
                <p className="text-gray-300 mb-3">{post.content}</p>
                {post.code && (
                  <pre className="bg-py-dark border border-py-accent rounded p-3 text-sm text-py-green mb-3 overflow-x-auto">
                    <code>{post.code}</code>
                  </pre>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">👍 {post.likes} лайков</span>
                  <span className="text-gray-400">💬 {post.comments} комментариев</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded border border-py-accent text-gray-400 hover:text-green-400 hover:border-green-400">
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded border border-py-accent text-gray-400 hover:text-red-400 hover:border-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="text-py-green" size={28} />
          Управление достижениями
        </h2>
        <button className="px-4 py-2 bg-py-green text-py-dark rounded-lg hover:bg-py-green/90 font-semibold flex items-center gap-2">
          <Plus size={18} />
          Создать достижение
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className={`bg-py-surface border rounded-lg p-5 ${
            achievement.rarity === 'legendary' ? 'border-yellow-500/50' :
            achievement.rarity === 'epic' ? 'border-purple-500/50' :
            achievement.rarity === 'rare' ? 'border-blue-500/50' :
            'border-py-accent'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                    achievement.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    <Award className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{achievement.title}</h3>
                    <span className={`text-xs font-semibold uppercase ${
                      achievement.rarity === 'legendary' ? 'text-yellow-400' :
                      achievement.rarity === 'epic' ? 'text-purple-400' :
                      achievement.rarity === 'rare' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                <p className="text-gray-500 text-xs italic mb-3">"{achievement.flavorText}"</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    XP: <span className="text-py-green font-semibold">+{achievement.xpReward}</span>
                  </span>
                  <span className="text-gray-400">
                    Разблокировано: <span className="text-white font-semibold">{achievement.globalRate}%</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="p-2 rounded border border-py-accent text-gray-400 hover:text-yellow-400 hover:border-yellow-400">
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteAchievement(achievement.id)}
                  className="p-2 rounded border border-py-accent text-gray-400 hover:text-red-400 hover:border-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="text-py-green" size={36} />
          Панель администратора
        </h1>
        <p className="text-gray-400">Управление платформой PyPath</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'bg-py-green text-py-dark'
              : 'bg-py-surface text-gray-400 hover:text-white border border-py-accent'
          }`}
        >
          <BarChart3 size={18} className="inline mr-2" />
          Обзор
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'bg-py-green text-py-dark'
              : 'bg-py-surface text-gray-400 hover:text-white border border-py-accent'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Пользователи
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'courses'
              ? 'bg-py-green text-py-dark'
              : 'bg-py-surface text-gray-400 hover:text-white border border-py-accent'
          }`}
        >
          <BookOpen size={18} className="inline mr-2" />
          Курсы
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'posts'
              ? 'bg-py-green text-py-dark'
              : 'bg-py-surface text-gray-400 hover:text-white border border-py-accent'
          }`}
        >
          <MessageSquare size={18} className="inline mr-2" />
          Посты
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'achievements'
              ? 'bg-py-green text-py-dark'
              : 'bg-py-surface text-gray-400 hover:text-white border border-py-accent'
          }`}
        >
          <Award size={18} className="inline mr-2" />
          Достижения
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'achievements' && renderAchievements()}
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm animate-fade-in flex items-center gap-3 min-w-[300px] ${
              notif.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' :
              notif.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
              'bg-red-500/20 border-red-500 text-red-400'
            }`}
          >
            {notif.type === 'success' ? <CheckCircle size={20} /> :
             notif.type === 'warning' ? <AlertTriangle size={20} /> :
             <XCircle size={20} />}
            <span className="font-medium">{notif.message}</span>
          </div>
        ))}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowUserModal(false)}>
          <div className="bg-py-surface border border-py-accent rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-py-green to-py-blue flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-py-dark rounded-lg text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-py-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <UserCog size={18} />
                    <span className="text-sm">Роль</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold ${
                    selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {selectedUser.role === 'admin' ? <Shield size={14} /> : <Users size={14} />}
                    {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>

                <div className="bg-py-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Activity size={18} />
                    <span className="text-sm">Статус</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold ${
                    selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    selectedUser.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedUser.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {selectedUser.status === 'active' ? 'Активен' : selectedUser.status === 'inactive' ? 'Неактивен' : 'Заблокирован'}
                  </span>
                </div>

                <div className="bg-py-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar size={18} />
                    <span className="text-sm">Дата регистрации</span>
                  </div>
                  <p className="text-white font-semibold">{selectedUser.registeredDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-py-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Target size={18} />
                    <span className="text-sm">Уровень</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{selectedUser.level}</p>
                </div>

                <div className="bg-py-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Zap size={18} />
                    <span className="text-sm">Опыт (XP)</span>
                  </div>
                  <p className="text-3xl font-bold text-py-green">{selectedUser.xp.toLocaleString()}</p>
                </div>

                <div className="bg-py-dark rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Activity size={18} />
                    <span className="text-sm">Streak</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-400">{selectedUser.streak} дней</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  handleEditUser(selectedUser);
                  setShowUserModal(false);
                }}
                className="flex-1 px-4 py-2 bg-py-green text-py-dark rounded-lg hover:bg-py-green/90 font-semibold flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Редактировать
              </button>
              <button
                onClick={() => {
                  handleUserStatusToggle(selectedUser.id);
                  setSelectedUser({...selectedUser, status: selectedUser.status === 'active' ? 'inactive' : 'active'});
                }}
                className="flex-1 px-4 py-2 bg-py-surface border border-py-accent rounded-lg text-white hover:border-py-green font-semibold flex items-center justify-center gap-2"
              >
                {selectedUser.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                {selectedUser.status === 'active' ? 'Деактивировать' : 'Активировать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowEditModal(false)}>
          <div className="bg-py-surface border border-py-accent rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Редактирование пользователя</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-py-dark rounded-lg text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Имя пользователя</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Уровень</label>
                  <input
                    type="number"
                    value={editingUser.level}
                    onChange={(e) => setEditingUser({...editingUser, level: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">XP</label>
                  <input
                    type="number"
                    value={editingUser.xp}
                    onChange={(e) => setEditingUser({...editingUser, xp: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Роль</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'user' | 'admin'})}
                  className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Статус</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value as 'active' | 'inactive' | 'banned'})}
                  className="w-full px-4 py-2 bg-py-dark border border-py-accent rounded-lg text-white focus:outline-none focus:border-py-green"
                >
                  <option value="active">Активен</option>
                  <option value="inactive">Неактивен</option>
                  <option value="banned">Заблокирован</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-py-surface border border-py-accent rounded-lg text-white hover:border-py-green font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-py-green text-py-dark rounded-lg hover:bg-py-green/90 font-semibold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
