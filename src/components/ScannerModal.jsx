import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const API = 'https://backend-unicheck.onrender.com';

// ─────────────────────────────────────────────────────────────────────────────
// ScannerModal — scan des cartes étudiants par le professeur
// Le scanner reste actif après chaque scan.
// Un overlay coloré de 2 secondes indique le résultat.
// ─────────────────────────────────────────────────────────────────────────────
const ScannerModal = ({ isOpen, onClose, seanceId }) => {
  // overlay : null | { type: 'success'|'doublon'|'error', nom?, message?, heure? }
  const [overlay,      setOverlay]      = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerDivRef = useRef(null);
  const instanceRef   = useRef(null);
  const cooldownRef   = useRef(false);
  const token         = localStorage.getItem('token');

  // ── Init scanner au montage / ouverture ───────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setOverlay(null);
    setIsProcessing(false);
    cooldownRef.current = false;

    const timer = setTimeout(() => {
      if (!scannerDivRef.current) return;

      const scanner = new Html5QrcodeScanner(
        'qr-reader-prof',
        {
          fps:            20,
          qrbox:          { width: 240, height: 240 },
          rememberLastUsedCamera:     true,
          supportedScanTypes:         [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported:  true,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          // ── Anti-doublon strict ──────────────────────────────────────────
          if (cooldownRef.current) return;
          cooldownRef.current = true;
          setIsProcessing(true);

          try {
            const res  = await fetch(`${API}/api/presences/scan-carte`, {
              method:  'POST',
              headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ codeQrFixe: decodedText, seanceId }),
            });
            const data = await res.json();

            setIsProcessing(false);

            if (data.success) {
              setOverlay({ type: 'success', nom: data.etudiantNom, heure: data.heure });
            } else if (data.etudiantNom) {
              // Étudiant trouvé mais déjà présent
              setOverlay({ type: 'doublon', nom: data.etudiantNom });
            } else {
              setOverlay({ type: 'error', message: data.message || "Code non reconnu." });
            }
          } catch {
            setIsProcessing(false);
            setOverlay({ type: 'error', message: "Erreur de connexion au serveur." });
          }

          // ── Effacer l'overlay après 2 sec et réactiver le scan ──────────
          setTimeout(() => {
            setOverlay(null);
            cooldownRef.current = false;
          }, 2000);
        },
        () => {} // Ignorer les erreurs "pas de QR trouvé"
      );

      instanceRef.current = scanner;
    }, 300);

    return () => {
      clearTimeout(timer);
      instanceRef.current?.clear().catch(() => {});
      instanceRef.current = null;
      cooldownRef.current = false;
    };
  }, [isOpen, seanceId]);

  if (!isOpen) return null;

  const overlayConfig = overlay ? {
    success: {
      bg:   'bg-[#006c49]/90',
      Icon: CheckCircle2,
      iconColor: 'text-white',
      iconSize:  44,
    },
    doublon: {
      bg:   'bg-orange-500/90',
      Icon: AlertCircle,
      iconColor: 'text-white',
      iconSize:  40,
    },
    error: {
      bg:   'bg-red-600/90',
      Icon: AlertCircle,
      iconColor: 'text-white',
      iconSize:  40,
    },
  }[overlay.type] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#1a1c1e]/96 backdrop-blur-xl
                 flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: "'Manrope', sans-serif" }}
            className="font-black text-white text-xl uppercase tracking-tighter">
            Scanner Carte
          </h2>
          <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest mt-0.5">
            Séance #{seanceId} · QR Fixe Étudiant
          </p>
        </div>
        <button onClick={onClose}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center
                     justify-center text-gray-400 hover:text-white transition-all
                     border border-white/10">
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Zone scanner + overlay */}
      <div className="relative w-full max-w-sm">

        {/* Cadre scanner */}
        <div
          id="qr-reader-prof"
          ref={scannerDivRef}
          className={`w-full rounded-[2rem] overflow-hidden transition-all duration-300
            ${overlay?.type === 'success' ? 'ring-4 ring-[#006c49]/60'
            : overlay?.type === 'doublon' ? 'ring-4 ring-orange-500/50'
            : overlay?.type === 'error'   ? 'ring-4 ring-red-500/50'
            :                               'ring-2 ring-white/10'}`}
        />

        {/* ── Overlay résultat 2 secondes ─────────────────────────────── */}
        <AnimatePresence>
          {(isProcessing || overlay) && (
            <motion.div
              key={overlay?.type || 'processing'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`absolute inset-0 rounded-[2rem] flex flex-col items-center
                          justify-center gap-3 p-6 text-white backdrop-blur-sm
                ${isProcessing
                    ? 'bg-[#1a1c1e]/80'
                    : overlayConfig?.bg || 'bg-white/10'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={40} className="animate-spin" />
                  <p className="font-black text-sm uppercase tracking-widest">
                    Vérification…
                  </p>
                </>
              ) : overlay && overlayConfig ? (
                <>
                  <overlayConfig.Icon
                    size={overlayConfig.iconSize}
                    className={overlayConfig.iconColor}
                    strokeWidth={2}
                  />

                  {overlay.type === 'success' && (
                    <>
                      <p style={{ fontFamily: "'Manrope', sans-serif" }}
                        className="font-black text-xl text-center leading-tight">
                        {overlay.nom}
                      </p>
                      <div className="bg-white/20 px-4 py-1.5 rounded-full">
                        <p className="text-white font-black text-sm">{overlay.heure}</p>
                      </div>
                    </>
                  )}

                  {overlay.type === 'doublon' && (
                    <>
                      <p style={{ fontFamily: "'Manrope', sans-serif" }}
                        className="font-black text-lg text-center leading-tight">
                        {overlay.nom}
                      </p>
                      <p className="text-white/80 text-xs font-black uppercase tracking-widest">
                        Déjà marqué présent
                      </p>
                    </>
                  )}

                  {overlay.type === 'error' && (
                    <p className="text-white/90 text-sm font-bold text-center leading-relaxed px-2">
                      {overlay.message}
                    </p>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur visuel permanent */}
      <div className="mt-5 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full transition-colors duration-300
          ${overlay?.type === 'success' ? 'bg-[#006c49] animate-pulse'
          : overlay?.type === 'doublon' ? 'bg-orange-400 animate-pulse'
          : overlay?.type === 'error'   ? 'bg-red-400 animate-pulse'
          : isProcessing                ? 'bg-blue-400 animate-pulse'
          :                               'bg-white/20 animate-pulse'}`}
        />
        <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest">
          {overlay?.type === 'success' ? 'Présence enregistrée'
          : overlay?.type === 'doublon' ? 'Déjà présent'
          : overlay?.type === 'error'   ? 'Scan échoué'
          : isProcessing                ? 'Traitement...'
          :                              'En attente d\'une carte'}
        </p>
      </div>
    </motion.div>
  );
};

export default ScannerModal;