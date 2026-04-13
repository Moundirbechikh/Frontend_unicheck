import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, GraduationCap, ArrowRight, Download } from 'lucide-react';
import StudentDetailModal from './StudentDetailModal';

// Seuil en dessous duquel un étudiant est considéré exclu
const EXCLUSION_THRESHOLD = 70;

const exportToCSV = (students) => {
  const headers = ['ID', 'Nom', 'Spécialité', 'Groupe', 'Email', 'Présence (%)', 'Statut', 'Device ID'];
  const rows = students.map(s => [
    s.id, s.name, s.specialty, s.group, s.email, s.attendance, s.status, s.deviceId
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `etudiants_unicheck_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminStudentManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Tous");
  const [showExcluded, setShowExcluded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students, setStudents] = useState([
    { id: "202601", name: "Bacha Sami",          specialty: "SITW",    group: "G1",       email: "sami.b@univ.dz",      attendance: 95, status: "active",  deviceId: "UNC-11A2-88XB" },
    { id: "202602", name: "Chouaikhia Moundir",  specialty: "SITW",    group: "G1",       email: "moundir.c@univ.dz",   attendance: 98, status: "active",  deviceId: "UNC-84F2-99XA" },
    { id: "202603", name: "Lamine Amine",         specialty: "SITW",    group: "G2",       email: "amine.l@univ.dz",     attendance: 65, status: "warning", deviceId: "UNC-00Z9-12PC" },
    { id: "202604", name: "Merabet Sara",         specialty: "SITW",    group: "G2",       email: "sara.m@univ.dz",      attendance: 88, status: "active",  deviceId: "UNC-33B1-44YD" },
    { id: "202605", name: "Hamdi Yacine",         specialty: "SITW",    group: "G1",       email: "yacine.h@univ.dz",    attendance: 42, status: "warning", deviceId: "UNC-77C3-55ZE" },
    { id: "202606", name: "Bensalem Amira",       specialty: "Master GL", group: "Master GL", email: "amira.b@univ.dz",  attendance: 91, status: "active",  deviceId: "UNC-22D4-66WF" },
    { id: "202607", name: "Ouali Karim",          specialty: "Master GL", group: "Master GL", email: "karim.o@univ.dz",  attendance: 55, status: "warning", deviceId: "UNC-99E5-77VG" },
    { id: "202608", name: "Meziane Sofiane",      specialty: "SITW",    group: "G2",       email: "sofiane.m@univ.dz",   attendance: 78, status: "active",  deviceId: "UNC-44F6-88UH" },
  ]);

  const groups = ["Tous", "G1", "G2", "Master GL"];

  const excludedStudents = students.filter(s => s.attendance < EXCLUSION_THRESHOLD);

  const filteredStudents = students.filter(s => {
    const matchGroup   = selectedGroup === "Tous" || s.group === selectedGroup;
    const matchSearch  = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchExcluded = !showExcluded || s.attendance < EXCLUSION_THRESHOLD;
    return matchGroup && matchSearch && matchExcluded;
  });

  const handleUpdateStudent = (updatedStudent) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setSelectedStudent(null);
  };

  // Liste à exporter : si filtre "exclus" actif → seulement les exclus, sinon la liste filtrée
  const listToExport = showExcluded ? excludedStudents : filteredStudents;

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">
      
      <div className="absolute -top-24 -left-24 text-[#006c49]/5 pointer-events-none rotate-12 select-none">
        <GraduationCap size={500} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Étudiants<span className="text-[#006c49]">.</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] ml-2">Gestion Unicheck 2026</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton export */}
            <button
              onClick={() => exportToCSV(listToExport)}
              title="Exporter la liste en CSV"
              className="bg-white text-[#1a1c1e] border border-gray-200 px-6 py-5 rounded-[2rem] font-display font-black text-sm shadow-sm flex items-center gap-3 hover:bg-[#f1f4f2] hover:border-[#006c49]/30 transition-all hover:-translate-y-1"
            >
              <Download size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline uppercase text-[10px] tracking-widest">
                Exporter{showExcluded ? ' exclus' : ''}
              </span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#1a1c1e] text-white px-8 py-5 rounded-[2rem] font-display font-black text-sm shadow-2xl flex items-center gap-3 hover:bg-[#006c49] transition-all hover:-translate-y-1"
            >
              <UserPlus size={20} strokeWidth={3} /> INSCRIRE
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group min-w-[250px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#006c49] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-[2rem] py-5 pl-16 pr-6 font-bold text-[#1a1c1e] shadow-sm focus:ring-4 focus:ring-[#006c49]/10 transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <button
                key={group}
                onClick={() => { setSelectedGroup(group); setShowExcluded(false); }}
                className={`px-5 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedGroup === group && !showExcluded
                    ? 'bg-[#006c49] text-white shadow-lg'
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                {group}
              </button>
            ))}

            {/* Filtre Exclus */}
            <button
              onClick={() => { setShowExcluded(e => !e); setSelectedGroup("Tous"); }}
              className={`px-5 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                showExcluded
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-orange-500 border border-orange-200 hover:bg-orange-50'
              }`}
            >
              Exclus
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                showExcluded ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
              }`}>
                {excludedStudents.length}
              </span>
            </button>
          </div>
        </div>

        {/* Bandeau info si filtre exclus actif */}
        <AnimatePresence>
          {showExcluded && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-orange-50 border border-orange-200 rounded-[1.5rem] px-6 py-4 flex items-center justify-between"
            >
              <p className="text-orange-700 font-black text-sm">
                {excludedStudents.length} étudiant{excludedStudents.length > 1 ? 's' : ''} sous le seuil de {EXCLUSION_THRESHOLD}% de présence
              </p>
              <button
                onClick={() => exportToCSV(excludedStudents)}
                className="flex items-center gap-2 text-orange-600 font-black text-[11px] uppercase tracking-wider hover:text-orange-800 transition-colors"
              >
                <Download size={14} /> Exporter cette liste
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID ÉTUDIANTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedStudent(student)}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-transparent hover:border-[#006c49]/20 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#f1f4f2] rounded-full group-hover:bg-[#d1f4e0]/50 transition-colors pointer-events-none" />

                <div className="absolute bottom-6 right-6 w-10 h-10 bg-[#f1f4f2] rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#1a1c1e] group-hover:text-white transition-all z-20">
                  <ArrowRight size={16} />
                </div>

                <div className="relative z-10 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-[#1a1c1e] rounded-[1.2rem] flex items-center justify-center text-white font-display font-black text-xl shadow-md">
                      {student.name.charAt(0)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      student.attendance < EXCLUSION_THRESHOLD
                        ? 'bg-red-100 text-red-600'
                        : student.status === 'active'
                          ? 'bg-[#d1f4e0] text-[#006c49]'
                          : 'bg-orange-100 text-orange-600'
                    }`}>
                      {student.attendance < EXCLUSION_THRESHOLD ? 'exclu' : student.status}
                    </div>
                  </div>

                  <div className="pr-12">
                    <h3 className="text-xl font-display font-black text-[#1a1c1e] leading-none uppercase tracking-tighter truncate">
                      {student.name}
                    </h3>
                    <p className="text-gray-400 font-bold text-xs mt-1">{student.specialty} - {student.group} • {student.id}</p>
                  </div>

                  <div className="pt-2 pr-12">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase">Présence</span>
                      <span className={`text-xs font-black ${
                        student.attendance < EXCLUSION_THRESHOLD ? 'text-red-500' : 'text-[#006c49]'
                      }`}>
                        {student.attendance}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f1f4f2] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          student.attendance < EXCLUSION_THRESHOLD ? 'bg-red-500' : 'bg-[#006c49]'
                        }`}
                        style={{ width: `${student.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onSave={handleUpdateStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentManager;