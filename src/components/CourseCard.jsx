import React from 'react';
import { Trophy, Clock, CheckCircle2, AlertCircle, Bookmark } from 'lucide-react';

const CourseCard = ({ course }) => {
  const isWarning = course.attendanceRate < 75;
  const isPerfect = course.attendanceRate === 100;
  
  return (
    <div className="group relative bg-white p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#006c49]/10 overflow-hidden flex flex-col">
      
      {/* Icone décorative en haut à droite */}
      <div className="absolute -top-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
         <Bookmark size={80} strokeWidth={3} />
      </div>

      <div className="flex justify-between items-start gap-4 mb-6">
        {/* Conteneur texte avec min-w-0 pour éviter le débordement */}
        <div className="flex-1 min-w-0 space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
             {isPerfect ? (
               <Trophy size={18} className="text-yellow-500 shrink-0" fill="currentColor" />
             ) : (
               <CheckCircle2 size={18} className="text-[#006c49] shrink-0" />
             )}
             <h4 className="font-display font-black text-xl text-[#1a1c1e] tracking-tighter leading-none truncate pr-2">
               {course.title}
             </h4>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-400 font-body">
            <Clock size={12} strokeWidth={3} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">
              Last: {course.lastSession}
            </span>
          </div>
        </div>

        {/* Badge Sessions */}
        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] font-display font-black tracking-tighter
          ${isWarning ? 'bg-red-50 text-red-500' : 'bg-[#f1f4f2] text-[#006c49]'}`}>
          {isWarning && <AlertCircle size={12} strokeWidth={3} />}
          {course.sessionsDone}/{course.sessionsTotal} SES
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end px-1">
          <span className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-gray-400">Taux de présence</span>
          <div className={`text-3xl font-display font-black tracking-tighter leading-none ${isWarning ? 'text-red-500' : 'text-[#006c49]'}`}>
            {course.attendanceRate}<span className="text-sm ml-0.5 opacity-50">%</span>
          </div>
        </div>
        
        {/* BARRE DE PROGRESSION CARTOON-PREMIUM */}
        <div className="relative h-6 w-full bg-[#f1f4f2] rounded-3xl p-1.5 shadow-inner overflow-hidden border border-gray-100">
          <div 
            className={`h-full rounded-2xl transition-all duration-1000 ease-out relative shadow-sm
              ${isWarning ? 'bg-red-500' : 'bg-[#006c49]'}`}
            style={{ width: `${course.attendanceRate}%` }}
          >
            {/* Effet Reflet Glossy sur la barre */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl"></div>
            
            {/* Shimmer animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;