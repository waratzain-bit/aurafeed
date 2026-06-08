import React, { useState } from "react";
import { Shield, FileText, AlertCircle, Sparkles, AlertTriangle } from "lucide-react";

export default function LegalPages() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "disclaimer">("privacy");

  return (
    <div className="bg-[#121110] border border-neutral-850 rounded-2xl p-6 md:p-8 flex flex-col gap-6 select-text text-neutral-300 leading-relaxed text-xs sm:text-sm">
      
      {/* Navigation tabs for legal papers */}
      <div className="flex border-b border-neutral-850 pb-2 gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "privacy"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "text-neutral-500 hover:text-neutral-305 border border-transparent"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Kebijakan Privasi
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "terms"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "text-neutral-500 hover:text-neutral-305 border border-transparent"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Ketentuan Layanan
        </button>
        <button
          onClick={() => setActiveTab("disclaimer")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "disclaimer"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "text-neutral-500 hover:text-neutral-350 border border-transparent"
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Disclaimer
        </button>
      </div>

      {/* Dynamic contents */}
      {activeTab === "privacy" && (
        <div className="flex flex-col gap-4 font-sans animate-fadeIn">
          <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            Kebijakan Privasi Technobeta
          </h2>
          <p className="text-[11px] text-neutral-500 font-mono">Pembaruan Terakhir: 7 Juni 2026</p>
          
          <p>
            Di Technobeta, yang dapat diakses dari layanan publikasi kami, salah satu prioritas utama kami adalah privasi pengunjung kami. Dokumen Kebijakan Privasi ini berisi jenis informasi yang dikumpulkan dan dicatat oleh Technobeta serta bagaimana kami menggunakannya.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">1. Log File (File Log)</h3>
          <p>
            Technobeta mengikuti prosedur standar menggunakan file log. File-file ini mencatat pengunjung ketika mereka mengunjungi situs web. Semua perusahaan hosting melakukan ini dan merupakan bagian dari analisis layanan hosting. Informasi yang dikumpulkan oleh file log termasuk alamat protokol internet (IP), jenis browser, Penyedia Layanan Internet (ISP), stempel tanggal dan waktu, halaman perujukan/keluar, dan mungkin jumlah klik. Ini tidak terkait dengan informasi apa pun yang dapat diidentifikasi secara pribadi.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">2. Cookie dan Web Beacon</h3>
          <p>
            Seperti situs web lainnya, Technobeta menggunakan 'cookie'. Cookie ini digunakan untuk menyimpan informasi termasuk preferensi pengunjung, dan halaman-halaman di situs web yang diakses atau dikunjungi pengunjung. Informasi tersebut digunakan untuk mengoptimalkan pengalaman pengguna dengan menyesuaikan konten halaman web kami berdasarkan jenis browser pengunjung dan/atau informasi lainnya.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">3. Google DoubleClick DART Cookie</h3>
          <p>
            Google adalah salah satu vendor pihak ketiga di situs kami. Google juga menggunakan cookie, yang dikenal as cookie DART, untuk menyajikan iklan kepada pengunjung situs kami berdasarkan kunjungan mereka ke Technobeta dan situs lain di internet. Namun, pengunjung dapat memilih untuk menolak penggunaan cookie DART dengan mengunjungi Kebijakan Privasi jaringan iklan dan konten Google di URL berikut – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">https://policies.google.com/technologies/ads</a>.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">4. Kebijakan Privasi Pihak Ketiga</h3>
          <p>
            Kebijakan Privasi Technobeta tidak berlaku untuk pengiklan atau situs web lain. Karena itu, kami menyarankan Anda untuk berkonsultasi dengan masing-masing Kebijakan Privasi dari server iklan pihak ketiga ini untuk informasi yang lebih rinci. Ini mungkin mencakup praktik dan instruksi mereka tentang cara memilih keluar dari opsi tertentu.
          </p>
          <p>
            Anda dapat memilih untuk menonaktifkan cookie melalui opsi browser individual Anda. Untuk mengetahui informasi lebih rinci tentang manajemen cookie dengan browser web tertentu, informasi tersebut dapat ditemukan di situs web masing-masing browser.
          </p>
        </div>
      )}      {activeTab === "terms" && (
        <div className="flex flex-col gap-4 font-sans animate-fadeIn">
          <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            Ketentuan Layanan Technobeta
          </h2>
          <p className="text-[11px] text-neutral-500 font-mono">Pembaruan Terakhir: 7 Juni 2026</p>

          <p>
            Selamat datang di Technobeta! Ketentuan Layanan ini menjelaskan aturan dan peraturan untuk penggunaan situs web Technobeta. Dengan mengakses situs web ini, kami menganggap Anda menerima ketentuan layanan ini. Jangan terus menggunakan Technobeta jika Anda tidak setuju untuk mematuhi semua ketentuan yang tercantum di halaman ini.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">1. Lisensi Konten Publikasi</h3>
          <p>
            Kecuali dinyatakan lain, Technobeta dan/atau pemberi lisensinya memiliki hak kekayaan intelektual atas semua materi di Technobeta. Semua hak kekayaan intelektual dilindungi undang-undang. Anda dapat mengakses ini dari Technobeta untuk penggunaan pribadi Anda sendiri yang tunduk pada batasan yang diatur dalam ketentuan layanan ini.
          </p>
          <p>Anda dilarang keras untuk:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1 text-neutral-400">
            <li>Menerbitkan ulang materi dari Technobeta tanpa atribusi penulis yang sah.</li>
            <li>Menjual, menyewakan, atau mensublisensikan materi dari Technobeta secara komersial tanpa izin tertulis.</li>
            <li>Mereproduksi, menggandakan, atau menyalin konten Technobeta untuk tujuan spamming.</li>
          </ul>

          <h3 className="font-semibold text-neutral-200 mt-2">2. Komentar & Konten Buatan Pengguna</h3>
          <p>
            Technobeta menyediakan sarana bagi pengguna untuk menulis dan memublikasikan artikel secara dinamis menggunakan database Google Sheets dan motor kecerdasan buatan Gemini AI. Technobeta tidak menyaring, mengedit, mempublikasikan, atau meninjau komentar atau postingan sebelum kehadirannya di situs web secara langsung. Postingan tidak mencerminkan pandangan dan pendapat Technobeta, agen, dan/atau afiliasinya.
          </p>
        </div>
      )}

      {activeTab === "disclaimer" && (
        <div className="flex flex-col gap-4 font-sans animate-fadeIn">
          <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            Sanggahan (Disclaimer) Technobeta
          </h2>
          <p className="text-[11px] text-neutral-500 font-mono">Pembaruan Terakhir: 7 Juni 2026</p>

          <p>
            Apabila Anda memerlukan informasi lebih lanjut atau memiliki pertanyaan tentang sanggahan situs kami, jangan ragu untuk menghubungi kami melalui e-mail di <span className="text-emerald-400 font-mono">waratzain@gmail.com</span>.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">1. Validitas Informasi</h3>
          <p>
            Semua informasi di situs web ini - Technobeta - diterbitkan dengan niat baik dan hanya untuk tujuan informasi umum dan kreativitas. Technobeta tidak memberikan jaminan apa pun tentang kelengkapan, keandalan, dan keakuratan informasi ini. Segala tindakan yang Anda lakukan atas informasi yang Anda temukan di situs web ini (Technobeta), sepenuhnya merupakan risiko Anda sendiri.
          </p>

          <h3 className="font-semibold text-neutral-200 mt-2">2. Penggunaan Asisten AI (Gemini SDK)</h3>
          <div className="bg-yellow-500/10 border border-yellow-500/25 p-3.5 rounded-xl flex items-start gap-2 text-xs text-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-405 mt-0.5 shrink-0" />
            <span>
              <strong>Penting bagi Peninjau AdSense:</strong> Technobeta menggunakan model Google Gemini AI untuk membantu proses pembuatan draf konten tulisan. Setiap draf tulisan yang dibuat dengan AI disaring, ditinjau, dan dapat disunting secara manual oleh manusia (editorial review) sebelum secara sadar diterbitkan secara publik ke spreadsheet database.
            </span>
          </div>

          <h3 className="font-semibold text-neutral-200 mt-2">3. Persetujuan Layanan</h3>
          <p>
            Dengan menggunakan situs web kami, Anda dengan ini menyetujui sanggahan kami dan menyetujui ketentuan-ketentuannya secara sukarela dan sadar.
          </p>
        </div>
      )}

    </div>
  );
}
