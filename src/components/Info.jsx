import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, QrCode, Camera, Keyboard, MapPin, CheckCircle2, XCircle,
  Clock, Shield, FileText, AlertCircle, Loader2, Send, ChevronDown,
  ChevronRight, BookOpen, CalendarDays, UploadCloud, KeyRound,
  GraduationCap, ArrowRight, HelpCircle, Sparkles, BarChart2,
  User, BellOff
} from 'lucide-react';

// ── Sections data ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'presence',
    emoji: '📡',
    title: 'Faire sa présence',
    subtitle: 'Scanner le QR Code de la séance',
    color: '#006c49',
    lightColor: '#d1f4e0',
    steps: [
      { icon: MapPin,   text: 'Activer le GPS' },
      { icon: Camera,   text: 'Autoriser la caméra' },
      { icon: QrCode,   text: 'Scanner ou saisir le code' },
      { icon: CheckCircle2, text: 'Confirmation reçue' },
    ],
    detail: {
      methods: [
        {
          icon: QrCode,
          label: 'Scan caméra',
          desc: 'Pointe ta caméra sur le QR Code affiché par le professeur. La détection est automatique.',
          steps: [
            'Appuyer sur le bouton Scan (bas de l\'écran)',
            'Activer le GPS si demandé',
            'Pointer la caméra sur le QR Code',
            'Attendre la confirmation automatique',
          ]
        },
        {
          icon: Keyboard,
          label: 'Code manuel',
          desc: 'Si la caméra ne fonctionne pas, tu peux entrer le code à 6 caractères affiché par le prof (format : ABC-1X2).',
          steps: [
            'Onglet "Code Manuel" dans le scanner',
            'Entrer le code à 6 caractères',
            'Appuyer sur Valider',
            'Attendre la confirmation',
          ]
        }
      ],
      gps: 'Le GPS est requis pour vérifier que tu es bien dans la salle de cours. Sans GPS, la présence peut être refusée.',
      feedback: true,
    }
  },
  {
    id: 'agenda',
    emoji: '📅',
    title: 'Consulter mes présences',
    subtitle: 'Agenda & suivi par module',
    color: '#1a1c1e',
    lightColor: '#f1f4f2',
    steps: [
      { icon: CalendarDays, text: 'Ouvrir l\'agenda' },
      { icon: BookOpen,     text: 'Choisir une date' },
      { icon: BarChart2,    text: 'Voir le détail par cours' },
      { icon: FileText,     text: 'Consulter par module' },
    ],
    detail: {
      legend: [
        { emoji: '🟢', label: 'Présent',     cls: 'bg-[#d1f4e0] text-[#006c49]' },
        { emoji: '🔴', label: 'Absent',      cls: 'bg-red-50 text-red-500' },
        { emoji: '🟠', label: 'Justifier',   cls: 'bg-orange-50 text-orange-500' },
        { emoji: '🕐', label: 'En attente',  cls: 'bg-orange-100 text-orange-600' },
        { emoji: '✅', label: 'Justifié ✓',  cls: 'bg-[#d1f4e0] text-[#006c49]' },
        { emoji: '❌', label: 'Refusé',      cls: 'bg-red-50 text-red-600' },
        { emoji: '🔵', label: 'À venir',     cls: 'bg-blue-50 text-blue-500' },
      ],
      exampleCourse: {
        heureDebut: '12:04',
        heureFin:   '14:00',
        module:     'Base de données',
        type:       'TP',
        prof:       'Prof. Djihane Bourenan',
        statut:     'present',
      },
      moduleInfo: 'La section "Cours" affiche tes modules avec le nombre de présences et le pourcentage de taux d\'assiduité. Un taux en dessous de 75% peut entraîner une exclusion du module.',
    }
  },
  {
    id: 'justificatif',
    emoji: '📎',
    title: 'Justifier une absence',
    subtitle: 'Déposer un document justificatif',
    color: '#b45309',
    lightColor: '#fff7ed',
    steps: [
      { icon: CalendarDays, text: 'Choisir la séance' },
      { icon: UploadCloud,  text: 'Joindre un document' },
      { icon: Send,         text: 'Soumettre' },
      { icon: Clock,        text: 'Attendre la décision' },
    ],
    detail: {
      methods: [
        {
          icon: FileText,
          label: 'Via la section Docs',
          desc: 'Va dans l\'onglet "Docs" du menu principal. Sélectionne la séance manquée dans la liste, choisis le type de motif, ajoute un document et envoie.',
        },
        {
          icon: CalendarDays,
          label: 'Via l\'Agenda',
          desc: 'Sur une séance marquée "Absent", appuie sur l\'icône 📄. Tu seras redirigé vers le formulaire avec la séance déjà pré-sélectionnée.',
        }
      ],
      formats: 'Formats acceptés : PDF, JPG, PNG — max 10 MB',
      motifs: ['Médical', 'Administratif', 'Personnel', 'Autre'],
    }
  },
  {
    id: 'password',
    emoji: '🔐',
    title: 'Changer mon mot de passe',
    subtitle: 'Sécuriser ton compte',
    color: '#4f46e5',
    lightColor: '#eef2ff',
    steps: [
      { icon: User,      text: 'Aller dans Profil' },
      { icon: KeyRound,  text: '"Modifier mon accès"' },
      { icon: KeyRound,  text: 'Saisir le nouveau MDP' },
      { icon: CheckCircle2, text: 'Confirmer' },
    ],
    detail: {
      rules: [
        'Au moins 6 caractères',
        'Confirme deux fois pour valider',
        'Le changement est immédiat',
      ],
    }
  },
];

// ── Mini composants réutilisables ─────────────────────────────────────────────

const StepBubble = ({ icon: Icon, text, index, color }) => (
  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
      style={{ background: color }}
    >
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <p className="text-[10px] font-black font-display text-center text-gray-500 uppercase tracking-wide leading-tight px-0.5">
      {text}
    </p>
  </div>
);

const ScanFeedbackDemo = () => {
  const [demo, setDemo] = useState(null); // null | 'success' | 'error'

  return (
    <div className="space-y-3 mt-4">
      <p className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400">
        Aperçu des retours
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setDemo(d => d === 'success' ? null : 'success')}
          className="flex-1 py-2.5 rounded-2xl bg-[#d1f4e0] text-[#006c49] text-xs font-black font-display uppercase tracking-wider hover:bg-[#006c49] hover:text-white transition-all"
        >
          ✓ Succès
        </button>
        <button
          onClick={() => setDemo(d => d === 'error' ? null : 'error')}
          className="flex-1 py-2.5 rounded-2xl bg-red-50 text-red-500 text-xs font-black font-display uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all"
        >
          ✗ Erreur
        </button>
      </div>

      <AnimatePresence>
        {demo === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1c1e] rounded-[2rem] p-6 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#006c49] flex items-center justify-center shadow-xl shadow-[#006c49]/30">
                <CheckCircle2 size={30} className="text-white" />
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-[#006c49]"
              />
            </div>
            <div className="text-center">
              <p className="text-white font-black font-display text-lg tracking-tighter">Présence validée !</p>
              <p className="text-[#006c49] font-black text-3xl font-display mt-1">08:30</p>
            </div>
            <div className="w-full bg-[#006c49]/15 border border-[#006c49]/25 rounded-2xl px-4 py-3 text-center">
              <p className="text-green-300 text-xs font-bold">Présence enregistrée avec succès.</p>
            </div>
          </motion.div>
        )}

        {demo === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1c1e] rounded-[2rem] p-6 flex flex-col items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <XCircle size={28} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-black font-display text-lg tracking-tighter">Présence refusée</p>
            </div>
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-center">
              <p className="text-red-300 text-xs font-bold leading-relaxed">
                Token expiré ou hors de la zone géographique autorisée.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AgendaLegend = ({ legend }) => (
  <div className="flex flex-wrap gap-2 mt-3">
    {legend.map(item => (
      <div key={item.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black font-display uppercase tracking-wide ${item.cls}`}>
        <span>{item.emoji}</span>
        {item.label}
      </div>
    ))}
  </div>
);

const ExampleCourse = ({ course }) => {
  const statCfg = {
    present:       { cls: 'bg-[#d1f4e0]', iconColor: 'text-[#006c49]', Icon: CheckCircle2, heureColor: 'text-[#006c49]' },
    absent:        { cls: 'bg-red-50',     iconColor: 'text-red-500',   Icon: XCircle,      heureColor: 'text-red-400' },
    justif_attente:{ cls: 'bg-orange-50',  iconColor: 'text-orange-500',Icon: Clock,        heureColor: 'text-orange-500' },
  };
  const cfg = statCfg[course.statut] || statCfg.present;
  const { Icon } = cfg;

  return (
    <div className="mt-4">
      <p className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">
        Exemple de séance
      </p>
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center bg-[#f1f4f2] rounded-2xl w-[54px] h-14 border border-gray-50 shrink-0">
            <span className={`text-[13px] font-display font-black ${cfg.heureColor}`}>{course.heureDebut}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">{course.heureFin}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display font-black text-[#1a1c1e] text-sm tracking-tighter">{course.module}</p>
              <span className="text-[9px] font-black font-display uppercase tracking-widest bg-[#f1f4f2] text-gray-500 px-2 py-0.5 rounded-lg">
                {course.type}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <User size={9} strokeWidth={3} className="text-gray-400" />
              <p className="text-[9px] font-bold text-gray-400 uppercase">{course.prof}</p>
            </div>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.cls} ${cfg.iconColor}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

// ── Section card ──────────────────────────────────────────────────────────────
const SectionCard = ({ section }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm"
    >
      {/* Header always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
              style={{ background: section.lightColor }}
            >
              {section.emoji}
            </div>
            <div>
              <h3 className="font-display font-black text-[#1a1c1e] text-base tracking-tighter leading-tight">
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

        {/* Steps always visible */}
        <div className="flex items-start gap-2 mt-5 relative">
          {section.steps.map((step, i) => (
            <React.Fragment key={i}>
              <StepBubble icon={step.icon} text={step.text} index={i} color={section.color} />
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
            className="mt-4 flex items-center gap-1.5 text-[11px] font-black font-display uppercase tracking-widest transition-colors"
            style={{ color: section.color }}
          >
            Voir plus <ChevronRight size={11} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Expanded detail */}
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

              {/* ── Présence detail ── */}
              {section.id === 'presence' && (
                <>
                  {section.detail.methods.map(method => {
                    const MIcon = method.icon;
                    return (
                      <div key={method.label} className="bg-[#f1f4f2] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#006c49] text-white">
                            <MIcon size={16} />
                          </div>
                          <p className="font-display font-black text-[#1a1c1e] text-sm">{method.label}</p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{method.desc}</p>
                        <ol className="space-y-1">
                          {method.steps.map((s, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                              <span className="w-4 h-4 rounded-full bg-[#006c49] text-white flex items-center justify-center text-[9px] font-black shrink-0">
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

                  {section.detail.feedback && <ScanFeedbackDemo />}
                </>
              )}

              {/* ── Agenda detail ── */}
              {section.id === 'agenda' && (
                <>
                  <div>
                    <p className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">
                      Légende de l'agenda
                    </p>
                    <AgendaLegend legend={section.detail.legend} />
                  </div>

                  <ExampleCourse course={section.detail.exampleCourse} />

                  <div className="bg-[#f1f4f2] rounded-2xl p-4 flex items-start gap-3">
                    <BarChart2 size={16} className="text-[#1a1c1e] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {section.detail.moduleInfo}
                    </p>
                  </div>
                </>
              )}

              {/* ── Justificatif detail ── */}
              {section.id === 'justificatif' && (
                <>
                  {section.detail.methods.map(method => {
                    const MIcon = method.icon;
                    return (
                      <div key={method.label} className="bg-[#fff7ed] border border-orange-100 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#b45309] text-white">
                            <MIcon size={16} />
                          </div>
                          <p className="font-display font-black text-[#1a1c1e] text-sm">{method.label}</p>
                        </div>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{method.desc}</p>
                      </div>
                    );
                  })}

                  <div className="flex items-start gap-2.5 bg-[#f1f4f2] rounded-2xl p-3.5">
                    <FileText size={14} className="text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 font-bold">{section.detail.formats}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-black font-display uppercase tracking-widest text-gray-400 mb-2">
                      Types de motifs
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {section.detail.motifs.map(m => (
                        <span key={m} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-[11px] font-black font-display uppercase tracking-wide border border-orange-100">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Password detail ── */}
              {section.id === 'password' && (
                <>
                  <div className="bg-[#eef2ff] border border-indigo-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#4f46e5] flex items-center justify-center text-white">
                        <KeyRound size={16} />
                      </div>
                      <p className="font-display font-black text-[#1a1c1e] text-sm">Règles du mot de passe</p>
                    </div>
                    <ul className="space-y-2">
                      {section.detail.rules.map((rule, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                          <CheckCircle2 size={13} className="text-[#4f46e5] shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mini simulacre UI */}
                  <div className="bg-[#f1f4f2] rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-black font-display uppercase tracking-widest text-gray-400 mb-3">
                      Aperçu de l'interface
                    </p>
                    <div className="bg-white rounded-xl py-3 px-4">
                      <p className="text-xs text-gray-300 font-bold">Nouveau mot de passe</p>
                      <p className="text-gray-200 text-sm font-black tracking-widest mt-0.5">••••••••</p>
                    </div>
                    <div className="bg-white rounded-xl py-3 px-4">
                      <p className="text-xs text-gray-300 font-bold">Confirmer le mot de passe</p>
                      <p className="text-gray-200 text-sm font-black tracking-widest mt-0.5">••••••••</p>
                    </div>
                    <div className="w-full py-3 bg-[#1a1c1e] rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} className="text-white" />
                      <span className="text-white text-xs font-black font-display uppercase tracking-wider">Confirmer</span>
                    </div>
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

// ════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : Modal info fullscreen
// ════════════════════════════════════════════════════════════════════════════
const InfoModal = ({ onClose }) =>
  ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} className="flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#1a1c1e]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
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
              <h2 className="font-display font-black text-[#1a1c1e] text-xl tracking-tighter leading-tight">
                Aide & Fonctionnalités
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                UniCheck · Espace Étudiant
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
        <div className="px-5 pt-5 pb-3 bg-white border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#006c49]" />
            <p className="text-xs font-bold text-gray-500 leading-relaxed">
              UniCheck est ta plateforme de gestion de présence. Voici tout ce que tu peux faire en tant qu'étudiant.
            </p>
          </div>
        </div>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3">
          {SECTIONS.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}

          {/* Footer tip */}
          <div className="bg-[#1a1c1e] rounded-[2rem] p-5 flex items-start gap-3">
            <GraduationCap size={20} className="text-[#006c49] shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-black text-white text-sm tracking-tighter">Taux d'assiduité minimum</p>
              <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                Maintiens un taux de présence au-dessus de 75% pour chaque module afin d'éviter les sanctions académiques.
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

// ── Export : bouton + modal ────────────────────────────────────────────────────
const Info = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Aide & Fonctionnalités"
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        <span className="text-xl leading-none select-none">❓</span>
      </button>

      <AnimatePresence>
        {isOpen && <InfoModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Info;