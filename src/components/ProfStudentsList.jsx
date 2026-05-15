import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, AlertCircle, AlertTriangle,
  CheckCircle2, Users, UserRoundSearch, ShieldCheck,
  Filter, Loader2
} from 'lucide-react';
import StudentDetailModal from './StudentDetailModal';

const API = 'https://backend-unicheck.onrender.com';

const TYPE_COLORS = {
  COURS: 'bg-[#1a1c1e] text-white',
  TD:    'bg-indigo-600 text-white',
  TP:    'bg-orange-500 text-white',
};

const getRiskIcon = (absences) => {
  if (absences >= 3) return <AlertCircle  className="text-red-500"   size={22} strokeWidth={2.5}/>;
  if (absences > 0)  return <AlertTriangle className="text-orange-400" size={22} strokeWidth={2.5}/>;
  return <CheckCircle2 className="text-[#006c49]" size={22} strokeWidth={2.5}/>;
};

// ── Extraire la spécialité du champ groupe ("G1 SITW" → "SITW") ──────────────
const extractSpe = (groupe) => {
  if (!groupe) return '';
  const idx = groupe.indexOf(' ');
  return idx > 0 ? groupe.substring(idx + 1) : groupe;
};

// ── Extraire le numéro de groupe ("G1 SITW" → "G1") ─────────────────────────
const extractNum = (groupe) => {
  if (!groupe) return '';
  return groupe.split(' ')[0];
};

// ─────────────────────────────────────────────────────────────────────────────
const ProfStudentsList = () => {

  const [modules,         setModules]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [onlyAtRisk,      setOnlyAtRisk]      = useState(false);
  const [selectedSpe,     setSelectedSpe]     = useState(null);
  const [selectedGroupe,  setSelectedGroupe]  = useState(null);
  const [selectedModKey,  setSelectedModKey]  = useState(null); // "coursId_typeSeance"
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ── Fetch données ────────────────────────────────────────────────────────
  useEffect(() => {
    const profId = localStorage.getItem('userId');
    const token  = localStorage.getItem('token');
    if (!profId || !token) { setLoading(false); return; }

    fetch(`${API}/api/presences/prof/${profId}/stats-modules`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setModules(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Spécialités uniques ──────────────────────────────────────────────────
  const specialites = [...new Set(modules.map(m => extractSpe(m.groupe)).filter(Boolean))].sort();

  // ── Groupes pour la spécialité sélectionnée ──────────────────────────────
  const groupes = selectedSpe
    ? [...new Set(
        modules
          .filter(m => extractSpe(m.groupe) === selectedSpe)
          .map(m => m.groupe)
      )].sort()
    : [];

  // ── Modules disponibles pour le groupe sélectionné ───────────────────────
  const moduleOptions = selectedGroupe
    ? modules.filter(m => m.groupe === selectedGroupe)
    : [];

  // Auto-sélection si un seul module
  useEffect(() => {
    if (moduleOptions.length === 1) {
      const key = `${moduleOptions[0].coursId}_${moduleOptions[0].typeSeance}`;
      setSelectedModKey(key);
    } else if (moduleOptions.length === 0) {
      setSelectedModKey(null);
    }
  }, [selectedGroupe, selectedSpe]);

  // ── Module courant ────────────────────────────────────────────────────────
  const currentModule = moduleOptions.find(
    m => `${m.coursId}_${m.typeSeance}` === selectedModKey
  );

  // ── Étudiants filtrés ─────────────────────────────────────────────────────
  const students = (currentModule?.etudiants || []).filter(e => {
    const matchSearch = !searchTerm
        || (e.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk   = !onlyAtRisk || e.absences >= 3;
    return matchSearch && matchRisk;
  });

  // ── Sauvegarde étudiant ───────────────────────────────────────────────────
  const handleSaveStudent = async (updated) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/etudiants/${updated.id}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) setSelectedStudent(null);
      else alert("Erreur : " + data.message);
    } catch { alert("Connexion impossible."); }
  };

  const handleSelectSpe = (spe) => {
    setSelectedSpe(spe);
    setSelectedGroupe(null);
    setSelectedModKey(null);
  };

  const handleSelectGroupe = (groupe) => {
    setSelectedGroupe(groupe);
    setSelectedModKey(null);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item      = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">
      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Fond déco */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <UserRoundSearch size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <ShieldCheck size={400} strokeWidth={1} />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="max-w-4xl mx-auto space-y-8 relative z-10">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div variants={item} className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full
                          shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-[#006c49]" />
            <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">
              Annuaire Étudiants
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e]
                         tracking-tighter leading-[0.85]">
            Mes <br/> <span className="text-[#006c49]">Étudiants.</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#006c49]" size={40} />
          </div>
        ) : (
          <>
            {/* ── FILTRE HIÉRARCHIQUE ──────────────────────────────────── */}
            <motion.div variants={item} className="space-y-4">

              {/* Niveau 1 : Spécialité */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]
                               text-gray-400 ml-1">Spécialité</p>
                <div className="flex flex-wrap gap-2">
                  {specialites.map(spe => (
                    <button key={spe}
                      onClick={() => handleSelectSpe(spe)}
                      className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase
                                  tracking-widest transition-all
                        ${selectedSpe === spe
                          ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/20'
                          : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'}`}>
                      {spe}
                    </button>
                  ))}
                  {specialites.length === 0 && (
                    <p className="text-sm text-gray-400 font-bold px-1">
                      Aucun module trouvé pour ce profil.
                    </p>
                  )}
                </div>
              </div>

              {/* Niveau 2 : Groupe */}
              <AnimatePresence>
                {selectedSpe && groupes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]
                                   text-gray-400 ml-1">Groupe</p>
                    <div className="flex flex-wrap gap-2">
                      {groupes.map(g => (
                        <button key={g}
                          onClick={() => handleSelectGroupe(g)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase
                                      tracking-widest transition-all
                            ${selectedGroupe === g
                              ? 'bg-[#1a1c1e] text-white'
                              : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}>
                          {extractNum(g)} {/* "G1" */}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Niveau 3 : Module (visible si > 1 option) */}
              <AnimatePresence>
                {selectedGroupe && moduleOptions.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]
                                   text-gray-400 ml-1">Type de séance</p>
                    <div className="flex flex-wrap gap-2">
                      {moduleOptions.map(m => {
                        const key     = `${m.coursId}_${m.typeSeance}`;
                        const typeClr = TYPE_COLORS[m.typeSeance?.toUpperCase()] || 'bg-gray-500 text-white';
                        return (
                          <button key={key}
                            onClick={() => setSelectedModKey(key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl
                                        text-[10px] font-black uppercase tracking-widest
                                        transition-all border
                              ${selectedModKey === key
                                ? 'bg-white border-[#006c49]/30 shadow-md text-[#1a1c1e]'
                                : 'bg-white/60 border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ${typeClr}`}>
                              {m.typeSeance}
                            </span>
                            <span className="truncate max-w-[120px]">{m.coursNom}</span>
                            {m.atRiskCount > 0 && (
                              <span className="w-5 h-5 rounded-full bg-red-500 text-white
                                               flex items-center justify-center text-[9px] font-black">
                                {m.atRiskCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info module sélectionné */}
              {currentModule && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 flex-wrap px-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {currentModule.coursNom}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase
                    ${TYPE_COLORS[currentModule.typeSeance?.toUpperCase()] || 'bg-gray-500 text-white'}`}>
                    {currentModule.typeSeance}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400">
                    {currentModule.totalSeances} séance{currentModule.totalSeances > 1 ? 's' : ''}
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* ── RECHERCHE + À RISQUE ─────────────────────────────────── */}
            {currentModule && (
              <motion.div variants={item} className="space-y-4">
                <div className="relative group">
                  <Search size={22}
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400
                               group-focus-within:text-[#006c49] transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 shadow-sm
                               focus:ring-4 focus:ring-[#006c49]/10 font-display font-bold
                               text-[#1a1c1e] text-base outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setOnlyAtRisk(!onlyAtRisk)}
                    className={`flex-1 min-w-[140px] py-3.5 rounded-[1.5rem] flex items-center
                                justify-center gap-2 text-xs font-black uppercase tracking-widest
                                transition-all shadow-sm
                      ${onlyAtRisk
                        ? 'bg-red-500 text-white shadow-red-500/20'
                        : 'bg-[#1a1c1e] text-white hover:bg-[#006c49]'}`}>
                    <Filter size={15} />
                    {onlyAtRisk ? 'À risque (actif)' : 'À risque'}
                  </button>

                  <div className="flex items-center gap-3 bg-white rounded-[1.5rem]
                                  px-5 py-3 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Affichés
                    </span>
                    <span className="font-display font-black text-[#1a1c1e] text-lg">
                      {students.length}
                    </span>
                    {currentModule.atRiskCount > 0 && (
                      <>
                        <span className="w-px h-4 bg-gray-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          À risque
                        </span>
                        <span className="font-display font-black text-red-500 text-lg">
                          {currentModule.atRiskCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LISTE ÉTUDIANTS (style ancien) ───────────────────────── */}
            {!selectedSpe && (
              <motion.div variants={item}
                className="text-center py-16 bg-white/40 rounded-[3rem]
                           border border-dashed border-gray-300">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-display font-black text-gray-400 uppercase
                               tracking-widest text-sm">
                  Sélectionnez une spécialité
                </p>
              </motion.div>
            )}

            {selectedSpe && !selectedGroupe && (
              <motion.div variants={item}
                className="text-center py-16 bg-white/40 rounded-[3rem]
                           border border-dashed border-gray-300">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-display font-black text-gray-400 uppercase
                               tracking-widest text-sm">
                  Sélectionnez un groupe
                </p>
              </motion.div>
            )}

            {selectedGroupe && !selectedModKey && moduleOptions.length > 1 && (
              <motion.div variants={item}
                className="text-center py-16 bg-white/40 rounded-[3rem]
                           border border-dashed border-gray-300">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="font-display font-black text-gray-400 uppercase
                               tracking-widest text-sm">
                  Choisissez un type de séance
                </p>
              </motion.div>
            )}

            {currentModule && (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {students.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center py-16 bg-white/40 rounded-[3rem]
                                 border border-dashed border-gray-300">
                      <Search size={32} className="text-gray-200 mx-auto mb-3" />
                      <p className="font-display font-black text-gray-400 uppercase
                                     tracking-widest text-sm">
                        Aucun étudiant trouvé
                      </p>
                    </motion.div>
                  ) : (
                    students.map((student, i) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ y: -4 }}
                        className="bg-white p-5 md:p-6 rounded-[2.5rem] shadow-sm
                                   border border-white flex items-center justify-between
                                   group hover:shadow-xl transition-all"
                      >
                        {/* Gauche : avatar + nom */}
                        <div className="flex items-center gap-5 min-w-0">
                          <div className={`w-16 h-16 ${student.color} rounded-[1.5rem]
                                           flex items-center justify-center font-display
                                           font-black text-xl shadow-inner shrink-0
                                           group-hover:rotate-6 transition-transform`}>
                            {student.initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-black text-[#1a1c1e] text-xl
                                           tracking-tighter leading-tight truncate">
                              {student.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              <span className="flex items-center gap-1.5 text-[10px] font-black
                                               uppercase tracking-[0.1em] text-gray-400">
                                <Users size={12} className="text-[#006c49]"/>
                                {student.specialite}{student.groupe ? ` - ${student.groupe}` : ''}
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-[0.1em]
                                ${student.absences >= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                                {student.absences} Absence{student.absences !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Droite : icône risque + bouton détail */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="hidden sm:block">
                            {getRiskIcon(student.absences)}
                          </div>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="w-12 h-12 bg-[#f1f4f2] text-gray-400 rounded-2xl
                                       flex items-center justify-center
                                       hover:bg-[#1a1c1e] hover:text-white transition-all">
                            <ChevronDown size={20} strokeWidth={3} className="-rotate-90" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal détail étudiant */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onSave={handleSaveStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfStudentsList;