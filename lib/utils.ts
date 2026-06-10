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
    .replace(/[^\w\s-]/g, "") 
    .trim()
    .replace(/[\s_]+/g, "-") 
    .replace(/-+/g, "-"); 
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

// 🛠️ DIPERBAIKI: Menghapus akhiran .html agar URL bersih (Clean URLs)
export function getPostPermalink(post: { id: string; title: string }) {
  const basePath = getBasePath();
  // Akhiran .html dihapus
  return `${basePath}/post/${getPostSlug(post)}`;
}

// 🛠️ DIPERBAIKI: Mencari artikel tanpa bergantung pada ekstensi .html
export function findPostByIdentifier<T extends { id: string; title: string }>(identifier: string, allPosts: T[]) {
  if (!identifier) return null;
  
  // Identifier sekarang dianggap sudah bersih (tanpa .html)
  const cleanIdentifier = identifier.replace(/\.html$/, "");
  
  let match = allPosts.find((p) => p.id === cleanIdentifier);
  if (match) return match;

  match = allPosts.find((p) => getPostSlug(p) === cleanIdentifier);
  if (match) return match;

  const lastHyphenIndex = cleanIdentifier.lastIndexOf("-");
  if (lastHyphenIndex !== -1) {
    const possibleId = cleanIdentifier.substring(lastHyphenIndex + 1);
    match = allPosts.find((p) => p.id === possibleId);
    if (match) return match;
  }

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
    const rawDate = post.createdAt || post.date || new Date().toISOString();
    let formattedDate = "";
    try {
      formattedDate = new Date(rawDate).toISOString().split("T")[0];
    } catch {
      formattedDate = new Date().toISOString().split("T")[0];
    }

    // 🛠️ FIX: Pastikan getPostPermalink sudah bersih, 
    // atau gunakan .replace(".html", "") sebagai pengaman tambahan
    const postPermalink = getPostPermalink(post).replace(/\.html$/, "");
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