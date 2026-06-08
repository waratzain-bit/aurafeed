import React, { useState } from "react";
import { Settings, Layout, Link, Database, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, FileText, Globe, Image, Sparkles } from "lucide-react";
import { SheetsConfig, Post } from "../types";
import { generateSitemapXml } from "../lib/utils";

interface SettingsWorkspaceProps {
  websiteTitle: string;
  onUpdateWebsiteTitle: (title: string) => void;
  sheetsConfig: SheetsConfig;
  onSaveUrl: (url: string) => void;
  onDisconnect: () => void;
  onResetToDefault: () => void;
  postsCount: number;
  adsensePubId: string;
  onUpdateAdsensePubId: (pubId: string) => void;
  posts?: Post[];
  
  // Custom Banner Hero Background & Headline customization props
  heroSlogan: string;
  onUpdateHeroSlogan: (slogan: string) => void;
  heroDescription: string;
  onUpdateHeroDescription: (desc: string) => void;
  heroBgImage: string;
  onUpdateHeroBgImage: (bg: string) => void;
}

export default function SettingsWorkspace({
  websiteTitle,
  onUpdateWebsiteTitle,
  sheetsConfig,
  onSaveUrl,
  onDisconnect,
  onResetToDefault,
  postsCount,
  adsensePubId,
  onUpdateAdsensePubId,
  posts = [],
  heroSlogan,
  onUpdateHeroSlogan,
  heroDescription,
  onUpdateHeroDescription,
  heroBgImage,
  onUpdateHeroBgImage,
}: SettingsWorkspaceProps) {
  const [tempTitle, setTempTitle] = useState(websiteTitle);
  const [sheetsUrl, setSheetsUrl] = useState(sheetsConfig.webAppUrl);
  const [tempAdsenseId, setTempAdsenseId] = useState(adsensePubId);
  const [isSaved, setIsSaved] = useState(false);
  const [isAdsenseSaved, setIsAdsenseSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSitemapCopied, setIsSitemapCopied] = useState(false);
  const [showSitemapView, setShowSitemapView] = useState(false);

  // States for Hero configuration
  const [tempSlogan, setTempSlogan] = useState(heroSlogan);
  const [tempDescription, setTempDescription] = useState(heroDescription);
  const [tempBgImage, setTempBgImage] = useState(heroBgImage);
  const [isHeroSaved, setIsHeroSaved] = useState(false);

  const handleSaveTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempTitle.trim()) {
      alert("Judul website tidak boleh kosong!");
      return;
    }
    onUpdateWebsiteTitle(tempTitle.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSlogan.trim()) {
      alert("Slogan utama tidak boleh kosong!");
      return;
    }
    onUpdateHeroSlogan(tempSlogan.trim());
    onUpdateHeroDescription(tempDescription.trim());
    onUpdateHeroBgImage(tempBgImage.trim());
    setIsHeroSaved(true);
    setTimeout(() => setIsHeroSaved(false), 2500);
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (localStorage is limited to 5MB total, so let's limit image to ~1.2MB)
    if (file.size > 1500000) {
      alert("Berkas terlalu besar! Batas ukuran gambar latar adalah 1.5MB agar penyimpanan lokal peramban tetap optimal.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        setTempBgImage(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSheetsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(sheetsUrl.trim());
    alert("Koneksi spreadsheet tersimpan!");
  };

  const confirmReset = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang data postingan kembali ke bawaan sistem? Semua postingan buatan lokal akan terhapus.")) {
      onResetToDefault();
      alert("Data berhasil disetel ulang!");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn select-text text-neutral-300">
      
      {/* Banner */}
      <div className="flex flex-col gap-2 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Settings className="h-5 w-5 text-emerald-400" />
          Setelan Publikasi & Database
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Kelola rincian konfigurasi visual situs web, judul landing page, integrasi database Google Sheets nir-server, serta preferensi editorial siber Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column forms */}
        <div className="flex flex-col gap-6">
          
          {/* Form Judul Website */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <Layout className="h-4.5 w-4.5 text-emerald-400" />
              Sesuaikan Judul Website
            </h3>
            
            <form onSubmit={handleSaveTitleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Judul / Brand Utama</label>
                <input
                  type="text"
                  placeholder="Contoh: Technobeta / Mading Zain"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3 rounded-xl text-neutral-200 outline-none text-xs"
                />
              </div>

              {isSaved && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Judul website diperbarui secara instan!
                </span>
              )}

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md mt-1"
              >
                Simpan Judul Baru
              </button>
            </form>
          </div>

          {/* Form Kustomisasi Banner Hero Utama */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <Sparkles className="h-4.5 w-4.5 text-[#ff9f1c]" />
              Desain & Kustomisasi Hero Banner
            </h3>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Edit judul/slogan, deskripsi pengantar, dan desain/gambar latar utama yang terpampang di bagian atas beranda mading untuk memperjelas identitas profesional situs Anda.
            </p>

            <form onSubmit={handleSaveHeroSubmit} className="flex flex-col gap-4">
              {/* Input Slogan Utama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-550 uppercase tracking-wider font-mono">Slogan / Judul Utama Banner</label>
                <input
                  type="text"
                  placeholder="Contoh: Kreativitas Tanpa Batas. Terarsip Otomatis."
                  value={tempSlogan}
                  onChange={(e) => setTempSlogan(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-2.5 rounded-xl text-neutral-200 outline-none text-xs"
                />
              </div>

              {/* Input Deskripsi Banner */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-550 uppercase tracking-wider font-mono">Deskripsi / Paragraf Pengantar</label>
                <textarea
                  placeholder="Tulis orientasi portal redaksi mading Anda di sini secara menarik..."
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  rows={4}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-2.5 rounded-xl text-neutral-200 outline-none text-xs resize-none leading-relaxed"
                />
              </div>

              {/* Input Latar Belakang - URL atau Unggah Berkas */}
              <div className="flex flex-col gap-2 border-t border-neutral-900 pt-3">
                <label className="text-[10px] font-bold text-neutral-550 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Image className="h-3 w-3 text-emerald-400" />
                  Gambar Latar Belakang (BG Banner)
                </label>
                
                <p className="text-[10.5px] text-neutral-500 leading-normal">
                  Tempel URL gambar eksternal (misal dari Unsplash), gunakan kode gradien CSS, atau unggah gambar berukuran kecil dibawah 1.5MB secara langsung.
                </p>

                {/* Text input for URL or Gradient CSS string */}
                <input
                  type="text"
                  placeholder="Tempel tautan gambar, contoh: https://images.unsplash.com/... atau kode gradien CSS"
                  value={tempBgImage}
                  onChange={(e) => setTempBgImage(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-2.5 rounded-xl text-neutral-300 outline-none text-xs font-mono"
                />

                {/* Direct Upload input */}
                <div className="flex items-center gap-3 mt-1">
                  <label className="cursor-pointer py-1.5 px-3 bg-neutral-900 border border-neutral-850 hover:border-neutral-750 text-neutral-400 hover:text-neutral-200 font-mono text-[9px] font-bold uppercase rounded-lg transition-all">
                    📁 Pilih Gambar Unggahan
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      className="hidden"
                    />
                  </label>
                  {tempBgImage && tempBgImage.startsWith("data:image/") && (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      ✓ Gambar Pilihan Diunggah (Local)
                    </span>
                  )}
                  {tempBgImage && !tempBgImage.startsWith("data:image/") && (
                    <button
                      type="button"
                      onClick={() => setTempBgImage("")}
                      className="text-[9px] font-mono text-red-400 hover:underline"
                    >
                      [ Hapus Kustomisasi Latar ]
                    </button>
                  )}
                </div>

                {/* Gimmick Preset Backgrounds */}
                <div className="mt-2">
                  <span className="text-[8.5px] font-bold text-neutral-550 uppercase font-mono tracking-wider block mb-1.5">Preset Warna & Desain Cepat:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTempBgImage("")}
                      className={`text-[9.5px] font-mono p-1 rounded-lg border text-center transition-all ${!tempBgImage ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400"}`}
                    >
                      Bawaan Klasik
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempBgImage("linear-gradient(135deg, rgba(6,78,59,0.4) 0%, rgba(10,9,8,1) 100%)")}
                      className={`text-[9.5px] font-mono p-1 rounded-lg border text-center transition-all ${tempBgImage.includes("rgba(6,78,59") ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400"}`}
                    >
                      Cyber Emerald
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempBgImage("linear-gradient(135deg, rgba(76,29,149,0.3) 0%, rgba(10,9,8,1) 100%)")}
                      className={`text-[9.5px] font-mono p-1 rounded-lg border text-center transition-all ${tempBgImage.includes("rgba(76,29,149") ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400"}`}
                    >
                      Neon Cosmic
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempBgImage("linear-gradient(135deg, rgba(153,27,27,0.3) 0%, rgba(10,9,8,1) 100%)")}
                      className={`text-[9.5px] font-mono p-1 rounded-lg border text-center transition-all ${tempBgImage.includes("rgba(153,27,27") ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-neutral-900 bg-neutral-950 hover:border-neutral-800 text-neutral-400"}`}
                    >
                      Crimson Slate
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Saved Hero */}
              {isHeroSaved && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hero banner & background berhasil diperbarui!
                </span>
              )}

              <button
                type="submit"
                className="py-2 px-4 bg-[#ff9f1c] hover:bg-amber-500 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all mt-1 shadow-md"
              >
                Gunakan Desain & Slogan Baru
              </button>
            </form>
          </div>

          {/* Form Database Connection */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <Database className="h-4.5 w-4.5 text-emerald-400" />
              Database Google Sheets Link
            </h3>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Koneksikan mading digital Anda dengan spreadsheet pribadi sebagai database penyimpanan yang tangguh, aman, dan tanpa biaya.
            </p>

            <form onSubmit={handleSaveSheetsSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Google Apps Script Web App URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3 rounded-xl text-neutral-200 outline-none text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {sheetsConfig.isConnected ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Terhubung Online
                    </span>
                    <button
                      type="button"
                      onClick={onDisconnect}
                      className="text-[10px] font-mono font-bold text-red-400 hover:underline inline-block"
                    >
                      PUTUSKAN SINKRONISASI
                    </button>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Mode Offline aktif. Data Anda saat ini disimpan dengan aman di memori lokal peramban Anda.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-200 font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md mt-1"
              >
                {sheetsConfig.isConnected ? "Perbarui Alamat URL" : "Hubungkan Spreadsheet"}
              </button>
            </form>
          </div>

          {/* Form Google AdSense & ads.txt */}
          <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 font-mono uppercase">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              Setelan Google AdSense & ads.txt
            </h3>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Konfigurasikan ID Penayang Google AdSense Anda untuk menyesuaikan mading digital {websiteTitle} ini agar memenuhi kualifikasi persetujuan Google AdSense.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateAdsensePubId(tempAdsenseId.trim() || "pub-0000000000000000");
              setIsAdsenseSaved(true);
              setTimeout(() => setIsAdsenseSaved(false), 2500);
            }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">ID Penayang Google AdSense (Publisher ID)</label>
                <input
                  type="text"
                  placeholder="Contoh: pub-0000000000000000"
                  value={tempAdsenseId}
                  onChange={(e) => setTempAdsenseId(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3 rounded-xl text-neutral-200 outline-none text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-900 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase">Baris Autorisasi Penayang Anda:</span>
                <code className="text-emerald-400 font-mono text-[10.5px] block select-all break-all leading-relaxed">
                  google.com, {tempAdsenseId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`google.com, ${tempAdsenseId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0`);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="text-left text-[10px] font-mono text-emerald-400/80 hover:text-emerald-400 font-bold uppercase tracking-wider mt-1 hover:underline"
                >
                  {isCopied ? "✓ BARIS BERHASIL DISALIN!" : "📋 SALIN BARIS ADS.TXT"}
                </button>
              </div>

              <div className="text-[10.5px] leading-relaxed text-neutral-400 bg-neutral-950/40 p-3 rounded-xl border border-neutral-900">
                <p className="flex items-start gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
                  <span>
                    Pastikan Anda telah membuat berkas teks <strong className="text-neutral-300">ads.txt</strong> pada direktori utama (<code className="text-neutral-300 font-mono text-[9px]">/public/ads.txt</code>) yang memuat baris ID penayang Anda yang unik di atas.
                  </span>
                </p>
              </div>

              {isAdsenseSaved && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  ID Penayang AdSense disimpan & diaplikasikan!
                </span>
              )}

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md mt-1"
              >
                Simpan Setelan AdSense
              </button>
            </form>
          </div>

          {/* Pembersih Memori Local Storage */}
          <div className="bg-red-950/15 border border-red-900/20 rounded-2xl p-5 md:p-6 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-1 font-mono uppercase">
              <Trash2 className="h-4 w-4 text-red-500" />
              Area Penyetelan Ulang Data (Reset)
            </h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Jika memori peramban Anda penuh atau terdapat kegagalan struktur data lokal, Anda dapat menyetel ulang tulisan kembali ke draf prapustaka sistem. Tindakan ini bersifat permanen.
            </p>
            <button
              onClick={confirmReset}
              className="w-fit py-1.5 px-3 border border-red-900/50 hover:bg-red-900/10 text-red-400 font-mono text-[10px] font-bold uppercase rounded-lg transition-all"
            >
              Setel Ulang Data
            </button>
          </div>

        </div>

        {/* Right Column guidelines / checklist */}
        <div className="flex flex-col gap-4">
          
          <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-850 flex flex-col gap-4">
            <span className="font-bold text-neutral-200 text-xs uppercase font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Kepatuhan Kelulusan Google AdSense
            </span>

            <p className="text-neutral-400 text-xs leading-relaxed">
              Situs web {websiteTitle} ini dirancang mengikuti pedoman kualitas program Google Publisher Policies. Berikut adalah poin-poin kesiapan yang telah kami siapkan di dalam sasis Technobeta:
            </p>

            <ul className="flex flex-col gap-3 text-neutral-400 text-xs">
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Konten Menarik dan Informatif</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Menggunakan model AI berkemampuan tinggi untuk menghasilkan draf awal informatif tentang teknologi, seni, serta desain.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Navigasi yang Jelas dan Mudah Dipahami</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Dilengkapi sidebar editorial multi-fungsi serta navigasi tumpukan hierarki yang responsif tanpa link jebakan.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Halaman Wajib Terintegrasi (Legal)</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Sudah terpasang Kebijakan Privasi standar yang menerangkan cookie pengiklan, Ketentuan Layanan, serta Disclaimer khusus asisten kognitif AI.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">User Consent & GDPR Banner</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">Melampirkan spanduk persetujuan penggunaan cookie guna menghargai transparansi perolehan data analitis pembaca.</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-neutral-200">Autorisasi Penayang (ads.txt)</strong>
                  <p className="text-[11px] text-neutral-550 mt-0.5 leading-relaxed">
                    Pastikan Anda telah membuat berkas teks ads.txt pada direktori utama (/public/ads.txt) yang memuat baris ID penayang Anda yang unik, seperti:
                    <code className="block bg-neutral-950 text-emerald-400 font-mono text-[10px] p-2 rounded-lg border border-neutral-900 mt-1.5 overflow-x-auto select-all">
                      google.com, {adsensePubId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0
                    </code>
                  </p>
                </div>
              </li>
            </ul>

            <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl text-[11px] leading-relaxed text-emerald-300">
              <strong>Info Ringkasan:</strong> Terpasang {postsCount} draf tulisan di mading saat ini. Setiap artikel dilengkapi tagar meta untuk mempermudah perayapan indeks Search Engine Optimization (SEO).
            </div>
          </div>

          <div className="bg-[#121110] border border-neutral-850 p-5 rounded-2xl flex flex-col gap-2.5">
            <span className="font-bold text-neutral-200 text-xs uppercase font-mono flex items-center gap-1.5 text-yellow-400">
              <HelpCircle className="h-4 w-4" />
              Petunjuk Integrasi Google Sheets
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              1. Buka spreadsheet baru di Google Drive Anda.<br />
              2. Buat header baris pertama dengan kolom: <code className="text-emerald-400 font-mono">id, title, subtitle, content, category, categoryColor, imageUrl, tags, likes, views, createdAt, author</code>.<br />
              3. Salin kode skrip Apps Script Google Web App Anda.<br />
              4. Tempelkan URL tersebut ke kolom isian database di sebelah kiri dan klik simpan.
            </p>
          </div>

          {/* Google Search Console - Sitemap.xml Generator */}
          <div className="bg-[#121110] border border-neutral-850 p-5 rounded-2xl flex flex-col gap-3.5">
            <span className="font-bold text-neutral-200 text-xs uppercase font-mono flex items-center gap-1.5 text-emerald-400">
              <Globe className="h-4 w-4 text-emerald-400" />
              Search Console Sitemap.xml
            </span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Buat dan serahkan berkas sitemap web terformat XML ke kancah Google Search Console untuk melajukan pengindeksan tautan permalink situs berita secara tuntas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  if (!posts || posts.length === 0) {
                    alert("Tidak ada tulisan artikel untuk dibuat sitemap!");
                    return;
                  }
                  const sitemap = generateSitemapXml(posts);
                  navigator.clipboard.writeText(sitemap);
                  setIsSitemapCopied(true);
                  setTimeout(() => setIsSitemapCopied(false), 2000);
                }}
                className="py-2 px-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 focus:border-neutral-750 text-neutral-300 hover:text-emerald-400 font-mono text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isSitemapCopied ? "✓ BERHASIL DISALIN" : "📋 SALIN SITEMAP"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!posts || posts.length === 0) {
                    alert("Tidak ada tulisan artikel untuk dibuat sitemap!");
                    return;
                  }
                  const sitemap = generateSitemapXml(posts);
                  const blob = new Blob([sitemap], { type: "application/xml" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "sitemap.xml";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="py-2 px-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 focus:border-neutral-750 text-neutral-300 hover:text-emerald-400 font-mono text-[10px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📥 UNDUH .XML SITEMAP</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSitemapView(!showSitemapView)}
              className="w-full py-1.5 border border-dashed border-neutral-850 hover:border-neutral-750 text-neutral-500 hover:text-neutral-300 text-[10px] font-mono uppercase rounded-xl transition-all cursor-pointer"
            >
              {showSitemapView ? "[ Sembunyikan Pratinjau XML ]" : "[ Tampilkan Pratinjau XML ]"}
            </button>

            {showSitemapView && posts && posts.length > 0 && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <span className="text-[9px] font-bold font-mono text-neutral-500 uppercase tracking-wider">Berkas XML Tergenerasi:</span>
                <pre className="bg-neutral-950 border border-neutral-900 text-emerald-500/80 font-mono text-[9px] p-3 rounded-xl overflow-x-auto max-h-48 block select-all whitespace-pre leading-relaxed scrollbar-thin">
                  {generateSitemapXml(posts)}
                </pre>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
