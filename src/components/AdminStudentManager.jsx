import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, GraduationCap, ArrowRight,
  Download, Loader2, X, CheckCircle2, AlertCircle,
  Shield, User, Mail, Hash, Smartphone, RefreshCw,
  ArrowUpDown, FileText, BarChart2
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
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
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
  const [students,       setStudents]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterSpe,      setFilterSpe]      = useState('Tous');
  const [filterGrp,      setFilterGrp]      = useState('Tous');
  const [filterStatus,   setFilterStatus]   = useState('Tous'); // 'Tous' | 'Exclus' | 'Non Exclus'
  const [showSansCompte, setShowSansCompte] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // États de tri (Identique au ProfManager)
  const [sortBy,         setSortBy]         = useState('nom'); // 'nom' | 'presence' | 'absences' | 'matricule'
  const [sortOrder,      setSortOrder]      = useState('asc'); // 'asc' | 'desc'

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

  // Filtrage combiné et cumulable
  let filtered = students.filter(s => {
    const fullName = `${s.nom || ''} ${s.prenom || ''}`.toLowerCase();
    const matchSearch     = fullName.includes(searchTerm.toLowerCase())
                          || s.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpe        = filterSpe === 'Tous' || s.specialite === filterSpe;
    const matchGrp        = filterGrp === 'Tous' || s.groupe === filterGrp;
    
    let matchStatus = true;
    if (filterStatus === 'Exclus') matchStatus = s.attendance < EXCLUSION_THRESHOLD;
    if (filterStatus === 'Non Exclus') matchStatus = s.attendance >= EXCLUSION_THRESHOLD;

    const matchSansCompte = !showSansCompte || !s.compteActif;
    
    return matchSearch && matchSpe && matchGrp && matchStatus && matchSansCompte;
  });

  // Logique de Tri (Classement par présence, nom, etc.)
  filtered.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'nom') {
      valA = (a.nom || '').toLowerCase();
      valB = (b.nom || '').toLowerCase();
    } else if (sortBy === 'presence') {
      valA = a.attendance || 0;
      valB = b.attendance || 0;
    } else if (sortBy === 'absences') {
      valA = a.absences || 0;
      valB = b.absences || 0;
    } else {
      valA = (a.matricule || '').toLowerCase();
      valB = (b.matricule || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
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
        .custom-scrollbar::-webkit-scrollbar { height: 5px; width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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

        {/* ── Filtres Restructurés (Style ProfManager) ─────────────────────── */}
        <div className="space-y-4">
          
          {/* Barre principale : Recherche + Tri */}
          <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center w-full">
            <div className="relative w-full md:flex-1 group">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400
                                          group-focus-within:text-[#006c49] transition-colors" />
              <input type="text" placeholder="Rechercher par nom ou matricule..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#f1f4f2] border-none rounded-[1.5rem] py-4 pl-16 pr-6 font-bold
                           text-[#1a1c1e] outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Sélecteur de classement & tri */}
            <div className="flex w-full md:w-auto shrink-0 bg-[#f1f4f2] border border-transparent
                            shadow-sm rounded-[1.5rem] px-5 py-4 items-center gap-3">
              <ArrowUpDown size={16} className="text-gray-400"/>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest text-[#1a1c1e] outline-none cursor-pointer">
                <option value="nom">Nom</option>
                <option value="presence">Présence (%)</option>
                <option value="absences">Absences</option>
                <option value="matricule">Matricule</option>
              </select>
              <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                      className="text-gray-400 hover:text-[#006c49] font-black text-xs w-4">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Deuxième ligne : Statuts (Bordure 2px) + Spécialités + Groupes */}
          <div className="flex flex-wrap gap-3 items-center">
            
            {/* Conteneur Statut Présence avec Contour 2px */}
            <div className="flex items-center gap-1 bg-white border-2 border-gray-200 p-1 rounded-[1.5rem] shadow-sm shrink-0">
              {[
                { id: 'Tous',       label: 'Tous' },
                { id: 'Exclus',     label: 'Exclus' },
                { id: 'Non Exclus', label: 'Non Exclus' }
              ].map(status => (
                <button key={status.id}
                  onClick={() => setFilterStatus(status.id)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${filterStatus === status.id
                      ? 'bg-[#1a1c1e] text-white'
                      : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}>
                  {status.label}
                </button>
              ))}
            </div>

            {/* Liste horizontale déroulante des Spécialités */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar hide-scrollbar">
              {specialites.map(spe => (
                <button key={spe}
                  onClick={() => { setFilterSpe(spe); setFilterGrp('Tous'); }}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
                              transition-all truncate max-w-[140px] border
                    ${filterSpe === spe
                      ? 'bg-white text-[#1a1c1e] border-gray-200 shadow-sm'
                      : 'bg-transparent text-gray-400 border-transparent hover:bg-white/50'}`}>
                  {spe === 'Tous' ? 'Toutes Spés' : spe}
                </button>
              ))}
            </div>

            {/* Liste horizontale des Groupes de la spécialité sélectionnée */}
            {filterSpe !== 'Tous' && (
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar hide-scrollbar border-l pl-2 border-gray-300">
                {groupes.map(g => (
                  <button key={g}
                    onClick={() => setFilterGrp(g)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                      ${filterGrp === g
                        ? 'bg-[#006c49] text-white border-[#006c49]'
                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}>
                    {g === 'Tous' ? 'Tous Grp' : g}
                  </button>
                ))}
              </div>
            )}

            {/* Toggle Sans Compte aligné à droite */}
            <button
              onClick={() => setShowSansCompte(p => !p)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
                          flex items-center gap-2 transition-all ml-auto shrink-0
                ${showSansCompte
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              <UserPlus size={12} /> Sans compte
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black
                ${showSansCompte ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {sansCompteCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Bandeau info dynamique ────────────────────────────────────────── */}
        <AnimatePresence>
          {(filterStatus !== 'Tous' || showSansCompte || filterSpe !== 'Tous' || filterGrp !== 'Tous') && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-[1.5rem] px-6 py-4 flex items-center justify-between bg-white border border-gray-200 shadow-sm">
              <p className="font-black text-xs text-gray-700">
                Filtres actifs : {filterStatus !== 'Tous' && <span className="text-orange-600">[{filterStatus}] </span>}
                {filterSpe !== 'Tous' && <span className="text-[#006c49]">[{filterSpe}] </span>}
                {filterGrp !== 'Tous' && <span className="text-indigo-600">[{filterGrp}] </span>}
                {showSansCompte && <span className="text-gray-500">[Sans Compte] </span>}
                ➜ <span className="text-[#1a1c1e]">{filtered.length} étudiant(s) trouvé(s)</span>
              </p>
              <button onClick={() => { setFilterSpe('Tous'); setFilterGrp('Tous'); setFilterStatus('Tous'); setShowSansCompte(false); }}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">
                Réinitialiser
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grille des Étudiants ─────────────────────────────────────────── */}
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
                              {isExclu ? 'Exclu' : 'Regulier'}
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