import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPhone from '../components/AnimatedPhone';
import HeroSection from '../components/HeroSection';



const translations = {
  fr: {
    navBtn: "CONNEXION",
    heroSub: "Votre présence simplifiée, votre assiduité sécurisée par défaut.",
    badge: "Automatisé & Fiable",
    sectionTitle: "Un suivi académique en temps réel.",
    sectionBody: "Scannez votre badge numérique instantanément. UniCheck utilise une technologie de validation sécurisée pour garantir l'intégrité de votre présence tout au long du cursus.",
    mainBtn: "Accéder à mon espace",
    helpBtn: "Besoin d'aide ? Contactez l'administration",
    dir: "ltr"
  },
  en: {
    navBtn: "LOGIN",
    heroSub: "Your attendance simplified, your records secured.",
    badge: "Automated & Reliable",
    sectionTitle: "Real-time academic tracking.",
    sectionBody: "Scan your digital badge instantly. UniCheck uses secure validation technology to ensure the integrity of your attendance throughout the course.",
    mainBtn: "Access my space",
    helpBtn: "Need help? Contact the administration",
    dir: "ltr"
  },
  ar: {
    navBtn: "تسجيل الدخول",
    heroSub: "حضورك مبسط، وانضباطك مؤمن بشكل افتراضي.",
    badge: "آلي وموثوق",
    sectionTitle: "متابعة أكاديمية في الوقت الفعلي.",
    sectionBody: "امسح شارتك الرقمية فوراً. يستخدم UniCheck تقنية تحقق آمنة لضمان نزاهة حضورك طوال المسار الدراسي.",
    mainBtn: "الدخول إلى مساحتي",
    helpBtn: "هل تحتاج إلى مساعدة؟ اتصل بالإدارة",
    dir: "rtl"
  }
};

const LandingPage = () => {
  // Le 'tick' est le moteur unique. Il augmente de 1 toutes les 8 secondes.
  const [tick, setTick] = useState(0); 
  const langKeys = ['fr', 'en', 'ar'];

  // Calcul de la langue actuelle basée sur le tick
  const currentLangIndex = tick % 3;
  const currentLang = translations[langKeys[currentLangIndex]];

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 8000); // Changement strict toutes les 8 secondes
    return () => clearInterval(timer);
  }, []);
  const navigate = useNavigate();
  const textVariants = {
    initial: { opacity: 0, y: 15, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -15, filter: "blur(8px)" },
  };

  return (
    
    <div className="min-h-screen bg-[#fcfdfe] selection:bg-[#10b981]/30 text-[#4B5563] font-['Inter'] overflow-x-hidden">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@300;400;600&family=Noto+Sans+Arabic:wght@400;700&display=swap');
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', 'Noto Sans Arabic', sans-serif; }
          .arabic-font { font-family: 'Noto Sans Arabic', sans-serif; }
          .glass-effect { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); }
        `}
      </style>
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 sticky top-0 z-50 glass-effect shadow-sm">
        {/* LOGO : Retourne à la Landing Page au clic */}
       <Link to="/" className="flex items-center gap-3 group cursor-pointer">
         <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-md">
          <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
                <span className="font-display font-extrabold text-2xl tracking-tighter text-[#1a1c1e]">
                 Unicheck
               </span>
      </Link>
  
  <AnimatePresence mode="wait">
    <motion.button 
      key={currentLangIndex}
      variants={textVariants}
      initial="initial" 
      animate="animate" 
      exit="exit"
      onClick={() => navigate('/connexion')}
      className={`px-6 py-2.5 rounded-xl font-body font-bold text-[11px] tracking-widest bg-[#1a1c1e] text-white active:scale-95 transition-all hover:bg-black hover:shadow-lg ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}
    >
      {currentLang.navBtn}
    </motion.button>
  </AnimatePresence>
</nav>
    
    <main className="max-w-6xl mx-auto px-6 md:px-8 pt-10 pb-24">
        
        {/* HERO SECTION : Gère le 65/35 et le mélange des cartes */}
        <HeroSection 
          currentLang={currentLang} 
          langIndex={tick} // On passe le tick pour la logique de rotation
          textVariants={textVariants} 
        />

{/* Bloc Editorial */}
<section className="bg-white rounded-[3rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)] flex flex-col md:grid md:grid-cols-2 border border-gray-100/80 ring-1 ring-black/5 relative group">
  
  {/* Lueurs de fond */}
  <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
    <div className={`absolute -top-24 w-96 h-96 bg-[#10b981]/5 blur-[100px] rounded-full transition-all duration-1000 ${currentLang.dir === 'rtl' ? '-right-24' : '-left-24'}`} />
  </div>

  <div className="p-8 md:p-20 pt-16 md:pt-20 space-y-8 flex flex-col justify-center order-2 md:order-1 relative" dir={currentLang.dir}>
    
    {/* --- ZONE NOTIFICATIONS RESPONSIVE --- */}
    
    {/* DESKTOP : Notifications UI empilées en haut (Gauche ou Droite) */}
    <div className={`hidden md:flex absolute top-12 flex-col gap-3 pointer-events-none z-30 transition-all duration-1000 ${currentLang.dir === 'rtl' ? 'left-12' : 'right-12'}`}>
      
      {/* Notification Justification (Vert) */}
      <motion.div 
        animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="bg-white/95 backdrop-blur-sm shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] border border-green-100 rounded-2xl p-2.5 flex items-center gap-3 ring-1 ring-green-100"
      >
        <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
          {/* Icône Document/Fichier au lieu du Check simple */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Justified</span>
          <div className="h-1.5 w-12 bg-gray-100 rounded-full mt-1" />
        </div>
      </motion.div>

      {/* Notification Alerte (Rouge) */}
      <motion.div 
        animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="bg-white/95 backdrop-blur-sm shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] border border-red-100 rounded-2xl p-2.5 flex items-center gap-3 ring-1 ring-red-100 ml-4"
      >
        <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-red-700 uppercase tracking-wider">Alert</span>
          <div className="h-1.5 w-12 bg-gray-100 rounded-full mt-1" />
        </div>
      </motion.div>
    </div>

    {/* MOBILE : Barre de Notification Fine en Haut du Bloc Texte */}
    <div className={`md:hidden absolute top-0 left-0 w-full p-4 pointer-events-none z-30 transition-all duration-1000 ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}>
      <motion.div
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="bg-gray-50 border border-gray-100 rounded-2xl p-2.5 px-4 flex items-center justify-center gap-6 shadow-inner"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center text-white text-[10px]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#006c49]">✓ Justified</span>
        </div>
        <div className="w-[1px] h-3 bg-gray-200 rounded-full" />
        <div className="flex items-center gap-2 opacity-60">
          <div className="w-5 h-5 bg-red-500 rounded-md flex items-center justify-center text-white text-[10px]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-700">✕ Alert</span>
        </div>
      </motion.div>
    </div>

    {/* --- CONTENU TEXTE --- */}
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentLangIndex} 
        variants={textVariants} 
        initial="initial" 
        animate="animate" 
        exit="exit" 
        className="space-y-6 md:space-y-8 relative z-10 pt-4 md:pt-0"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-body text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-[#006c49] bg-[#10b981]/10 w-fit px-4 md:px-5 py-1.5 md:py-2 rounded-full block ring-1 ring-[#10b981]/20 mb-6">
            {currentLang.badge}
          </span>

          <h2 className={`font-display text-4xl md:text-6xl font-extrabold text-[#1a1c1e] leading-[1.1] ${currentLang.dir === 'rtl' ? 'arabic-font text-right' : 'text-left'}`}>
            {currentLang.sectionTitle}
          </h2>

          <p className={`mt-8 font-body text-base md:text-xl leading-[1.8] text-gray-500 font-light max-w-lg ${currentLang.dir === 'rtl' ? 'arabic-font text-right' : 'text-left'}`}>
            {currentLang.sectionBody}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>

  {/* Partie AnimatedPhone */}
  <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center order-1 md:order-2 overflow-hidden min-h-[450px] md:min-h-[600px] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-60" />
      <AnimatedPhone />
  </div>
</section>

        {/* Boutons d'Action */}
        <div className="mt-20 flex flex-col items-center gap-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentLangIndex} variants={textVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center gap-8 w-full">
            <button 
  onClick={() => navigate('/connexion')}
  className={`w-full md:w-auto px-16 py-6 bg-[#1a1c1e] rounded-[2rem] font-display font-extrabold text-white text-xl md:text-2xl shadow-xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}
>
  {currentLang.mainBtn}
</button>
              <button className={`font-body text-sm font-semibold opacity-60 hover:text-[#006c49] flex items-center gap-3 group p-3 transition-colors ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}>
                {currentLang.dir === 'ltr' && <span>{currentLang.helpBtn}</span>}
                <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-[#006c49]">
                  {currentLang.dir === 'rtl' ? '←' : '→'}
                </span>
                {currentLang.dir === 'rtl' && <span>{currentLang.helpBtn}</span>}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <footer className="py-12 border-t border-gray-100 text-center opacity-30 font-body text-[10px] tracking-[0.2em] uppercase">
        © 2026 UniCheck • Designed for Excellence
      </footer>
    </div>
  );
};

export default LandingPage;