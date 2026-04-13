import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  PlayCircle,
  CalendarDays,
  LayoutDashboard, // Nouvelle icône pour le background
  Activity       // Nouvelle icône pour le background
} from 'lucide-react';

const Dashboard = () => {
  // Animation container
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
      
      {/* --- STYLE INJECTÉ (Tes bases) --- */}
      <style>
        {`
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.4); }
          .text-stroke { -webkit-text-stroke: 1px rgba(0, 108, 73, 0.2); color: transparent; }
        `}
      </style>

      {/* --- BACKGROUND LUCIDE ICONS (Les "emojis" géants) --- */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <LayoutDashboard size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <Activity size={400} strokeWidth={1} />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10" /* relative z-10 ajouté ici */
      >
        
        {/* --- SECTION 1: WELCOME & DATE --- */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
               <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
               <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">Live Dashboard</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.8]">
              Tableau <br /> <span className="text-[#006c49]">de bord.</span>
            </h1>
          </div>
          
          <div className="glass-effect p-6 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-black/5">
             <div className="w-14 h-14 bg-[#1a1c1e] text-white rounded-2xl flex items-center justify-center">
                <CalendarDays size={28} />
             </div>
             <div>
                <p className="text-[10px] font-display font-black uppercase tracking-widest text-gray-400">Aujourd'hui</p>
                <p className="font-display font-black text-xl text-[#1a1c1e]">Jeudi 2 Avril</p>
             </div>
          </div>
        </motion.div>

        {/* --- SECTION 2: STATS RAPIDES (GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           {[
             { label: 'Présence', val: '94%', icon: CheckCircle2, color: 'text-[#006c49]', bg: 'bg-[#d1f4e0]' },
             { label: 'Retards', val: '02', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
             { label: 'Score SITW', val: '18.5', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' }
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

        {/* --- SECTION 3: FOCUS CARD (Next Class) --- */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-[#1a1c1e] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-[#006c49]/20">
             {/* Décoration fond */}
             <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
                <LayoutGrid size={300} strokeWidth={1} />
             </div>

             <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                   <div className="bg-[#006c49] px-4 py-1.5 rounded-full text-[10px] font-display font-black uppercase tracking-widest">
                      Cours en cours
                   </div>
                   <button className="w-12 h-12 bg-white/10 hover:bg-[#006c49] rounded-2xl flex items-center justify-center transition-all">
                      <ArrowUpRight size={20} />
                   </button>
                </div>

                <div className="space-y-4">
                   <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
                      Architecture <br /> <span className="text-[#006c49]">RAG</span> & IA
                   </h3>
                   <div className="flex flex-wrap gap-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock size={16} /> 14h00 - 16h00</span>
                      <span className="flex items-center gap-2"><ShieldCheck size={16} /> Salle 402</span>
                   </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                   <div className="flex -space-x-3">
                      {[1,2,3].map(n => (
                        <div key={n} className="w-10 h-10 rounded-full border-2 border-[#1a1c1e] bg-gray-600 flex items-center justify-center text-[10px] font-black">
                          S{n}
                        </div>
                      ))}
                   </div>
                   <p className="text-xs text-gray-400 font-medium tracking-tight">
                     <span className="text-white font-black">+24 étudiants</span> déjà présents
                   </p>
                </div>
             </div>
          </div>

          {/* --- SECTION 4: QUICK ACTION / MOOD --- */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-[#006c49] rounded-[2.5rem] p-8 text-white h-full flex flex-col justify-between group shadow-xl hover:rotate-1 transition-transform cursor-pointer">
                <PlayCircle size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                <div className="space-y-2">
                   <h4 className="text-3xl font-display font-black tracking-tighter leading-none">Scanne ton <br /> QR Code</h4>
                   <p className="text-white/60 text-xs font-medium">Pour valider ta présence instantanément.</p>
                </div>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;