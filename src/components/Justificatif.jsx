import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, UploadCloud, FileText, CheckCircle, Clock, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const Justificatif = () => {
  const [dragActive, setDragActive] = useState(false);

  // Historique factice
  const history = [
    { id: 1, course: "Réseaux & Sécurité", date: "12 Mars", type: "Médical", status: "accepted" },
    { id: 2, course: "Data Science", date: "05 Mars", type: "Administratif", status: "pending" },
    { id: 3, course: "IHM", date: "28 Fév", type: "Autre", status: "rejected" },
  ];

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body relative overflow-hidden">
      
      {/* BACKGROUND LUCIDE ICONS */}
      <div className="absolute top-[30%] -right-32 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <FileWarning size={500} strokeWidth={1} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-8 md:mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.85]">
            Négociation <br/><span className="text-[#006c49]">d'absence.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* FORMULAIRE (GAUCHE) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 space-y-6 md:space-y-8"
          >
            <div className="space-y-5 md:space-y-6">
              {/* Dropdown Séance */}
              <div>
                <label className="text-[10px] md:text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                  Séance manquée
                </label>
                <div className="relative">
                  <select className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-display font-black text-sm md:text-lg p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent focus:border-[#006c49]/20 transition-all cursor-pointer">
                    <option value="" disabled selected>Sélectionner une séance...</option>
                    <option value="1">Base de données • 15 Mars (Prof. Bacha)</option>
                    <option value="2">Algorithmique avancée • 10 Mars</option>
                  </select>
                  <AlertTriangle className="absolute right-4 top-4 md:right-5 md:top-5 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Grid Type & Commentaire - Passe en colonne sur petit mobile, grille sur md */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="text-[10px] md:text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                    Type de motif
                  </label>
                  <select className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-bold text-sm md:text-base p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent">
                    <option>Médical</option>
                    <option>Administratif</option>
                    <option>Personnel</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] md:text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                    Détails (Optionnel)
                  </label>
                  <input type="text" placeholder="Bref résumé..." className="w-full bg-[#f1f4f2] text-[#1a1c1e] font-bold text-sm md:text-base p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#006c49]/10 border-2 border-transparent placeholder:text-gray-400" />
                </div>
              </div>
            </div>

            {/* DRAG AND DROP ZONE */}
            <div>
              <label className="text-[10px] md:text-[11px] font-display font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                Document justificatif (PDF, JPG)
              </label>
              <div 
                className={`w-full border-4 border-dashed rounded-2xl md:rounded-[2rem] p-6 md:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                  ${dragActive ? 'border-[#006c49] bg-[#d1f4e0]/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-colors ${dragActive ? 'bg-[#006c49] text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                  <UploadCloud size={24} strokeWidth={2} className="md:w-[30px] md:h-[30px]" />
                </div>
                <p className="font-display font-black text-base md:text-lg text-[#1a1c1e]">Glisse ton fichier ici</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-1 md:mt-2">ou clique pour parcourir (Max 5MB)</p>
              </div>
            </div>

            <button className="w-full bg-[#006c49] text-white py-4 md:py-6 px-4 rounded-2xl md:rounded-[1.5rem] font-display font-black text-[11px] md:text-sm uppercase tracking-widest shadow-xl shadow-[#006c49]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 group">
              Soumettre le justificatif <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          {/* HISTORIQUE (DROITE) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-4 md:space-y-6 mt-4 lg:mt-0"
          >
            <div className="flex items-center gap-2 md:gap-3 px-2">
              <FileText size={18} className="text-gray-400 md:w-5 md:h-5" />
              <h3 className="text-xs md:text-sm font-display font-black uppercase tracking-[0.2em] text-[#1a1c1e]">Dépôts récents</h3>
            </div>

            <div className="space-y-3 md:space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    {/* Le shrink-0 est crucial ici pour que l'icône ne s'écrase pas si le nom du cours est long sur mobile */}
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center border
                      ${item.status === 'accepted' ? 'bg-[#d1f4e0] border-[#006c49]/20 text-[#006c49]' : 
                        item.status === 'pending' ? 'bg-gray-100 border-gray-200 text-gray-500' : 
                        'bg-red-50 border-red-100 text-red-500'}`}
                    >
                      {item.status === 'accepted' && <CheckCircle size={18} className="md:w-[22px] md:h-[22px]" />}
                      {item.status === 'pending' && <Clock size={18} className="md:w-[22px] md:h-[22px]" />}
                      {item.status === 'rejected' && <XCircle size={18} className="md:w-[22px] md:h-[22px]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-black text-[#1a1c1e] text-base md:text-lg tracking-tighter leading-none truncate">{item.course}</p>
                      <div className="flex items-center gap-2 mt-1 md:mt-1.5 flex-wrap">
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.date}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{item.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Justificatif;