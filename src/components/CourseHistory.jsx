import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, BookOpen, AlertCircle, Loader2,
  CheckCircle2, User, GraduationCap
} from 'lucide-react';

// ── Config affichage par type ──────────────────────────────────────────────
const TYPE_CONFIG = {
  COURS: {
    label: 'Cours',
    bg:    'bg-[#1a1c1e]',
    text:  'text-white',
    dot:   'bg-white',
  },
  TD: {
    label: 'TD',
    bg:    'bg-indigo-600',
    text:  'text-white',
    dot:   'bg-white',
  },
  TP: {
    label: 'TP',
    bg:    'bg-orange-500',
    text:  'text-white',
    dot:   'bg-white',
  },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type?.toUpperCase()] || { label: type || 'Cours', bg: 'bg-gray-500', text: 'text-white', dot: 'bg-white' };

const getBarColor = (pct) => {
  if (pct >= 80) return 'bg-[#006c49]';
  if (pct >= 50) return 'bg-orange-400';
  return 'bg-red-500';
};

const getBadgeStyle = (pct) => {
  if (pct >= 80) return 'bg-[#d1f4e0] text-[#006c49]';
  if (pct >= 50) return 'bg-orange-50 text-orange-500';
  return 'bg-red-50 text-red-500';
};

// ── Groupe les stats par module ────────────────────────────────────────────
const groupByModule = (stats) => {
  const grouped = new Map();
  for (const s of stats) {
    const key = s.coursId;
    if (!grouped.has(key)) {
      grouped.set(key, { coursId: s.coursId, coursNom: s.coursNom, entries: [] });
    }
    grouped.get(key).entries.push(s);
  }
  return Array.from(grouped.values());
};

// ─────────────────────────────────────────────────────────────────────────────
const CourseHistory = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token      = localStorage.getItem('token');
        let   etudiantId = localStorage.getItem('userId');

        if (!token) throw new Error("Session expirée.");

        if (!etudiantId) {
          const payload = JSON.parse(
            window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          );
          etudiantId = payload.userId || payload.id;
        }

        const res = await fetch(
          `https://backend-unicheck.onrender.com/api/presences/stats/etudiant/${etudiantId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);

        setCoursesData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[2.5rem]
                    border border-gray-100 shadow-sm">
      <Loader2 className="w-8 h-8 text-[#006c49] animate-spin mb-3" />
      <p className="font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">
        Chargement des performances...
      </p>
    </div>
  );

  const modules = groupByModule(coursesData);

  return (
    <section className="space-y-6 font-body">

      {/* En-tête */}
      <div className="flex items-center gap-3 px-1">
        <div className="p-2.5 bg-[#006c49] text-white rounded-2xl shadow-[0_10px_20px_rgba(0,108,73,0.2)]">
          <BarChart2 size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
            Performance
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
            Par module · type · professeur
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="w-8 h-1 rounded-full bg-[#006c49]" />
        <p className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-gray-400">
          Séances terminées
        </p>
      </div>

      {/* Contenu */}
      {error && (
        <div className="p-5 bg-red-50 rounded-[1.8rem] border border-red-100 flex items-center gap-3 text-red-500">
          <AlertCircle size={18} strokeWidth={2.5} className="shrink-0" />
          <p className="text-xs font-bold font-display uppercase tracking-wider">{error}</p>
        </div>
      )}

      {!error && modules.length === 0 && (
        <div className="p-10 text-center bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
          <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-display font-black text-xs uppercase tracking-widest">
            Aucune séance terminée trouvée
          </p>
        </div>
      )}

      <div className="space-y-5">
        <AnimatePresence>
          {modules.map((module, moduleIndex) => {

            // Moyenne globale du module
            const totalSeances  = module.entries.reduce((s, e) => s + e.totalSeancesFaites, 0);
            const totalPresences= module.entries.reduce((s, e) => s + e.presencesEtudiant, 0);
            const moyenneModule = totalSeances > 0
              ? Math.round((totalPresences / totalSeances) * 100) : 0;

            return (
              <motion.div key={module.coursId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.08, ease: 'easeOut' }}
                className="bg-white rounded-[2rem] shadow-sm border border-gray-100
                           hover:border-[#006c49]/20 hover:shadow-md transition-all overflow-hidden"
              >
                {/* ── Header du module ──────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#f1f4f2] rounded-2xl flex items-center justify-center shrink-0">
                      <GraduationCap size={18} className="text-[#006c49]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-black text-[#1a1c1e] text-base tracking-tighter
                                     leading-tight truncate">
                        {module.coursNom}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        {module.entries.length} type{module.entries.length > 1 ? 's' : ''} de séance
                      </p>
                    </div>
                  </div>

                  {/* Badge moyenne globale */}
                  <div className={`shrink-0 flex flex-col items-center px-3 py-1.5
                                   rounded-2xl ${getBadgeStyle(moyenneModule)}`}>
                    <span className="text-xl font-display font-black tracking-tighter leading-none">
                      {moyenneModule}%
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">
                      Moy.
                    </span>
                  </div>
                </div>

                {/* ── Entrées par type ──────────────────────────────────── */}
                <div className="px-5 py-4 space-y-4">
                  {module.entries.map((entry, entryIndex) => {
                    const pct      = Math.round(entry.pourcentage);
                    const typeCfg  = getTypeConfig(entry.typeSeance);

                    return (
                      <motion.div key={`${entry.coursId}-${entry.typeSeance}-${entry.professeurId}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: moduleIndex * 0.08 + entryIndex * 0.05 }}
                        className="space-y-2.5"
                      >
                        {/* Ligne type + prof + % */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Badge type */}
                            <span className={`shrink-0 px-2.5 py-1 ${typeCfg.bg} ${typeCfg.text}
                                             rounded-xl text-[9px] font-black uppercase tracking-widest`}>
                              {typeCfg.label}
                            </span>

                            {/* Prof */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <User size={10} strokeWidth={3} className="text-gray-400 shrink-0" />
                              <p className="text-[11px] font-bold text-gray-500 truncate">
                                Prof. {entry.professeurNom}
                              </p>
                            </div>
                          </div>

                          {/* Compteurs + % */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-black text-[#006c49] bg-[#f1f4f2]
                                             px-2 py-0.5 rounded-lg">
                              {entry.presencesEtudiant}/{entry.totalSeancesFaites}
                            </span>
                            <span className={`text-sm font-display font-black ${
                              pct >= 80 ? 'text-[#006c49]' : pct >= 50 ? 'text-orange-500' : 'text-red-500'
                            }`}>
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.8,
                              ease: 'easeOut',
                              delay: moduleIndex * 0.08 + entryIndex * 0.05 + 0.15
                            }}
                            className={`h-full rounded-full ${getBarColor(pct)}`}
                          />
                        </div>

                        {/* Stats détaillées */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black font-display uppercase
                                           bg-gray-50 text-gray-500 px-2 py-0.5 rounded-lg">
                            {entry.totalSeancesFaites} séances
                          </span>
                          <span className="text-[9px] font-black font-display uppercase
                                           bg-[#d1f4e0] text-[#006c49] px-2 py-0.5 rounded-lg">
                            {entry.presencesEtudiant} présences
                          </span>
                          {entry.absencesEtudiant > 0 && (
                            <span className="text-[9px] font-black font-display uppercase
                                             bg-red-50 text-red-400 px-2 py-0.5 rounded-lg">
                              {entry.absencesEtudiant} absence{entry.absencesEtudiant > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Séparateur entre types (sauf dernier) */}
                        {entryIndex < module.entries.length - 1 && (
                          <div className="border-b border-dashed border-gray-100 pt-1" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Légende types */}
      {modules.length > 0 && (
        <div className="flex flex-wrap gap-3 px-1 pt-2">
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-4 h-4 rounded ${cfg.bg} flex items-center justify-center`}>
                <span className={`text-[8px] font-black ${cfg.text}`}>{cfg.label[0]}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-bold">{cfg.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CourseHistory;