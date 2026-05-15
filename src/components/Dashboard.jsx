import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Clock, CheckCircle2, ShieldCheck,
  ArrowUpRight, PlayCircle, CalendarDays, LayoutDashboard,
  Activity, XCircle, Trophy
} from 'lucide-react';
import StudentScannerModal from './StudentScannerModal';

const todayLabel = () =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Format heure depuis une ISO string ────────────────────────────────────────
const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [isScannerOpen,  setIsScannerOpen]  = useState(false);
  const [studentId,      setStudentId]      = useState(null);
  const [stats,          setStats]          = useState(null);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [currentSeance,  setCurrentSeance]  = useState(null);
  const [seanceStatus,   setSeanceStatus]   = useState('NONE'); // LANCE | IMMINENT | NONE
  const [presencesCount, setPresencesCount] = useState(0);

  useEffect(() => {
    const id    = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!id || !token) return;
    setStudentId(id);

    const fetchDashboardData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      try {
        // 1. Stats
        const resStats = await fetch(
          `https://backend-unicheck.onrender.com/api/presences/dashboard-stats/${id}`, { headers }
        );
        if (!resStats.ok) return;
        const statsData = await resStats.json();
        setStats(statsData);

        // 2. Séances du jour
        if (statsData.specialite && statsData.specialite !== 'Non définie') {
          const today     = new Date().toISOString().split('T')[0];
          const resSeances = await fetch(
            `https://backend-unicheck.onrender.com/api/seances/etudiant/specialite/${statsData.specialite}/date?date=${today}`,
            { headers }
          );
          if (!resSeances.ok) return;

          const seances = await resSeances.json();

          // Séance active (en cours)
          const activeSeance = seances.find(s => s.estActive && !s.estTerminee);
          if (activeSeance) {
            setCurrentSeance(activeSeance);
            setSeanceStatus('LANCE');

            const resPresences = await fetch(
              `https://backend-unicheck.onrender.com/api/presences/seance/${activeSeance.id}`, { headers }
            );
            if (resPresences.ok) {
              const presData = await resPresences.json();
              setPresencesCount(presData.length);
            }
            return;
          }

          // Prochaine séance (non terminée)
          const upcoming = seances.filter(s => !s.estTerminee);
          if (upcoming.length > 0) {
            setCurrentSeance(upcoming[0]);
            setSeanceStatus('IMMINENT');
          } else {
            setSeanceStatus('NONE');
          }
        }
      } catch (err) {
        console.error('Dashboard error :', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ── Stats cards ──────────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Présence globale',
      val:   loadingStats ? '…' : `${stats?.pourcentagePresence ?? 0}%`,
      icon:  CheckCircle2,
      color: 'text-[#006c49]',
      bg:    'bg-[#d1f4e0]',
    },
    {
      label: 'Absences',
      val:   loadingStats ? '…' : String(stats?.totalAbsences ?? 0).padStart(2, '0'),
      icon:  XCircle,
      color: 'text-orange-500',
      bg:    'bg-orange-50',
    },
    {
      label: `Rang ${stats?.specialite ?? ''}`,
      val:   loadingStats ? '…' : stats?.totalEtudiants > 0 ? `#${stats.rang}` : '—',
      sub:   !loadingStats && stats?.totalEtudiants > 0 ? `sur ${stats.totalEtudiants} étudiants` : null,
      icon:  Trophy,
      color: 'text-blue-500',
      bg:    'bg-blue-50',
    },
  ];

  // ── Helpers affichage séance ──────────────────────────────────────────────
  const getModuleLabel = () => {
    if (!currentSeance) return 'Séance';
    return currentSeance.cours?.libelle || currentSeance.titre || 'Séance';
  };

  const getProfLabel = () => {
    if (!currentSeance?.professeur) return '';
    const { prenom, nom } = currentSeance.professeur;
    return `${prenom || ''} ${nom || ''}`.trim() || '';
  };

  const getSalleLabel = () => {
    if (!currentSeance?.salle) return 'à définir';
    // Salle est un objet {id, nom} grâce au nouveau DTO
    return currentSeance.salle.nom || 'à définir';
  };

  const getTypeLabel = () => currentSeance?.typeSeance || '';

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">

      <StudentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={() => setIsScannerOpen(false)}
        studentId={studentId}
      />

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
        .glass-effect {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.4);
        }
      `}</style>

      {/* Fond déco */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <LayoutDashboard size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <Activity size={400} strokeWidth={1} />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
              <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.8]">
              Tableau <br/> <span className="text-[#006c49]">de bord.</span>
            </h1>
          </div>

          <div className="glass-effect p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-black/5">
            <div className="w-12 h-12 bg-[#1a1c1e] text-white rounded-2xl flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-[10px] font-display font-black uppercase tracking-widest text-gray-400">
                Aujourd'hui
              </p>
              <p className="font-display font-black text-lg text-[#1a1c1e] capitalize leading-snug">
                {capitalize(todayLabel())}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Stats cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map((stat, i) => (
            <motion.div key={i} variants={item}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-xl
                         transition-all group overflow-hidden relative">
              <div className={`absolute -right-4 -bottom-4 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}>
                <stat.icon size={120} strokeWidth={3} />
              </div>
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-display font-black uppercase tracking-widest text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-5xl font-display font-black text-[#1a1c1e] tracking-tighter">
                {stat.val}
              </p>
              {stat.sub && (
                <p className="text-[11px] font-bold text-gray-400 mt-1">{stat.sub}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Séance + Scan ─────────────────────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Séance card */}
          <div className="lg:col-span-8 bg-[#1a1c1e] rounded-[3rem] p-8 md:p-12 text-white
                          relative overflow-hidden shadow-2xl shadow-[#006c49]/20 min-h-[380px]">
            <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
              <LayoutGrid size={300} strokeWidth={1} />
            </div>

            <div className="relative z-10 space-y-8">
              {/* Badge statut */}
              <div>
                <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-display
                                  font-black uppercase tracking-widest
                  ${seanceStatus === 'LANCE'   ? 'bg-[#006c49]'
                  : seanceStatus === 'IMMINENT' ? 'bg-orange-500'
                  :                              'bg-gray-600'}`}>
                  {seanceStatus === 'LANCE'    ? '🔴 Cours en cours'
                  : seanceStatus === 'IMMINENT' ? 'Séance imminente'
                  :                              'Libre'}
                </span>
              </div>

              {seanceStatus !== 'NONE' && currentSeance ? (
                <>
                  {/* Module + type */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 flex-wrap">
                      <h3 className="text-5xl md:text-6xl font-display font-black tracking-tighter leading-none">
                        {getModuleLabel().split(' ').slice(0, 1).join(' ')}
                        {getModuleLabel().split(' ').length > 1 && (
                          <><br/><span className="text-[#006c49]">
                            {getModuleLabel().split(' ').slice(1).join(' ')}
                          </span></>
                        )}
                      </h3>
                      {getTypeLabel() && (
                        <span className="mt-2 px-3 py-1 bg-white/10 text-white/80 rounded-xl
                                         text-[10px] font-black uppercase tracking-widest">
                          {getTypeLabel()}
                        </span>
                      )}
                    </div>

                    {/* Infos : heure, prof, salle */}
                    <div className="flex flex-wrap gap-5 text-gray-400 font-bold text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Clock size={16} />
                        {formatTime(currentSeance.dateHeureDebut)
                          ? `À partir de ${formatTime(currentSeance.dateHeureDebut)}`
                          : currentSeance.heurePlage || '--:--'}
                      </span>
                      {getProfLabel() && (
                        <span className="flex items-center gap-2 text-gray-300">
                          Prof. {getProfLabel()}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={16} />
                        Salle {getSalleLabel()}
                      </span>
                    </div>
                  </div>

                  {/* Présences si séance active */}
                  {seanceStatus === 'LANCE' && (
                    <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(n => (
                          <div key={n}
                            className="w-10 h-10 rounded-full border-2 border-[#1a1c1e] bg-gray-600
                                       flex items-center justify-center text-[10px] font-black">
                            S{n}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        <span className="text-white font-black">{presencesCount} étudiants</span> déjà présents
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Pas de séance */
                <div className="space-y-4 py-6">
                  <h3 className="text-4xl md:text-5xl font-display font-black tracking-tighter leading-none text-gray-400">
                    Pas de séance <br/><span className="text-gray-600">programmée.</span>
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">Profite de ton temps libre !</p>
                </div>
              )}
            </div>
          </div>

          {/* Scan QR */}
          <div className="lg:col-span-4">
            <motion.div
              whileHover={{ rotate: 1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsScannerOpen(true)}
              className="bg-[#006c49] rounded-[2.5rem] p-8 text-white h-full flex flex-col
                         justify-between group shadow-xl cursor-pointer overflow-hidden relative"
            >
              <div className="absolute -top-10 -right-10 bg-white/10 w-40 h-40 rounded-full
                              blur-3xl group-hover:bg-white/20 transition-all" />
              <PlayCircle size={48} strokeWidth={1.5}
                className="group-hover:scale-110 transition-transform relative z-10" />
              <div className="space-y-2 relative z-10">
                <h4 className="text-3xl font-display font-black tracking-tighter leading-none">
                  Scanne ton <br/> QR Code
                </h4>
                <p className="text-white/60 text-xs font-medium">
                  Pour valider ta présence instantanément.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;