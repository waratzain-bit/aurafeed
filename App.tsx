import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Link, 
  CloudCheck, 
  FileText, 
  Plus, 
  ThumbsUp, 
  Eye, 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  User, 
  Calendar, 
  ChevronRight, 
  HelpCircle,
  Hash,
  Settings,
  BookOpen,
  Edit3,
  CheckSquare,
  Menu,
  TrendingUp
} from "lucide-react";

import { Post, SheetsConfig } from "./types";
import { 
  getPosts, 
  addPost, 
  likePost, 
  deletePost, 
  bulkUploadToSheet, 
  getLocalPosts,
  updatePost
} from "./lib/sheetsService";
import { getPostPermalink, findPostByIdentifier, getBasePath, generateSitemapXml } from "./lib/utils";

import SpreadsheetConfig from "./components/SpreadsheetConfig";
import PostDetailModal from "./components/PostDetailModal";
import AIDraftModal from "./components/AIDraftModal";
import AddPostModal from "./components/AddPostModal";
import { AuthorProfileModal } from "./components/AuthorProfileModal";

// Dynamic Admin Workspaces
import SettingsWorkspace from "./components/SettingsWorkspace";
import CreatePostWorkspace from "./components/CreatePostWorkspace";
import ReviewPostWorkspace from "./components/ReviewPostWorkspace";
import EditPostWorkspace from "./components/EditPostWorkspace";

// AdSense standard requirements components
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import LegalPages from "./components/LegalPages";
import CookieConsent from "./components/CookieConsent";

const CATEGORIES = ["Semua", "Teknologi", "Desain", "Karya", "Opini"];

export default function App() {
  // Navigation State for AdSense guideline compliance
  const [currentNav, setCurrentNav] = useState<"home" | "about" | "contact" | "legal">("home");

  // Dynamic Website Custom Title
  const [websiteTitle, setWebsiteTitle] = useState<string>(() => {
    return localStorage.getItem("aurapost_website_title") || "Technobeta";
  });

  // Dynamic Website Hero Banner Custom Slogan
  const [heroSlogan, setHeroSlogan] = useState<string>(() => {
    return localStorage.getItem("aurapost_hero_slogan") || "Kreativitas Tanpa Batas. Terarsip Otomatis.";
  });

  // Dynamic Website Hero Banner Custom Description
  const [heroDescription, setHeroDescription] = useState<string>(() => {
    return localStorage.getItem("aurapost_hero_description") || "Tulis opini mandiri, rancang karya kreatif, atau riset inovasi teknologi baru dengan dukungan asisten naskah cerdas berbasis Gemini AI. Setiap catatan artikel langsung tersinkronisasi otomatis ke basis data spreadsheet Google Sheets Anda secara instan dan tanpa biaya hosting tambahan.";
  });

  // Dynamic Website Hero Banner Custom Background Image (Can be base64 or URL)
  const [heroBgImage, setHeroBgImage] = useState<string>(() => {
    return localStorage.getItem("aurapost_hero_bg_image") || "";
  });

  // Dynamic Google AdSense ID
  const [adsensePubId, setAdsensePubId] = useState<string>(() => {
    return localStorage.getItem("aurapost_adsense_pub_id") || "pub-0000000000000000";
  });

  const isAdSenseLinkedGlobal = !!(
    adsensePubId && 
    adsensePubId !== "pub-0000000055555555" && 
    adsensePubId !== "pub-0000000000000000" && 
    adsensePubId.trim() !== "" && 
    !adsensePubId.includes("00000000")
  );

  // Sidebar dynamic tab controller
  const [sidebarTab, setSidebarTab] = useState<"feed" | "create" | "review" | "edit" | "settings">("feed");

  // Mobile Collapsible Sidebar toggler
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Active post being modified in Edit Workspace
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Master Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Google Sheets configurations
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(() => {
    const savedUrl = localStorage.getItem("aurapost_sheets_url") || "";
    return {
      webAppUrl: savedUrl,
      isConnected: !!savedUrl,
      lastSyncedAt: localStorage.getItem("aurapost_last_synced") || undefined
    };
  });

  // Modal Dialog visibility triggers
  const [activeModal, setActiveModal] = useState<"none" | "config" | "add-manual" | "add-ai">("none");
  const [selectedReadPost, setSelectedReadPost] = useState<Post | null>(null);
  const [selectedAuthorProfile, setSelectedAuthorProfile] = useState<string | null>(null);

  // User Role Management (Visitor by default as requested by user)
  const [role, setRole] = useState<"visitor" | "admin">(() => {
    return (localStorage.getItem("aurapost_user_role") as "visitor" | "admin") || "visitor";
  });
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showSitemapModal, setShowSitemapModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  const handleSetRole = (newRole: "visitor" | "admin") => {
    localStorage.setItem("aurapost_user_role", newRole);
    setRole(newRole);
    if (newRole === "visitor") {
      setSidebarTab("feed");
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPw = adminPasswordInput.trim().toLowerCase();
    if (cleanPw === "admin" || cleanPw === "redaksi" || cleanPw === "mading123") {
      handleSetRole("admin");
      setAdminPasswordInput("");
      setLoginError("");
      setShowAdminLogin(false);
    } else {
      setLoginError("Sandi Salah! Gunakan kata kunci mading seperti 'redaksi' atau 'admin'.");
    }
  };

  // Handle setting website title dyamically
  const handleUpdateWebsiteTitle = (newTitle: string) => {
    localStorage.setItem("aurapost_website_title", newTitle);
    setWebsiteTitle(newTitle);
  };

  const handleUpdateHeroSlogan = (newSlogan: string) => {
    localStorage.setItem("aurapost_hero_slogan", newSlogan);
    setHeroSlogan(newSlogan);
  };

  const handleUpdateHeroDescription = (newDesc: string) => {
    localStorage.setItem("aurapost_hero_description", newDesc);
    setHeroDescription(newDesc);
  };

  const handleUpdateHeroBgImage = (newBg: string) => {
    localStorage.setItem("aurapost_hero_bg_image", newBg);
    setHeroBgImage(newBg);
  };

  // Handle setting adsense publisher ID dynamically
  const handleUpdateAdsensePubId = (newId: string) => {
    localStorage.setItem("aurapost_adsense_pub_id", newId);
    setAdsensePubId(newId);
  };

  // Handle saving post changes
  const handleSaveEditPost = async (postId: string, updatedFields: Partial<Omit<Post, "id" | "createdAt" | "likes" | "views">>) => {
    try {
      const updated = await updatePost(postId, updatedFields, sheetsConfig.webAppUrl || undefined);
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
    } catch (e) {
      console.error("Gagal memperbarui postingan:", e);
      throw e;
    }
  };

  // Reset local database data back to seed default
  const handleResetToDefault = () => {
    localStorage.removeItem("aurapost_local_posts");
    loadPostsData();
  };

  // Load Posts from Service (Auto uses Sheets URL if active)
  const loadPostsData = async (forceUrl = sheetsConfig.webAppUrl) => {
    setIsLoading(true);
    try {
      const data = await getPosts(forceUrl || undefined);
      setPosts(data);
    } catch (err) {
      console.error("Gagal memuat post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPostsData();
  }, [sheetsConfig.webAppUrl]);

  // Auto-inject real Google AdSense client script when a genuine custom publisher ID is entered
  useEffect(() => {
    const cleanPubId = adsensePubId ? adsensePubId.trim() : "";
    const isRealAdSense = cleanPubId !== "" && 
                          cleanPubId !== "pub-0000000000000000" && 
                          cleanPubId !== "pub-0000000055555555" &&
                          !cleanPubId.includes("00000000");

    if (isRealAdSense) {
      const clientToken = cleanPubId.startsWith("ca-") ? cleanPubId : `ca-${cleanPubId}`;
      
      // Inject global script if not already present
      let existingScript = document.getElementById("adsense-global-sdk");
      if (existingScript) {
        const currentSrc = existingScript.getAttribute("src") || "";
        if (!currentSrc.includes(clientToken)) {
          existingScript.setAttribute("src", `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientToken}`);
        }
      } else {
        const script = document.createElement("script");
        script.id = "adsense-global-sdk";
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientToken}`;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
    }
  }, [adsensePubId]);

  // Dynamic SEO Router: Deep-linking on posts loading and listening to browser popstate events
  useEffect(() => {
    const handlePopState = () => {
      if (posts && posts.length > 0) {
        // Parse from URL parameters
        const params = new URLSearchParams(window.location.search);
        const postParam = params.get("post") || params.get("article");
        
        // Parse from URL pathname (e.g., /post/slug-artikel)
        let pathIdentifier = "";
        const path = window.location.pathname;
        if (path.includes("/post/")) {
          pathIdentifier = path.split("/post/")[1];
        } else if (path.includes("/article/")) {
          pathIdentifier = path.split("/article/")[1];
        }

        // Parse from hash (e.g., #post=slug)
        const hashParam = window.location.hash.replace("#", "");
        let hashIdentifier = "";
        if (hashParam.startsWith("post=")) {
          hashIdentifier = hashParam.split("post=")[1];
        } else {
          hashIdentifier = hashParam;
        }

        const targetId = postParam || pathIdentifier || hashIdentifier;
        
        if (targetId) {
          const matchingPost = findPostByIdentifier(targetId, posts);
          if (matchingPost) {
            setSelectedReadPost(matchingPost);
            return;
          }
        }
      }
      setSelectedReadPost(null);
    };

    window.addEventListener("popstate", handlePopState);
    
    // Initial parse when posts load / webAppUrl changes
    if (posts && posts.length > 0) {
      handlePopState();
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [posts]);

  // Synchronize browser address bar, dynamic SEO Meta descriptors, OpenGraph, and Canonical links
  useEffect(() => {
    const updateMetaTags = (meta: { 
      title: string; 
      description: string; 
      url: string; 
      imageUrl: string; 
      type: "article" | "website"; 
    }) => {
      // 1. Update document title
      document.title = meta.title;

      // Helper function to query or insert meta tag
      const setMetaTag = (attrName: "name" | "property", attrVal: string, contentVal: string) => {
        let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute(attrName, attrVal);
          document.head.appendChild(el);
        }
        el.content = contentVal;
      };

      // Helper function to query or insert link tags (canonical/prev/next)
      const setLinkTag = (relVal: string, hrefVal: string) => {
        let el = document.querySelector(`link[rel="${relVal}"]`) as HTMLLinkElement | null;
        if (!el) {
          el = document.createElement("link");
          el.setAttribute("rel", relVal);
          document.head.appendChild(el);
        }
        el.href = hrefVal;
      };

      // Set meta description
      setMetaTag("name", "description", meta.description);

      // Set canonical link
      setLinkTag("canonical", meta.url);

      // Set Open Graph tags
      setMetaTag("property", "og:title", meta.title);
      setMetaTag("property", "og:description", meta.description);
      setMetaTag("property", "og:url", meta.url);
      setMetaTag("property", "og:image", meta.imageUrl);
      setMetaTag("property", "og:type", meta.type);

      // Set Twitter Cards
      setMetaTag("name", "twitter:card", "summary_large_image");
      setMetaTag("name", "twitter:title", meta.title);
      setMetaTag("name", "twitter:description", meta.description);
      setMetaTag("name", "twitter:image", meta.imageUrl);
    };

    if (selectedReadPost) {
      const permalink = getPostPermalink(selectedReadPost);
      const canonicalUrl = window.location.origin + permalink;
      
      // Sanitise description for meta limits - clean HTML, markdown tags & max 165 characters
      const cleanDesc = selectedReadPost.subtitle || (selectedReadPost.content 
        ? selectedReadPost.content.replace(/[#*`_[\]()-]/g, "").slice(0, 165).trim() + "..." 
        : `${selectedReadPost.title} - Baca artikel mading selengkapnya.`);

      // Update addresses & apply GSC SEO Meta Tags
      updateMetaTags({
        title: `${selectedReadPost.title} | ${websiteTitle}`,
        description: cleanDesc,
        url: canonicalUrl,
        imageUrl: selectedReadPost.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80",
        type: "article"
      });

      // Synchronize physical push state URL path
      const currentFull = window.location.pathname + window.location.search + window.location.hash;
      if (!currentFull.includes(permalink)) {
        window.history.pushState({ postId: selectedReadPost.id }, "", permalink);
      }
    } else {
      const basePath = getBasePath() || "/";
      const canonicalHomeUrl = window.location.origin + basePath;

      // Restore base GSC descriptors
      updateMetaTags({
        title: websiteTitle,
        description: `Mading Digital Terkoneksi Google Sheets, diperkaya slot penayangan iklan Google AdSense & dioptimasi penuh untuk Google Search Console indexation.`,
        url: canonicalHomeUrl,
        imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80",
        type: "website"
      });

      // Synchronize push state back to base path - Hanya jika data selesai dimuat
      if (!isLoading && posts.length > 0) {
        const currentPath = window.location.pathname;
        if (currentPath.includes("/post/") || currentPath.includes("/article/")) {
          window.history.pushState(null, "", basePath);
        }
      }
    }
  }, [selectedReadPost, websiteTitle, posts, isLoading]);

  // Handle Sheet Connection Save
  const handleSaveSheetsUrl = (url: string) => {
    localStorage.setItem("aurapost_sheets_url", url);
    setSheetsConfig({
      webAppUrl: url,
      isConnected: !!url,
      lastSyncedAt: new Date().toLocaleTimeString("id-ID")
    });
    localStorage.setItem("aurapost_last_synced", new Date().toLocaleTimeString("id-ID"));
    setActiveModal("none");
  };

  // Disconnect Sheet
  const handleDisconnectSheet = () => {
    if (confirm("Koneksi Spreadsheet akan diputus. Aplikasi akan kembali membaca memori offline local. Lanjutkan?")) {
      localStorage.removeItem("aurapost_sheets_url");
      localStorage.removeItem("aurapost_last_synced");
      setSheetsConfig({
        webAppUrl: "",
        isConnected: false
      });
    }
  };

  // Handle Publishing new post (both AI & Manual write this way)
  const handlePublishPost = async (newPostData: Omit<Post, "id" | "createdAt" | "likes" | "views">) => {
    try {
      const added = await addPost(newPostData, sheetsConfig.webAppUrl || undefined);
      // Immediately insert into state to make interaction instant
      setPosts((prev) => [added, ...prev]);
    } catch (e) {
      console.error("Gagal mempublish post", e);
    }
  };

  // Force Bulk Sync of Local Offline Posts toward Google Sheet in 1 Click
  const handleBulkSyncToSheet = async () => {
    if (!sheetsConfig.webAppUrl) return;
    try {
      const localOfflines = getLocalPosts();
      if (localOfflines.length === 0) return;
      await bulkUploadToSheet(sheetsConfig.webAppUrl, localOfflines);
      loadPostsData();
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi bulk", err);
      throw err;
    }
  };

  // Handle post Liking action
  const handleLikeClick = async (postId: string) => {
    try {
      // Optmistic update for click visual gratification
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
      );
      if (selectedReadPost && selectedReadPost.id === postId) {
        setSelectedReadPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }

      const freshLikes = await likePost(postId, sheetsConfig.webAppUrl || undefined);
      
      // Update with sheet server specific feedback count
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: freshLikes } : p))
      );
    } catch (err) {
      console.error("Gagal memberikan Like:", err);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId, sheetsConfig.webAppUrl || undefined);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedReadPost(null);
    } catch (err) {
      console.error("Gagal menghapus postingan:", err);
    }
  };

  // Filter posts dynamically in client memory
  const filteredPosts = posts.filter((post) => {
    const matchesQuery = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === "Semua" || 
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

  // Analytics helper metrics
  const aggregateMetrics = posts.reduce(
    (acc, cur) => {
      acc.likes += cur.likes || 0;
      acc.views += cur.views || 0;
      return acc;
    },
    { likes: 0, views: 0 }
  );

  // AdSense placement helper with automatic real production-ready Google ad injection
  const AdSenseStub = ({ position }: { position: string }) => {
    const isAdSenseLinked = adsensePubId && 
                            adsensePubId !== "pub-0000000055555555" && 
                            adsensePubId !== "pub-0000000000000000" && 
                            adsensePubId.trim() !== "" && 
                            !adsensePubId.includes("00000000");
    const adInitialized = useRef(false);

    useEffect(() => {
      if (isAdSenseLinked && !adInitialized.current) {
        try {
          const windowWithAds = window as any;
          windowWithAds.adsbygoogle = windowWithAds.adsbygoogle || [];
          windowWithAds.adsbygoogle.push({});
          adInitialized.current = true;
        } catch (err) {
          console.warn("Layanan Google AdSense push warning untuk slot:", position, err);
        }
      }
    }, [isAdSenseLinked, position]);

    if (!isAdSenseLinked) {
      // Disembunyikan sepenuhnya (tidak ada visual simulasi) jika ID AdSense belum dikonfigurasi aktif
      return null;
    }

    const cleanClient = adsensePubId.trim();
    const clientToken = cleanClient.startsWith("ca-") ? cleanClient : `ca-${cleanClient}`;
    
    // Let's configure custom slot properties for real rendering
    let style: React.CSSProperties = { display: 'block', width: '100%' };
    let adSlot = "1234567890"; // Definisikan default slot
    let adFormat = "auto";
    
    if (position === "HEADER_RESPONSIVE_IN_FEED") {
      style = { display: 'block', width: '100%', minHeight: '90px' };
      adSlot = "5234123561"; // Header responsive ad unit
    } else if (position === "SIDEBAR_RECTANGLE") {
      style = { display: 'inline-block', width: '300px', height: '250px' };
      adSlot = "4125367892"; // Rectangle ad unit
      adFormat = "rectangle";
    } else if (position === "SIDEBAR_STICKY") {
      style = { display: 'block', width: '100%', minHeight: '280px' };
      adSlot = "6125439871"; // Sticky sidebar unit
    } else if (position === "FOOTER_RESPONSIVE") {
      style = { display: 'block', width: '100%', minHeight: '120px' };
      adSlot = "7894561230"; // Footer auto ads slot
    }

    return (
      <div key={`${position}-${adsensePubId}`} className="w-full overflow-hidden my-3.5 flex flex-col justify-center items-center bg-neutral-950/20 border border-neutral-900 rounded-3xl py-3 px-2">
        <span className="text-[7.5px] font-mono text-neutral-500 block uppercase tracking-wider mb-2">
          Iklan Google AdSense • Aktif ({clientToken})
        </span>
        <ins 
          className="adsbygoogle"
          style={style}
          data-ad-client={clientToken}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      </div>
    );
  };

  const renderSidebar = () => {
    const adminTabs = [
      { id: "feed", name: "Beranda Mading", icon: BookOpen },
      { id: "create", name: "+ Postingan Baru", icon: Plus },
      { id: "review", name: "Tinjau Postingan", icon: CheckSquare },
      { id: "edit", name: "Edit Postingan", icon: Edit3 },
      { id: "settings", name: "Setelan Platform", icon: Settings },
    ] as const;

    const visitorTabs = [
      { id: "feed", name: "Beranda Mading", icon: BookOpen }
    ] as const;

    const tabs = role === "admin" ? adminTabs : visitorTabs;

    return (
      <div className="flex flex-col gap-6 h-full text-neutral-300">
        {/* Editor Brand Context */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850/60 flex flex-col gap-2 relative overflow-hidden shrink-0 select-text">
          <div className="absolute top-1.5 right-2 px-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[7.2px] font-mono uppercase text-emerald-400 font-extrabold tracking-wider">
              {role === "admin" ? "Mode Redaksi" : "Mode Pembaca"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${role === "admin" ? "bg-emerald-450 animate-pulse" : "bg-neutral-600"}`} />
            <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#ff9f1c]">
              {role === "admin" ? "Editorial Desk" : "Ruang Pengunjung"}
            </span>
          </div>
          <h4 className="text-xs font-bold font-mono tracking-tight text-neutral-100 uppercase truncate">
            {websiteTitle} {role === "admin" ? "Admin" : "Reader"}
          </h4>
          <p className="text-[10px] text-neutral-500 leading-normal max-w-full">
            {role === "admin" 
              ? "Tulis baru, sunting, tinjau, dan awankan data mading Anda secara live."
              : "Baca tulisan terbaru, berikan apresiasi suka, komentar, scroll, dan klik iklan."}
          </p>
        </div>

        {/* Tab Items List */}
        <div className="flex flex-col gap-1.5 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = sidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSidebarTab(tab.id);
                  setIsSidebarOpen(false); // Auto close mobile sidebar
                }}
                className={`w-full px-4 py-3 rounded-xl text-[10.5px] font-bold font-mono uppercase tracking-wider flex items-center gap-3 transition-all border ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-405 shadow-md scale-[1.01]"
                    : "bg-transparent border-transparent text-neutral-550 hover:text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-405" : "text-neutral-600"}`} />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Role Switcher Trigger at Sidebar Bottom */}
        <div className="border-t border-neutral-900/60 pt-4 flex flex-col gap-2">
          {role === "admin" ? (
            <button
              type="button"
              onClick={() => handleSetRole("visitor")}
              className="w-full py-2.5 px-3 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl text-[9px] font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98]"
            >
              <span>🔒 KELUAR AKSES REDAKSI</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdminLogin(true)}
              className="w-full py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-550/30 text-emerald-400 rounded-xl text-[9px] font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98]"
            >
              <span>🔑 AKSES REDAKSI / ADMIN</span>
            </button>
          )}
        </div>

        {/* Sidebar Guidelines */}
        <div className="p-3 border border-dashed border-neutral-850 rounded-xl bg-black/10 text-center select-text">
          <span className="text-[8px] font-mono uppercase font-extrabold tracking-widest text-[#ff9f1c]/70 block mb-1 font-bold">PROGRAM POLICY</span>
          <p className="text-[9px] text-neutral-500 leading-relaxed max-w-[200px] mx-auto">
            Sasis {websiteTitle} mematuhi penuh standard Google Publisher & transparansi data pembaca.
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen w-full bg-[#0a0908] text-neutral-100 flex flex-col relative select-text font-sans overflow-x-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-emerald-950/15 via-[#0a0908]/0 to-transparent pointer-events-none" />
      <div className="absolute top-36 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Dynamic Top Announcement & Hero Banner above the Header */}
      {currentNav === "home" && (
        <div 
          className="w-full bg-[#121110]/95 border-b border-neutral-900 overflow-hidden select-text relative z-30 transition-all duration-300"
          style={
            heroBgImage 
              ? (heroBgImage.startsWith("linear-gradient") || heroBgImage.startsWith("radial-gradient") 
                ? { background: heroBgImage } 
                : { backgroundImage: `linear-gradient(rgba(10,9,8,0.7), rgba(10,9,8,0.9)), url(${heroBgImage})`, backgroundSize: "cover", backgroundPosition: "center" })
              : {}
          }
        >
          {/* Accent decoration */}
          {!heroBgImage && (
            <>
              <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/[0.025] rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute top-0 left-12 h-64 w-64 bg-amber-500/[0.015] rounded-full blur-[100px] pointer-events-none" />
            </>
          )}
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
            
            <div className="max-w-3xl flex flex-col gap-3">
              
              {/* Slogan & Intro Description Column */}
              <div className="flex flex-col gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-100 font-sans leading-tight whitespace-pre-line">
                  {heroSlogan}
                </h1>
                
                <p className="text-xs text-[#a3a3a3] leading-relaxed whitespace-pre-line">
                  {heroDescription}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="w-full shrink-0 border-b border-neutral-900 bg-black/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Name */}
          <div className="flex items-center gap-3">
            {currentNav === "home" && role === "admin" && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Buka Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div 
              onClick={() => {
                setCurrentNav("home");
                setSidebarTab("feed");
              }}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />
              <span className="text-sm sm:text-md font-bold tracking-widest uppercase font-mono bg-gradient-to-r from-neutral-100 to-neutral-500 bg-clip-text text-transparent">
                {websiteTitle}
              </span>
            </div>
            <span className="text-[9px] text-neutral-550 tracking-wider font-mono uppercase bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-md hidden xs:inline">
              AdSense OK
            </span>
          </div>

          {/* Dynamic Editorial Navigation - High contrast & readable */}
          <nav className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentNav("home")}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${
                currentNav === "home" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "text-neutral-400 hover:text-white border-transparent"
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentNav("about")}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${
                currentNav === "about" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "text-neutral-400 hover:text-white border-transparent"
              }`}
            >
              Tentang
            </button>
            <button
              onClick={() => setCurrentNav("contact")}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${
                currentNav === "contact" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "text-neutral-400 hover:text-white border-transparent"
              }`}
            >
              Kontak
            </button>
            <button
              onClick={() => setCurrentNav("legal")}
              className={`px-3 py-1.5 rounded-xl text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all border ${
                currentNav === "legal" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "text-neutral-400 hover:text-white border-transparent"
              }`}
            >
              Kebijakan Legal
            </button>
          </nav>

          {/* Sync Status / Config triggers or Admin mode toggle */}
          <div className="flex items-center gap-3">
            {role === "admin" && (
              sheetsConfig.isConnected ? (
                <div 
                  onClick={() => setActiveModal("config")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs cursor-pointer select-none transition-all cursor-pointer"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider hidden xs:inline">Sheet Link</span>
                </div>
              ) : (
                <div 
                  onClick={() => setActiveModal("config")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9f1c]/10 hover:bg-[#ff9f1c]/25 border border-[#ff9f1c]/20 text-[#ff9f1c] rounded-xl text-xs cursor-pointer select-none transition-all"
                >
                  <Link className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Mading Sheet</span>
                </div>
              )
            )}
          </div>

        </div>
      </header>

      {/* MOBILE HEADER SUB-NAVBAR FOR AD-SENSE REVIEW CRAWLER */}
      <div className="sm:hidden w-full bg-[#121110] border-b border-neutral-900 px-4 py-2.5 flex items-center justify-around gap-1">
        <button
          onClick={() => setCurrentNav("home")}
          className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "home" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}
        >
          Beranda
        </button>
        <button
          onClick={() => setCurrentNav("about")}
          className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "about" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}
        >
          Tentang
        </button>
        <button
          onClick={() => setCurrentNav("contact")}
          className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "contact" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}
        >
          Kontak
        </button>
        <button
          onClick={() => setCurrentNav("legal")}
          className={`flex-1 py-1.5 text-center text-[10.5px] font-mono uppercase font-bold rounded-lg ${currentNav === "legal" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500"}`}
        >
          Legal
        </button>
      </div>

      {/* BODY WORKSPACE CONTAINER */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-8 z-20">
        
        {/* Render pages depending on Routing state */}
        {currentNav === "about" && <AboutUs />}
        {currentNav === "contact" && <ContactUs />}
        {currentNav === "legal" && <LegalPages />}

        {currentNav === "home" && (
          <div className="flex flex-col md:flex-row gap-8 items-start flex-1 w-full">
            
            {/* Desktop Sidebar Column */}
            {role === "admin" && (
              <aside className="hidden md:block w-60 shrink-0 self-stretch border-r border-neutral-900/60 pr-6">
                <div className="sticky top-24">
                  {renderSidebar()}
                </div>
              </aside>
            )}

            {/* Mobile Sidebar drawers */}
            <AnimatePresence>
              {isSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                  {/* Backdrop overlay */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />
                  {/* Drawer body container */}
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="relative w-72 bg-[#0c0b0a] border-r border-neutral-850 p-6 flex flex-col shadow-2xl h-full overflow-y-auto z-10"
                  >
                    <div className="flex justify-between items-center mb-6 shrink-0">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#ff9f1c] uppercase">
                        {role === "admin" ? "Menu Redaksi" : "Menu Utama"}
                      </span>
                      <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="py-1 px-2 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 text-[9px] font-mono font-bold uppercase transition"
                      >
                        TUTUP
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      {renderSidebar()}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Main Content Workspace viewport */}
            <div className="flex-1 min-w-0 w-full">
              
              {sidebarTab === "feed" && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  
                  {/* Left Column: Feed List and Controls */}
                  <div className="flex-1 min-w-0 w-full flex flex-col gap-8">
                  
                  {/* AdSense Top simulated banner */}
                  <AdSenseStub position="HEADER_RESPONSIVE_IN_FEED" />

                  {/* FEED OPERATIONSBAR: Search, Category, and Publish triggers */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Controls level 1: Category selections and write actions */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
                      
                      {/* Category selection slide */}
                      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 text-[11px] rounded-xl hover:text-neutral-200 transition-all font-bold border select-none shrink-0 ${
                              selectedCategory === cat
                                ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-400 font-semibold"
                                : "bg-transparent border-transparent text-neutral-500 hover:bg-neutral-900"
                            }`}
                          >
                            {cat === "Semua" ? "🔥 Semua" : cat}
                          </button>
                        ))}
                      </div>

                      {/* Write Actions Level 1 (Only visible to Admin role) */}
                      {role === "admin" && (
                        <div className="flex items-center gap-2.5 font-mono">
                          <button
                            onClick={() => setSidebarTab("create")}
                            className="flex-1 py-1.5 px-3.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-750 text-neutral-300 hover:text-white rounded-xl text-[10px] font-bold font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Tulis Baru
                          </button>
                          <button
                            onClick={() => setSidebarTab("create")}
                            className="flex-1 py-1.5 px-3.5 bg-gradient-to-r from-yellow-500 to-yellow-405 text-neutral-950 hover:from-yellow-400 hover:to-yellow-300 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98]"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-neutral-950" />
                            Ide Gemini AI
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Controls level 2: Dynamic Search block */}
                    <div className="flex w-full select-text">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Cari postingan mading berdasarkan judul, kategori, penulis, atau kata kunci..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-850 p-3.5 pl-11 rounded-2xl text-[11px] text-neutral-200 outline-none transition-colors placeholder-neutral-600 shadow-inner"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-neutral-500 hover:text-neutral-300 font-mono"
                          >
                            BATAL
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* POSTINGAN TERPOPULER SECTION */}
                  {!searchQuery && selectedCategory === "Semua" && posts.length > 0 && (
                    <div className="flex flex-col gap-4 bg-neutral-950/20 border border-neutral-900 p-5 sm:p-6 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/[0.01] rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-amber-500" />
                          <div>
                            <h2 className="text-sm font-bold text-neutral-100 font-sans tracking-tight">
                              Postingan Terpopuler
                            </h2>
                            <p className="text-[10px] text-neutral-500">
                              Karya menarik dengan jumlah tayangan pembaca tertinggi
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[9px] uppercase font-bold text-amber-400 bg-amber-400/5 border border-amber-400/10 px-2 py-0.5 rounded">
                          HOT READS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...posts]
                          .sort((a, b) => (b.views || 0) - (a.views || 0))
                          .slice(0, 3)
                          .map((post, index) => {
                            let badgeBg = "bg-neutral-800 border-neutral-700 text-neutral-400";
                            if (post.categoryColor === "emerald") badgeBg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                            if (post.categoryColor === "amber") badgeBg = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                            if (post.categoryColor === "sky") badgeBg = "bg-sky-500/10 border-sky-500/20 text-sky-400";
                            if (post.categoryColor === "violet") badgeBg = "bg-violet-500/10 border-violet-500/20 text-violet-400";

                            // Rank theme setting
                            let rankLabel = "";
                            let rankStyle = "";
                            if (index === 0) {
                              rankLabel = "🏆 #1 Terpopuler";
                              rankStyle = "bg-amber-500/15 text-amber-300 border-amber-500/20";
                            } else if (index === 1) {
                              rankLabel = "🥈 #2 Terpopuler";
                              rankStyle = "bg-neutral-400/10 text-neutral-300 border-neutral-400/25";
                            } else {
                              rankLabel = "🥉 #3 Terpopuler";
                              rankStyle = "bg-orange-500/10 text-orange-400 border-orange-500/25";
                            }

                            return (
                              <motion.a
                                key={`popular-${post.id}`}
                                href={getPostPermalink(post)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedReadPost(post);
                                }}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -3 }}
                                onClickCapture={() => {
                                  // Auto increment views locally for feedback
                                  setPosts((prev) =>
                                    prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
                                  );
                                }}
                                className="bg-[#121110]/95 border border-neutral-850 hover:border-amber-500/30 p-3.5 rounded-xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 group shadow-md block text-left"
                              >
                                <div className="flex flex-col gap-2.5">
                                  {/* Aspect and Title info wrapper */}
                                  <div className="w-full aspect-[21/10] bg-neutral-950 rounded-lg overflow-hidden relative">
                                    <img 
                                      src={post.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} 
                                      alt={post.title} 
                                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20 pointer-events-none" />
                                    
                                    {/* Rank Badge Overlay */}
                                    <span className={`absolute top-2 left-2 text-[8px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${rankStyle}`}>
                                      {rankLabel}
                                    </span>

                                    {/* Category Overlay */}
                                    <span className={`absolute bottom-2 right-2 text-[7.5px] font-mono tracking-widest font-bold uppercase px-2 py-0.5 rounded border ${badgeBg} backdrop-blur-md`}>
                                      {post.category}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <h3 className="text-xs font-bold text-neutral-100 tracking-tight leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                                      {post.title}
                                    </h3>
                                    <span 
                                      className="text-[9px] font-mono text-neutral-500 truncate hover:text-emerald-400 hover:underline cursor-pointer transition-colors relative z-10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAuthorProfile(post.author);
                                      }}
                                    >
                                      Oleh {post.author}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-neutral-850/60 mt-3 pt-2 shrink-0">
                                  <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-500 font-bold">
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3.5 w-3.5 text-amber-500" />
                                      <span className="text-neutral-350">{post.views} Views</span>
                                    </div>
                                    <span className="text-neutral-800">•</span>
                                    <div className="flex items-center gap-1">
                                      <ThumbsUp className="h-3.5 w-3.5 text-neutral-600" />
                                      <span className="text-neutral-500">{post.likes} Likes</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.a>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* FEED GRID FEED CARDS */}
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                      <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                      <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest animate-pulse">Menghubungkan memori tulisan...</p>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="border border-dashed border-neutral-850 p-16 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
                      <FileText className="h-8 w-8 text-neutral-600 mb-3" />
                      <p className="font-semibold text-neutral-300 text-sm">Postingan Tidak Ditemukan</p>
                      <p className="text-xs text-neutral-500 mt-1 max-w-[300px]">
                        {role === "admin" 
                          ? "Belum ada postingan yang sesuai dengan filter atau kata kunci Anda. Anda dapat mulai dengan menulis postingan baru!"
                          : "Belum ada postingan yang sesuai dengan filter atau kata kunci Anda. Silakan hubungi Redaksi atau kembali beberapa saat lagi!"}
                      </p>
                      {role === "admin" && (
                        <button
                          onClick={() => setSidebarTab("create")}
                          className="mt-4 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 text-xs rounded-xl font-medium transition-all"
                        >
                          Coba Asisten AI Anda
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPosts.map((post) => {
                        // Map colors helper
                        let badgeTheme = "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
                        if (post.categoryColor === "emerald") badgeTheme = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        if (post.categoryColor === "amber") badgeTheme = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                        if (post.categoryColor === "sky") badgeTheme = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                        if (post.categoryColor === "violet") badgeTheme = "bg-violet-500/10 text-violet-400 border-violet-500/20";

                        return (
                          <motion.a
                            key={post.id}
                            href={getPostPermalink(post)}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedReadPost(post);
                            }}
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            onClickCapture={() => {
                              // Auto increment views locally for feedback
                              setPosts((prev) =>
                                prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
                              );
                            }}
                            className="bg-[#121110] border border-neutral-850 hover:border-neutral-750 p-4 rounded-2xl flex flex-col justify-between overflow-hidden shadow-md cursor-pointer transition-colors duration-300 group block text-left"
                          >
                            
                            {/* Aspect Wrapper for Image banner */}
                            <div className="w-full aspect-[16/10] bg-neutral-950 rounded-xl overflow-hidden mb-4 relative">
                              <img 
                                src={post.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"} 
                                alt={post.title} 
                                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                              
                              {/* Category Overlay */}
                              <span className={`absolute top-3 left-3 text-[9px] font-mono tracking-widest font-bold uppercase px-2.5 py-0.5 rounded border ${badgeTheme} backdrop-blur-md`}>
                                {post.category}
                              </span>
                            </div>

                            {/* Header Titles */}
                            <div className="flex-1 flex flex-col gap-1.5">
                              <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500 shrink-0 relative z-10">
                                <User className="h-3 w-3 text-neutral-600" />
                                <span 
                                  className="truncate max-w-[90.5px] hover:text-emerald-400 hover:underline cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAuthorProfile(post.author);
                                  }}
                                >
                                  {post.author}
                                </span>
                                <span className="text-neutral-700 mx-1">•</span>
                                <Calendar className="h-3 w-3 text-neutral-600" />
                                <span>{post.createdAt}</span>
                              </div>

                              <h3 className="text-xs sm:text-sm font-bold text-neutral-100 tracking-tight leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 mt-1">
                                {post.title}
                              </h3>

                              {post.subtitle && (
                                <p className="text-[11px] text-neutral-450 line-clamp-2 leading-relaxed tracking-wide">
                                  {post.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Dynamic Likes Views Row */}
                            <div className="flex items-center justify-between border-t border-neutral-850 mt-4 pt-2.5 shrink-0">
                              <div className="flex items-center gap-3 text-[9px] font-mono text-neutral-500">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeClick(post.id);
                                  }}
                                  className="flex items-center gap-1 hover:text-red-400 transition-colors py-1 group"
                                  title="Appreciate post"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5 text-neutral-500 group-hover:text-red-400 group-hover:scale-110 transition-transform" />
                                  <span className="font-bold">{post.likes}</span>
                                </button>
                                <div className="flex items-center gap-1 py-1">
                                  <Eye className="h-3.5 w-3.5 text-neutral-600" />
                                  <span>{post.views}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-0.5 text-xs font-mono text-neutral-400 group-hover:text-emerald-400 transition-colors">
                                <span className="text-[9px] uppercase font-bold tracking-wider">BACA</span>
                                <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>

                          </motion.a>
                        );
                      })}
                    </div>
                  )}

                  {/* AdSense Bottom simulated banner */}
                  <AdSenseStub position="FOOTER_RESPONSIVE" />

                </div>

                {/* Right Column: Dynamic Articles + AdSense Sidebar */}
                <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 self-start font-sans">
                  
                  {/* Widget 1: Artikel Terbaru Terbit Otomatis */}
                  <div className="bg-[#121110] border border-neutral-850 p-4.5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-100 tracking-tight font-sans">
                            Kabar Terbaru Otomatis
                          </h4>
                          <p className="text-[8px] text-neutral-550 font-mono tracking-wider">
                            AUTO-FEED RECENTLY
                          </p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Feed aktif sinkronisasi real-time" />
                    </div>

                    {posts && posts.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {[...posts]
                          .sort((a, b) => {
                            const dateA = new Date(a.createdAt || a.date || 0).getTime();
                            const dateB = new Date(b.createdAt || b.date || 0).getTime();
                            return dateB - dateA;
                          })
                          .slice(0, 4)
                          .map((p) => (
                            <div 
                              key={`sidebar-post-${p.id}`}
                              onClick={() => setSelectedReadPost(p)}
                              className="flex gap-2.5 items-start cursor-pointer hover:bg-neutral-900/40 p-1.5 rounded-xl transition-all group text-left"
                            >
                              <div className="w-14 h-11 bg-neutral-950 rounded-lg overflow-hidden shrink-0 border border-neutral-900">
                                <img 
                                  src={p.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=150&q=80"}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[11px] font-bold text-neutral-200 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                                  {p.title}
                                </h5>
                                <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-neutral-550 mt-0.5">
                                  <span className="truncate max-w-[70px]">{p.author}</span>
                                  <span>•</span>
                                  <span>{p.createdAt}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-[10px] text-neutral-600 italic">Belum ada tulisan siber yang terbit.</p>
                    )}
                  </div>

                  {/* Widget 2: AdSense Banner Slot */}
                  {isAdSenseLinkedGlobal && (
                    <div className="flex flex-col gap-1">
                      <AdSenseStub position="SIDEBAR_RECTANGLE" />
                    </div>
                  )}

                  {/* Widget 3: Admin AdSense Configuration Helper */}
                  {role === "admin" && (
                    <div className="bg-[#121110] border border-neutral-850 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden text-left">
                      <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[7px] font-mono text-emerald-400 font-extrabold uppercase">Aura Desk</span>
                      </div>
                      <h5 className="text-[10px] font-bold text-neutral-200 font-mono uppercase tracking-wider text-emerald-400 mt-1">
                        Sinyal AdSense
                      </h5>
                      <p className="text-[9.5px] text-neutral-400 leading-relaxed font-sans">
                        Sasis Anda teruji penuh standard Google AdSense. Kunci penayang saat ini: <span className="text-emerald-400 font-mono text-[9px]">ca-pub-{adsensePubId || "[Setelan]"}</span>.
                      </p>
                      <button 
                        onClick={() => setSidebarTab("settings")}
                        className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-emerald-400 rounded-lg text-[8.5px] font-mono uppercase font-bold transition-all border border-neutral-800"
                      >
                        Kelola ID AdSense
                      </button>
                    </div>
                  )}

                  {/* Widget 4: Sticky Ad at Bottom */}
                  {isAdSenseLinkedGlobal && (
                    <div className="sticky top-[380px] flex flex-col gap-1.5">
                      <AdSenseStub position="SIDEBAR_STICKY" />
                    </div>
                  )}

                </aside>

              </div>
            )}

              {sidebarTab === "create" && (
                <CreatePostWorkspace 
                  onPublish={handlePublishPost} 
                  onSuccess={() => {
                    loadPostsData();
                    setSidebarTab("feed");
                  }} 
                />
              )}

              {sidebarTab === "review" && (
                <ReviewPostWorkspace 
                  posts={posts} 
                  onSelectRead={(post) => setSelectedReadPost(post)} 
                  onDelete={handleDeletePost} 
                />
              )}

              {sidebarTab === "edit" && (
                <EditPostWorkspace 
                  posts={posts} 
                  editingPost={editingPost} 
                  onSetEditingPost={setEditingPost} 
                  onSaveEdit={handleSaveEditPost} 
                />
              )}

              {sidebarTab === "settings" && (
                <SettingsWorkspace 
                  websiteTitle={websiteTitle}
                  onUpdateWebsiteTitle={handleUpdateWebsiteTitle}
                  sheetsConfig={sheetsConfig}
                  onSaveUrl={handleSaveSheetsUrl}
                  onDisconnect={handleDisconnectSheet}
                  onResetToDefault={handleResetToDefault}
                  postsCount={posts.length}
                  adsensePubId={adsensePubId}
                  onUpdateAdsensePubId={handleUpdateAdsensePubId}
                  posts={posts}
                  
                  // Banner custom parameters pass
                  heroSlogan={heroSlogan}
                  onUpdateHeroSlogan={handleUpdateHeroSlogan}
                  heroDescription={heroDescription}
                  onUpdateHeroDescription={handleUpdateHeroDescription}
                  heroBgImage={heroBgImage}
                  onUpdateHeroBgImage={handleUpdateHeroBgImage}
                />
              )}

            </div>

          </div>
        )}

      </section>

      {/* COMPLIANT PROFESSIONAL FOOTER */}
      <footer className="w-full shrink-0 border-t border-neutral-900 bg-neutral-950/80 py-10 select-text mt-auto z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
            <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">Technobeta Newsroom</span>
            <p className="text-[10.5px] text-neutral-550 leading-relaxed max-w-sm text-neutral-500">
              Platform publikasi independen terintegrasi database Google Sheets & AI Generator. Mematuhi kebijakan konten Google Publisher secara penuh.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-[10.5px] font-mono font-bold text-neutral-400">
            <button onClick={() => setCurrentNav("home")} className="hover:text-emerald-400 transition-colors uppercase">Beranda</button>
            <span className="text-neutral-750 text-neutral-700">•</span>
            <button onClick={() => setCurrentNav("about")} className="hover:text-emerald-400 transition-colors uppercase">Tentang Kami</button>
            <span className="text-neutral-750 text-neutral-700">•</span>
            <button onClick={() => setCurrentNav("contact")} className="hover:text-emerald-400 transition-colors uppercase">Hubungi Kami</button>
            <span className="text-neutral-750 text-neutral-700">•</span>
            <button onClick={() => setCurrentNav("legal")} className="hover:text-emerald-400 transition-colors uppercase">Kebijakan Privasi</button>
            <span className="text-neutral-750 text-neutral-700">•</span>
            <button onClick={() => setShowSitemapModal(true)} className="text-neutral-500 hover:text-emerald-400 transition-colors uppercase">Sitemap</button>
            <span className="text-neutral-750 text-neutral-700">•</span>
            {role === "admin" ? (
              <button 
                onClick={() => handleSetRole("visitor")} 
                className="text-red-400 hover:text-red-300 transition-colors uppercase flex items-center gap-1 font-bold"
              >
                <span>🔒 Keluar Redaksi</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAdminLogin(true)} 
                className="text-emerald-500 hover:text-emerald-400 transition-colors uppercase flex items-center gap-1 font-bold"
              >
                <span>🔑 Portal Redaksi</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* GDPR Consent cookie banner */}
      <CookieConsent />

      {/* RENDER DYNAMIC ACTIVE PORTALS MODALS */}
      <AnimatePresence>
        
        {/* Connection spreadsheet wizard */}
        {activeModal === "config" && (
          <SpreadsheetConfig
            webAppUrl={sheetsConfig.webAppUrl}
            onSaveUrl={handleSaveSheetsUrl}
            onClose={() => setActiveModal("none")}
            localPostsCount={posts.length}
            onSyncLocalData={handleBulkSyncToSheet}
          />
        )}

        {/* manual publisher input draft */}
        {activeModal === "add-manual" && (
          <AddPostModal
            onPublish={handlePublishPost}
            onClose={() => setActiveModal("none")}
          />
        )}

        {/* AI generator magic box wizard */}
        {activeModal === "add-ai" && (
          <AIDraftModal
            onPublish={handlePublishPost}
            onClose={() => setActiveModal("none")}
          />
        )}

        {/* full review view layout modal */}
        {selectedReadPost && (
          <PostDetailModal
            post={selectedReadPost}
            onClose={() => setSelectedReadPost(null)}
            onLike={handleLikeClick}
            hasSheetsConnected={sheetsConfig.isConnected}
            onDelete={role === "admin" ? handleDeletePost : undefined}
            allPosts={posts}
            onSelectPost={setSelectedReadPost}
            onAuthorClick={setSelectedAuthorProfile}
          />
        )}

        {/* author profile drawer / dialog */}
        {selectedAuthorProfile && (
          <AuthorProfileModal
            authorName={selectedAuthorProfile}
            onClose={() => setSelectedAuthorProfile(null)}
          />
        )}

        {/* Admin Login Dialog wizard with clear system boundary notice */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => {
                setShowAdminLogin(false);
                setLoginError("");
                setAdminPasswordInput("");
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#121110] border border-neutral-850 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 flex flex-col gap-5 select-text text-neutral-250 font-sans"
            >
              {/* Boundary Indicator Title */}
              <div className="flex flex-col gap-2 border-b border-neutral-850 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ff9f1c]/10 border border-[#ff9f1c]/20 flex items-center justify-center">
                    <span className="text-sm text-[#ff9f1c]">🚧</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black text-[#ff9f1c] uppercase tracking-wider block">BATAS WILAYAH OPERASI</span>
                    <h3 className="text-md font-bold tracking-tight text-neutral-100 font-sans">
                      Dinding Pemisah Sistem & Pembaca
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Explanatory Boundary Rules Text */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 flex flex-col gap-3 text-[11px] text-neutral-400 leading-relaxed shadow-inner">
                <p>
                  Situs ini menggunakan sistem <strong>Isolasi Berkas Ganda</strong> yang ketat untuk mengamankan data dan mematuhi standard kepatuhan Google AdSense:
                </p>
                <div className="grid grid-cols-2 gap-3.5 mt-1 border-t border-neutral-900 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono uppercase font-black text-emerald-400">🌐 RUANG PUBLIK (BACA)</span>
                    <p className="text-[10px] leading-relaxed text-neutral-500">
                      Pengunjung umum hanya diperkenankan membaca, memberikan Like, menulis komentar, scroll halaman, dan berinteraksi dengan visual mading.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 border-l border-neutral-900 pl-3.5">
                    <span className="text-[9px] font-mono uppercase font-black text-amber-400">🔑 RUANG PEMILIK (REDAKSI)</span>
                    <p className="text-[10px] leading-relaxed text-neutral-500">
                      Sistem penulisan AI Gemini, sinkronisasi tautan Google Sheets, serta penghapusan atau penyuntingan postingan hanya dapat dijalankan di balik gerbang ini.
                    </p>
                  </div>
                </div>
                <div className="border-t border-neutral-900 pt-2 text-[10px] italic text-neutral-500 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Pengunjung umum dilarang melintasi batas operasional ini.</span>
                </div>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4 mt-1">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">
                    Sandi Akses Kontrol Pemilik Mading
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan sandi otentikasi..."
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    required
                    autoFocus
                    className="bg-neutral-950 border border-neutral-850 focus:border-[#ff9f1c]/45 p-3.5 rounded-xl text-xs text-amber-400 outline-none placeholder-neutral-700 transition-colors shadow-inner w-full font-mono"
                  />
                  
                  {loginError ? (
                    <span className="text-[10px] text-red-400 font-mono italic mt-1 bg-red-950/20 px-2.5 py-1.5 rounded border border-red-900/40">
                      {loginError}
                    </span>
                  ) : (
                    <span className="text-[9px] text-neutral-500 font-mono leading-relaxed mt-1">
                      💡 Ketik kata sandi <strong className="text-emerald-400 font-bold">"admin"</strong> atau <strong className="text-emerald-400 font-bold">"redaksi"</strong> untuk melintasi pembatas sistem.
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-neutral-850 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setLoginError("");
                      setAdminPasswordInput("");
                    }}
                    className="px-4 py-2 text-xs font-mono font-bold text-neutral-500 hover:text-neutral-300 transition-colors border border-transparent uppercase"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-neutral-950 border border-emerald-500/20 font-bold font-mono text-[10.5px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
                  >
                    Buka Batas Redaksi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Sitemap.xml copy/download modal for Search Console indexing */}
        {showSitemapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowSitemapModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#121110] border border-neutral-850 p-6 sm:p-7 rounded-3xl shadow-2xl z-10 flex flex-col gap-4 select-text text-neutral-250 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-lg">🌐</span>
                  <div>
                    <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-wider block">Google Search Console Support</span>
                    <h3 className="text-sm font-bold tracking-tight text-neutral-100 font-mono">
                      Sitemap.xml Generator
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowSitemapModal(false)}
                  className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Berkas XML sitemap di bawah merinci semua tautan artikel pada sistem saat ini. Anda dapat menyalin isi dokumen ini untuk menyiapkannya di Google Search Console demi mengindeksi setiap artikel secara terpisah.
              </p>

              <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-3.5 flex flex-col gap-2.5 shadow-inner">
                <span className="text-[9px] font-mono uppercase font-black text-neutral-500">Isi Konten XML</span>
                <pre className="bg-neutral-950 text-emerald-400/85 font-mono text-[9px] p-3 rounded-xl border border-neutral-900 select-all overflow-x-auto max-h-56 block leading-relaxed scrollbar-thin">
                  {generateSitemapXml(posts)}
                </pre>
              </div>

              {/* Action Rows */}
              <div className="flex flex-col sm:flex-row gap-2 border-t border-neutral-850 pt-4 mt-1">
                <button
                  onClick={() => {
                    if (!posts || posts.length === 0) {
                      alert("Tidak ada tulisan artikel untuk dibuat sitemap!");
                      return;
                    }
                    const xmlText = generateSitemapXml(posts);
                    navigator.clipboard.writeText(xmlText);
                    alert("✓ Berkas Sitemap.xml berhasil disalin ke clipboard Anda!");
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-[10.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  📋 Salin Struktur XML
                </button>
                <button
                  onClick={() => {
                    if (!posts || posts.length === 0) {
                      alert("Tidak ada tulisan artikel untuk dibuat sitemap!");
                      return;
                    }
                    const xmlText = generateSitemapXml(posts);
                    const blob = new Blob([xmlText], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "sitemap.xml";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-200 border border-neutral-800 font-bold font-mono text-[10.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  📥 Unduh Sitemap.xml
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </main>
  );
}
