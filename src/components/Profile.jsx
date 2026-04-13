import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { User, Smartphone, QrCode, LogOut, KeyRound, Fingerprint, ShieldAlert, BadgeCheck } from 'lucide-react';

const Profile = () => {
  // --- EFFET 3D FRAMER MOTION POUR L'ID CARD ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body relative overflow-hidden">
      
      {/* BACKGROUND LUCIDE ICONS */}
      <div className="absolute top-20 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <Fingerprint size={400} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 -right-20 text-[#1a1c1e]/5 rotate-12 pointer-events-none select-none">
        <ShieldAlert size={350} strokeWidth={1} />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* --- COLONNE GAUCHE : ID CARD 3D --- */}
        <div className="lg:col-span-7 flex flex-col justify-center perspective-[1000px]">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.85]">
              Mon <br/><span className="text-[#006c49]">Identité.</span>
            </h1>
          </div>

          <motion.div
            style={{ x: 0, y: 0, rotateX, rotateY, z: 100 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full bg-[#1a1c1e] rounded-[3rem] p-8 md:p-10 text-white shadow-2xl shadow-[#1a1c1e]/40 border border-white/10 relative overflow-hidden cursor-crosshair transform-gpu"
          >
            {/* Hologramme décoratif */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#006c49] rounded-full blur-[80px] opacity-30 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-12">
              <div className="w-20 h-20 bg-[#006c49] rounded-3xl flex items-center justify-center border-4 border-white/10 shadow-inner">
                <User size={36} className="text-white" />
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md">
                <BadgeCheck size={16} className="text-[#d1f4e0]" />
                <span className="text-[10px] font-display font-black uppercase tracking-[0.2em]">Étudiant Actif</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nom Complet</p>
                <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter leading-none">
                  Bechikh Chouaikhia <br/> Moundir
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Spécialité</p>
                  <p className="text-xl font-display font-black text-[#d1f4e0]">SITW</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Groupe</p>
                  <p className="text-xl font-display font-black">L3 - G2</p>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl flex items-center gap-4 mt-6">
                <Smartphone size={20} className="text-[#006c49]" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Device ID (Sécurité)</p>
                  <p className="font-mono text-sm tracking-widest opacity-80">UNC-84F2-99XA</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- COLONNE DROITE : SECOURS & PARAMÈTRES --- */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-end">
          
          {/* QR Code de Secours */}
          <div className="glass-effect p-8 rounded-[2.5rem] shadow-lg border border-white relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-black text-[#1a1c1e] tracking-tighter">Pass Secours</h3>
                <p className="text-xs font-bold text-gray-400">À présenter si batterie vide</p>
              </div>
              <div className="w-12 h-12 bg-[#f1f4f2] rounded-2xl flex items-center justify-center text-[#006c49]">
                <QrCode size={24} strokeWidth={2} />
              </div>
            </div>
            
            <div className="w-full aspect-square bg-white rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-100 group-hover:border-[#006c49]/30 transition-colors">
              <div className="w-3/4 h-3/4 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UNC-MOUNDIR-84F2')] bg-cover opacity-80 mix-blend-multiply"></div>
            </div>
          </div>

          {/* Boutons d'Action */}
          <div className="space-y-3">
            <button className="w-full bg-white hover:bg-gray-50 text-[#1a1c1e] p-5 rounded-[1.5rem] flex items-center justify-between font-display font-black text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95">
              <span className="flex items-center gap-3"><KeyRound size={20} className="text-gray-400"/> Changer le mot de passe</span>
            </button>
            <button className="w-full bg-[#fff0f0] hover:bg-red-50 text-red-500 p-5 rounded-[1.5rem] flex items-center justify-between font-display font-black text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95 border border-red-100">
              <span className="flex items-center gap-3"><LogOut size={20} /> Déconnexion</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;