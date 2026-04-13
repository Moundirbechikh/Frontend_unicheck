import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  UserRoundSearch, // Background Icon
  ShieldCheck,     // Background Icon
  ArrowUpDown,
  Filter
} from 'lucide-react';

const ProfStudentsList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    { id: 1, name: "Bacha Sami", class: "G1 SITW", absences: 3, initials: "BS", color: "bg-red-100 text-red-600" },
    { id: 2, name: "Chouaikhia Moundir", class: "G2 SITW", absences: 0, initials: "CM", color: "bg-[#d1f4e0] text-[#006c49]" },
    { id: 3, name: "Bernard Marc", class: "G1 SITW", absences: 1, initials: "MB", color: "bg-orange-100 text-orange-600" },
    { id: 4, name: "Lemoine Eva", class: "G3 SITW", absences: 0, initials: "LE", color: "bg-[#d1f4e0] text-[#006c49]" },
    { id: 5, name: "Petit Robert", class: "G1 SITW", absences: 2, initials: "PR", color: "bg-orange-100 text-orange-600" },
  ];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (absences) => {
    if (absences >= 3) return <AlertCircle className="text-red-500" size={24} strokeWidth={2.5} />;
    if (absences > 0) return <AlertTriangle className="text-orange-400" size={24} strokeWidth={2.5} />;
    return <CheckCircle2 className="text-[#006c49]" size={24} strokeWidth={2.5} />;
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">
      
      {/* --- STYLE INJECTÉ --- */}
      <style>
        {`
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); }
        `}
      </style>

      {/* --- DECORATION ARRIÈRE-PLAN --- */}
      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <UserRoundSearch size={450} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <ShieldCheck size={400} strokeWidth={1} />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-10 relative z-10"
      >
        
        {/* --- HEADER : TITRE NOIR & VERT --- */}
        <motion.div variants={item} className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
             <span className="w-2 h-2 rounded-full bg-[#006c49]"></span>
             <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">Annuaire Étudiants</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.85]">
            Mes <br /> <span className="text-[#006c49]">Étudiants.</span>
          </h1>
        </motion.div>

        {/* --- RECHERCHE & FILTRES --- */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006c49] transition-colors" size={22} />
            <input 
              type="text"
              placeholder="Rechercher un étudiant..."
              className="w-full bg-white border-none rounded-[2rem] py-6 pl-16 pr-6 shadow-sm focus:ring-4 focus:ring-[#006c49]/10 font-display font-bold text-[#1a1c1e] text-lg transition-all placeholder:text-gray-300"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-4 flex gap-3">
            <button className="flex-1 bg-white rounded-[1.5rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-[#006c49] transition-colors shadow-sm">
              <ArrowUpDown size={18} /> Trier
            </button>
            <button className="flex-1 bg-[#1a1c1e] rounded-[1.5rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#006c49] transition-all shadow-lg shadow-black/10">
              <Filter size={18} /> G1
            </button>
          </div>
        </motion.div>

        {/* --- LISTE DES ÉTUDIANTS --- */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode='popLayout'>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  layout
                  variants={item}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -5 }}
                  className="bg-white p-5 md:p-6 rounded-[2.5rem] shadow-sm border border-white flex items-center justify-between group hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-5">
                    {/* Avatar avec initiales */}
                    <div className={`w-16 h-16 ${student.color} rounded-[1.5rem] flex items-center justify-center font-display font-black text-xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform`}>
                      {student.initials}
                    </div>
                    
                    <div>
                      <h3 className="font-display font-black text-[#1a1c1e] text-xl tracking-tighter leading-tight">{student.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                          <Users size={12} className="text-[#006c49]"/> {student.class}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${student.absences > 2 ? "text-red-500" : "text-gray-400"}`}>
                          {student.absences} Absences
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statut & Action */}
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                       {getStatusIcon(student.absences)}
                    </div>
                    <button className="w-12 h-12 bg-[#f1f4f2] text-gray-400 rounded-2xl flex items-center justify-center hover:bg-[#1a1c1e] hover:text-white transition-all">
                      <ChevronDown size={20} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/40 rounded-[3rem] border border-dashed border-gray-300"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4 shadow-sm">
                  <Search size={32} />
                </div>
                <p className="font-display font-black text-gray-400 uppercase tracking-widest text-sm">Aucun étudiant trouvé</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- MINI STATS DE BAS DE PAGE (Optionnel) --- */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
           <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white text-center">
              <p className="text-[10px] font-black uppercase text-gray-400">Total</p>
              <p className="text-2xl font-display font-black text-[#1a1c1e]">{students.length}</p>
           </div>
           <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white text-center">
              <p className="text-[10px] font-black uppercase text-gray-400">À Risque</p>
              <p className="text-2xl font-display font-black text-red-500">01</p>
           </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ProfStudentsList;