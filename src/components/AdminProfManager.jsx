import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, GraduationCap, ArrowRight, Download,
  Loader2, X, RefreshCw, BookOpen, Clock,
  FileText, Users, Mail, ChevronRight,
  BarChart2, CheckCircle2, AlertCircle, Inbox,
  ArrowUpDown
} from 'lucide-react';

const API = 'https://backend-unicheck.onrender.com';

// ── CSV export ────────────────────────────────────────────────────────────────
const exportToCSV = (profs) => {
  const headers = ['ID', 'Nom', 'Prénom', 'Email',
                   'Modules', 'Taux Présence (%)', 'Séances effectuées', 'Heures enseignées', 'Justifs en attente'];
  const rows = profs.map(p => [
    p.id, p.nom, p.prenom, p.email,
    (p.modules || []).join(' / '),
    p.tauxPresenceGlobal || 0,
    p.seancesTerminees, p.heuresFormat, p.justifsAttente,
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `professeurs_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// ── Couleur avatar déterministe ───────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-[#1a1c1e] text-white',
  'bg-[#006c49] text-white',
  'bg-indigo-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
  'bg-amber-500 text-white',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Stat chip ─────────────────────────────────────────────────────────────────
const Chip = ({ icon: Icon, value, label, color = 'text-[#1a1c1e]', bg = 'bg-[#f1f4f2]' }) => (
  <div className={`flex items-center gap-2 px-3 py-2 ${bg} rounded-2xl`}>
    <Icon size={13} className={color} />
    <div>
      <p className={`font-display font-black text-sm leading-none ${color}`}>{value}</p>
      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// Modal détail prof (AVEC SLIDER FLUIDE)
// ════════════════════════════════════════════════════════════════════════════
const ProfModal = ({ prof, onClose }) => {
  const [detail,        setDetail]        = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [activeTab,     setActiveTab]     = useState(0); // 0 = Activité, 1 = Assiduité
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/professeurs/${prof.id}/detail`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [prof.id]);

  const initials = (prof.prenom?.[0] || '') + (prof.nom?.[0] || '');
  const color    = avatarColor(prof.name);

  // Graphique séances par mois (SVG minimaliste - Taille réduite)
  const MiniChart = ({ data }) => {
    const vals   = Object.values(data);
    const labels = Object.keys(data);
    const max    = Math.max(...vals, 1);
    const W = 320; const H = 50; const BAR_W = Math.floor(W / vals.length) - 4;

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {vals.map((v, i) => {
          const barH = (v / max) * (H - 15);
          const x    = i * (W / vals.length) + 2;
          const y    = H - barH - 10;
          return (
            <g key={i}>
              <rect x={x} y={y} width={BAR_W} height={barH}
                fill={v > 0 ? '#006c49' : '#e5e7eb'} rx={4} />
              {i % 3 === 0 && (
                <text x={x + BAR_W / 2} y={H + 2} textAnchor="middle"
                  fontSize={8} fill="#9ca3af" fontFamily="sans-serif">
                  {labels[i]?.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-[#1a1c1e]/80 backdrop-blur-md" />

      <motion.div
        initial={{ y: 60, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, opacity: 0 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="bg-[#1a1c1e] shrink-0 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -right-2 top-12 w-24 h-24 bg-[#006c49]/30 rounded-full pointer-events-none" />

          <button onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full
                       text-white transition-colors z-50 cursor-pointer">
            <X size={18} />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-16 h-16 ${color} rounded-[1.5rem] flex items-center justify-center
                             font-display font-black text-2xl shadow-lg`}>
              {initials}
            </div>
            <div className="pr-10">
              <h2 className="font-display font-black text-2xl text-white tracking-tighter truncate">
                {prof.prenom} {prof.nom}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-xs font-bold mt-0.5 truncate">{prof.email}</p>
                <a href={`mailto:${prof.email}`} className="text-white/40 hover:text-[#006c49] transition-colors">
                   <Mail size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
            {[
              { label: 'Séances',   val: prof.seancesTerminees || 0, color: 'text-white' },
              { label: 'Heures',    val: prof.heuresFormat || '0h',  color: 'text-[#006c49]' },
              { label: 'En attente',val: prof.justifsAttente || 0,   color: 'text-orange-400' },
            ].map(({ label, val, color: c }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-3 text-center">
                <p className={`font-display font-black text-xl ${c}`}>{val}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 bg-white flex flex-col">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={28} className="animate-spin text-[#006c49]" />
            </div>
          ) : (
            <>
              {/* SLIDER NAVIGATION */}
              <div className="flex items-center justify-between bg-[#f1f4f2] p-1.5 rounded-2xl mb-5 shrink-0">
                <button onClick={() => setActiveTab(0)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all
                    ${activeTab === 0 ? 'bg-white text-[#1a1c1e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  Activité globale
                </button>
                <button onClick={() => setActiveTab(1)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all
                    ${activeTab === 1 ? 'bg-white text-[#1a1c1e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  Assiduité Modules
                </button>
              </div>

              {/* SLIDER CONTENT */}
              <div className="relative flex-1 overflow-hidden min-h-[220px]">
                <AnimatePresence mode="wait">
                  {activeTab === 0 ? (
                    <motion.div key="tab0"
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="space-y-5 h-full overflow-y-auto custom-scrollbar pr-1"
                    >
                      <div>
                        <p className="text-[10px] font-black font-display uppercase tracking-widest text-gray-400 mb-2.5">
                          Modules enseignés
                        </p>
                        {detail?.modules?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {detail.modules.map(m => (
                              <span key={m} className="px-3 py-1.5 bg-[#f1f4f2] text-[#1a1c1e] rounded-xl text-xs font-display font-black">
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Aucun module associé</p>
                        )}
                      </div>

                      {detail?.seancesParMois && Object.values(detail.seancesParMois).some(v => v > 0) && (
                        <div>
                          <p className="text-[10px] font-black font-display uppercase tracking-widest text-gray-400 mb-2.5">
                            Séances / mois (12 derniers mois)
                          </p>
                          <div className="bg-[#f1f4f2] rounded-2xl p-3">
                            <MiniChart data={detail.seancesParMois} />
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-black font-display uppercase tracking-widest text-gray-400 mb-2.5">
                          Bilan justificatifs
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Acceptés', val: detail?.justifsAcceptes || 0, bg: 'bg-[#d1f4e0]', color: 'text-[#006c49]' },
                            { label: 'Refusés',  val: detail?.justifsRefuses || 0,  bg: 'bg-red-50',    color: 'text-red-500'    },
                            { label: 'Attente',  val: detail?.justifsAttente || 0,  bg: 'bg-orange-50', color: 'text-orange-500' },
                          ].map(({ label, val, bg, color: c }) => (
                            <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
                              <p className={`font-display font-black text-xl ${c}`}>{val}</p>
                              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                  ) : (
                    
                    <motion.div key="tab1"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 h-full overflow-y-auto custom-scrollbar pr-1"
                    >
                      <div className="bg-[#1a1c1e] text-white p-4 rounded-2xl flex justify-between items-center">
                         <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Taux de présence global</p>
                           <p className="font-display font-black text-3xl leading-none mt-1">{prof.tauxPresenceGlobal || 0}%</p>
                         </div>
                         <div className="w-12 h-12 rounded-full border-4 border-[#006c49] flex items-center justify-center">
                            <span className="text-xs font-black">Global</span>
                         </div>
                      </div>
                      
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-2">Présence par module enseigné</p>
                      
                      {prof.modulesStats?.length > 0 ? (
                        <div className="space-y-2">
                          {prof.modulesStats.map((ms, idx) => (
                            <div key={idx} className="bg-[#f1f4f2] p-3 rounded-xl flex items-center justify-between">
                               <span className="text-sm font-bold text-[#1a1c1e] truncate max-w-[150px]">{ms.libelle}</span>
                               <div className="flex items-center gap-3 w-1/2 justify-end">
                                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                                     <div className="h-full bg-[#006c49] rounded-full" style={{ width: `${ms.taux}%` }} />
                                  </div>
                                  <span className="text-xs font-black text-[#006c49] w-8 text-right">{ms.taux}%</span>
                               </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Aucune donnée de module disponible</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Composant principal
// ════════════════════════════════════════════════════════════════════════════
const AdminProfManager = () => {
  const [profs,           setProfs]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState('');
  
  // Nouveaux Filtres
  const [filterModule,    setFilterModule]    = useState('Tous');
  const [filterStatut,    setFilterStatut]    = useState('Tous'); // 'Tous', 'Actif', 'Inactif'
  const [sortBy,          setSortBy]          = useState('A-Z');  // 'A-Z', 'Présence +', 'Présence -'
  const [filterJustifs,   setFilterJustifs]   = useState(false);

  const [selectedProf,    setSelectedProf]    = useState(null);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProfs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/professeurs/admin/tous-avec-stats`, { headers });
      if (res.ok) setProfs(await res.json());
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfs(); }, [fetchProfs]);

  const allModules = ['Tous', ...new Set(
    profs.flatMap(p => p.modules || []).filter(Boolean)
  )];

  const withJustifsCount = profs.filter(p => p.justifsAttente > 0).length;

  const filtered = profs.filter(p => {
    const matchSearch  = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
                      || p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule  = filterModule === 'Tous'
                      || (p.modules || []).includes(filterModule);
    const matchStatut  = filterStatut === 'Tous'
                      || (filterStatut === 'Actif'   && p.seancesTerminees > 0)
                      || (filterStatut === 'Inactif' && p.seancesTerminees === 0);
    const matchJustifs = !filterJustifs || p.justifsAttente > 0;
    
    return matchSearch && matchModule && matchStatut && matchJustifs;
  });

  // Appliquer le tri
  filtered.sort((a, b) => {
    if (sortBy === 'Présence +') return (b.tauxPresenceGlobal || 0) - (a.tauxPresenceGlobal || 0);
    if (sortBy === 'Présence -') return (a.tauxPresenceGlobal || 0) - (b.tauxPresenceGlobal || 0);
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>

      <div className="absolute -top-24 -right-24 text-[#006c49]/5 pointer-events-none -rotate-12 select-none">
        <GraduationCap size={500} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Professeurs<span className="text-[#006c49]">.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-1">
              {profs.length} enseignants · {withJustifsCount} avec justificatifs en attente
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchProfs}
              className="w-12 h-12 bg-white text-gray-400 border border-gray-200 rounded-2xl
                         flex items-center justify-center hover:bg-[#f1f4f2] transition-all"
              title="Rafraîchir">
              <RefreshCw size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => exportToCSV(filtered)}
              className="bg-[#1a1c1e] text-white border border-transparent px-5 py-4 rounded-[2rem]
                         font-display font-black text-xs uppercase tracking-widest shadow-lg
                         flex items-center gap-2 hover:bg-[#006c49] transition-all">
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Exporter ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* NOUVELLE BARRE DE FILTRES STRUCTURÉE */}
        <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <div className="relative group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400
                                         group-focus-within:text-[#006c49] transition-colors" />
            <input type="text" placeholder="Rechercher par nom ou email..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#f1f4f2] border-none rounded-[2rem] py-4 pl-16 pr-6 font-bold
                         text-[#1a1c1e] focus:ring-2 focus:ring-[#006c49]/20 outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={18}/>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Filtres Modules (Scrollable si besoin) */}
            <div className="flex items-center bg-[#f1f4f2] rounded-2xl p-1 overflow-x-auto max-w-[280px] md:max-w-md custom-scrollbar">
              {allModules.map(m => (
                <button key={m}
                  onClick={() => setFilterModule(m)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                              transition-all truncate whitespace-nowrap
                    ${filterModule === m
                      ? 'bg-white text-[#1a1c1e] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'}`}>
                  {m === 'Tous' ? 'Tous modules' : m}
                </button>
              ))}
            </div>

            {/* Filtre Statut (Actif/Inactif) */}
            <div className="flex items-center bg-[#f1f4f2] rounded-2xl p-1">
              {['Tous', 'Actif', 'Inactif'].map(statut => (
                <button key={statut}
                  onClick={() => setFilterStatut(statut)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${filterStatut === statut
                      ? 'bg-white text-[#1a1c1e] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'}`}>
                  {statut}
                </button>
              ))}
            </div>

            {/* Tri (A-Z, Présence +, Présence -) */}
            <div className="flex items-center bg-[#f1f4f2] rounded-2xl p-1 ml-auto">
              <span className="pl-3 pr-2 text-gray-400"><ArrowUpDown size={14}/></span>
              {['A-Z', 'Présence +', 'Présence -'].map(tri => (
                <button key={tri} onClick={() => setSortBy(tri)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                  ${sortBy === tri ? 'bg-white text-[#006c49] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {tri}
                </button>
              ))}
            </div>

            {/* Bouton Justifs (Toggle) */}
            <button
              onClick={() => setFilterJustifs(p => !p)}
              className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest
                          flex items-center gap-2 transition-all ml-0 md:ml-2
                ${filterJustifs
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'}`}>
              <FileText size={12} /> Justifs en attente
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black
                ${filterJustifs ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                {withJustifsCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── GRILLE DES RÉSULTATS ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={40} className="animate-spin text-[#006c49]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-[3rem] border border-dashed border-gray-200">
            <Search size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="font-display font-black text-gray-400 uppercase tracking-widest text-sm">
              Aucun professeur trouvé
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filtered.map((prof, i) => {
                  const initials = (prof.prenom?.[0] || '') + (prof.nom?.[0] || '');
                  const color    = avatarColor(prof.name);
                  const hasJustif = prof.justifsAttente > 0;

                  return (
                    <motion.div key={prof.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedProf(prof)}
                      className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-transparent
                                 hover:border-[#006c49]/20 hover:shadow-xl hover:-translate-y-1
                                 transition-all group relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute -right-4 -top-4 w-28 h-28 bg-[#f1f4f2] rounded-full
                                      group-hover:bg-[#d1f4e0]/40 transition-colors pointer-events-none" />
                      
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={`w-14 h-14 ${color} rounded-[1.2rem] flex items-center
                                           justify-center font-display font-black text-xl shadow-md`}>
                            {initials}
                          </div>
                          
                          {/* AJOUT DU TAUX DE PRÉSENCE SANS CASSER LA TAILLE DE LA CARTE */}
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#f1f4f2] text-[#1a1c1e] shadow-sm">
                              {prof.tauxPresenceGlobal || 0}% Présence
                            </span>
                            {hasJustif && (
                              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100
                                              px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                                  {prof.justifsAttente} en attente
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pr-10">
                          <h3 className="text-lg font-display font-black text-[#1a1c1e] leading-tight
                                         uppercase tracking-tighter truncate">
                            {prof.nom} {prof.prenom}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <a 
                                href={`mailto:${prof.email}`} 
                                onClick={(e) => e.stopPropagation()} 
                                className="flex items-center gap-1.5 text-gray-400 hover:text-[#006c49] transition-colors"
                                title="Envoyer un email"
                            >
                                <Mail size={11} className="shrink-0" />
                                <p className="font-bold text-[11px] truncate">{prof.email}</p>
                                <span className="text-[12px]">📧</span> 
                            </a>
                          </div>
                        </div>

                        {prof.modules?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pr-10">
                            {prof.modules.slice(0, 2).map(m => (
                              <span key={m} className="px-2.5 py-1 bg-[#f1f4f2] text-gray-600 rounded-xl
                                                       text-[9px] font-black uppercase tracking-widest truncate max-w-[120px]">
                                {m}
                              </span>
                            ))}
                            {prof.modules.length > 2 && (
                              <span className="px-2.5 py-1 bg-[#f1f4f2] text-gray-400 rounded-xl
                                               text-[9px] font-black">
                                +{prof.modules.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 pr-10">
                          <div className="bg-[#f1f4f2] rounded-2xl p-2.5 text-center">
                            <Clock size={11} className="text-gray-400 mx-auto mb-0.5" />
                            <p className="font-display font-black text-sm text-[#1a1c1e] leading-none">
                              {prof.heuresFormat || '0h'}
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Heures</p>
                          </div>
                          <div className="bg-[#f1f4f2] rounded-2xl p-2.5 text-center">
                            <BookOpen size={11} className="text-gray-400 mx-auto mb-0.5" />
                            <p className="font-display font-black text-sm text-[#1a1c1e] leading-none">
                              {prof.seancesTerminees || 0}
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Séances</p>
                          </div>
                          <div className={`rounded-2xl p-2.5 text-center
                            ${hasJustif ? 'bg-orange-50' : 'bg-[#f1f4f2]'}`}>
                            <FileText size={11} className={`mx-auto mb-0.5 ${hasJustif ? 'text-orange-400' : 'text-gray-400'}`} />
                            <p className={`font-display font-black text-sm leading-none ${hasJustif ? 'text-orange-500' : 'text-[#1a1c1e]'}`}>
                              {prof.justifsAttente || 0}
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Justifs</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                {
                  label: 'Total affiché',
                  val:   filtered.length,
                  color: 'text-[#1a1c1e]',
                },
                {
                  label: 'Heures totales',
                  val:   filtered.reduce((acc, p) => acc + (p.heures || 0), 0) + 'h',
                  color: 'text-[#006c49]',
                },
                {
                  label: 'Séances effectuées',
                  val:   filtered.reduce((acc, p) => acc + (p.seancesTerminees || 0), 0),
                  color: 'text-[#1a1c1e]',
                },
                {
                  label: 'Justifs en attente',
                  val:   filtered.reduce((acc, p) => acc + (p.justifsAttente || 0), 0),
                  color: 'text-orange-500',
                },
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

      <AnimatePresence>
        {selectedProf && (
          <ProfModal
            prof={selectedProf}
            onClose={() => setSelectedProf(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfManager;