import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Loader2, ScanLine, Camera } from 'lucide-react';

const API        = 'https://backend-unicheck.onrender.com';
const SCANNER_ID = 'prof-qr-reader';

const isMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

const ScannerModal = ({ isOpen, onClose, seanceId }) => {
  const [status,        setStatus]        = useState('idle');
  const [result,        setResult]        = useState(null);
  const [cameras,       setCameras]       = useState([]);
  const [selectedCamId, setSelectedCamId] = useState(null);

  const scannerRef  = useRef(null);
  const divRef      = useRef(null);
  const processingRef = useRef(false);
  const mobile      = useRef(isMobile());

  // ── Lister les caméras (desktop) ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || mobile.current) return;
    Html5Qrcode.getCameras()
      .then(devs => {
        if (devs?.length > 0) {
          setCameras(devs);
          const back = devs.find(d => /back|rear|environment/i.test(d.label));
          setSelectedCamId((back || devs[0]).id);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // ── Reset fermeture ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      processingRef.current = false;
      setStatus('idle');
      setResult(null);
      setCameras([]);
      setSelectedCamId(null);
    }
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    if (!divRef.current) return;
    await stopScanner();

    const qr = new Html5Qrcode(SCANNER_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = qr;

    const config = { fps: 15, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };
    const onSuccess = async (decoded) => {
      if (processingRef.current) return;
      processingRef.current = true;
      await soumettre(decoded);
    };

    try {
      if (mobile.current) {
        await qr.start({ facingMode: { exact: 'environment' } }, config, onSuccess, () => {});
      } else if (selectedCamId) {
        await qr.start(selectedCamId, config, onSuccess, () => {});
      }
    } catch {
      try {
        await qr.start({ facingMode: 'environment' }, config, onSuccess, () => {});
      } catch {}
    }
  };

  useEffect(() => {
    if (!isOpen || status !== 'idle') return;
    const timer = setTimeout(startScanner, 400);
    return () => { clearTimeout(timer); stopScanner(); };
  }, [isOpen, status, selectedCamId]);

  const soumettre = async (codeQrFixe) => {
    if (!codeQrFixe || !seanceId) return;
    setStatus('loading');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/presences/scan-carte`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ codeQrFixe: codeQrFixe.trim(), seanceId }),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ message: data.message, nom: data.etudiantNom, heure: data.heure });
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setResult(null);
          processingRef.current = false;
        }, 2500);
      } else {
        setResult({ message: data.message });
        setStatus('error');
        setTimeout(() => {
          setStatus('idle');
          setResult(null);
          processingRef.current = false;
        }, 2500);
      }
    } catch {
      setResult({ message: 'Erreur réseau.' });
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setResult(null);
        processingRef.current = false;
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center
                   justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{ scale: 0.92,    opacity: 0 }}
          className="bg-[#1a1c1e] rounded-[2.5rem] w-full max-w-sm overflow-hidden
                     border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006c49]">
                Pointage Professeur
              </p>
              <h3 style={{ fontFamily: "'Manrope', sans-serif" }}
                className="text-xl font-black text-white tracking-tighter">
                Scanner carte étudiant
              </h3>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 bg-white/10 hover:bg-red-500/20 hover:text-red-400
                         rounded-2xl flex items-center justify-center text-gray-400
                         transition-all border border-white/10">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Sélecteur caméra desktop */}
          {!mobile.current && cameras.length > 1 && status === 'idle' && (
            <div className="px-6 pb-3">
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

          {/* Zone scanner */}
          <div className="px-6 pb-6 relative min-h-[280px] flex flex-col items-center
                          justify-center">
            {/* Overlay résultat */}
            <AnimatePresence>
              {status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center
                             px-4 z-20 bg-[#1a1c1e]"
                >
                  {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-2 border-white/10 bg-white/5
                                      flex items-center justify-center">
                        <Loader2 size={30} className="text-[#006c49] animate-spin" />
                      </div>
                      <p className="text-white font-black text-sm uppercase tracking-widest">
                        Vérification…
                      </p>
                    </div>
                  )}

                  {status === 'success' && (
                    <motion.div
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex flex-col items-center gap-4 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-[#006c49] flex items-center
                                      justify-center shadow-xl shadow-[#006c49]/30">
                        <CheckCircle2 size={40} className="text-white" />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Manrope', sans-serif" }}
                          className="text-white font-black text-xl tracking-tighter">
                          {result?.nom}
                        </p>
                        <p className="text-[#006c49] font-black text-3xl mt-1"
                           style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {result?.heure}
                        </p>
                      </div>
                      <p className="text-green-300 text-sm font-bold">{result?.message}</p>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex flex-col items-center gap-4 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30
                                      flex items-center justify-center">
                        <XCircle size={36} className="text-red-400" />
                      </div>
                      <p className="text-red-300 text-sm font-bold">{result?.message}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanner div */}
            <div
              id={SCANNER_ID}
              ref={divRef}
              className="w-full rounded-[1.5rem] overflow-hidden border-2 border-[#006c49]/30
                         shadow-xl bg-black/20"
              style={{ minHeight: '240px' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScannerModal;