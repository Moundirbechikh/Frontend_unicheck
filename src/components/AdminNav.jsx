import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, GraduationCap, CalendarDays, LogOut,
         KeyRound, ChevronRight, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminInfo from './Admininfo';

const API = 'https://backend-unicheck.onrender.com';

const AdminNav = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const currentPath = location.pathname;

  const [initials,       setInitials]       = useState('AD');
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [showPassword,   setShowPassword]   = useState(false);
  const [showPwd1,       setShowPwd1]       = useState(false);
  const [showPwd2,       setShowPwd2]       = useState(false);
  const [newPassword,    setNewPassword]    = useState('');
  const [confirmPassword,setConfirmPassword]= useState('');
  const [statusMsg,      setStatusMsg]      = useState({ type: '', text: '' });
  const [isUpdating,     setIsUpdating]     = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const fullName = localStorage.getItem('userName');
    if (fullName) {
      const parts = fullName.trim().split(' ');
      if (parts.length >= 2) setInitials((parts[0][0] + parts[1][0]).toUpperCase());
      else if (parts.length === 1) setInitials(parts[0][0].toUpperCase());
    }
  }, []);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setShowPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setStatusMsg({ type: '', text: '' });
    setShowPwd1(false);
    setShowPwd2(false);
  };

  const handlePasswordSubmit = async () => {
    setStatusMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Minimum 6 caractères requis.' });
      return;
    }

    setIsUpdating(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API}/api/admin/dashboard/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Mot de passe mis à jour !' });
        setTimeout(() => closeMenu(), 1800);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Erreur serveur.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Erreur de connexion.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const navItems = [
    { id: 'tableau',     label: 'Tableau',   icon: LayoutGrid,    path: '/admin/tableau' },
    { id: 'etudiants',   label: 'Étudiants', icon: GraduationCap, path: '/admin/etudiants' },
    { id: 'professeurs', label: 'Profs',     icon: Users,         path: '/admin/professeurs' },
    { id: 'planning',    label: 'Planning',  icon: CalendarDays,  path: '/admin/planning' },
  ];

  const activeItem = navItems.find(item =>
    currentPath.includes(item.path) || (currentPath === '/admin' && item.id === 'tableau')
  ) || navItems[0];

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* LOGO */}
            <div className="flex items-center gap-3 cursor-pointer group"
                 onClick={() => navigate('/admin/tableau')}>
              <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center
                              transition-transform group-hover:rotate-12 shadow-md">
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
              </div>
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tighter text-[#1a1c1e]">
                Unicheck{' '}
                <span className="text-[#006c49] text-sm ml-1 hidden sm:inline-block">Admin</span>
              </span>
            </div>

            {/* NAVIGATION DESKTOP */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = currentPath.includes(item.path) ||
                                 (currentPath === '/admin' && item.id === 'tableau');
                const Icon = item.icon;
                return (
                  <button key={`admin-desktop-${item.id}`}
                    onClick={() => navigate(item.path)}
                    className={`relative px-5 py-2.5 rounded-xl flex items-center gap-3 font-bold
                                transition-all duration-300
                      ${isActive ? 'text-[#006c49]' : 'text-gray-500 hover:text-[#1a1c1e] hover:bg-gray-50'}`}>
                    {isActive && (
                      <motion.div layoutId="admin-desktop-pill"
                        className="absolute inset-0 bg-[#d1f4e0] rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }} />
                    )}
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* ACTIONS DROITE */}
            <div className="flex items-center gap-2 sm:gap-4">

              <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-0.5">
                <AdminInfo />
              </div>

              {/* INITIALES + MENU DROPDOWN */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => { setMenuOpen(o => !o); if (menuOpen) closeMenu(); }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                              text-white font-black text-xs border-2 shadow-md tracking-wider
                              transition-all duration-300 hover:scale-105 active:scale-95
                    ${menuOpen
                      ? 'bg-[#1a1c1e] border-[#006c49]'
                      : 'bg-gray-900 border-white hover:bg-[#006c49] hover:border-[#d1f4e0]'}`}>
                  {initials}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 top-14 w-72 bg-white rounded-[1.8rem] shadow-2xl
                                 border border-gray-100 overflow-hidden z-[200]"
                    >
                      {/* Header du menu */}
                      <div className="bg-[#1a1c1e] px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#006c49] flex items-center
                                        justify-center text-white font-black text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-white font-black text-sm font-display leading-none">
                            Administrateur
                          </p>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            Espace Admin
                          </p>
                        </div>
                      </div>

                      <div className="p-3 space-y-1.5">

                        {/* Bouton Modifier mon accès */}
                        {!showPassword && (
                          <button
                            onClick={() => setShowPassword(true)}
                            className="w-full flex items-center justify-between px-4 py-3
                                       rounded-2xl text-[#1a1c1e] hover:bg-[#f1f4f2]
                                       transition-all group"
                          >
                            <span className="flex items-center gap-3 font-black text-sm font-display">
                              <KeyRound size={16} className="text-gray-400 group-hover:text-[#006c49] transition-colors" />
                              Modifier mon accès
                            </span>
                            <ChevronRight size={14} className="text-gray-300 group-hover:text-[#006c49] transition-colors" />
                          </button>
                        )}

                        {/* Formulaire de changement de mot de passe */}
                        <AnimatePresence>
                          {showPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="space-y-2 overflow-hidden"
                            >
                              <p className="text-[9px] font-black uppercase tracking-widest
                                            text-gray-400 px-1 pt-1 font-display">
                                Nouveau mot de passe
                              </p>

                              {/* Champ 1 */}
                              <div className="relative">
                                <input
                                  type={showPwd1 ? 'text' : 'password'}
                                  placeholder="Nouveau mot de passe"
                                  value={newPassword}
                                  onChange={e => setNewPassword(e.target.value)}
                                  className="w-full bg-[#f1f4f2] rounded-xl px-4 py-2.5 pr-10
                                             text-sm font-bold text-[#1a1c1e] outline-none
                                             focus:ring-2 focus:ring-[#006c49]/20 border border-transparent
                                             focus:border-[#006c49]/30 transition-all"
                                />
                                <button type="button"
                                  onClick={() => setShowPwd1(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                             hover:text-[#006c49] transition-colors">
                                  {showPwd1 ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                              </div>

                              {/* Champ 2 */}
                              <div className="relative">
                                <input
                                  type={showPwd2 ? 'text' : 'password'}
                                  placeholder="Confirmer le mot de passe"
                                  value={confirmPassword}
                                  onChange={e => setConfirmPassword(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                                  className="w-full bg-[#f1f4f2] rounded-xl px-4 py-2.5 pr-10
                                             text-sm font-bold text-[#1a1c1e] outline-none
                                             focus:ring-2 focus:ring-[#006c49]/20 border border-transparent
                                             focus:border-[#006c49]/30 transition-all"
                                />
                                <button type="button"
                                  onClick={() => setShowPwd2(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                                             hover:text-[#006c49] transition-colors">
                                  {showPwd2 ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                              </div>

                              {/* Message statut */}
                              <AnimatePresence>
                                {statusMsg.text && (
                                  <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold
                                      ${statusMsg.type === 'error'
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-[#d1f4e0] text-[#006c49]'}`}>
                                    {statusMsg.type === 'error'
                                      ? <AlertCircle size={13}/>
                                      : <CheckCircle2 size={13}/>}
                                    {statusMsg.text}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => { setShowPassword(false); setStatusMsg({ type: '', text: '' }); setNewPassword(''); setConfirmPassword(''); }}
                                  className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-xl
                                             font-black text-[10px] uppercase tracking-widest
                                             hover:bg-gray-200 transition-all font-display">
                                  Annuler
                                </button>
                                <button
                                  onClick={handlePasswordSubmit}
                                  disabled={isUpdating || !newPassword || !confirmPassword}
                                  className="flex-1 py-2.5 bg-[#1a1c1e] text-white rounded-xl
                                             font-black text-[10px] uppercase tracking-widest
                                             hover:bg-[#006c49] disabled:opacity-40 transition-all
                                             font-display flex items-center justify-center gap-1.5">
                                  {isUpdating
                                    ? <><Loader2 size={12} className="animate-spin"/> Maj...</>
                                    : 'Confirmer'}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Séparateur */}
                        <div className="h-px bg-gray-100 mx-1" />

                        {/* Déconnexion */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl
                                     text-red-500 hover:bg-red-50 transition-all font-black
                                     text-sm font-display">
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BOUTON DÉCONNEXION (gardé pour desktop quick access) */}
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10
                           rounded-xl bg-white border border-gray-100 text-gray-400
                           hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm">
                <LogOut size={18} strokeWidth={2.5}
                        className="group-hover:-translate-x-0.5 transition-transform z-10" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* NAVIGATION MOBILE */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 pt-2 pb-5
                      z-50 rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.04)] lg:hidden">
        <div className="max-w-md mx-auto mb-1 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={activeItem.id}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
              className="bg-[#d1f4e0] text-[#006c49] px-3 py-0.5 rounded-full text-[9px]
                         font-black uppercase tracking-widest border border-[#006c49]/10">
              {activeItem.label}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center max-w-md mx-auto relative px-2">
          {navItems.map((item) => {
            const isActive = currentPath.includes(item.path) ||
                             (currentPath === '/admin' && item.id === 'tableau');
            const Icon = item.icon;
            return (
              <button key={`admin-mobile-${item.id}`}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-[65px] h-[50px] group transition-all">
                {isActive && (
                  <motion.div layoutId="admin-mobile-pill"
                    className="absolute inset-0 bg-[#d1f4e0]/50 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'text-[#006c49] scale-110 -translate-y-0.5'
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                {isActive && (
                  <motion.div layoutId="admin-active-dot"
                    className="w-1 h-1 bg-[#006c49] rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default AdminNav;