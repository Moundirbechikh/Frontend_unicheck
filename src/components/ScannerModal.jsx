import React from 'react';
import { motion } from 'framer-motion';
import { X, ScanLine } from 'lucide-react';

const ScannerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
      animate={{ opacity: 1, backdropFilter: "blur(16px)" }} 
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 z-50 bg-[#1a1c1e]/90 flex flex-col items-center justify-center p-4"
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
      >
        <X size={24} strokeWidth={2.5} />
      </button>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">Scanner Carte</h2>
        <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">Placez le QR Code de l'étudiant dans le cadre</p>
      </div>

      <div className="w-full max-w-sm aspect-square border-4 border-dashed border-[#006c49]/50 rounded-[2.5rem] md:rounded-[3rem] relative flex items-center justify-center overflow-hidden bg-black/40 shadow-[0_0_50px_rgba(0,108,73,0.2)]">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,108,73,0.2)_2px,transparent_2px)] bg-[size:100%_4px] animate-[scan_2s_linear_infinite]" />
         <ScanLine size={60} className="text-[#006c49]/50" />
         
         <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
         <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
         <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
         <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
      </div>
    </motion.div>
  );
};

export default ScannerModal;