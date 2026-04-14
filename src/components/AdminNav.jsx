import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, GraduationCap, CalendarDays, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notifications from './Notifications'; 

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'tableau', label: 'Tableau', icon: LayoutGrid, path: '/admin/tableau' },
    { id: 'etudiants', label: 'Étudiants', icon: GraduationCap, path: '/admin/etudiants' },
    { id: 'professeurs', label: 'Profs', icon: Users, path: '/admin/professeurs' },
    { id: 'planning', label: 'Planning', icon: CalendarDays, path: '/admin/planning' },
  ];

  const activeItem = navItems.find(item => 
    currentPath.includes(item.path) || (currentPath === '/admin' && item.id === 'tableau')
  ) || navItems[0];

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate('/admin/tableau')}
            >
              <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-md">
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tighter text-[#1a1c1e]">
                Unicheck <span className="text-[#006c49] text-sm ml-1 hidden sm:inline-block">Admin</span>
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = currentPath.includes(item.path) || (currentPath === '/admin' && item.id === 'tableau');
                const Icon = item.icon;
                return (
                  <button
                    key={`admin-desktop-${item.id}`}
                    onClick={() => navigate(item.path)}
                    className={`relative px-5 py-2.5 rounded-xl flex items-center gap-3 font-bold transition-all duration-300 ${
                      isActive ? 'text-[#006c49]' : 'text-gray-500 hover:text-[#1a1c1e] hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="admin-desktop-pill"
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
            <div className="flex items-center gap-2 sm:gap-4">
              <Notifications />
              
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm">
                MC
              </div>

              {/* BOUTON DÉCONNEXION */}
              <button 
                onClick={() => navigate('/')}
                title="Se déconnecter"
                className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all duration-300 shadow-sm"
              >
                <div className="absolute inset-0 bg-red-100 rounded-xl opacity-0 group-active:opacity-100 transition-opacity" />
                <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform z-10" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 pt-2 pb-5 z-50 rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.04)] lg:hidden">
        <div className="max-w-md mx-auto mb-1 flex justify-center">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeItem.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    className="bg-[#d1f4e0] text-[#006c49] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#006c49]/10"
                >
                    {activeItem.label}
                </motion.div>
             </AnimatePresence>
        </div>

        <div className="flex justify-between items-center max-w-md mx-auto relative px-2">
          {navItems.map((item) => {
            const isActive = currentPath.includes(item.path) || (currentPath === '/admin' && item.id === 'tableau');
            const Icon = item.icon;
            return (
              <button
                key={`admin-mobile-${item.id}`}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-[65px] h-[50px] group transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-mobile-pill"
                    className="absolute inset-0 bg-[#d1f4e0]/50 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-all duration-300 ${
                    isActive ? 'text-[#006c49] scale-110 -translate-y-0.5' : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                />
                {isActive && (
                  <motion.div 
                    layoutId="admin-active-dot" 
                    className="w-1 h-1 bg-[#006c49] rounded-full mt-0.5" 
                  />
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