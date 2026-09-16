import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  demoManifestName,
  demoRoot,
  exists,
  sourceDigest,
  sourceRoot,
  treeDigest,
} from "./desktop-demo-source.mjs";
import { findRootRelativeIconPaths } from "./demo-asset-paths.mjs";

const manifestPath = path.join(demoRoot, demoManifestName);
const indexPath = path.join(demoRoot, "index.html");
if (!await exists(manifestPath) || !await exists(indexPath)) {
  throw new Error("Desktop showcase is missing. Run pnpm build:demo.");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const html = await readFile(indexPath);
if (await treeDigest(demoRoot, new Set([demoManifestName])) !== manifest.outputSha256) {
  throw new Error("Desktop showcase differs from its generated manifest. Run pnpm build:demo.");
}
if (manifest.theme !== "dark" || manifest.base !== "/demo/" || manifest.showcase !== true) {
  throw new Error("Desktop showcase is not the dark, site-safe variation. Run pnpm build:demo.");
}
const markup = html.toString("utf8");
if (!markup.includes('data-theme="dark"') || !markup.includes("/demo/assets/")) {
  throw new Error("Desktop showcase is missing its dark theme or /demo/ asset base. Run pnpm build:demo.");
}
const rootRelativeIconFiles = await findRootRelativeIconPaths(demoRoot);
if (rootRelativeIconFiles.length > 0) {
  throw new Error(
    `Desktop showcase contains root-relative /icons/ URLs in ${rootRelativeIconFiles.join(", ")}. Run pnpm build:demo.`,
  );
}
if (await exists(path.join(sourceRoot, "desktop/package.json")) && await sourceDigest() !== manifest.sourceSha256) {
  throw new Error("Desktop showcase is stale against the current azdocs app. Run pnpm build:demo.");
}

console.log(`Verified dark desktop showcase ${manifest.outputSha256.slice(0, 12)} against current azdocs source.`);
