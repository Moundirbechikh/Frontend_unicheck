import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, Activity, TrendingUp, TrendingDown,
  UserPlus, CalendarPlus, Zap, ShieldCheck, Radar, Sparkles,
  Server, MapPin, BookOpen, X, AlertCircle,
  Upload, FileText, CheckCircle2, Loader2, Plus, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Icône selon le type d'insight ─────────────────────────────────────────
const InsightIcon = ({ type }) => {
  if (type === 'hausse' || type === 'hausse_spe')
    return <TrendingUp size={18} strokeWidth={3} />;
  if (type === 'baisse' || type === 'baisse_spe')
    return <TrendingDown size={18} strokeWidth={3} />;
  return <FileText size={18} strokeWidth={3} />;
};

// ── Couleurs selon le type ─────────────────────────────────────────────────
const insightStyle = (type) => {
  if (type === 'hausse' || type === 'hausse_spe')
    return { bg: 'bg-[#d1f4e0]/50', ibg: 'bg-[#d1f4e0]', ic: 'text-[#006c49]', bc: 'border-[#006c49]/10' };
  if (type === 'baisse' || type === 'baisse_spe')
    return { bg: 'bg-orange-50/50', ibg: 'bg-orange-100', ic: 'text-orange-500', bc: 'border-orange-100' };
  return { bg: 'bg-blue-50/50', ibg: 'bg-blue-100', ic: 'text-blue-500', bc: 'border-blue-100' };
};

// ── Composant Insights dynamique ──────────────────────────────────────────
const InsightsDynamiques = ({ insights, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (insights.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % insights.length);
    }, 10000); // rotation toutes les 10s
    return () => clearInterval(interval);
  }, [insights.length]);

  if (loading) return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-white flex-1
                    flex items-center justify-center">
      <Loader2 size={28} className="text-[#006c49] animate-spin" />
    </div>
  );

  if (insights.length === 0) return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-white flex-1
                    flex items-center justify-center">
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center">
        Aucune donnée disponible
      </p>
    </div>
  );

  const insight = insights[currentIndex];
  const style   = insightStyle(insight.type);

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-white flex-1
                    flex flex-col gap-3 min-h-0">

      {/* Insight courant animé */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex gap-4 p-4 ${style.bg} rounded-[1.5rem] border ${style.bc} flex-1`}
        >
          <div className={`w-11 h-11 ${style.ibg} ${style.ic} rounded-[1rem]
                           flex items-center justify-center shrink-0`}>
            <InsightIcon type={insight.type} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-black text-[#1a1c1e] text-sm leading-tight">
              {insight.titre}
            </h4>
            <p className="text-xs text-gray-500 font-medium leading-tight mt-1.5">
              {insight.body}
            </p>

            {/* Barre de progression si pct disponible */}
            {insight.pct !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Taux présence
                  </span>
                  <span className={`text-[10px] font-black ${style.ic}`}>
                    {insight.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(insight.pct, 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      insight.type.includes('hausse')
                        ? 'bg-[#006c49]'
                        : 'bg-orange-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Détail justificatifs */}
            {insight.type === 'justificatifs' && (
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[9px] font-black bg-orange-100 text-orange-600
                                 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {insight.enAttente} attente
                </span>
                <span className="text-[9px] font-black bg-[#d1f4e0] text-[#006c49]
                                 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {insight.acceptes} acceptés
                </span>
                <span className="text-[9px] font-black bg-red-50 text-red-500
                                 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {insight.refuses} refusés
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicateurs de pagination */}
      <div className="flex items-center justify-center gap-1.5 shrink-0">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all rounded-full ${
              i === currentIndex
                ? 'w-6 h-1.5 bg-[#1a1c1e]'
                : 'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
        <span className="text-[9px] text-gray-300 font-bold ml-1">
          {currentIndex + 1}/{insights.length}
        </span>
      </div>

      {/* Barre de progression timer 10s */}
      <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
        <motion.div
          key={currentIndex}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 10, ease: 'linear' }}
          className="h-full bg-[#006c49]/40 rounded-full"
        />
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const [globalStats, setGlobalStats] = useState({
    totalEtudiants: 0,
    totalProfesseurs: 0,
    seancesEnCours: 0,
    tauxPresenceGlobal: 0
  });

  // ── Insights dynamiques ───────────────────────────────────────────────────
  const [insights,        setInsights]        = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [newSalle,     setNewSalle]     = useState({ nom: '', departement: '' });
  const [newCours,     setNewCours]     = useState({ libelle: '', specialite: 'SITW' });
  const [assignations, setAssignations] = useState([]);
  const [allProfs,     setAllProfs]     = useState([]);
  const [csvFile,      setCsvFile]      = useState(null);
  const [csvPreview,   setCsvPreview]   = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const fileInputRef = useRef(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Charger stats globales
  useEffect(() => {
    fetch('https://backend-unicheck.onrender.com/api/admin/dashboard/stats', {
      headers: getAuthHeaders()
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setGlobalStats(data); })
      .catch(() => {});
  }, [getAuthHeaders]);

  // Charger insights — seulement au montage (connexion admin)
  useEffect(() => {
    setInsightsLoading(true);
    fetch('https://backend-unicheck.onrender.com/api/admin/dashboard/insights', {
      headers: getAuthHeaders()
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setInsights(Array.isArray(data) ? data : []))
      .catch(() => setInsights([]))
      .finally(() => setInsightsLoading(false));
  }, [getAuthHeaders]);

  // Charger profs pour modal cours
  useEffect(() => {
    if (activeModal !== 'cours') return;
    fetch('https://backend-unicheck.onrender.com/api/admin/planning/form-data', {
      headers: getAuthHeaders()
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.profs) setAllProfs(data.profs); })
      .catch(() => {});
  }, [activeModal, getAuthHeaders]);

  const handleAddSalle = async () => {
    if (!newSalle.nom) return setError("Le nom de la salle est requis.");
    setLoading(true); setError(null);
    try {
      const res = await fetch("https://backend-unicheck.onrender.com/api/salles/add", {
        method: "POST",
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(newSalle)
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout de la salle");
      closeModal();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const addAssignationRow  = () => setAssignations(prev => [...prev, { profId: '', typeSeance: 'COURS' }]);
  const updateAssignation  = (i, f, v) => setAssignations(prev => prev.map((a, idx) => idx === i ? { ...a, [f]: v } : a));
  const removeAssignation  = (i) => setAssignations(prev => prev.filter((_, idx) => idx !== i));

  const handleAddCours = async () => {
    if (!newCours.libelle.trim()) return setError("Le libellé du module est requis.");
    if (assignations.some(a => !a.profId)) return setError("Sélectionnez un professeur pour chaque ligne.");
    setLoading(true); setError(null);
    try {
      const res = await fetch("https://backend-unicheck.onrender.com/api/cours/add", {
        method: "POST",
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libelle:      newCours.libelle.trim(),
          specialite:   newCours.specialite,
          assignations: assignations.map(a => ({ profId: parseInt(a.profId), typeSeance: a.typeSeance }))
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      closeModal();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const parsePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').filter(l => l.trim());
      setCsvPreview(lines.slice(0, 5).map(l => l.split(/[;,]/)));
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleFileSelect = (file) => {
    if (!file || !file.name.endsWith('.csv')) { setError("Seuls les fichiers .csv sont acceptés."); return; }
    setError(null); setImportResult(null);
    setCsvFile(file); parsePreview(file);
  };

  const handleImportSubmit = async () => {
    if (!csvFile) return;
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await fetch("https://backend-unicheck.onrender.com/api/import/etudiants", {
        method: "POST", headers: getAuthHeaders(), body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Erreur serveur");
      setImportResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const closeModal = () => {
    setActiveModal(null); setError(null);
    setNewSalle({ nom: '', departement: '' });
    setNewCours({ libelle: '', specialite: 'SITW' });
    setAssignations([]); setAllProfs([]);
    setCsvFile(null); setCsvPreview([]); setImportResult(null);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
        .bento-card   { background: white; border-radius: 2.5rem; padding: 1.5rem;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid rgba(255,255,255,0.8); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>

      <div className="absolute top-0 -right-20 text-[#006c49]/5 rotate-12 pointer-events-none select-none">
        <Radar size={500} strokeWidth={1} />
      </div>
      <div className="absolute bottom-20 -left-20 text-[#1a1c1e]/5 -rotate-12 pointer-events-none select-none">
        <Server size={400} strokeWidth={1} />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="max-w-5xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <motion.div variants={item} className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-[#006c49]" />
            <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">
              Vue d'ensemble
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.9]">
            Système <br/> <span className="text-[#006c49]">Unicheck.</span>
          </h1>
        </motion.div>

        {/* Stats bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={item}
            className="col-span-2 bg-[#1a1c1e] rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group shadow-xl shadow-black/10">
            <div className="absolute -right-10 -top-10 bg-[#006c49] w-40 h-40 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#d1f4e0]">
                <Activity size={24} />
              </div>
              <span className="bg-[#d1f4e0] text-[#006c49] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <TrendingUp size={12} strokeWidth={3} /> En direct
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Présence Globale</p>
              <h2 className="font-display font-black text-white text-6xl md:text-7xl tracking-tighter">
                {globalStats.tauxPresenceGlobal}<span className="text-3xl text-gray-500">%</span>
              </h2>
            </div>
          </motion.div>

          <motion.div variants={item} className="bento-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-[#f1f4f2] text-[#1a1c1e] rounded-[1rem] flex items-center justify-center mb-4">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">Étudiants</p>
              <h3 className="font-display font-black text-[#1a1c1e] text-3xl tracking-tighter">{globalStats.totalEtudiants}</h3>
            </div>
          </motion.div>

          <motion.div variants={item} className="bento-card flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-[#f1f4f2] text-[#1a1c1e] rounded-[1rem] flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <div>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">Professeurs</p>
              <h3 className="font-display font-black text-[#1a1c1e] text-3xl tracking-tighter">{globalStats.totalProfesseurs}</h3>
            </div>
          </motion.div>

          <motion.div variants={item}
            className="col-span-2 md:col-span-4 bg-[#d1f4e0] rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm border border-[#006c49]/10">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-[#006c49] opacity-20 ${globalStats.seancesEnCours > 0 ? 'animate-ping' : ''}`} />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#006c49]" />
              </div>
              <div>
                <h3 className="font-display font-black text-[#006c49] text-xl tracking-tighter leading-tight">
                  {globalStats.seancesEnCours} Séance(s) en cours
                </h3>
                <p className="text-[#006c49]/70 font-bold text-xs">Système de pointage actif.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions + Insights */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">

          {/* Actions rapides */}
          <motion.div variants={item} className="md:col-span-7 space-y-4">
            <h3 className="font-display font-black text-xl text-[#1a1c1e] tracking-tighter flex items-center gap-2">
              <Zap className="text-[#006c49]" size={20} /> Actions Rapides
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Ajouter\nÉtudiant",  icon: UserPlus,    hover: 'bg-[#006c49]', modal: null },
                { label: "Nouveau\nProfesseur", icon: Users,       hover: 'bg-[#1a1c1e]', modal: null },
                { label: "Gérer\nPlannings",    icon: CalendarPlus,hover: 'bg-[#006c49]', modal: null, route: '/admin/planning' },
                { label: "Gestion\nSalles",     icon: MapPin,      hover: 'bg-[#006c49]', modal: 'salle' },
                { label: "Ajouter\nModule",     icon: BookOpen,    hover: 'bg-[#1a1c1e]', modal: 'cours' },
                { label: "Importer\nCSV",       icon: Upload,      hover: 'bg-[#006c49]', modal: 'csv' },
              ].map(({ label, icon: Icon, hover, modal, route }) => (
                <button key={label}
                  onClick={() => route ? navigate(route) : modal && setActiveModal(modal)}
                  className="bg-white p-5 rounded-[2rem] border border-white hover:border-[#006c49]/30 shadow-sm
                             flex flex-col items-center justify-center gap-3 group transition-all">
                  <div className={`w-12 h-12 bg-[#f1f4f2] group-hover:${hover} rounded-[1.2rem]
                                   flex items-center justify-center transition-colors`}>
                    <Icon size={22} className="text-[#1a1c1e] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-bold text-xs text-gray-600 text-center whitespace-pre-line">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── INSIGHTS DYNAMIQUES ──────────────────────────────────────── */}
          <motion.div variants={item} className="md:col-span-5 space-y-4 flex flex-col">
            <h3 className="font-display font-black text-xl text-[#1a1c1e] tracking-tighter flex items-center gap-2 shrink-0">
              <Sparkles className="text-orange-400" size={20} /> Insights Système
            </h3>
            <InsightsDynamiques insights={insights} loading={insightsLoading} />
          </motion.div>

        </div>
      </motion.div>

      {/* ══════════════════ MODALES ══════════════════ */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#1a1c1e]/80 backdrop-blur-md" />

            <motion.div
              initial={{ y: "100%", scale: 0.95 }} animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-10 relative z-10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
              <button onClick={closeModal}
                className="absolute top-7 right-7 p-3 bg-[#f1f4f2] text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-50">
                <X size={18} />
              </button>

              {/* ── SALLE ────────────────────────────────── */}
              {activeModal === 'salle' && (
                <div className="flex flex-col h-full max-h-[85vh]">
                  <h2 className="font-display font-black text-4xl text-[#1a1c1e] tracking-tighter leading-[0.8] mb-6 shrink-0">
                    Nouvelle <br/> <span className="text-[#006c49]">Salle.</span>
                  </h2>
                  <div className="space-y-6 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">
                    <input type="text" placeholder="Nom de la salle (ex: Amphi A)"
                      value={newSalle.nom} onChange={e => setNewSalle({...newSalle, nom: e.target.value})}
                      className="w-full bg-[#f1f4f2] rounded-2xl py-5 px-6 font-bold text-lg outline-none border-2 border-transparent focus:border-[#006c49]/30" />
                    <input type="text" placeholder="Département (optionnel)"
                      value={newSalle.departement} onChange={e => setNewSalle({...newSalle, departement: e.target.value})}
                      className="w-full bg-[#f1f4f2] rounded-2xl py-4 px-6 font-bold text-sm outline-none border-2 border-transparent focus:border-[#006c49]/30" />
                    {error && <ErrorBox message={error} />}
                  </div>
                  <div className="pt-4 shrink-0 mt-auto bg-white">
                    <button onClick={handleAddSalle} disabled={loading}
                      className="w-full py-6 bg-[#1a1c1e] text-white rounded-[2.5rem] font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] disabled:bg-gray-200 transition-all">
                      {loading ? "Enregistrement..." : "Ajouter la salle"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── MODULE + ASSIGNATIONS ─────────────────── */}
              {activeModal === 'cours' && (
                <div className="flex flex-col h-full max-h-[85vh]">
                  <h2 className="font-display font-black text-4xl text-[#1a1c1e] tracking-tighter leading-[0.8] mb-6 shrink-0">
                    Nouveau <br/> <span className="text-[#006c49]">Module.</span>
                  </h2>
                  <div className="space-y-6 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nom du module</label>
                      <input type="text" placeholder="Ex: Base de données, ReactJS..."
                        value={newCours.libelle} onChange={e => setNewCours({...newCours, libelle: e.target.value})}
                        className="w-full bg-[#f1f4f2] rounded-2xl py-5 px-6 font-bold text-lg outline-none border-2 border-transparent focus:border-[#006c49]/30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Spécialité</label>
                      <div className="flex gap-2">
                        {['SITW', '1ère Ingénieur'].map(spe => (
                          <button key={spe}
                            onClick={() => setNewCours({...newCours, specialite: spe})}
                            className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                              ${newCours.specialite === spe ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/20' : 'bg-[#f1f4f2] text-gray-500 hover:bg-gray-200'}`}>
                            {spe === '1ère Ingénieur' ? '1ère ING' : spe}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Professeurs assignés</label>
                        <button onClick={addAssignationRow}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d1f4e0] text-[#006c49] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006c49] hover:text-white transition-all">
                          <Plus size={12} strokeWidth={3} /> Ajouter
                        </button>
                      </div>
                      {assignations.length === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-6 text-center">
                          <p className="text-xs text-gray-400 font-bold">Cliquez sur "Ajouter" pour assigner des professeurs</p>
                        </div>
                      )}
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                        {assignations.map((a, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex gap-2 items-center bg-[#f1f4f2] rounded-2xl p-3">
                            <select value={a.typeSeance} onChange={e => updateAssignation(i, 'typeSeance', e.target.value)}
                              className="appearance-none bg-white rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-widest text-[#1a1c1e] outline-none cursor-pointer shrink-0 w-[80px]">
                              <option value="COURS">Cours</option>
                              <option value="TD">TD</option>
                              <option value="TP">TP</option>
                            </select>
                            <select value={a.profId} onChange={e => updateAssignation(i, 'profId', e.target.value)}
                              className="appearance-none bg-white rounded-xl px-3 py-2.5 text-xs font-bold text-[#1a1c1e] outline-none cursor-pointer flex-1 min-w-0">
                              <option value="">Choisir un professeur</option>
                              {allProfs.map(p => (
                                <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                              ))}
                            </select>
                            <button onClick={() => removeAssignation(i)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      {assignations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {['COURS', 'TD', 'TP'].map(type => {
                            const count = assignations.filter(a => a.typeSeance === type).length;
                            if (!count) return null;
                            return (
                              <span key={type} className="px-2.5 py-1 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 shadow-sm">
                                {count}× {type}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {error && <ErrorBox message={error} />}
                  </div>
                  <div className="pt-4 shrink-0 mt-auto bg-white">
                    <button onClick={handleAddCours} disabled={loading || !newCours.libelle.trim()}
                      className="w-full py-6 bg-[#1a1c1e] text-white rounded-[2.5rem] font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] disabled:bg-gray-200 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                      {loading
                        ? <><Loader2 size={16} className="animate-spin"/> Création...</>
                        : `Créer le module${assignations.length > 0 ? ` avec ${assignations.length} assignation(s)` : ''}`}
                    </button>
                  </div>
                </div>
              )}

              {/* ── IMPORT CSV ────────────────────────────── */}
              {activeModal === 'csv' && (
                <div className="flex flex-col h-full max-h-[85vh]">
                  <h2 className="font-display font-black text-4xl text-[#1a1c1e] tracking-tighter leading-[0.8] mb-6 shrink-0">
                    Importer <br/> <span className="text-[#006c49]">Étudiants.</span>
                  </h2>
                  <div className="space-y-6 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">
                    <div className="bg-[#f1f4f2] rounded-2xl px-5 py-4 space-y-1">
                      <p className="text-[10px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">Format CSV</p>
                      <code className="text-[11px] font-mono text-[#006c49] block">
                        MatriculeEtudiant ; Nom ; Prenom ; Sex ; DateNaissance ; CarteRFID
                      </code>
                    </div>
                    {!importResult && (
                      <div
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all
                          ${isDragging ? 'border-[#006c49] bg-[#d1f4e0]/30' : 'border-gray-200 hover:border-[#006c49]/50'}`}
                      >
                        <input ref={fileInputRef} type="file" accept=".csv"
                          onChange={e => handleFileSelect(e.target.files[0])} className="hidden" />
                        {csvFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-[#d1f4e0] text-[#006c49] rounded-2xl flex items-center justify-center">
                              <FileText size={20}/>
                            </div>
                            <div className="text-left">
                              <p className="font-display font-black text-[#1a1c1e] text-sm">{csvFile.name}</p>
                              <p className="text-[10px] text-gray-400">{(csvFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-[#f1f4f2] rounded-2xl flex items-center justify-center mx-auto">
                              <Upload size={22} className="text-gray-400"/>
                            </div>
                            <p className="font-display font-black text-[#1a1c1e] text-sm">Glissez votre fichier ici</p>
                            <p className="text-xs text-gray-400">ou cliquez pour sélectionner un .csv</p>
                          </div>
                        )}
                      </div>
                    )}
                    {csvPreview.length > 0 && !importResult && (
                      <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-[11px]">
                          <tbody>
                            {csvPreview.map((row, ri) => (
                              <tr key={ri} className={ri === 0 ? 'bg-[#1a1c1e] text-white' : 'border-t border-gray-50'}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className={`px-3 py-2 ${ri === 0 ? 'font-black text-[10px] uppercase' : 'font-medium text-gray-600'}`}>
                                    {cell.trim()}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {importResult && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="flex items-center gap-3 bg-[#d1f4e0] rounded-2xl p-4 border border-[#006c49]/20">
                          <CheckCircle2 size={22} className="text-[#006c49] shrink-0"/>
                          <p className="font-display font-black text-[#006c49]">Import terminé — {importResult.message}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Importés', val: importResult.importes, bg: 'bg-[#d1f4e0]', c: 'text-[#006c49]' },
                            { label: 'Doublons', val: importResult.doublons, bg: 'bg-orange-50',  c: 'text-orange-500' },
                            { label: 'Erreurs',  val: importResult.erreurs,  bg: 'bg-red-50',     c: 'text-red-500' },
                          ].map(({ label, val, bg, c }) => (
                            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
                              <p className={`font-display font-black text-3xl ${c}`}>{val}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{label}</p>
                            </div>
                          ))}
                        </div>
                        <button onClick={closeModal}
                          className="w-full py-5 bg-[#1a1c1e] text-white rounded-[2.5rem] font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] transition-all mt-4">
                          Fermer
                        </button>
                      </motion.div>
                    )}
                    {error && <ErrorBox message={error} />}
                  </div>
                  {!importResult && (
                    <div className="pt-4 shrink-0 mt-auto bg-white">
                      <button onClick={handleImportSubmit} disabled={!csvFile || loading}
                        className="w-full py-6 bg-[#1a1c1e] text-white rounded-[2.5rem] font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] disabled:bg-gray-200 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3">
                        {loading ? <><Loader2 size={18} className="animate-spin"/> Importation...</> : <><Upload size={18}/> Lancer l'import</>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ErrorBox = ({ message }) => (
  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
    className="bg-orange-50 p-5 rounded-[2rem] flex items-start gap-4 border border-orange-100">
    <AlertCircle className="text-orange-500 shrink-0 mt-1" size={20}/>
    <p className="text-[11px] text-orange-700 font-bold leading-relaxed">{message}</p>
  </motion.div>
);

export default AdminDashboard;