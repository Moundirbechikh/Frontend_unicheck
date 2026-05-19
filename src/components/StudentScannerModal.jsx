import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, XCircle, Loader2, QrCode,
  Keyboard, MapPin, Smartphone, AlertTriangle,
  Send, RotateCcw, Camera
} from 'lucide-react';

const API        = 'https://backend-unicheck.onrender.com';
const SCANNER_ID = 'student-qr-reader';

// ── Détection mobile ─────────────────────────────────────────────────────────
const isMobile = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
  || window.innerWidth < 768;

// ── DeviceId stable ───────────────────────────────────────────────────────────
const getOrCreateDeviceId = () => {
  let id = localStorage.getItem('unicheck_device_id');
  if (!id) {
    const fp = [
      navigator.userAgent,
      `${screen.width}x${screen.height}`,
      navigator.language || '',
      String(new Date().getTimezoneOffset()),
      String(navigator.hardwareConcurrency || 0),
    ].join('|');
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
      hash = ((hash << 5) - hash) + fp.charCodeAt(i);
      hash = hash & hash;
    }
    id = 'DEV_' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    localStorage.setItem('unicheck_device_id', id);
  }
  return id;
};

// ─────────────────────────────────────────────────────────────────────────────
const StudentScannerModal = ({ isOpen, onClose, onScanSuccess, studentId }) => {

  const [mode,          setMode]          = useState('camera');
  const [manualToken,   setManualToken]   = useState('');
  const [gpsStatus,     setGpsStatus]     = useState('idle');  // idle | pending | ok | error
  const [gpsCoords,     setGpsCoords]     = useState(null);
  const [status,        setStatus]        = useState('idle');  // idle | loading | success | error
  const [result,        setResult]        = useState(null);
  // Caméras disponibles (desktop uniquement)
  const [cameras,       setCameras]       = useState([]);
  const [selectedCamId, setSelectedCamId] = useState(null);

  const scannerDivRef = useRef(null);
  const scannerRef    = useRef(null);   // instance Html5Qrcode
  const processingRef = useRef(false);
  const deviceId      = useRef(getOrCreateDeviceId());
  const mobile        = useRef(isMobile());

  // ── GPS ──────────────────────────────────────────────────────────────────
  const requestGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('pending');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('ok');
      },
      () => {
        // Fallback basse précision
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGpsStatus('ok');
          },
          () => setGpsStatus('error'),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Réinitialisation à la fermeture ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      processingRef.current = false;
      setStatus('idle');
      setResult(null);
      setManualToken('');
      setMode('camera');
      setGpsStatus('idle');
      setGpsCoords(null);
      setCameras([]);
      setSelectedCamId(null);
    }
  }, [isOpen]);

  // ── Lister les caméras disponibles (desktop) ─────────────────────────────
  useEffect(() => {
    if (!isOpen || mobile.current) return;

    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Préférer la caméra "back" ou "rear" si disponible, sinon la première
          const back = devices.find(d =>
            /back|rear|environment/i.test(d.label)
          );
          setSelectedCamId((back || devices[0]).id);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // ── Arrêter le scanner ───────────────────────────────────────────────────
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // 2 = SCANNING
        if (state === 2) await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
  };

  // ── Démarrer le scanner ──────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    if (!scannerDivRef.current) return;
    await stopScanner();

    const qr = new Html5Qrcode(SCANNER_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = qr;

    const config = {
      fps:      15,
      qrbox:    { width: 230, height: 230 },
      aspectRatio: 1.0,
    };

    // Mobile : caméra arrière uniquement
    // Desktop : caméra sélectionnée par l'utilisateur
    try {
      if (mobile.current) {
        await qr.start(
          { facingMode: { exact: "environment" } },
          config,
          async (decoded) => {
            if (processingRef.current) return;
            processingRef.current = true;
            await soumettre(decoded);
          },
          () => {}
        );
      } else if (selectedCamId) {
        await qr.start(
          selectedCamId,
          config,
          async (decoded) => {
            if (processingRef.current) return;
            processingRef.current = true;
            await soumettre(decoded);
          },
          () => {}
        );
      }
    } catch (err) {
      // Fallback : essai sans contrainte exacte
      try {
        await qr.start(
          { facingMode: "environment" },
          config,
          async (decoded) => {
            if (processingRef.current) return;
            processingRef.current = true;
            await soumettre(decoded);
          },
          () => {}
        );
      } catch (err2) {
        console.error("Caméra inaccessible :", err2);
      }
    }
  }, [selectedCamId]);

  // ── Lancer le scanner quand mode = camera + idle ─────────────────────────
  useEffect(() => {
    if (!isOpen || mode !== 'camera' || status !== 'idle') return;

    const timer = setTimeout(() => startScanner(), 400);
    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, mode, status, startScanner]);

  // ── Validation commune ────────────────────────────────────────────────────
  const soumettre = useCallback(async (token) => {
    if (!token?.trim()) return;
    setStatus('loading');

    const payload = {
      token:      token.trim().toUpperCase(),
      studentId:  parseInt(studentId),
      studentLat: gpsCoords?.lat ?? 0,
      studentLng: gpsCoords?.lng ?? 0,
      deviceId:   deviceId.current,
    };

    try {
      const res = await fetch(`${API}/api/presences/scan`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ message: data.message, heure: data.heure || '--:--' });
        setStatus('success');
        setTimeout(() => { onScanSuccess?.(data.message); onClose(); }, 3500);
      } else {
        setResult({ message: data.message || 'Présence refusée.' });
        setStatus('error');
        setTimeout(() => {
          setStatus('idle');
          setResult(null);
          setManualToken('');
          processingRef.current = false;
        }, 3000);
      }
    } catch {
      setResult({ message: 'Impossible de joindre le serveur.' });
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setResult(null);
        processingRef.current = false;
      }, 3000);
    }
  }, [gpsCoords, studentId, onScanSuccess, onClose]);

  const handleManualSubmit = () => {
    if (!manualToken.trim() || processingRef.current) return;
    processingRef.current = true;
    soumettre(manualToken);
  };

  if (!isOpen) return null;

  // ── Badges ────────────────────────────────────────────────────────────────
  const GpsBadge = () => (
    <button
      onClick={gpsStatus === 'idle' || gpsStatus === 'error' ? requestGps : undefined}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black
                  uppercase tracking-widest transition-all
        ${gpsStatus === 'ok'      ? 'bg-[#006c49]/30 text-green-400 cursor-default'
        : gpsStatus === 'pending' ? 'bg-white/10 text-gray-500 cursor-default'
        : gpsStatus === 'error'   ? 'bg-orange-500/20 text-orange-400 cursor-pointer hover:bg-orange-500/30'
        :                           'bg-white/10 text-gray-500 cursor-pointer hover:bg-white/20'}`}
    >
      <MapPin size={10} />
      {gpsStatus === 'ok'      ? 'GPS ✓'
      : gpsStatus === 'pending' ? 'GPS…'
      : gpsStatus === 'error'   ? 'GPS ✗ (tap)'
      :                           'GPS off (tap)'}
    </button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="fixed inset-0 z-[200] bg-[#1a1c1e] flex flex-col overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="px-6 pt-10 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006c49] mb-1">
                Unicheck · Pointage
              </p>
              <h2 style={{ fontFamily: "'Manrope', sans-serif" }}
                className="text-3xl font-black text-white tracking-tighter leading-none">
                Pointer ma<br/>
                <span className="text-[#006c49]">présence.</span>
              </h2>
            </div>
            {status !== 'loading' && (
              <button onClick={onClose}
                className="w-10 h-10 mt-1 bg-white/10 hover:bg-red-500/20 hover:text-red-400
                           rounded-2xl flex items-center justify-center text-gray-400
                           transition-all border border-white/10">
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <GpsBadge />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10
                            text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Smartphone size={10} />
              {deviceId.current.substring(0, 10)}…
            </div>
            {!mobile.current && cameras.length > 1 && status === 'idle' && mode === 'camera' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10
                              text-[10px] font-black uppercase tracking-widest text-gray-500">
                <Camera size={10} />
                {cameras.length} cams
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        {status === 'idle' && (
          <div className="px-6 pb-4 shrink-0">
            <div className="bg-white/5 rounded-2xl p-1 flex gap-1 border border-white/5">
              <button onClick={() => setMode('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                            text-xs font-black uppercase tracking-widest transition-all
                  ${mode === 'camera'
                    ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/30'
                    : 'text-gray-600 hover:text-gray-400'}`}>
                <QrCode size={14} /> QR Caméra
              </button>
              <button onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                            text-xs font-black uppercase tracking-widest transition-all
                  ${mode === 'manual'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-400'}`}>
                <Keyboard size={14} /> Code Manuel
              </button>
            </div>

            {/* Sélecteur caméra desktop */}
            {!mobile.current && cameras.length > 1 && mode === 'camera' && (
              <div className="mt-2">
                <select
                  value={selectedCamId || ''}
                  onChange={e => { setSelectedCamId(e.target.value); stopScanner(); }}
                  className="w-full bg-white/5 border border-white/10 text-gray-400
                             rounded-xl px-4 py-2.5 text-xs font-bold outline-none
                             focus:border-[#006c49]/40 transition-all"
                >
                  {cameras.map(cam => (
                    <option key={cam.id} value={cam.id}>{cam.label || `Caméra ${cam.id}`}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* ── Zone principale ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 relative">

          {/* Overlay résultat */}
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
              >
                {/* Loading */}
                {status === 'loading' && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-5">
                    <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-white/5
                                    flex items-center justify-center">
                      <Loader2 size={40} className="text-[#006c49] animate-spin" />
                    </div>
                    <div className="text-center space-y-1">
                      <p style={{ fontFamily: "'Manrope', sans-serif" }}
                        className="text-white font-black text-xl tracking-tighter">
                        Vérification…
                      </p>
                      <p className="text-gray-600 text-xs font-bold">Token · GPS · Appareil</p>
                    </div>
                  </motion.div>
                )}

                {/* Succès */}
                {status === 'success' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-6 w-full max-w-xs"
                  >
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-[#006c49] flex items-center
                                      justify-center shadow-2xl shadow-[#006c49]/40">
                        <CheckCircle2 size={52} className="text-white" />
                      </div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-[#006c49]"
                      />
                    </div>
                    <div className="text-center">
                      <p style={{ fontFamily: "'Manrope', sans-serif" }}
                        className="text-white font-black text-2xl tracking-tighter">
                        Présence validée !
                      </p>
                      <p className="text-[#006c49] font-black text-5xl mt-2"
                        style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {result?.heure}
                      </p>
                    </div>
                    <div className="w-full bg-[#006c49]/15 border border-[#006c49]/25
                                    rounded-2xl px-5 py-4 text-center">
                      <p className="text-green-300 text-sm font-bold">{result?.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 size={12} className="animate-spin" />
                      <p className="text-[11px] font-bold uppercase tracking-widest">
                        Fermeture automatique…
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Erreur */}
                {status === 'error' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-6 w-full max-w-xs"
                  >
                    <div className="w-24 h-24 rounded-full bg-red-500/15 border border-red-500/30
                                    flex items-center justify-center">
                      <XCircle size={44} className="text-red-400" />
                    </div>
                    <div className="text-center">
                      <p style={{ fontFamily: "'Manrope', sans-serif" }}
                        className="text-white font-black text-xl tracking-tighter">
                        Présence refusée
                      </p>
                    </div>
                    <div className="w-full bg-red-500/10 border border-red-500/20
                                    rounded-2xl px-5 py-4 text-center">
                      <p className="text-red-300 text-sm font-bold leading-relaxed">
                        {result?.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <RotateCcw size={12} />
                      <p className="text-[11px] font-bold uppercase tracking-widest">
                        Réessayez…
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mode Caméra ─────────────────────────────────────────────── */}
          {mode === 'camera' && status === 'idle' && (
            <div className="w-full max-w-sm space-y-3">
              <div
                id={SCANNER_ID}
                ref={scannerDivRef}
                className="w-full rounded-[2rem] overflow-hidden border-2 border-[#006c49]/30
                           shadow-2xl shadow-[#006c49]/10 bg-black/20"
                style={{ minHeight: '260px' }}
              />
              {gpsStatus === 'ok' && (
                <div className="flex items-center gap-2 justify-center text-[#006c49]">
                  <MapPin size={11} />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    GPS actif · Vérification distance ON
                  </p>
                </div>
              )}
              {(gpsStatus === 'idle' || gpsStatus === 'error') && (
                <button onClick={requestGps}
                  className="w-full flex items-center justify-center gap-2 py-3
                             bg-orange-500/10 border border-orange-500/20 rounded-2xl
                             text-orange-400 text-xs font-black uppercase tracking-widest
                             hover:bg-orange-500/20 transition-all">
                  <MapPin size={13} />
                  {gpsStatus === 'error' ? 'GPS refusé — réessayer' : 'Activer le GPS'}
                </button>
              )}
              {gpsStatus === 'pending' && (
                <div className="flex items-center gap-2 justify-center text-gray-600">
                  <Loader2 size={12} className="animate-spin" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    GPS en cours…
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Mode Manuel ─────────────────────────────────────────────── */}
          {mode === 'manual' && status === 'idle' && (
            <div className="w-full max-w-sm space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl
                                flex items-center justify-center">
                  <Keyboard size={28} className="text-gray-500" />
                </div>
                <p className="text-gray-600 text-sm font-bold text-center">
                  Entrez le code affiché par votre professeur
                </p>
              </div>

              <input
                type="text"
                value={manualToken}
                onChange={e => setManualToken(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                placeholder="ABC-123"
                maxLength={7}
                autoFocus
                className="w-full bg-white/5 border-2 border-white/10 text-white
                           placeholder-gray-700 rounded-2xl py-5 px-6 font-black text-3xl
                           text-center outline-none tracking-[0.35em] uppercase
                           focus:border-[#006c49]/60 focus:bg-white/10 transition-all"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              />

              {/* GPS optionnel */}
              {(gpsStatus === 'idle' || gpsStatus === 'error') && (
                <button onClick={requestGps}
                  className="w-full flex items-center justify-center gap-2 py-3
                             bg-orange-500/10 border border-orange-500/20 rounded-2xl
                             text-orange-400 text-xs font-black uppercase tracking-widest
                             hover:bg-orange-500/20 transition-all">
                  <MapPin size={13} />
                  {gpsStatus === 'error' ? 'GPS refusé — réessayer' : 'Activer le GPS (recommandé)'}
                </button>
              )}

              <button
                onClick={handleManualSubmit}
                disabled={!manualToken.trim() || manualToken.length < 6}
                className="w-full py-5 rounded-[1.8rem] font-black text-sm uppercase
                           tracking-[0.2em] transition-all flex items-center justify-center gap-3
                           disabled:bg-white/5 disabled:text-gray-700 disabled:cursor-not-allowed
                           bg-[#006c49] hover:bg-[#005a3c] text-white shadow-xl
                           shadow-[#006c49]/20 active:scale-[0.98]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <Send size={18} /> Valider la présence
              </button>

              {manualToken.length > 0 && manualToken.length < 6 && (
                <p className="text-center text-gray-700 text-xs font-bold">
                  Format : XXX-XXX (ex: ABK-7Y2)
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StudentScannerModal;