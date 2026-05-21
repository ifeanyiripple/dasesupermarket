// app/robots.ts
// Next.js App Router robots — auto-served at /robots.txt
// This is the first file Google reads when it crawls your site.
// Getting this right is step 1 of any serious SEO effort.

import { MetadataRoute } from "next"

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dasesupermarket.com"
).replace(/\/$/, "")

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // ── Main Googlebot rule ─────────────────────────────────────────────
        userAgent: "Googlebot",
        allow: [
          "/",
          "/shop",
          "/food",
          "/rooms",
          "/product/",
          "/food/",         // food detail pages
          "/rooms/",        // room detail pages
          "/categories/",
          "/about-us",
          "/contact-us",
          "/search",
        ],
        disallow: [
          // Auth pages — no SEO value, avoid duplicate content issues
          "/auth/",
          "/api/auth/",

          // Account & private pages
          "/account",
          "/profile",
          "/orders",
          "/checkout",
          "/cart",
          "/wishlist",

          // Admin — never crawl
          "/admin",
          "/admin/",

          // API routes — not HTML, no value for Google
          "/api/",

          // Payment callbacks
          "/payment-success",

          // Search with no query — just an empty state page
          "/search?q=",
        ],
      },

      {
        // ── All other bots ──────────────────────────────────────────────────
        // Bing, Yahoo, DuckDuckGo — same rules as Google
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/auth/",
          "/api/",
          "/admin",
          "/admin/",
          "/account",
          "/profile",
          "/orders",
          "/checkout",
          "/cart",
        ],
      },

      {
        // ── Block AI training crawlers explicitly ───────────────────────────
        // These consume bandwidth without sending traffic back to your site.
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "Google-Extended",
          "PerplexityBot",
        ],
        disallow: ["/"],
      },
    ],

    // ── Point Google to your sitemap ────────────────────────────────────────
    // Google Search Console also needs this added manually, but having it
    // in robots.txt means any crawler can auto-discover it.
    sitemap: `${BASE_URL}/sitemap.xml`,

    // ── Crawl delay ─────────────────────────────────────────────────────────
    // Tells bots to wait 1 second between requests — protects your serverless
    // functions from being hammered during a large crawl session.
    // Note: Googlebot ignores this but respects your server's actual response times.
    // crawlDelay: 1,  ← uncomment if you notice crawl-related slowdowns
  }
}