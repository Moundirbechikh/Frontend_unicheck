import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2, ChevronRight, Users, Clock, ScanLine } from 'lucide-react';
import StudentDetailModal from './StudentDetailModal';

const AttendanceListModal = ({ session, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const totalCapacity = 60; // Capacité totale (peut être dynamique selon la séance)

  // Appel au backend (PresenceController)
  useEffect(() => {
    const fetchPresences = async () => {
      try {
        setLoading(true);
        // 🟢 FIX CRUCIAL : Récupération du token
        const token = localStorage.getItem('token'); 
        
        const response = await fetch(`https://backend-unicheck.onrender.com/api/presences/seance/${session.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Ajout de l'autorisation
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // On inverse pour avoir les derniers scannés en haut comme dans ton RightFeed
          setStudents(data.reverse()); 
        } else {
          console.error("Erreur lors de la récupération :", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) fetchPresences();
  }, [session]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          {/* Barre de recherche et Compteur (Inspiré de ton RightFeed) */}
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
            
            {/* Nouveau compteur stylisé */}
            <div className="w-full md:w-auto bg-[#006c49] rounded-2xl px-5 py-3 flex items-center justify-between md:justify-center gap-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-white/70" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Total Présents</p>
              </div>
              <p className="font-black font-mono text-white text-xl">
                {students.length} <span className="text-white/40 font-bold text-sm">/ {totalCapacity}</span>
              </p>
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