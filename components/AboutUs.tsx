import React from "react";
import { Users, ShieldCheck, HelpCircle, Mail, MapPin, Feather } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-6 md:p-8 flex flex-col gap-6 select-text text-neutral-300 leading-relaxed text-xs sm:text-sm">
      
      {/* Banner */}
      <div className="flex flex-col gap-2.5 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
          Tentang Technobeta: Media Publikasi Transparan
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Technobeta adalah platform penerbitan mading digital & tulisan opini modern yang menjembatani keandalan database nir-server (serverless) Google Sheets dengan kecerdasan kognitif model AI generatif (Google Gemini).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left column info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 mt-0.5 shrink-0">
              <Feather className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-200 text-xs uppercase tracking-wider font-mono">Pedoman Editorial Kami</h3>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                Setiap materi, riset teknologi, tulisan desain, dan opini bebas yang diterbitkan pada Technobeta harus mematuhi kode etik keaslian tulisan, netralitas, serta tidak memuat konten pelanggaran hak cipta.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 mt-0.5 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-200 text-xs uppercase tracking-wider font-mono">Verifikasi Manusia (Human-in-the-loop)</h3>
              <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                Meskipun kami memanfaatkan integrasi instan Gemini model, draf tulisan harus disaring, diperbaiki kosa katanya, dan dikonfirmasi langsung oleh tim penulis siber kami sebelum resmi tayang.
              </p>
            </div>
          </div>
        </div>

        {/* Right column team & locations */}
        <div className="flex flex-col gap-4 bg-neutral-950/40 p-4 rounded-xl border border-neutral-850/60 font-mono text-[11px] text-neutral-400">
          <span className="font-bold text-neutral-200 text-[12px] uppercase">Informasi Penerbit</span>
          
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Pendiri & Direktur: <strong className="text-neutral-300">Waratzain (waratzain@gmail.com)</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Kontak Media: <strong className="text-neutral-300">waratzain@gmail.com</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Operasional: <strong className="text-neutral-300">Jakarta, Indonesia</strong></span>
          </div>

          <div className="bg-emerald-950/25 border border-emerald-900/30 p-2.5 rounded-lg text-[10px] leading-relaxed text-emerald-300 mt-2">
            <strong>AdSense Compliance:</strong> Situs web ini didesain sepenuhnya responsif, ramah mesin telusur (SEO Friendly), memiliki navigasi tumpukan hierarki yang jelas, serta tidak mengandung jebakan tautan atau spam konten.
          </div>
        </div>

      </div>

    </div>
  );
}
