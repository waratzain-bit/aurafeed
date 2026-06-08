import React, { useState } from "react";
import { Send, CheckCircle, Mail, MessageSquare, ShieldAlert } from "lucide-react";

export default function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Mohon isi semua kolom bertanda bintang (*)!");
      return;
    }

    setSubmitting(true);
    // Simulate API storage wait
    setTimeout(() => {
      setSubmitting(false);
      setIsSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-6 md:p-8 flex flex-col gap-6 select-text text-neutral-300 leading-relaxed text-xs sm:text-sm">
      
      <div className="flex flex-col gap-2 pb-4 border-b border-neutral-850">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
          Hubungi Tim Editorial Technobeta
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Ada pertanyaan, usulan tulisan, permohonan koreksi artikel, atau kerja sama penempatan sponsor? Kirimkan pesan Anda melalui formulir resmi di bawah ini.
        </p>
      </div>

      {isSent && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-start gap-3 text-emerald-300 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0 animate-bounce" />
          <div>
            <strong className="text-emerald-100 block mb-1">Pesan Terkirim Berhasil!</strong>
            <span>Terima kasih telah menghubungi kami. Tim Editorial Technobeta akan meninjau dan merespons pesan Anda dalam kurun waktu 1 - 2 hari kerja melalui alamat e-mail Anda.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Nama lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Susanto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-neutral-200 outline-none text-xs"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Alamat E-mail Aktif *</label>
            <input
              type="email"
              required
              placeholder="budisusanto@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-neutral-200 outline-none text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Subjek / Topik Utama</label>
          <input
            type="text"
            placeholder="Misal: Kerjasama Penulisan / Masukan Artikel"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-neutral-200 outline-none text-xs"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-neutral-500 tracking-wider font-mono uppercase">Teks Isi Pesan Anda *</label>
          <textarea
            required
            rows={5}
            placeholder="Tulis pesan lengkap dengan rincian yang jelas..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-neutral-950 border border-neutral-850 focus:border-neutral-750 p-3.5 rounded-xl text-neutral-205 outline-none tracking-wide text-xs resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="py-3 px-5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black active:scale-[0.98] font-mono text-xs font-bold uppercase rounded-xl tracking-widest transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {submitting ? "KIRIM PESAN..." : "KIRIM SEKARANG"}
        </button>
      </form>

    </div>
  );
}
