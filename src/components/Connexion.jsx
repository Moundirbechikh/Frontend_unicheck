import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Connexion = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://backend-unicheck.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.clear();
        localStorage.setItem('token', data.token); 
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userLastName', data.nom);
        localStorage.setItem('userFirstName', data.prenom);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', `${data.prenom} ${data.nom}`);

        if (data.role === 'etudiant') navigate('/student');
        else if (data.role === 'prof') navigate('/prof');
        else if (data.role === 'admin') navigate('/admin');
      } else {
        alert(data.message || "Identifiants incorrects ❌");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div initial="hidden" animate="show" className="w-full max-w-md mx-auto">
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-[900] text-[#1a1c1e] tracking-tighter leading-tight mb-3">
          Bon retour.
        </h1>
        <p className="font-body text-gray-500 font-medium">
          Connectez-vous pour accéder à votre espace d'assiduité.
        </p>
      </motion.div>

      <motion.form variants={itemVariants} className="space-y-5" onSubmit={handleLogin}>
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#1a1c1e] ml-2">Identifiant (Email)</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@ecole.dz"
            disabled={isLoading}
            className="w-full bg-gray-50 border border-gray-200 text-[#1a1c1e] text-sm rounded-[1.2rem] px-5 py-4 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 transition-all font-medium placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-2 mr-2">
            <label className="text-[13px] font-bold text-[#1a1c1e]">Mot de passe</label>
            <button type="button" className="text-[12px] font-semibold text-[#006c49] hover:text-[#10b981] transition-colors">Oublié ?</button>
          </div>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full bg-gray-50 border border-gray-200 text-[#1a1c1e] text-sm rounded-[1.2rem] px-5 py-4 focus:outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 transition-all font-medium tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full mt-4 px-8 py-4 bg-[#1a1c1e] rounded-[1.5rem] font-display font-extrabold text-white text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black hover:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:translate-y-0'}`}
        >
          {isLoading ? "Vérification..." : "Se connecter"}
        </button>
      </motion.form>

      <motion.div variants={itemVariants} className="mt-10 text-center">
  <p className="text-sm text-gray-500 font-medium">
    Problème d'accès ?{' '}
    <a 
      href="mailto:unickeckalerte@gmail.com" 
      className="text-[#1a1c1e] font-bold underline decoration-2 decoration-[#10b981]/30 hover:decoration-[#10b981] transition-all"
    >
      Contacter l'administration
    </a>
  </p>
</motion.div>
    </motion.div>
  );
};

export default Connexion;