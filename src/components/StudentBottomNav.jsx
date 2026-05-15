import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, GraduationCap, FileText, User, QrCode, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notifications from './Notifications'; 
import StudentScannerModal from './StudentScannerModal'; 

const StudentBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [studentId, setStudentId] = useState(null);
  
  // --- ÉTAT POUR LES INITIALES ---
  const [initials, setInitials] = useState('??');

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    
    if (id) setStudentId(id);

    // --- LOGIQUE D'EXTRACTION DES INITIALES ---
    if (firstName && lastName) {
      const firstI = firstName.charAt(0).toUpperCase();
      const lastI = lastName.charAt(0).toUpperCase();
      setInitials(`${firstI}${lastI}`);
    } else if (firstName) {
      setInitials(firstName.charAt(0).toUpperCase());
    }
  }, []);

  const navItems = [
    { id: 'tableau', label: 'Tableau', icon: LayoutGrid, path: '/student/tableau' },
    { id: 'cours', label: 'Cours', icon: GraduationCap, path: '/student/cours' },
    { id: 'justificatifs', label: 'Docs', icon: FileText, path: '/student/justificatifs' },
    { id: 'profil', label: 'Profil', icon: User, path: '/student/profil' },
  ];

  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2, 4);

  const handleScanSuccess = (token) => {
    console.log("✅ Présence enregistrée avec succès pour la séance :", token);
    setIsScannerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <>
      <StudentScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess}
        studentId={studentId} 
      />

      {/* TOP NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* LOGO */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/student/tableau')}>
              <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-md">
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tighter text-[#1a1c1e]">Unicheck</span>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = currentPath.includes(item.id) || (currentPath === '/student' && item.id === 'tableau');
                const Icon = item.icon;
                return (
                  <button
                    key={`desktop-${item.id}`}
                    onClick={() => navigate(item.path)}
                    className={`relative px-5 py-2.5 rounded-xl flex items-center gap-3 font-bold transition-all duration-300 ${isActive ? 'text-[#006c49]' : 'text-gray-500 hover:text-[#1a1c1e] hover:bg-gray-50'}`}
                  >
                    {isActive && (
                      <motion.div layoutId="desktop-pill" className="absolute inset-0 bg-[#d1f4e0] rounded-xl -z-10" transition={{ type: "spring", stiffness: 350, damping: 25 }} />
                    )}
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* ACTIONS DROITE */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsScannerOpen(true)}
                className="hidden md:flex items-center gap-2 bg-[#1a1c1e] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006c49] hover:scale-105 transition-all shadow-lg shadow-black/10"
              >
                <QrCode size={18} /> Scanner
              </button>

              <Notifications /> 
              
              {/* AVATAR DYNAMIQUE AVEC INITIALES */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#10b981] to-[#006c49] flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-sm tracking-wider">
                {initials}
              </div>

              <button 
                onClick={handleLogout} 
                title="Se déconnecter" 
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm"
              >
                <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform z-10" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BOTTOM NAVBAR (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-2 h-20 z-50 rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] lg:hidden flex items-center">
        <div className="flex justify-between items-center w-full max-w-md mx-auto relative px-2">
          <div className="flex gap-1 md:gap-2">
            {leftItems.map((item) => <NavIcon key={`mobile-${item.id}`} item={item} currentPath={currentPath} navigate={navigate} />)}
          </div>

          {/* BOUTON SCAN MOBILE */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 flex flex-col items-center">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="group relative w-[60px] h-[60px] bg-[#1a1c1e] text-white rounded-[1.5rem] flex items-center justify-center border-[5px] border-white shadow-xl transition-transform active:scale-95 z-20"
            >
              <div className="absolute inset-0 rounded-[1.2rem] bg-[#006c49] opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              <QrCode size={26} className="group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1c1e] mt-1.5">Scan</span>
          </div>

          <div className="w-[60px]" />

          <div className="flex gap-1 md:gap-2">
            {rightItems.map((item) => <NavIcon key={`mobile-${item.id}`} item={item} currentPath={currentPath} navigate={navigate} />)}
          </div>
        </div>
      </nav>
    </>
  );
};

const NavIcon = ({ item, currentPath, navigate }) => {
  const isActive = currentPath.includes(item.id) || (currentPath === '/student' && item.id === 'tableau');
  const Icon = item.icon;
  return (
    <button onClick={() => navigate(item.path)} className="relative flex flex-col items-center justify-center w-[60px] h-[56px] group transition-all">
      {isActive && <motion.div layoutId="mobile-pill-bg" className="absolute inset-0 bg-[#d1f4e0]/50 rounded-2xl -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
      {isActive && <motion.div layoutId="active-dot-top" className="absolute top-1.5 w-1 h-1 bg-[#006c49] rounded-full" />}
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`transition-all duration-300 z-10 ${isActive ? 'text-[#006c49] -translate-y-1' : 'text-gray-400 group-hover:text-gray-600 translate-y-1'}`} />
      <AnimatePresence>
        {isActive && (
          <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute bottom-1.5 text-[9px] font-black uppercase tracking-widest text-[#006c49]">
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default StudentBottomNav;