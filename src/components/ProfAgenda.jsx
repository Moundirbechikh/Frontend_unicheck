import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Play, 
  MapPin, 
  Coffee, 
  Eye, 
  FileWarning,
  CalendarDays,
  BookOpen, // Pour le background
  Clock
} from 'lucide-react';
import CalendarDay from './CalendarDay';

const ProfAgenda = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  
  const today = new Date();
  
  // Logique du Calendrier
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  let firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthYearTitle = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Définition des 6 créneaux horaires types
  const timeSlots = [
    { id: 1, start: "08:30", end: "10:00" },
    { id: 2, start: "10:10", end: "11:40" },
    { id: 3, start: "11:50", end: "13:20" },
    { id: 4, start: "13:30", end: "15:00" },
    { id: 5, start: "15:10", end: "16:40" },
    { id: 6, start: "16:50", end: "18:20" },
  ];

  // Simulation de données
  const getSessionsForDate = (date) => {
    if (date.getDay() === 1) { // Exemple : Le lundi
      return {
        1: { module: "Algorithmes", group: "G1 SITW", room: "S12", status: "done", hasJustifications: true },
        2: { module: "Web Arch", group: "G2 SITW", room: "Labo 4", status: "current", hasJustifications: false },
        4: { module: "Data Science", group: "G1 SITW", room: "Amphi B", status: "upcoming", hasJustifications: false },
      };
    }
    return {}; // Jour vide
  };

  const dailySessions = getSessionsForDate(selectedDate);

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body overflow-hidden relative">
      
      {/* --- BACKGROUND LUCIDE ICONS (Style Dashboard) --- */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <CalendarDays size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <BookOpen size={400} strokeWidth={1} />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10"
      >
        
        {/* --- HEADER : TITRE & DATE DU JOUR --- */}
        <motion.div variants={itemAnim} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[#006c49] ml-1">
              Espace Professeur
            </p>
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Mes <span className="text-[#006c49]">Cours.</span>
            </h1>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-black/5">
             <div className="w-12 h-12 bg-[#1a1c1e] text-white rounded-2xl flex items-center justify-center">
                <Clock size={24} />
             </div>
             <div className="pr-4">
                <p className="text-[10px] font-display font-black uppercase tracking-widest text-gray-400">Date Sélectionnée</p>
                <p className="font-display font-black text-lg text-[#1a1c1e]">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
             </div>
          </div>
        </motion.div>

        {/* --- STRUCTURE DESKTOP : 12 COLONNES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* == COLONNE GAUCHE (Calendrier) - lg:col-span-4 == */}
          <motion.div variants={itemAnim} className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 lg:sticky lg:top-32">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-black text-[#1a1c1e] capitalize tracking-tighter">
                  {monthYearTitle}
                </h2>
                <div className="flex gap-1.5 bg-[#f1f4f2] p-1.5 rounded-2xl border border-gray-50">
                  <button onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors"><ChevronLeft size={18}/></button>
                  <button onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors"><ChevronRight size={18}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 items-center justify-items-center">
                {weekdays.map((day, index) => (
                  <div key={day} className={`text-[10px] font-display font-black uppercase tracking-widest mb-3 ${index >= 5 ? 'text-orange-400' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
                
                <AnimatePresence mode="wait">
                  <motion.div key={viewMonth} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="contents">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <CalendarDay key={`e-${i}`} isEmpty />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const d = i + 1;
                      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                      const isSelected = d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
                      return (
                        <CalendarDay 
                          key={d} day={d} isToday={isToday} isSelected={isSelected}
                          onClick={() => setSelectedDate(new Date(viewYear, viewMonth, d))}
                        />
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* == COLONNE DROITE (Programme du jour) - lg:col-span-8 == */}
          <motion.div variants={itemAnim} className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-2 rounded-full bg-[#006c49]"></div>
              <h3 className="text-xs font-display font-black uppercase tracking-[0.2em] text-gray-500">
                Programme de la journée
              </h3>
            </div>

            <div className="space-y-4">
              {timeSlots.map((slot) => {
                const session = dailySessions[slot.id];
                
                return (
                  <div key={slot.id} className="relative group">
                    {session ? (
                      /* SÉANCE OCCUPÉE */
                      <div className={`p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-5 border transition-all ${
                        session.status === 'current' 
                        ? 'bg-[#1a1c1e] text-white border-transparent shadow-xl sm:hover:scale-[1.01]' 
                        : 'bg-white text-[#1a1c1e] border-gray-100 hover:shadow-md'
                      }`}>
                        
                        {/* Infos de la séance */}
                        <div className="flex items-center gap-4">
                          <div className={`flex flex-col items-center justify-center rounded-2xl min-w-[65px] h-16 ${
                            session.status === 'current' ? 'bg-white/10' : 'bg-[#f1f4f2]'
                          }`}>
                            <span className={`text-[15px] font-display font-black ${session.status === 'current' ? 'text-[#10b981]' : 'text-[#006c49]'}`}>
                              {slot.start}
                            </span>
                            <span className="text-[10px] font-bold opacity-40">{slot.end}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-display font-black text-lg tracking-tighter truncate">{session.module}</h4>
                            <div className="flex items-center gap-4 mt-1 opacity-60">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"><Users size={12}/> {session.group}</div>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"><MapPin size={12}/> {session.room}</div>
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'Action (Responsive : bas sur mobile, droite sur PC) */}
                        <div className="flex shrink-0 sm:w-40">
                          {session.status === 'done' ? (
                            /* SÉANCE TERMINÉE : Consulter */
                            // TODO: Au clic, ouvrir un modal/page listant les présences
                            <button className="w-full py-3.5 bg-[#f1f4f2] hover:bg-gray-200 text-[#1a1c1e] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                              <Eye size={16} /> 
                              Consulter
                              {/* Pastille justifications */}
                              {session.hasJustifications && (
                                <span className="absolute -top-2 -right-2 sm:top-auto sm:right-auto sm:relative sm:-mt-0.5 flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full shadow-md">
                                  <FileWarning size={10} />
                                </span>
                              )}
                            </button>
                          ) : (
                            /* SÉANCE À VENIR / EN COURS : Lancer */
                            // TODO: Au clic, déclencher le scan / création de séance
                            <button className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/20 active:scale-95">
                              <Play size={16} fill="currentColor" /> Lancer
                            </button>
                          )}
                        </div>

                      </div>
                    ) : (
                      /* SÉANCE VIDE */
                      <div className="p-4 rounded-[2rem] flex items-center gap-5 border border-dashed border-gray-200 bg-white/40 backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col items-center justify-center min-w-[65px] text-gray-400">
                          <span className="text-[13px] font-black">{slot.start}</span>
                          <span className="text-[9px] font-bold">{slot.end}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Coffee size={16} />
                          </div>
                          <span className="text-[11px] font-display font-black uppercase tracking-widest">Créneau libre</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfAgenda;