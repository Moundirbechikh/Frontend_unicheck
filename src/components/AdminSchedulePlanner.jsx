import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, MapPin, User, X,
  AlertCircle, CheckCircle2, Layers,
  Trash2, Edit3, ChevronDown
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG GROUPES
// internal = valeur stockée en BDD et utilisée pour les requêtes
// label    = ce qui s'affiche dans l'UI
// ─────────────────────────────────────────────────────────────────────────────
const SPECIALITES_CONFIG = {
  "SITW": {
    tabLabel: "SITW",
    groupes: [
      { internal: "G1 SITW", label: "G1 SITW" },
      { internal: "G2 SITW", label: "G2 SITW" },
    ]
  },
  "1ère Ingénieur": {
    tabLabel: "1ère ING",
    groupes: [
      { internal: "G1 1ère Ingénieur", label: "G1 1ING" },
      { internal: "G2 1ère Ingénieur", label: "G2 1ING" },
      { internal: "G3 1ère Ingénieur", label: "G3 1ING" },
      { internal: "G4 1ère Ingénieur", label: "G4 1ING" },
      { internal: "G5 1ère Ingénieur", label: "G5 1ING" },
      { internal: "G6 1ère Ingénieur", label: "G6 1ING" },
      { internal: "G7 1ère Ingénieur", label: "G7 1ING" },
    ]
  }
};

const ALL_SPECIALITES = Object.keys(SPECIALITES_CONFIG);
const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
const timeSlots = ["08:30", "10:10", "13:00", "14:40", "16:20"];

const INITIAL_FORM = {
  day: "Dimanche", timeSlot: "08:30",
  coursId: "", profId: "", salleId: "", type: ""
};

// ─────────────────────────────────────────────────────────────────────────────
const AdminSchedulePlanner = () => {

  // ── Sélection groupe ───────────────────────────────────────────────────────
  const [selectedSpe,   setSelectedSpe]   = useState("SITW");
  const [selectedGroup, setSelectedGroup] = useState("G1 SITW"); // internal value
  const [activeDay,     setActiveDay]     = useState("Dimanche");

  // ── Données ────────────────────────────────────────────────────────────────
  const [schedule,  setSchedule]  = useState([]);
  const [formData,  setFormData]  = useState({ profs: [], cours: [], salles: [], assignations: {} });
  const [loading,   setLoading]   = useState(false);

  // ── Modale ─────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode,  setIsEditMode]  = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [newCourse,   setNewCourse]   = useState(INITIAL_FORM);
  const [error,       setError]       = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  }, []);

  // ── Fetch planning ─────────────────────────────────────────────────────────
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(selectedGroup);
      const res = await fetch(
        `https://backend-unicheck.onrender.com/api/admin/planning/groupe/${encoded}`,
        { headers: getAuthHeaders() }
      );
      setSchedule(res.ok ? await res.json() : []);
    } catch { setSchedule([]); }
    finally { setLoading(false); }
  }, [selectedGroup, getAuthHeaders]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  // ── Fetch form-data (une seule fois) ──────────────────────────────────────
  useEffect(() => {
    fetch("https://backend-unicheck.onrender.com/api/admin/planning/form-data", {
      headers: getAuthHeaders()
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setFormData({
          profs:       Array.isArray(data.profs)   ? data.profs  : [],
          cours:       Array.isArray(data.cours)   ? data.cours  : [],
          salles:      Array.isArray(data.salles)  ? data.salles : [],
          assignations: data.assignations || {}
        });
      })
      .catch(() => {});
  }, [getAuthHeaders]);

  // ── Changement spécialité → reset groupe ──────────────────────────────────
  const handleSpeChange = (spe) => {
    setSelectedSpe(spe);
    const firstGroup = SPECIALITES_CONFIG[spe].groupes[0].internal;
    setSelectedGroup(firstGroup);
  };

  // ── Logique smart formulaire ───────────────────────────────────────────────
  const currentAssignations = newCourse.coursId
    ? (formData.assignations[newCourse.coursId] || [])
    : [];

  const availableTypes = [...new Set(currentAssignations.map(a => a.typeSeance))];

  const availableProfsForType = newCourse.type
    ? currentAssignations.filter(a => a.typeSeance === newCourse.type)
    : currentAssignations;

  const handleCoursChange = (coursId) => {
    const assignations = formData.assignations[coursId] || [];
    const types        = [...new Set(assignations.map(a => a.typeSeance))];
    const autoType     = types.length === 1 ? types[0] : '';
    const profsForType = autoType ? assignations.filter(a => a.typeSeance === autoType) : [];
    const autoProf     = profsForType.length === 1 ? String(profsForType[0].profId) : '';

    setNewCourse(prev => ({
      ...prev,
      coursId,
      type:   autoType,
      profId: autoProf
    }));
  };

  const handleTypeChange = (type) => {
    const assignations = formData.assignations[newCourse.coursId] || [];
    const profsForType = assignations.filter(a => a.typeSeance === type);
    const autoProf     = profsForType.length === 1 ? String(profsForType[0].profId) : '';

    setNewCourse(prev => ({ ...prev, type, profId: autoProf }));
  };

  const handleProfChange = (profId) => {
    const assignations = formData.assignations[newCourse.coursId] || [];
    const assignation  = assignations.find(a => String(a.profId) === profId);
    const autoType     = assignation?.typeSeance || newCourse.type;
    setNewCourse(prev => ({ ...prev, profId, type: autoType }));
  };

  // ── Modales ────────────────────────────────────────────────────────────────
  const openAddModal = (day, time) => {
    setIsEditMode(false);
    setEditingId(null); setError(null);
    setNewCourse({ ...INITIAL_FORM, day, timeSlot: time });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setIsEditMode(true);
    setEditingId(course.id); setError(null);
    setNewCourse({
      day:      course.day      || "Dimanche",
      timeSlot: course.time     || "08:30",
      coursId:  course.moduleId ? String(course.moduleId) : "",
      profId:   course.profId   ? String(course.profId)   : "",
      salleId:  course.roomId   ? String(course.roomId)   : "",
      type:     course.type     || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    if (!newCourse.coursId || !newCourse.profId || !newCourse.salleId || !newCourse.type) {
      setError("Tous les champs sont requis."); return;
    }

    const url    = isEditMode
      ? `https://backend-unicheck.onrender.com/api/admin/planning/update/${editingId}`
      : "https://backend-unicheck.onrender.com/api/admin/planning/add";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method, headers: getAuthHeaders(),
        body: JSON.stringify({ ...newCourse, groupe: selectedGroup })
      });
      const result = await res.json();
      if (!res.ok) { setError(result.message || "Erreur"); return; }
      setIsModalOpen(false);
      fetchSchedule();
    } catch { setError("Erreur de connexion."); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    try {
      await fetch(`https://backend-unicheck.onrender.com/api/admin/planning/delete/${editingId}`, {
        method: "DELETE", headers: getAuthHeaders()
      });
      setIsModalOpen(false); fetchSchedule();
    } catch { setError("Erreur lors de la suppression."); }
  };

  // ── Label du groupe sélectionné pour l'affichage ──────────────────────────
  const selectedGroupLabel = SPECIALITES_CONFIG[selectedSpe]?.groupes
    .find(g => g.internal === selectedGroup)?.label || selectedGroup;

  const currentGroupes = SPECIALITES_CONFIG[selectedSpe]?.groupes || [];

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-24 pb-32 px-4 md:px-8 font-body relative overflow-hidden">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>

      <div className="absolute top-20 -right-20 text-[#006c49]/5 rotate-45 pointer-events-none select-none">
        <Calendar size={600} strokeWidth={1} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 w-full md:w-auto">
            <h1 className="text-5xl md:text-7xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
              Planning<span className="text-[#006c49]">.</span>
            </h1>

            {/* Niveau 1 : Spécialité */}
            <div className="flex gap-2 flex-wrap">
              {ALL_SPECIALITES.map(spe => (
                <button key={spe}
                  onClick={() => handleSpeChange(spe)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${selectedSpe === spe
                      ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/20'
                      : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                  {SPECIALITES_CONFIG[spe].tabLabel}
                </button>
              ))}
            </div>

            {/* Niveau 2 : Groupes de la spécialité sélectionnée */}
            <div className="flex gap-1.5 flex-wrap">
              {currentGroupes.map(g => (
                <button key={g.internal}
                  onClick={() => setSelectedGroup(g.internal)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                    ${selectedGroup === g.internal
                      ? 'bg-[#1a1c1e] text-white'
                      : 'bg-white/70 text-gray-500 hover:bg-white'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => openAddModal("Dimanche", "08:30")}
            className="hidden md:flex bg-[#006c49] text-white px-8 py-5 rounded-[2rem] font-display font-black
                       text-sm shadow-xl shadow-[#006c49]/20 items-center gap-3 hover:scale-105 transition-transform">
            <Plus size={20} strokeWidth={3} /> AJOUTER UN CRÉNEAU
          </button>
        </div>

        {/* ── GRILLE DESKTOP ──────────────────────────────────────────────── */}
        <div className="hidden md:block bg-white/40 backdrop-blur-md rounded-[3rem] border border-white p-6 shadow-xl overflow-x-auto">
          <div className="min-w-[1000px]">

            {/* En-têtes */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {selectedGroupLabel}
                </span>
              </div>
              {days.map(day => (
                <div key={day}
                  className="text-center font-display font-black text-[#1a1c1e] uppercase tracking-widest
                             text-xs py-4 bg-white rounded-[1.5rem] shadow-sm border border-gray-100">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-6 gap-4 mb-4">
                <div className="flex items-center justify-center">
                  <div className="bg-[#1a1c1e] text-white px-4 py-2 rounded-full font-black text-[10px]">
                    {time}
                  </div>
                </div>
                {days.map(day => {
                  const course = schedule.find(s => s.day === day && s.time === time);
                  return (
                    <div key={`${day}-${time}`} className="relative h-44 group">
                      {course ? (
                        <motion.div
                          layoutId={`course-${course.id}`}
                          onClick={() => openEditModal(course)}
                          className="absolute inset-0 bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100
                                     hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between
                                     overflow-hidden cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-black px-2 py-0.5 bg-[#f1f4f2] rounded
                                                text-[#006c49] uppercase">{course.type}</span>
                              <Edit3 size={12} className="text-gray-300 group-hover:text-[#006c49] transition-colors" />
                            </div>
                            <h4 className="font-display font-black text-[#1a1c1e] text-sm leading-tight
                                           uppercase tracking-tight line-clamp-2">{course.module}</h4>
                            <p className="text-[10px] font-bold text-[#006c49] flex items-center gap-1 mt-1">
                              <User size={10}/> {course.prof}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-dashed border-gray-100 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase">
                              <MapPin size={10} className="text-orange-400"/> {course.room}
                            </span>
                            <CheckCircle2 size={12} className="text-[#006c49]" />
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => openAddModal(day, time)}
                          className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-[2rem]
                                     hover:border-[#006c49] hover:bg-[#d1f4e0]/20 transition-all
                                     flex items-center justify-center group">
                          <Plus size={24} className="text-gray-200 group-hover:text-[#006c49] group-hover:scale-110 transition-all" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBILE ──────────────────────────────────────────────────────── */}
        <div className="md:hidden space-y-6">
          <div className="bg-white p-2 rounded-[2rem] shadow-sm flex justify-between gap-1 border border-gray-100">
            {days.map(day => (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all
                  ${activeDay === day ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400'}`}>
                <span className="text-[10px] font-black uppercase tracking-tighter">{day.substring(0,3)}</span>
                {activeDay === day && <div className="w-1 h-1 bg-[#006c49] rounded-full" />}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {timeSlots.map(time => {
              const course = schedule.find(s => s.day === activeDay && s.time === time);
              return (
                <div key={time} className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-[#1a1c1e] text-white px-3 py-1 rounded-full font-black text-[9px]">{time}</div>
                    <div className="w-0.5 h-full bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex-1 pb-4">
                    {course ? (
                      <div onClick={() => openEditModal(course)}
                        className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-white active:scale-95 transition-all cursor-pointer">
                        <h4 className="font-display font-black text-[#1a1c1e] text-lg uppercase tracking-tighter">{course.module}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#006c49] bg-[#d1f4e0] px-2.5 py-1 rounded-lg">
                            <User size={12}/> {course.prof}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg">
                            <MapPin size={12}/> {course.room}
                          </span>
                          <span className="text-[9px] font-black bg-[#f1f4f2] text-gray-500 px-2 py-1 rounded-lg uppercase">
                            {course.type}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => openAddModal(activeDay, time)}
                        className="w-full h-20 border-2 border-dashed border-gray-200 rounded-[2.5rem]
                                   flex items-center justify-center text-gray-300 font-black text-[10px] uppercase tracking-widest">
                        Libre +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer stats ────────────────────────────────────────────────── */}
        <div className="bg-[#1a1c1e] rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-[#006c49] rounded-2xl flex items-center justify-center">
              <Layers size={28} className="text-white"/>
            </div>
            <div>
              <h3 className="font-display font-black text-xl tracking-tighter">Vérificateur Intelligent</h3>
              <p className="text-gray-400 text-xs">Détection automatique des conflits d'emploi du temps.</p>
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] font-black uppercase text-[#006c49] mb-1">
                {selectedGroupLabel}
              </p>
              <p className="text-2xl font-display font-black">
                {schedule.length}
                <span className="text-gray-500">/{timeSlots.length * days.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ MODALE AJOUT / MODIF (AVEC SCROLL OPTIMISÉ) ══════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#1a1c1e]/80 backdrop-blur-md" />

            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-10 relative z-10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
              <button onClick={() => setIsModalOpen(false)}
                className="absolute top-7 right-7 p-3 bg-[#f1f4f2] text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-50">
                <X size={18} />
              </button>

              {/* Titre fixe */}
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div className="pr-10">
                  <h2 className="font-display font-black text-4xl text-[#1a1c1e] tracking-tighter leading-[0.85]">
                    {isEditMode ? "Modifier" : "Nouveau"}<br/>
                    <span className="text-[#006c49]">Créneau.</span>
                  </h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
                    {selectedGroupLabel} · {newCourse.day} {newCourse.timeSlot}
                  </p>
                </div>
                {isEditMode && (
                  <button onClick={handleDelete}
                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shrink-0">
                    <Trash2 size={18}/>
                  </button>
                )}
              </div>

              {/* Formulaire scrollable */}
              <div className="space-y-5 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">

                {/* Sélection Module */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Module
                  </label>
                  <div className="relative">
                    <select
                      value={newCourse.coursId}
                      onChange={e => handleCoursChange(e.target.value)}
                      className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-display font-black
                                 text-sm p-5 pr-10 rounded-2xl outline-none border-2 border-transparent
                                 focus:border-[#006c49]/30 cursor-pointer"
                    >
                      <option value="">Sélectionner un module...</option>
                      {formData.cours.map(c => (
                        <option key={c.id} value={c.id}>{c.libelle}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>

                {/* Type (filtré selon module) */}
                {newCourse.coursId && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Type de séance
                    </label>
                    {availableTypes.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {availableTypes.map(t => (
                          <button key={t}
                            onClick={() => handleTypeChange(t)}
                            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                              ${newCourse.type === t
                                ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/20'
                                : 'bg-[#f1f4f2] text-gray-500 hover:bg-gray-200'}`}>
                            {t}
                            <span className="ml-1.5 text-[9px] opacity-70">
                              ({currentAssignations.filter(a => a.typeSeance === t).length} prof)
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-orange-50 rounded-2xl px-4 py-3">
                        <p className="text-xs text-orange-600 font-bold">
                          Ce module n'a pas encore de professeurs assignés. Ajoutez-en depuis "Actions Rapides → Ajouter Module".
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Professeur (filtré selon type) */}
                {newCourse.coursId && newCourse.type && availableProfsForType.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Professeur {availableProfsForType.length > 1 ? `(${availableProfsForType.length} disponibles)` : ''}
                    </label>

                    {availableProfsForType.length === 1 ? (
                      <div className="flex items-center gap-3 bg-[#d1f4e0] rounded-2xl px-4 py-3">
                        <div className="w-9 h-9 bg-[#006c49] text-white rounded-xl flex items-center justify-center font-display font-black text-sm">
                          {availableProfsForType[0].profNom.split(' ').map(p => p[0]).join('').substring(0,2)}
                        </div>
                        <p className="font-display font-black text-[#006c49] text-sm">
                          {availableProfsForType[0].profNom}
                        </p>
                        <CheckCircle2 size={16} className="text-[#006c49] ml-auto"/>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={newCourse.profId}
                          onChange={e => handleProfChange(e.target.value)}
                          className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-display font-black
                                     text-sm p-5 pr-10 rounded-2xl outline-none border-2 border-transparent
                                     focus:border-[#006c49]/30 cursor-pointer"
                        >
                          <option value="">Choisir le professeur...</option>
                          {availableProfsForType.map(a => (
                            <option key={a.profId} value={a.profId}>{a.profNom}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>
                    )}
                  </div>
                )}

                {/* Salle */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Salle
                  </label>
                  <div className="relative">
                    <select
                      value={newCourse.salleId}
                      onChange={e => setNewCourse({...newCourse, salleId: e.target.value})}
                      className="w-full appearance-none bg-[#f1f4f2] text-[#1a1c1e] font-bold
                                 text-sm p-5 pr-10 rounded-2xl outline-none border-2 border-transparent
                                 focus:border-[#006c49]/30 cursor-pointer"
                    >
                      <option value="">Choisir une salle...</option>
                      {formData.salles.map(s => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                      ))}
                    </select>
                    <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                </div>

                {/* Récap créneau */}
                <div className="bg-[#f1f4f2] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Créneau :</span>
                  <span className="text-xs font-black text-[#1a1c1e]">{newCourse.day} — {newCourse.timeSlot}</span>
                  <span className="text-[10px] text-gray-300 ml-1">({selectedGroupLabel})</span>
                </div>

                {/* Erreur */}
                {error && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    className="bg-orange-50 p-5 rounded-[2rem] flex items-start gap-4 border border-orange-100">
                    <AlertCircle className="text-orange-500 shrink-0 mt-1" size={18}/>
                    <p className="text-[11px] text-orange-700 font-bold leading-relaxed">
                      <span className="uppercase">Conflit : </span>{error}
                    </p>
                  </motion.div>
                )}

              </div>

              {/* Bouton save fixe en bas */}
              <div className="pt-4 shrink-0 mt-auto bg-white">
                <button
                  onClick={handleSave}
                  disabled={!newCourse.coursId || !newCourse.profId || !newCourse.salleId || !newCourse.type}
                  className="w-full py-6 bg-[#1a1c1e] text-white rounded-[2.5rem] font-display font-black
                             text-xs uppercase tracking-[0.2em] hover:bg-[#006c49]
                             disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
                >
                  {isEditMode ? "Mettre à jour" : "Enregistrer dans le planning"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSchedulePlanner;