import React from 'react';
import { COURSES, getIcon } from '../constants';
import { Lock, Star, Clock } from 'lucide-react';
import { View } from '../types';

interface CoursesProps {
  setView: (view: View) => void;
}

export const Courses: React.FC<CoursesProps> = ({ setView }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
       <div className="flex flex-col gap-2">
           <h1 className="text-3xl font-bold text-white">Каталог курсов</h1>
           <p className="text-py-muted">Прокачай навыки Python с нашими курируемыми курсами.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {COURSES.map(course => (
               <div key={course.id} className="bg-py-surface border border-py-accent rounded-2xl overflow-hidden hover:border-py-green/50 transition-all group relative">
                   {/* Card Header Gradient */}
                   <div className={`h-32 bg-gradient-to-br from-py-dark to-py-accent p-6 relative flex flex-col justify-between`}>
                       <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                           {course.difficulty}
                       </div>
                       <div className={`size-12 rounded-xl bg-py-dark flex items-center justify-center ${course.color} shadow-lg`}>
                           {getIcon(course.icon)}
                       </div>
                   </div>
                   
                   <div className="p-6">
                       <h3 className="text-xl font-bold text-white mb-2 group-hover:text-py-green transition-colors">{course.title}</h3>
                       <p className="text-sm text-py-muted mb-6 h-10">{course.description}</p>
                       
                       {/* Progress Info */}
                       <div className="flex flex-col gap-2 mb-6">
                           <div className="flex justify-between text-xs font-bold">
                               <span className="text-white">{course.progress}% Завершено</span>
                               <span className="text-py-green">12/25 Уроков</span>
                           </div>
                           <div className="h-1.5 w-full bg-py-dark rounded-full overflow-hidden">
                               <div className={`h-full ${course.color.replace('text', 'bg')} rounded-full`} style={{ width: `${course.progress}%