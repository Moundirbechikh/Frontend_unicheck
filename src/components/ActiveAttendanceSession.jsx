import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Square } from 'lucide-react';
import UnicheckSessionDashboard from './UnicheckSessionDashboard';

const ActiveAttendanceSession = ({ onStopSession }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f1f4f2] overflow-hidden font-body">
      
      {/* --- CONTROLES FLOTTANTS ADAPTATIFS --- */}
      {/* Mobile : top-4 left-4 (Aligné à gauche)
          Desktop : md:top-6 md:left-1/2 md:-translate-x-1/2 (Centré)
      */}
      <div className="absolute top-4 left-4 md:top-6 md:left-1/2 md:-translate-x-1/2 z-[110] flex items-center gap-2 md:gap-3 bg-black/90 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-full md:rounded-[2rem] shadow-2xl transition-all duration-500 ease-in-out">
        
        {/* Timer Pilule */}
        <div className="flex items-center gap-2 md:gap-3 px-2 md:px-1">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-white font-mono text-base md:text-xl font-black tracking-tighter">
            {formatTime(seconds)}
          </span>
        </div>

        {/* Séparateur Vertical discret (Optionnel mais joli) */}
        <div className="w-[1px] h-4 bg-white/10 hidden md:block" />

        {/* Bouton Stop */}
        <button 
          onClick={onStopSession}
          className="bg-red-500 hover:bg-red-600 text-white p-2 md:p-3 rounded-full shadow-xl transition-all active:scale-90 group relative"
        >
          <Square size={14} fill="white" className="md:w-[18px] md:h-[18px]"/>
          
          {/* Tooltip Desktop uniquement */}
          <span className="absolute hidden md:block -bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-[10px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Finir
          </span>
        </button>
      </div>

      {/* --- DASHBOARD FULLSCREEN --- */}
      <div className="w-full h-full">
        <UnicheckSessionDashboard />
      </div>

    </div>
  );
};

export default ActiveAttendanceSession;