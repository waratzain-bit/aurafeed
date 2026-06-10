import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Sitemap from 'vite-plugin-sitemap';
import axios from 'axios'; 

// ===== FUNGSI PENGAMBIL DATA SLUG (ANTI-CACHE & SINKRON FORMAT WEB) =====
async function ambilSlugSpreadsheet(urlApi) {
  if (!urlApi) {
    console.warn("[Sitemap] Peringatan: VITE_API_URL tidak ditemukan di file .env");
    return [];
  }
  
  try {
    const response = await axios.get(`${urlApi}?t=${new Date().getTime()}`);
    const dataMentah = response.data;

    // 🛠️ FIX 1: Ambil langsung dari dataMentah.data sesuai hasil log CMD Anda
    const dataArtikel = dataMentah.data || [];

    if (dataArtikel.length === 0) {
      console.warn("[Sitemap] Peringatan: Tidak ada artikel yang ditemukan di database Spreadsheet.");
      return [];
    }

    const links = dataArtikel.map(item => {
      // 🛠️ FIX 2: Replikasi logika pembuatan slug (Judul-ID) agar sinkron dengan utils.ts Anda
      const judulBersih = String(item.title || 'post')
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Hapus karakter non-alfanumerik
        .trim()
        .replace(/[\s_]+/g, "-") // Ubah spasi & underscore jadi tanda hubung
        .replace(/-+/g, "-");    // Satukan tanda hubung yang ganda
      
      const slugLengkap = `${judulBersih}-${item.id}`;
      
      return `/post/${slugLengkap}.html`;
    });

    // Menghapus duplikasi artikel jika ada & membuang rute kosong
    const linksUnik = [...new Set(links)].filter(link => !link.includes('tanpa-judul'));

    console.log(`\x1b[32m%s\x1b[0m`, `[Sitemap] 🔥 BERHASIL! Menarik ${linksUnik.length} rute artikel berakhiran .html ke sitemap!`);
    return linksUnik;
  } catch (error) {
    console.error("[Sitemap] Gagal memproses data spreadsheet untuk sitemap:", error.message);
    return [];
  }
}

// ===== KONFIGURASI VITE MAIN ENGINE =====
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const linkApiDariEnv = env.VITE_API_URL;
  
  const ruteDinamisArtikel = await ambilSlugSpreadsheet(linkApiDariEnv);
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      Sitemap({
        hostname: 'https://waratzain-bit.github.io',
        basePath: '/aurafeed',
        exclude: ['/404'],
        dynamicRoutes: ruteDinamisArtikel 
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: '/aurafeed/',
  };
});