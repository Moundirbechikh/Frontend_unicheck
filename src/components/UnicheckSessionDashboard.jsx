import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import LeftSidebar from './LeftSidebar';
import CenterMonolith from './CenterMonolith';
import RightFeed from './RightFeed';
import ScannerModal from './ScannerModal';
import SearchModal from './SearchModal';

// Exemple d'un étudiant présent pour voir le rendu
const DEMO_STUDENTS = [
  { id: 1, name: 'Amira Bensalem', time: '08:42' },
];

export default function UnicheckSessionDashboard() {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [presentStudents] = useState(DEMO_STUDENTS);

  return (
    <div className="md:h-[100dvh] h-fit w-full bg-[#f1f4f2] overflow-hidden">

      {/* ── DESKTOP : layout 3 colonnes ── */}
      <div className="hidden md:flex h-full p-4 gap-3">

        <AnimatePresence>
          {showLeft && (
            <motion.div
              key="left"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-[260px] shrink-0 h-full z-20"
            >
              <LeftSidebar
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenScanner={() => setIsScannerOpen(true)}
                onClose={() => setShowLeft(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 relative h-full min-w-0">
          {!showLeft && (
            <button
              onClick={() => setShowLeft(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-[#1a1c1e] text-white w-9 h-16 rounded-r-3xl flex items-center justify-center shadow-xl hover:bg-[#006c49] transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
          {!showRight && (
            <button
              onClick={() => setShowRight(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-[#1a1c1e] text-white w-9 h-16 rounded-l-3xl flex items-center justify-center shadow-xl hover:bg-[#006c49] transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <CenterMonolith isExpanded={!showLeft && !showRight} />
        </div>

        <AnimatePresence>
          {showRight && (
            <motion.div
              key="right"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-[280px] shrink-0 h-full z-20"
            >
              <RightFeed
                presentStudents={presentStudents}
                onClose={() => setShowRight(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE : layout vertical ── */}
      <div className="flex md:hidden h-fit flex-col p-3 gap-3 overflow-y-auto">

        {/* Top : LeftSidebar réduit horizontal */}
        <div className="shrink-0">
          <MobileTopBar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        </div>

        {/* Centre : QR imposant */}
        <div className="flex-1 min-h-[340px]">
          <CenterMonolith isExpanded={true} />
        </div>

        {/* Bottom : RightFeed compact */}
        <div className="shrink-0 h-[220px]">
          <RightFeed presentStudents={presentStudents} onClose={null} />
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {isScannerOpen && (
          <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
        )}
        {isSearchOpen && (
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Barre mobile en haut : session status + 2 boutons côte à côte */
function MobileTopBar({ onOpenSearch, onOpenScanner }) {
  return (
    <div className="flex gap-3 items-stretch">

      {/* Statut */}
      <div className="bg-white rounded-[1.5rem] px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3 flex-1">
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-sm opacity-40 animate-pulse" />
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center relative z-10 border border-red-100">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
          </div>
        </div>
        <div>
          <p className="font-black text-[#1a1c1e] text-[10px] uppercase tracking-widest leading-tight">Session Active</p>
          <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">En cours</p>
        </div>
      </div>

      {/* Bouton Saisie */}
      <button
        onClick={onOpenSearch}
        className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 px-4 py-3 text-[#1a1c1e] hover:bg-gray-50 active:scale-95 transition-all"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="text-[9px] font-black uppercase tracking-wider">Manuel</span>
      </button>

      {/* Bouton Scanner */}
      <button
        onClick={onOpenScanner}
        className="bg-[#1a1c1e] rounded-[1.5rem] shadow-lg flex flex-col items-center justify-center gap-1.5 px-4 py-3 text-white hover:bg-[#006c49] active:scale-95 transition-all"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <line x1="7" y1="8" x2="7" y2="8"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="17" y1="8" x2="17" y2="8"/>
        </svg>
        <span className="text-[9px] font-black uppercase tracking-wider">Scanner</span>
      </button>
    </div>
  );
}