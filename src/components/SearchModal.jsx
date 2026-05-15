import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, Loader2, AlertCircle } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, seance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [processingId, setProcessingId] = useState(null);
  const [successIds, setSuccessIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // FONCTION LOGIQUE : Extraire la spécialité du groupe (ex: "G1 SITW" -> "SITW")
  const extraireSpecialite = (nomGroupe) => {
    if (!nomGroupe) return "";
    // On enlève "G1 ", "G2 ", etc. (prend tout ce qui est après le premier espace)
    const parts = nomGroupe.split(' ');
    if (parts.length > 1) {
      return parts.slice(1).join(' ').toUpperCase();
    }
    return nomGroupe.toUpperCase();
  };

  useEffect(() => {
    if (!isOpen) return;

    console.log("--- DEBUG START ---");
    console.log("Groupe séance original:", seance?.groupe);
    const specialiteCible = extraireSpecialite(seance?.groupe);
    console.log("Spécialité extraite pour filtrage:", specialiteCible);

    const fetchEtudiants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Rappel: Si tu as 404 ici, c'est que ton Backend n'a pas @GetMapping sur /api/etudiants
        const res = await fetch(`https://backend-unicheck.onrender.com/api/etudiants`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Status API Etudiants:", res.status);

        if (res.ok) {
          const data = await res.json();
          console.log("Total étudiants reçus du serveur:", data.length);
          
          // FILTRAGE : On ne garde que ceux de la spécialité (SITW par ex)
          // Peu importe leur groupe (G1, G2...)
          const filtrePromo = data.filter(e => {
            const speEtudiant = e.specialite?.toUpperCase() || "";
            return speEtudiant.includes(specialiteCible) || specialiteCible.includes(speEtudiant);
          });

          console.log(`Etudiants filtrés pour ${specialiteCible}:`, filtrePromo.length);
          setEtudiants(filtrePromo);
        } else {
          setErrorMsg("Erreur serveur : " + res.status);
        }
      } catch (err) {
        console.error("Erreur fetch:", err);
        setErrorMsg("Impossible de contacter le serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchEtudiants();
  }, [isOpen, seance]);

  // Filtrage par la barre de recherche (Nom/Matricule)
  const filteredEtudiants = etudiants.filter(e => {
    const searchLower = searchTerm.toLowerCase();
    const nom = e.nom?.toLowerCase() || "";
    const prenom = e.prenom?.toLowerCase() || "";
    const matricule = e.matricule?.toLowerCase() || "";

    return nom.includes(searchLower) || prenom.includes(searchLower) || matricule.includes(searchLower);
  });

  const validerPresence = async (etudiantId) => {
    setProcessingId(etudiantId);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://backend-unicheck.onrender.com/api/presences/manuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ etudiantId: etudiantId, seanceId: seance.id })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessIds(prev => [...prev, etudiantId]);
      } else {
        setErrorMsg(data.message || "Erreur lors du pointage.");
      }
    } catch (err) {
      setErrorMsg("Erreur réseau.");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-[#f1f4f2] flex flex-col p-4 md:p-8 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-5 md:mb-12 shrink-0 pt-4 mt-8 md:mt-0">
        <h2 className="text-4xl md:text-6xl font-black text-[#1a1c1e] tracking-tighter leading-none">
          Appel {extraireSpecialite(seance?.groupe)}<span className="text-[#006c49]">.</span>
        </h2>
        <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-200">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col min-h-0">
        <div className="relative mb-6">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 w-10 h-10" strokeWidth={3} />
          <input 
            autoFocus type="text" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom ou matricule..." 
            className="w-full bg-transparent border-b-4 border-gray-200 focus:border-[#006c49] py-4 pl-14 text-3xl font-black outline-none transition-colors"
          />
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} /> <span className="text-xs font-bold">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3 pb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {loading ? "Chargement..." : `${filteredEtudiants.length} Étudiants en ${extraireSpecialite(seance?.groupe)}`}
          </p>

          {filteredEtudiants.map(etudiant => (
            <div key={etudiant.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400">
                  {etudiant.nom?.[0]}{etudiant.prenom?.[0]}
                </div>
                <div>
                  <p className="font-black text-[#1a1c1e]">{etudiant.nom} {etudiant.prenom}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {etudiant.matricule} • {etudiant.groupe || 'Tous Groupes'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => validerPresence(etudiant.id)}
                disabled={processingId === etudiant.id || successIds.includes(etudiant.id)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${successIds.includes(etudiant.id) 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-[#1a1c1e] text-white hover:bg-[#006c49]'}`}
              >
                {processingId === etudiant.id ? <Loader2 className="animate-spin" size={14} /> : 
                 successIds.includes(etudiant.id) ? "Présent" : "Valider"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchModal;