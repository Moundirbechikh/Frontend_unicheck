import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Users, Play, MapPin,
  Coffee, Eye, CalendarDays, BookOpen, Clock, History
} from 'lucide-react';
import CalendarDay from './CalendarDay';
import ActiveAttendanceSession from './ActiveAttendanceSession';
import AttendanceListModal from './AttendanceListModal';

const timeSlots = [
  { id: 1, start: "08:30", end: "10:00" },
  { id: 2, start: "10:10", end: "11:40" },
  { id: 3, start: "13:00", end: "14:30" },
  { id: 4, start: "14:40", end: "16:10" },
  { id: 5, start: "16:20", end: "17:50" },
];

const TYPE_COLORS = {
  COURS: 'bg-[#1a1c1e] text-white',
  TD:    'bg-indigo-600 text-white',
  TP:    'bg-orange-500 text-white',
};

// Formate une date ISO en "14 mai" ou "14 mai 2025"
const formatDateCourte = (isoStr, avecAnnee = false) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', ...(avecAnnee ? { year: 'numeric' } : {}),
  });
};

const formatHeure = (isoStr) => {
  if (!isoStr) return '--:--';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// ─────────────────────────────────────────────────────────────────────────────
const ProfAgenda = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSeance,    setActiveSeance]    = useState(null);
  const [viewingSession,  setViewingSession]  = useState(null);
  const [selectedDate,    setSelectedDate]    = useState(new Date());
  const [viewDate,        setViewDate]        = useState(new Date());
  const [dailySessions,   setDailySessions]   = useState({});
  const [isLoading,       setIsLoading]       = useState(false);

  const today = new Date();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  // ── Fetch séances ──────────────────────────────────────────────────────────
// Dans ProfAgenda.jsx, remplace la fonction fetchSeances par celle-ci :

const fetchSeances = useCallback(async () => {
  setIsLoading(true);
  const profId = localStorage.getItem('userId') || 1;
  
  // On formate la date sélectionnée sur le calendrier
  const formattedDate = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0'),
  ].join('-');

  try {
    // CRUCIAL : Ton API doit utiliser "datePlanifiee" dans sa requête SQL/JPA
    const res = await fetch(
      `https://backend-unicheck.onrender.com/api/seances/prof/${profId}/date?date=${formattedDate}`,
      { headers: getAuthHeaders() }
    );
    
    if (!res.ok) { setDailySessions({}); return; }

    const data = await res.json();
    const map = {};

    data.forEach(seance => {
      // 1. On identifie le créneau horaire (08:30, 10:10, etc.)
      const heureMin = seance.heurePlage || '';
      const slot = timeSlots.find(s => s.start === heureMin)
                || timeSlots.find(s => s.start.substring(0, 2) === heureMin.substring(0, 2));
      
      if (!slot) return;

      // 2. Préparation des infos de "Tenue" (Historique)
      let tenueInfo = null;
      if (seance.estTerminee && seance.dateHeureLancement) {
        // On compare la date prévue et la date réelle de lancement
        const datePrevue = new Date(seance.datePlanifiee).toLocaleDateString('fr-FR');
        const dateReelle = new Date(seance.dateHeureLancement).toLocaleDateString('fr-FR');
        
        tenueInfo = {
          heureLancement: formatHeure(seance.dateHeureLancement),
          heureFin: seance.dateHeureFin ? formatHeure(seance.dateHeureFin) : null,
          // On n'affiche la date que si le prof a lancé la séance un autre jour
          dateDifferente: datePrevue !== dateReelle ? dateReelle : null,
        };
      }

      // 3. Mapping final
      map[slot.id] = {
        id: seance.id,
        module: seance.cours?.libelle || seance.titre || "Module",
        typeSeance: seance.typeSeance || "Cours",
        group: seance.groupe || "G-?",
        room: seance.salle?.nom || "Salle",
        status: seance.estTerminee ? "done" : (seance.estActive ? "current" : "upcoming"),
        tenueInfo,
        seanceComplet: seance,
      };
    });

    setDailySessions(map);
  } catch (err) {
    console.error("Erreur fetch séances :", err);
    setDailySessions({});
  } finally {
    setIsLoading(false);
  }
}, [selectedDate, getAuthHeaders]);

  useEffect(() => { fetchSeances(); }, [fetchSeances]);

  // ── Lancer une séance ──────────────────────────────────────────────────────
  const handleLancerSeance = async (seanceId, sessionObj) => {
    if (!("geolocation" in navigator)) { alert("Géolocalisation non supportée."); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://backend-unicheck.onrender.com/api/seances/${seanceId}/lancer`,
            {
              method:  'PUT',
              headers: getAuthHeaders(),
              body:    JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            }
          );
          if (res.ok) {
            setActiveSeance(sessionObj.seanceComplet || sessionObj);
            setIsSessionActive(true);
          } else {
            alert("Impossible de lancer : " + await res.text());
          }
        } catch (err) { console.error(err); }
      },
      (err) => alert("Erreur géolocalisation : " + err.message)
    );
  };

  // ── Session active → afficher ActiveAttendanceSession ─────────────────────
  if (isSessionActive && activeSeance) {
    return (
      <ActiveAttendanceSession
        seance={activeSeance}
        onStopSession={() => { setIsSessionActive(false); setActiveSeance(null); fetchSeances(); }}
      />
    );
  }

  // ── Calendrier ────────────────────────────────────────────────────────────
  const viewYear    = viewDate.getFullYear();
  const viewMonth   = viewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  let   firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const weekdays       = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthYearTitle = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemAnim  = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body overflow-hidden relative">
      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Fond déco */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <CalendarDays size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <BookOpen size={400} strokeWidth={1} />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div variants={itemAnim}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[#006c49] ml-1">
              Espace Professeur
            </p>
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e]
                           tracking-tighter leading-none">
              Mes <span className="text-[#006c49]">Cours.</span>
            </h1>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-5 rounded-[2rem]
                          flex items-center gap-4 shadow-xl shadow-black/5">
            <div className="w-12 h-12 bg-[#1a1c1e] text-white rounded-2xl flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div className="pr-2">
              <p className="text-[10px] font-display font-black uppercase tracking-widest text-gray-400">
                Date sélectionnée
              </p>
              <p className="font-display font-black text-lg text-[#1a1c1e]">
                {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Layout ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* ── Calendrier ─────────────────────────────────────────────── */}
          <motion.div variants={itemAnim} className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 lg:sticky lg:top-32">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-black text-[#1a1c1e] capitalize tracking-tighter">
                  {monthYearTitle}
                </h2>
                <div className="flex gap-1.5 bg-[#f1f4f2] p-1.5 rounded-2xl border border-gray-50">
                  <button
                    onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={18}/>
                  </button>
                  <button
                    onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-gray-50 transition-colors">
                    <ChevronRight size={18}/>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 items-center justify-items-center">
                {weekdays.map((day, idx) => (
                  <div key={day}
                    className={`text-[10px] font-display font-black uppercase tracking-widest mb-3
                                ${idx >= 5 ? 'text-orange-400' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
                <AnimatePresence mode="wait">
                  <motion.div key={viewMonth} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="contents">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <CalendarDay key={`e-${i}`} isEmpty />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const d          = i + 1;
                      const isToday    = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                      const isSelected = d === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();
                      return (
                        <CalendarDay key={d} day={d} isToday={isToday} isSelected={isSelected}
                          onClick={() => setSelectedDate(new Date(viewYear, viewMonth, d))} />
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ── Programme du jour ──────────────────────────────────────── */}
          <motion.div variants={itemAnim} className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-2 rounded-full bg-[#006c49]" />
              <h3 className="text-xs font-display font-black uppercase tracking-[0.2em] text-gray-500">
                Programme de la journée
                {isLoading && (
                  <span className="ml-2 text-[#006c49] animate-pulse">· chargement…</span>
                )}
              </h3>
            </div>

            <div className="space-y-4">
              {timeSlots.map(slot => {
                const session = dailySessions[slot.id];

                return (
                  <div key={slot.id}>
                    {session ? (
                      <div className={`p-4 sm:p-5 rounded-[2rem] flex flex-col sm:flex-row
                                       sm:items-center justify-between gap-4 border transition-all
                        ${session.status === 'current'
                          ? 'bg-[#1a1c1e] border-transparent shadow-xl'
                          : session.status === 'done'
                            ? 'bg-white/60 border-gray-100'
                            : 'bg-white border-gray-100 hover:shadow-md'}`}>

                        {/* Infos séance */}
                        <div className="flex items-start gap-4">
                          {/* Heure planifiée */}
                          <div className={`flex flex-col items-center justify-center rounded-2xl
                                           min-w-[65px] h-16 shrink-0
                            ${session.status === 'current'
                              ? 'bg-[#006c49] text-white'
                              : 'bg-[#f1f4f2] text-gray-500'}`}>
                            <span className="text-[10px] font-black">{slot.start}</span>
                            <span className="text-[10px] font-black">{slot.end}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Titre + badge type */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`font-display font-black text-base uppercase
                                              tracking-tighter leading-tight
                                ${session.status === 'current' ? 'text-white' : 'text-[#1a1c1e]'}`}>
                                {session.module}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black
                                               uppercase tracking-widest shrink-0
                                ${TYPE_COLORS[session.typeSeance?.toUpperCase()] || 'bg-gray-200 text-gray-700'}`}>
                                {session.typeSeance}
                              </span>
                            </div>

                            {/* Groupe + salle */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className={`flex items-center gap-1 text-[10px] font-bold
                                               px-2.5 py-1 rounded-lg
                                ${session.status === 'current'
                                  ? 'bg-white/10 text-white'
                                  : 'bg-[#d1f4e0] text-[#006c49]'}`}>
                                <Users size={11}/> {session.group}
                              </span>
                              <span className={`flex items-center gap-1 text-[10px] font-bold
                                               px-2.5 py-1 rounded-lg
                                ${session.status === 'current'
                                  ? 'bg-white/10 text-orange-300'
                                  : 'bg-orange-50 text-orange-500'}`}>
                                <MapPin size={11}/> {session.room}
                              </span>
                            </div>

                            {/* Badge "Tenue le..." si séance terminée avec info de lancement */}
                            {session.status === 'done' && session.tenueInfo && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <History size={10} className="text-gray-400 shrink-0" />
                                <span className="text-[10px] font-bold text-gray-400">
                                  Tenue
                                  {session.tenueInfo.dateDifferente
                                    ? ` le ${session.tenueInfo.dateDifferente}` : ''}
                                  {' '}à {session.tenueInfo.heureLancement}
                                  {session.tenueInfo.heureFin
                                    ? ` → ${session.tenueInfo.heureFin}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center sm:justify-end gap-2 shrink-0
                                        pt-3 sm:pt-0 border-t sm:border-none border-dashed border-gray-200">
                          {session.status === 'upcoming' && (
                            <button
                              onClick={() => handleLancerSeance(session.id, session)}
                              className="w-full sm:w-auto bg-[#006c49] hover:bg-[#005a3c] text-white
                                         px-5 py-3.5 rounded-2xl font-black text-xs uppercase
                                         tracking-widest transition-colors flex items-center
                                         justify-center gap-2">
                              <Play size={14} fill="currentColor"/> Lancer
                            </button>
                          )}
                          {session.status === 'current' && (
                            <button
                              onClick={() => { setActiveSeance(session.seanceComplet || session); setIsSessionActive(true); }}
                              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white
                                         px-5 py-3.5 rounded-2xl font-black text-xs uppercase
                                         tracking-widest transition-colors flex items-center
                                         justify-center gap-2 shadow-lg">
                              Reprendre
                            </button>
                          )}
                          {session.status === 'done' && (
                            <button
                              onClick={() => setViewingSession(session)}
                              className="w-full sm:w-auto bg-[#e5eee9] hover:bg-[#d1e3d9] text-[#006c49]
                                         px-5 py-3.5 rounded-2xl font-black text-xs uppercase
                                         tracking-widest transition-colors flex items-center
                                         justify-center gap-2">
                              <Eye size={14}/> Présences
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Créneau libre */
                      <div className="p-4 rounded-[2rem] border-2 border-dashed border-gray-200
                                      flex items-center gap-4 h-[100px] bg-white/40 hover:bg-white/70
                                      transition-colors">
                        <div className="flex flex-col items-center justify-center rounded-2xl
                                        min-w-[65px] h-14 bg-transparent text-gray-300">
                          <span className="text-[10px] font-black">{slot.start}</span>
                          <span className="text-[10px] font-black">{slot.end}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 opacity-50">
                          <Coffee size={17}/>
                          <span className="text-xs font-black uppercase tracking-widest">Créneau libre</span>
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

      <AnimatePresence>
        {viewingSession && (
          <AttendanceListModal
            session={viewingSession}
            onClose={() => setViewingSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfAgenda;