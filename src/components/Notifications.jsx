import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, CheckCircle2, AlertCircle, Info,
  ArrowRight, BellRing, BellOff, Loader2
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const getIconByGravite = (gravite) => {
  switch (gravite) {
    case 'ROUGE':  return <AlertCircle  className="text-red-500"     size={17} />;
    case 'ORANGE': return <AlertCircle  className="text-orange-500"  size={17} />;
    case 'VERT':
    default:       return <CheckCircle2 className="text-[#006c49]"   size={17} />;
  }
};

const getBadgeColor = (gravite) => {
  switch (gravite) {
    case 'ROUGE':  return 'bg-red-50    ring-red-200';
    case 'ORANGE': return 'bg-orange-50 ring-orange-200';
    default:       return 'bg-[#d1f4e0] ring-[#006c49]/20';
  }
};

const getBorderColor = (gravite) => {
  switch (gravite) {
    case 'ROUGE':  return 'border-l-red-500';
    case 'ORANGE': return 'border-l-orange-400';
    default:       return 'border-l-[#006c49]';
  }
};

// ── État vide personnalisé ────────────────────────────────────────────────────
const EmptyState = ({ prenom }) => (
  <div className="flex flex-col items-center justify-center py-10 px-6 text-center space-y-3">
    <div className="w-14 h-14 bg-[#f1f4f2] rounded-3xl flex items-center justify-center">
      <BellOff size={24} className="text-gray-300" />
    </div>
    <div>
      <p className="font-display font-black text-[#1a1c1e] text-sm">
        Bonjour{prenom ? ` ${prenom}` : ''} !
      </p>
      <p className="text-xs text-gray-400 font-medium mt-1">
        Vous n'avez aucune notification pour le moment.
      </p>
    </div>
  </div>
);

// ── Dropdown portal ───────────────────────────────────────────────────────────
const DropdownPortal = ({ data, loading, onClose, onViewAll, onMarkAllRead }) =>
  ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,   scale: 1 }}
        exit={{ opacity: 0,    y: -10,  scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="absolute bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                   rounded-[2rem] overflow-hidden
                   left-1/2 -translate-x-1/2 top-[72px] w-[calc(100vw-24px)] max-w-[360px]
                   sm:left-auto sm:right-6 sm:translate-x-0 sm:w-[340px]"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-display font-black text-[#1a1c1e] text-sm uppercase tracking-wider">
              Notifications
            </h3>
            {data?.prenom && (
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                {data.prenom} {data.nom}
              </p>
            )}
          </div>
          {data?.totalNonLues > 0 ? (
            <div className="flex items-center gap-2">
              <span className="bg-[#d1f4e0] text-[#006c49] text-[10px] font-black px-2.5 py-1 rounded-full">
                {data.totalNonLues} NOUVELLES
              </span>
              <button
                onClick={onMarkAllRead}
                className="text-[10px] font-black font-display uppercase tracking-widest text-gray-400 hover:text-[#006c49] transition-colors"
              >
                Tout lire
              </button>
            </div>
          ) : (
            <span className="text-[10px] font-black font-display uppercase tracking-widest text-gray-300">
              À jour ✓
            </span>
          )}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={22} className="text-[#006c49] animate-spin" />
          </div>
        ) : !data || data.notifications.length === 0 ? (
          <EmptyState prenom={data?.prenom} />
        ) : (
          <div className="divide-y divide-gray-50">
            {data.notifications.slice(0, 3).map(n => (
              <div key={n.id}
                className="px-4 py-3.5 hover:bg-gray-50 transition-colors flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ring-2 ${getBadgeColor(n.gravite)}`}>
                  {getIconByGravite(n.gravite)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-[#1a1c1e] text-sm leading-tight">{n.titre}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                  <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-wider">{n.time}</p>
                </div>
                {!n.estLue && (
                  <span className="w-2 h-2 bg-[#006c49] rounded-full shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {data && data.notifications.length > 0 && (
          <button
            onClick={onViewAll}
            className="w-full px-5 py-3.5 bg-[#f1f4f2] text-[#006c49] font-display font-black
                       text-[10px] uppercase tracking-[0.2em] hover:bg-[#d1f4e0] transition-colors
                       flex items-center justify-center gap-2"
          >
            Voir tout <ArrowRight size={13} />
          </button>
        )}
      </motion.div>
    </div>,
    document.body
  );

// ── Modal fullscreen portal ───────────────────────────────────────────────────
const FullModal = ({ data, loading, onClose, onMarkAllRead }) =>
  ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1a1c1e]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full bg-[#f1f4f2] overflow-hidden flex flex-col
                   rounded-t-[2.5rem] sm:rounded-[2.5rem] sm:max-w-lg sm:mx-4"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="bg-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#006c49] rounded-2xl flex items-center justify-center text-white shrink-0">
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-[#1a1c1e] text-xl tracking-tighter leading-tight">
                {data?.prenom ? `Notifications de ${data.prenom}` : 'Notifications'}
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                {data?.totalNonLues ?? 0} non lue{(data?.totalNonLues ?? 0) > 1 ? 's' : ''} · {data?.notifications?.length ?? 0} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data?.totalNonLues > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[10px] font-black font-display uppercase tracking-widest text-[#006c49] hover:underline"
              >
                Tout lire
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Liste scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="text-[#006c49] animate-spin" />
            </div>
          ) : !data || data.notifications.length === 0 ? (
            <EmptyState prenom={data?.prenom} />
          ) : (
            <div className="space-y-3">
              {data.notifications.map(n => (
                <div key={n.id}
                  className={`bg-white rounded-[1.5rem] p-4 flex gap-3 items-start border border-gray-100
                    transition-all hover:scale-[1.005]
                    ${!n.estLue ? `border-l-4 ${getBorderColor(n.gravite)}` : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ring-2 ${getBadgeColor(n.gravite)}`}>
                    {getIconByGravite(n.gravite)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-[#1a1c1e] text-sm leading-tight">{n.titre}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{n.message}</p>
                    <p className="text-[10px] font-bold text-gray-300 mt-1.5 uppercase tracking-wider">{n.time}</p>
                  </div>
                  {!n.estLue && (
                    <span className="w-2.5 h-2.5 bg-[#006c49] rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/80 px-6 py-3.5 text-center shrink-0 border-t border-gray-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {data?.notifications?.length > 0
              ? 'Fin des notifications récentes'
              : 'Aucune notification à afficher'}
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );

// ════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
const Notifications = () => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [showAll,  setShowAll]  = useState(false);
  const [data,     setData]     = useState(null);   // { prenom, nom, notifications, totalNonLues }
  const [loading,  setLoading]  = useState(false);

  const userId = localStorage.getItem('userId');
  const token  = localStorage.getItem('token');

  // ── Fetch notifications ───────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://backend-unicheck.onrender.com/api/notifications/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setData(await res.json());
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [userId, token]);

  // Charger au montage + quand on ouvre
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleOpen = () => {
    setIsOpen(o => !o);
    if (!isOpen) fetchNotifications();
  };

  // ── Tout marquer comme lu ────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    if (!userId || !token) return;
    try {
      await fetch(
        `https://backend-unicheck.onrender.com/api/notifications/user/${userId}/tout-lire`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
      );
      // Mise à jour locale immédiate
      setData(prev => prev ? {
        ...prev,
        totalNonLues: 0,
        notifications: prev.notifications.map(n => ({ ...n, estLue: true }))
      } : prev);
    } catch { /* silencieux */ }
  };

  const openFullView = () => {
    setIsOpen(false);
    setShowAll(true);
  };

  const nonLues = data?.totalNonLues ?? 0;

  return (
    <div className="relative">
      {/* ── Bouton cloche ──────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        <Bell size={22} strokeWidth={2} />
        {nonLues > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── Dropdown ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <DropdownPortal
            data={data}
            loading={loading}
            onClose={() => setIsOpen(false)}
            onViewAll={openFullView}
            onMarkAllRead={handleMarkAllRead}
          />
        )}
      </AnimatePresence>

      {/* ── Modal plein écran ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAll && (
          <FullModal
            data={data}
            loading={loading}
            onClose={() => setShowAll(false)}
            onMarkAllRead={handleMarkAllRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;