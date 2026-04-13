import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, AlertCircle, Info, ArrowRight, BellRing } from 'lucide-react';

const notifications = [
  { id: 1, title: "Présence validée", desc: "Votre présence en 'Réseaux' a été confirmée.", time: "Il y a 5 min", type: "success", read: false },
  { id: 2, title: "Justificatif requis", desc: "Absence détectée le 12 Mars en 'IHM'.", time: "Il y a 1h", type: "warning", read: false },
  { id: 3, title: "Nouveau message", desc: "Le Prof. Bacha a publié un nouveau support.", time: "Il y a 3h", type: "info", read: true },
  { id: 4, title: "Session expirée", desc: "Veuillez vous reconnecter pour synchroniser.", time: "Hier", type: "info", read: true },
];

const unreadCount = notifications.filter(n => !n.read).length;

const IconType = ({ type }) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="text-[#006c49]" size={18} />;
    case 'warning': return <AlertCircle className="text-orange-500" size={18} />;
    default: return <Info className="text-blue-500" size={18} />;
  }
};

// Dropdown téléporté dans body pour échapper au stacking context du header
const DropdownPortal = ({ onClose, onViewAll }) =>
  ReactDOM.createPortal(
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
        {/* Overlay fermeture */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Carte centrée en haut sur mobile, alignée à droite sur desktop */}
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="
            absolute
            bg-white border border-gray-100
            shadow-[0_20px_50px_rgba(0,0,0,0.12)]
            rounded-[2rem] overflow-hidden

            left-1/2 -translate-x-1/2 top-[72px]
            w-[calc(100vw-24px)] max-w-[360px]

            sm:left-auto sm:right-6 sm:translate-x-0 sm:w-[340px]
          "
          style={{ zIndex: 9999 }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-display font-black text-[#1a1c1e] text-sm uppercase tracking-wider">
              Notifications
            </h3>
            <span className="bg-[#d1f4e0] text-[#006c49] text-[10px] font-black px-2.5 py-1 rounded-full">
              {unreadCount} NOUVELLES
            </span>
          </div>

          {/* Liste */}
          <div className="divide-y divide-gray-50">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className="px-4 py-3.5 hover:bg-gray-50 transition-colors flex gap-3 items-start"
              >
                <div className={`
                  w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 mt-0.5
                  ${!n.read ? 'ring-2 ring-[#006c49]/20' : ''}
                `}>
                  <IconType type={n.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-[#1a1c1e] text-sm leading-tight">
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                    {n.desc}
                  </p>
                  <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-wider">
                    {n.time}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 bg-[#006c49] rounded-full shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <button
            onClick={onViewAll}
            className="w-full px-5 py-4 bg-[#f1f4f2] text-[#006c49] font-display font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#d1f4e0] transition-colors flex items-center justify-center gap-2"
          >
            Voir tout <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );

// Modal fullscreen téléportée dans body
const FullModal = ({ onClose }) =>
  ReactDOM.createPortal(
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} className="flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#1a1c1e]/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet bottom mobile / modal centré desktop */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="
            relative z-10 w-full bg-[#f1f4f2] overflow-hidden flex flex-col
            rounded-t-[2.5rem]
            sm:rounded-[2.5rem] sm:max-w-lg sm:mx-4
          "
          style={{ maxHeight: '92vh' }}
        >
          {/* Header */}
          <div className="bg-white px-6 py-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#006c49] rounded-2xl flex items-center justify-center text-white shrink-0">
                <BellRing size={20} />
              </div>
              <div>
                <h2 className="font-display font-black text-[#1a1c1e] text-xl tracking-tighter leading-tight">
                  Flux d'activités
                </h2>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                  {unreadCount} non lues · {notifications.length} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`
                  bg-white rounded-[1.5rem] p-4 flex gap-3 items-start border border-gray-100
                  transition-all hover:scale-[1.01]
                  ${!n.read ? 'border-l-4 border-l-[#006c49]' : ''}
                `}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <IconType type={n.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-[#1a1c1e] text-sm leading-tight">
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{n.desc}</p>
                  <p className="text-[10px] font-bold text-gray-300 mt-1.5 uppercase tracking-wider">
                    {n.time}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2.5 h-2.5 bg-[#006c49] rounded-full shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-white/70 px-6 py-4 text-center shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Fin des notifications récentes
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const openFullView = () => {
    setIsOpen(false);
    setShowAll(true);
  };

  return (
    <div className="relative">
      {/* BOUTON CLOCHE */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        <Bell size={22} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Dropdown via Portal */}
      {isOpen && (
        <DropdownPortal
          onClose={() => setIsOpen(false)}
          onViewAll={openFullView}
        />
      )}

      {/* Modal fullscreen via Portal */}
      {showAll && <FullModal onClose={() => setShowAll(false)} />}
    </div>
  );
};

export default Notifications;