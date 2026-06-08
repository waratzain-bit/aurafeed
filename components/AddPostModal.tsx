import React, { useState, ChangeEvent } from "react";
import { Upload, X, Send } from "lucide-react";
import { Post } from "../types";

interface AddPostModalProps {
  onPublish: (post: Omit<Post, "id" | "createdAt" | "likes" | "views">) => Promise<void>;
  onClose: () => void;
}

/**
 * Image compressor inside component
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDimension = 800; // Limit to 800px for spreadsheet compatibility and ultra fast load
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
        if (!ctx) return reject("Canvas ctx is null");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75)); // 75% quality jpeg is super tiny in bytes
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddPostModal({ onPublish, onClose }: AddPostModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Teknologi");
  const [author, setAuthor] = useState("Waratzain");
  const [tagsInput, setTagsInput] = useState("");
  const [imageString, setImageString] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setImageString(compressed);
      } catch (err) {
        console.error("Gagal kompresi cover poster:", err);
        alert("Gagal memproses gambar. Gunakan file berformat JPG/PNG standard.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Mohon lengkapi judul dan isi tulisan Anda!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Map category to aesthetic colors
      let categoryColor = "emerald";
      if (category === "Desain") categoryColor = "amber";
      if (category === "Karya") categoryColor = "sky";
      if (category === "Opini") categoryColor = "violet";

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const defaultCover = imageString || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80";

      await onPublish({
        title,
        subtitle,
        content,
        category,
        categoryColor,
        imageUrl: defaultCover,
        tags,
        author: author.trim() || "Waratzain"
      });
      onClose();
    } catch (err) {
      alert("Gagal menerbitkan tulisan. Periksa koneksi data Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto backdrop-blur-sm flex items-center justify-center p-4 select-text">
      <div className="bg-[#121110] border border-neutral-800 rounded-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh] shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-850 shrink-0">
          <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-widest font-mono">Tulis Karya Baru</h2>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handlePublishSubmit} className="overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
          
          {/* Cover image uploader */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Foto Sampul / Cover Image</span>
            {imageString && imageString.trim() !== "" ? (
              <div className="relative w-full h-36 border border-neutral-800 rounded-xl overflow-hidden group">
                <img src={imageString} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageString("")}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 h-28 rounded-xl flex flex-col items-center justify-center cursor-pointer p-4 select-none relative transition-colors bg-black/20">
                <Upload className="h-5 w-5 text-neutral-500 mb-1.5" />
                <span className="text-xs text-neutral-400 font-medium">
                  {isCompressing ? "Memproses gambar..." : "Unggah/Letakkan foto di sini"}
                </span>
                <span className="text-[10px] text-neutral-600 mt-1 uppercase font-mono">JPG, PNG, atau WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isCompressing}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Judul Tulisan</label>
            <input
              type="text"
              required
              placeholder="Masukkan judul artikel yang memikat..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-200 outline-none placeholder-neutral-600"
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Sari / Ringkasan Singkat</label>
            <input
              type="text"
              placeholder="Deskripsi singkat seputar apa artikel ini ditulis..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-200 outline-none placeholder-neutral-600"
            />
          </div>

          {/* Grid Category & Author */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Kategori</label>
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
              <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Nama Penulis</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-300 outline-none"
              />
            </div>
          </div>

          {/* Article text content */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Spesifikasi Tulisan / Isi Konten</label>
            <textarea
              required
              rows={6}
              placeholder="Tuliskan gagasan orisinal Anda di sini dengan paragraf yang rapi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-300 outline-none leading-relaxed resize-none placeholder-neutral-600"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Tags / Tagar (Pemisah Koma)</label>
            <input
              type="text"
              placeholder="Medsos, Webdev, Filosofi"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-400 outline-none placeholder-neutral-600"
            />
          </div>

          {/* Action trigger button */}
          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="w-full py-3 px-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black active:scale-[0.98] font-mono text-xs font-bold uppercase rounded-xl tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "MENERBITKAN..." : "TERBITKAN SEKARANG"}
          </button>

        </form>
      </div>
    </div>
  );
}
