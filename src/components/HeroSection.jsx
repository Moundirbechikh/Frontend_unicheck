import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = ({ currentLang, langIndex, textVariants }) => {
  
  const cardsData = [
    {
      id: 0,
      title: { fr: "Registre Professeur", en: "Teacher Registry", ar: "سجل الأساتذة" },
      desc: { 
        fr: "Suivi détaillé des présences avec validation instantanée (✓/✕).", 
        en: "Detailed attendance tracking with instant validation (✓/✕).", 
        ar: "متابعة دقيقة للحضور avec التحقق الفوري." 
      },
      icon: (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] shadow-sm">👤</div>
              <div className="h-1.5 w-16 bg-gray-200 rounded-full" />
              <div className={`ml-auto font-bold text-[10px] ${i === 2 ? 'text-red-500' : 'text-green-500'}`}>
                {i === 2 ? '✕' : '✓'}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 1,
      title: { fr: "Agenda Quotidien", en: "Daily Agenda", ar: "الأجندة Daily Agenda" },
      desc: { 
        fr: "Visualisez vos séances passées et présentes par jour.", 
        en: "View your past and current sessions day by day.", 
        ar: "عرض حصصك الماضية والحالية حسب اليوم." 
      },
      icon: (
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-inner flex flex-col items-center">
          <div className="text-[10px] font-bold text-red-500 mb-1 uppercase">Octobre</div>
          <div className="text-2xl font-black text-[#1a1c1e]">10</div>
          <div className="w-full h-1 bg-gray-100 rounded-full mt-2" />
          <div className="w-2/3 h-1 bg-[#10b981]/30 rounded-full mt-1" />
        </div>
      )
    },
    {
      id: 2,
      title: { fr: "Centre d'Alertes", en: "Alert Center", ar: "مركز التنبيهات" },
      desc: { 
        fr: "Notifications critiques sur les absences et validations.", 
        en: "Critical notifications about absences and validations.", 
        ar: "تنبيهات هامة حول الغيابات والتحقق." 
      },
      icon: (
        <div className="space-y-2">
          <div className="bg-red-50 p-2 rounded-lg border-l-4 border-red-500 flex items-center gap-2">
            <span className="text-xs">⚠️</span>
            <div className="h-1 w-12 bg-red-200 rounded-full" />
          </div>
          <div className="bg-green-50 p-2 rounded-lg border-l-4 border-green-500 flex items-center gap-2">
            <span className="text-xs">✓</span>
            <div className="h-1 w-12 bg-green-200 rounded-full" />
          </div>
        </div>
      )
    }
  ];

  const langKeys = ['fr', 'en', 'ar'];
  const currentLangKey = langKeys[langIndex % 3]; 
  const activeCardIndex = (langIndex + Math.floor(langIndex / 3)) % 3;
  const activeCard = cardsData[activeCardIndex];

  return (
    <div className="flex flex-col lg:flex-row items-center min-h-[80vh] mb-20 relative overflow-hidden lg:overflow-visible">
      
      {/* CÔTÉ GAUCHE : 65% width (CENTREÉ) */}
      <div className="w-full lg:w-[65%] flex flex-col items-center text-center z-10 lg:pr-12 relative min-h-[500px] justify-center px-4">
        
        {/* --- PARTICULES FLOTTANTES (Plus grandes) --- */}
        <div className="absolute inset-0 pointer-events-none -z-20">
          
          {/* 1. CHECK VERT (Légèrement plus grand) */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[5%] right-[2%] lg:right-[15%] w-24 h-24 md:w-28 md:h-28 bg-white/60 backdrop-blur-md border border-white shadow-[0_8px_30px_rgba(16,185,129,0.15)] rounded-2xl flex items-center justify-center text-5xl md:text-6xl text-green-500 font-black blur-[0.5px]"
          >
            ✓
          </motion.div>

          {/* 2. CROIX ROUGE (Légèrement plus grand) */}
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[5%] left-[2%] lg:left-[10%] w-20 h-20 md:w-24 md:h-24 bg-white/60 backdrop-blur-md border border-white shadow-[0_8px_30px_rgba(239,68,68,0.15)] rounded-2xl flex items-center justify-center text-4xl md:text-5xl text-red-500 font-black"
          >
            ✕
          </motion.div>

          {/* 3. CHECKLIST NOIRE (Légèrement plus grand) */}
          <motion.div 
            animate={{ y: [0, -10, 0], x: [0, 5, 0], rotate: [-5, 0, -5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] left-[-2%] lg:left-[2%] w-24 h-24 md:w-28 md:h-28 bg-white/70 backdrop-blur-lg border border-white shadow-xl rounded-[1.8rem] flex items-center justify-center"
          >
            <svg className="w-12 h-12 md:w-14 md:h-14 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </motion.div>

          {/* 4. AGENDA (Légèrement plus grand) */}
          <motion.div 
            animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[20%] right-[-2%] lg:right-[10%] w-20 h-20 md:w-24 md:h-24 bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl flex items-center justify-center text-4xl md:text-5xl blur-[2px]"
          >
            📅
          </motion.div>

          {/* 5. SCAN/QR (Légèrement plus grand) */}
          <motion.div 
            animate={{ y: [0, 10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[10%] left-[5%] lg:left-[20%] w-16 h-16 md:w-20 md:h-20 bg-[#1a1c1e]/5 backdrop-blur-md border border-[#1a1c1e]/10 shadow-sm rounded-xl flex items-center justify-center"
          >
            <svg className="w-10 h-10 md:w-12 md:h-12 text-[#1a1c1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8V6a2 2 0 012-2h2M3 16v2a2 2 0 002 2h2M21 8V6a2 2 0 00-2-2h-2M21 16v2a2 2 0 01-2 2h-2M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
            </svg>
          </motion.div>
        </div>

        {/* --- ZONE CENTRALE (LOGO + ÉCRITURE) --- */}
        <div className="relative z-20 max-w-2xl flex flex-col items-center">
          <div className="absolute -inset-10 bg-gradient-to-r from-white via-white/80 to-transparent blur-xl -z-10 rounded-[4rem] pointer-events-none" />

          {/* LOGO NOIR (Centré) */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-8 mx-auto w-max">
            <div className="absolute inset-0 bg-[#10b981]/20 blur-[60px] rounded-full animate-pulse"></div>
            <div className="relative w-28 h-28 md:w-32 md:h-32 bg-[#1a1c1e] rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 border border-white/5">
              <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 24 24" fill="none" stroke="white">
                <g className="stroke-[2] md:stroke-[2.2]">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </g>
              </svg>
            </div>
          </motion.div>

          <h1 className="font-display text-5xl md:text-[6rem] lg:text-[6.5rem] font-[900] text-[#1a1c1e] tracking-tighter mb-6 leading-[1] drop-shadow-sm text-center">
            UniCheck QR
          </h1>

          <AnimatePresence mode="wait">
            <motion.p 
              key={currentLangKey} 
              variants={textVariants}
              initial="initial" animate="animate" exit="exit"
              dir={currentLang.dir}
              className={`font-body text-xl md:text-2xl lg:text-3xl font-light leading-relaxed opacity-75 text-center ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}
            >
              {currentLang.heroSub}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* CÔTÉ DROIT : CARTE DYNAMIQUE */}
      <div className="w-full lg:w-[35%] relative flex justify-center lg:justify-end items-center h-[500px] mt-16 lg:mt-0">
        <div className="absolute right-[-30%] lg:right-[-75%] w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-t-full rounded-l-full bg-black shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10b981]/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#006c49]/30 blur-[120px] rounded-full" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={langIndex}
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-20 w-[280px] md:w-80 bg-white p-7 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] border border-white"
            dir={currentLang.dir}
          >
            <div className="flex items-center justify-between mb-6">
              <span className={`text-[10px] font-black uppercase tracking-[0.15em] text-[#006c49] ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}>
                {activeCard.title[currentLangKey]}
              </span>
              <div className="w-2 h-2 bg-[#10b981] rounded-full" />
            </div>
            <div className="mb-6">{activeCard.icon}</div>
            <p className={`text-sm leading-relaxed text-gray-500 font-medium ${currentLang.dir === 'rtl' ? 'arabic-font' : ''}`}>{activeCard.desc[currentLangKey]}</p>
            <div className="mt-8 flex gap-1.5 justify-center">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === activeCardIndex ? 'w-8 bg-[#1a1c1e]' : 'w-2 bg-gray-100'}`} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroSection;