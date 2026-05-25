import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ArrowRight, Eye, EyeOff,
  CheckCircle2, Lock, Users, GraduationCap, Loader2
} from 'lucide-react';

// ── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.35, ease: "easeOut" } },
  exit:   { opacity: 0, y: -10, filter: "blur(2px)", transition: { duration: 0.2 } },
};
const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

// ── Spécialités et groupes ────────────────────────────────────────────────────
const SPECIALITES = {
  "SITW":           ["G1", "G2"],
  "1ère Ingénieur": ["G1", "G2", "G3", "G4", "G5", "G6", "G7"],
};

// ── Input commun (Rendu légèrement plus compact) ─────────────────────────────
const Field = ({ label, type = "text", value, onChange, placeholder, disabled, right, error }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400">{label}</label>
    <div className="relative">
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled}
        className={`w-full bg-[#f1f4f2] border text-[#1a1c1e] text-sm rounded-xl px-4 py-2.5 pr-${right ? '10' : '4'}
                   focus:outline-none focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10
                   disabled:opacity-50 transition-all font-medium placeholder:text-gray-400 font-body
                   ${error ? 'border-red-300' : 'border-transparent'}`}
      />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
    {error && <p className="text-[10px] text-red-500 font-semibold pl-1 leading-tight">{error}</p>}
  </div>
);

// ── Bouton principal ──────────────────────────────────────────────────────────
const Btn = ({ onClick, disabled, loading, children }) => (
  <button onClick={onClick} disabled={disabled || loading}
    className="w-full py-3 bg-[#1a1c1e] text-white rounded-xl font-display font-black text-sm
               hover:bg-[#006c49] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
               flex items-center justify-center gap-2 group shadow-md shadow-black/5 mt-1">
    {loading
      ? <><Loader2 size={15} className="animate-spin"/> Chargement...</>
      : children
    }
  </button>
);

// ════════════════════════════════════════════════════════════════════════════
// FLOW PROF
// ════════════════════════════════════════════════════════════════════════════
const FlowProf = ({ onSuccess }) => {
  const [step,       setStep]      = useState('code');
  const [code,       setCode]      = useState('');
  const [codeErr,    setCodeErr]   = useState('');
  const [checking,   setChecking]  = useState(false);
  const [form,       setForm]      = useState({ nom: '', prenom: '', email: '', password: '' });
  const [showPwd,    setShowPwd]   = useState(false);
  const [loading,    setLoading]   = useState(false);
  const [apiError,   setApiError]  = useState('');

  const verifierCode = async () => {
    if (!code.trim()) { setCodeErr("Saisissez le code."); return; }
    setChecking(true); setCodeErr('');
    try {
      const res = await fetch('https://backend-unicheck.onrender.com/api/inscription/verifier-code-prof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (data.valide) {
        setStep('form');
      } else {
        setCodeErr("Code incorrect. Contactez l'administration.");
      }
    } catch {
      setCodeErr("Erreur de connexion au serveur.");
    } finally {
      setChecking(false);
    }
  };

  // Dans FlowEtudiant — remplacer handleSubmit

// Dans FlowProf — remplacer handleSubmit
const handleSubmit = async () => {
  setLoading(true);
  setApiError('');

  console.log("👨‍🏫 [INSCRIPTION PROF] Tentative de création du compte professeur...");
  console.log("👨‍🏫 [INSCRIPTION PROF] Email :", form.email);

  try {
    const res = await fetch(
      'https://backend-unicheck.onrender.com/api/inscription/professeur',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      }
    );

    console.log("👨‍🏫 [INSCRIPTION PROF] Réponse HTTP status :", res.status);
    const data = await res.json();
    console.log("👨‍🏫 [INSCRIPTION PROF] Réponse JSON :", data);

    if (!data.success) throw new Error(data.message);

    console.log("✅ [INSCRIPTION PROF] Compte créé. Email de bienvenue en cours d'envoi.");
    onSuccess?.();
  } catch (e) {
    console.error("❌ [INSCRIPTION PROF] Erreur :", e.message);
    setApiError(e.message || "Erreur serveur.");
  } finally {
    setLoading(false);
  }
};

  if (step === 'code') return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={fadeUp}>
        <h2 className="text-3xl font-display font-black text-[#1a1c1e] tracking-tighter">Accès Professeur</h2>
        <p className="text-sm text-gray-500 font-body mt-1">Saisissez le code fourni par l'administration.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400">Code d'accès</label>
          <div className="relative">
            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password" value={code}
              onChange={e => { setCode(e.target.value); setCodeErr(''); }}
              onKeyDown={e => e.key === 'Enter' && verifierCode()}
              placeholder="••••••••"
              className={`w-full bg-[#f1f4f2] border text-[#1a1c1e] text-sm rounded-xl pl-10 pr-4 py-2.5
                         focus:outline-none focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10
                         transition-all font-medium tracking-widest placeholder:tracking-normal placeholder:text-gray-400 font-body
                         ${codeErr ? 'border-red-300' : 'border-transparent'}`}
            />
          </div>
          {codeErr && <p className="text-[11px] text-red-500 font-semibold pl-1">{codeErr}</p>}
        </div>
        <Btn onClick={verifierCode} loading={checking}>
          Valider le code <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
        </Btn>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3 pb-4">
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-[#d1f4e0] text-[#006c49] rounded-xl flex items-center justify-center shrink-0">
          <CheckCircle2 size={16} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">Créer votre compte</h2>
          <p className="text-[10px] text-[#006c49] font-bold uppercase tracking-widest mt-1">Code validé</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <Field label="Nom"    value={form.nom}    onChange={e => setForm({...form, nom: e.target.value})}    placeholder="Benali" />
        <Field label="Prénom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} placeholder="Yacine" />
      </motion.div>
      <motion.div variants={fadeUp}>
        <Field label="Email" type="email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} placeholder="prof@univ.dz" />
      </motion.div>
      <motion.div variants={fadeUp}>
        <Field label="Mot de passe" type={showPwd ? 'text' : 'password'}
          value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          placeholder="••••••••"
          right={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-[#006c49]">
              {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          }
        />
      </motion.div>
      {apiError && <p className="text-[11px] text-red-500 font-semibold">{apiError}</p>}
      <motion.div variants={fadeUp} className="pt-2">
        <Btn onClick={handleSubmit} loading={loading}
          disabled={!form.nom || !form.prenom || !form.email || !form.password}>
          Créer mon compte <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform"/>
        </Btn>
      </motion.div>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// FLOW ÉTUDIANT
// ════════════════════════════════════════════════════════════════════════════
const FlowEtudiant = ({ onSuccess }) => {
  const [step,           setStep]           = useState(1);
  const [etudiants,      setEtudiants]      = useState([]);
  const [fetchLoading,   setFetchLoading]   = useState(true);
  const [search,         setSearch]         = useState('');
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [selected,       setSelected]       = useState(null);
  const [matricule,      setMatricule]      = useState('');
  const [matriculeError, setMatriculeError] = useState('');
  const [verifyLoading,  setVerifyLoading]  = useState(false);
  const [form,           setForm]           = useState({ email: '', password: '', specialite: '', groupe: '' });
  const [showPwd,        setShowPwd]        = useState(false);
  const [saveLoading,    setSaveLoading]    = useState(false);
  const [apiError,       setApiError]       = useState('');
  const dropRef  = useRef(null);
  const inputRef = useRef(null);

  // Fonction centralisée pour les headers (sécurisée)
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, []);

  useEffect(() => {
    fetch('https://backend-unicheck.onrender.com/api/inscription/etudiants-sans-compte', {
      headers: getAuthHeaders()
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEtudiants(data))
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search.trim().length === 0 ? [] : etudiants.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (etudiant) => {
    setSelected(etudiant);
    setSearch(`${etudiant.prenom} ${etudiant.nom}`);
    setShowDropdown(false);
    setMatricule('');
    setMatriculeError('');
    setStep(2);
  };

  const verifierMatricule = async () => {
    if (!matricule.trim()) return;
    setVerifyLoading(true); setMatriculeError('');
    try {
      const res = await fetch('https://backend-unicheck.onrender.com/api/inscription/verifier-identite', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ etudiantId: selected.id, matricule: matricule.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valide) setStep(3);
      else setMatriculeError("Code incorrect. Réessayez.");
    } catch {
      setMatriculeError("Erreur de connexion au serveur.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaveLoading(true);
    setApiError('');
  
    console.log("📝 [INSCRIPTION] Tentative de finalisation du compte...");
    console.log("📝 [INSCRIPTION] Étudiant ID :", selected?.id);
    console.log("📝 [INSCRIPTION] Email saisi :", form.email);
    console.log("📝 [INSCRIPTION] Spécialité :", form.specialite, "| Groupe :", form.groupe);
  
    try {
      const res = await fetch(
        `https://backend-unicheck.onrender.com/api/inscription/etudiant/${selected.id}/finaliser`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(form),
        }
      );
  
      console.log("📝 [INSCRIPTION] Réponse HTTP status :", res.status);
      const data = await res.json();
      console.log("📝 [INSCRIPTION] Réponse JSON :", data);
  
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de la création.");
      }
  
      console.log("✅ [INSCRIPTION] Compte créé avec succès. Un email de bienvenue est envoyé en arrière-plan.");
      onSuccess?.();
  
    } catch (e) {
      console.error("❌ [INSCRIPTION] Erreur :", e.message);
      setApiError(e.message);
    } finally {
      setSaveLoading(false);
    }
  };
  

  const groupes   = SPECIALITES[form.specialite] || [];
  const stepLabel = ['Identification', 'Vérification', 'Finalisation'];

  return (
    <div className="space-y-4">
      {/* Progress bar plus compacte */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3].map(n => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-1.5 transition-all ${step >= n ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all
                ${step > n  ? 'bg-[#006c49] text-white' :
                  step === n ? 'bg-[#1a1c1e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > n ? <CheckCircle2 size={10}/> : n}
              </div>
              <span className={`text-[9px] font-black font-display uppercase tracking-widest hidden sm:block
                ${step === n ? 'text-[#1a1c1e]' : 'text-gray-400'}`}>
                {stepLabel[n - 1]}
              </span>
            </div>
            {n < 3 && <div className={`flex-1 h-[1.5px] rounded-full transition-all duration-500 mx-1 ${step > n ? 'bg-[#006c49]' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="s1" variants={stagger} initial="hidden" animate="show" exit="exit" className="space-y-4">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl font-display font-black text-[#1a1c1e] tracking-tighter">Qui êtes-vous ?</h2>
              <p className="text-sm text-gray-500 font-body mt-1">Tapez votre nom et sélectionnez-le dans la liste.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="relative" ref={dropRef}>
              <label className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400 block mb-1">
                Nom & Prénom
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <input
                  ref={inputRef}
                  type="text" value={search}
                  onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={fetchLoading ? "Chargement de la liste..." : "Ex: Benali Yacine"}
                  disabled={fetchLoading}
                  className="w-full bg-[#f1f4f2] border border-transparent text-[#1a1c1e] text-sm rounded-xl pl-10 pr-4 py-2.5
                             focus:outline-none focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10
                             transition-all font-medium placeholder:text-gray-400 font-body"
                />
                {fetchLoading && (
                  <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#006c49] animate-spin" />
                )}
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {showDropdown && search.trim().length > 0 && !fetchLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-48 overflow-y-auto"
                  >
                    {filtered.length === 0 ? (
                      <div className="px-4 py-4 text-center">
                        <p className="text-[10px] text-gray-400 font-display font-black uppercase tracking-widest">
                          Aucun résultat pour "{search}"
                        </p>
                      </div>
                    ) : filtered.map(e => (
                      <button
                        key={e.id}
                        onClick={() => handleSelect(e)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#f1f4f2] transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-[#1a1c1e] text-white rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black font-display">
                          {e.prenom[0]}{e.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a1c1e] font-display">{e.prenom} {e.nom}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {search.trim().length === 0 && !fetchLoading && (
              <motion.p variants={fadeUp} className="text-[11px] text-gray-400 font-body text-center pt-2">
                {etudiants.length} étudiant(s) en attente d'inscription
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="s2" variants={stagger} initial="hidden" animate="show" exit="exit" className="space-y-4">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl font-display font-black text-[#1a1c1e] tracking-tighter">Vérification</h2>
              <p className="text-sm text-gray-500 font-body mt-1">
                Bonjour <span className="font-bold text-[#1a1c1e]">{selected?.prenom}</span>, confirmez votre identité.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-3 bg-[#f1f4f2] rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-[#1a1c1e] text-white rounded-lg flex items-center justify-center text-[10px] font-black font-display shrink-0">
                {selected?.prenom[0]}{selected?.nom[0]}
              </div>
              <div>
                <p className="text-sm font-black text-[#1a1c1e] font-display leading-none">
                  {selected?.prenom} {selected?.nom}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="space-y-1">
                <label className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400">
                  Code d'identification
                </label>
                <input
                  type="password" value={matricule}
                  onChange={e => { setMatricule(e.target.value); setMatriculeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && verifierMatricule()}
                  placeholder="••••••••••"
                  className={`w-full bg-[#f1f4f2] border text-[#1a1c1e] text-sm rounded-xl px-4 py-2.5
                             focus:outline-none focus:border-[#006c49] focus:ring-4 focus:ring-[#006c49]/10
                             transition-all font-medium placeholder:text-gray-400 font-body tracking-widest
                             ${matriculeError ? 'border-red-300' : 'border-transparent'}`}
                />
                {matriculeError && (
                  <p className="text-[10px] text-red-500 font-semibold pl-1">{matriculeError}</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-2 pt-2">
              <button
                onClick={() => { setStep(1); setSearch(''); setSelected(null); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-display font-black text-xs hover:bg-gray-200 transition-all">
                Retour
              </button>
              <Btn onClick={verifierMatricule} disabled={!matricule} loading={verifyLoading}>
                Vérifier <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
              </Btn>
            </motion.div>
          </motion.div>
        )}

        {/* ── STEP 3 : COMPACTÉE ─────────────────────────────────────────── */}
        {step === 3 && (
          <motion.div key="s3" variants={stagger} initial="hidden" animate="show" className="space-y-3 pb-2">
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-[#d1f4e0] text-[#006c49] rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} strokeWidth={2.5}/>
              </div>
              <div>
                <h2 className="text-xl font-display font-black text-[#1a1c1e] tracking-tighter leading-none">
                  Finalisation
                </h2>
                <p className="text-[9px] text-[#006c49] font-bold uppercase tracking-widest mt-0.5">Identité confirmée</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Colonne 1 : Email & Mdp */}
              <div className="space-y-3">
                <Field label="Email" type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="etudiant@univ.dz" />
                
                <Field label="Mot de passe" type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 6 caractères"
                  error={form.password.length > 0 && form.password.length < 6 ? "Trop court" : ""}
                  right={
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-[#006c49]">
                      {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  }
                />
              </div>

              {/* Colonne 2 : Spécialité & Groupe */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400">Spécialité</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(SPECIALITES).map(sp => (
                      <button key={sp} type="button"
                        onClick={() => setForm({...form, specialite: sp, groupe: ''})}
                        className={`py-2 rounded-xl text-[11px] font-display font-black transition-all border-2
                          ${form.specialite === sp ? 'bg-[#1a1c1e] text-white border-[#1a1c1e]' : 'bg-[#f1f4f2] text-gray-500 border-transparent'}`}>
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 h-[60px]"> {/* Hauteur fixe pour éviter le saut */}
                  <label className={`text-[11px] font-black font-display uppercase tracking-widest transition-colors ${form.specialite ? 'text-gray-400' : 'text-transparent'}`}>Groupe</label>
                  <AnimatePresence>
                    {form.specialite && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-1.5">
                        {groupes.map(g => (
                          <button key={g} type="button"
                            onClick={() => setForm({...form, groupe: g})}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-display font-black transition-all border-2
                              ${form.groupe === g ? 'bg-[#006c49] text-white border-[#006c49]' : 'bg-[#f1f4f2] text-gray-500 border-transparent hover:border-[#006c49]/30'}`}>
                            {g}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {apiError && <p className="text-[11px] text-red-500 font-semibold text-center">{apiError}</p>}

            <motion.div variants={fadeUp} className="pt-2">
              <Btn onClick={handleSubmit} loading={saveLoading}
                disabled={!form.email || form.password.length < 6 || !form.specialite || !form.groupe}>
                Terminer l'inscription <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
              </Btn>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
const Inscription = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState(null);
  const [done, setDone] = useState(false);

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 py-4">
      <div className="w-14 h-14 bg-[#d1f4e0] text-[#006c49] rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 size={28} strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-3xl font-display font-black text-[#1a1c1e] tracking-tighter">Compte créé !</h2>
        <p className="text-xs text-gray-500 font-body mt-1.5 max-w-[250px] mx-auto">
          {role === 'etudiant'
            ? "Votre compte est actif. Vous pouvez maintenant vous connecter à votre espace."
            : "Votre compte professeur est actif et sécurisé."}
        </p>
      </div>
      <Btn onClick={onSwitchToLogin}>
        Se connecter <ArrowRight size={15}/>
      </Btn>
    </motion.div>
  );

  return (
    // Ce div s'assure que le contenu pousse en bas mais ne dépasse pas si possible
    <div className="w-full space-y-4">

      {/* Sélection du profil */}
      {!role && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          <motion.div variants={fadeUp}>
            <h2 className="text-4xl font-display font-black text-[#1a1c1e] tracking-tighter leading-tight">
              Créer un compte.
            </h2>
            <p className="text-sm text-gray-500 font-body mt-1">Sélectionnez votre profil pour commencer.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            {[
              { key: 'prof',     icon: GraduationCap, label: 'Professeur', sub: 'Code requis' },
              { key: 'etudiant', icon: Users,         label: 'Étudiant',   sub: 'Via liste officielle' },
            ].map(({ key, icon: Icon, label, sub }) => (
              <motion.button key={key}
                whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setRole(key)}
                className="group bg-[#f1f4f2] hover:bg-[#1a1c1e] border-2 border-transparent hover:border-[#006c49]
                           rounded-[1.5rem] p-4 text-left transition-all duration-300 space-y-2.5">
                <div className="w-9 h-9 bg-white group-hover:bg-[#006c49] rounded-xl flex items-center justify-center shadow-sm transition-colors duration-300">
                  <Icon size={16} className="text-[#1a1c1e] group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-display font-black text-[#1a1c1e] group-hover:text-white transition-colors duration-300 text-sm">
                    {label}
                  </p>
                  <p className="text-[9px] font-display font-black uppercase tracking-widest text-gray-400 group-hover:text-white/50 transition-colors mt-0.5">
                    {sub}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Flow sélectionné */}
      {role && (
        <AnimatePresence mode="wait">
          <motion.div key={role}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>

            <button onClick={() => setRole(null)}
              className="mb-4 text-[10px] font-black font-display uppercase tracking-widest text-gray-400 hover:text-[#006c49] transition-colors flex items-center gap-1">
              ← Changer de profil
            </button>

            {role === 'prof'     && <FlowProf     onSuccess={() => setDone(true)} />}
            {role === 'etudiant' && <FlowEtudiant onSuccess={() => setDone(true)} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Inscription;