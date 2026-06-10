import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prerender from 'vite-plugin-prerender';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

function ambilRuteDariSitemap() {
  try {
    // 1. Jalur pencarian file sitemap
    let sitemapPath = path.resolve(__dirname, 'public/sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
      sitemapPath = path.resolve(__dirname, 'sitemap.xml');
    }

    // Jika file fisik benar-benar tidak ada di komputer
    if (!fs.existsSync(sitemapPath)) {
      console.log("\n❌ [AuraFeed Debug] File sitemap.xml TIDAK ditemukan di folder public/ maupun root!");
      return ['/'];
    }

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    
    // 2. Regex super kuat: kebal spasi, baris baru, dan huruf besar/kecil (<LOC> atau <loc>)
    const matches = [...sitemapContent.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)];
    const urls = matches.map(m => m[1].trim());
    
    console.log(`\n🔍 [AuraFeed Debug] Berhasil menemukan ${urls.length} URL di dalam sitemap.xml`);

    // 3. Konversi URL situs menjadi rute internal React Router
    const routes = urls.map(url => {
      try {
        const urlObj = new URL(url);
        // Menghapus /aurafeed dan .html agar menjadi rute bersih (contoh: /post/judul-artikel)
        return urlObj.pathname.replace('/aurafeed', '').replace('.html', '');
      } catch (e) {
        return '';
      }
    });

    // 4. Bersihkan rute kosong dan hilangkan duplikasi
    const cleanRoutes = routes.map(r => (r === '' || r === '/') ? '/' : r);
    const finalRoutes = [...new Set(cleanRoutes)].filter(Boolean);

    // Jaminan: Jika kosong, minimal halaman utama wajib di-render
    const hasilAkhir = finalRoutes.length > 0 ? finalRoutes : ['/'];
    
    console.log("🚀 [AuraFeed Debug] Rute yang dikirim ke Prerender:", hasilAkhir, "\n");
    return hasilAkhir;

  } catch (error) {
    console.error("\n❌ [AuraFeed Debug] Terjadi eror saat membaca sitemap:", error, "\n");
    return ['/'];
  }
}

export default defineConfig({
  base: '/aurafeed/',
  plugins: [
    react(),
    tailwindcss(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ambilRuteDariSitemap(), // Menggunakan fungsi debug di atas
    }),
  ],
});