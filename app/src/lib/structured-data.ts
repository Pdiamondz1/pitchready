// Static schema.org structured data (AI/search legibility).
//
// HONEST FRAMING: this JSON-LD *aids* how AI assistants and search engines
// understand the app — it is NOT a guarantee of "AI visibility," and it does
// NOT make the app agent-operable (that would need a real read-only agent
// surface, e.g. an MCP server). Because this is a client-rendered SPA, the
// JSON-LD is seen by agents/crawlers that execute JS; full crawler pickup is an
// SSR/prerender concern for the deploy tier. See app/README.md.

import { app } from "@/config/app";

type JsonLd = Record<string, unknown>;

/** Inject (or update) a JSON-LD <script> in <head>. */
export function setStructuredData(data: JsonLd, id = "ld-json-app"): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export const appStructuredData: JsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: app.name,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Pitch deck builder",
  operatingSystem: "Web",
  description: app.shortDescription,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  audience: {
    "@type": "Audience",
    audienceType: "Founders and startups raising capital",
  },
};
