import React, { useState, useEffect, useRef } from "react";
import { User, Calendar, Tag, ThumbsUp, Eye, Trash2, X, ArrowLeft, ShieldCheck, Megaphone, MessageSquare, Send, Sparkles, Share2, Copy, CheckCircle, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Post, Comment } from "../types";
import { getPostPermalink } from "../lib/utils";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  hasSheetsConnected: boolean;
  allPosts?: Post[];
  onSelectPost?: (post: Post) => void;
  onAuthorClick?: (authorName: string) => void;
}

// Custom Interactive Simulated AdSense Box with automatic real ad integration
const AdSenseBox = ({ position, variant = "horizontal" }: { position: string; variant?: "horizontal" | "vertical" | "inline" }) => {
  const [clicks, setClicks] = useState(0);
  const [isAdSenseLinked, setIsAdSenseLinked] = useState(false);
  const adInitialized = useRef(false);

  useEffect(() => {
    const savedPub = localStorage.getItem("aurapost_adsense_pub_id") || "pub-0000000000000000";
    const hasLinkedAdSense = savedPub && 
                             savedPub !== "pub-0000000055555555" && 
                             savedPub !== "pub-0000000000000000" && 
                             savedPub.trim() !== "" && 
                             !savedPub.includes("00000000");

    if (hasLinkedAdSense) {
      setIsAdSenseLinked(true);
    }
  }, []);

  useEffect(() => {
    if (isAdSenseLinked && !adInitialized.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adInitialized.current = true;
      } catch (err) {
        console.error("AdSense token pushing error for position:", position, err);
      }
    }
  }, [isAdSenseLinked, position]);

  if (isAdSenseLinked) {
    return (
      <div 
        className={`w-full overflow-hidden my-4 flex justify-center bg-black/10 border border-neutral-900 rounded-xl py-2 ${
          variant === "vertical" ? "min-h-[460px]" : ""
        }`}
      >
        {/* Real Google AdSense compliant format block */}
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block', 
            width: '100%', 
            minHeight: variant === "vertical" ? '450px' : '90px' 
          }}
          data-ad-client={`ca-${(localStorage.getItem("aurapost_adsense_pub_id") || "pub-0000000000000000").startsWith("ca-") ? (localStorage.getItem("aurapost_adsense_pub_id") || "pub-0000000000000000").replace("ca-", "") : (localStorage.getItem("aurapost_adsense_pub_id") || "pub-0000000000000000")}`}
          data-ad-slot={position}
          data-ad-format={variant === "vertical" ? "vertical" : "auto"}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
};

export default function PostDetailModal({
  post,
  onClose,
  onLike,
  onDelete,
  hasSheetsConnected,
  allPosts = [],
  onSelectPost,
  onAuthorClick
}: PostDetailModalProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // States for advanced image zoom lightbox features
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const getShareableUrl = () => {
    return window.location.origin + getPostPermalink(post);
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Gagal menyalin link:", err);
          fallbackCopyText(url);
        });
    } else {
      fallbackCopyText(url);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Tautan gagal disalin otomatis. Silakan salin URL di browser Anda.");
    }
  };

  // Scroll to top when post changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [post.id]);

  useEffect(() => {
    const saved = localStorage.getItem(`aurapost_comments_${post.id}`);
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const seedComments: Comment[] = [
        {
          id: "seed-1",
          author: "Zulfikar",
          content: "Sangat inspiratif! Tulisannya sangat padat dan relevan dengan tren masa kini. Ditambah lagi tata letak situsnya sangat bersih dan rapi.",
          createdAt: "06/06/2026, 14:24",
          avatarColor: "emerald"
        },
        {
          id: "seed-2",
          author: "Nadia Utami",
          content: "Desain mading digital yang luar biasa. Sangat ringan dibaca baik lewat seluler maupun laptop. AdSense slotnya juga terstruktur rapi.",
          createdAt: "07/06/2026, 08:15",
          avatarColor: "sky"
        }
      ];
      setComments(seedComments);
      localStorage.setItem(`aurapost_comments_${post.id}`, JSON.stringify(seedComments));
    }
  }, [post.id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const colors = ["emerald", "sky", "violet", "pink", "amber"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const freshComment: Comment = {
      id: `comment-${Date.now()}`,
      author: newCommentName.trim(),
      content: newCommentText.trim(),
      createdAt: new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      avatarColor: randomColor
    };

    const updated = [...comments, freshComment];
    setComments(updated);
    localStorage.setItem(`aurapost_comments_${post.id}`, JSON.stringify(updated));
    setNewCommentText("");
  };

  useEffect(() => {
    const handleScroll = () => {
      const elem = scrollContainerRef.current;
      if (elem) {
        const scrollTop = elem.scrollTop;
        const scrollHeight = elem.scrollHeight - elem.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [post.id]);

  // SEO Optimization & Dynamic Meta Tags update to boost search crawler indexing
  useEffect(() => {
    const originalTitle = document.title;
    const siteName = localStorage.getItem("aurapost_website_title") || "AuraPost";
    document.title = `${post.title} | ${siteName}`;

    const snippetText = post.subtitle || (post.content.length > 155 ? `${post.content.slice(0, 152)}...` : post.content);

    const tagsToUpdate = [
      { name: "description", content: snippetText },
      { property: "og:title", content: post.title },
      { property: "og:description", content: snippetText },
      { property: "og:image", content: post.imageUrl || "" },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: siteName },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: snippetText },
      { name: "twitter:image", content: post.imageUrl || "" },
      { name: "twitter:card", content: post.imageUrl ? "summary_large_image" : "summary" },
    ];

    const originalMetaValues: { element: Element; originalValue: string | null; isNew: boolean }[] = [];

    tagsToUpdate.forEach((tag) => {
      const isProp = 'property' in tag;
      const keyAttr = isProp ? "property" : "name";
      const keyVal = isProp ? tag.property : tag.name;

      let element = document.querySelector(`meta[${keyAttr}="${keyVal}"]`);
      if (element) {
        originalMetaValues.push({
          element,
          originalValue: element.getAttribute("content"),
          isNew: false
        });
        element.setAttribute("content", tag.content || "");
      } else {
        const newMeta = document.createElement("meta");
        newMeta.setAttribute(keyAttr, keyVal || "");
        newMeta.setAttribute("content", tag.content || "");
        document.head.appendChild(newMeta);
        originalMetaValues.push({
          element: newMeta,
          originalValue: null,
          isNew: true
        });
      }
    });

    return () => {
      document.title = originalTitle;
      originalMetaValues.forEach(({ element, originalValue, isNew }) => {
        if (isNew) {
          element.remove();
        } else if (originalValue !== null) {
          element.setAttribute("content", originalValue);
        } else {
          element.removeAttribute("content");
        }
      });
    };
  }, [post.id, post.title, post.subtitle, post.content, post.imageUrl]);

  const handleDeleteClick = () => {
    if (confirm("Apakah Anda yakin ingin menghapus postingan ini secara permanen dari basis data? Tindakan ini tidak dapat dibatalkan.")) {
      if (onDelete) {
        onDelete(post.id);
      }
    }
  };

  const getCategoryTheme = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "sky":
        return "bg-sky-500/10 border-sky-500/30 text-sky-400";
      case "violet":
        return "bg-violet-500/10 border-violet-500/30 text-violet-400";
      case "pink":
        return "bg-pink-500/10 border-pink-500/30 text-pink-400";
      case "amber":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default:
        return "bg-neutral-500/10 border-neutral-500/30 text-neutral-400";
    }
  };

  const renderArticleBody = () => {
    const paragraphs = post.content.split(/\n\n+/).filter(Boolean);
    
    if (paragraphs.length <= 1) {
      return (
        <div className="space-y-4 text-sm sm:text-base text-neutral-350 leading-relaxed font-sans">
          <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
          <AdSenseBox position="IN_ARTICLE_MID_NATIVE" variant="inline" />
        </div>
      );
    }

    const midIndex = Math.ceil(paragraphs.length / 2);
    const firstHalf = paragraphs.slice(0, midIndex);
    const secondHalf = paragraphs.slice(midIndex);

    return (
      <div className="space-y-5 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
        {firstHalf.map((paragraph, idx) => (
          <p key={`p1-${idx}`} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
        
        <AdSenseBox position="IN_ARTICLE_MID_NATIVE" variant="inline" />
        
        {secondHalf.map((paragraph, idx) => (
          <p key={`p2-${idx}`} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  // Menyaring maksimal 4 artikel terkait selain yang sedang dibaca
  const artikelRekomendasi = allPosts
    .filter((item) => item.id !== post.id)
    .slice(0, 4);

  return (
    <div 
      ref={scrollContainerRef}
      className="fixed inset-0 bg-[#0a0908] z-50 overflow-y-auto flex flex-col select-text"
    >
      {/* Sticky top-level Reader Navigation Bar */}
      <div className="sticky top-0 bg-[#0a0908]/95 backdrop-blur-md border-b border-neutral-850 z-50 px-4 sm:px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-sm font-bold tracking-widest uppercase font-mono bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              {localStorage.getItem("aurapost_website_title") || "Technobeta"}
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 font-mono text-[9px] text-neutral-500 ml-3 border-l border-neutral-800 pl-3">
            <span className="text-neutral-600">MEMBACA:</span>
            <span className="truncate max-w-[280px] text-neutral-400 font-extrabold uppercase">{post.title}</span>
          </div>
        </div>

        {/* Sync Status Badge & Action buttons */}
        <div className="flex items-center gap-3">
          {hasSheetsConnected && (
            <span className="text-[8px] font-mono tracking-widest text-emerald-450 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30 font-extrabold animate-pulse">
              SPREADSHEET LIVE
            </span>
          )}
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Tutup lembaran"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        
        {/* Smooth Linear Reading progress indicator */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-neutral-900 z-10">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-450 to-teal-400 rounded-r-sm transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid View Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-24">
        
        {/* ================= SEKTOR KIRI: ARTIKEL UTAMA & KOMENTAR (8 dari 12 Kolom) ================= */}
        <main className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          {/* Top Header responsively scaled banner */}
          <AdSenseBox position="ARTICLE_LEADERBOARD_TOP" />

          {/* Immersive Article Body Card */}
          <article className="bg-[#121110] border border-neutral-850 rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
            
            {/* Top representation banner picture */}
            {post.imageUrl && post.imageUrl.trim() !== "" ? (
              <div 
                onClick={() => {
                  setIsImageZoomed(true);
                  setZoomScale(1);
                  setImageRotation(0);
                }}
                className="w-full aspect-[16/9] sm:aspect-[21/9] bg-neutral-950 rounded-2xl overflow-hidden relative cursor-zoom-in group/image"
              >
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-black/10 to-black/20 opacity-100 group-hover/image:opacity-90 transition-opacity pointer-events-none" />
                
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-neutral-800 px-2.5 py-1 rounded-xl text-neutral-100 text-[9px] font-mono tracking-wider font-extrabold flex items-center gap-1.5 shadow-xl pointer-events-none transform translate-y-1 group-hover/image:translate-y-0 opacity-0 group-hover/image:opacity-100 transition-all duration-300">
                  <span className="text-emerald-400">🔍</span>
                  <span>BACA DETAIL GAMBAR</span>
                </div>

                <div className="absolute bottom-3 left-3 bg-neutral-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-neutral-900 text-[8.5px] text-neutral-400 font-mono tracking-wide pointer-events-none">
                  AdSense Interactive Gallery View
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[9.5px] font-mono tracking-widest font-bold uppercase py-0.5 px-3 border rounded-full ${getCategoryTheme(post.categoryColor)}`}>
                  {post.category}
                </span>
                
                {post.tags && post.tags.length > 0 && (
                  <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline-block">
                    Tags: {post.tags.map(t => `#${t}`).join(', ')}
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-100 tracking-tight leading-snug mt-1 font-sans">
                {post.title}
              </h1>
              
              {post.subtitle && (
                <p className="text-xs sm:text-sm text-neutral-400 font-medium tracking-wide leading-relaxed leading-normal mt-0.5">
                  {post.subtitle}
                </p>
              )}
            </div>

            {/* Author meta line strip */}
            <div className="flex flex-wrap items-center gap-y-2.5 gap-x-5 border-y border-neutral-850/60 py-4 text-xs text-neutral-400">
              <div 
                className="flex items-center gap-2 cursor-pointer group/author select-none"
                onClick={() => onAuthorClick && onAuthorClick(post.author)}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover/author:border-emerald-400 group-hover/author:bg-emerald-500/20 flex items-center justify-center text-[10px] font-mono font-black text-emerald-400 shrink-0 transition-all">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <span>Ditulis Oleh: <strong className="text-neutral-200 group-hover/author:text-emerald-400 font-bold font-sans transition-colors hover:underline">{post.author}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-neutral-600" />
                <span>Rilis: <strong className="text-neutral-300 font-medium">{post.createdAt}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <Eye className="h-4 w-4 text-neutral-500" />
                <span>{post.views} Tayangan</span>
              </div>
            </div>

            {/* Dynamic middle parsed body ad element */}
            <div className="select-text antialiased">
              {renderArticleBody()}
            </div>

            {/* List tags clickable */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-neutral-850/60 pt-5 mt-2">
                <Tag className="h-3.5 w-3.5 text-neutral-600 mr-1.5 shrink-0" />
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-850/60 px-2.5 py-1 rounded-xl hover:text-neutral-200 transition-colors cursor-pointer select-none"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive feedback & like toolbar row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-850/50 pt-5 mt-4">
              <div className="flex flex-wrap items-center gap-3 relative">
                <button
                  type="button"
                  onClick={() => onLike(post.id)}
                  className="flex items-center gap-2 hover:text-red-400 group border border-neutral-800 hover:border-red-500/30 bg-black/40 px-4 py-2.5 rounded-2xl transition-all h-11 cursor-pointer"
                >
                  <ThumbsUp className="h-4 w-4 text-neutral-500 group-hover:text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-neutral-400 group-hover:text-red-400 font-mono text-[11.5px]">
                    {post.likes} Suka Postingan
                  </span>
                </button>

                {/* Bagikan Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`flex items-center gap-2 group border bg-black/40 px-4 py-2.5 rounded-2xl transition-all h-11 cursor-pointer ${
                      showShareMenu 
                        ? "border-emerald-500/50 text-emerald-400" 
                        : "border-neutral-800 hover:border-emerald-500/30 text-neutral-400 hover:text-emerald-400"
                    }`}
                  >
                    <Share2 className="h-4 w-4 text-neutral-500 group-hover:text-emerald-400 transition-transform" />
                    <span className="font-bold font-mono text-[11.5px]">Bagikan Konten</span>
                  </button>

                  {/* Absolute Dropdown Share Container */}
                  {showShareMenu && (
                    <div 
                      className="absolute left-0 bottom-13 sm:bottom-auto sm:top-13 bg-[#11100f] border border-neutral-800 rounded-2xl p-3 w-64 shadow-2xl flex flex-col gap-1.5 z-40 animate-fadeIn"
                    >
                      <div className="px-2.5 py-1 text-[8px] font-mono font-extrabold tracking-widest text-[#ff9f1c] uppercase border-b border-neutral-850 pb-1.5 mb-1 flex items-center justify-between">
                        <span>PILIH PLATFORM BERBAGI</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff9f1c]" />
                      </div>

                      {/* WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + '\n' + getShareableUrl())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-black/25 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 text-xs text-neutral-300 hover:text-emerald-400 transition-all font-sans"
                        onClick={() => setShowShareMenu(false)}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Kirim ke WhatsApp</span>
                      </a>

                      {/* Twitter / X */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(getShareableUrl())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-black/25 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/20 text-xs text-neutral-300 hover:text-sky-400 transition-all font-sans"
                        onClick={() => setShowShareMenu(false)}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-sky-450 shrink-0" />
                        <span>Bagikan ke Twitter / X</span>
                      </a>

                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareableUrl())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-black/25 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 text-xs text-neutral-300 hover:text-blue-400 transition-all font-sans"
                        onClick={() => setShowShareMenu(false)}
                      >
                        <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>Bagikan ke Facebook</span>
                      </a>

                      {/* Telegram */}
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(getShareableUrl())}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-black/25 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 text-xs text-neutral-300 hover:text-cyan-400 transition-all font-sans"
                        onClick={() => setShowShareMenu(false)}
                      >
                        <Send className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>Kirim ke Telegram</span>
                      </a>

                      {/* Divider */}
                      <div className="border-t border-neutral-850 my-1 py-1">
                        <button
                          type="button"
                          onClick={() => handleCopyLink()}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold select-none transition-all border outline-none cursor-pointer ${
                            copied
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-neutral-900 border-neutral-800 hover:bg-neutral-850 hover:border-neutral-750 text-neutral-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {copied ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            )}
                            <span>{copied ? "Berhasil Disalin!" : "Salin Tautan Artikel"}</span>
                          </div>
                          {!copied && <span className="text-[8.5px] font-mono text-neutral-500 bg-black/30 px-1.5 py-0.5 rounded border border-neutral-800 font-normal">LINK</span>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="text-xs font-bold text-red-400/90 hover:text-red-400 hover:bg-neutral-800/10 p-2.5 px-3.5 rounded-2xl border border-transparent hover:border-red-500/20 flex items-center gap-1.5 transition-all h-11 sm:ml-auto cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Post</span>
                </button>
              )}
            </div>

          </article>

          {/* Comments Section */}
          <div className="bg-[#121110] border border-neutral-850 rounded-3xl p-5 sm:p-8 flex flex-col gap-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <h3 className="text-md sm:text-lg font-bold text-neutral-100 font-sans tracking-tight">
                  Tanggapan & Diskusi Pembaca
                </h3>
              </div>
              <span className="font-mono text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full font-bold">
                {comments.length} Komentar
              </span>
            </div>

            {/* List of comments */}
            <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Belum ada tanggapan. Jadilah yang pertama memberikan apresiasi pemikiran Anda!
                </div>
              ) : (
                comments.map((comment) => {
                  let avatarBg = "bg-neutral-800 border-neutral-700 text-neutral-400";
                  if (comment.avatarColor === "emerald") avatarBg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  if (comment.avatarColor === "sky") avatarBg = "bg-sky-500/10 border-sky-500/20 text-sky-400";
                  if (comment.avatarColor === "violet") avatarBg = "bg-violet-500/10 border-violet-500/20 text-violet-400";
                  if (comment.avatarColor === "pink") avatarBg = "bg-pink-500/10 border-pink-500/20 text-pink-400";
                  if (comment.avatarColor === "amber") avatarBg = "bg-amber-500/10 border-amber-500/20 text-amber-400";

                  return (
                    <div key={comment.id} className="bg-black/20 border border-neutral-850/40 p-4 rounded-2xl flex gap-3.5 items-start">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold font-mono uppercase shrink-0 ${avatarBg}`}>
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-200 font-sans truncate">{comment.author}</span>
                          <span className="text-[9px] font-mono text-neutral-500 shrink-0">{comment.createdAt}</span>
                        </div>
                        <p className="text-[12px] sm:text-xs text-neutral-350 leading-relaxed font-sans whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Write comment form */}
            <form onSubmit={handleAddComment} className="border-t border-neutral-850 pt-5 flex flex-col gap-4">
              <span className="text-[9px] font-mono tracking-widest text-[#ff9f1c] uppercase font-extrabold">Tinggalkan Komentar</span>
              
              <div className="grid grid-cols-1 gap-3.5">
                <input
                  type="text"
                  placeholder="Ketik Nama Anda..."
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  required
                />
                
                <textarea
                  placeholder="Tulis tanggapan atau pemikiran cerdas Anda di sini..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500/40 transition-colors min-h-[90px] resize-none"
                  required
                />
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <Send className="h-3 w-3" />
                    <span>Kirim Tanggapan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>

        {/* ================= SEKTOR KANAN: SIDEBAR MELAYANG & REKOMENDASI (4 dari 12 Kolom) ================= */}
        <aside className="lg:col-span-4 w-full flex flex-col gap-6">
          
          {/* AdSense Box Atas Sidebar */}
          <AdSenseBox position="SIDEBAR_TOP_NATIVE" variant="vertical" />

          {/* Sticky Wrapper: Menjaga posisi elemen tetap melayang saat halaman digulir */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-6 w-full">
            
            {/* Box Rekomendasi Terkait */}
            <div className="bg-[#121110] border border-neutral-850 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-neutral-850/60 pb-3">
                <span className="w-1.5 h-3.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                <h3 className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#ff9f1c]">
                  Rekomendasi Terkait
                </h3>
              </div>

              <div className="flex flex-col gap-2.5">
                {artikelRekomendasi.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onSelectPost) {
                        onSelectPost(item);
                      }
                    }}
                    className="w-full text-left p-3 rounded-2xl border border-neutral-900 bg-black/25 hover:border-neutral-850 hover:bg-neutral-900/40 transition-all group cursor-pointer flex flex-col gap-1.5"
                  >
                    <h4 className="text-xs font-semibold text-neutral-300 group-hover:text-emerald-400 line-clamp-2 transition-colors duration-200 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 w-full mt-1">
                      <span>📁 {item.category || "Umum"}</span>
                      <span className="flex items-center gap-1">👍 {item.likes || 0} Suka</span>
                    </div>
                  </button>
                ))}

                {/* Tampilan Fallback Jika Tidak Ada Artikel Lain */}
                {artikelRekomendasi.length === 0 && (
                  <p className="text-[10px] text-neutral-500 italic font-mono p-4 text-center">
                    Belum ada artikel rekomendasi lainnya.
                  </p>
                )}
              </div>
            </div>

            {/* AdSense Box Sticky Bawah Sidebar */}
            <AdSenseBox position="SIDEBAR_STICKY_BOTTOM" variant="vertical" />
          </div>
        </aside>

      </div>

      {/* ================= ADVANCED INTERACTIVE IMAGE ZOOM LIGHTBOX LAYER ================= */}
      {isImageZoomed && post.imageUrl && (
        <div className="fixed inset-0 mountaineer z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none animate-fadeIn">
          {/* Lightbox Control Strip Bar */}
          <div className="w-full flex items-center justify-between bg-[#11100f]/80 backdrop-blur-md border border-neutral-850 rounded-2xl px-4 py-3 max-w-4xl mx-auto z-10 shadow-2xl mt-2">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[8px] font-mono tracking-widest text-emerald-450 font-extrabold uppercase">PREVIEW DETAIL GAMBAR</span>
              <span className="text-xs text-neutral-200 font-bold truncate max-w-[200px] sm:max-w-md">{post.title}</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))}
                className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Putar Gambar"
              >
                <RefreshCw size={14} />
              </button>
              <div className="w-px h-5 bg-neutral-850 mx-1" />
              <button
                type="button"
                onClick={() => setIsImageZoomed(false)}
                className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Tutup Tampilan"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Zoom/Rotate Viewport Stage */}
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative p-4">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomScale}) rotate(${imageRotation}deg)`,
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Status Metric Footer Indicator */}
          <div className="w-full text-center pb-3 text-[10px] font-mono text-neutral-600">
            Skala: {Math.round(zoomScale * 100)}% • Rotasi: {imageRotation}° • Klik Tombol Silang Untuk Kembali Ke Artikel
          </div>
        </div>
      )}
    </div>
  );
}