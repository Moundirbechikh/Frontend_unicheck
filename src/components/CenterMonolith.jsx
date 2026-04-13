import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

const ROTATION_INTERVAL = 5000;

const generateToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const seg2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg1}-${seg2}`;
};

const CenterMonolith = ({ isExpanded }) => {
  const [token, setToken] = useState(generateToken());
  const [timerPaused, setTimerPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const startRef = useRef(Date.now());

  const rotateToken = () => {
    setFade(false);
    setTimeout(() => {
      setToken(generateToken());
      setFade(true);
      setProgress(100);
      startRef.current = Date.now();
    }, 300);
  };

  useEffect(() => {
    if (timerPaused) {
      clearInterval(intervalRef.current);
      clearInterval(progressRef.current);
      return;
    }
    startRef.current = Date.now();
    intervalRef.current = setInterval(rotateToken, ROTATION_INTERVAL);
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.max(0, 100 - (elapsed / ROTATION_INTERVAL) * 100));
    }, 50);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(progressRef.current);
    };
  }, [timerPaused]);

  const progressColor = timerPaused ? 'rgba(255,255,255,0.2)' : '#006c49';
  const trackColor = 'rgba(255,255,255,0.07)';

  // Barre de progression parfaite : conic-gradient + mask
  // Le border-radius du ring suit exactement celui de la carte QR
  const progressRingStyle = {
    position: 'absolute',
    inset: '-4px',
    borderRadius: 'calc(2rem + 4px)', // = inner QR card radius (2rem) + inset (4px)
    background: `conic-gradient(
      from -90deg,
      ${progressColor} ${progress}%,
      ${trackColor} ${progress}%
    )`,
    WebkitMask:
      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    padding: '3px',
    pointerEvents: 'none',
    transition: 'background 0.1s linear',
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1c1e] rounded-[3rem] md:rounded-[4rem] overflow-hidden">

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex w-full h-full flex-col items-center justify-center p-6 gap-4">

        <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] shrink-0">
          Token de session
        </p>

        {/* Rangée : espace gauche | QR | contrôles droite */}
        <div
          className="flex items-center gap-5 shrink-0"
          style={{ height: 'min(78vh, 78%)' }}
        >

          {/* Espace symétrique gauche */}
          <div className="shrink-0" style={{ width: '140px' }} />

          {/* QR carré avec ring parfait */}
          <div
            className="relative shrink-0"
            style={{ height: '100%', aspectRatio: '1 / 1' }}
          >
            {/* Ring de progression conic-gradient */}
            <div style={progressRingStyle} />

            {/* Carte QR blanche */}
            <div
              className="absolute inset-0 bg-white rounded-[2rem] flex items-center justify-center p-4 transition-opacity duration-300"
              style={{ opacity: fade ? 1 : 0 }}
            >
              <QRCode
                value={token}
                size={512}
                style={{ width: '100%', height: '100%' }}
                viewBox="0 0 256 256"
              />
            </div>
          </div>

          {/* Contrôles à droite — horizontaux, empilés */}
          <div
            className="shrink-0 flex flex-col items-start justify-center gap-3"
            style={{ width: '140px' }}
          >
            {/* Badge token */}
            <div
              className="bg-[#006c49] text-white rounded-2xl flex items-center justify-center font-mono font-black tracking-[0.2em] px-4 py-3 w-full transition-opacity duration-300"
              style={{
                opacity: fade ? 1 : 0,
                fontSize: '1.1rem',
              }}
            >
              {token}
            </div>

            {/* Bouton stop timer */}
            <button
              onClick={() => setTimerPaused(p => !p)}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                font-black text-[10px] uppercase tracking-widest
                transition-all active:scale-95
                ${timerPaused
                  ? 'bg-[#006c49] text-white hover:bg-[#00855a]'
                  : 'bg-white/10 text-white/40 border border-white/10 hover:bg-white/15'
                }
              `}
            >
              {timerPaused ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white inline-block shrink-0" />
                  Relancer
                </>
              ) : (
                <>
                  <span className="flex gap-[3px] shrink-0">
                    <span className="w-[3px] h-3 bg-white/40 rounded-sm inline-block" />
                    <span className="w-[3px] h-3 bg-white/40 rounded-sm inline-block" />
                  </span>
                  Stop timer
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* ── MOBILE : inchangé ── */}
      <div className="flex md:hidden w-full h-full flex-col items-center justify-center p-5 gap-3">

        <p className="text-white/30 font-black uppercase tracking-[0.5em] text-[10px] shrink-0">
          Token de session
        </p>

        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">

          <div
            className="relative w-full min-h-0"
            style={{ aspectRatio: '1 / 1', maxHeight: '100%' }}
          >
            <div style={progressRingStyle} />
            <div
              className="absolute inset-0 bg-white rounded-[2rem] flex items-center justify-center p-3 transition-opacity duration-300"
              style={{ opacity: fade ? 1 : 0 }}
            >
              <QRCode
                value={token}
                size={512}
                style={{ width: '100%', height: '100%' }}
                viewBox="0 0 256 256"
              />
            </div>
          </div>

          <div className="w-full mt-3 shrink-0">
            <div
              className="w-full bg-[#006c49] text-white rounded-2xl flex items-center justify-center font-mono font-black tracking-[0.25em] py-3 transition-opacity duration-300"
              style={{ opacity: fade ? 1 : 0, fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
            >
              {token}
            </div>
          </div>

          <div className="w-full mt-2 shrink-0">
            <button
              onClick={() => setTimerPaused(p => !p)}
              className={`
                w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                font-black text-[10px] uppercase tracking-widest
                transition-all active:scale-[0.98]
                ${timerPaused
                  ? 'bg-[#006c49] text-white'
                  : 'bg-white/10 text-white/50 border border-white/10'
                }
              `}
            >
              {timerPaused ? (
                <><span className="w-2 h-2 rounded-full bg-white inline-block" /> Relancer le timer</>
              ) : (
                <><span className="flex gap-[3px]"><span className="w-[3px] h-3 bg-white/50 rounded-sm" /><span className="w-[3px] h-3 bg-white/50 rounded-sm" /></span> Stop timer</>
              )}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CenterMonolith;