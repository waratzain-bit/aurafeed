import React, { useState, useEffect, ChangeEvent } from "react";
import { Edit3, Search, Calendar, User, Save, X, Upload, CheckCircle } from "lucide-react";
import { Post } from "../types";

interface EditPostWorkspaceProps {
  posts: Post[];
  editingPost: Post | null;
  onSetEditingPost: (post: Post | null) => void;
  onSaveEdit: (postId: string, updatedFields: Partial<Omit<Post, "id" | "createdAt" | "likes" | "views">>) => Promise<void>;
}

// Inline Image Compressor identical to create flow
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

export default function EditPostWorkspace({
  posts,
  editingPost,
  onSetEditingPost,
  onSaveEdit,
}: EditPostWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- FORM STATES FOR EDITING ---
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Teknologi");
  const [author, setAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync edits state when a host post is loaded
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setSubtitle(editingPost.subtitle || "");
      setContent(editingPost.content || "");
      setCategory(editingPost.category || "Teknologi");
      setAuthor(editingPost.author || "");
      setTagsInput(editingPost.tags ? editingPost.tags.join(", ") : "");
      setImageUrl(editingPost.imageUrl || "");
    }
  }, [editingPost]);

  const handleImageUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(e.target.files[0]);
        setImageUrl(compressed);
      } catch (err) {
        alert("Gagal mengompresi gambar cover baru.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!title.trim() || !content.trim()) {
      alert("Judul dan isi konten tidak boleh dibiarkan kosong!");
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      let categoryColor = "emerald";
      if (category === "Desain") categoryColor = "amber";
      if (category === "Karya") categoryColor = "sky";
      if (category === "Opini") categoryColor = "violet";

      await onSaveEdit(editingPost.id, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        category,
        categoryColor,
        imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
        tags,
        author: author.trim() || "Waratzain",
      });

      setSaveSuccess(true);
      onSetEditingPost(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Terjadi kegagalan saat menyimpan draf baru.");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-neutral-300 select-text">
      
      {/* Dynamic Header Titles */}
      <div className="flex flex-col gap-2 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Edit3 className="h-5 w-5 text-emerald-400" />
          {editingPost ? "Formulir Edit Postingan" : "Pilih Postingan untuk Diedit"}
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          {editingPost 
            ? `Melakukan pengubahan informasi tulisan "${editingPost.title}". Setelah disimpan, data mading lokal & online otomatis bersinkronisasi.`
            : "Pilih salah satu artikel di mading digital Anda untuk mulai memodifikasi judul, draf isi, kategori, label, atau foto sampulnya."
          }
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Postingan berhasil disimpan dan sinkronisasi terselesaikan!</span>
        </div>
      )}

      {/* VIEW CONDITIONAL */}
      {!editingPost ? (
        <div className="flex flex-col gap-4">
          
          {/* Searching tool */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Ketik judul artikel mading yang ingin Anda edit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-850 p-3.5 pl-11 rounded-xl text-neutral-300 text-xs outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="border border-dashed border-neutral-850 p-12 rounded-xl text-center">
              <span className="text-xs text-neutral-500 block font-mono">Judul tidak ditemukan. Silakan tulis postingan baru terlebih dahulu!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => onSetEditingPost(post)}
                  className="bg-[#121110] border border-neutral-850 p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-emerald-400/30 transition-all cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-neutral-950 overflow-hidden shrink-0">
                      <img 
                        src={post.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} 
                        alt={post.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block mb-0.5">{post.category}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                        {post.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-850/60 pt-2.5">
                    <span className="text-[10px] font-mono text-neutral-550 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-neutral-600" />
                      {post.author}
                    </span>
                    <button 
                      onClick={() => onSetEditingPost(post)}
                      className="px-3 py-1 bg-neutral-900 border border-neutral-800 hover:border-emerald-500/30 hover:text-emerald-400 text-neutral-400 font-mono text-[10px] font-bold uppercase rounded-lg transition-all"
                    >
                      SUNTING
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        <form onSubmit={handleEditSubmit} className="bg-[#121110] border border-neutral-850 p-5 md:p-8 rounded-2xl flex flex-col gap-4.5 max-w-2xl">
          
          {/* Headline */}
          <div className="flex items-center justify-between border-b border-neutral-850/70 pb-3 mb-2">
            <span className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">ISI FORMULIR SUNTING</span>
            <button 
              type="button"
              onClick={() => onSetEditingPost(null)}
              className="p-1 px-2 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-xs font-mono font-medium transition-all"
            >
              BATALKAN
            </button>
          </div>

          {/* Image cover preview and change */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Ganti Foto Sampul</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shrink-0 flex items-center justify-center text-neutral-600 font-mono text-[9px] uppercase">
                {imageUrl && imageUrl.trim() !== "" ? (
                  <img src={imageUrl} alt="Edit preview" className="w-full h-full object-cover" />
                ) : (
                  <span>Tidak ada sampul</span>
                )}
              </div>
              
              <div className="flex-1 w-full flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Atau tempelkan URL gambar penuh..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 p-2 text-[10.5px] rounded-lg outline-none font-mono"
                />
                
                <label className="border border-dashed border-neutral-800 hover:border-neutral-750 px-3 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-[10.5px] font-semibold text-neutral-400 bg-black/10">
                  <Upload className="h-3.5 w-3.5 text-neutral-500" />
                  {isCompressing ? "Memproses gambar..." : "Unggah Gambar Baru"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadChange}
                    className="hidden"
                    disabled={isCompressing}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Ubah Judul Artikel *</label>
            <input
              type="text"
              required
              placeholder="Atur ulang judul mading..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-100 outline-none"
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Sari Pati / Kutipan Ringkas</label>
            <input
              type="text"
              placeholder="Tulis subjudul ringkas..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-250 outline-none"
            />
          </div>

          {/* Grid Category & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Kategori Mading</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1c1a19] border border-neutral-850 p-3 rounded-xl text-xs text-neutral-300 outline-none"
              >
                <option value="Teknologi">Teknologi</option>
                <option value="Desain">Desain</option>
                <option value="Karya">Karya / Riset</option>
                <option value="Opini">Opini / Pikiran</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Penulis</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl text-xs text-neutral-300 outline-none"
              />
            </div>
          </div>

          {/* Body content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Redaksi Isi Karya *</label>
            <textarea
              required
              rows={8}
              placeholder="Detail penjelasan artikel..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-300 outline-none leading-relaxed resize-none"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Label Hashtag (Pemisah Koma)</label>
            <input
              type="text"
              placeholder="Tagar terpisah koma..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-xs text-neutral-450 outline-none"
            />
          </div>

          {/* Action triggers */}
          <div className="flex gap-4 border-t border-neutral-850/60 pt-4 mt-2">
            <button
              type="button"
              onClick={() => onSetEditingPost(null)}
              className="flex-1 py-3 border border-neutral-850 hover:bg-neutral-900 rounded-xl text-xs font-mono font-bold uppercase transition-all"
            >
              BATAL SUNTING
            </button>
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
