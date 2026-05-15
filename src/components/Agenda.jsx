import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, User, CheckCircle2,
  XCircle, Loader2, FileText, Clock, Shield, AlertCircle
} from 'lucide-react';
import CalendarDay from './CalendarDay';

const API = 'https://backend-unicheck.onrender.com';

const Agenda = () => {
  const [selectedDate,    setSelectedDate]    = useState(new Date());
  const [viewDate,        setViewDate]        = useState(new Date());
  const [courses,         setCourses]         = useState([]);
  const [isLoading,       setIsLoading]       = useState(false);

  // statut par seanceId : 'present' | 'absent' | 'justif_attente' | 'justif_accepte' | 'justif_refuse' | 'upcoming'
  const [coursStatuts,    setCoursStatuts]    = useState({});

  const [specialite,        setSpecialite]        = useState(null);
  const [loadingSpecialite, setLoadingSpecialite] = useState(true);

  const navigate    = useNavigate();
  const today       = new Date();
  const viewYear    = viewDate.getFullYear();
  const viewMonth   = viewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  let firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekdays   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const etudiantId = localStorage.getItem('userId');
  const token      = localStorage.getItem('token');
  const headers    = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // ── 1. Récupérer la spécialité ─────────────────────────────────────────────
  useEffect(() => {
    if (!etudiantId || !token) { setLoadingSpecialite(false); return; }

    fetch(`${API}/api/presences/dashboard-stats/${etudiantId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.specialite && data.specialite !== 'Non définie') {
          setSpecialite(data.specialite);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSpecialite(false));
  }, [etudiantId]);

  // ── 2. Fetch séances + statuts complets ───────────────────────────────────
  useEffect(() => {
    if (!specialite || !etudiantId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dateStr = [
          selectedDate.getFullYear(),
          String(selectedDate.getMonth() + 1).padStart(2, '0'),
          String(selectedDate.getDate()).padStart(2, '0'),
        ].join('-');

        const currentStudentId = parseInt(etudiantId);

        const res = await fetch(
          `${API}/api/seances/etudiant/specialite/${specialite}/date?date=${dateStr}`,
          { headers }
        );

        if (!res.ok) { setCourses([]); setCoursStatuts({}); return; }

        const coursesData = await res.json();
        setCourses(coursesData);

        const newStatuts = {};

        for (const cours of coursesData) {
          if (!cours.estTerminee) {
            // Séance à venir ou en cours
            newStatuts[cours.id] = 'upcoming';
            continue;
          }

          // Séance terminée : vérifier la présence
          try {
            const pRes = await fetch(
              `${API}/api/presences/seance/${cours.id}`, { headers }
            );
            if (pRes.ok) {
              const presencesList = await pRes.json();
              const isPresent = presencesList.some(p => p.id === currentStudentId);

              if (isPresent) {
                newStatuts[cours.id] = 'present';
                continue;
              }
            } else {
              newStatuts[cours.id] = 'absent';
              continue;
            }
          } catch {
            newStatuts[cours.id] = 'absent';
            continue;
          }

          // Étudiant absent : vérifier le justificatif
          try {
            const jRes = await fetch(
              `${API}/api/justificatifs/etudiant/${etudiantId}/seance/${cours.id}/statut`,
              { headers }
            );
            if (jRes.ok) {
              const jData = await jRes.json();
              switch (jData.statut) {
                case 'EN_ATTENTE': newStatuts[cours.id] = 'justif_attente';  break;
                case 'ACCEPTE':    newStatuts[cours.id] = 'justif_accepte';  break;
                case 'REFUSE':     newStatuts[cours.id] = 'justif_refuse';   break;
                default:           newStatuts[cours.id] = 'absent';          break;
              }
            } else {
              newStatuts[cours.id] = 'absent';
            }
          } catch {
            newStatuts[cours.id] = 'absent';
          }
        }

        setCoursStatuts(newStatuts);

      } catch (err) {
        console.error("Erreur API Agenda :", err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, specialite]);

  // ── Navigation calendrier ─────────────────────────────────────────────────
  const handlePrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));
  const isCurrentMonth  = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  // ── Statut global du jour sélectionné ────────────────────────────────────
  const getSelectedDayStatus = () => {
    if (courses.length === 0) return null;

    const vals = Object.values(coursStatuts);
    if (vals.length === 0) return null;

    // Si toutes à venir
    if (vals.every(v => v === 'upcoming')) return 'upcoming';

    const terminated = courses.filter(c => c.estTerminee);
    if (terminated.length === 0) return 'upcoming';

    // Priorité des statuts pour la journée
    const termStatuts = terminated.map(c => coursStatuts[c.id]);
    if (termStatuts.some(s => s === 'absent' || s === 'justif_refuse'))  return 'absent';
    if (termStatuts.some(s => s === 'justif_attente'))                    return 'justif_attente';
    if (termStatuts.every(s => s === 'present' || s === 'justif_accepte')) return 'present';
    return 'absent';
  };

  // ── Navigation vers justificatif ──────────────────────────────────────────
  const handleDeposerJustificatif = (seanceId) => {
    navigate('/student/justificatifs', { state: { preselectedSeanceId: seanceId } });
  };

  // ── Config d'affichage par statut ─────────────────────────────────────────
  const getCoursConfig = (statut) => {
    switch (statut) {
      case 'present':
        return {
          cardClass: 'border-gray-100',
          heureColor: 'text-[#006c49]',
          badge: null,
          iconBg: 'bg-[#d1f4e0]',
          iconColor: 'text-[#006c49]',
          Icon: CheckCircle2,
          showJustifBtn: false,
        };
      case 'justif_accepte':
        return {
          cardClass: 'border-[#006c49]/20 bg-[#f1f4f2]/50',
          heureColor: 'text-[#006c49]',
          badge: { label: 'Justifié ✓', cls: 'bg-[#d1f4e0] text-[#006c49]' },
          iconBg: 'bg-[#d1f4e0]',
          iconColor: 'text-[#006c49]',
          Icon: Shield,
          showJustifBtn: false,
        };
      case 'justif_attente':
        return {
          cardClass: 'border-orange-100 bg-orange-50/20',
          heureColor: 'text-orange-500',
          badge: { label: 'En attente', cls: 'bg-orange-100 text-orange-600' },
          iconBg: 'bg-orange-50',
          iconColor: 'text-orange-500',
          Icon: Clock,
          showJustifBtn: false,
        };
      case 'justif_refuse':
        return {
          cardClass: 'border-red-100 bg-red-50/20',
          heureColor: 'text-red-500',
          badge: { label: 'Refusé', cls: 'bg-red-100 text-red-600' },
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          Icon: XCircle,
          showJustifBtn: true, // Peut re-justifier
        };
      case 'absent':
        return {
          cardClass: 'border-red-100',
          heureColor: 'text-red-400',
          badge: null,
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          Icon: XCircle,
          showJustifBtn: true,
        };
      case 'upcoming':
        return {
          cardClass: 'border-blue-100 bg-blue-50/30',
          heureColor: 'text-blue-500',
          badge: { label: 'À venir', cls: 'bg-blue-100 text-blue-500' },
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-400',
          Icon: Clock,
          showJustifBtn: false,
        };
      default:
        return {
          cardClass: 'border-gray-100',
          heureColor: 'text-[#006c49]',
          badge: null,
          iconBg: 'bg-gray-50',
          iconColor: 'text-gray-400',
          Icon: Clock,
          showJustifBtn: false,
        };
    }
  };

  const monthYearTitle = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (loadingSpecialite) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="animate-spin text-[#006c49]" size={24} />
    </div>
  );

  if (!specialite) return (
    <div className="bg-white border border-gray-100 rounded-[1.8rem] p-6 text-center shadow-sm">
      <p className="text-gray-400 text-sm font-semibold">
        Spécialité non définie — agenda indisponible.
      </p>
    </div>
  );

  return (
    <section className="space-y-8 font-body">

      {/* ── CALENDRIER ───────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl sm:text-2xl font-display font-black text-[#1a1c1e] capitalize tracking-tighter">
            {monthYearTitle}
          </h2>

          <div className="flex gap-1.5 bg-[#f1f4f2] p-1 rounded-xl border border-gray-100">
            <button onClick={handlePrevMonth}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white shadow-sm active:bg-gray-100 transition-colors">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <button onClick={handleNextMonth} disabled={isCurrentMonth}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors
                ${isCurrentMonth ? 'opacity-20' : 'bg-white shadow-sm active:bg-gray-100'}`}>
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 items-center justify-items-center">
          {weekdays.map((day, index) => (
            <div key={day}
              className={`text-[9px] sm:text-[10px] font-display font-black uppercase tracking-widest mb-2
                          ${index >= 5 ? 'text-red-400' : 'text-gray-400'}`}>
              {day}
            </div>
          ))}

          <AnimatePresence mode="wait">
            <motion.div key={viewMonth} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="contents">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <CalendarDay key={`empty-${i}`} isEmpty />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNumber  = i + 1;
                const isToday    = dayNumber === today.getDate()
                                && viewMonth === today.getMonth()
                                && viewYear  === today.getFullYear();
                const isSelected = dayNumber === selectedDate.getDate()
                                && viewMonth === selectedDate.getMonth()
                                && viewYear  === selectedDate.getFullYear();
                const status = isSelected ? getSelectedDayStatus() : null;

                return (
                  <CalendarDay
                    key={dayNumber}
                    day={dayNumber}
                    isToday={isToday}
                    isSelected={isSelected}
                    status={status}
                    onClick={() => setSelectedDate(new Date(viewYear, viewMonth, dayNumber))}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── LISTE DES COURS ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-1 rounded-full bg-[#006c49]" />
          <h3 className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-gray-400">
            Programme du {selectedDate.getDate()}{' '}
            {selectedDate.toLocaleDateString('fr-FR', { month: 'short' })}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-[#006c49]" size={24} />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[1.8rem] p-6 text-center shadow-sm">
            <p className="text-gray-400 text-sm font-semibold">Aucun cours programmé pour ce jour.</p>
          </div>
        ) : (
          courses.map(cours => {
            const dateDebut = new Date(cours.dateHeureDebut);
            const dateFin   = cours.dateHeureFin
              ? new Date(cours.dateHeureFin)
              : new Date(dateDebut.getTime() + 2 * 60 * 60 * 1000);

            const statut = coursStatuts[cours.id] || 'upcoming';
            const cfg    = getCoursConfig(statut);
            const { Icon } = cfg;

            const typeLabel = cours.typeSeance && cours.typeSeance !== 'Cours'
              ? cours.typeSeance : null;

            return (
              <div key={cours.id}
                className={`group bg-white border rounded-[1.8rem] p-4 flex items-center
                            justify-between shadow-sm hover:shadow-md transition-all ${cfg.cardClass}`}
              >
                {/* Gauche */}
                <div className="flex items-center gap-4 min-w-0">

                  {/* Heure */}
                  <div className="flex flex-col items-center justify-center bg-[#f1f4f2] rounded-2xl min-w-[56px] h-14 border border-gray-50 shrink-0">
                    <span className={`text-[13px] font-display font-black ${cfg.heureColor}`}>
                      {dateDebut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      {dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-black text-[#1a1c1e] text-[15px] tracking-tighter truncate">
                        {cours.cours?.libelle || cours.titre || "Matière non spécifiée"}
                      </p>
                      {typeLabel && (
                        <span className="text-[9px] font-black font-display uppercase tracking-widest
                                         bg-[#f1f4f2] text-gray-500 px-2 py-0.5 rounded-lg shrink-0">
                          {typeLabel}
                        </span>
                      )}
                      {cfg.badge && (
                        <span className={`text-[9px] font-black font-display uppercase tracking-widest
                                          px-2 py-0.5 rounded-lg shrink-0 ${cfg.badge.cls}`}>
                          {cfg.badge.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-gray-400">
                      <User size={10} strokeWidth={3} className="shrink-0" />
                      <p className="text-[9px] font-bold uppercase truncate">
                        {cours.professeur
                          ? `Prof. ${cours.professeur.prenom} ${cours.professeur.nom}`
                          : "Professeur inconnu"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Droite */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {/* Bouton justificatif — absent sans justif ou refusé */}
                  {cfg.showJustifBtn && (
                    <button
                      onClick={() => handleDeposerJustificatif(cours.id)}
                      title={statut === 'justif_refuse'
                        ? "Soumettre un nouveau justificatif"
                        : "Déposer un justificatif"}
                      className="w-10 h-10 rounded-xl flex items-center justify-center
                                 bg-orange-50 text-orange-500
                                 hover:bg-orange-500 hover:text-white
                                 transition-all duration-200"
                    >
                      <FileText size={16} strokeWidth={2.5} />
                    </button>
                  )}

                  {/* Icône statut */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                   transition-colors duration-300 ${cfg.iconBg} ${cfg.iconColor}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* ── Légende ──────────────────────────────────────────────────────── */}
        {courses.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-2 pt-1">

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[#d1f4e0] flex items-center justify-center">
                <CheckCircle2 size={9} className="text-[#006c49]" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">Présent</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle size={9} className="text-red-500" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">Absent</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-50 flex items-center justify-center">
                <FileText size={9} className="text-orange-500" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">Justifier</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock size={9} className="text-orange-500" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">En attente</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[#d1f4e0] flex items-center justify-center">
                <Shield size={9} className="text-[#006c49]" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">Justifié ✓</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={9} className="text-red-500" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">Refusé</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock size={9} className="text-blue-400" strokeWidth={3}/>
              </div>
              <span className="text-[10px] text-gray-400 font-bold">À venir</span>
            </div>

          </div>
        )}
      </div>
    </section>
  );
};

export default Agenda;