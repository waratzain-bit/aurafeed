import React from "react";
import { X, Globe, Mail, Award, BookOpen, Star, Link, User, Send } from "lucide-react";

interface AuthorProfileModalProps {
  authorName: string | null;
  onClose: () => void;
}

interface AuthorData {
  displayName: string;
  role: string;
  bio: string;
  avatarColor: string;
  links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    globe?: string;
    mail?: string;
  };
  metrics: {
    contributions: number;
    stars: number;
    specialty: string;
  };
}

const AUTHOR_REGISTRY: Record<string, AuthorData> = {
  waratzain: {
    displayName: "Waratzain",
    role: "Pemimpin Redaksi & Lead Developer",
    bio: "Pegiat teknologi web, Cloud Architect, dan antusias kecerdasan buatan. Berdedikasi menyusun arsitektur penyebaran informasi transparan melalui integrasi modern Google Sheets dan Google Gemini SDK.",
    avatarColor: "from-emerald-500 to-teal-600",
    links: {
      twitter: "https://twitter.com/waratzain_",
      github: "https://github.com/waratzain",
      globe: "https://aurapost.id",
      mail: "mailto:waratzain@gmail.com"
    },
    metrics: {
      contributions: 42,
      stars: 189,
      specialty: "Sistem Terdistribusi & AI"
    }
  },
  nadiautami: {
    displayName: "Nadia Utami",
    role: "Desainer Grafis & Koresponden UI/UX",
    bio: "Pecinta seni rupa digital dan interaksi manusia-komputer. Berfokus pada perancangan mading digital interaktif dan estetika visual modern yang ramah pengguna di era informasi instan.",
    avatarColor: "from-pink-500 to-rose-600",
    links: {
      twitter: "https://twitter.com/nadia_utami",
      linkedin: "https://linkedin.com/in/nadia-utami",
      globe: "https://behance.net/nadiautami",
      mail: "mailto:nadia@aurafeed.id"
    },
    metrics: {
      contributions: 19,
      stars: 112,
      specialty: "Aesthetic Design & UX"
    }
  },
  zulfikar: {
    displayName: "Zulfikar",
    role: "Analis Kebijakan Teknologi",
    bio: "Peneliti independen yang mendalami dampak sosial otomatisasi, digitalisasi publikasi beralas AI, serta tata kelola privasi data modern. Tulisan opininya tajam dan berbasis riset empiris.",
    avatarColor: "from-sky-500 to-blue-600",
    links: {
      twitter: "https://twitter.com/zulfikar_tech",
      github: "https://github.com/zulfikar-tech",
      linkedin: "https://linkedin.com/in/zulfikar-tech",
      mail: "mailto:zulfikar@technobeta.id"
    },
    metrics: {
      contributions: 28,
      stars: 94,
      specialty: "Sosiologi Digital & Kebijakan"
    }
  }
};

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({ authorName, onClose }) => {
  if (!authorName) return null;

  // Clean name for registry lookup
  const cleanKey = authorName.toLowerCase().replace(/\s+/g, "");
  
  // Find author in registry or create fallback profile
  const authorData: AuthorData = AUTHOR_REGISTRY[cleanKey] || {
    displayName: authorName,
    role: "Kontributor Independen",
    bio: `Penulis opini dan jurnalis warga aktif di Technobeta. Berbagi perspektif unik seputar perkembangan era transformasi digital, inovasi komunitas, serta pemikiran analitis.`,
    avatarColor: "from-amber-500 to-orange-600",
    links: {
      globe: window.location.origin,
      mail: `mailto:${cleanKey}@technobeta.id`
    },
    metrics: {
      contributions: 8,
      stars: 15,
      specialty: "Opini Umum & Kreatif"
    }
  };

  const initials = authorData.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Container Card */}
      <div 
        id="author-profile-container" 
        className="relative bg-[#11100f] border border-neutral-850 w-full max-w-md rounded-3xl p-6 overflow-hidden md:max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Background ambient light */}
        <div className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${authorData.avatarColor} opacity-[0.06] rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`} />

        {/* Header toolbar */}
        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-emerald-400" />
            <span className="text-[9px] font-mono font-extrabold tracking-widest text-neutral-500 uppercase">
              PROFIL KONTRIBUTOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-neutral-850 hover:bg-neutral-905 hover:border-neutral-750 transition-colors cursor-pointer outline-none"
            title="Tutup Profil"
          >
            <X className="h-4.5 w-4.5 text-neutral-400 hover:text-neutral-200" />
          </button>
        </div>

        {/* Bio Grid */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative border-b border-neutral-850/60 pb-6 mb-5">
          {/* Avatar Area */}
          <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${authorData.avatarColor} p-0.5 shadow-lg shrink-0 flex items-center justify-center text-xl sm:text-2xl font-black text-neutral-100 font-mono tracking-wider select-none`}>
            <div className="bg-[#11100f] w-full h-full rounded-full flex items-center justify-center">
              <span className={`bg-gradient-to-br ${authorData.avatarColor} bg-clip-text text-transparent`}>{initials}</span>
            </div>
          </div>

          {/* Core Info */}
          <div className="flex flex-col text-center sm:text-left gap-1">
            <h2 className="text-xl font-bold text-neutral-100 font-sans tracking-tight">
              {authorData.displayName}
            </h2>
            <div className="inline-flex items-center justify-center sm:justify-start gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-450 shrink-0" />
              <span className="text-xs text-neutral-400 font-medium">{authorData.role}</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed mt-2.5 font-sans font-normal">
              {authorData.bio}
            </p>
          </div>
        </div>

        {/* Micro Stats Row */}
        <div className="grid grid-cols-3 gap-3.5 bg-black/30 border border-neutral-850/80 p-3.5 rounded-2xl mb-6">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-mono text-neutral-550 uppercase tracking-widest font-bold flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-neutral-550" /> Karya
            </span>
            <span className="text-base font-bold font-mono text-neutral-250 mt-1">
              {authorData.metrics.contributions}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-x border-neutral-850/60">
            <span className="text-[8px] font-mono text-neutral-550 uppercase tracking-widest font-bold flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" /> Presensi
            </span>
            <span className="text-base font-bold font-mono text-amber-450 mt-1">
              {authorData.metrics.stars}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[8px] font-mono text-neutral-550 uppercase tracking-widest font-bold">
              Keahlian
            </span>
            <span className="text-[10px] font-bold text-neutral-350 mt-1.5 truncate max-w-[110px] font-sans" title={authorData.metrics.specialty}>
              {authorData.metrics.specialty}
            </span>
          </div>
        </div>

        {/* Social Media Link Container */}
        <div className="flex flex-col gap-3 relative">
          <span className="text-[8px] font-mono font-bold tracking-wider text-neutral-500">
            METODE KONTAK & SOSIAL MEDIA:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {authorData.links.twitter && (
              <a
                href={authorData.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-sky-500/10 border border-neutral-850 hover:border-sky-500/20 text-neutral-300 hover:text-sky-450 text-xs rounded-xl font-medium transition-all"
              >
                <Send className="h-3.5 w-3.5 text-sky-400 rotate-[-25deg]" />
                <span className="font-mono text-[10.5px]">Twitter</span>
              </a>
            )}

            {authorData.links.github && (
              <a
                href={authorData.links.github}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-neutral-800/60 border border-neutral-850 hover:border-neutral-750 text-neutral-300 hover:text-neutral-100 text-xs rounded-xl font-medium transition-all"
              >
                <Link className="h-3.5 w-3.5 text-neutral-400" />
                <span className="font-mono text-[10.5px]">GitHub</span>
              </a>
            )}

            {authorData.links.linkedin && (
              <a
                href={authorData.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-blue-500/10 border border-neutral-850 hover:border-blue-500/20 text-neutral-300 hover:text-blue-400 text-xs rounded-xl font-medium transition-all"
              >
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-mono text-[10.5px]">LinkedIn</span>
              </a>
            )}

            {authorData.links.globe && (
              <a
                href={authorData.links.globe}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-emerald-500/10 border border-neutral-850 hover:border-emerald-500/20 text-neutral-300 hover:text-emerald-450 text-xs rounded-xl font-medium transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-mono text-[10.5px]">Website</span>
              </a>
            )}

            {authorData.links.mail && (
              <a
                href={authorData.links.mail}
                className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-purple-500/10 border border-neutral-850 hover:border-purple-500/20 text-neutral-300 hover:text-purple-400 text-xs rounded-xl font-medium transition-all ml-auto"
              >
                <Mail className="h-3.5 w-3.5 text-purple-400" />
                <span className="font-mono text-[10.5px]">Kirim Email</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
