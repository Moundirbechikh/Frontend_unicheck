import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import CalendarDay from './CalendarDay';

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  
  const today = new Date();
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  let firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handlePrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const getDayStatus = (day) => {
    if (day === 4 || day === 13) return 'absent';
    if (day % 3 === 0) return 'present';
    if (day > 22) return 'upcoming';
    return null;
  };

  const monthYearTitle = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <section className="space-y-8 font-body">
      
      <div className="relative">
        {/* Header avec texte Manrope Imposant */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl sm:text-2xl font-display font-black text-[#1a1c1e] capitalize tracking-tighter">
            {monthYearTitle}
          </h2>
          
          <div className="flex gap-1.5 bg-[#f1f4f2] p-1 rounded-xl border border-gray-100">
            <button onClick={handlePrevMonth} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-sm active:bg-gray-100 transition-colors">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <button 
              onClick={handleNextMonth} 
              disabled={isCurrentMonth}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors
                ${isCurrentMonth ? 'opacity-20' : 'bg-white shadow-sm active:bg-gray-100'}`}
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* GRILLE D'AGENDA : Optimisée pour ne pas déborder */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 items-center justify-items-center">
          {weekdays.map((day, index) => (
            <div key={day} className={`text-[9px] sm:text-[10px] font-display font-black uppercase tracking-widest mb-2 ${index >= 5 ? 'text-red-400' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}

          <AnimatePresence mode="wait">
            <motion.div key={viewMonth} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="contents">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <CalendarDay key={`empty-${index}`} isEmpty={true} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const isToday = dayNumber === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = dayNumber === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
                return (
                  <CalendarDay 
                    key={dayNumber}
                    day={dayNumber}
                    isToday={isToday}
                    isSelected={isSelected}
                    status={getDayStatus(dayNumber)}
                    onClick={() => setSelectedDate(new Date(viewYear, viewMonth, dayNumber))}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* LISTE DES COURS DU JOUR (Version Mobile Compacte mais Imposante) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-1 rounded-full bg-[#006c49]"></div>
          <h3 className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-gray-400">
            Programme du {selectedDate.getDate()} {selectedDate.toLocaleDateString('fr-FR', { month: 'short' })}
          </h3>
        </div>
        
        <div className="group bg-white border border-gray-100 rounded-[1.8rem] p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col items-center justify-center bg-[#f1f4f2] rounded-2xl min-w-[56px] h-14 border border-gray-50">
              <span className="text-[13px] font-display font-black text-[#006c49]">10:00</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">12:00</span>
            </div>
            
            <div className="min-w-0">
              <p className="font-display font-black text-[#1a1c1e] text-[15px] tracking-tighter truncate">Data Science</p>
              <div className="flex items-center gap-2 mt-0.5 text-gray-400">
                <User size={10} strokeWidth={3} className="shrink-0" />
                <p className="text-[9px] font-bold uppercase truncate">Prof. Bacha Sami</p>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#d1f4e0] flex items-center justify-center text-[#006c49]">
            <CheckCircle2 size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

    </section>
  );
};

export default Agenda;