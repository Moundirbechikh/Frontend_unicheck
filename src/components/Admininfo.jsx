import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, HelpCircle, Sparkles, GraduationCap, ChevronDown, ChevronRight,
  Eye, Users, UserPlus, MapPin, BookOpen, Upload, CalendarDays,
  Search, Download, Filter, BarChart2, AlertCircle, AlertTriangle,
  CheckCircle2, FileText, Trash2, Edit3, Plus, Clock, Mail,
  ArrowUpDown, Layers, Activity, TrendingUp, TrendingDown, Zap,
  RefreshCw, Shield, Server
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'dashboard',
    Icon: Zap,
    title: 'Tableau de bord & Actions rapides',
    subtitle: 'Vue globale + raccourcis de gestion',
    color: '#006c49',
    lightColor: '#d1f4e0',
    steps: [
      { icon: BarChart2,   text: 'Stats globales' },
      { icon: TrendingUp,  text: 'Insights système' },
      { icon: Zap,         text: 'Actions rapides' },
      { icon: Activity,    text: 'Séances en direct' },
    ],
    detail: {
      stats: [
        { label: 'Présence globale', desc: 'Taux calculé sur toutes les séances terminées de la plateforme.' },
        { label: 'Total étudiants',  desc: 'Nombre d\'étudiants inscrits dans le système.' },
        { label: 'Total professeurs',desc: 'Nombre d\'enseignants actifs.' },
        { label: 'Séances en cours', desc: 'Séances actuellement lancées par un professeur, en temps réel.' },
      ],
      insights: [
        { Icon: TrendingUp,  label: 'Hausse de présence', cls: 'text-[#006c49] bg-[#d1f4e0]' },
        { Icon: TrendingDown,label: 'Baisse de présence', cls: 'text-orange-500 bg-orange-50' },
        { Icon: FileText,    label: 'Bilan justificatifs',cls: 'text-blue-500 bg-blue-50' },
      ],
      actions: [
        { Icon: UserPlus,    label: 'Ajouter étudiant',  desc: 'Formulaire d\'ajout d\'un étudiant individuel. Remplir nom, prénom, matricule, spécialité, groupe et email.' },
        { Icon: Users,       label: 'Nouveau professeur',desc: 'Formulaire d\'ajout d\'un enseignant. Remplir nom, prénom et email institutionnel.' },
        { Icon: CalendarDays,label: 'Gérer les plannings',desc: 'Raccourci vers la section Planning pour créer et modifier l\'emploi du temps.' },
        { Icon: MapPin,      label: 'Gestion des salles', desc: 'Créer une nouvelle salle en renseignant son nom et son département.' },
        { Icon: BookOpen,    label: 'Ajouter un module',  desc: 'Créer un module et assigner directement des professeurs avec leurs types de séances (Cours, TD, TP).' },
        { Icon: Upload,      label: 'Importer CSV',       desc: 'Importer une liste d\'étudiants depuis un fichier CSV. Format requis : Matricule ; Nom ; Prénom ; Sex ; DateNaissance ; CarteRFID.' },
      ],
    },
  },
  {
    id: 'etudiants',
    Icon: GraduationCap,
    title: 'Gestion des étudiants',
    subtitle: 'Annuaire complet avec filtres et statistiques',
    color: '#1a1c1e',
    lightColor: '#f1f4f2',
    steps: [
      { icon: Search,      text: 'Rechercher' },
      { icon: Filter,      text: 'Filtrer' },
      { icon: ArrowUpDown, text: 'Trier' },
      { icon: Eye,         text: 'Détail / Edit' },
    ],
    detail: {
      filters: [
        { label: 'Recherche',   desc: 'Par nom ou matricule en temps réel.' },
        { label: 'Statut',      desc: 'Tous · Exclus (< 70%) · Non exclus (≥ 70%).' },
        { label: 'Spécialité',  desc: 'Filtre par spécialité (SITW, 1ère Ingénieur…).' },
        { label: 'Groupe',      desc: 'Filtre par groupe (G1, G2…) une fois la spécialité sélectionnée.' },
        { label: 'Sans compte', desc: 'Isole les étudiants sans accès à la plateforme.' },
      ],
      sorts: ['Nom', 'Présence (%)', 'Absences', 'Matricule'],
      risk: [
        { Icon: CheckCircle2,  label: 'Régulier',    desc: '≥ 70% de présence',  cls: 'text-[#006c49] bg-[#d1f4e0]' },
        { Icon: AlertCircle,   label: 'Exclu',       desc: '< 70% de présence',  cls: 'text-red-500 bg-red-50' },
      ],
      detail: 'Un clic sur une carte étudiant ouvre sa fiche complète (carte 3D interactive). L\'admin peut modifier le nom, prénom, spécialité, groupe, email et Device ID de sécurité.',
      export: 'Export CSV disponible avec tous les champs : ID, Nom, Prénom, Matricule, Spécialité, Groupe, Email, Présence (%), Absences, Compte actif, Device ID.',
    },
  },
  {
    id: 'professeurs',
    Icon: Users,
    title: 'Gestion des professeurs',
    subtitle: 'Annuaire enseignants avec stats d\'assiduité',
    color: '#4f46e5',
    lightColor: '#eef2ff',
    steps: [
      { icon: Search,      text: 'Rechercher' },
      { icon: Filter,      text: 'Filtrer' },
      { icon: BarChart2,   text: 'Stats présence' },
      { icon: Eye,         text: 'Détail prof' },
    ],
    detail: {
      filters: [
        { label: 'Recherche',           desc: 'Par nom ou email.' },
        { label: 'Statut activité',     desc: 'Tous · Actif (au moins une séance) · Inactif.' },
        { label: 'Filtre module',       desc: 'Voir les profs qui enseignent un module spécifique.' },
        { label: 'Justifs en attente',  desc: 'Isoler les profs ayant des justificatifs non traités.' },
      ],
      sorts: ['Nom', 'Assiduité (%)', 'Heures', 'Séances effectuées'],
      modal: [
        { label: 'Slide 1 — Activité',  desc: 'Modules enseignés, graphique d\'activité sur 12 mois, bilan justificatifs (acceptés, refusés, en attente).' },
        { label: 'Slide 2 — Assiduité', desc: 'Taux de présence global et détail par module enseigné avec barre de progression.' },
      ],
      export: 'Export CSV avec : ID, Nom, Prénom, Email, Modules, Taux Présence, Séances effectuées, Heures enseignées, Justifs en attente.',
    },
  },
  {
    id: 'planning',
    Icon: CalendarDays,
    title: 'Gestion du planning',
    subtitle: 'Emploi du temps par groupe et spécialité',
    color: '#b45309',
    lightColor: '#fff7ed',
    steps: [
      { icon: GraduationCap, text: 'Choisir groupe' },
      { icon: Plus,          text: 'Ajouter créneau' },
      { icon: Edit3,         text: 'Modifier / Supprimer' },
      { icon: Layers,        text: 'Vérif. conflits' },
    ],
    detail: {
      navigation: [
        'Sélectionner la spécialité (SITW, 1ère Ingénieur)',
        'Puis le groupe (G1, G2, G3…)',
        'Le planning de la semaine s\'affiche (5 jours × 5 créneaux)',
      ],
      add: [
        'Cliquer sur une cellule vide ou sur "Ajouter un créneau"',
        'Sélectionner le module (la liste filtre les types disponibles)',
        'Choisir le type de séance (Cours, TD, TP selon les assignations)',
        'Choisir le professeur (filtré selon le type)',
        'Choisir la salle',
        'Enregistrer — conflits détectés automatiquement',
      ],
      edit: 'Cliquer sur un créneau existant pour le modifier ou le supprimer. La modification met à jour le planning en temps réel.',
      mobile: 'Sur mobile, navigation par onglets de jours. Les créneaux s\'affichent en liste verticale pour chaque jour sélectionné.',
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

// Mini démo Dashboard
const DashboardDemo = ({ detail }) => {
  const [activeInsight, setActiveInsight] = useState(0);

  return (
    <div className="space-y-4 mt-2">
      {/* Stats mini */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          Statistiques globales
        </p>
        <div className="grid grid-cols-2 gap-2">
          {detail.stats.map(s => (
            <div key={s.label} className="bg-[#f1f4f2] rounded-2xl p-3">
              <p className="font-black text-[#1a1c1e] text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {s.label}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          Insights système
        </p>
        <div className="flex gap-2 mb-2">
          {detail.insights.map((ins, i) => {
            const IIcon = ins.Icon;
            return (
              <button
                key={ins.label}
                onClick={() => setActiveInsight(i)}
                className={`flex-1 flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${
                  activeInsight === i ? ins.cls + ' ring-2 ring-current/20' : 'bg-[#f1f4f2] text-gray-400'
                }`}
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <IIcon size={12} strokeWidth={2.5} />
                <span className="truncate">{ins.label}</span>
              </button>
            );
          })}
        </div>
        <div className="bg-[#f1f4f2] rounded-2xl p-3">
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Les insights se mettent à jour automatiquement toutes les 10 secondes et tournent entre les différentes métriques détectées par le système.
          </p>
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          Actions rapides
        </p>
        <div className="space-y-2">
          {detail.actions.map(action => {
            const AIcon = action.Icon;
            return (
              <div key={action.label} className="flex items-start gap-3 bg-[#f1f4f2] rounded-2xl p-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#006c49] text-white shrink-0">
                  <AIcon size={15} />
                </div>
                <div>
                  <p className="font-black text-[#1a1c1e] text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {action.label}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-relaxed">{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Mini démo étudiants
const StudentsDemo = ({ detail }) => (
  <div className="space-y-4 mt-2">
    {/* Filtres */}
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}>
        Filtres disponibles
      </p>
      <div className="space-y-1.5">
        {detail.filters.map(f => (
          <div key={f.label} className="flex items-start gap-2.5 bg-[#f1f4f2] rounded-2xl p-3">
            <Filter size={13} className="text-[#1a1c1e] shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-[#1a1c1e] text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {f.label} —{' '}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Tri */}
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}>
        Options de tri
      </p>
      <div className="flex flex-wrap gap-2">
        {detail.sorts.map(s => (
          <span
            key={s}
            className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-[#1a1c1e] uppercase tracking-wide shadow-sm"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>

    {/* Risque */}
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}>
        Statut de présence
      </p>
      <div className="space-y-2">
        {detail.risk.map(r => {
          const RIcon = r.Icon;
          return (
            <div key={r.label} className={`flex items-center gap-3 rounded-2xl p-3 ${r.cls}`}>
              <RIcon size={18} strokeWidth={2.5} />
              <div>
                <p className="font-black text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>{r.label}</p>
                <p className="text-[10px] font-bold opacity-70">{r.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Fiche détail */}
    <div className="bg-[#1a1c1e] rounded-2xl p-4 flex items-start gap-3">
      <Eye size={15} className="text-[#006c49] shrink-0 mt-0.5" />
      <p className="text-xs text-gray-300 font-medium leading-relaxed">{detail.detail}</p>
    </div>

    {/* Export */}
    <div className="bg-[#f1f4f2] rounded-2xl p-3 flex items-start gap-2.5">
      <Download size={14} className="text-gray-500 shrink-0 mt-0.5" />
      <p className="text-xs text-gray-600 font-medium leading-relaxed">{detail.export}</p>
    </div>
  </div>
);

// Mini démo professeurs
const ProfsDemo = ({ detail }) => (
  <div className="space-y-4 mt-2">
    {/* Filtres */}
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}>
        Filtres disponibles
      </p>
      <div className="space-y-1.5">
        {detail.filters.map(f => (
          <div key={f.label} className="flex items-start gap-2.5 bg-[#eef2ff] border border-indigo-100 rounded-2xl p-3">
            <Filter size={13} className="text-[#4f46e5] shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-[#1a1c1e] text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {f.label} —{' '}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Tri */}
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}>
        Options de tri
      </p>
      <div className="flex flex-wrap gap-2">
        {detail.sorts.map(s => (
          <span
            key={s}
            className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-[#1a1c1e] uppercase tracking-wide shadow-sm"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>

    {/* Modal slides */}
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}>
        Fiche détail professeur (2 slides)
      </p>
      <div className="space-y-2">
        {detail.modal.map(m => (
          <div key={m.label} className="bg-[#1a1c1e] rounded-2xl p-3 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-[#006c49] flex items-center justify-center shrink-0">
              <BarChart2 size={12} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>{m.label}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Export */}
    <div className="bg-[#f1f4f2] rounded-2xl p-3 flex items-start gap-2.5">
      <Download size={14} className="text-gray-500 shrink-0 mt-0.5" />
      <p className="text-xs text-gray-600 font-medium leading-relaxed">{detail.export}</p>
    </div>
  </div>
);

// Mini démo planning
const PlanningDemo = ({ detail }) => {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4 mt-2">
      {/* Navigation */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          Navigation hiérarchique
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {['Spécialité', 'Groupe', 'Jour', 'Créneau'].map((step, i) => (
            <React.Fragment key={step}>
              <span
                className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-[#1a1c1e] uppercase tracking-wide shadow-sm"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {step}
              </span>
              {i < 3 && <ChevronRight size={12} className="text-gray-300" strokeWidth={3} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Étapes ajout */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          Ajouter un créneau
        </p>
        <ol className="space-y-1.5">
          {detail.add.map((step, i) => (
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

      {/* Mini grille aperçu */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          Aperçu de la grille
        </p>
        <div className="bg-white/60 rounded-2xl p-3 overflow-x-auto">
          <div className="grid grid-cols-4 gap-1.5 min-w-[260px]">
            {/* Header */}
            {['08:30', 'Dim', 'Lun', 'Mar'].map(h => (
              <div
                key={h}
                className="text-center text-[9px] font-black uppercase tracking-widest py-1.5 rounded-lg bg-[#1a1c1e] text-white"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {h}
              </div>
            ))}
            {/* Row */}
            <div className="text-center text-[9px] font-black py-1.5 text-gray-400">—</div>
            {/* Créneau rempli */}
            <div
              className="col-span-1 bg-white border border-gray-100 rounded-xl p-2 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setAdding(a => !a)}
            >
              <p className="text-[8px] font-black text-[#006c49] uppercase">TP</p>
              <p className="text-[9px] font-black text-[#1a1c1e] leading-tight">Base de données</p>
              <p className="text-[8px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                <MapPin size={7} /> Salle B12
              </p>
            </div>
            {/* Créneau vide */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center" style={{ minHeight: 48 }}>
              <Plus size={14} className="text-gray-300" />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <Plus size={14} className="text-gray-300" />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium mt-1.5">
          Cliquer sur un créneau existant pour le modifier ou le supprimer.
        </p>
      </div>

      {/* Vérificateur conflits */}
      <div className="bg-[#1a1c1e] rounded-2xl p-4 flex items-start gap-3">
        <Layers size={15} className="text-[#006c49] shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-white text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Vérificateur de conflits
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-relaxed">
            Le système détecte automatiquement les conflits : même prof, même salle ou même groupe sur le même créneau. Un message d'erreur explicite est affiché avant l'enregistrement.
          </p>
        </div>
      </div>

      {/* Mobile */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-start gap-2.5">
        <Shield size={14} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-700 font-bold leading-relaxed">{detail.mobile}</p>
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
            <div className="px-5 pb-6 pt-1 border-t border-gray-50">
              {section.id === 'dashboard'   && <DashboardDemo detail={section.detail} />}
              {section.id === 'etudiants'   && <StudentsDemo  detail={section.detail} />}
              {section.id === 'professeurs' && <ProfsDemo     detail={section.detail} />}
              {section.id === 'planning'    && <PlanningDemo  detail={section.detail} />}
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
const AdminInfoModal = ({ onClose }) =>
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
                UniCheck · Espace Administrateur
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
              En tant qu'administrateur, tu as accès à la gestion complète de la plateforme : utilisateurs, plannings, modules et statistiques globales.
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
            <Server size={20} className="text-[#006c49] shrink-0 mt-0.5" />
            <div>
              <p
                className="font-black text-white text-sm tracking-tighter"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Contrôle total de la plateforme
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
                L'administrateur est le seul à pouvoir modifier les fiches étudiants (Device ID, spécialité, groupe), créer des modules avec assignations et gérer le planning global.
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
const AdminInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Aide & Fonctionnalités Admin"
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen ? 'bg-[#d1f4e0] text-[#006c49]' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        <HelpCircle size={22} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {isOpen && <AdminInfoModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminInfo;