import React, { useState } from "react";
import { CheckSquare, Trash2, Eye, ThumbsUp, Search, Calendar, User, FileText, ChevronRight, Sparkles } from "lucide-react";
import { Post } from "../types";

interface ReviewPostWorkspaceProps {
  posts: Post[];
  onSelectRead: (post: Post) => void;
  onDelete: (id: string) => void;
}

export default function ReviewPostWorkspace({ posts, onSelectRead, onDelete }: ReviewPostWorkspaceProps) {
  const [query, setQuery] = useState("");

  const filtered = posts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.author.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const confirmDelete = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus postingan "${post.title}" dari database mading?`)) {
      onDelete(post.id);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-neutral-300 select-text">
      
      {/* Banner */}
      <div className="flex flex-col gap-2 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-mono uppercase tracking-wider">
          <CheckSquare className="h-5 w-5 text-emerald-400" />
          Tinjau & Moderasi Postingan
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Tinjau draf tulisan, moderasi kepantasan karya literasi, dan analisis perolehan interaksi siber (apresiasi & pemirsa) pada portal publikasi Anda.
        </p>
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121110] border border-neutral-850 p-4 rounded-xl">
          <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 tracking-wider">Total Mading Terbit</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{posts.length} Artikel</p>
        </div>
        <div className="bg-[#121110] border border-neutral-850 p-4 rounded-xl">
          <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 tracking-wider">Laju SEO & Crawl Status</span>
          <p className="text-xl font-bold font-mono text-yellow-405 mt-1 text-yellow-400">100% Siap</p>
        </div>
        <div className="bg-[#121110] border border-neutral-850 p-4 rounded-xl">
          <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 tracking-wider">Moderasi Standar AI</span>
          <p className="text-xl font-bold font-mono text-cyan-400 mt-1">Aktif Bersuara</p>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Cari mading sasar tulisan bertopik di sini..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-850 p-3.5 pl-11 rounded-xl text-neutral-300 text-xs outline-none"
        />
      </div>

      {/* Post moderation list table */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-850 p-12 rounded-xl text-center flex flex-col items-center justify-center">
          <FileText className="h-8 w-8 text-neutral-600 mb-2" />
          <p className="text-xs text-neutral-400 font-semibold">Tidak Ada Konten Ditemukan</p>
          <span className="text-[11px] text-neutral-550 mt-1">Coba sesuaikan kata kunci filter pencarian Anda di atas.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((post) => {
            let badgeColor = "bg-neutral-500/15 text-neutral-400 border-neutral-500/20";
            if (post.categoryColor === "emerald") badgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
            if (post.categoryColor === "amber") badgeColor = "bg-amber-500/15 text-amber-400 border-amber-500/20";
            if (post.categoryColor === "sky") badgeColor = "bg-sky-500/15 text-sky-405 border-sky-500/20 text-sky-400";
            if (post.categoryColor === "violet") badgeColor = "bg-violet-500/15 text-violet-400 border-violet-500/20";

            return (
              <div 
                key={post.id}
                onClick={() => onSelectRead(post)}
                className="bg-[#121110] border border-neutral-850 hover:border-neutral-750 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
              >
                
                {/* Meta details left */}
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-950 overflow-hidden shrink-0 mt-0.5">
                    <img 
                      src={post.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                        {post.category}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-550 flex items-center gap-1">
                        <User className="h-3 w-3 text-neutral-600" />
                        {post.author}
                      </span>
                      <span className="text-neutral-700 text-[10px] hidden xs:inline">•</span>
                      <span className="text-[10px] font-mono text-neutral-550 flex items-center gap-1 hidden xs:flex">
                        <Calendar className="h-3 w-3 text-neutral-600" />
                        {post.createdAt}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {post.title}
                    </h4>
                  </div>
                </div>

                {/* Right stats and click actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-neutral-850/60 sm:border-0 pt-3.5 sm:pt-0">
                  
                  {/* Traffic parameters stats */}
                  <div className="flex items-center gap-3 text-[10.5px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1" title="Apresiasi Likes">
                      <ThumbsUp className="h-3.5 w-3.5 text-neutral-550" />
                      <strong>{post.likes}</strong>
                    </span>
                    <span className="flex items-center gap-1" title="Pengunjung Views">
                      <Eye className="h-3.5 w-3.5 text-neutral-550" />
                      <strong>{post.views}</strong>
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => confirmDelete(e, post)}
                      className="p-2 border border-neutral-800 hover:border-red-900/40 hover:bg-red-950/15 text-neutral-500 hover:text-red-400 rounded-lg transition-all"
                      title="Hapus tulisan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="p-2 border border-neutral-800 hover:border-emerald-400/40 hover:bg-emerald-950/15 text-neutral-400 rounded-lg transition-all flex items-center gap-1 text-[10px] font-mono pb-2">
                      <span className="font-bold tracking-widest hidden md:inline">LIHAT</span>
                      <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
