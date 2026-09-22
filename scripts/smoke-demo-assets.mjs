// After a deploy, fetch every asset the built demo references from the live
// site. Guards against anything between the build and Cloudflare dropping them.
//
//     node scripts/smoke-demo-assets.mjs [dist/demo] [https://azdocs.cloud]
import path from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { referencedDemoAssets } from "./demo-asset-paths.mjs";

const root = path.resolve(process.argv[2] ?? "dist/demo");
const origin = (process.argv[3] ?? "https://azdocs.cloud").replace(/\/$/, "");

async function collect(directory, found) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(absolute, found);
    else if (/\.(css|html|js|mjs)$/.test(entry.name)) {
      for (const asset of referencedDemoAssets(await readFile(absolute, "utf8"))) found.add(asset);
    }
  }
  return found;
}

const assets = [...await collect(root, new Set())];
if (assets.length === 0) throw new Error(`No demo asset references found under ${root}.`);

const failures = [];
await Promise.all(assets.map(async (asset) => {
  const url = `${origin}/demo/${asset.split("/").map(encodeURIComponent).join("/")}`;
  const response = await fetch(url, { method: "HEAD", redirect: "follow" });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || type.startsWith("text/html")) failures.push(`${response.status} ${type} ${url}`);
}));

if (failures.length > 0) {
  throw new Error(`Live demo is missing ${failures.length} of ${assets.length} assets:\n  ${failures.join("\n  ")}`);
}
console.log(`All ${assets.length} demo assets are served from ${origin}.`);
