import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Zap, Clock, FileWarning, ArrowUpRight,
  PlayCircle, CalendarDays, GraduationCap, BookOpen, MapPin
} from 'lucide-react';
import ActiveAttendanceSession from './ActiveAttendanceSession';

const ProfDashboard = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [prochainCours,   setProchainCours]   = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [isStarting,      setIsStarting]      = useState(false);
  const [userName,        setUserName]        = useState('');
  const [profStats,       setProfStats]       = useState({
    presenceMoyenne: '--',
    justifsAttente:  '--',
    heuresAssurees:  '--',
  });

  const fetchDashboardData = async () => {
    const storedId = localStorage.getItem('userId') || 2;
    const token    = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    const headers = {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      setLoading(true);

      // ── Prochain cours ─────────────────────────────────────────────────
      const resCours = await fetch(
        `https://backend-unicheck.onrender.com/api/seances/prochain/${storedId}`, { headers }
      );
      if (resCours.ok && resCours.status !== 204) {
        const data = await resCours.json();
        setProchainCours(data);

        // Si la séance est déjà active (retour après navigation)
        if (data?.estActive) setIsSessionActive(true);
      } else {
        setProchainCours(null);
      }

      // ── Stats prof ─────────────────────────────────────────────────────
      const resStats = await fetch(
        `https://backend-unicheck.onrender.com/api/professeurs/${storedId}/stats`, { headers }
      );
      if (resStats.ok) setProfStats(await resStats.json());

    } catch (err) {
      console.error("Erreur API Dashboard :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || "Enseignant");
    fetchDashboardData();
  }, []);

  const handleLancerAppel = () => {
    setIsStarting(true);
    const token = localStorage.getItem('token');

    if (!("geolocation" in navigator)) {
      alert("Géolocalisation non supportée."); setIsStarting(false); return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://backend-unicheck.onrender.com/api/seances/${prochainCours?.id}/lancer`,
            {
              method: 'PUT',
              headers: {
                'Content-Type':  'application/json',
                Authorization:   `Bearer ${token}`,
              },
              body: JSON.stringify({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            }
          );
          if (res.ok) {
            setIsSessionActive(true);
          } else {
            const err = await res.text();
            alert("Erreur : " + err);
          }
        } catch (err) {
          alert("Impossible de contacter le serveur.");
        } finally {
          setIsStarting(false);
        }
      },
      () => {
        alert("Vous devez autoriser la localisation.");
        setIsStarting(false);
      }
    );
  };

  const formatHeure = (dateStr) => {
    if (!dateStr) return '--h--';
    return new Date(dateStr)
      .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      .replace(':', 'h');
  };

  const formatDateLongue = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  };

  // ── Titre du cours dynamique ───────────────────────────────────────────
  const renderTitle = () => {
    // Utilise le DTO formaté par le backend
    const libelle = prochainCours?.cours?.libelle
                 || prochainCours?.titre
                 || "Cours non défini";
    const type    = prochainCours?.typeSeance || '';
    const mots    = libelle.split(' ');

    return (
      <div className="space-y-1">
        <h3 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-none">
          {mots[0]} <br/>
          <span className="text-[#006c49]">{mots.slice(1).join(' ')}</span>
        </h3>
        {type && (
          <span className="inline-block px-3 py-1 bg-white/10 text-white/80 rounded-xl
                           text-[10px] font-black uppercase tracking-widest mt-2">
            {type}
          </span>
        )}
      </div>
    );
  };

  if (isSessionActive && prochainCours) {
    return (
      <ActiveAttendanceSession
        onStopSession={() => {
          setIsSessionActive(false);
          fetchDashboardData();
        }}
        seance={prochainCours}
      />
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="min-h-screen bg-[#f1f4f2] pt-28 pb-32 px-4 md:px-8 font-body overflow-hidden relative">

      <style>{`
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-body    { font-family: 'Inter', sans-serif; }
        .glass-effect { background: rgba(255,255,255,0.6); backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.4); }
      `}</style>

      <div className="absolute top-10 -left-20 text-[#006c49]/5 -rotate-12 pointer-events-none select-none">
        <GraduationCap size={450} strokeWidth={1} />
      </div>

      <motion.div variants={container} initial="hidden" animate="show"
        className="max-w-7xl mx-auto space-y-10 relative z-10">

        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[10px] font-display font-black uppercase tracking-widest text-gray-500">
                Session Enseignant
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-[#1a1c1e] tracking-tighter leading-[0.8]">
              Bonjour, <br/> <span className="text-[#006c49]">{userName}.</span>
            </h1>
          </div>

          <div className="glass-effect p-6 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-black/5">
            <div className="w-14 h-14 bg-[#1a1c1e] text-white rounded-2xl flex items-center justify-center">
              <CalendarDays size={28} />
            </div>
            <div>
              <p className="text-[10px] font-display font-black uppercase tracking-widest text-gray-400">
                Date du jour
              </p>
              <p className="font-display font-black text-xl text-[#1a1c1e] capitalize">
                {formatDateLongue(new Date())}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Présence Moyenne', val: profStats.presenceMoyenne, icon: Users,       color: 'text-[#006c49]', bg: 'bg-[#d1f4e0]' },
            { label: 'Justifs en attente',val: profStats.justifsAttente, icon: FileWarning, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Heures Assurées',  val: profStats.heuresAssurees,  icon: Zap,         color: 'text-blue-500',  bg: 'bg-blue-50'   },
          ].map((stat, i) => (
            <motion.div key={i} variants={item}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white
                         hover:shadow-xl transition-all group overflow-hidden relative">
              <div className={`absolute -right-4 -bottom-4 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}>
                <stat.icon size={120} strokeWidth={3} />
              </div>
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-display font-black uppercase tracking-widest text-gray-400">
                {stat.label}
              </p>
              <p className="text-5xl font-display font-black text-[#1a1c1e] tracking-tighter">
                {stat.val}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Prochain cours */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 bg-[#1a1c1e] rounded-[3rem] p-8 md:p-12 text-white
                          relative overflow-hidden shadow-2xl shadow-[#006c49]/20 min-h-[400px]">
            {/* Déco fond */}
            <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-[#006c49]/10 rounded-full" />
            <div className="absolute -right-4 -top-8 w-48 h-48 bg-[#006c49]/5 rounded-full" />

            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-500 italic">
                Chargement du prochain cours...
              </div>
            ) : prochainCours ? (
              <div className="relative z-10 space-y-10">

                {/* Badge date */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-[#10b981] px-4 py-1.5 rounded-full text-[10px] font-display
                                  font-black uppercase tracking-widest text-white">
                    {prochainCours.estActive ? '🔴 En cours' : `Prochain : ${formatDateLongue(prochainCours.dateHeureDebut)}`}
                  </div>
                  {prochainCours.jour && (
                    <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {prochainCours.jour} · {prochainCours.heurePlage}
                    </div>
                  )}
                </div>

                {/* Titre */}
                {renderTitle()}

                {/* Infos */}
                <div className="flex flex-wrap gap-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {formatHeure(prochainCours.dateHeureDebut)} – {formatHeure(prochainCours.dateHeureFin)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    {prochainCours.groupe || "Groupe non défini"}
                  </span>
                  {prochainCours.salle?.nom && (
                    <span className="flex items-center gap-2">
                      <MapPin size={16} />
                      {prochainCours.salle.nom}
                    </span>
                  )}
                  {prochainCours.typeSeance && (
                    <span className="flex items-center gap-2">
                      <BookOpen size={16} />
                      {prochainCours.typeSeance}
                    </span>
                  )}
                </div>

                {/* Bouton */}
                <div className="pt-6 border-t border-white/10">
                  {prochainCours.estActive ? (
                    <button
                      onClick={() => setIsSessionActive(true)}
                      className="flex items-center gap-3 bg-red-500 hover:bg-red-600 px-6 py-3
                                 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                                 shadow-lg shadow-red-500/20"
                    >
                      <PlayCircle size={18} /> Reprendre la session
                    </button>
                  ) : (
                    <button
                      onClick={handleLancerAppel}
                      disabled={isStarting}
                      className="flex items-center gap-3 bg-[#10b981] hover:bg-[#0d9e6e] px-6 py-3
                                 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                                 shadow-lg shadow-[#10b981]/20 disabled:opacity-50"
                    >
                      <PlayCircle size={18} />
                      {isStarting ? "Lancement..." : "Lancer l'appel"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 relative z-10">
                <CalendarDays size={64} className="opacity-10" />
                <p className="font-display text-2xl text-center">
                  Aucun cours programmé pour le moment.
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Les nouveaux créneaux seront affichés ici dès que l'administrateur les planifie.
                </p>
              </div>
            )}
          </div>

          {/* Accès rapide */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm
                            hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-[#f1f4f2] text-[#006c49] rounded-2xl flex items-center justify-center">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-black tracking-tighter leading-none">
                    Agenda
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">Consultez votre emploi du temps.</p>
                </div>
              </div>
              <ArrowUpRight className="absolute top-8 right-8 text-gray-200" size={32} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfDashboard;