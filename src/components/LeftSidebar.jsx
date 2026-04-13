import React from 'react';
import { Search, ScanLine, Activity, X } from 'lucide-react';

const LeftSidebar = ({ onOpenSearch, onOpenScanner, onClose }) => {
  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-hidden">

      {/* Header avec X */}
      <div className="flex justify-end shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#1a1c1e] hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
        >
          <X size={16} />
        </button>
      </div>

      {/* Statut session */}
      <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-40 animate-pulse" />
          <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center relative z-10 border border-red-100">
            <Activity className="text-red-500 animate-pulse" size={20} />
          </div>
        </div>
        <div>
          <p className="font-black text-[#1a1c1e] text-xs uppercase tracking-widest">Session Active</p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Enregistrement en cours</p>
        </div>
      </div>

      {/* Boutons action */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <button
          onClick={onOpenSearch}
          className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 text-[#1a1c1e] hover:bg-gray-50 active:scale-95 transition-all group min-h-0"
        >
          <div className="w-12 h-12 bg-[#f1f4f2] rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
            <Search size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
            Saisie<br />Manuelle
          </span>
        </button>

        <button
          onClick={onOpenScanner}
          className="flex-1 bg-[#1a1c1e] rounded-[2rem] shadow-lg flex flex-col items-center justify-center gap-3 text-white hover:bg-[#006c49] active:scale-95 transition-all group min-h-0"
        >
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ScanLine size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
            Scanner<br />Carte
          </span>
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;