import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Calendar, Clock, Check, X,
  Inbox, ShieldAlert, FileCheck2,
  Loader2, Eye, Download, ExternalLink,
  AlertCircle, CheckCircle
} from 'lucide-react';

const API = 'https://backend-unicheck.onrender.com';

// ── Modal de visualisation PDF ────────────────────────────────────────────────
const PdfViewerModal = ({ justifId, nomFichier, onClose }) => {
  const token   = localStorage.getItem('token');
  const fileUrl = `${API}/api/justificatifs/fichier/${justifId}`;
  
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [errorPdf, setErrorPdf] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    // On fetch le fichier manuellement pour pouvoir passer le Token
    fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Erreur lors de la récupération du fichier");
      return res.blob();
    })
    .then(blob => {
      // On crée une URL locale (Blob) que l'iframe peut lire sans faire de nouvelle requête HTTP
      objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
      setLoadingPdf(false);
    })
    .catch(err => {
      console.error(err);
      setErrorPdf(true);
      setLoadingPdf(false);
    });

    // Nettoyage de la mémoire quand on ferme la modal
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl, token]);

  // Fonction pour le bouton de téléchargement utilisant le même Blob
  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = nomFichier || 'Justificatif.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1a1c1e]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-[2.5rem] overflow-hidden
                   shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#d1f4e0] text-[#006c49] rounded-xl flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <p className="font-display font-black text-[#1a1c1e] text-sm">{nomFichier || 'Document'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Visualisation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Remplacement du <a> classique par un <button> qui télécharge le Blob */}
            <button
              onClick={handleDownload}
              disabled={!blobUrl}
              className="flex items-center gap-2 px-3 py-2 bg-[#f1f4f2] text-[#1a1c1e] rounded-xl
                         text-xs font-display font-black uppercase tracking-widest
                         hover:bg-[#006c49] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} /> Télécharger
            </button>
            <button onClick={onClose}
              className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center
                         hover:bg-red-50 hover:text-red-500 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-h-0 bg-gray-100 p-4 relative flex items-center justify-center">
          {loadingPdf && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                <Loader2 size={32} className="animate-spin text-[#006c49] mb-4" />
                <p className="text-sm font-bold text-gray-500">Chargement du document sécurisé...</p>
             </div>
          )}
          
          {errorPdf && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-sm font-bold text-gray-500">Impossible de charger le fichier.</p>
             </div>
          )}

          {blobUrl && (
            <iframe
              src={blobUrl}
              title="Justificatif"
              className="w-full h-full rounded-2xl bg-white"
              style={{ minHeight: '60vh' }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
const ProfJustificatifs = () => {
  const [requests,       setRequests]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [viewingId,      setViewingId]      = useState(null); // ID du justif à visualiser
  const [viewingNom,     setViewingNom]     = useState('');
  const [processing,     setProcessing]     = useState(null); // ID en cours de traitement
  const [commentaires,   setCommentaires]   = useState({});   // { [id]: string }
  const [showComment,    setShowComment]    = useState(null); // ID pour lequel on montre l'input commentaire
  const [successMsg,     setSuccessMsg]     = useState('');
  const [pendingAction,  setPendingAction]  = useState(null); // { id, decision }

  const profId = localStorage.getItem('userId');
  const token  = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!profId) return;
    fetch(`${API}/api/justificatifs/prof/${profId}/en-attente`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profId]);

  // ── Action (accepter / refuser) ────────────────────────────────────────────
  const handleAction = async (id, decision) => {
    setProcessing(id);
    const commentaire = commentaires[id] || '';

    try {
      const res  = await fetch(`${API}/api/justificatifs/${id}/traiter`, {
        method:  'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ decision, commentaire }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setRequests(prev => prev.filter(r => r.id !== id));
      setSuccessMsg(`Justificatif ${decision === 'ACCEPTE' ? 'accepté' : 'refusé'} avec succès.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowComment(null);
      setPendingAction(null);

    } catch (e) {
      alert(e.message || "Erreur lors du traitement.");
    } finally {
      setProcessing(null);
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Fond déco */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <ShieldAlert size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <FileCheck2 size={400} strokeWidth={1} />
      </div>

      {/* Modal visualisation PDF */}
      <AnimatePresence>
        {viewingId && (
          <PdfViewerModal
            justifId={viewingId}
            nomFichier={viewingNom}
            onClose={() => { setViewingId(null); setViewingNom(''); }}
          />
        )}
      </AnimatePresence>

      <motion.div variants={container} initial="hidden" animate="show"
        className="max-w-3xl mx-auto space-y-10 relative z-10">

        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">
                Centre de révision
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Justificatifs<span className="text-[#006c49]">.</span>
            </h1>
          </div>

          <div className="bg-[#006c49] text-white px-6 py-3 rounded-[1.5rem] font-display font-black
                          text-sm shadow-xl shadow-[#006c49]/20 flex items-center gap-3">
            <span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
              {requests.length}
            </span>
            À TRAITER
          </div>
        </motion.div>

        {/* Message succès */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-[#d1f4e0] rounded-2xl p-4 border border-[#006c49]/20"
            >
              <CheckCircle size={18} className="text-[#006c49] shrink-0" />
              <p className="text-sm text-[#006c49] font-bold">{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white/50 rounded-[3rem]">
              <Loader2 size={32} className="animate-spin text-[#006c49]" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {requests.length > 0 ? requests.map(req => (
                <motion.div
                  key={req.id}
                  variants={item} layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 80, scale: 0.95 }}
                  className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white
                             hover:shadow-xl transition-all relative overflow-hidden"
                >
                  {/* Barre latérale colorée */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-400 opacity-30 rounded-l-[2.5rem]" />

                  {/* En-tête de la carte */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-5">
                    <div className="flex gap-4 min-w-0">
                      <div className="w-14 h-14 bg-[#f1f4f2] text-[#1a1c1e] rounded-2xl flex items-center justify-center shrink-0">
                        <FileText size={26} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-black text-[#1a1c1e] text-2xl tracking-tighter truncate">
                          {req.etudiantNom}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-display font-black
                                        text-gray-400 mt-1 uppercase tracking-[0.1em]">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#006c49]"/> {req.dateSeance}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[#006c49]"/>
                            {req.module}
                            {req.typeSeance && req.typeSeance !== 'Cours'
                              ? ` (${req.typeSeance})` : ''}
                          </span>
                          <span className="text-gray-300">Déposé le {req.dateSoumission}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bouton voir fichier */}
                    <button
                      onClick={() => { setViewingId(req.id); setViewingNom(req.fichierNom); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#f1f4f2] text-[#006c49] rounded-2xl
                                 font-display font-black text-[10px] uppercase tracking-widest
                                 hover:bg-[#006c49] hover:text-white transition-all shrink-0"
                    >
                      <Eye size={15} /> Voir le document
                    </button>
                  </div>

                  {/* Motif */}
                  <div className="mt-6 mb-5 bg-[#f8faf9] p-4 rounded-[1.5rem] border border-gray-100 relative">
                    <span className="absolute -top-3 left-5 bg-white px-3 py-0.5 rounded-full
                                     text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                      Motif — {req.typeMotif}
                    </span>
                    <p className="text-gray-600 font-medium italic leading-relaxed pt-1 text-sm">
                      {req.motif ? `"${req.motif}"` : 'Aucun détail fourni.'}
                    </p>
                  </div>

                  {/* Commentaire optionnel */}
                  <AnimatePresence>
                    {showComment === req.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5 overflow-hidden"
                      >
                        <input
                          type="text"
                          value={commentaires[req.id] || ''}
                          onChange={e => setCommentaires(prev => ({...prev, [req.id]: e.target.value}))}
                          placeholder="Commentaire pour l'étudiant (optionnel)..."
                          className="w-full bg-[#f1f4f2] text-[#1a1c1e] font-bold text-sm p-4 rounded-2xl
                                     outline-none focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent
                                     placeholder:text-gray-400"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">

                    {/* Toggle commentaire */}
                    <button
                      onClick={() => setShowComment(showComment === req.id ? null : req.id)}
                      className="sm:w-auto px-4 py-3.5 bg-[#f1f4f2] text-gray-500 rounded-2xl
                                 font-display font-black text-[10px] uppercase tracking-[0.15em]
                                 hover:bg-gray-200 transition-all"
                    >
                      + Commentaire
                    </button>

                    {/* Refuser */}
                    <button
                      onClick={() => handleAction(req.id, 'REFUSE')}
                      disabled={processing === req.id}
                      className="flex-1 py-4 bg-white border-2 border-red-50 text-red-500 rounded-2xl
                                 font-display font-black text-xs uppercase tracking-[0.2em]
                                 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all
                                 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processing === req.id
                        ? <Loader2 size={16} className="animate-spin"/>
                        : <X size={16} strokeWidth={3} />
                      }
                      Refuser
                    </button>

                    {/* Accepter */}
                    <button
                      onClick={() => handleAction(req.id, 'ACCEPTE')}
                      disabled={processing === req.id}
                      className="flex-1 py-4 bg-[#1a1c1e] text-white rounded-2xl
                                 font-display font-black text-xs uppercase tracking-[0.2em]
                                 hover:bg-[#006c49] transition-all shadow-lg shadow-black/10
                                 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processing === req.id
                        ? <Loader2 size={16} className="animate-spin"/>
                        : <Check size={16} strokeWidth={3} />
                      }
                      Valider
                    </button>
                  </div>
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/40 backdrop-blur-md rounded-[3rem] py-24 text-center border border-white/50"
                >
                  <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto text-[#006c49] shadow-sm mb-6">
                    <Inbox size={48} strokeWidth={1.5} />
                  </div>
                  <h2 className="font-display font-black text-2xl text-[#1a1c1e] tracking-tighter">
                    Tout est à jour !
                  </h2>
                  <p className="text-gray-500 font-medium mt-2">
                    Aucun justificatif n'attend votre validation.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfJustificatifs;