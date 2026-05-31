import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, FileText, PlayCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notifications from './Notifications'; 
import ProfInfo from './Profinfo'; // Remplacement de Info par ProfInfo

const ProfNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // --- ÉTAT POUR LES INITIALES DYNAMIQUES ---
  const [initials, setInitials] = useState('PR');

  useEffect(() => {
    // Récupération du prénom et du nom depuis le localStorage
    const prenom = localStorage.getItem('userLastName') || "";
    const nom = localStorage.getItem('userFirstName') || "";

    if (prenom || nom) {
      // Extraction de la première lettre de chaque chaîne
      const pInitial = prenom ? prenom[0] : '';
      const nInitial = nom ? nom[0] : '';
      setInitials((pInitial + nInitial).toUpperCase());
    }
  }, []);

  const navItems = [
    { id: 'tableau',      label: 'Tableau', icon: LayoutGrid, shadow: true, path: '/prof/tableau' },
    { id: 'cours',        label: 'Cours',   icon: PlayCircle, path: '/prof/cours' },
    { id: 'etudiants',    label: 'Élèves',  icon: Users,      path: '/prof/etudiants' },
    { id: 'justificatifs', label: 'Justifs', icon: FileText,   path: '/prof/justificatifs' },
  ];

  const handleLogout = () => {
    // 1. Supprimer les données de session de manière chirurgicale
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPrenom');
    localStorage.removeItem('userNom');
  
    // 2. Nettoyage Total
    localStorage.clear();
  
    // 3. Redirection vers la page d'accueil
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* TOP NAVBAR (Desktop) */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* LOGO */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate('/prof/tableau')}
            >
              <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-md">
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tighter text-[#1a1c1e]"
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                Unicheck <span className="text-[#006c49] text-sm ml-1 hidden sm:inline-block">Prof</span>
              </span>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = currentPath.includes(item.path) || (currentPath === '/prof' && item.id === 'tableau');
                const Icon = item.icon;
                return (
                  <button
                    key={`prof-desktop-${item.id}`}
                    onClick={() => navigate(item.path)}
                    className={`relative px-5 py-2.5 rounded-xl flex items-center gap-3 font-bold transition-all duration-300 ${
                      isActive ? 'text-[#006c49]' : 'text-gray-500 hover:text-[#1a1c1e] hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="prof-desktop-pill"
                        className="absolute inset-0 bg-[#d1f4e0] rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* ACTIONS DROITE */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Groupe Notifications + ProfInfo côte à côte */}
              <div className="flex items-center gap-0.5 bg-gray-50 rounded-xl border border-gray-100 p-0.5">
                <Notifications />
                <ProfInfo />
              </div>
              
              {/* BADGE INITIALES DYNAMIQUE */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-sm tracking-wider">
                {initials}
              </div>

              {/* BOUTON DÉCONNEXION */}
              <button 
                onClick={handleLogout} 
                title="Se déconnecter" 
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm"
              >
                <LogOut 
                  size={18} 
                  strokeWidth={2.5} 
                  className="group-hover:-translate-x-0.5 transition-transform z-10" 
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BOTTOM NAVBAR (Mobile avec le même design que Student) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-2 h-20 z-50 rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] lg:hidden flex items-center">
        <div className="flex justify-between items-center w-full max-w-md mx-auto relative px-2">
          {navItems.map((item) => (
            <NavIcon 
              key={`prof-mobile-${item.id}`} 
              item={item} 
              currentPath={currentPath} 
              navigate={navigate} 
            />
          ))}
        </div>
      </nav>
    </>
  );
};

// Sous-composant icone mobile identique au comportement Student
const NavIcon = ({ item, currentPath, navigate }) => {
  const isActive = currentPath.includes(item.path) || (currentPath === '/prof' && item.id === 'tableau');
  const Icon = item.icon;
  return (
    <button
      onClick={() => navigate(item.path)}
      className="relative flex flex-col items-center justify-center w-[65px] h-[56px] group transition-all"
    >
      {isActive && (
        <motion.div
          layoutId="prof-mobile-pill-bg"
          className="absolute inset-0 bg-[#d1f4e0]/50 rounded-2xl -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {isActive && (
        <motion.div
          layoutId="prof-active-dot-top"
          className="absolute top-1.5 w-1 h-1 bg-[#006c49] rounded-full"
        />
      )}
      <Icon
        size={22}
        strokeWidth={isActive ? 2.5 : 2}
        className={`transition-all duration-300 z-10 ${
          isActive ? 'text-[#006c49] -translate-y-1' : 'text-gray-400 group-hover:text-gray-600 translate-y-1'
        }`}
      />
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-1.5 text-[9px] font-black uppercase tracking-widest text-[#006c49]"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ProfNav;