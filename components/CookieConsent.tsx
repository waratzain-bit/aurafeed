import React, { useState, useEffect } from "react";
import { Info, X, ShieldAlert } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("aurapost_cookie_consent");
    if (!hasConsent) {
      // Small delay for clean entrance
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem("aurapost_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-4.5 z-50 shadow-2xl flex flex-col gap-3 animate-fadeIn select-text">
      
      <div className="flex gap-2.5 items-start">
        <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400 mt-0.5 shrink-0">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <span className="text-[11px] font-mono font-bold text-neutral-100 uppercase tracking-widest block">Kebijakan Cookie & Data</span>
          <p className="text-[11.5px] leading-relaxed text-neutral-400 mt-1">
            Media kami menggunakan cookie untuk mengoptimalkan layanan konten, menganalisis arus lalu lintas, sertifikasi konten, serta menyajikan iklan personalisasi dari jaringan <strong className="text-neutral-300">Google AdSense</strong>. 
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end w-full">
        <button
          onClick={() => setVisible(false)}
          className="px-3 py-1.5 hover:bg-neutral-800 rounded-xl text-[10.5px] font-mono text-neutral-500 hover:text-neutral-300 transition-all font-bold uppercase"
        >
          Tolak
        </button>
        <button
          onClick={acceptConsent}
          className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-xl text-[10.5px] font-mono font-bold uppercase transition-all shadow-md"
        >
          Setujui Cookie
        </button>
      </div>

    </div>
  );
}
