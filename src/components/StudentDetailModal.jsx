import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Smartphone, BadgeCheck, X, Save, AlertTriangle, Fingerprint } from 'lucide-react';

const StudentDetailModal = ({ student, onClose, onSave }) => {
  const [editedStudent, setEditedStudent] = useState(student);

  // --- EFFET 3D ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0); y.set(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#1a1c1e]/90 backdrop-blur-sm" />
      
      {/* Conteneur strict : Hauteur maximale fixée, pas de scroll bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="bg-[#f1f4f2] w-full max-w-6xl h-[95dvh] md:h-[85dvh] rounded-[2rem] md:rounded-[3rem] relative z-10 shadow-2xl flex flex-col overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1a1c1e] hover:bg-red-500 hover:text-white transition-all z-50 shadow-md">
          <X size={20} />
        </button>

        {/* Layout : Colonne sur mobile, Ligne sur Desktop, prenant 100% de la hauteur dispo */}
        <div className="flex-1 flex flex-col lg:flex-row w-full h-full p-4 md:p-8 gap-4 md:gap-8 min-h-0">
          
          {/* --- MOITIÉ HAUTE/GAUCHE : ID CARD 3D --- */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0 perspective-[1000px]">
            <motion.div
              style={{ x: 0, y: 0, rotateX, rotateY, z: 100 }}
              onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
              className="w-full max-w-md bg-[#1a1c1e] rounded-[2rem] p-5 md:p-8 text-white shadow-2xl shadow-[#1a1c1e]/40 border border-white/10 relative overflow-hidden cursor-crosshair transform-gpu flex flex-col justify-between"
            >
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#006c49] rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 opacity-10 pointer-events-none"><Fingerprint size={80} /></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-[#006c49] rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-inner">
                  <span className="font-display font-black text-2xl text-white">{editedStudent.name.charAt(0)}</span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-md">
                  <BadgeCheck size={14} className={editedStudent.status === 'active' ? "text-[#d1f4e0]" : "text-orange-400"} />
                  <span className="text-[9px] font-display font-black uppercase tracking-[0.2em]">
                    {editedStudent.status === 'active' ? 'Actif' : 'Alerte'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nom Complet</p>
                  <h2 className="text-2xl md:text-3xl font-display font-black tracking-tighter leading-none line-clamp-2">
                    {editedStudent.name || "---"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Spécialité</p>
                    <p className="text-lg md:text-xl font-display font-black text-[#d1f4e0] truncate">{editedStudent.specialty || "---"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Groupe</p>
                    <p className="text-lg md:text-xl font-display font-black truncate">{editedStudent.group || "---"}</p>
                  </div>
                </div>

                <div className="bg-black/30 p-3 rounded-xl flex items-center gap-3 mt-2 border border-white/5">
                  <Smartphone size={16} className="text-[#006c49] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Device ID</p>
                    <p className="font-mono text-xs tracking-widest opacity-80 text-[#d1f4e0] truncate">{editedStudent.deviceId || "AUCUN"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- MOITIÉ BASSE/DROITE : ÉDITEUR COMPACT --- */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <div className="bg-white rounded-[2rem] p-5 md:p-8 h-full flex flex-col justify-between shadow-sm border border-gray-100">
              
              <div className="space-y-3 md:space-y-5 flex-1 overflow-y-auto no-scrollbar">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Nom Complet</label>
                  <input 
                    type="text" name="name" value={editedStudent.name} onChange={handleChange}
                    className="w-full bg-[#f1f4f2] border-none rounded-xl py-3 px-4 font-bold text-sm focus:ring-2 focus:ring-[#006c49]/20 outline-none transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Spécialité</label>
                    <input 
                      type="text" name="specialty" value={editedStudent.specialty} onChange={handleChange}
                      className="w-full bg-[#f1f4f2] border-none rounded-xl py-3 px-4 font-bold text-sm focus:ring-2 focus:ring-[#006c49]/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Groupe</label>
                    <input 
                      type="text" name="group" value={editedStudent.group} onChange={handleChange}
                      className="w-full bg-[#f1f4f2] border-none rounded-xl py-3 px-4 font-bold text-sm focus:ring-2 focus:ring-[#006c49]/20 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-3 border-t border-dashed border-gray-200">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400 ml-2 flex items-center gap-1.5">
                    <AlertTriangle size={10} /> Device ID (Sécurité)
                  </label>
                  <input 
                    type="text" name="deviceId" value={editedStudent.deviceId} onChange={handleChange}
                    className="w-full bg-red-50 text-red-700 border border-red-100 rounded-xl py-3 px-4 font-mono font-bold text-sm focus:ring-2 focus:ring-red-200 outline-none uppercase tracking-widest" 
                  />
                </div>
              </div>

              <button 
                onClick={() => onSave(editedStudent)}
                className="w-full mt-4 py-4 bg-[#1a1c1e] text-white rounded-xl font-display font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#006c49] transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetailModal;