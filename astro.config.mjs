import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkDocsLinks from "./src/plugins/remark-doc-links.mjs";

export default defineConfig({
  site: "https://azdocs.cloud",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkDocsLinks] }),
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid"]
    },
    shikiConfig: {
      theme: "github-dark-high-contrast",
      wrap: true
    }
  },
  vite: {
    build: {
      cssMinify: "lightningcss"
    }
  }
});
