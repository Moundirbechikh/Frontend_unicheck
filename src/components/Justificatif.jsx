import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileWarning, UploadCloud, FileText, CheckCircle,
  Clock, XCircle, AlertTriangle, ArrowRight,
  Loader2, AlertCircle, FileX
} from 'lucide-react';

const API = 'https://backend-unicheck.onrender.com';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusStyle = (statut) => {
  switch (statut) {
    case 'ACCEPTE':    return { bg: 'bg-[#d1f4e0] border-[#006c49]/20 text-[#006c49]', icon: CheckCircle };
    case 'REFUSE':     return { bg: 'bg-red-50 border-red-100 text-red-500',            icon: XCircle };
    default:           return { bg: 'bg-gray-100 border-gray-200 text-gray-500',        icon: Clock };
  }
};

const Justificatif = () => {
  const [seancesAbsentes,  setSeancesAbsentes]  = useState([]);
  const [historique,       setHistorique]        = useState([]);
  const [loadingSeances,   setLoadingSeances]    = useState(true);
  const [loadingHistorique,setLoadingHistorique] = useState(true);
  const [submitting,       setSubmitting]        = useState(false);
  const [successMsg,       setSuccessMsg]        = useState('');
  const [errorMsg,         setErrorMsg]          = useState('');

  const location = useLocation();
const [selectedSeanceId, setSelectedSeanceId] = useState(
  location.state?.preselectedSeanceId
    ? String(location.state.preselectedSeanceId)
    : ''
);
  const [typeMotif,        setTypeMotif]         = useState('Médical');
  const [motif,            setMotif]             = useState('');
  const [file,             setFile]              = useState(null);
  const [dragActive,       setDragActive]        = useState(false);

  const fileInputRef = useRef(null);
  const etudiantId   = localStorage.getItem('userId');
  const token        = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!etudiantId) return;

    fetch(`${API}/api/justificatifs/etudiant/${etudiantId}/seances-absentes`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setSeancesAbsentes(data))
      .catch(() => {})
      .finally(() => setLoadingSeances(false));

    fetch(`${API}/api/justificatifs/etudiant/${etudiantId}/historique`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setHistorique(data))
      .catch(() => {})
      .finally(() => setLoadingHistorique(false));
  }, [etudiantId]);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFileSelect = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(f.type)) {
      setErrorMsg("Seuls les fichiers PDF et images (JPG, PNG) sont acceptés.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg("Le fichier ne doit pas dépasser 10 MB.");
      return;
    }
    setErrorMsg('');
    setFile(f);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedSeanceId) { setErrorMsg("Sélectionnez une séance."); return; }
    if (!file)             { setErrorMsg("Ajoutez un document justificatif."); return; }

    setSubmitting(true); setErrorMsg(''); setSuccessMsg('');

    const formData = new FormData();
    formData.append('etudiantId', etudiantId);
    formData.append('seanceId',   selectedSeanceId);
    formData.append('typeMotif',  typeMotif);
    formData.append('motif',      motif);
    formData.append('file',       file);

    try {
      const res  = await fetch(`${API}/api/justificatifs/soumettre`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setSuccessMsg("Justificatif soumis avec succès ! Le professeur sera notifié.");
      // Reset formulaire
      setSelectedSeanceId(''); setMotif(''); setFile(null); setTypeMotif('Médical');

      // Rafraîchir les listes
      const [newAbsences, newHistorique] = await Promise.all([
        fetch(`${API}/api/justificatifs/etudiant/${etudiantId}/seances-absentes`, { headers }).then(r => r.json()),
        fetch(`${API}/api/justificatifs/etudiant/${etudiantId}/historique`,       { headers }).then(r => r.json()),
      ]);
      setSeancesAbsentes(newAbsences);
      setHistorique(newHistorique);

    } catch (e) {
      setErrorMsg(e.message || "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSeance = seancesAbsentes.find(s => String(s.id) === selectedSeanceId);

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body relative overflow-hidden">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Fond déco */}
      <div className="absolute top-[30%] -right-32 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <FileWarning size={500} strokeWidth={1} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Titre */}
        <div className="mb-10">
          <h1 className="text-5xl sm:text-7xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.85]">
            Justificatif <br/><span className="text-[#006c49]">d'absence.</span>
          </h1>
          <p className="text-sm text-gray-500 font-body mt-3">
            Soumettez un justificatif pour une séance que vous avez manquée.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── FORMULAIRE ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border border-gray-50 space-y-6"
          >
            {/* Sélection séance */}
            <div>
              <label className="text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-3 block">
                Séance manquée
              </label>
              {loadingSeances ? (
                <div className="flex items-center gap-3 bg-[#f1f4f2] rounded-2xl p-4">
                  <Loader2 size={18} className="animate-spin text-[#006c49]" />
                  <span className="text-sm text-gray-400 font-medium">Chargement des absences...</span>
                </div>
              ) : seancesAbsentes.filter(s => !s.dejaJustifie).length === 0 ? (
                <div className="flex items-center gap-3 bg-[#d1f4e0]/50 rounded-2xl p-4 border border-[#006c49]/10">
                  <CheckCircle size={18} className="text-[#006c49]" />
                  <span className="text-sm text-[#006c49] font-bold">
                    Toutes vos absences ont déjà été justifiées !
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedSeanceId}
                    onChange={e => setSelectedSeanceId(e.target.value)}
                    className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-display font-black
                               text-sm md:text-base p-4 rounded-2xl outline-none
                               focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent
                               focus:border-[#006c49]/20 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Sélectionner une séance absente...</option>
                    {seancesAbsentes
                      .filter(s => !s.dejaJustifie)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.module}{s.typeSeance !== 'Cours' ? ` (${s.typeSeance})` : ''}
                          {' • '}{s.date}{' • '}Prof. {s.profNom}
                        </option>
                      ))
                    }
                  </select>
                  <AlertTriangle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              {/* Détail séance sélectionnée */}
              <AnimatePresence>
                {selectedSeance && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 bg-[#f1f4f2] rounded-2xl px-4 py-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] font-black font-display uppercase tracking-widest text-[#006c49] bg-[#d1f4e0] px-2.5 py-1 rounded-lg">
                        {selectedSeance.typeSeance}
                      </span>
                      <span className="text-[11px] text-gray-500 font-bold">{selectedSeance.groupe}</span>
                      <span className="text-[11px] text-gray-500 font-bold">{selectedSeance.date} à {selectedSeance.heure}</span>
                      <span className="text-[11px] text-gray-500 font-bold">Prof. {selectedSeance.profNom}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Type & motif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-3 block">
                  Type de motif
                </label>
                <select
                  value={typeMotif}
                  onChange={e => setTypeMotif(e.target.value)}
                  className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-bold text-sm p-4 rounded-2xl
                             outline-none focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent cursor-pointer"
                >
                  <option>Médical</option>
                  <option>Administratif</option>
                  <option>Personnel</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-3 block">
                  Détails (optionnel)
                </label>
                <input
                  type="text"
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  placeholder="Bref résumé..."
                  className="w-full bg-[#f1f4f2] text-[#1a1c1e] font-bold text-sm p-4 rounded-2xl
                             outline-none focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent
                             placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Upload zone */}
            <div>
              <label className="text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-3 block">
                Document justificatif (PDF, JPG, PNG — max 10 MB)
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-4 border-dashed rounded-[2rem] p-8 flex flex-col items-center
                            justify-center text-center transition-all cursor-pointer
                            ${dragActive ? 'border-[#006c49] bg-[#d1f4e0]/30'
                                         : file
                                             ? 'border-[#006c49]/40 bg-[#f1f4f2]'
                                             : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <input
                  ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => handleFileSelect(e.target.files[0])}
                />

                {file ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#d1f4e0] text-[#006c49] rounded-2xl flex items-center justify-center">
                      <FileText size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-display font-black text-[#1a1c1e] text-sm">{file.name}</p>
                      <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors
                      ${dragActive ? 'bg-[#006c49] text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                      <UploadCloud size={26} strokeWidth={2} />
                    </div>
                    <p className="font-display font-black text-base text-[#1a1c1e]">Glisse ton fichier ici</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">ou clique pour parcourir</p>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-red-50 rounded-2xl p-4 border border-red-100">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-bold">{errorMsg}</p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-[#d1f4e0] rounded-2xl p-4 border border-[#006c49]/20">
                  <CheckCircle size={18} className="text-[#006c49] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#006c49] font-bold">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedSeanceId || !file}
              className="w-full bg-[#006c49] text-white py-5 px-4 rounded-2xl font-display font-black
                         text-xs uppercase tracking-widest shadow-xl shadow-[#006c49]/20
                         hover:scale-[1.02] active:scale-95 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
                         flex items-center justify-center gap-3 group"
            >
              {submitting
                ? <><Loader2 size={16} className="animate-spin"/> Envoi en cours...</>
                : <>Soumettre le justificatif <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/></>
              }
            </button>
          </motion.div>

          {/* ── HISTORIQUE ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-5"
          >
            <div className="flex items-center gap-3 px-2">
              <FileText size={18} className="text-gray-400" />
              <h3 className="text-sm font-display font-black uppercase tracking-[0.2em] text-[#1a1c1e]">
                Dépôts récents
              </h3>
            </div>

            {loadingHistorique ? (
              <div className="flex items-center justify-center py-8 bg-white rounded-[2rem]">
                <Loader2 size={22} className="animate-spin text-[#006c49]" />
              </div>
            ) : historique.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-8 text-center border border-gray-100">
                <FileX size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-display font-black">Aucun dépôt pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historique.map(item => {
                  const style = getStatusStyle(item.statut);
                  const Icon  = style.icon;
                  return (
                    <div key={item.id}
                      className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100
                                 flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border ${style.bg}`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-black text-[#1a1c1e] text-base tracking-tighter truncate">
                            {item.module}
                            {item.typeSeance && item.typeSeance !== 'Cours'
                              ? <span className="text-gray-400 font-bold"> ({item.typeSeance})</span>
                              : null}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{item.date}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{item.typeMotif}</span>
                          </div>
                          {item.commentaire && (
                            <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">
                              "{item.commentaire}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Absences déjà justifiées */}
            {seancesAbsentes.filter(s => s.dejaJustifie).length > 0 && (
              <div className="bg-white rounded-[2rem] p-4 border border-gray-100">
                <p className="text-[11px] font-display font-black uppercase tracking-widest text-gray-400 mb-3">
                  En attente de décision
                </p>
                {seancesAbsentes.filter(s => s.dejaJustifie).map(s => (
                  <div key={s.id} className="flex items-center gap-2 py-1.5">
                    <Clock size={13} className="text-orange-400 shrink-0" />
                    <p className="text-xs text-gray-500 font-bold truncate">
                      {s.module} — {s.date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Justificatif;