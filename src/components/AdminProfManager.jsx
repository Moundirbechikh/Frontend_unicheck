import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, GraduationCap, ArrowRight, Download,
  Loader2, X, RefreshCw, BookOpen, Clock,
  FileText, Users, Mail, ChevronRight,
  BarChart2, CheckCircle2, AlertCircle, Inbox,
  ArrowUpDown
} from 'lucide-react';

const API = 'https://backend-unicheck.onrender.com';

// ── CSV export (Mis à jour avec logique NAdir) ───────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════
// Modal détail prof (Optimisée Espace & Slide Mobile)
// ════════════════════════════════════════════════════════════════════════════
const ProfModal = ({ prof, onClose }) => {
  const [detail,        setDetail]        = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [activeSlide,   setActiveSlide]   = useState(0);
  const scrollRef = useRef(null);
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

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeSlide) setActiveSlide(newIndex);
    }
  };

  const scrollToSlide = (index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveSlide(index);
    }
  };

  const initials = (prof.prenom?.[0] || '') + (prof.nom?.[0] || '');
  const color    = avatarColor(prof.name || prof.nom);

  // Graphique séances par mois (Taille ultra-réduite)
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
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-[#1a1c1e]/80 backdrop-blur-md" />

      <motion.div
        initial={{ y: 60, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, opacity: 0 }}
        className="relative z-10 w-full md:max-w-lg bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] md:max-h-[90vh] overflow-hidden"
      >
        {/* Header Profil Noir (Compacté) */}
        <div className="bg-[#1a1c1e] shrink-0 p-5 md:p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          <button onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full
                       text-white transition-colors z-50 cursor-pointer">
            <X size={16} />
          </button>

          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center
                             font-display font-black text-xl shadow-lg shrink-0`}>
              {initials}
            </div>
            <div className="pr-8 min-w-0">
              <h2 className="font-display font-black text-xl text-white tracking-tighter truncate leading-none mb-1.5">
                {prof.prenom} {prof.nom}
              </h2>
              <a href={`mailto:${prof.email}`} className="flex items-center gap-1.5 text-gray-400 hover:text-[#006c49] transition-colors">
                 <Mail size={11} className="shrink-0"/>
                 <p className="text-[11px] font-bold truncate">{prof.email}</p>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
            {[
              { label: 'Séances',   val: prof.seancesTerminees || 0, color: 'text-white' },
              { label: 'Heures',    val: prof.heuresFormat || '0h',  color: 'text-[#006c49]' },
              { label: 'En attente',val: prof.justifsAttente || 0,   color: 'text-orange-400' },
            ].map(({ label, val, color: c }) => (
              <div key={label} className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className={`font-display font-black text-lg leading-none ${c}`}>{val}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body avec logique Slide & Points (Gain d'espace) */}
        <div className="flex-1 flex flex-col min-h-0 bg-white relative">
          
          {/* Indicateurs (Points de défilement) */}
          <div className="flex justify-center items-center gap-1.5 py-3 shrink-0 bg-white z-20">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index ? 'w-4 bg-[#006c49]' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {loadingDetail ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 size={28} className="animate-spin text-[#006c49]" />
            </div>
          ) : detail ? (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar flex-1 items-start"
            >
              {/* SLIDE 1 : ACTIVITÉ GLOBALE */}
              <div className="w-full shrink-0 snap-center px-5 md:px-6 pb-6 space-y-5 overflow-y-auto custom-scrollbar h-full">
                <div>
                  <p className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">
                    Modules enseignés
                  </p>
                  {detail.modules?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {detail.modules.map(m => (
                        <span key={m} className="px-2.5 py-1 bg-[#f1f4f2] text-[#1a1c1e] rounded-lg
                                                 text-[10px] font-display font-black">
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucun module associé</p>
                  )}
                </div>

                {detail.seancesParMois && Object.values(detail.seancesParMois).some(v => v > 0) && (
                  <div>
                    <p className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">
                      Activité (12 derniers mois)
                    </p>
                    <div className="bg-[#f1f4f2] rounded-2xl p-2.5">
                      <MiniChart data={detail.seancesParMois} />
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">
                    Bilan justificatifs
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Acceptés', val: detail.justifsAcceptes || 0, bg: 'bg-[#d1f4e0]', color: 'text-[#006c49]' },
                      { label: 'Refusés',  val: detail.justifsRefuses || 0,  bg: 'bg-red-50',    color: 'text-red-500'    },
                      { label: 'En attente',val: detail.justifsAttente || 0, bg: 'bg-orange-50', color: 'text-orange-500' },
                    ].map(({ label, val, bg, color: c }) => (
                      <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
                        <p className={`font-display font-black text-lg leading-none ${c}`}>{val}</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SLIDE 2 : ASSIDUITÉ PAR MODULE */}
              <div className="w-full shrink-0 snap-center px-5 md:px-6 pb-6 space-y-4 overflow-y-auto custom-scrollbar h-full">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] font-black font-display uppercase tracking-widest text-gray-400">
                    Assiduité par module
                  </p>
                  <div className="flex items-center gap-1 bg-[#f1f4f2] px-2 py-1 rounded-md">
                    <BarChart2 size={10} className="text-[#006c49]"/>
                    <span className="text-[9px] font-black text-[#1a1c1e]">
                      Global : {prof.tauxPresenceGlobal || 0}%
                    </span>
                  </div>
                </div>
                
                {/* Implémentation générique sécurisée pour la liste d'assiduité basée sur NAdir */}
                {(detail.assiduiteModules || detail.statsModules || []).length > 0 ? (
                  (detail.assiduiteModules || detail.statsModules).map((mod, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-display font-black text-sm text-[#1a1c1e] truncate max-w-[70%]">
                          {mod.module || mod.nom}
                        </span>
                        <span className="font-black text-sm text-[#006c49]">{mod.tauxPresence || mod.taux || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${Math.min(100, mod.tauxPresence || mod.taux || 0)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="bg-[#006c49] h-full rounded-full" 
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>{mod.seancesRealisees || 0} faites</span>
                        <span>{mod.seancesTotal || 0} planifiées</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <BookOpen size={24} className="text-gray-300 mb-2"/>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center">Aucune donnée<br/>d'assiduité</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-gray-400 text-center">Données indisponibles</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Composant principal (Logique NAdir + Design Original)
// ════════════════════════════════════════════════════════════════════════════
const AdminProfManager = () => {
  const [profs,           setProfs]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterModule,    setFilterModule]    = useState('Tous');
  const [filterCharge,    setFilterCharge]    = useState('Tous'); 
  const [filterJustifs,   setFilterJustifs]   = useState(false);
  const [selectedProf,    setSelectedProf]    = useState(null);
  
  // Nouveaux états de tri depuis logique NAdir
  const [sortBy,          setSortBy]          = useState('nom');
  const [sortOrder,       setSortOrder]       = useState('asc');

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

  // Filtrage
  let filtered = profs.filter(p => {
    const matchSearch  = p.nom?.toLowerCase().includes(searchTerm.toLowerCase())
                      || p.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
                      || p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule  = filterModule === 'Tous'
                      || (p.modules || []).includes(filterModule);
    const matchCharge  = filterCharge === 'Tous'
                      || (filterCharge === 'Actif'   && p.seancesTerminees > 0)
                      || (filterCharge === 'Inactif' && p.seancesTerminees === 0);
    const matchJustifs = !filterJustifs || p.justifsAttente > 0;
    return matchSearch && matchModule && matchCharge && matchJustifs;
  });

  // Tri
  filtered.sort((a, b) => {
    let valA, valB;
    if (sortBy === 'nom') {
      valA = (a.nom || '').toLowerCase();
      valB = (b.nom || '').toLowerCase();
    } else if (sortBy === 'presence') {
      valA = a.tauxPresenceGlobal || 0;
      valB = b.tauxPresenceGlobal || 0;
    } else if (sortBy === 'heures') {
      valA = a.heures || 0;
      valB = b.heures || 0;
    } else {
      valA = a.seancesTerminees || 0;
      valB = b.seancesTerminees || 0;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        
        /* Cacher la scrollbar native pour le slider mais garder la fonctionnalité */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="absolute -top-24 -right-24 text-[#006c49]/5 pointer-events-none -rotate-12 select-none">
        <GraduationCap size={500} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* HEADER PAGE */}
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
              className="bg-white text-[#1a1c1e] border border-gray-200 px-5 py-4 rounded-[2rem]
                         font-display font-black text-xs uppercase tracking-widest shadow-sm
                         flex items-center gap-2 hover:bg-[#f1f4f2] hover:border-[#006c49]/30 transition-all">
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Exporter ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* BARRE DE FILTRAGE */}
        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center w-full">
            
            <div className="relative w-full md:flex-1">
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher par nom ou email..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#f1f4f2] border-none rounded-[1.5rem] py-4 pl-16 pr-6 font-bold
                           text-[#1a1c1e] focus:ring-2 focus:ring-[#006c49]/20 outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={18}/>
                </button>
              )}
            </div>
            
            <div className="flex w-full md:w-auto shrink-0 bg-[#f1f4f2] border border-transparent shadow-sm rounded-[1.5rem] px-5 py-4 items-center gap-3">
              <ArrowUpDown size={16} className="text-gray-400"/>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-widest text-[#1a1c1e] outline-none cursor-pointer">
                <option value="nom">Nom</option>
                <option value="presence">Assiduité</option>
                <option value="heures">Heures</option>
                <option value="seances">Séances</option>
              </select>
              <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} 
                      className="text-gray-400 hover:text-[#006c49] font-black text-xs w-4">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            
            <div className="flex items-center gap-1 bg-white border border-gray-100 p-1.5 rounded-[1.5rem] shadow-sm">
               {['Tous', 'Actif', 'Inactif'].map(c => (
                  <button key={c}
                    onClick={() => setFilterCharge(c)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${filterCharge === c
                        ? 'bg-[#1a1c1e] text-white'
                        : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}>
                    {c}
                  </button>
               ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar hide-scrollbar">
              {allModules.map(m => (
                <button key={m}
                  onClick={() => setFilterModule(m)}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
                              transition-all truncate max-w-[140px] border
                    ${filterModule === m
                      ? 'bg-white text-[#1a1c1e] border-gray-200 shadow-sm'
                      : 'bg-transparent text-gray-400 border-transparent hover:bg-white/50'}`}>
                  {m === 'Tous' ? 'Tous modules' : m}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFilterJustifs(p => !p)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest
                          flex items-center gap-2 transition-all ml-auto
                ${filterJustifs
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-orange-500 border border-orange-200 hover:bg-orange-50'}`}>
              <FileText size={12} /> Justifs en attente
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black
                ${filterJustifs ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                {withJustifsCount}
              </span>
            </button>
          </div>
        </div>

        {/* LISTE DES PROFESSEURS */}
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
                  const color    = avatarColor(prof.name || prof.nom);
                  const hasJustif = prof.justifsAttente > 0;

                  return (
                    <motion.div key={prof.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedProf(prof)}
                      className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-transparent
                                 hover:border-[#006c49]/20 hover:shadow-xl hover:-translate-y-1
                                 transition-all group relative overflow-hidden cursor-pointer flex flex-col justify-between"
                    >
                      <div className="absolute -right-4 -top-4 w-28 h-28 bg-[#f1f4f2] rounded-full
                                      group-hover:bg-[#d1f4e0]/40 transition-colors pointer-events-none" />
                      <div className="absolute bottom-5 right-5 w-9 h-9 bg-[#f1f4f2] rounded-full
                                      flex items-center justify-center text-gray-400
                                      group-hover:bg-[#1a1c1e] group-hover:text-white transition-all z-20">
                        <ArrowRight size={15} />
                      </div>

                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={`w-14 h-14 ${color} rounded-[1.2rem] flex items-center
                                           justify-center font-display font-black text-xl shadow-md`}>
                            {initials}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <div className="bg-[#f1f4f2] px-2.5 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-1">
                               <BarChart2 size={10} className="text-[#006c49]" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1c1e]">
                                 {prof.tauxPresenceGlobal || 0}%
                               </span>
                             </div>
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
                          <div className="bg-[#f1f4f2] rounded-2xl p-2.5 text-center relative overflow-hidden group/pres">
                            <div className="absolute inset-0 bg-[#006c49]/5 translate-y-full group-hover/pres:translate-y-0 transition-transform"/>
                            <BookOpen size={11} className="text-gray-400 mx-auto mb-0.5 relative z-10" />
                            <p className="font-display font-black text-sm text-[#1a1c1e] leading-none relative z-10">
                              {prof.seancesTerminees || 0}
                            </p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5 relative z-10">Séances</p>
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