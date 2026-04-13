import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AnimatedPhone = () => {
  const [step, setStep] = useState(0); // 0: Idle, 1: Drop QR, 2: Scan, 3: Result
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        setStep(0); await new Promise(r => setTimeout(r, 1500));
        setStep(1); await new Promise(r => setTimeout(r, 1000));
        setStep(2); await new Promise(r => setTimeout(r, 2000));
        setStep(3); await new Promise(r => setTimeout(r, 3500));
        setIsSuccess(prev => !prev);
      }
    };
    sequence();
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      
      {/* STRUCTURE IPHONE RÉALISTE */}
      <div className="relative w-64 h-[460px] bg-[#1a1c1e] rounded-[2.4rem] p-[8px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-black/20 overflow-visible">
        
        {/* Détails du châssis (Contours et Boutons) */}
        <div className="absolute -left-[2px] top-24 w-[3px] h-10 bg-[#2d3135] rounded-l-sm border-l border-white/5" />
        <div className="absolute -right-[2px] top-32 w-[3px] h-14 bg-[#2d3135] rounded-r-sm border-r border-white/5" />

        {/* L'ÉCRAN IPHONE */}
        <div className="relative w-full h-full bg-white rounded-[1.8rem] overflow-hidden flex flex-col shadow-inner border border-gray-100">
          
          {/* Dynamic Island & Status Bar */}
          <div className="absolute top-0 inset-x-0 h-8 flex justify-between items-center px-8 z-50">
            <span className="text-[10px] font-bold text-black/80">9:41</span>
            <div className="w-16 h-5 bg-black rounded-full flex items-center justify-center">
               <div className="w-1 h-1 bg-white/10 rounded-full ml-auto mr-2" />
            </div>
            <div className="flex gap-1 items-center">
              <div className="w-3 h-1.5 bg-black/20 rounded-[1px]" />
            </div>
          </div>

          {/* Interface Scanner */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 mt-4">
            
            {/* Viseur de Scan */}
            <div className="relative w-40 h-40 rounded-[2rem] border-[1.5px] border-gray-100 flex items-center justify-center bg-gray-50/30 overflow-hidden">
              
              {/* Le Laser de Balayage */}
              <AnimatePresence>
                {step === 2 && (
                  <motion.div 
                    initial={{ top: 0, opacity: 0 }}
                    animate={{ top: "100%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className={`absolute left-0 right-0 h-[2px] z-20 shadow-[0_0_10px_rgba(16,185,129,0.5)] ${isSuccess ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}
                  />
                )}
              </AnimatePresence>

              {/* RÉSULTAT (Emoji Plein Écran) */}
              <AnimatePresence>
                {step === 3 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`absolute inset-0 z-30 flex items-center justify-center ${isSuccess ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}
                  >
                    <span className="text-6xl text-white font-bold drop-shadow-sm">
                      {isSuccess ? "✓" : "✕"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Effet vitré permanent */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 z-10" />
            </div>

            {/* Texte Minimaliste */}
            <div className="mt-10 text-center space-y-1">
              <h3 className="font-display font-extrabold text-[12px] text-[#1a1c1e] tracking-tight uppercase">Lecteur de Badge</h3>
              <div className="w-8 h-0.5 bg-[#006c49] mx-auto rounded-full" />
            </div>
          </div>

          {/* Home Indicator iOS */}
          <div className="w-20 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
        </div>
      </div>

      {/* LE QR CODE SIMPLIFIÉ (4 Carrés) */}
      <AnimatePresence>
        {(step === 1 || step === 2) && (
          <motion.div
            initial={{ y: -250, opacity: 0, scale: 0.9 }}
            animate={{ y: -50, opacity: 1, scale: 1.1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            className="absolute z-50 bg-white p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col items-center gap-2"
          >
            {/* Le Motif à 4 Carrés (Simple & Graphique) */}
            <div className="grid grid-cols-2 gap-2">
            <div className="w-8 h-8 border-[3px] border-black rounded-sm flex justify-items-center p-1">
                <div className=" h-full w-full bg-black rounded-sm shadow-sm"></div>
            </div>
              <div className="w-8 h-8 border-[3px] border-black rounded-sm" />
              <div className="w-8 h-8 border-[3px] border-black rounded-sm" />
              <div className="w-8 h-8 border-[3px] border-black rounded-sm" />
            </div>
            <div className="w-10 h-1 bg-gray-100 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ombre portée réaliste */}
      <div className="absolute bottom-4 w-44 h-8 bg-black/5 blur-2xl rounded-[100%] -z-10" />
    </div>
  );
};

export default AnimatedPhone;