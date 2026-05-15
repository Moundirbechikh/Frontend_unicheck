import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, XCircle, Loader2, QrCode,
  Keyboard, MapPin, Smartphone, AlertTriangle,
  Send, RotateCcw
} from 'lucide-react';

const API          = 'https://backend-unicheck.onrender.com';
const SCANNER_ID   = 'student-qr-reader';

// ── DeviceId stable basé sur un fingerprint navigateur ───────────────────────
const getOrCreateDeviceId = () => {
  let id = localStorage.getItem('unicheck_device_id');
  if (!id) {
    const fp = [
      navigator.userAgent,
      `${window.screen.width}x${window.screen.height}`, 
      navigator.language || '',
      String(new Date().getTimezoneOffset()),
      String(navigator.hardwareConcurrency || 0),
    ].join('|');
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
      hash = ((hash << 5) - hash) + fp.charCodeAt(i);
      hash = hash & hash; // Convertir en 32 bits
    }
    id = 'DEV_' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    localStorage.setItem('unicheck_device_id', id);
  }
  return id;
};

// ─────────────────────────────────────────────────────────────────────────────
const StudentScannerModal = ({ isOpen, onClose, onScanSuccess, studentId }) => {

  const [mode,        setMode]        = useState('camera'); // 'camera' | 'manual'
  const [manualToken, setManualToken] = useState('');
  const [gpsStatus,   setGpsStatus]   = useState('pending'); // pending | ok | error
  const [gpsCoords,   setGpsCoords]   = useState(null);
  const [status,      setStatus]      = useState('idle');    // idle | loading | success | error
  const [result,      setResult]      = useState(null);      // { message, heure }

  const scannerRef    = useRef(null);
  const instanceRef   = useRef(null);
  const processingRef = useRef(false);
  const deviceId      = useRef(getOrCreateDeviceId());

  // ── Acquérir GPS à l'ouverture ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    console.log(">>> [DEBUG FRONTEND] Ouverture de la modale. Demande des coordonnées GPS...");
    setGpsStatus('pending');
    setGpsCoords(null);

    if (!('geolocation' in navigator)) {
      console.log(">>> [DEBUG FRONTEND] ERREUR : La géolocalisation n'est pas supportée par ce navigateur.");
      setGpsStatus('error');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(">>> [DEBUG FRONTEND] GPS acquis avec succès : Lat=", pos.coords.latitude, " Lng=", pos.coords.longitude);
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('ok');
      },
      (err) => {
        console.log(">>> [DEBUG FRONTEND] ERREUR GPS : Impossible de récupérer la position. Code erreur:", err.code, "Message:", err.message);
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [isOpen]);

  // ── Reset complet à la fermeture ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      console.log(">>> [DEBUG FRONTEND] Fermeture de la modale. Nettoyage...");
      instanceRef.current?.clear().catch(() => {});
      instanceRef.current  = null;
      processingRef.current = false;
      setStatus('idle');
      setResult(null);
      setManualToken('');
      setMode('camera');
    }
  }, [isOpen]);

  // ── Init scanner caméra ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || mode !== 'camera' || status !== 'idle') return;

    console.log(">>> [DEBUG FRONTEND] Initialisation du scanner caméra...");
    const timer = setTimeout(() => {
      if (!scannerRef.current) return;

      const scanner = new Html5QrcodeScanner(
        SCANNER_ID,
        {
          fps:            10,
          qrbox:          { width: 230, height: 230 },
          aspectRatio:    1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          if (processingRef.current) {
            console.log(">>> [DEBUG FRONTEND] QR Code détecté, mais un traitement est déjà en cours. Ignoré.");
            return;
          }
          console.log(">>> [DEBUG FRONTEND] QR Code lu avec succès via caméra :", decodedText);
          processingRef.current = true;
          await soumettre(decodedText);
        },
        () => {} // Ignorer les logs de scanning frame
      );

      instanceRef.current = scanner;
    }, 350);

    return () => {
      clearTimeout(timer);
      instanceRef.current?.clear().catch(() => {});
      instanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, status]);

  // ── Fonction de validation commune (caméra + manuel) ──────────────────────
  const soumettre = useCallback(async (token) => {
    if (!token?.trim()) return;
    
    console.log(">>> [DEBUG FRONTEND] Préparation de la requête pour le token :", token);
    setStatus('loading');

    const payload = {
      token:      token.trim().toUpperCase(),
      studentId:  parseInt(studentId),
      studentLat: gpsCoords?.lat ?? 0,
      studentLng: gpsCoords?.lng ?? 0,
      deviceId:   deviceId.current,
    };

    console.log(">>> [DEBUG FRONTEND] Payload envoyé à l'API :", payload);

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
      console.log(">>> [DEBUG FRONTEND] Réponse reçue de l'API :", data);

      if (data.success) {
        console.log(">>> [DEBUG FRONTEND] Succès du pointage.");
        setResult({ message: data.message, heure: data.heure || '--:--' });
        setStatus('success');
        // Fermer automatiquement après 3.5 sec
        setTimeout(() => {
          onScanSuccess?.(data.message);
          onClose();
        }, 3500);
      } else {
        console.log(">>> [DEBUG FRONTEND] Échec du pointage renvoyé par l'API.");
        setResult({ message: data.message || 'Présence refusée.' });
        setStatus('error');
        // Permettre de réessayer après 3 sec
        setTimeout(() => {
          setStatus('idle');
          setResult(null);
          setManualToken('');
          processingRef.current = false;
        }, 3000);
      }
    } catch (error) {
      console.error(">>> [DEBUG FRONTEND] Erreur réseau lors du pointage :", error);
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
    if (!manualToken.trim() || processingRef.current || gpsStatus === 'pending') {
        console.log(">>> [DEBUG FRONTEND] Blocage handleManualSubmit. manualToken=", manualToken, " processing=", processingRef.current, " gpsStatus=", gpsStatus);
        return;
    }
    console.log(">>> [DEBUG FRONTEND] Soumission manuelle déclenchée.");
    processingRef.current = true;
    soumettre(manualToken);
  };

  if (!isOpen) return null;

  // Badges statut GPS + device
  const GpsBadge = () => (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
      ${gpsStatus === 'ok'      ? 'bg-[#006c49]/30 text-green-400'
      : gpsStatus === 'error'   ? 'bg-orange-500/20 text-orange-400'
      :                           'bg-white/10 text-gray-500'}`}>
      <MapPin size={10} />
      {gpsStatus === 'ok' ? 'GPS ✓' : gpsStatus === 'error' ? 'GPS ✗' : 'GPS…'}
    </div>
  );

  const DeviceBadge = () => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
      <Smartphone size={10} />
      {deviceId.current.substring(0, 10)}…
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-[200] bg-[#1a1c1e] flex flex-col overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 pt-10 pb-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006c49] mb-1">
                Unicheck · Sécurisé
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
          <div className="flex items-center gap-2 mt-4">
            <GpsBadge />
            <DeviceBadge />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10
                            text-[10px] font-black uppercase tracking-widest text-gray-500">
              ≤ 20m max
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        {status === 'idle' && (
          <div className="px-6 pb-4 shrink-0">
            <div className="bg-white/5 rounded-2xl p-1 flex gap-1 border border-white/5">
              <button onClick={() => setMode('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                            text-xs font-black uppercase tracking-widest transition-all
                  ${mode === 'camera' ? 'bg-[#006c49] text-white shadow-lg shadow-[#006c49]/30'
                  :                     'text-gray-600 hover:text-gray-400'}`}>
                <QrCode size={14} /> QR Caméra
              </button>
              <button onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                            text-xs font-black uppercase tracking-widest transition-all
                  ${mode === 'manual' ? 'bg-white/15 text-white shadow-sm'
                  :                     'text-gray-600 hover:text-gray-400'}`}>
                <Keyboard size={14} /> Code Manuel
              </button>
            </div>
          </div>
        )}

        {/* ── Zone principale ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 relative">

          {/* ── OVERLAY résultat ─────────────────────────────────────────── */}
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
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-5"
                  >
                    <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-white/5
                                    flex items-center justify-center">
                      <Loader2 size={40} className="text-[#006c49] animate-spin" />
                    </div>
                    <div className="text-center space-y-1">
                      <p style={{ fontFamily: "'Manrope', sans-serif" }}
                        className="text-white font-black text-xl tracking-tighter">
                        Vérification...
                      </p>
                      <p className="text-gray-600 text-xs font-bold">
                        Token · GPS · Appareil
                      </p>
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
                    {/* Cercle animé */}
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
                      <p className="text-green-300 text-sm font-bold leading-relaxed">
                        {result?.message}
                      </p>
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
                        Vous pouvez réessayer…
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mode Caméra ─────────────────────────────────────────────── */}
          {mode === 'camera' && status === 'idle' && (
            <div className="w-full max-w-sm space-y-4">
              <div
                id={SCANNER_ID}
                ref={scannerRef}
                className="w-full rounded-[2rem] overflow-hidden border-2 border-[#006c49]/30
                           shadow-2xl shadow-[#006c49]/10"
              />

              {gpsStatus === 'error' && (
                <div className="flex items-start gap-2.5 bg-orange-500/10 border border-orange-500/20
                                rounded-2xl px-4 py-3">
                  <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-orange-300 text-xs font-bold leading-relaxed">
                    GPS non disponible. La vérification de distance est désactivée pour cette session.
                  </p>
                </div>
              )}

              {gpsStatus === 'pending' && (
                <div className="flex items-center gap-2 justify-center text-gray-600">
                  <Loader2 size={12} className="animate-spin" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    Acquisition GPS…
                  </p>
                </div>
              )}

              {gpsStatus === 'ok' && (
                <div className="flex items-center gap-2 justify-center text-[#006c49]">
                  <MapPin size={12} />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    GPS actif · Vérification distance activée
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Mode Manuel ─────────────────────────────────────────────── */}
          {mode === 'manual' && status === 'idle' && (
            <div className="w-full max-w-sm space-y-6">

              {/* Picto */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl
                                flex items-center justify-center">
                  <Keyboard size={28} className="text-gray-500" />
                </div>
                <p className="text-gray-600 text-sm font-bold text-center">
                  Entrez le code affiché par votre professeur
                </p>
              </div>

              {/* Champ token */}
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

              {/* Avertissement GPS */}
              {gpsStatus === 'error' && (
                <div className="flex items-start gap-2.5 bg-orange-500/10 border border-orange-500/20
                                rounded-2xl px-4 py-3">
                  <AlertTriangle size={14} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-orange-300 text-xs font-bold leading-relaxed">
                    GPS non disponible. La vérification de distance est désactivée.
                  </p>
                </div>
              )}

              {/* Bouton valider */}
              <button
                onClick={handleManualSubmit}
                disabled={!manualToken.trim() || manualToken.length < 6 || gpsStatus === 'pending'}
                className="w-full py-5 rounded-[1.8rem] font-black text-sm uppercase
                           tracking-[0.2em] transition-all flex items-center justify-center gap-3
                           disabled:bg-white/5 disabled:text-gray-700 disabled:cursor-not-allowed
                           bg-[#006c49] hover:bg-[#005a3c] text-white shadow-xl shadow-[#006c49]/20
                           active:scale-[0.98]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {gpsStatus === 'pending' ? (
                  <><Loader2 size={18} className="animate-spin" /> Attente GPS…</>
                ) : (
                  <><Send size={18} /> Valider la présence</>
                )}
              </button>

              {manualToken.length > 0 && manualToken.length < 6 && (
                <p className="text-center text-gray-700 text-xs font-bold">
                  Format attendu : XXX-XXX (ex: ABK-7Y2)
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