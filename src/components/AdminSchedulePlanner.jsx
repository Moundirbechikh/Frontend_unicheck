import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, MapPin, User, X, 
  ChevronRight, AlertCircle, CheckCircle2, 
  Layers, Clock, MoreHorizontal
} from 'lucide-react';

const AdminSchedulePlanner = () => {
  const [selectedGroup, setSelectedGroup] = useState("G1 SITW");
  const [activeDay, setActiveDay] = useState("Dimanche");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
  const timeSlots = ["08:30", "10:10", "13:00", "14:40"];

  const [schedule, setSchedule] = useState([
    { id: 1, day: "Dimanche", time: "08:30", module: "Architecture Web", prof: "Dr. Hamidi", room: "Labo 04" },
    { id: 2, day: "Lundi", time: "10:10", module: "Algorithmes", prof: "Mme. Belkaid", room: "Amphi B" },
    { id: 3, day: "Mercredi", time: "13:00", module: "Base de Données", prof: "Mr. Ziri", room: "Salle 12" },
  ]);

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">
      
      {/* DECORATION BACKGROUND */}
      <div className="absolute top-20 -right-20 text-[#006c49]/5 rotate-45 pointer-events-none">
        <Calendar size={600} strokeWidth={1} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* --- HEADER & NAVIGATION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 w-full md:w-auto">
            <h1 className="text-5xl md:text-7xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Planning<span className="text-[#006c49]">.</span>
            </h1>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["G1 SITW", "G2 SITW", "Master GL"].map(group => (
                <button 
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedGroup === group ? 'bg-[#1a1c1e] text-white shadow-lg' : 'bg-white text-gray-400'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex bg-[#006c49] text-white px-8 py-5 rounded-[2rem] font-display font-black text-sm shadow-xl shadow-[#006c49]/20 items-center gap-3 hover:scale-105 transition-transform"
          >
            <Plus size={20} strokeWidth={3} /> AJOUTER UN CRÉNEAU
          </button>
        </div>

        {/* --------------------------------------------------------- */}
        {/* --- VUE DESKTOP : LA GRILLE (Visible sur MD et +) --- */}
        {/* --------------------------------------------------------- */}
        <div className="hidden md:block bg-white/40 backdrop-blur-md rounded-[3rem] border border-white p-6 shadow-xl overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header Jours */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div className="flex items-center justify-center font-black text-[10px] text-gray-400 uppercase tracking-widest">Heures</div>
              {days.map(day => (
                <div key={day} className="text-center font-display font-black text-[#1a1c1e] uppercase tracking-widest text-xs py-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100">
                  {day}
                </div>
              ))}
            </div>

            {/* Corps Grille */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-6 gap-4 mb-4">
                <div className="flex items-center justify-center">
                   <div className="bg-[#1a1c1e] text-white px-4 py-2 rounded-full font-black text-[10px]">
                     {time}
                   </div>
                </div>
                {days.map(day => {
                  const course = schedule.find(s => s.day === day && s.time === time);
                  return (
                    <div key={`${day}-${time}`} className="relative h-40 group">
                      {course ? (
                        <motion.div layoutId={`course-${course.id}`} className="absolute inset-0 bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden">
                          <div className="space-y-1">
                            <h4 className="font-display font-black text-[#1a1c1e] text-sm leading-tight uppercase tracking-tight">{course.module}</h4>
                            <p className="text-[10px] font-bold text-[#006c49] flex items-center gap-1"><User size={10}/> {course.prof}</p>
                          </div>
                          <div className="pt-2 border-t border-dashed border-gray-100 flex items-center justify-between">
                             <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                               <MapPin size={10} className="text-orange-400"/> {course.room}
                             </span>
                             <CheckCircle2 size={12} className="text-[#006c49]" />
                          </div>
                        </motion.div>
                      ) : (
                        <button onClick={() => setIsModalOpen(true)} className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-[2rem] hover:border-[#006c49] hover:bg-[#d1f4e0]/20 transition-all flex items-center justify-center group">
                           <Plus size={24} className="text-gray-200 group-hover:text-[#006c49] group-hover:scale-110 transition-all" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* --- VUE MOBILE : LA TIMELINE (Visible sur Mobile seulement) --- */}
        {/* --------------------------------------------------------- */}
        <div className="md:hidden space-y-6">
          {/* Sélecteur de jour horizontal */}
          <div className="bg-white p-2 rounded-[2rem] shadow-sm flex justify-between gap-1 border border-gray-100">
            {days.map(day => (
              <button key={day} onClick={() => setActiveDay(day)} className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${activeDay === day ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400'}`}>
                <span className="text-[10px] font-black uppercase tracking-tighter">{day.substring(0, 3)}</span>
                {activeDay === day && <div className="w-1 h-1 bg-[#006c49] rounded-full" />}
              </button>
            ))}
          </div>

          {/* Liste verticale */}
          <div className="space-y-4">
            {timeSlots.map((time) => {
              const course = schedule.find(s => s.day === activeDay && s.time === time);
              return (
                <div key={time} className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#1a1c1e] text-white px-3 py-1 rounded-full font-black text-[9px]">{time}</div>
                    <div className="w-0.5 h-full bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex-1 pb-4">
                    {course ? (
                      <div className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-white transition-all relative">
                        <h4 className="font-display font-black text-[#1a1c1e] text-lg uppercase tracking-tighter">{course.module}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#006c49] bg-[#d1f4e0] px-2.5 py-1 rounded-lg">
                            <User size={12}/> {course.prof}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg">
                            <MapPin size={12}/> {course.room}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setIsModalOpen(true)} className="w-full h-20 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex items-center justify-center text-gray-300 font-black text-[10px] uppercase tracking-widest">
                        Libre +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- FOOTER : ANALYSE D'INTELLIGENCE (SHARED) --- */}
        <div className="bg-[#1a1c1e] rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#006c49]/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-[#006c49] rounded-2xl flex items-center justify-center shadow-lg shadow-[#006c49]/20">
              <Layers size={28} className="text-white" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl md:text-2xl tracking-tighter">Vérificateur Intelligent</h3>
              <p className="text-gray-400 text-xs md:text-sm font-medium">Analyse des conflits prof/salle en temps réel.</p>
            </div>
          </div>
          <div className="flex gap-4 relative z-10 w-full md:w-auto">
             <div className="flex-1 md:flex-none bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                <p className="text-[10px] font-black uppercase text-[#006c49] mb-1">Salles Libres</p>
                <p className="text-2xl font-display font-black">14<span className="text-gray-500">/20</span></p>
             </div>
             <div className="flex-1 md:flex-none bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                <p className="text-[10px] font-black uppercase text-orange-400 mb-1">Profs Occupés</p>
                <p className="text-2xl font-display font-black">08<span className="text-gray-500">/38</span></p>
             </div>
          </div>
        </div>

      </div>

      {/* --- MODALE UNIFIÉE (RESPONSIVE) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#1a1c1e]/80 backdrop-blur-md" />
            <motion.div 
              initial={{ y: "100%", scale: 0.95 }} 
              animate={{ y: 0, scale: 1 }} 
              exit={{ y: "100%", scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-t-[3rem] md:rounded-[3.5rem] p-8 md:p-12 relative z-10 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 md:hidden" />
              <button onClick={() => setIsModalOpen(false)} className="hidden md:flex absolute top-8 right-8 w-12 h-12 bg-[#f1f4f2] rounded-full items-center justify-center text-gray-400 hover:text-black transition-all">
                <X size={20} />
              </button>
              
              <h2 className="font-display font-black text-4xl md:text-5xl text-[#1a1c1e] tracking-tighter mb-8 leading-[0.8]">
                Nouveau <br/> <span className="text-[#006c49]">Cours.</span>
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Module</label>
                  <input type="text" placeholder="Développement Mobile" className="w-full bg-[#f1f4f2] border-none rounded-2xl py-5 px-6 font-bold text-lg focus:ring-2 focus:ring-[#006c49]/20" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Enseignant</label>
                    <select className="w-full bg-[#f1f4f2] border-none rounded-2xl py-5 px-6 font-bold text-sm appearance-none">
                      <option>Dr. Hamidi</option>
                      <option>Mme. Belkaid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Salle</label>
                    <input type="text" placeholder="Salle 12" className="w-full bg-[#f1f4f2] border-none rounded-2xl py-5 px-6 font-bold text-sm" />
                  </div>
                </div>

                <div className="bg-orange-50 p-5 rounded-[2rem] flex items-start gap-4 border border-orange-100">
                  <AlertCircle className="text-orange-500 shrink-0 mt-1" size={20} />
                  <p className="text-[11px] md:text-xs text-orange-700 font-bold leading-relaxed">
                    <span className="uppercase">Vérification :</span> Le prof est déjà occupé dans un autre groupe à cette heure précise. Veuillez changer de créneau.
                  </p>
                </div>

                <button className="w-full py-6 bg-[#1a1c1e] text-white rounded-[2.5rem] font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] transition-all shadow-xl shadow-black/10">
                  Enregistrer le planning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default AdminSchedulePlanner;