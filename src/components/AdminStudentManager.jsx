import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, GraduationCap, ArrowRight,
  Download, Loader2, X, CheckCircle2, AlertCircle,
  Shield, User, Mail, Hash, Smartphone, RefreshCw
} from 'lucide-react';
import StudentDetailModal from './StudentDetailModal'; // ✅ Import du composant externe

const API = 'https://backend-unicheck.onrender.com';
const EXCLUSION_THRESHOLD = 70;

// ── CSV export ────────────────────────────────────────────────────────────────
const exportToCSV = (students) => {
  const headers = ['ID', 'Nom', 'Prénom', 'Matricule', 'Spécialité', 'Groupe',
                   'Email', 'Présence (%)', 'Absences', 'Compte actif', 'Device ID'];
  const rows = students.map(s => [
    s.id, s.nom, s.prenom, s.matricule, s.specialite,
    s.groupe, s.email, s.attendance, s.absences,
    s.compteActif ? 'Oui' : 'Non', s.deviceId
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${c}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `etudiants_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ════════════════════════════════════════════════════════════════════════════
const AdminStudentManager = () => {
  const [students,         setStudents]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterSpe,        setFilterSpe]        = useState('Tous');
  const [filterGrp,        setFilterGrp]        = useState('Tous');
  const [showExcluded,     setShowExcluded]     = useState(false);
  const [showSansCompte,   setShowSansCompte]   = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/etudiants/admin/tous-avec-stats`, { headers });
      if (res.ok) setStudents(await res.json());
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Dérivés ───────────────────────────────────────────────────────────────
  const specialites = ['Tous', ...new Set(students.map(s => s.specialite).filter(s => s && s !== '—'))];
  const groupes     = ['Tous', ...new Set(
    students
      .filter(s => filterSpe === 'Tous' || s.specialite === filterSpe)
      .map(s => s.groupe)
      .filter(g => g && g !== '—')
  )];

  const excludedCount    = students.filter(s => s.attendance < EXCLUSION_THRESHOLD).length;
  const sansCompteCount  = students.filter(s => !s.compteActif).length;

  const filtered = students.filter(s => {
    const matchSearch     = s.name?.toLowerCase().includes(searchTerm.toLowerCase())
                          || s.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpe        = filterSpe === 'Tous' || s.specialite === filterSpe;
    const matchGrp        = filterGrp === 'Tous' || s.groupe === filterGrp;
    const matchExcluded   = !showExcluded   || s.attendance < EXCLUSION_THRESHOLD;
    const matchSansCompte = !showSansCompte || !s.compteActif;
    return matchSearch && matchSpe && matchGrp && matchExcluded && matchSansCompte;
  });

  // ── Logique de Sauvegarde (Transmise au Modal) ───────────────────────────
  const handleSave = async (updatedStudent) => {
    try {
      const res = await fetch(`${API}/api/etudiants/${updatedStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedStudent),
      });
      const data = await res.json();
      
      if (data.success) {
        // Mise à jour de la liste locale
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s));
        setSelectedStudent(null);
        alert('✓ Étudiant sauvegardé avec succès');
      } else {
        alert('Erreur : ' + data.message);
      }
    } catch (err) {
      alert('Erreur réseau lors de la sauvegarde.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="absolute -top-24 -left-24 text-[#006c49]/5 pointer-events-none rotate-12 select-none">
        <GraduationCap size={500} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Étudiants<span className="text-[#006c49]">.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-1">
              {students.length} inscrits · {excludedCount} sous le seuil
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchStudents}
              className="w-12 h-12 bg-white text-gray-400 border border-gray-200 rounded-2xl
                         flex items-center justify-center hover:bg-[#f1f4f2] transition-all"
              title="Rafraîchir">
              <RefreshCw size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => exportToCSV(filtered)}
              className="bg-white text-[#1a1c1e] border border-gray-200 px-5 py-4 rounded-[2rem]
                         font-display font-black text-xs uppercase tracking-widest shadow-sm
                         flex items-center gap-2 hover:bg-[#f1f4f2] hover:border-[#006c49]/30 transition-all">
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Exporter ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* ── Filtres ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Recherche */}
          <div className="relative group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400
                                          group-focus-within:text-[#006c49] transition-colors" />
            <input type="text" placeholder="Rechercher par nom ou matricule..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 font-bold
                         text-[#1a1c1e] shadow-sm focus:ring-4 focus:ring-[#006c49]/10 outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Boutons de filtre */}
          <div className="flex flex-wrap gap-2">
            {/* Spécialités */}
            {specialites.map(spe => (
              <button key={spe}
                onClick={() => { setFilterSpe(spe); setFilterGrp('Tous'); setShowExcluded(false); setShowSansCompte(false); }}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filterSpe === spe && !showExcluded && !showSansCompte
                    ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/20'
                    : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                {spe}
              </button>
            ))}

            {/* Groupes */}
            {filterSpe !== 'Tous' && groupes.filter(g => g !== 'Tous').map(g => (
              <button key={g}
                onClick={() => setFilterGrp(filterGrp === g ? 'Tous' : g)}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filterGrp === g
                    ? 'bg-[#1a1c1e] text-white'
                    : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                {g}
              </button>
            ))}

            {/* Exclus */}
            <button
              onClick={() => { setShowExcluded(e => !e); setShowSansCompte(false); setFilterSpe('Tous'); }}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
                          flex items-center gap-2 transition-all
                ${showExcluded
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-orange-500 border border-orange-200 hover:bg-orange-50'}`}>
              Exclus
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black
                ${showExcluded ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                {excludedCount}
              </span>
            </button>

            {/* Sans compte */}
            <button
              onClick={() => { setShowSansCompte(e => !e); setShowExcluded(false); setFilterSpe('Tous'); }}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
                          flex items-center gap-2 transition-all
                ${showSansCompte
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              Sans compte
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black
                ${showSansCompte ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {sansCompteCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Bandeau info ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(showExcluded || showSansCompte) && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`rounded-[1.5rem] px-6 py-4 flex items-center justify-between
                ${showExcluded
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-gray-50 border border-gray-200'}`}>
              <p className={`font-black text-sm ${showExcluded ? 'text-orange-700' : 'text-gray-700'}`}>
                {showExcluded
                  ? `${excludedCount} étudiant(s) sous ${EXCLUSION_THRESHOLD}% de présence`
                  : `${sansCompteCount} étudiant(s) sans compte créé`}
              </p>
              <button onClick={() => exportToCSV(filtered)}
                className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-wider transition-colors
                  ${showExcluded ? 'text-orange-600 hover:text-orange-800' : 'text-gray-600 hover:text-gray-800'}`}>
                <Download size={14} /> Exporter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grille ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#006c49]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filtered.map((student, i) => {
                  const isExclu   = student.attendance < EXCLUSION_THRESHOLD;
                  const hasCompte = student.compteActif;

                  return (
                    <motion.div key={student.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedStudent(student)} // ✅ Ouvre le modal
                      className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-transparent
                                 hover:border-[#006c49]/20 hover:shadow-xl hover:-translate-y-1
                                 transition-all group relative overflow-hidden cursor-pointer"
                    >
                      {/* Fond déco */}
                      <div className="absolute -right-4 -top-4 w-28 h-28 bg-[#f1f4f2] rounded-full
                                      group-hover:bg-[#d1f4e0]/40 transition-colors pointer-events-none" />

                      <div className="absolute bottom-5 right-5 w-9 h-9 bg-[#f1f4f2] rounded-full
                                      flex items-center justify-center text-gray-400
                                      group-hover:bg-[#1a1c1e] group-hover:text-white transition-all z-20">
                        <ArrowRight size={15} />
                      </div>

                      <div className="relative z-10 space-y-4">
                        {/* Top : avatar + badge */}
                        <div className="flex justify-between items-start">
                          <div className="w-14 h-14 bg-[#1a1c1e] rounded-[1.2rem] flex items-center
                                          justify-center text-white font-display font-black text-xl shadow-md">
                            {(student.prenom?.[0] || '') + (student.nom?.[0] || '')}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                              ${isExclu
                                ? 'bg-red-100 text-red-600'
                                : 'bg-[#d1f4e0] text-[#006c49]'}`}>
                              {isExclu ? 'Exclu' : 'Actif'}
                            </span>
                            {!hasCompte && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px]
                                               font-black uppercase tracking-widest rounded-full">
                                Sans compte
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Nom + infos */}
                        <div className="pr-10">
                          <h3 className="text-lg font-display font-black text-[#1a1c1e] leading-tight
                                         uppercase tracking-tighter truncate">
                            {student.nom} {student.prenom}
                          </h3>
                          <p className="text-gray-400 font-bold text-[11px] mt-0.5 truncate">
                            {student.specialite !== '—' ? student.specialite : 'Spécialité non définie'}
                            {student.groupe !== '—' ? ` · ${student.groupe}` : ''}
                          </p>
                          <p className="text-gray-300 font-bold text-[10px] mt-0.5">
                            #{student.matricule}
                          </p>
                        </div>

                        {/* Barre présence */}
                        <div className="pr-10 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                              Présence
                            </span>
                            <span className={`text-xs font-black ${isExclu ? 'text-red-500' : 'text-[#006c49]'}`}>
                              {student.attendance}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#f1f4f2] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isExclu ? 'bg-red-400' : 'bg-[#006c49]'}`}
                              style={{ width: `${student.attendance}%` }}
                            />
                          </div>
                          {student.absences > 0 && (
                            <p className="text-[9px] text-gray-400 font-bold">
                              {student.absences} absence(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && !loading && (
                <div className="col-span-full text-center py-20 bg-white/50 rounded-[3rem]
                                border border-dashed border-gray-200">
                  <Search size={40} className="text-gray-200 mx-auto mb-4" />
                  <p className="font-display font-black text-gray-400 uppercase tracking-widest text-sm">
                    Aucun étudiant trouvé
                  </p>
                </div>
              )}
            </div>

            {/* Stats footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total affiché',  val: filtered.length,        color: 'text-[#1a1c1e]' },
                { label: 'Total inscrits', val: students.length,        color: 'text-[#1a1c1e]' },
                { label: 'Sous le seuil',  val: excludedCount,          color: 'text-orange-500' },
                { label: 'Sans compte',    val: sansCompteCount,        color: 'text-gray-500' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl
                                            border border-white/80 text-center shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                  <p className={`text-3xl font-display font-black mt-1 ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modal Détail Étudiant ── */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onSave={handleSave} // ✅ Exécute le fetch PUT déclaré plus haut
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentManager;