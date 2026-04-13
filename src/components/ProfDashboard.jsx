import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Zap, 
  Clock, 
  FileWarning, 
  ArrowUpRight, 
  PlayCircle,
  CalendarDays,
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';

// Import de ton nouveau composant de session
import ActiveAttendanceSession from './ActiveAttendanceSession';

const ProfDashboard = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);

  // --- LOGIQUE DE NAVIGATION ---
  // Si la session est lancée, on affiche uniquement l'interface d'appel
  if (isSessionActive) {
    return (
      <ActiveAttendanceSession 
        onStopSession={() => setIsSessionActive(false)} 
      />
    );
  }

  // --- ANIMATIONS ---
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">
      
      {/* --- STYLE INJECTÉ --- */}
      <style>
        {`
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.4); }
        `}
      </style>

      {/* --- BACKGROUND ICONS --- */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <GraduationCap size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <ClipboardCheck size={400} strokeWidth={1} />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10"
      >
        
        {/* --- SECTION 1: WELCOME --- */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
               <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
               <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">Session Enseignant</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.8]">
              Bonjour, <br /> <span className="text-[#006c49]">M. Moundir.</span>
            </h1>
          </div>
          
          <div className="glass-effect p-6 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-black/5">
             <div className="w-14 h-14 bg-[#1a1c1e] text-white rounded-2xl flex items-center justify-center">
                <CalendarDays size={28} />
             </div>
             <div>
                <p className="text-[10px] font-display font-black uppercase tracking-widest text-gray-400">Semaine en cours</p>
                <p className="font-display font-black text-xl text-[#1a1c1e]">Lundi 6 Avril</p>
             </div>
          </div>
        </motion.div>

        {/* --- SECTION 2: STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           {[
             { label: 'Présence Moyenne', val: '88%', icon: Users, color: 'text-[#006c49]', bg: 'bg-[#d1f4e0]' },
             { label: 'Justifs en attente', val: '07', icon: FileWarning, color: 'text-orange-500', bg: 'bg-orange-50' },
             { label: 'Heures Assurées', val: '12h', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' }
           ].map((stat, i) => (
             <motion.div key={i} variants={item} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl transition-all group overflow-hidden relative">
                <div className={`absolute -right-4 -bottom-4 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}>
                   <stat.icon size={120} strokeWidth={3} />
                </div>
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                   <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <p className="text-xs font-display font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                <p className="text-5xl font-display font-black text-[#1a1c1e] tracking-tighter">{stat.val}</p>
             </motion.div>
           ))}
        </div>

        {/* --- SECTION 3: FOCUS CARD & QUICK ACCESS --- */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Carte Prochain Cours (Le Déclencheur) */}
          <div className="lg:col-span-8 bg-[#1a1c1e] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-[#006c49]/20">
             <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
                <LayoutDashboard size={300} strokeWidth={1} />
             </div>

             <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                   <div className="bg-[#10b981] px-4 py-1.5 rounded-full text-[10px] font-display font-black uppercase tracking-widest text-white">
                      Prêt à démarrer
                   </div>
                   {/* Bouton flèche qui peut aussi lancer la session */}
                   <button 
                    onClick={() => setIsSessionActive(true)}
                    className="w-12 h-12 bg-white/10 hover:bg-[#006c49] rounded-2xl flex items-center justify-center transition-all group/btn"
                   >
                      <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                   </button>
                </div>

                <div className="space-y-4">
                   <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
                      Web <br /> <span className="text-[#006c49]">Architecture</span>
                   </h3>
                   <div className="flex flex-wrap gap-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock size={16} /> 10h10 - 11h40</span>
                      <span className="flex items-center gap-2"><Users size={16} /> G2 SITW</span>
                      <span className="flex items-center gap-2"><BookOpen size={16} /> Labo 04</span>
                   </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                   <button 
                    onClick={() => setIsSessionActive(true)}
                    className="flex items-center gap-3 bg-[#10b981] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-[#10b981]/20"
                   >
                      <PlayCircle size={18} /> Lancer l'appel
                   </button>
                </div>
             </div>
          </div>

          {/* Accès Rapide */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
             <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-[#f1f4f2] text-[#006c49] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-black tracking-tighter leading-none">Agenda Complet</h4>
                    <p className="text-gray-400 text-xs mt-1 font-medium">Consultez votre emploi du temps semestriel.</p>
                  </div>
                </div>
                <ArrowUpRight className="absolute top-8 right-8 text-gray-200 group-hover:text-[#006c49] transition-colors" size={32} />
             </div>

             <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileWarning size={24} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-black tracking-tighter leading-none">Justifications</h4>
                    <p className="text-gray-400 text-xs mt-1 font-medium">Validez les absences de vos étudiants.</p>
                  </div>
                </div>
                <ArrowUpRight className="absolute top-8 right-8 text-gray-200 group-hover:text-orange-500 transition-colors" size={32} />
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfDashboard;