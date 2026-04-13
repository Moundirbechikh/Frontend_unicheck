import React from 'react';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import CourseCard from './CourseCard';

const CourseHistory = () => {
  const coursesData = [
    { id: 1, title: "Développement Web Full-Stack", lastSession: "Hier", sessionsDone: 5, sessionsTotal: 6, attendanceRate: 83 },
    { id: 2, title: "Architecture RAG & IA", lastSession: "Aujourd'hui", sessionsDone: 8, sessionsTotal: 8, attendanceRate: 100 },
    { id: 3, title: "Bases de données", lastSession: "3 mars", sessionsDone: 3, sessionsTotal: 5, attendanceRate: 60 },
    { id: 4, title: "Réseaux & Sécurité", lastSession: "5 mars", sessionsDone: 10, sessionsTotal: 11, attendanceRate: 91 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#006c49] text-white rounded-2xl shadow-lg">
            <LayoutGrid size={22} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-display font-black text-[#1a1c1e] tracking-tighter">Performance</h2>
        </div>
        
        <button className="group flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <span className="text-[#006c49] font-display font-black text-[10px] uppercase tracking-widest">Détails</span>
          <ArrowRight size={14} strokeWidth={3} className="text-[#006c49] transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid responsive : 1 col mobile/lg, 2 col sm/md */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
        {coursesData.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CourseHistory;