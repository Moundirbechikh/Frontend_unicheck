import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'react-qr-code';

const ROTATION_INTERVAL = 10000; // 10 secondes
const API = 'https://backend-unicheck.onrender.com';

const CenterMonolith = ({ isExpanded, seanceId }) => {
  const [token,       setToken]       = useState("--- ---");
  const [timerPaused, setTimerPaused] = useState(false);
  const [progress,    setProgress]    = useState(100);
  const [fade,        setFade]        = useState(true);

  // Refs
  const elapsedRef    = useRef(0);   // ms écoulés depuis dernière rotation
  const isPausedRef   = useRef(false);
  const intervalRef   = useRef(null);
  const isRotatingRef = useRef(false);

  useEffect(() => { isPausedRef.current = timerPaused; }, [timerPaused]);

  // ── Lire le token actuel en BDD ──────────────────────────────────────────
  const fetchToken = useCallback(async () => {
    if (!seanceId) return null;
    try {
      const jwt = localStorage.getItem('token');
      const res = await fetch(`${API}/api/seances/${seanceId}/token`, {
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return data.token;
      }
    } catch (err) { console.error("❌ Token fetch:", err); }
    return null;
  }, [seanceId]);

  // ── Générer et sauvegarder un nouveau token en BDD ───────────────────────
  const refreshToken = useCallback(async () => {
    if (!seanceId) return null;
    try {
      const jwt = localStorage.getItem('token');
      const res = await fetch(`${API}/api/seances/${seanceId}/refresh-token`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return data.token;
      } else {
        console.warn("⚠️ Refresh refusé (pause ?)");
      }
    } catch (err) { console.error("❌ Refresh token:", err); }
    return null;
  }, [seanceId]);

  // ── Rotation : sauvegarde en BDD PUIS affichage ──────────────────────────
  const rotateToken = useCallback(async () => {
    if (isRotatingRef.current) return;
    isRotatingRef.current = true;

    setFade(false);

    const newToken = await refreshToken();

    setTimeout(() => {
      if (newToken) setToken(newToken);
      setFade(true);
      isRotatingRef.current = false;
    }, 250);
  }, [refreshToken]);

  // ── Toggle pause/play ────────────────────────────────────────────────────
  const handleToggleTimer = async () => {
    if (!seanceId) return;

    const newPaused = !timerPaused;
    setTimerPaused(newPaused);
    isPausedRef.current = newPaused;

    try {
      const jwt = localStorage.getItem('token');
      const res = await fetch(`${API}/api/seances/${seanceId}/toggle-timer`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setTimerPaused(data.isPaused);
        isPausedRef.current = data.isPaused;
      }
    } catch (err) { console.error("❌ Toggle timer:", err); }
  };

  // ── Boucle principale ────────────────────────────────────────────────────
  useEffect(() => {
    if (!seanceId) return;

    // Charger le token actuel depuis la BDD (déjà généré au lancement)
    fetchToken().then(t => { if (t) setToken(t); });

    let lastTick = Date.now();

    intervalRef.current = setInterval(() => {
      const now   = Date.now();
      const delta = now - lastTick;
      lastTick    = now;

      if (!isPausedRef.current && !isRotatingRef.current) {
        elapsedRef.current += delta;

        if (elapsedRef.current >= ROTATION_INTERVAL) {
          elapsedRef.current -= ROTATION_INTERVAL; // conserve le reste
          rotateToken();
        }

        // Progression décroissante : 100% → 0%
        const pct = Math.max(0, 100 - (elapsedRef.current / ROTATION_INTERVAL) * 100);
        setProgress(pct);
      }
      // Quand en pause : progress reste figée à la valeur courante
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [seanceId, fetchToken, rotateToken]);

  // ── Styles ───────────────────────────────────────────────────────────────
  const progressColor = timerPaused ? 'rgba(255,255,255,0.2)' : '#006c49';
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
    transition: 'background 0.1s linear',
  };

  const QrDisplay = ({ size = 512 }) => (
    token && token !== "ERROR" && token !== "--- ---" ? (
      <QRCode value={token} size={size} style={{ width: '100%', height: '100%' }} viewBox="0 0 256 256" />
    ) : (
      <div className="text-[#1a1c1e] font-black text-center animate-pulse p-4">
        GÉNÉRATION...
      </div>
    )
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1c1e]
                    rounded-[3rem] md:rounded-[4rem] overflow-hidden">

      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-full h-full flex-col items-center justify-center p-6 gap-4">
        <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] shrink-0">
          Token · 10 sec
          {timerPaused && <span className="text-yellow-400 ml-2">(EN PAUSE)</span>}
        </p>

        <div className="flex items-center gap-5 shrink-0" style={{ height: 'min(78vh, 78%)' }}>
          {/* Spacer gauche */}
          <div style={{ width: '140px' }} />

          {/* QR + anneau */}
          <div className="relative shrink-0" style={{ height: '100%', aspectRatio: '1 / 1' }}>
            <div style={progressRingStyle} />
            <div
              className="absolute inset-0 bg-white rounded-[2rem] flex items-center
                         justify-center p-4 transition-opacity duration-200"
              style={{ opacity: fade ? 1 : 0 }}
            >
              <QrDisplay />
            </div>
          </div>

          {/* Droite : token texte + bouton */}
          <div className="shrink-0 flex flex-col items-start justify-center gap-3"
               style={{ width: '140px' }}>
            <div
              className="bg-[#006c49] text-white rounded-2xl flex items-center justify-center
                         font-mono font-black tracking-[0.2em] px-4 py-3 w-full
                         transition-opacity duration-200"
              style={{ opacity: fade ? 1 : 0, fontSize: '1.1rem' }}
            >
              {token}
            </div>

            <button
              onClick={handleToggleTimer}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                          font-black text-[10px] uppercase tracking-widest transition-all
                          active:scale-95
                ${timerPaused
                  ? 'bg-[#006c49] text-white'
                  : 'bg-white/10 text-white/40 border border-white/10'}`}
            >
              {timerPaused ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
                  Relancer
                </>
              ) : (
                <>
                  <span className="flex gap-[3px]">
                    <span className="w-[3px] h-3 bg-white/40 rounded-sm" />
                    <span className="w-[3px] h-3 bg-white/40 rounded-sm" />
                  </span>
                  Stop
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div className="flex md:hidden w-full h-full flex-col items-center justify-center p-5 gap-3">
        <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] shrink-0">
          Token · 10 sec
          {timerPaused && <span className="text-yellow-400 ml-2">(PAUSE)</span>}
        </p>

        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
          <div className="relative w-full min-h-0"
               style={{ aspectRatio: '1 / 1', maxHeight: '100%' }}>
            <div style={progressRingStyle} />
            <div
              className="absolute inset-0 bg-white rounded-[2rem] flex items-center
                         justify-center p-3 transition-opacity duration-200"
              style={{ opacity: fade ? 1 : 0 }}
            >
              <QrDisplay />
            </div>
          </div>

          <div className="w-full mt-3 shrink-0">
            <div
              className="w-full bg-[#006c49] text-white rounded-2xl flex items-center
                         justify-center font-mono font-black tracking-[0.25em] py-3
                         transition-opacity duration-200"
              style={{ opacity: fade ? 1 : 0, fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
            >
              {token}
            </div>
          </div>

          <div className="w-full mt-2 shrink-0">
            <button
              onClick={handleToggleTimer}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                          font-black text-[10px] uppercase tracking-widest transition-all
                          active:scale-[0.98]
                ${timerPaused
                  ? 'bg-[#006c49] text-white'
                  : 'bg-white/10 text-white/50 border border-white/10'}`}
            >
              {timerPaused ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" />
                  Relancer
                </>
              ) : (
                <>
                  <span className="flex gap-[3px]">
                    <span className="w-[3px] h-3 bg-white/50 rounded-sm" />
                    <span className="w-[3px] h-3 bg-white/50 rounded-sm" />
                  </span>
                  Stop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterMonolith;