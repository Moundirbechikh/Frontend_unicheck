import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Star, Clock, Filter, 
  Plus, Trophy, BookOpen, LayoutGrid 
} from 'lucide-react';
import ProfCard from './ProfCard';

const AdminProfManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterElite, setFilterElite] = useState(false);

  const [profs] = useState([
    { 
      id: "PR-001", 
      name: "Dr. Kadi Ahmed", 
      email: "a.kadi@univ.dz",
      totalAttendance: 98, 
      weeklyHours: 12,
      status: "Excellent",
      courses: [
        { name: "Systèmes RAG", attendance: 100 },
        { name: "IA Avancée", attendance: 96 }
      ]
    },
    { 
      id: "PR-002", 
      name: "Mme. Belhadj Sarah", 
      email: "s.belhadj@univ.dz",
      totalAttendance: 85, 
      weeklyHours: 18,
      status: "Stable",
      courses: [
        { name: "UI/UX Design", attendance: 88 },
        { name: "Framer Motion", attendance: 82 }
      ]
    },
    { 
      id: "PR-003", 
      name: "Mr. Amrani Omar", 
      email: "o.amrani@univ.dz",
      totalAttendance: 92, 
      weeklyHours: 15,
      status: "Excellent",
      courses: [
        { name: "React Native", attendance: 94 },
        { name: "Node.js", attendance: 90 }
      ]
    }
  ]);

  // Logique de filtrage
  const filteredProfs = profs
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => filterElite ? p.totalAttendance >= 90 : true)
    .sort((a, b) => filterElite ? b.totalAttendance - a.totalAttendance : 0);

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">
      
      {/* BACKGROUND DECO */}
      <div className="absolute top-10 right-10 text-[#006c49]/5 pointer-events-none -rotate-12 select-none">
        <LayoutGrid size={600} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Enseignants<span className="text-[#006c49]">.</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] ml-2">Faculté des Sciences • 2026</p>
          </div>

          <button className="bg-[#1a1c1e] text-white px-8 py-5 rounded-[2rem] font-display font-black text-sm shadow-2xl flex items-center gap-3 hover:bg-[#006c49] transition-all hover:-translate-y-1">
            <Plus size={20} strokeWidth={3} /> AJOUTER UN PROF
          </button>
        </div>

        {/* TOOLS BAR (Filtres sans scroll) */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group min-w-[250px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006c49] transition-colors" size={20} />
            <input 
              type="text" placeholder="Chercher un professeur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 font-bold text-[#1a1c1e] shadow-sm focus:ring-4 focus:ring-[#006c49]/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterElite(!filterElite)}
              className={`px-6 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                filterElite ? 'bg-[#006c49] text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Trophy size={14} /> {filterElite ? 'Top Performers Actif' : 'Filtrer par Score Elite'}
            </button>
          </div>
        </div>

        {/* STATS RAPIDES (Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Profs', val: profs.length, icon: Users, col: 'text-[#1a1c1e]' },
            { label: 'Moy. Présence', val: '92%', icon: Star, col: 'text-[#006c49]' },
            { label: 'Heures / Sem', val: '45h', icon: Clock, col: 'text-blue-500' },
            { label: 'Cours Actifs', val: '08', icon: BookOpen, col: 'text-orange-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white flex flex-col items-center text-center">
              <stat.icon className={`${stat.col} mb-2`} size={20} />
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</p>
              <p className="text-2xl font-display font-black text-[#1a1c1e]">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* GRID DES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredProfs.map((prof, index) => (
              <ProfCard key={prof.id} prof={prof} index={index} />
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AdminProfManager;