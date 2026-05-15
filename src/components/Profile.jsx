import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { User, Mail, QrCode, LogOut, KeyRound, Fingerprint, BadgeCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LE MOT DE PASSE ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // --- LOGIQUE DE DÉCONNEXION ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPrenom');
    localStorage.removeItem('userNom');
    localStorage.clear();
    navigate('/', { replace: true });
  };

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      navigate('/');
      return;
    }

    fetch(`https://backend-unicheck.onrender.com/api/etudiants/me/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => console.error("Erreur profil:", err));
  }, [navigate]);

  // --- LOGIQUE DE MISE À JOUR DU MOT DE PASSE ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setIsUpdating(true);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://backend-unicheck.onrender.com/api/etudiants/${userId}/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: passwords.newPassword })
      });

      if (response.ok) {
        setStatusMsg({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswords({ newPassword: '', confirmPassword: '' });
          setStatusMsg({ type: '', text: '' });
        }, 2000); // Ferme la modale après 2 secondes
      } else {
        setStatusMsg({ type: 'error', text: 'Erreur lors de la mise à jour.' });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // --- EFFET 3D FRAMER MOTION ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display font-black text-2xl uppercase tracking-widest text-[#006c49]">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body relative overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute top-20 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <Fingerprint size={400} strokeWidth={1} />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* COLONNE GAUCHE : CARTE ID */}
        <div className="lg:col-span-7 flex flex-col justify-center perspective-[1000px]">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.85]">
              Mon <br/><span className="text-[#006c49]">Identité.</span>
            </h1>
          </div>

          <motion.div
            style={{ rotateX, rotateY, z: 100 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="w-full bg-[#1a1c1e] rounded-[3rem] p-8 md:p-10 text-white shadow-2xl shadow-[#1a1c1e]/40 border border-white/10 relative overflow-hidden cursor-crosshair transform-gpu"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#006c49] rounded-full blur-[80px] opacity-30 pointer-events-none" />

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
                <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter leading-tight uppercase">
                  {profile.nom} <br/> {profile.prenom}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Spécialité</p>
                  <p className="text-xl font-display font-black text-[#d1f4e0]">{profile.specialite || 'SITW'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Groupe</p>
                  <p className="text-xl font-display font-black">{profile.groupe || 'Master'}</p>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl flex items-center gap-4 mt-6 border border-white/5">
                <Mail size={20} className="text-[#006c49]" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adresse Mail</p>
                  <p className="font-display font-bold text-sm tracking-wide opacity-90">{profile.email || 'etudiant@univ.dz'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* COLONNE DROITE : ACTIONS */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-end">
          
          <div className="glass-effect p-8 rounded-[2.5rem] shadow-lg border border-white relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-black text-[#1a1c1e] tracking-tighter">Pass Secours</h3>
                <p className="text-xs font-bold text-gray-400">QR Code d'identification</p>
              </div>
              <div className="w-12 h-12 bg-[#f1f4f2] rounded-2xl flex items-center justify-center text-[#006c49]">
                <QrCode size={24} strokeWidth={2} />
              </div>
            </div>
            
            <div className="w-full aspect-square bg-white rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-100">
              <div 
                className="w-3/4 h-3/4 bg-cover opacity-80 mix-blend-multiply"
                style={{ backgroundImage: `url(https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STUDENT-${profile.id})` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full bg-white hover:bg-gray-50 text-[#1a1c1e] p-5 rounded-[1.5rem] flex items-center justify-between font-display font-black text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95"
            >
              <span className="flex items-center gap-3"><KeyRound size={20} className="text-gray-400"/> Modifier mon accès</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full bg-[#fff0f0] hover:bg-red-50 text-red-500 p-5 rounded-[1.5rem] flex items-center justify-between font-display font-black text-sm uppercase tracking-widest shadow-sm transition-all active:scale-95 border border-red-100"
            >
              <span className="flex items-center gap-3"><LogOut size={20} /> Déconnexion</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODALE CHANGEMENT MOT DE PASSE */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="absolute inset-0 bg-[#1a1c1e]/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: "50%", opacity: 0, scale: 0.9 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: "50%", opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-[#1a1c1e] transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-display font-black text-3xl text-[#1a1c1e] tracking-tighter mb-2">Sécurité.</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Nouveau mot de passe</p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <input 
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full bg-[#f1f4f2] border-none rounded-2xl py-4 px-6 font-bold text-sm focus:ring-2 focus:ring-[#006c49]/20 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <input 
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full bg-[#f1f4f2] border-none rounded-2xl py-4 px-6 font-bold text-sm focus:ring-2 focus:ring-[#006c49]/20 outline-none transition-all"
                    required
                  />
                </div>

                {/* MESSAGES D'ERREUR OU SUCCÈS */}
                {statusMsg.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 mt-4 ${
                      statusMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#d1f4e0] text-[#006c49]'
                    }`}
                  >
                    {statusMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <p className="text-xs font-bold">{statusMsg.text}</p>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full mt-6 py-5 bg-[#1a1c1e] text-white rounded-[2rem] font-display font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006c49] disabled:opacity-50 transition-all shadow-xl shadow-black/10"
                >
                  {isUpdating ? 'Mise à jour...' : 'Confirmer'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .glass-effect { background: rgba(255,255,255,0.6); backdrop-filter: blur(15px); }
      `}</style>
    </div>
  );
};

export default Profile;