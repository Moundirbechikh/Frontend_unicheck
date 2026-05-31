import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, HelpCircle, Sparkles, GraduationCap, ChevronDown, ChevronRight,
  Eye, Play, MapPin, QrCode, Search, ScanLine, Pause, Clock,
  CalendarDays, Users, Download, CheckCircle2, XCircle, FileText,
  AlertCircle, AlertTriangle, BarChart2, Activity, History,
  Coffee, User, ChevronLeft, Loader2, Send, Check, MessageSquare,
  BookOpen, Shield
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'lancement',
    Icon: Play,
    title: 'Lancer une séance',
    subtitle: 'Démarrer l\'appel via Dashboard ou Agenda',
    color: '#006c49',
    lightColor: '#d1f4e0',
    steps: [
      { icon: MapPin,        text: 'Activer le GPS' },
      { icon: Play,          text: 'Lancer la séance' },
      { icon: Activity,      text: 'Session active' },
      { icon: CheckCircle2,  text: 'Présences en direct' },
    ],
    detail: {
      methods: [
        {
          icon: BarChart2,
          label: 'Via le Tableau de bord',
          desc: 'La carte "Prochain cours" affiche automatiquement ton prochain cours planifié. Clique sur "Lancer l\'appel" — le GPS est requis pour localiser la salle.',
          steps: [
            'Aller dans Tableau de bord',
            'Voir la carte "Prochain cours"',
            'Autoriser la géolocalisation',
            'Cliquer sur "Lancer l\'appel"',
          ],
        },
        {
          icon: CalendarDays,
          label: 'Via l\'Agenda',
          desc: 'Navigue sur n\'importe quel jour dans l\'Agenda, puis clique sur le bouton "Lancer" à côté du créneau souhaité. Tu peux aussi reprendre une session déjà active.',
          steps: [
            'Aller dans Cours (Agenda)',
            'Sélectionner le jour dans le calendrier',
            'Repérer le créneau dans le programme',
            'Cliquer sur "Lancer" ou "Reprendre"',
          ],
        },
      ],
      gps: 'La localisation GPS est obligatoire pour valider que le cours se déroule bien dans la bonne salle. Sans elle, le lancement sera refusé.',
    },
  },
  {
    id: 'session',
    Icon: Activity,
    title: 'Gérer la session active',
    subtitle: 'Plans B, C, D pendant l\'appel',
    color: '#1a1c1e',
    lightColor: '#f1f4f2',
    steps: [
      { icon: QrCode,   text: 'QR rotatif' },
      { icon: ScanLine, text: 'Scanner carte' },
      { icon: Search,   text: 'Saisie manuelle' },
      { icon: Pause,    text: 'Stop/Relancer timer' },
    ],
    detail: {
      methods: [
        {
          icon: QrCode,
          label: 'QR Code rotatif (Plan A)',
          desc: 'Un QR Code + code texte se régénère automatiquement toutes les 10 secondes. Les étudiants le scannent avec leur téléphone. Le timer peut être stoppé et relancé.',
        },
        {
          icon: ScanLine,
          label: 'Scanner carte étudiant (Plan B)',
          desc: 'Depuis le panneau gauche de la session, ouvre le Scanner. Pointe la caméra sur la carte QR fixe de l\'étudiant pour enregistrer sa présence manuellement.',
        },
        {
          icon: Search,
          label: 'Saisie manuelle (Plan C)',
          desc: 'Depuis le panneau gauche, ouvre la Saisie Manuelle. Tape le nom ou matricule de l\'étudiant et valide sa présence en un clic.',
        },
        {
          icon: Pause,
          label: 'Stop / Relancer le timer (Plan D)',
          desc: 'Le bouton Stop/Relancer gèle le timer pour tous les appareils simultanément. Utile en cas d\'interruption de cours ou de problème réseau.',
        },
      ],
      livePreview: true,
    },
  },
  {
    id: 'consultation',
    Icon: CalendarDays,
    title: 'Consulter les présences',
    subtitle: 'Par jour, par séance et en téléchargement',
    color: '#4f46e5',
    lightColor: '#eef2ff',
    steps: [
      { icon: CalendarDays, text: 'Choisir le jour' },
      { icon: Eye,          text: 'Voir les présences' },
      { icon: Download,     text: 'Exporter CSV' },
      { icon: Users,        text: 'Voir par étudiant' },
    ],
    detail: {
      agendaStatuts: [
        { Icon: Play,    label: 'À venir',  cls: 'bg-white text-[#1a1c1e]',    badge: 'Lancer' },
        { Icon: Activity,label: 'En cours', cls: 'bg-[#1a1c1e] text-white',    badge: 'Reprendre' },
        { Icon: Eye,     label: 'Terminée', cls: 'bg-[#e5eee9] text-[#006c49]',badge: 'Présences' },
        { Icon: Coffee,  label: 'Libre',    cls: 'bg-gray-50 text-gray-300',   badge: null },
      ],
      exampleSession: {
        heureDebut: '08:30',
        heureFin:   '10:00',
        module:     'Base de données',
        type:       'TP',
        groupe:     'G1 SITW',
        room:       'Salle B12',
        status:     'done',
        tenue:      '08:35',
      },
      csvInfo: 'Le fichier CSV exporté contient le nom de chaque étudiant présent et son heure de scan. Il peut être ouvert directement dans Excel (UTF-8 avec BOM).',
    },
  },
  {
    id: 'justificatifs',
    Icon: FileText,
    title: 'Traiter les justificatifs',
    subtitle: 'Accepter ou refuser les demandes d\'absence',
    color: '#b45309',
    lightColor: '#fff7ed',
    steps: [
      { icon: Eye,          text: 'Voir le document' },
      { icon: MessageSquare,text: 'Commenter (opt.)' },
      { icon: Check,        text: 'Accepter' },
      { icon: XCircle,      text: 'Refuser' },
    ],
    detail: {
      process: [
        'Accède à la section "Justificatifs" dans le menu',
        'Consulte le document soumis par l\'étudiant (PDF, image)',
        'Lis le motif et le type (Médical, Administratif…)',
        'Ajoute un commentaire optionnel pour l\'étudiant',
        'Clique sur "Valider" ou "Refuser" — l\'étudiant est notifié',
      ],
      livePreview: true,
    },
  },
  {
    id: 'etudiants',
    Icon: Users,
    title: 'Suivre mes étudiants',
    subtitle: 'Statistiques, risques et détail par étudiant',
    color: '#0891b2',
    lightColor: '#ecfeff',
    steps: [
      { icon: BookOpen,      text: 'Choisir le module' },
      { icon: Users,         text: 'Voir la liste' },
      { icon: AlertTriangle, text: 'Filtrer à risque' },
      { icon: User,          text: 'Détail étudiant' },
    ],
    detail: {
      filters: [
        { Icon: CheckCircle2,  label: 'Bon taux',  desc: '0 absence',       cls: 'text-[#006c49]' },
        { Icon: AlertTriangle, label: 'Attention', desc: '1-2 absences',    cls: 'text-orange-400' },
        { Icon: AlertCircle,   label: 'À risque',  desc: '3+ absences',     cls: 'text-red-500' },
      ],
      hierarchy: [
        'Spécialité (ex: SITW)',
        'Groupe (ex: G1, G2)',
        'Type de séance (COURS, TD, TP)',
      ],
      detailInfo: 'En cliquant sur un étudiant, tu accèdes à sa fiche complète : nom, spécialité, groupe, email. Seulement les administrateurs peuvent modifier les informations.',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MINI COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

const StepBubble = ({ icon: Icon, text, color }) => (
  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
      style={{ background: color }}
    >
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <p
      className="text-[10px] font-black text-center text-gray-500 uppercase tracking-wide leading-tight px-0.5"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {text}
    </p>
  </div>
);

// Mini demo live de la session active
const SessionLiveDemo = () => {
  const [paused, setPaused] = useState(false);

  return (
    <div className="mt-3 space-y-3">
      <p
        className="text-[11px] font-black uppercase tracking-widest text-gray-400"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        Aperçu session active
      </p>

      {/* Mini CenterMonolith */}
      <div className="bg-[#1a1c1e] rounded-[2rem] p-5 flex flex-col items-center gap-4">
        <p
          className="text-white/30 font-black uppercase tracking-[0.4em] text-[10px]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Token · 10 sec {paused && <span className="text-yellow-400 ml-1">(PAUSE)</span>}
        </p>

        {/* QR placeholder */}
        <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center">
          <QrCode size={80} className="text-[#1a1c1e]" strokeWidth={1.5} />
        </div>

        {/* Code token */}
        <div
          className="w-full bg-[#006c49] text-white rounded-2xl py-3 flex items-center justify-center font-black tracking-[0.3em] text-sm"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          ABK-7Y2
        </div>

        {/* Toggle timer */}
        <button
          onClick={() => setPaused(p => !p)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
            paused
              ? 'bg-[#006c49] text-white'
              : 'bg-white/10 text-white/40 border border-white/10'
          }`}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {paused ? (
            <><span className="w-2 h-2 rounded-full bg-white inline-block animate-pulse" /> Relancer</>
          ) : (
            <><Pause size={12} /> Stop timer</>
          )}
        </button>
      </div>

      {/* Mini sidebar actions */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center gap-2">
          <div className="w-9 h-9 bg-[#f1f4f2] rounded-xl flex items-center justify-center">
            <Search size={16} className="text-[#1a1c1e]" />
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-wider text-gray-500 text-center"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Saisie<br />Manuelle
          </span>
        </div>
        <div className="flex-1 bg-[#1a1c1e] rounded-2xl p-3 flex flex-col items-center gap-2">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <ScanLine size={16} className="text-white" />
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-wider text-white text-center"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Scanner<br />Carte
          </span>
        </div>
        <div className="flex-1 bg-[#006c49] rounded-2xl p-3 flex flex-col items-center gap-2">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Users size={16} className="text-white" />
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-wider text-white text-center"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Présents<br />en direct
          </span>
        </div>
      </div>
    </div>
  );
};

// Mini demo agenda séance
const AgendaSessionDemo = ({ detail }) => (
  <div className="mt-3 space-y-3">
    <p
      className="text-[11px] font-black uppercase tracking-widest text-gray-400"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      Exemple de créneau
    </p>

    {/* Séance terminée avec historique */}
    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Heure */}
          <div className="flex flex-col items-center justify-center bg-[#e5eee9] rounded-2xl min-w-[58px] h-14 shrink-0">
            <span
              className="text-[12px] font-black text-[#006c49]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {detail.exampleSession.heureDebut}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">
              {detail.exampleSession.heureFin}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="font-black text-[#1a1c1e] text-sm tracking-tighter"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {detail.exampleSession.module}
              </p>
              <span
                className="text-[9px] font-black uppercase tracking-widest bg-orange-500 text-white px-2 py-0.5 rounded-lg"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {detail.exampleSession.type}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-bold bg-[#d1f4e0] text-[#006c49] px-2 py-0.5 rounded-lg">
                <Users size={10} /> {detail.exampleSession.groupe}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-500 px-2 py-0.5 rounded-lg">
                <MapPin size={10} /> {detail.exampleSession.room}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <History size={10} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400">
                Tenue à {detail.exampleSession.tenue} → 10:00
              </span>
            </div>
          </div>
        </div>
        <button className="shrink-0 bg-[#e5eee9] text-[#006c49] px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
          <Eye size={12} /> Présences
        </button>
      </div>
    </div>

    {/* Légende statuts */}
    <div>
      <p
        className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        Statuts d'un créneau
      </p>
      <div className="space-y-1.5">
        {detail.agendaStatuts.map(s => {
          const { Icon } = s;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wide ${s.cls} border border-gray-100`}>
                <Icon size={12} strokeWidth={2.5} />
                {s.label}
              </div>
              {s.badge && (
                <span
                  className="text-[10px] font-bold text-gray-400"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  → bouton « {s.badge} »
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// Mini demo justificatif
const JustifDemo = () => {
  const [action, setAction] = useState(null);

  return (
    <div className="mt-3 space-y-3">
      <p
        className="text-[11px] font-black uppercase tracking-widest text-gray-400"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        Aperçu d'une demande
      </p>

      <div className="bg-white border border-white rounded-[2rem] p-5 shadow-sm relative overflow-hidden">
        {/* Barre colorée gauche */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400 opacity-40 rounded-l-[2rem]" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-[#f1f4f2] rounded-2xl flex items-center justify-center">
            <FileText size={20} className="text-[#1a1c1e]" />
          </div>
          <div>
            <p
              className="font-black text-[#1a1c1e] text-base tracking-tighter"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Benali Yassine
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Algorithmique · TP · 15 mai
            </p>
          </div>
          <button className="ml-auto bg-[#f1f4f2] text-[#006c49] px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Eye size={11} /> Doc
          </button>
        </div>

        <div className="bg-[#f8faf9] rounded-2xl p-3 mb-4 border border-gray-100">
          <p className="text-xs text-gray-500 italic">"Certificat médical — grippe"</p>
        </div>

        <AnimatePresence>
          {action === null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <button
                onClick={() => setAction('refuse')}
                className="flex-1 py-3 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <XCircle size={13} /> Refuser
              </button>
              <button
                onClick={() => setAction('accept')}
                className="flex-1 py-3 bg-[#1a1c1e] text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-[#006c49] transition-all flex items-center justify-center gap-1.5"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <Check size={13} /> Valider
              </button>
            </motion.div>
          )}
          {action === 'accept' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-[#d1f4e0] rounded-2xl p-3 border border-[#006c49]/20"
            >
              <CheckCircle2 size={18} className="text-[#006c49] shrink-0" />
              <p className="text-xs text-[#006c49] font-bold">Justificatif accepté — étudiant notifié.</p>
              <button onClick={() => setAction(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </motion.div>
          )}
          {action === 'refuse' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-red-50 rounded-2xl p-3 border border-red-100"
            >
              <XCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-bold">Justificatif refusé — étudiant notifié.</p>
              <button onClick={() => setAction(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────
const SectionCard = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  const { Icon: SectionIcon } = section;

  return (
    <motion.div layout className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: section.lightColor }}
            >
              <SectionIcon size={22} strokeWidth={2.5} style={{ color: section.color }} />
            </div>
            <div>
              <h3
                className="font-black text-[#1a1c1e] text-base tracking-tighter leading-tight"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {section.title}
              </h3>
              <p className="text-[11px] text-gray-400 font-bold mt-0.5">{section.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#f1f4f2] text-gray-500 hover:bg-gray-200 transition-all shrink-0 mt-0.5"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} strokeWidth={3} />
            </motion.div>
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-start gap-2 mt-5">
          {section.steps.map((step, i) => (
            <React.Fragment key={i}>
              <StepBubble icon={step.icon} text={step.text} color={section.color} />
              {i < section.steps.length - 1 && (
                <div className="w-4 shrink-0 flex items-center justify-center mt-3.5">
                  <ChevronRight size={12} className="text-gray-300" strokeWidth={3} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors"
            style={{ color: section.color, fontFamily: "'Manrope', sans-serif" }}
          >
            <Eye size={12} strokeWidth={2.5} /> Voir plus
          </button>
        )}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-1 border-t border-gray-50 space-y-4">

              {/* ── Lancement ── */}
              {section.id === 'lancement' && (
                <>
                  {section.detail.methods.map(method => {
                    const MIcon = method.icon;
                    return (
                      <div key={method.label} className="bg-[#f1f4f2] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#006c49] text-white">
                            <MIcon size={16} />
                          </div>
                          <p className="font-black text-[#1a1c1e] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {method.label}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{method.desc}</p>
                        <ol className="space-y-1.5 pt-1">
                          {method.steps.map((s, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                              <span
                                className="w-4 h-4 rounded-full bg-[#006c49] text-white flex items-center justify-center text-[9px] font-black shrink-0"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                              >
                                {i + 1}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                  <div className="flex items-start gap-2.5 bg-orange-50 rounded-2xl p-3.5 border border-orange-100">
                    <MapPin size={15} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 font-bold leading-relaxed">{section.detail.gps}</p>
                  </div>
                </>
              )}

              {/* ── Session active ── */}
              {section.id === 'session' && (
                <>
                  {section.detail.methods.map(method => {
                    const MIcon = method.icon;
                    return (
                      <div key={method.label} className="bg-[#f1f4f2] rounded-2xl p-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#1a1c1e] text-white">
                            <MIcon size={15} />
                          </div>
                          <p className="font-black text-[#1a1c1e] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            {method.label}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{method.desc}</p>
                      </div>
                    );
                  })}
                  {section.detail.livePreview && <SessionLiveDemo />}
                </>
              )}

              {/* ── Consultation ── */}
              {section.id === 'consultation' && (
                <>
                  <AgendaSessionDemo detail={section.detail} />

                  <div className="bg-[#f1f4f2] rounded-2xl p-4 flex items-start gap-3 mt-2">
                    <Download size={15} className="text-[#4f46e5] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{section.detail.csvInfo}</p>
                  </div>
                </>
              )}

              {/* ── Justificatifs ── */}
              {section.id === 'justificatifs' && (
                <>
                  <div className="bg-[#fff7ed] border border-orange-100 rounded-2xl p-4 space-y-2">
                    <p className="font-black text-[#1a1c1e] text-sm mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      Processus de traitement
                    </p>
                    <ol className="space-y-2">
                      {section.detail.process.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-gray-600">
                          <span
                            className="w-4 h-4 rounded-full bg-[#b45309] text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                          >
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {section.detail.livePreview && <JustifDemo />}
                </>
              )}

              {/* ── Étudiants ── */}
              {section.id === 'etudiants' && (
                <>
                  {/* Icônes risque */}
                  <div className="space-y-2">
                    <p
                      className="text-[11px] font-black uppercase tracking-widest text-gray-400"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      Niveau de risque
                    </p>
                    {section.detail.filters.map(f => {
                      const FIcon = f.Icon;
                      return (
                        <div key={f.label} className="flex items-center gap-3 bg-[#f1f4f2] rounded-2xl p-3">
                          <FIcon size={20} strokeWidth={2.5} className={f.cls} />
                          <div>
                            <p className="font-black text-[#1a1c1e] text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                              {f.label}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold">{f.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Hiérarchie filtres */}
                  <div>
                    <p
                      className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      Navigation par filtre
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {section.detail.hierarchy.map((h, i) => (
                        <React.Fragment key={h}>
                          <span
                            className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-[#1a1c1e] uppercase tracking-wide shadow-sm"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                          >
                            {h}
                          </span>
                          {i < section.detail.hierarchy.length - 1 && (
                            <ChevronRight size={12} className="text-gray-300" strokeWidth={3} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#ecfeff] border border-cyan-100 rounded-2xl p-4 flex items-start gap-3">
                    <Shield size={15} className="text-[#0891b2] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#0891b2] font-bold leading-relaxed">{section.detail.detailInfo}</p>
                  </div>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL FULLSCREEN
// ─────────────────────────────────────────────────────────────────────────────
const ProfInfoModal = ({ onClose }) =>
  ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} className="flex items-end sm:items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&display=swap');
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1a1c1e]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 w-full bg-[#f1f4f2] overflow-hidden flex flex-col
                   rounded-t-[2.5rem] sm:rounded-[2.5rem] sm:max-w-2xl sm:mx-4"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="bg-white px-6 py-5 flex justify-between items-center shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#1a1c1e] rounded-2xl flex items-center justify-center text-white shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2
                className="font-black text-[#1a1c1e] text-xl tracking-tighter leading-tight"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Aide & Fonctionnalités
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                UniCheck · Espace Professeur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={17} />
          </button>
        </div>

        {/* Intro */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#006c49]" />
            <p className="text-xs font-bold text-gray-500 leading-relaxed">
              UniCheck te permet de gérer l'appel, les présences et les justificatifs de tes étudiants en temps réel.
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3">
          {SECTIONS.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}

          {/* Footer tip */}
          <div className="bg-[#1a1c1e] rounded-[2rem] p-5 flex items-start gap-3">
            <GraduationCap size={20} className="text-[#006c49] shrink-0 mt-0.5" />
            <div>
              <p
                className="font-black text-white text-sm tracking-tighter"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Seuil d'alerte automatique
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                Les étudiants avec 3 absences ou plus sont automatiquement signalés dans la liste de suivi. Le filtre "À risque" les isole en un clic.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/80 px-6 py-3.5 text-center shrink-0 border-t border-gray-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            UniCheck · Plateforme de présence informatisée
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────
const ProfInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Aide & Fonctionnalités Professeur"
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        <HelpCircle size={22} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {isOpen && <ProfInfoModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default ProfInfo;