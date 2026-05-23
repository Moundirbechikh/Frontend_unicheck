import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, ScanLine, X } from 'lucide-react';

// 💡 AJOUT : On récupère totalCapacity en prop
const StudentList = ({ presentStudents, totalCapacity, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 60 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="fixed inset-0 z-50 bg-[#f1f4f2] flex flex-col p-4 overflow-hidden"
  >
    {/* Header */}
    <div className="flex justify-between items-center mb-5 mt-9 md:mt-0 shrink-0 pt-2">
      <h2 className="text-3xl font-black text-[#1a1c1e] tracking-tighter leading-none">
        Présents<span className="text-[#006c49]">.</span>
      </h2>
      <button
        onClick={onClose}
        className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#1a1c1e] hover:bg-gray-100 border border-gray-200"
      >
        <X size={20} strokeWidth={2.5} />
      </button>
    </div>

    {/* Compteur compact */}
    <div className="bg-[#006c49] rounded-2xl px-5 py-3 flex items-center justify-between mb-4 shrink-0">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-white/70" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Présents en salle</p>
      </div>
      <p className="font-black font-mono text-white text-xl">
        {/* 💡 AJOUT : Remplacement du 60 en dur par la prop dynamique */}
        {presentStudents.length} <span className="text-white/40 font-bold text-sm">/ {totalCapacity}</span>
      </p>
    </div>

    {/* Liste scrollable */}
    <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 shrink-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Flux en direct</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {presentStudents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 py-16"
            >
              <ScanLine size={28} strokeWidth={1.5} />
              <p className="text-[10px] font-bold uppercase tracking-widest">En attente...</p>
            </motion.div>
          ) : (
            presentStudents.map((student) => (
              <motion.div
                layout key={student.id}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-[#f1f4f2] rounded-2xl p-3 flex items-center gap-3 border border-white"
              >
                <div className="w-10 h-10 bg-[#1a1c1e] text-white rounded-xl flex items-center justify-center font-black text-base shrink-0">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#1a1c1e] text-sm truncate">{student.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.time}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#006c49] shrink-0" strokeWidth={2.5} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  </motion.div>
);

// 💡 AJOUT : totalCapacity à 0 par défaut pour éviter le 60 factice
const RightFeed = ({ presentStudents = [], totalCapacity = 0, onClose }) => {
  const [showMobileList, setShowMobileList] = useState(false);

  // Inverser la liste pour que le dernier scanné apparaisse en haut du flux
  const reversedStudents = [...presentStudents].reverse();

  return (
    <>
      {/* ── DESKTOP : sidebar complète ── */}
      <div className="hidden md:flex w-full h-full flex-col gap-3 overflow-hidden">
        <div className="flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#1a1c1e] hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-[#006c49] rounded-[2rem] p-5 shadow-lg text-white relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center gap-1">
            <Users size={18} className="text-white/70" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Présents en salle</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black font-mono leading-none">{presentStudents.length}</span>
              {/* 💡 AJOUT : Remplacement du 60 */}
              <span className="text-lg font-bold text-white/50">/ {totalCapacity}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Flux en direct</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            <AnimatePresence mode="popLayout">
              {reversedStudents.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 py-10"
                >
                  <ScanLine size={28} strokeWidth={1.5} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">En attente...</p>
                </motion.div>
              ) : (
                reversedStudents.map((student) => (
                  <motion.div
                    layout key={student.id}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="bg-[#f1f4f2] rounded-2xl p-3 flex items-center gap-3 border border-white"
                  >
                    <div className="w-9 h-9 bg-[#1a1c1e] text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#1a1c1e] text-sm truncate">{student.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.time}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-[#006c49] shrink-0" strokeWidth={2.5} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MOBILE : bouton vert uniquement ── */}
      <button
        onClick={() => setShowMobileList(true)}
        className="md:hidden w-full bg-[#006c49] rounded-[2rem] p-5 shadow-lg text-white relative overflow-hidden active:scale-[0.98] transition-transform"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-white/70" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Présents en salle</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-4xl font-black font-mono leading-none">{presentStudents.length}</span>
                {/* 💡 AJOUT : Remplacement du 60 */}
                <span className="text-base font-bold text-white/50">/ {totalCapacity}</span>
              </div>
            </div>
          </div>
          {/* Flèche → indique que c'est cliquable */}
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </button>

      {/* Liste plein écran sur mobile */}
      <AnimatePresence>
        {showMobileList && (
          <StudentList
            presentStudents={reversedStudents}
            totalCapacity={totalCapacity} // 💡 AJOUT : On passe la prop à la modale
            onClose={() => setShowMobileList(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RightFeed;