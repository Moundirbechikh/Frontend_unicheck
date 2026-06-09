import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Square } from 'lucide-react';
import UnicheckSessionDashboard from './UnicheckSessionDashboard';

const API           = 'https://backend-unicheck.onrender.com';
const SYNC_INTERVAL = 5000;

const ActiveAttendanceSession = ({ onStopSession, seance }) => {
  const [seconds,      setSeconds]      = useState(0);
  const [isFinishing,  setIsFinishing]  = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const secondsRef = useRef(0);
  const timerRef   = useRef(null);
  const syncRef    = useRef(null);

  const jwt = () => localStorage.getItem('token');

  // ── Calcul depuis dateHeureLancement exact ───────────────────────────────
  // Fonctionne sur TOUS les devices : le temps est calculé depuis
  // le timestamp de lancement stocké en BDD, pas depuis l'ouverture du composant
  const calcSeconds = useCallback((launchIso) => {
    if (!launchIso) return 0;
    const diff = Math.floor((Date.now() - new Date(launchIso).getTime()) / 1000);
    return diff > 0 ? diff : 0;
  }, []);

  useEffect(() => {
    // Initialisation depuis dateHeureLancement
    // Si on se connecte 25 minutes après le lancement → timer démarre à 25:00
    const initial = calcSeconds(seance?.dateHeureLancement);

    console.log("⏱️ [SESSION] dateHeureLancement :", seance?.dateHeureLancement,
                "→ timer initialisé à", initial, "s");

    secondsRef.current = initial;
    setSeconds(initial);

    // Tick local 1s
    timerRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);

    // Resync toutes les 5s (correction dérive + détection terminaison multi-device)
    syncRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/seances/${seance.id}/session-state`, {
          headers: { Authorization: `Bearer ${jwt()}` }
        });
        if (!res.ok) return;
        const data = await res.json();

        // Séance terminée depuis un autre device → fermeture automatique
        if (data.estTerminee) {
          console.log("🔴 [SESSION] Séance terminée détectée via poll → fermeture");
          clearInterval(timerRef.current);
          clearInterval(syncRef.current);
          setIsTerminated(true);
          setTimeout(() => onStopSession(), 800);
          return;
        }

        // Correction de dérive si > 2s d'écart
        if (seance?.dateHeureLancement) {
          const synced = calcSeconds(seance.dateHeureLancement);
          const drift  = Math.abs(synced - secondsRef.current);
          if (drift > 2) {
            console.log(`⏱️ [SYNC] ${secondsRef.current}s → ${synced}s (dérive ${drift}s)`);
            secondsRef.current = synced;
            setSeconds(synced);
          }
        }
      } catch {}
    }, SYNC_INTERVAL);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
    };
  }, [seance?.id, seance?.dateHeureLancement, calcSeconds, onStopSession]);

  const handleFinish = async () => {
    if (!seance?.id || isFinishing) return;
    setIsFinishing(true);
    console.log("🔴 [SESSION] Terminer séance ID :", seance.id);

    try {
      const res = await fetch(`${API}/api/seances/${seance.id}/terminer`, {
        method:  'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${jwt()}`
        }
      });

      console.log("🔴 [SESSION] Statut HTTP :", res.status);

      if (res.status === 401) {
        alert("Session expirée. Reconnectez-vous.");
        setIsFinishing(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      console.log("🔴 [SESSION] Réponse :", data);

      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
      onStopSession();

    } catch (err) {
      console.error("❌ [SESSION] Erreur réseau :", err);
      // Mode optimiste : on ferme quand même
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
      onStopSession();
    }
  };

  const formatTime = (s) => {
    const h    = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (h > 0) return `${h}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f1f4f2] overflow-hidden font-body">

      {/* Barre timer + bouton terminer */}
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
          disabled={isFinishing || isTerminated}
          className={`text-white p-2 md:p-3 rounded-full shadow-xl transition-all group relative
            ${isFinishing || isTerminated
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 active:scale-90'}`}
        >
          {isFinishing ? (
            <svg className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] animate-spin"
                 fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Square size={14} fill="white" className="md:w-[18px] md:h-[18px]" />
          )}
          <span className="absolute hidden md:block -bottom-10 left-1/2 -translate-x-1/2
                           bg-red-600 text-[10px] font-black uppercase px-2 py-1 rounded
                           opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isFinishing ? 'Fermeture…' : 'Terminer'}
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