import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  demoManifestName,
  demoRoot,
  desktopRoot,
  exists,
  sourceDigest,
  sourceRoot,
  treeDigest,
} from "./desktop-demo-source.mjs";
import {
  findRootRelativeIconPaths,
  normalizeDemoIconPaths,
} from "./demo-asset-paths.mjs";

const run = promisify(execFile);
if (!await exists(path.join(desktopRoot, "package.json"))) {
  throw new Error(`Desktop source not found at ${desktopRoot}. Set AZDOCS_SOURCE to a complete azdocs checkout.`);
}
if (!await exists(path.join(desktopRoot, "node_modules"))) {
  throw new Error(`Desktop dependencies are missing. Run pnpm install in ${desktopRoot}.`);
}

const inputHash = await sourceDigest();
const { stdout: revision } = await run("git", ["rev-parse", "HEAD"], { cwd: sourceRoot });
const { stdout: dirtyOutput } = await run("git", ["status", "--porcelain", "--", "desktop", "data", "docs/marks/assets"], { cwd: sourceRoot });

await rm(demoRoot, { recursive: true, force: true });
await mkdir(demoRoot, { recursive: true });

console.log("Typechecking and building the current azdocs desktop showcase…");
await run("pnpm", ["exec", "tsc", "--noEmit"], {
  cwd: desktopRoot,
  env: { ...process.env, AZDOCS_SHOWCASE: "1" },
  maxBuffer: 32 * 1024 * 1024,
});
await run("pnpm", [
  "exec",
  "vite",
  "build",
  "--base=/demo/",
  `--outDir=${demoRoot}`,
  "--emptyOutDir",
], {
  cwd: desktopRoot,
  env: { ...process.env, AZDOCS_SHOWCASE: "1" },
  maxBuffer: 32 * 1024 * 1024,
});

const normalizedIconFiles = await normalizeDemoIconPaths(demoRoot);
if (normalizedIconFiles.length > 0) {
  console.log(
    `Rebased Azure icon URLs beneath /demo/ in ${normalizedIconFiles.length} generated file${normalizedIconFiles.length === 1 ? "" : "s"}.`,
  );
}
const rootRelativeIconFiles = await findRootRelativeIconPaths(demoRoot);
if (rootRelativeIconFiles.length > 0) {
  throw new Error(
    `The generated showcase still contains root-relative /icons/ URLs in: ${rootRelativeIconFiles.join(", ")}`,
  );
}

if (await sourceDigest() !== inputHash) {
  throw new Error("azdocs desktop source changed during the showcase build; run it again.");
}

const indexPath = path.join(demoRoot, "index.html");
let html = await readFile(indexPath, "utf8");
html = html
  .replace('<html lang="en">', '<html lang="en" data-theme="dark">')
  .replace(/\s*<meta name="color-scheme"[^>]*>/g, "")
  .replace(/\s*<meta name="theme-color"[^>]*>/g, "")
  .replace("<head>", `<head>\n    <meta name="color-scheme" content="dark" />\n    <meta name="theme-color" content="#101820" />\n    <script data-azdocs-showcase-theme>\n      document.documentElement.dataset.theme = "dark";\n      try { localStorage.setItem("azdocs-theme", "dark"); } catch {}\n    </script>`);

if (!html.includes('data-theme="dark"') || !html.includes("/demo/assets/")) {
  throw new Error("The generated showcase is missing its forced dark theme or /demo/ asset base.");
}

await writeFile(indexPath, html);

async function removeMetadata(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await removeMetadata(absolute);
    else if (entry.name === ".DS_Store") await rm(absolute);
  }
}
await removeMetadata(demoRoot);

const outputHash = await treeDigest(demoRoot);
await writeFile(path.join(demoRoot, demoManifestName), `${JSON.stringify({
  sourceRepository: "russmckendrick/azdocs",
  sourceRevision: revision.trim(),
  sourceSha256: inputHash,
  sourceDirty: dirtyOutput.trim().length > 0,
  generatedAt: new Date().toISOString(),
  entry: "index.html",
  base: "/demo/",
  theme: "dark",
  showcase: true,
  outputSha256: outputHash,
}, null, 2)}\n`);

console.log(`Built dark desktop showcase ${outputHash.slice(0, 12)} from ${revision.trim().slice(0, 12)}${dirtyOutput.trim() ? " with local source changes" : ""}.`);
