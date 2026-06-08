import React, { useState } from "react";
import { Sparkles, Brain, ArrowRight, Loader2, Send, RotateCw, Image as ImageIcon, ChevronRight, X, AlertCircle } from "lucide-react";
import { generateAIDraft } from "../services/geminiService";
import { Post } from "../types";

interface AIDraftModalProps {
  onPublish: (post: Omit<Post, "id" | "createdAt" | "likes" | "views">) => Promise<void>;
  onClose: () => void;
}

const TOPIC_SUGGESTIONS = [
  "Dampak Artificial Intelligence terhadap Kreator Konten",
  "Mengapa Negative Space adalah Senjata Rahasia Desainer Kontemporer",
  "Tips Membangun Karir Web Developer di Era Otomatisasi AI",
  "Filosofi Kopi Luwak dan Inspirasi Pembuatan Kode Program",
  "Ulasan Laptop Minimalis Eko-Green 2026",
];

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Cyber abstract
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80", // Web template
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", // Coding laptop
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Circuit cyber
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80", // Hacker matrix code
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"  // Cyber security
];

export default function AIDraftModal({ onPublish, onClose }: AIDraftModalProps) {
  // Wizard view state: 'prompt' or 'preview'
  const [step, setStep] = useState<'prompt' | 'preview'>('prompt');
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Teknologi");
  const [author, setAuthor] = useState("Waratzain");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Draft Result state
  const [draftResult, setDraftResult] = useState<{
    title: string;
    subtitle: string;
    content: string;
    tags: string[];
    categoryColor: string;
    imageUrl: string;
  }>({
    title: "",
    subtitle: "",
    content: "",
    tags: [],
    categoryColor: "emerald",
    imageUrl: UNSPLASH_IMAGES[0]
  });

  const handleGenerate = async (topicStr = prompt) => {
    const finalTopic = topicStr.trim();
    if (!finalTopic) {
      setErrorMessage("Silakan isi konsep topik terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const generated = await generateAIDraft(finalTopic, category);
      
      // Auto-pick a random cover image that fits the abstract mood
      const randomImageIndex = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
      const selectedImage = UNSPLASH_IMAGES[randomImageIndex];

      setDraftResult({
        title: generated.title || finalTopic,
        subtitle: generated.subtitle || `Menjelajah karya tulis bertopik ${category}`,
        content: generated.content || "Konten tidak terbuat sepenuhnya.",
        tags: generated.tags || ["AI", "Gemini", "Writings"],
        categoryColor: generated.categoryColor || "emerald",
        imageUrl: selectedImage
      });

      setStep('preview');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Gagal menghubungi Gemini AI. Pastikan GEMINI_API_KEY telah dimasukkan di tab Secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishClick = async () => {
    if (!draftResult.title || !draftResult.content) {
      setErrorMessage("Judul dan isi konten tidak boleh kosong.");
      return;
    }

    try {
      setIsLoading(true);
      await onPublish({
        title: draftResult.title,
        subtitle: draftResult.subtitle,
        content: draftResult.content,
        category,
        categoryColor: draftResult.categoryColor,
        imageUrl: draftResult.imageUrl,
        tags: draftResult.tags,
        author: author || "Waratzain"
      });
      onClose();
    } catch (e: any) {
      setErrorMessage("Gagal mempublikasikan postingan. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick select an suggestion
  const selectSuggestion = (sug: string) => {
    setPrompt(sug);
    handleGenerate(sug);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto backdrop-blur-sm flex items-center justify-center p-4 select-text">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh] shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-widest font-mono">Asisten Penulisan AI (Gemini)</h2>
              <p className="text-[10px] text-neutral-400">Tulis karya menari otomatis bermodalkan keyword</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body wrapper */}
        <div className="overflow-y-auto p-6 flex-1 flex flex-col gap-6 no-scrollbar relative min-h-0">
          
          {isLoading && (
            <div className="absolute inset-0 bg-[#0d0d0c]/90 z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border border-yellow-400/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-t-yellow-405 border-r-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full bg-neutral-950 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-bold text-yellow-400 tracking-wide font-mono uppercase animate-pulse">
                GEMINI AI SEDANG MENULIS...
              </p>
              <p className="text-xs text-neutral-500 mt-2 max-w-[300px] leading-relaxed">
                Mengekstrak ide kreatif, merapikan struktur kalimat Bahasa Indonesia, serta menyusun meta tag secara otomatis...
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'prompt' && (
            <div className="flex flex-col gap-5">
              
              {/* Prompt Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-400 font-mono">1. TOPIK ATAU KATA KUNCI UTAMA</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Contoh: Manfaat meditasi pagi hari bagi produktivitas kerja programmer remote..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-400/70 p-3.5 rounded-xl text-neutral-200 text-xs leading-relaxed outline-none transition-colors resize-none placeholder-neutral-600"
                />
              </div>

              {/* Category & Authon Row */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-400 font-mono">2. KATEGORI UTAMA</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-300 outline-none"
                  >
                    <option value="Teknologi">Teknologi</option>
                    <option value="Desain">Desain</option>
                    <option value="Karya">Karya / Riset</option>
                    <option value="Opini">Opini / Pikiran</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-neutral-400 font-mono">3. NAMA PENULIS</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-300 outline-none"
                  />
                </div>
              </div>

              {/* Quick Idea Suggestions list */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Butuh Inspirasi Cepat? Klik Topik di Bawah:</span>
                <div className="flex flex-col gap-1.5">
                  {TOPIC_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left p-3 rounded-xl bg-neutral-950/40 hover:bg-neutral-850/60 border border-neutral-850 hover:border-neutral-800 text-xs text-neutral-400 hover:text-yellow-400 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate max-w-[90%]">{suggestion}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-yellow-400 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleGenerate()}
                className="w-full py-3 px-5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black active:scale-[0.98] font-mono text-xs font-bold uppercase rounded-xl tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                MULAI MENULIS DENGAN GEMINI
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          )}

          {step === 'preview' && (
            <div className="flex flex-col gap-4">
              
              <div className="bg-yellow-400/10 border border-yellow-400/20 p-3.5 rounded-xl flex items-start gap-2 text-xs text-yellow-300">
                <Sparkles className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span>Berikut adalah draf tulisan yang dihasilkan AI. Anda bisa menyuntingnya langsung di kolom bawah sebelum diterbitkan!</span>
              </div>

              {/* Preview Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Judul Postingan</label>
                <input
                  type="text"
                  value={draftResult.title}
                  onChange={(e) => setDraftResult({ ...draftResult, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-yellow-400 p-3 rounded-xl text-xs font-bold text-neutral-200 outline-none"
                />
              </div>

              {/* Preview Subtitle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Sari/Sub-judul</label>
                <input
                  type="text"
                  value={draftResult.subtitle}
                  onChange={(e) => setDraftResult({ ...draftResult, subtitle: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-yellow-400 p-3 rounded-xl text-xs text-neutral-300 outline-none"
                />
              </div>

              {/* Preview Content Body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Isi Konten Artikel</label>
                <textarea
                  value={draftResult.content}
                  onChange={(e) => setDraftResult({ ...draftResult, content: e.target.value })}
                  rows={8}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-yellow-400 p-3.5 rounded-xl text-neutral-300 text-xs leading-relaxed outline-none whitespace-pre-wrap no-scrollbar"
                />
              </div>

              {/* Image url selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">URL Gambar Cover</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftResult.imageUrl}
                    onChange={(e) => setDraftResult({ ...draftResult, imageUrl: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-850 p-2.5 rounded-xl text-[10px] text-neutral-400 outline-none"
                  />
                  <button
                    onClick={() => {
                      const nextIdx = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
                      setDraftResult({ ...draftResult, imageUrl: UNSPLASH_IMAGES[nextIdx] });
                    }}
                    title="Ganti gambar random"
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-400 rounded-xl transition-all"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Post tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">Meta Hashtags (Pemisah Koma)</label>
                <input
                  type="text"
                  value={draftResult.tags.join(", ")}
                  onChange={(e) => setDraftResult({ ...draftResult, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-yellow-400 p-3 rounded-xl text-xs text-neutral-400 outline-none"
                />
              </div>

              {/* Actions row */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => setStep('prompt')}
                  className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-white active:scale-[0.98] font-mono text-[10.5px] font-medium uppercase rounded-xl transition-all"
                >
                  ULANGI GENERASI
                </button>
                <button
                  onClick={handlePublishClick}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black active:scale-[0.98] font-mono text-[10.5px] font-bold uppercase rounded-xl tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  TERBITKAN DRAF SEKARANG
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
