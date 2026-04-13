import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, GraduationCap, Award, BookOpen} from 'lucide-react';
import Agenda from './Agenda'; 
import CourseHistory from './CourseHistory';

const HistoryPage = () => {
  return (
    <div className="min-h-screen bg-[#f1f4f2] pb-32 pt-24 font-body selection:bg-[#006c49]/20 relative overflow-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@300;400;600&family=Noto+Sans+Arabic:wght@400;700&display=swap');
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); }
        `}
      </style>
      
      {/* --- BACKGROUND MOTIFS (LUCIDE ICONS) --- */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 blur-[1px] pointer-events-none select-none">
        <BookOpen size={300} strokeWidth={1} />
      </div>
      <div className="absolute top-[40%] -right-20 text-[#1a1c1e]/5 rotate-12 blur-[2px] pointer-events-none select-none">
        <GraduationCap size={350} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 left-10 text-[#006c49]/5 rotate-45 pointer-events-none select-none">
        <Award size={150} strokeWidth={1} />
      </div>

      <main className="px-4 max-w-6xl mx-auto relative z-10">
        
        {/* HERO SECTION RESPONSIVE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl mb-6 shadow-sm border border-gray-100">
            <Zap size={14} className="text-[#006c49]" fill="currentColor" />
            <span className="text-[10px] font-display font-black uppercase tracking-[0.25em] text-gray-500">Dashboard SITW</span>
          </div>

          <h2 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.8] mb-6">
            Historique<br /><span className="text-[#006c49] text-5xl md:text-7xl">Emploi du temp</span>
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
             <p className="text-gray-500 text-lg font-semibold tracking-tight">
               Ta progression est au sommet ce semestre.
             </p>
             <div className="flex items-center gap-1 px-3 py-1 bg-[#d1f4e0] text-[#006c49] rounded-full text-xs font-black font-display">
               <Zap size={12} fill="currentColor" /> +12% ce mois
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* CALENDRIER SECTION */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-3 ml-2">
              <div className="p-2.5 bg-[#1a1c1e] text-white rounded-2xl shadow-xl">
                <Calendar size={22} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-display font-black text-[#1a1c1e] uppercase tracking-[0.2em]">Calendrier Académique</span>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.06)] border border-white">
                <Agenda />
            </div>
          </motion.section>

          {/* STATS SECTION */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            <CourseHistory />
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default HistoryPage;