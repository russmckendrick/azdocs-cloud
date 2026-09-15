import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const projectRoot = process.cwd();
export const sourceRoot = path.resolve(projectRoot, process.env.AZDOCS_SOURCE ?? "../azdocs");
export const desktopRoot = path.join(sourceRoot, "desktop");
export const demoRoot = path.join(projectRoot, "public/demo");
export const demoManifestName = "manifest.json";
export const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

export async function exists(absolute) {
  try {
    await stat(absolute);
    return true;
  } catch {
    return false;
  }
}

export async function sourceDigest() {
  const hash = createHash("sha256");

  async function visit(relative) {
    const absolute = path.join(sourceRoot, relative);
    const details = await stat(absolute);
    if (details.isDirectory()) {
      for (const name of (await readdir(absolute)).sort()) {
        if (name === ".DS_Store") continue;
        await visit(`${relative}/${name}`);
      }
      return;
    }
    hash.update(relative).update("\0").update(await readFile(absolute)).update("\0");
  }

  for (const input of [
    "desktop/index.html",
    "desktop/package.json",
    "desktop/pnpm-lock.yaml",
    "desktop/tsconfig.json",
    "desktop/vite.config.ts",
    "desktop/src",
    "data",
    "docs/marks/assets",
  ]) {
    await visit(input);
  }

  return hash.digest("hex");
}

export async function treeDigest(root, ignored = new Set()) {
  const hash = createHash("sha256");

  async function visit(relative) {
    const absolute = path.join(root, relative);
    const details = await stat(absolute);
    if (details.isDirectory()) {
      for (const name of (await readdir(absolute)).sort()) {
        const child = relative ? `${relative}/${name}` : name;
        if (!ignored.has(child)) await visit(child);
      }
      return;
    }
    hash.update(relative).update("\0").update(await readFile(absolute)).update("\0");
  }

  await visit("");
  return hash.digest("hex");
}
