import React, { useState, useEffect } from 'react';
import { Square } from 'lucide-react';
import UnicheckSessionDashboard from './UnicheckSessionDashboard';

const API = 'https://backend-unicheck.onrender.com';

const ActiveAttendanceSession = ({ onStopSession, seance }) => {
  const [seconds,     setSeconds]     = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // ── Timer : initialisé depuis dateHeureLancement (sync multi-device) ──────
  useEffect(() => {
    // Calcul de l'offset initial depuis la date de lancement serveur
    let initialSeconds = 0;
    if (seance?.dateHeureLancement) {
      const launched = new Date(seance.dateHeureLancement);
      const diff     = Math.floor((Date.now() - launched.getTime()) / 1000);
      initialSeconds = diff > 0 ? diff : 0;
    }
    setSeconds(initialSeconds);

    const interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [seance?.dateHeureLancement]);

  const handleFinish = async () => {
    if (!seance?.id) return;
    setIsFinishing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/seances/${seance.id}/terminer`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) throw new Error("Session expirée. Reconnectez-vous.");
      if (!res.ok)            throw new Error(`Erreur ${res.status}`);
      onStopSession();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const formatTime = (s) => {
    const h    = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (h > 0) return `${h}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f1f4f2] overflow-hidden font-body">

      {/* Barre de contrôle flottante */}
      <div className="absolute top-4 left-4 md:top-6 md:left-1/2 md:-translate-x-1/2
                      z-[110] flex items-center gap-2 md:gap-3 bg-black/90 backdrop-blur-xl
                      border border-white/10 p-2 md:p-3 rounded-full md:rounded-[2rem] shadow-2xl">
        <div className="flex items-center gap-2 md:gap-3 px-2 md:px-1">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-white font-mono text-base md:text-xl font-black tracking-tighter">
            {formatTime(seconds)}
          </span>
        </div>

        <div className="w-[1px] h-4 bg-white/10 hidden md:block" />

        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className={`${isFinishing ? 'bg-gray-600' : 'bg-red-500 hover:bg-red-600 active:scale-90'}
                      text-white p-2 md:p-3 rounded-full shadow-xl transition-all group relative`}
        >
          <Square size={14} fill="white" className="md:w-[18px] md:h-[18px]" />
          <span className="absolute hidden md:block -bottom-10 left-1/2 -translate-x-1/2
                           bg-red-600 text-[10px] font-black uppercase px-2 py-1 rounded
                           opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isFinishing ? 'En cours...' : 'Terminer'}
          </span>
        </button>
      </div>

      <div className="w-full h-full">
        <UnicheckSessionDashboard seance={seance} />
      </div>
    </div>
  );
};

export default ActiveAttendanceSession;