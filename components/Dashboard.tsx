import React from 'react';
import { TrendingUp, Bot, ChevronRight, Zap, Bug, PlayCircle } from 'lucide-react';
import { COURSES, getIcon, CURRENT_USER } from '../constants';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2 text-white">С возвращением, Программист!</h1>
        <p className="text-py-muted">Продолжайте обучение с того места, где остановились вчера.</p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Daily Progress */}
        <div className="bg-py-surface/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex items-center gap-6">
          <div className="relative size-24 shrink-0 flex items-center justify-center">
             {/* Simple CSS Conic Gradient for Circular Progress */}
            <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(#0df259 75%, #283928 0)' }}></div>
            <div className="bg-py-surface absolute inset-2 rounded-full flex flex-col items-center justify-center z-10">
               <span className="text-xl font-bold text-white">{CURRENT_USER.streak}</span>
               <span className="text-[10px] text-py-muted uppercase tracking-wider">ДНЕЙ</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-py-muted">Серия дней</p>
            <h3 className="text-xl font-bold text-white">Почти у цели!</h3>
            <p className="text-xs text-py-green mt-1 flex items-center gap-1">
              <TrendingUp size={14} />
              <span>на 15% выше среднего</span>
            </p>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="col-span-1 md:col-span-2 relative overflow-hidden bg-py-green rounded-2xl p-6 text-py-dark group cursor-pointer transition-transform hover:scale-[1.01]">
          <div className="relative z-10 flex h-full items-center justify-between">
            <div className="max-w-md">
              <span className="bg-py-dark/90 text-py-green text-[10px] font-bold uppercase px-2 py-1 rounded-md mb-2 inline-block shadow-lg">Рекомендация ИИ</span>
              <h3 className="text-2xl font-black mb-1">Мастер F-строк</h3>
              <p className="text-sm font-bold opacity-80 mb-4">Этот метод форматирования ускорит ваш код и сделает его чище.</p>
              <button className="bg-py-dark text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-black transition-colors">Начать урок</button>
            </div>
            <div className="opacity-30 group-hover:opacity-40 transition-opacity">
              <Bot size={120} />
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Решено задач', value: '154', sub: '+12 сегодня', subColor: 'text-py-green' },
          { label: 'Мировой рейтинг', value: `#${CURRENT_USER.rank}`, sub: '↑ 3 позиции', subColor: 'text-py-green' },
          { label: 'Всего XP', value: CURRENT_USER.xp.toLocaleString(), sub: 'Уровень 14', subColor: 'text-py-muted' }
        ].map((stat, i) => (
          <div key={i} className="bg-py-accent/30 border border-py-accent p-5 rounded-xl hover:bg-py-accent/50 transition-colors">
            <p className="text-py-muted text-sm mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className={`text-xs font-bold ${stat.subColor}`}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Текущие курсы</h2>
            <button className="text-py-green text-sm font-bold hover:underline">Все</button>
          </div>
          <div className="space-y-4">
            {COURSES.slice(0, 2).map((course) => (
              <div key={course.id} className="bg-py-surface/40 border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:bg-white/5 transition-all cursor-pointer group">
                <div className={`size-16 rounded-xl bg-py-dark flex items-center justify-center ${course.color} bg-opacity-20`}>
                  {getIcon(course.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-1 text-white group-hover:text-py-green transition-colors">{course.title}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-py-accent rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${course.color.replace('text', 'bg')}`} style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="text-xs text-py-muted font-mono">{course.progress}%</span>
                  </div>
                </div>
                <div className="group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="text-py-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Practice */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Быстрая практика</h2>
          </div>
          <div className="bg-py-accent/20 rounded-2xl p-6 border border-py-accent">
            <div className="space-y-5">
              {[
                { title: 'Блиц-опрос', desc: '10 вопросов по List Comprehension', icon: Zap },
                { title: 'Найди баг', desc: 'Отладка скрипта скрапинга', icon: Bug },
                { title: 'Ежедневный вызов', desc: 'Алгоритм сортировки (Средний)', icon: PlayCircle },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group cursor-pointer">
                  <div className="mt-1 size-8 rounded-lg bg-py-green/10 flex items-center justify-center text-py-green group-hover:bg-py-green group-hover:text-py-dark transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-py-green transition-colors">{item.title}</h5>
                    <p className="text-xs text-py-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 py-3 border border-py-green/40 text-py-green rounded-xl text-sm font-bold hover:bg-py-green hover:text-py-dark transition-colors">
                Открыть песочницу
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};