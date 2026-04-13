import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Connexion = () => {
  // 1. États pour les champs de saisie
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 2. Logique de redirection "admin/admin"
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Vérification simple (admin / admin)
    if (email === '1' && password === '1') {
      navigate('/student'); // Direction l'espace étudiant
    } else     if (email === '2' && password === '2') {
      navigate('/prof')
    } else     if (email === '3' && password === '3') {
      navigate('/admin')
    } else {
      alert("Accès refusé ❌. Utilisez 'admin' et 'admin' pour tester.");
    }
  };
  

  // Animations Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#fcfdfe] selection:bg-[#10b981]/30 text-[#4B5563] font-['Inter'] flex flex-col lg:flex-row">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@300;400;500;600&display=swap');
          .font-display { font-family: 'Manrope', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
        `}
      </style>

      {/* --- PARTIE GAUCHE : FORMULAIRE --- */}
      <div className="w-full lg:w-[55%] min-h-screen lg:min-h-0 h-full flex flex-col relative z-10 px-8 md:px-16 lg:px-24 py-12 justify-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer absolute top-12">
          <div className="w-9 h-9 bg-[#006c49] rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-md">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tighter text-[#1a1c1e]">
            Unicheck
          </span>
        </Link>

        <motion.div 
          variants={containerVariants} initial="hidden" animate="show"
          className="max-w-md w-full mx-auto"
        >
          {/* En-tête */}
          <motion.div variants={itemVariants} className="mb-10 mt-10">
            <h1 className="font-display text-4xl md:text-5xl font-[900] text-[#1a1c1e] tracking-tighter leading-tight mb-3">
              Bon retour.
            </h1>
            <p className="font-body text-gray-500 font-medium">
              Connectez-vous pour accéder à votre espace d'assiduité.
            </p>
          </motion.div>

          {/* FORMULAIRE ACTIF */}
          <motion.form variants={itemVariants} className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-[#1a1c1e] ml-2">Identifiant (admin)</label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez 'admin'"
                className="w-full bg-gray-50 border border-gray-200 text-[#1a1c1e] text-sm rounded-[1.2rem] px-5 py-4 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 transition-all font-medium placeholder:text-gray-400"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-2 mr-2">
                <label className="text-[13px] font-bold text-[#1a1c1e]">Mot de passe (admin)</label>
                <button type="button" className="text-[12px] font-semibold text-[#006c49] hover:text-[#10b981] transition-colors">Oublié ?</button>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 text-[#1a1c1e] text-sm rounded-[1.2rem] px-5 py-4 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 transition-all font-medium tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-4 px-8 py-4 bg-[#1a1c1e] rounded-[1.5rem] font-display font-extrabold text-white text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-black hover:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Se connecter
            </button>
          </motion.form>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Problème d'accès ? <a href="#" className="text-[#1a1c1e] font-bold underline decoration-2 decoration-[#10b981]/30 hover:decoration-[#10b981] transition-all">Contacter l'administration</a>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* --- PARTIE DROITE : VISUEL PREMIUM --- */}
      <div className="hidden lg:flex w-[45%] h-full bg-black relative overflow-hidden items-center justify-center p-12">
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10b981]/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#006c49]/30 blur-[120px] rounded-full" />
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        {/* Floating 3D Card */}
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-full max-w-sm bg-white/10 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/20 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]"
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
      </div>
    </div>
  );
};

export default Connexion;