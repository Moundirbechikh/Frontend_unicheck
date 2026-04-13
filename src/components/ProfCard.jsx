import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Book, ArrowUpRight, Mail } from 'lucide-react';

const ProfCard = ({ prof, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#f1f4f2] rounded-full group-hover:bg-[#d1f4e0]/50 transition-colors pointer-events-none" />

      <div className="relative z-10 space-y-5">
        
        {/* TOP : Avatar & Status */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-[#1a1c1e] rounded-[1.5rem] flex items-center justify-center text-white font-display font-black text-2xl shadow-lg group-hover:scale-110 transition-transform">
              {prof.name.split(' ')[1].charAt(0)}
            </div>
            <div>
              <div className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md inline-block mb-1 ${
                prof.totalAttendance >= 90 ? 'bg-[#d1f4e0] text-[#006c49]' : 'bg-blue-100 text-blue-600'
              }`}>
                {prof.status}
              </div>
              <h3 className="text-xl font-display font-black text-[#1a1c1e] leading-none uppercase tracking-tighter">
                {prof.name}
              </h3>
            </div>
          </div>
          <button className="text-gray-300 hover:text-[#1a1c1e] transition-colors">
            <Mail size={18} />
          </button>
        </div>

        {/* MIDDLE : Main Stats Bento */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f1f4f2] p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Clock size={14} />
              <span className="text-[9px] font-black uppercase">Volume</span>
            </div>
            <p className="text-xl font-display font-black text-[#1a1c1e]">
              {prof.weeklyHours}<span className="text-xs ml-1">h/sem</span>
            </p>
          </div>
          <div className="bg-[#1a1c1e] p-4 rounded-2xl text-white">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ArrowUpRight size={14} className="text-[#006c49]" />
              <span className="text-[9px] font-black uppercase">Présence</span>
            </div>
            <p className="text-xl font-display font-black">
              {prof.totalAttendance}%
            </p>
          </div>
        </div>

        {/* BOTTOM : Courses Breakdown (Surprise) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Book size={14} className="text-gray-400" />
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">Détails par cours</span>
          </div>
          
          <div className="space-y-2">
            {prof.courses.map((course, i) => (
              <div key={i} className="group/course">
                <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tight">
                  <span className="text-gray-600 truncate mr-2">{course.name}</span>
                  <span className={course.attendance >= 90 ? 'text-[#006c49]' : 'text-orange-500'}>
                    {course.attendance}%
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${course.attendance}%` }}
                    className={`h-full rounded-full ${course.attendance >= 90 ? 'bg-[#006c49]' : 'bg-orange-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[8px] font-bold text-gray-300 uppercase text-center pt-2 tracking-widest border-t border-gray-50">
          Identifiant Prof: {prof.id}
        </p>

      </div>
    </motion.div>
  );
};

export default ProfCard;