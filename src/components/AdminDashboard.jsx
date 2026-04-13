import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  UserPlus, 
  CalendarPlus,
  Zap,
  ShieldCheck,
  Radar,
  Sparkles,
  Server
} from 'lucide-react';

const AdminDashboard = () => {
  // Définition des animations Framer Motion
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">
      
      {/* --- STYLE INJECTÉ --- */}
      <style>
        {`
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
          .bento-card { background: white; border-radius: 2.5rem; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid rgba(255,255,255,0.8); }
        `}
      </style>

      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-0 -right-20 text-[#006c49]/5 rotate-12 pointer-events-none select-none">
        <Radar size={500} strokeWidth={1} />
      </div>
      <div className="absolute bottom-20 -left-20 text-[#1a1c1e]/5 -rotate-12 pointer-events-none select-none">
        <Server size={400} strokeWidth={1} />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-8 relative z-10"
      >
        
        {/* --- HEADER --- */}
        <motion.div variants={item} className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
             <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
             <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">Vue d'ensemble</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.9]">
            Système <br /> <span className="text-[#006c49]">Unicheck.</span>
          </h1>
        </motion.div>

        {/* --- BENTO GRID STATISTIQUES --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Carte Taux de présence (Prend 2 colonnes sur mobile et desktop) */}
          <motion.div variants={item} className="col-span-2 bg-[#1a1c1e] rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group shadow-xl shadow-black/10">
            <div className="absolute -right-10 -top-10 bg-[#006c49] w-40 h-40 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#d1f4e0] backdrop-blur-md">
                <Activity size={24} />
              </div>
              <span className="bg-[#d1f4e0] text-[#006c49] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <TrendingUp size={12} strokeWidth={3} /> +2.4%
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Présence Globale</p>
              <h2 className="font-display font-black text-white text-6xl md:text-7xl tracking-tighter">88<span className="text-3xl text-gray-500">%</span></h2>
            </div>
          </motion.div>

          {/* Carte Étudiants */}
          <motion.div variants={item} className="bento-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-[#f1f4f2] text-[#1a1c1e] rounded-[1rem] flex items-center justify-center mb-4">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">Étudiants</p>
              <h3 className="font-display font-black text-[#1a1c1e] text-3xl tracking-tighter">452</h3>
            </div>
          </motion.div>

          {/* Carte Professeurs */}
          <motion.div variants={item} className="bento-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-[#f1f4f2] text-[#1a1c1e] rounded-[1rem] flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <div>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">Professeurs</p>
              <h3 className="font-display font-black text-[#1a1c1e] text-3xl tracking-tighter">38</h3>
            </div>
          </motion.div>

          {/* Carte Cours en direct (Prend toute la largeur sur mobile, 1 col sur desktop) */}
          <motion.div variants={item} className="col-span-2 md:col-span-4 bg-[#d1f4e0] rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm border border-[#006c49]/10">
             <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#006c49] opacity-20 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#006c49]"></span>
                </div>
                <div>
                  <h3 className="font-display font-black text-[#006c49] text-xl tracking-tighter leading-tight">12 Séances en cours</h3>
                  <p className="text-[#006c49]/70 font-bold text-xs">Système de pointage actif.</p>
                </div>
             </div>
             <button className="hidden sm:flex bg-white text-[#006c49] px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#006c49] hover:text-white transition-colors">
               Voir la carte
             </button>
          </motion.div>
        </div>

        {/* --- ACTIONS RAPIDES & INSIGHTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
          
          {/* Actions (7 colonnes sur Desktop) */}
          <motion.div variants={item} className="md:col-span-7 space-y-4">
            <h3 className="font-display font-black text-xl text-[#1a1c1e] tracking-tighter flex items-center gap-2">
              <Zap className="text-[#006c49]" size={20} /> Actions Rapides
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button className="bg-white p-5 rounded-[2rem] border border-white hover:border-[#006c49]/30 shadow-sm flex flex-col items-center justify-center gap-3 group transition-all">
                <div className="w-12 h-12 bg-[#f1f4f2] text-[#1a1c1e] group-hover:bg-[#006c49] group-hover:text-white rounded-[1.2rem] flex items-center justify-center transition-colors">
                  <UserPlus size={22} />
                </div>
                <span className="font-bold text-xs text-gray-600">Ajouter<br/>Étudiant</span>
              </button>
              
              <button className="bg-white p-5 rounded-[2rem] border border-white hover:border-[#006c49]/30 shadow-sm flex flex-col items-center justify-center gap-3 group transition-all">
                <div className="w-12 h-12 bg-[#f1f4f2] text-[#1a1c1e] group-hover:bg-[#1a1c1e] group-hover:text-white rounded-[1.2rem] flex items-center justify-center transition-colors">
                  <Users size={22} />
                </div>
                <span className="font-bold text-xs text-gray-600">Nouveau<br/>Professeur</span>
              </button>

              <button className="col-span-2 sm:col-span-1 bg-white p-5 rounded-[2rem] border border-white hover:border-[#006c49]/30 shadow-sm flex flex-col items-center justify-center gap-3 group transition-all">
                <div className="w-12 h-12 bg-[#f1f4f2] text-[#1a1c1e] group-hover:bg-[#006c49] group-hover:text-white rounded-[1.2rem] flex items-center justify-center transition-colors">
                  <CalendarPlus size={22} />
                </div>
                <span className="font-bold text-xs text-gray-600">Gérer<br/>Plannings</span>
              </button>
            </div>
          </motion.div>

          {/* Insights / Aperçus (5 colonnes sur Desktop) */}
          <motion.div variants={item} className="md:col-span-5 space-y-4">
             <h3 className="font-display font-black text-xl text-[#1a1c1e] tracking-tighter flex items-center gap-2">
              <Sparkles className="text-orange-400" size={20} /> Insights Système
            </h3>
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-white space-y-4">
              
              {/* Insight 1 */}
              <div className="flex gap-4 p-3 bg-orange-50/50 rounded-[1.5rem] border border-orange-100/50">
                <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-[1rem] flex items-center justify-center shrink-0">
                  <TrendingDown size={18} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-display font-black text-[#1a1c1e] text-sm">Baisse de présence (G2)</h4>
                  <p className="text-xs text-gray-500 font-medium leading-tight mt-1">Le groupe G2 SITW a une moyenne de présence de 65% cette semaine.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </div>
  );
};

export default AdminDashboard;