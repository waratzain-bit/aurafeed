/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPostSlug(post: { id: string; title: string }) {
  if (!post || !post.title) return "";
  const cleaned = post.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric/hyphen/space
    .trim()
    .replace(/[\s_]+/g, "-") // convert spaces & underscores to hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
  return `${cleaned}-${post.id}`;
}

export function getBasePath() {
  const path = window.location.pathname;
  if (path.includes("/post/")) {
    return path.split("/post/")[0];
  }
  if (path.includes("/article/")) {
    return path.split("/article/")[0];
  }
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

// 🛠️ PERBAIKAN 1: Menambahkan akhiran .html pada permalink artikel
export function getPostPermalink(post: { id: string; title: string }) {
  const basePath = getBasePath();
  return `${basePath}/post/${getPostSlug(post)}.html`;
}

// 🛠️ PERBAIKAN 2: Membersihkan .html saat membaca URL agar artikel tetap bisa ditemukan
export function findPostByIdentifier<T extends { id: string; title: string }>(identifier: string, allPosts: T[]) {
  if (!identifier) return null;
  
  // Hapus akhiran .html jika ada pada identifier agar pencarian slug/ID tetap akurat
  const cleanIdentifier = identifier.endsWith(".html") ? identifier.slice(0, -5) : identifier;
  
  // Try exact ID match first
  let match = allPosts.find((p) => p.id === cleanIdentifier);
  if (match) return match;

  // Try exact slug match
  match = allPosts.find((p) => getPostSlug(p) === cleanIdentifier);
  if (match) return match;

  // Try decoding from slug suffix by splitting on last hyphen (e.g. "cara-menulis-123" -> ID "123")
  const lastHyphenIndex = cleanIdentifier.lastIndexOf("-");
  if (lastHyphenIndex !== -1) {
    const possibleId = cleanIdentifier.substring(lastHyphenIndex + 1);
    match = allPosts.find((p) => p.id === possibleId);
    if (match) return match;
  }

  // Fallback fuzzy match
  match = allPosts.find((p) => {
    const postSlug = getPostSlug(p);
    return postSlug.includes(cleanIdentifier) || cleanIdentifier.includes(postSlug);
  });
  return match || null;
}

export function generateSitemapXml(posts: any[], origin?: string) {
  const baseUrl = origin || window.location.origin;
  const basePath = getBasePath();
  const mainUrl = `${baseUrl}${basePath || "/"}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Main page entry
  xml += `  <url>\n`;
  xml += `    <loc>${mainUrl}</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Each post entry
  posts.forEach((post) => {
    // Standardize date
    const rawDate = post.createdAt || post.date || new Date().toISOString();
    let formattedDate = "";
    try {
      formattedDate = new Date(rawDate).toISOString().split("T")[0];
    } catch {
      formattedDate = new Date().toISOString().split("T")[0];
    }

    const postPermalink = getPostPermalink(post);
    const postUrl = `${baseUrl}${postPermalink}`;

    xml += `  <url>\n`;
    xml += `    <loc>${postUrl}</loc>\n`;
    xml += `    <lastmod>${formattedDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}