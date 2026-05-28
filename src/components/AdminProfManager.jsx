import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  GraduationCap,
  Download,
  Loader2,
  X,
  RefreshCw,
  BookOpen,
  Clock,
  FileText,
  Mail,
  ArrowUpDown,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const API = "https://backend-unicheck.onrender.com";

// ─────────────────────────────────────────────────────────
// CSV EXPORT
// ─────────────────────────────────────────────────────────
const exportToCSV = (profs) => {
  const headers = [
    "ID",
    "Nom",
    "Prénom",
    "Email",
    "Modules",
    "Présence",
    "Séances",
    "Heures",
    "Justificatifs",
  ];

  const rows = profs.map((p) => [
    p.id,
    p.nom,
    p.prenom,
    p.email,
    (p.modules || []).join(" / "),
    `${p.tauxPresenceGlobal || 0}%`,
    p.seancesTerminees || 0,
    p.heuresFormat || "0h",
    p.justifsAttente || 0,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `professeurs_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  a.click();

  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────
// AVATAR COLORS
// ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-emerald-500 to-green-600",
  "from-violet-500 to-purple-600",
  "from-orange-500 to-amber-500",
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-pink-500",
];

const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────
const ProfCard = ({ prof, onClick, index }) => {
  const initials =
    (prof.prenom?.[0] || "") + (prof.nom?.[0] || "");

  const hasJustifs = prof.justifsAttente > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -6 }}
      onClick={() => onClick(prof)}
      className="group relative overflow-hidden rounded-[2.2rem]
      border border-white/70 bg-white/90 backdrop-blur-xl
      shadow-[0_10px_40px_rgba(0,0,0,0.04)]
      hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]
      transition-all duration-300 cursor-pointer"
    >
      {/* background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-100 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 space-y-5">
        {/* TOP */}
        <div className="flex items-start justify-between">
          <div
            className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${getAvatarColor(
              prof.nom
            )} flex items-center justify-center text-white
            font-black text-2xl shadow-lg`}
          >
            {initials}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                {prof.tauxPresenceGlobal || 0}% présence
              </span>
            </div>

            {hasJustifs && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                  {prof.justifsAttente} attente
                </span>
              </div>
            )}
          </div>
        </div>

        {/* NAME */}
        <div>
          <h3 className="text-[1.2rem] font-black tracking-tight text-[#111] uppercase leading-tight">
            {prof.nom} {prof.prenom}
          </h3>

          <a
            href={`mailto:${prof.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 mt-2 text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <Mail size={13} />
            <span className="text-xs font-semibold truncate">
              {prof.email}
            </span>
          </a>
        </div>

        {/* MODULES */}
        {prof.modules?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prof.modules.slice(0, 3).map((m) => (
              <span
                key={m}
                className="px-3 py-1.5 rounded-xl bg-[#f4f6f8]
                text-[10px] uppercase tracking-widest font-black text-gray-600"
              >
                {m}
              </span>
            ))}

            {prof.modules.length > 3 && (
              <span
                className="px-3 py-1.5 rounded-xl bg-[#f4f6f8]
                text-[10px] uppercase tracking-widest font-black text-gray-400"
              >
                +{prof.modules.length - 3}
              </span>
            )}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#f7f8fa] p-3 text-center">
            <Clock size={14} className="mx-auto text-gray-400 mb-1" />
            <p className="font-black text-lg text-[#111] leading-none">
              {prof.heuresFormat || "0h"}
            </p>
            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-1">
              Heures
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f8fa] p-3 text-center">
            <BookOpen size={14} className="mx-auto text-gray-400 mb-1" />
            <p className="font-black text-lg text-[#111] leading-none">
              {prof.seancesTerminees || 0}
            </p>
            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-1">
              Séances
            </p>
          </div>

          <div
            className={`rounded-2xl p-3 text-center ${
              hasJustifs ? "bg-orange-50" : "bg-[#f7f8fa]"
            }`}
          >
            <FileText
              size={14}
              className={`mx-auto mb-1 ${
                hasJustifs ? "text-orange-500" : "text-gray-400"
              }`}
            />

            <p
              className={`font-black text-lg leading-none ${
                hasJustifs ? "text-orange-600" : "text-[#111]"
              }`}
            >
              {prof.justifsAttente || 0}
            </p>

            <p className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-1">
              Justifs
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={15} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Profil actif
            </span>
          </div>

          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-emerald-600 transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────
const ProfModal = ({ prof, onClose }) => {
  if (!prof) return null;

  const initials =
    (prof.prenom?.[0] || "") + (prof.nom?.[0] || "");

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ y: 40, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="relative z-10 w-full max-w-xl rounded-[2.5rem]
          overflow-hidden bg-white shadow-2xl"
        >
          {/* HEADER */}
          <div className="relative bg-[#111] p-8 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full
              bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-5 relative z-10">
              <div
                className={`w-20 h-20 rounded-[1.8rem] bg-gradient-to-br ${getAvatarColor(
                  prof.nom
                )} flex items-center justify-center
                text-white text-3xl font-black shadow-xl`}
              >
                {initials}
              </div>

              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {prof.prenom} {prof.nom}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  {prof.email}
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#f7f8fa] p-4 text-center">
                <Clock className="mx-auto text-gray-400 mb-2" size={18} />
                <p className="text-2xl font-black">
                  {prof.heuresFormat || "0h"}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">
                  Heures
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f8fa] p-4 text-center">
                <BookOpen className="mx-auto text-gray-400 mb-2" size={18} />
                <p className="text-2xl font-black">
                  {prof.seancesTerminees || 0}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">
                  Séances
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4 text-center">
                <AlertCircle
                  className="mx-auto text-orange-500 mb-2"
                  size={18}
                />
                <p className="text-2xl font-black text-orange-600">
                  {prof.justifsAttente || 0}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">
                  Justifs
                </p>
              </div>
            </div>

            {/* modules */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-3">
                Modules enseignés
              </p>

              <div className="flex flex-wrap gap-2">
                {(prof.modules || []).map((m) => (
                  <span
                    key={m}
                    className="px-4 py-2 rounded-2xl bg-[#f7f8fa]
                    text-sm font-bold text-[#111]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* presence */}
            <div className="rounded-[2rem] bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest font-black text-white/70">
                    Taux de présence
                  </p>

                  <h3 className="text-5xl font-black mt-2">
                    {prof.tauxPresenceGlobal || 0}%
                  </h3>
                </div>

                <TrendingUp size={50} className="text-white/40" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
const AdminProfManager = () => {
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("A-Z");

  const [selectedProf, setSelectedProf] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchProfs = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/api/professeurs/admin/tous-avec-stats`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        setProfs(data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfs();
  }, [fetchProfs]);

  const filtered = useMemo(() => {
    const arr = profs.filter((p) => {
      return (
        p.nom?.toLowerCase().includes(search.toLowerCase()) ||
        p.prenom?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
      );
    });

    arr.sort((a, b) => {
      if (sortBy === "Présence +") {
        return (
          (b.tauxPresenceGlobal || 0) -
          (a.tauxPresenceGlobal || 0)
        );
      }

      if (sortBy === "Présence -") {
        return (
          (a.tauxPresenceGlobal || 0) -
          (b.tauxPresenceGlobal || 0)
        );
      }

      return (a.nom || "").localeCompare(b.nom || "");
    });

    return arr;
  }, [profs, search, sortBy]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f6f8fa] to-[#eef2f5]
      px-4 md:px-8 pt-24 pb-24 overflow-hidden"
    >
      {/* background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100 blur-[120px] opacity-40 rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br
                from-emerald-500 to-green-600
                flex items-center justify-center shadow-xl"
              >
                <GraduationCap size={30} className="text-white" />
              </div>

              <div>
                <h1
                  className="text-5xl md:text-7xl font-black tracking-tight
                  text-[#111] leading-none"
                >
                  Professeurs
                  <span className="text-emerald-600">.</span>
                </h1>

                <p
                  className="mt-2 text-[11px] uppercase tracking-[0.35em]
                  font-black text-gray-400"
                >
                  Gestion intelligente des enseignants
                </p>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProfs}
              className="w-14 h-14 rounded-2xl bg-white border border-gray-200
              flex items-center justify-center hover:bg-gray-50 transition-all"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={() => exportToCSV(filtered)}
              className="h-14 px-6 rounded-2xl bg-[#111] hover:bg-emerald-600
              transition-all text-white font-black uppercase tracking-widest
              text-xs flex items-center gap-3 shadow-xl"
            >
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Users,
              label: "Professeurs",
              value: profs.length,
            },
            {
              icon: BookOpen,
              label: "Séances",
              value: profs.reduce(
                (acc, p) => acc + (p.seancesTerminees || 0),
                0
              ),
            },
            {
              icon: Clock,
              label: "Heures",
              value:
                profs.reduce(
                  (acc, p) => acc + (p.heures || 0),
                  0
                ) + "h",
            },
            {
              icon: AlertCircle,
              label: "Justificatifs",
              value: profs.reduce(
                (acc, p) => acc + (p.justifsAttente || 0),
                0
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[2rem] bg-white/80 backdrop-blur-xl
              border border-white shadow-sm p-5"
            >
              <div className="flex items-center justify-between">
                <item.icon size={22} className="text-emerald-600" />

                <span className="text-3xl font-black text-[#111]">
                  {item.value}
                </span>
              </div>

              <p
                className="mt-4 text-[10px] uppercase tracking-widest
                font-black text-gray-400"
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div
          className="rounded-[2.5rem] bg-white/90 backdrop-blur-xl
          border border-white shadow-sm p-5 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Rechercher un professeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 rounded-2xl bg-[#f6f8fa]
                pl-14 pr-5 outline-none border border-transparent
                focus:border-emerald-200 focus:bg-white
                transition-all font-semibold"
              />
            </div>

            {/* sort */}
            <div className="flex items-center bg-[#f6f8fa] rounded-2xl p-1">
              <div className="px-3 text-gray-400">
                <ArrowUpDown size={15} />
              </div>

              {["A-Z", "Présence +", "Présence -"].map((item) => (
                <button
                  key={item}
                  onClick={() => setSortBy(item)}
                  className={`px-4 h-12 rounded-xl text-[10px]
                  uppercase tracking-widest font-black transition-all
                  ${
                    sortBy === item
                      ? "bg-white shadow-sm text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2
              size={42}
              className="animate-spin text-emerald-600"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-[3rem] bg-white/70 border border-dashed
            border-gray-200 py-24 text-center"
          >
            <Search
              size={45}
              className="mx-auto text-gray-200 mb-5"
            />

            <p
              className="uppercase tracking-widest text-sm
              font-black text-gray-400"
            >
              Aucun professeur trouvé
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((prof, index) => (
              <ProfCard
                key={prof.id}
                prof={prof}
                index={index}
                onClick={setSelectedProf}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <ProfModal
        prof={selectedProf}
        onClose={() => setSelectedProf(null)}
      />
    </div>
  );
};

export default AdminProfManager;