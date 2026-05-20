import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'react-qr-code';

const API               = 'https://backend-unicheck.onrender.com';
const ROTATION_INTERVAL = 10000; // 10s
const POLL_INTERVAL     = 600;   // 600ms

const CenterMonolith = ({ isExpanded, seanceId }) => {
  const [token,       setToken]       = useState('--- ---');
  const [elapsedMs,   setElapsedMs]   = useState(0);
  const [isPaused,    setIsPaused]    = useState(false);
  const [fade,        setFade]        = useState(true);

  const prevTokenRef    = useRef('');
  const isRefreshingRef = useRef(false);
  const pollRef         = useRef(null);

  const jwt = () => localStorage.getItem('token');

  // ── Poll session-state (tous les appareils se synchronisent ici) ──────────
  const pollState = useCallback(async () => {
    if (!seanceId) return;
    try {
      const res = await fetch(`${API}/api/seances/${seanceId}/session-state`, {
        headers: { Authorization: `Bearer ${jwt()}` }
      });
      if (!res.ok) return;
      const data = await res.json();

      setIsPaused(data.isTimerPaused);
      setElapsedMs(data.elapsedMs || 0);

      // Changement de token → animation fade
      if (data.token && data.token !== prevTokenRef.current && data.token !== 'null') {
        prevTokenRef.current = data.token;
        setFade(false);
        setTimeout(() => { setToken(data.token); setFade(true); }, 250);
      }

      // Déclencher refresh quand elapsed >= 9500ms et pas en pause
      // La protection race condition est côté backend (< 8s → renvoie token actuel)
      if (!data.isTimerPaused && data.elapsedMs >= 9500 && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        doRefreshToken().finally(() => {
          setTimeout(() => { isRefreshingRef.current = false; }, 1000);
        });
      }
    } catch {}
  }, [seanceId]);

  const doRefreshToken = async () => {
    try {
      await fetch(`${API}/api/seances/${seanceId}/refresh-token`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' }
      });
      // Le prochain poll récupèrera le nouveau token automatiquement
    } catch {}
  };

  const handleToggleTimer = async () => {
    try {
      await fetch(`${API}/api/seances/${seanceId}/toggle-timer`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' }
      });
      // L'état sera mis à jour par le prochain poll (tous les devices)
    } catch {}
  };

  useEffect(() => {
    if (!seanceId) return;
    pollState(); // premier appel immédiat
    pollRef.current = setInterval(pollState, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [seanceId, pollState]);

  // ── Progress bar calculée depuis elapsedMs ────────────────────────────────
  const progress      = Math.max(0, 100 - (elapsedMs / ROTATION_INTERVAL) * 100);
  const progressColor = isPaused ? 'rgba(255,255,255,0.2)' : '#006c49';
  const trackColor    = 'rgba(255,255,255,0.07)';

  const progressRingStyle = {
    position: 'absolute',
    inset: '-4px',
    borderRadius: 'calc(2rem + 4px)',
    background: `conic-gradient(from -90deg, ${progressColor} ${progress}%, ${trackColor} ${progress}%)`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    padding: '3px',
    pointerEvents: 'none',
    transition: 'background 0.15s linear',
  };

  const QrDisplay = () => (
    token && token !== 'ERROR' && token !== '--- ---' ? (
      <QRCode value={token} size={512}
              style={{ width: '100%', height: '100%' }} viewBox="0 0 256 256" />
    ) : (
      <div className="text-[#1a1c1e] font-black text-center animate-pulse p-4">
        GÉNÉRATION...
      </div>
    )
  );

  const PauseButton = ({ full = false }) => (
    <button onClick={handleToggleTimer}
      className={`${full ? 'w-full' : ''} flex items-center justify-center gap-2
                  px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest
                  transition-all active:scale-95
        ${isPaused
          ? 'bg-[#006c49] text-white'
          : 'bg-white/10 text-white/40 border border-white/10'}`}>
      {isPaused ? (
        <><span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse shrink-0" /> Relancer</>
      ) : (
        <>
          <span className="flex gap-[3px] shrink-0">
            <span className="w-[3px] h-3 bg-white/40 rounded-sm" />
            <span className="w-[3px] h-3 bg-white/40 rounded-sm" />
          </span>
          Stop
        </>
      )}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center
                    bg-[#1a1c1e] rounded-[3rem] md:rounded-[4rem] overflow-hidden">

      {/* ── DESKTOP ───────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-full h-full flex-col items-center justify-center p-6 gap-4">
        <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] shrink-0">
          Token · 10 sec
          {isPaused && <span className="text-yellow-400 ml-2">(EN PAUSE)</span>}
        </p>

        <div className="flex items-center gap-5 shrink-0" style={{ height: 'min(78vh, 78%)' }}>
          <div style={{ width: '140px' }} />

          <div className="relative shrink-0" style={{ height: '100%', aspectRatio: '1 / 1' }}>
            <div style={progressRingStyle} />
            <div className="absolute inset-0 bg-white rounded-[2rem] flex items-center
                           justify-center p-4 transition-opacity duration-200"
                 style={{ opacity: fade ? 1 : 0 }}>
              <QrDisplay />
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start justify-center gap-3"
               style={{ width: '140px' }}>
            <div className="bg-[#006c49] text-white rounded-2xl flex items-center
                           justify-center font-mono font-black tracking-[0.2em]
                           px-4 py-3 w-full transition-opacity duration-200"
                 style={{ opacity: fade ? 1 : 0, fontSize: '1.1rem' }}>
              {token}
            </div>
            <PauseButton full />
          </div>
        </div>
      </div>

      {/* ── MOBILE ────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden w-full h-full flex-col items-center justify-center p-5 gap-3">
        <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] shrink-0">
          Token · 10 sec
          {isPaused && <span className="text-yellow-400 ml-2">(PAUSE)</span>}
        </p>

        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
          <div className="relative w-full min-h-0"
               style={{ aspectRatio: '1 / 1', maxHeight: '100%' }}>
            <div style={progressRingStyle} />
            <div className="absolute inset-0 bg-white rounded-[2rem] flex items-center
                           justify-center p-3 transition-opacity duration-200"
                 style={{ opacity: fade ? 1 : 0 }}>
              <QrDisplay />
            </div>
          </div>

          <div className="w-full mt-3 shrink-0">
            <div className="w-full bg-[#006c49] text-white rounded-2xl flex items-center
                           justify-center font-mono font-black tracking-[0.25em] py-3
                           transition-opacity duration-200"
                 style={{ opacity: fade ? 1 : 0, fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
              {token}
            </div>
          </div>

          <div className="w-full mt-2 shrink-0">
            <PauseButton full />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterMonolith;