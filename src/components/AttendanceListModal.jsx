import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2, ChevronRight, Users, Clock, ScanLine, Download } from 'lucide-react';
import StudentDetailModal from './StudentDetailModal';

const AttendanceListModal = ({ session, onClose }) => {
  const [students, setStudents] = useState([]);
  const [totalCapacity, setTotalCapacity] = useState(0); // 🟢 Remplacement du 60 en dur
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Appels au backend (Présences + Capacité)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); 
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        // 🟢 Utilisation de Promise.all pour faire les 2 requêtes en même temps (gain de vitesse)
        const [presencesRes, capaciteRes] = await Promise.all([
          fetch(`https://backend-unicheck.onrender.com/api/presences/seance/${session.id}`, { method: 'GET', headers }),
          fetch(`https://backend-unicheck.onrender.com/api/seances/${session.id}/capacite`, { method: 'GET', headers })
        ]);

        // Traitement des présences
        if (presencesRes.ok) {
          const presencesData = await presencesRes.json();
          setStudents(presencesData.reverse()); 
        } else {
          console.error("Erreur présences :", presencesRes.status);
        }

        // Traitement de la capacité
        if (capaciteRes.ok) {
          const capaciteData = await capaciteRes.json();
          setTotalCapacity(capaciteData.totalEtudiants || 0);
        } else {
          console.error("Erreur capacité :", capaciteRes.status);
        }

      } catch (error) {
        console.error("Erreur réseau :", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) fetchData();
  }, [session]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🟢 Fonction pour exporter en CSV (lisible par Excel)
  const exportToCSV = () => {
    if (students.length === 0) return;

    // Ajout du BOM (\uFEFF) pour forcer Excel à lire correctement les accents (utf-8)
    const csvContent = '\uFEFF' + 
      ['Nom,Heure de scan'] // En-têtes
      .concat(students.map(s => `"${s.name}","${s.time}"`)) // Données
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    // Nom du fichier personnalisé : "Presences_Module_Date.csv"
    link.setAttribute('download', `Presences_${session?.module?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-70 bg-[#f1f4f2] flex flex-col p-4 md:p-8 overflow-hidden"
      >
        {/* En-tête */}
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-6 mt-4 md:mt-0 shrink-0">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1a1c1e] tracking-tighter leading-none mb-2">
              Présences<span className="text-[#006c49]">.</span>
            </h2>
            <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
              <span className="flex items-center gap-1"><Users size={14}/> {session?.module}</span>
              <span>•</span>
              <span className="flex items-center gap-1">{session?.group}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#1a1c1e] hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="max-w-4xl w-full mx-auto flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col min-h-0 overflow-hidden">
          
          {/* Barre de recherche, Export et Compteur */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 shrink-0">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un étudiant..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 font-bold text-sm focus:ring-2 focus:ring-[#006c49]/20 outline-none transition-all"
              />
            </div>
            
            <div className="flex w-full md:w-auto gap-3">
              {/* 🟢 Nouveau bouton d'export */}
              <button 
                onClick={exportToCSV}
                disabled={students.length === 0}
                className="flex-1 md:flex-none bg-white border border-gray-200 text-[#1a1c1e] rounded-2xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                <span className="hidden sm:inline">Exporter CSV</span>
              </button>

              {/* Compteur stylisé */}
              <div className="flex-1 md:flex-none bg-[#006c49] rounded-2xl px-5 py-3 flex items-center justify-between md:justify-center gap-6 shadow-sm">
                <div className="flex items-center gap-2 hidden sm:flex">
                  <CheckCircle2 size={16} className="text-white/70" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Total Présents</p>
                </div>
                <p className="font-black font-mono text-white text-xl">
                  {students.length} <span className="text-white/40 font-bold text-sm">/ {totalCapacity}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Liste des étudiants */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006c49]"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Chargement...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredStudents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 py-20"
                  >
                    <ScanLine size={40} strokeWidth={1.5} className="opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Aucun étudiant trouvé</p>
                  </motion.div>
                ) : (
                  filteredStudents.map((student) => (
                    <motion.div
                      layout
                      key={student.id}
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      onClick={() => setSelectedStudent(student)}
                      className="bg-white border border-gray-100 hover:border-[#006c49]/30 hover:shadow-md rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#f1f4f2] text-[#1a1c1e] rounded-xl flex items-center justify-center font-black text-lg group-hover:bg-[#006c49] group-hover:text-white transition-colors shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[#1a1c1e] text-base truncate">{student.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <Clock size={10} /> {student.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#006c49]/10 group-hover:text-[#006c49] transition-colors shrink-0">
                        <ChevronRight size={20} />
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal Détail Étudiant */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailModal 
            student={selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AttendanceListModal;