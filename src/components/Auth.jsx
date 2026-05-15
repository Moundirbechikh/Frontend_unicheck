import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Connexion from './Connexion';
import Inscription from './Inscription';

// ── PANNEAU DÉCORATIF (Côté sombre avec les cartes dynamiques) ────────────────
const PanneauDecoratif = ({ mode }) => {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex flex-col justify-between">
      {/* Effets de lumière en arrière-plan */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@800;900&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10b981]/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#006c49]/30 blur-[120px] rounded-full" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      {/* Logo à l'intérieur du panneau (Côté noir) - Visible en mode Inscription */}
      {mode === 'register' && (
        <div className="relative z-10 px-10 pt-10">
          <Link to="/" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer w-fit">
            <div className="w-8 h-8 bg-[#006c49] rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="font-display font-black text-xl tracking-tighter text-white">
              Unicheck
            </span>
          </Link>
        </div>
      )}

      {/* Contenu Central Animé */}
      <div className="flex-1 flex items-center justify-center p-10 relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login-panel"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-sm"
            >
              {/* Carte visuelle Connexion */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div className="px-3 py-1.5 bg-[#10b981]/20 border border-[#10b981]/30 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_10px_#10b981]" />
                    <span className="text-[#10b981] text-[10px] font-bold uppercase tracking-widest">En direct</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-2 w-1/3 bg-white/20 rounded-full" />
                  <div className="h-6 w-3/4 bg-white/40 rounded-full mb-6" />
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10b981] to-[#006c49] flex items-center justify-center">
                      <span className="text-white text-lg">✅</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Présence Validée</div>
                      <div className="text-white/50 text-xs mt-0.5">Aujourd'hui, 08:30 AM</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white/50 text-xs">QR</span>
                    </div>
                    <div className="space-y-2 w-full">
                      <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                      <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="register-panel"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-xs space-y-6"
            >
              {/* Carte visuelle Inscription */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-[2.5rem] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
              >
                <div className="mb-6">
                  <div className="text-white/40 text-[10px] font-display font-black uppercase tracking-widest mb-1">Bienvenue</div>
                  <div className="text-white font-display font-black text-xl tracking-tighter">Rejoignez Unicheck</div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: '🎓', text: 'Suivi de présence en temps réel' },
                    { icon: '📱', text: 'QR Code anti-fraude dynamique' },
                    { icon: '📊', text: 'Statistiques personnalisées' },
                    { icon: '🔒', text: 'Sécurité renforcée par GPS' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-white/60 text-xs font-body">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <p className="text-center text-white/30 text-xs font-display font-black uppercase tracking-widest">
                Université · Présence · Performance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bas du panneau */}
      <div className="relative z-10 p-10">
        <p className="text-white/15 text-[10px] font-display font-black uppercase tracking-widest">
          © 2026 Unicheck · Tous droits réservés
        </p>
      </div>
    </div>
  );
};

// ── COMPOSANT AUTH PRINCIPAL ────────────────────────────────────────────────
const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const springTransition = { type: "spring", stiffness: 180, damping: 24 };

  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden bg-[#fcfdfe] flex flex-col 
      ${mode === 'login' ? 'lg:flex-row' : 'lg:flex-row-reverse'} transition-all duration-700`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@800;900&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* --- CÔTÉ FORMULAIRE (BLANC) --- */}
      <motion.div layout transition={springTransition} className="flex-1 flex flex-col relative z-10 px-8 md:px-16 lg:px-20 py-10">
        
        {/* Navigation Supérieure */}
        <div className="flex justify-between items-center mb-12">
          
          {/* Logo dynamique :
              - Sur Desktop (lg), il disparaît en mode 'register' pour ne pas faire doublon avec le panneau noir.
              - Sur Mobile, le lg:hidden ne s'active pas, donc le logo reste toujours visible.
          */}
          <div className={mode === 'register' ? 'lg:hidden' : ''}>
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-md">
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tighter text-[#1a1c1e]">
                Unicheck
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="hidden sm:inline text-xs text-gray-400 font-medium">
              {mode === 'login' ? "Pas encore de compte ?" : "Déjà inscrit ?"}
            </span>
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="px-6 py-2.5 bg-[#1a1c1e] text-white text-[11px] font-display font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-black/10 uppercase tracking-wider whitespace-nowrap"
            >
              {mode === 'login' ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </div>

        {/* Zone du Formulaire */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="form-login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Connexion />
                </motion.div>
              ) : (
                <motion.div
                  key="form-register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Inscription />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* --- CÔTÉ VISUEL (NOIR) --- */}
      <motion.div 
        layout 
        transition={springTransition} 
        className="hidden lg:block w-[45%] h-full"
      >
        <PanneauDecoratif mode={mode} />
      </motion.div>
    </div>
  );
};

export default Auth;