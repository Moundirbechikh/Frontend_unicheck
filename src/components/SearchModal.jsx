import React from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-[#f1f4f2] flex flex-col p-4 md:p-8 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-5 md:mb-12 shrink-0 pt-4 mt-8 md:mt-0">
        <h2 className="text-4xl md:text-6xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
          Recherche<span className="text-[#006c49]">.</span>
        </h2>
        <button 
          onClick={onClose} 
          className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#1a1c1e] hover:bg-gray-100 border border-gray-200"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="relative group mb-8 shrink-0">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#006c49] transition-colors w-8 h-8 md:w-12 md:h-12" strokeWidth={3} />
          <input 
            autoFocus
            type="text" 
            placeholder="Matricule..." 
            className="w-full bg-transparent border-b-4 border-gray-200 focus:border-[#006c49] py-4 pl-12 md:pl-16 pr-4 font-display font-black text-3xl md:text-5xl text-[#1a1c1e] outline-none transition-colors placeholder:text-gray-300"
          />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Suggestions</p>
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-3 md:p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 hover:border-[#006c49]/30 transition-colors">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center font-display font-black text-gray-400 text-lg">E</div>
                <div>
                  <p className="font-display font-black text-[#1a1c1e] text-sm md:text-base">Étudiant {i}</p>
                  <p className="text-[9px] md:text-xs font-bold text-gray-400">SITW - G1</p>
                </div>
              </div>
              <button className="px-4 py-2 md:px-6 md:py-3 bg-[#1a1c1e] text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#006c49] transition-colors active:scale-95">
                Valider
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchModal;