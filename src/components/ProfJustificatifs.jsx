import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  ExternalLink, 
  Inbox, 
  ShieldAlert, // Nouvelle icône pour le background
  FileCheck2   // Nouvelle icône pour le background
} from 'lucide-react';

const ProfJustificatifs = () => {
  const [requests, setRequests] = useState([
    { id: 1, student: "Bacha Sami", date: "12/03/2026", module: "Algorithmes", reason: "Certificat médical - Grippe saisonnière", status: "pending" },
    { id: 2, student: "Chouaikhia Moundir", date: "10/03/2026", module: "Web Arch", reason: "Rendez-vous administratif important", status: "pending" },
  ]);

  const handleAction = (id, action) => {
    // Simulation d'action
    setRequests(requests.filter(r => r.id !== id));
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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

      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <ShieldAlert size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <FileCheck2 size={400} strokeWidth={1} />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto space-y-10 relative z-10"
      >
        
        {/* --- HEADER --- */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
               <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">Centre de révision</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Justificatifs<span className="text-[#006c49]">.</span>
            </h1>
          </div>
          
          <div className="bg-[#006c49] text-white px-6 py-3 rounded-[1.5rem] font-display font-black text-sm shadow-xl shadow-[#006c49]/20 flex items-center gap-3">
            <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">{requests.length}</span>
            À TRAITER
          </div>
        </motion.div>

        {/* --- LISTE DES DEMANDES --- */}
        <div className="space-y-6">
          <AnimatePresence mode='popLayout'>
            {requests.length > 0 ? (
              requests.map((req) => (
                <motion.div
                  key={req.id}
                  variants={item}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  {/* Petit indicateur visuel sur le côté */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400 opacity-20"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex gap-5">
                      <div className="w-14 h-14 bg-[#f1f4f2] text-[#1a1c1e] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <FileText size={28} />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-[#1a1c1e] text-2xl tracking-tighter">{req.student}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-display font-black text-gray-400 mt-1 uppercase tracking-[0.1em]">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#006c49]"/> {req.date}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#006c49]"/> {req.module}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="self-end md:self-start p-3 bg-[#f1f4f2] text-[#006c49] rounded-2xl hover:bg-[#006c49] hover:text-white transition-all shadow-sm">
                      <ExternalLink size={20} />
                    </button>
                  </div>

                  {/* Zone Motif */}
                  <div className="mt-8 mb-8 bg-[#f8faf9] p-5 rounded-[1.5rem] border border-gray-100 relative">
                    <span className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                      Motif de l'absence
                    </span>
                    <p className="text-gray-600 font-medium italic leading-relaxed pt-2">
                      "{req.reason}"
                    </p>
                  </div>

                  {/* Actions (Responsive : Stacked on mobile, side-by-side on desktop) */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => handleAction(req.id, 'refuse')}
                      className="flex-1 py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <X size={18} strokeWidth={3} /> Refuser
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'accept')}
                      className="flex-1 py-4 bg-[#1a1c1e] text-white rounded-2xl font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95"
                    >
                      <Check size={18} strokeWidth={3} /> Valider
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              /* --- EMPTY STATE --- */
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-md rounded-[3rem] py-24 text-center border border-white/50"
              >
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto text-[#006c49] shadow-sm mb-6">
                  <Inbox size={48} strokeWidth={1.5} />
                </div>
                <h2 className="font-display font-black text-2xl text-[#1a1c1e] tracking-tighter">Tout est à jour !</h2>
                <p className="text-gray-500 font-medium mt-2">Aucun nouveau justificatif n'attend votre validation.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default ProfJustificatifs;