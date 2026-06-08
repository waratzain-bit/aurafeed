import React, { useState, ChangeEvent } from "react";
import { Upload, X, Send, Sparkles, Brain, ArrowRight, RotateCw, PenTool, CheckCircle } from "lucide-react";
import { Post } from "../types";
import { generateAIDraft } from "../services/geminiService";

interface CreatePostWorkspaceProps {
  onPublish: (post: Omit<Post, "id" | "createdAt" | "likes" | "views">) => Promise<void>;
  onSuccess: () => void;
}

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
];

const TOPIC_SUGGESTIONS = [
  "Dampak Artificial Intelligence terhadap Kreator Konten",
  "Mengapa Negative Space adalah Senjata Rahasia Desainer Kontemporer",
  "Tips Membangun Karir Web Developer di Era Otomatisasi AI",
];

// Inline JPEG Image compressor helper
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        if (!ctx) return reject("Canvas context is null");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CreatePostWorkspace({ onPublish, onSuccess }: CreatePostWorkspaceProps) {
  const [writeMode, setWriteMode] = useState<"manual" | "ai">("manual");
  
  // SUCCESS PUBLISHED NOTIFICATION STATE
  const [showNotification, setShowNotification] = useState(false);

  // --- MANUAL MODE FIELDS ---
  const [manualTitle, setManualTitle] = useState("");
  const [manualSubtitle, setManualSubtitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualCategory, setManualCategory] = useState("Teknologi");
  const [manualAuthor, setManualAuthor] = useState("Waratzain");
  const [manualTagsInput, setManualTagsInput] = useState("");
  const [manualImageString, setManualImageString] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  // --- AI GENERATOR FIELDS & STEPS ---
  const [aiStep, setAiStep] = useState<"prompt" | "preview">("prompt");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("Teknologi");
  const [aiAuthor, setAiAuthor] = useState("Waratzain");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [aiResultDraft, setAiResultDraft] = useState({
    title: "",
    subtitle: "",
    content: "",
    tags: [] as string[],
    categoryColor: "emerald",
    imageUrl: UNSPLASH_IMAGES[0]
  });

  // --- MANUAL IMAGE SELECTION ---
  const handleManualImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(e.target.files[0]);
        setManualImageString(compressed);
      } catch (err) {
        alert("Gagal memproses gambar. Mohon gunakan format standard.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  // --- SUBMIT MANUAL FORM ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) {
      alert("Mohon isi judul dan isi tulisan Anda!");
      return;
    }

    setIsManualSubmitting(true);
    try {
      let categoryColor = "emerald";
      if (manualCategory === "Desain") categoryColor = "amber";
      if (manualCategory === "Karya") categoryColor = "sky";
      if (manualCategory === "Opini") categoryColor = "violet";

      const tags = manualTagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const defaultCover = manualImageString || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80";

      await onPublish({
        title: manualTitle.trim(),
        subtitle: manualSubtitle.trim(),
        content: manualContent.trim(),
        category: manualCategory,
        categoryColor,
        imageUrl: defaultCover,
        tags,
        author: manualAuthor.trim() || "Waratzain"
      });

      // Clear fields
      setManualTitle("");
      setManualSubtitle("");
      setManualContent("");
      setManualTagsInput("");
      setManualImageString("");

      // Trigger success notifications
      setShowNotification(true);
      onSuccess();
      setTimeout(() => setShowNotification(false), 4500);
    } catch (err) {
      alert("Terjadi masalah saat menerbitkan draf.");
    } finally {
      setIsManualSubmitting(false);
    }
  };

  // --- AI GENERATE SEEDS ---
  const handleAiGenerating = async (topicStr = aiPrompt) => {
    const finalTopic = topicStr.trim();
    if (!finalTopic) {
      setAiError("Mohon masukkan konsep ide/topik mading terlebih dahulu!");
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const generated = await generateAIDraft(finalTopic, aiCategory);
      const randomIdx = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
      const selectedImage = UNSPLASH_IMAGES[randomIdx];

      setAiResultDraft({
        title: generated.title || finalTopic,
        subtitle: generated.subtitle || `Pembahasan menarik bertema ${aiCategory}`,
        content: generated.content || "Gagal membangun konten penuh.",
        tags: generated.tags || ["AI", "Technobeta", "Teknologi"],
        categoryColor: generated.categoryColor || "emerald",
        imageUrl: selectedImage
      });

      setAiStep("preview");
    } catch (err: any) {
      setAiError(err.message || "Gagal menghubungi Gemini AI. Pastikan GEMINI_API_KEY terdaftar.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- AI PUBLISH FINAL DRAFT ---
  const handleAiPublishSubmit = async () => {
    if (!aiResultDraft.title || !aiResultDraft.content) {
      setAiError("Judul dan isi konten hasil AI tidak boleh kosong!");
      return;
    }

    setIsAiGenerating(true);
    try {
      await onPublish({
        title: aiResultDraft.title,
        subtitle: aiResultDraft.subtitle,
        content: aiResultDraft.content,
        category: aiCategory,
        categoryColor: aiResultDraft.categoryColor,
        imageUrl: aiResultDraft.imageUrl,
        tags: aiResultDraft.tags,
        author: aiAuthor.trim() || "Waratzain"
      });

      // Reset
      setAiPrompt("");
      setAiStep("prompt");
      
      // Success triggers
      setShowNotification(true);
      onSuccess();
      setTimeout(() => setShowNotification(false), 4500);
    } catch (err) {
      setAiError("Gagal memublikasikan draf AI. Silakan periksa kembali.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-neutral-300">
      
      {/* Banner */}
      <div className="flex flex-col gap-2 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-mono uppercase tracking-wider">
          <PenTool className="h-5 w-5 text-emerald-400" />
          Formulir Pembuatan Postingan Baru
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Tumpahkan buah pikiran Anda secara manual, atau nyalakan asisten kognitif Gemini AI untuk memicu perakitan draf tulisan yang berbobot secara instan.
        </p>
      </div>

      {/* Feature Guide - Moved from Homepage to Editorial Workspace for AdSense Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#121110]/95 border border-neutral-850/70 max-w-2xl">
        <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-900 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#ff9f1c]/10 text-[#ff9f1c] shrink-0 border border-[#ff9f1c]/15 text-xs">
            🪄
          </div>
          <div>
            <h4 className="text-[10.5px] font-bold text-neutral-200 uppercase tracking-wide font-mono">Penulisan Cerdas AI</h4>
            <p className="text-[9.5px] text-neutral-500 leading-normal mt-0.5">Draf otomatis orisinal dari satu gagasan dasar dengan format multimedia.</p>
          </div>
        </div>

        <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-900 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/15 text-xs">
            📁
          </div>
          <div>
            <h4 className="text-[10.5px] font-bold text-neutral-200 uppercase tracking-wide font-mono">Pranala Google Sheets</h4>
            <p className="text-[9.5px] text-neutral-500 leading-normal mt-0.5">Seluruh pangkalan data dipublikasi & disimpan aman pada spreadsheet Anda sendiri.</p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {showNotification && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-start gap-3 text-emerald-300 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0 animate-bounce" />
          <div>
            <strong className="text-emerald-100 block mb-1">Karya Berhasil Diterbitkan!</strong>
            <span>Postingan Anda sekarang telah tercatat dengan selamat ke database mading digital, siap dibaca oleh siapa saja secara luas.</span>
          </div>
        </div>
      )}

      {/* Navigation Subtabs manual / AI */}
      <div className="flex border border-neutral-850 bg-black/30 p-1.5 rounded-xl gap-2 w-full max-w-sm shrink-0">
        <button
          onClick={() => setWriteMode("manual")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
            writeMode === "manual"
              ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <PenTool className="h-3.5 w-3.5" />
          Tulis Manual
        </button>
        <button
          onClick={() => setWriteMode("ai")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
            writeMode === "ai"
              ? "bg-yellow-500/15 border border-yellow-500/20 text-yellow-400"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Asisten AI
        </button>
      </div>

      {/* WORKSPACE AREA */}
      {writeMode === "manual" ? (
        <form onSubmit={handleManualSubmit} className="bg-[#121110] border border-neutral-850 p-5 md:p-8 rounded-2xl flex flex-col gap-5 max-w-2xl">
          
          {/* Cover image uploader */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Foto Sampul / Cover Image</span>
            {manualImageString && manualImageString.trim() !== "" ? (
              <div className="relative w-full h-44 border border-neutral-800 rounded-xl overflow-hidden group">
                <img src={manualImageString} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setManualImageString("")}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 h-28 rounded-xl flex flex-col items-center justify-center cursor-pointer p-4 select-none relative transition-colors bg-black/20">
                <Upload className="h-5 w-5 text-neutral-500 mb-1.5" />
                <span className="text-xs text-neutral-400 font-medium text-center">
                  {isCompressing ? "Memproses kompresi gambar..." : "Klik untuk unggah atau seret file ke sini"}
                </span>
                <span className="text-[10px] text-neutral-600 mt-1 uppercase font-mono">JPG, PNG, atau WEBP (Maks 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleManualImageChange}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Judul Mading Baru *</label>
            <input
              type="text"
              required
              placeholder="Masukkan judul menarik yang mengundang perhatian..."
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-200 outline-none placeholder-neutral-650"
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Ringkasan Inspirasi / Kutipan</label>
            <input
              type="text"
              placeholder="Sari pati atau deskripsi pendek dari garis besar tulisan..."
              value={manualSubtitle}
              onChange={(e) => setManualSubtitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-200 outline-none placeholder-neutral-650"
            />
          </div>

          {/* Category & Writer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Kategori Bidang</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full bg-[#1c1a19] border border-neutral-850 p-3 rounded-xl text-xs text-neutral-300 outline-none"
              >
                <option value="Teknologi">Teknologi</option>
                <option value="Desain">Desain</option>
                <option value="Karya">Karya / Riset</option>
                <option value="Opini">Opini / Pikiran</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Nama Jurnalis / Penulis</label>
              <input
                type="text"
                required
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl text-xs text-neutral-300 outline-none"
              />
            </div>
          </div>

          {/* Core Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Struktur Paragraf Isi Konten *</label>
            <textarea
              required
              rows={8}
              placeholder="Tuliskan ide gagasan Anda di sini secara santun, rapi, dan teridentifikasi..."
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-300 outline-none leading-relaxed resize-none placeholder-neutral-650"
            />
          </div>

          {/* Tags separated by comma */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Label Tagar / Meta Tags (Pemisah Koma)</label>
            <input
              type="text"
              placeholder="Contoh: Pemrograman, Seni, Produktif, OpiniBebas"
              value={manualTagsInput}
              onChange={(e) => setManualTagsInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-400 outline-none placeholder-neutral-650"
            />
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            disabled={isManualSubmitting || isCompressing}
            className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 select-none active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            {isManualSubmitting ? "MENULIS KE CLOUD..." : "TERBITKAN KARYA"}
          </button>

        </form>
      ) : (
        <div className="bg-[#121110] border border-neutral-850 p-5 md:p-8 rounded-2xl flex flex-col gap-6 max-w-2xl relative min-h-[300px]">
          
          {/* Loader Overlay */}
          {isAiGenerating && (
            <div className="absolute inset-0 bg-[#0d0d0c]/95 z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
              <div className="relative w-14 h-14 mb-4">
                <div className="absolute inset-0 rounded-full border border-yellow-405/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-t-yellow-400 border-r-transparent animate-spin" />
                <div className="absolute inset-2.5 rounded-full bg-neutral-950 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <p className="text-xs font-bold text-yellow-400 tracking-wider font-mono uppercase animate-pulse">
                GEMINI AI SEDANG MEMPROSES GAGASAN...
              </p>
              <p className="text-[11px] text-neutral-500 mt-2 max-w-[320px] leading-relaxed">
                Mencerna kata kunci, menghasilkan subjudul puitis, dan menjabarkan analisis editorial berformat standard...
              </p>
            </div>
          )}

          {aiError && (
            <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl flex items-start gap-2 text-xs text-red-300 animate-fadeIn">
              <span>{aiError}</span>
            </div>
          )}

          {aiStep === "prompt" ? (
            <div className="flex flex-col gap-5">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-yellow-300 text-xs">
                Asisten kognitif Gemini AI akan merakit tulisan bermutu dengan referensi data, tags, sasis puitis, dan cover dalam hitungan detik.
              </div>

              {/* Prompt */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">1. MASUKKAN TOPIK ATAU POIN IDE UTAMA</label>
                <textarea
                  placeholder="Misal: Manfaat berjalan kaki 5000 langkah sebelum bekerja untuk meredakan kecemasan coder..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-yellow-500/50 p-3.5 rounded-xl text-xs text-neutral-200 outline-none leading-relaxed resize-none placeholder-neutral-600"
                />
              </div>

              {/* Category selector row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">2. KATEGORI BIDANG</label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value)}
                    className="w-full bg-[#1c1a19] border border-neutral-850 p-3 rounded-xl text-xs text-neutral-300 outline-none"
                  >
                    <option value="Teknologi">Teknologi</option>
                    <option value="Desain">Desain</option>
                    <option value="Karya">Karya / Riset</option>
                    <option value="Opini">Opini / Pikiran</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">3. NAMA PENULIS DOKUMEN</label>
                  <input
                    type="text"
                    required
                    value={aiAuthor}
                    onChange={(e) => setAiAuthor(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl text-xs text-neutral-300 outline-none"
                  />
                </div>
              </div>

              {/* Sugestions seeds */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wide font-mono">Inspirasi Cepat (Klik di bawah):</span>
                <div className="flex flex-col gap-1.5">
                  {TOPIC_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setAiPrompt(suggestion);
                        handleAiGenerating(suggestion);
                      }}
                      className="w-full text-left p-3.5 rounded-xl bg-neutral-950/40 hover:bg-[#1a1918] border border-neutral-850/60 text-xs text-neutral-400 hover:text-yellow-405 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate max-w-[90%] font-medium">{suggestion}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Spark trigger */}
              <button
                onClick={() => handleAiGenerating()}
                className="py-3 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-2 select-none active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4" />
                Rakit dengan Gemini AI
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-yellow-300 text-xs">
                Review draf AI Anda sebelum mempublikasikannya secara resmi! Anda dipersilakan mengedit bagian apa pun langsung di formulir peninjauan di bawah.
              </div>

              {/* Preview Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Judul (Hasil AI)</label>
                <input
                  type="text"
                  value={aiResultDraft.title}
                  onChange={(e) => setAiResultDraft({ ...aiResultDraft, title: e.target.value })}
                  className="w-full bg-[#1c1a19] border border-neutral-850 p-3 rounded-xl text-xs font-bold text-neutral-100 outline-none"
                />
              </div>

              {/* Preview Subtitle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Sari Pati / Ringkasan</label>
                <input
                  type="text"
                  value={aiResultDraft.subtitle}
                  onChange={(e) => setAiResultDraft({ ...aiResultDraft, subtitle: e.target.value })}
                  className="w-full bg-[#1c1a19] border border-neutral-850 p-3 rounded-xl text-xs text-neutral-300 outline-none"
                />
              </div>

              {/* Preview Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Isi Teks Karya</label>
                <textarea
                  value={aiResultDraft.content}
                  onChange={(e) => setAiResultDraft({ ...aiResultDraft, content: e.target.value })}
                  rows={8}
                  className="w-full bg-[#1c1a19] border border-neutral-850 p-3.5 rounded-xl text-xs leading-relaxed text-neutral-300 outline-none resize-none whitespace-pre-wrap no-scrollbar"
                />
              </div>

              {/* Image cover cover */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Penyedia Foto Cover (Random Instan)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiResultDraft.imageUrl}
                    onChange={(e) => setAiResultDraft({ ...aiResultDraft, imageUrl: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-850 p-2.5 rounded-xl text-[10px] text-neutral-500 outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      const next = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
                      setAiResultDraft({ ...aiResultDraft, imageUrl: UNSPLASH_IMAGES[next] });
                    }}
                    type="button"
                    title="Ganti cover random"
                    className="p-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl transition-colors"
                  >
                    <RotateCw className="h-3.5 w-3.5 animate-spin-fast" />
                  </button>
                </div>
              </div>

              {/* Review Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Label Hashtag (Pemisah Koma)</label>
                <input
                  type="text"
                  value={aiResultDraft.tags.join(", ")}
                  onChange={(e) => setAiResultDraft({
                    ...aiResultDraft,
                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#1c1a19] border border-neutral-850 p-3 rounded-xl text-xs text-neutral-400 outline-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setAiStep("prompt")}
                  className="flex-1 py-3 border border-neutral-850 hover:bg-neutral-900 rounded-xl text-xs font-mono font-bold uppercase transition-all"
                >
                  Ulangi Tulis AI
                </button>
                <button
                  type="button"
                  onClick={handleAiPublishSubmit}
                  className="flex-1 py-1 px-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Makamkan & Tayangkan
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
