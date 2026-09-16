import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const textExtensions = new Set([".css", ".html", ".js", ".mjs"]);
const quotedRootIconPath = /(["'`])\/icons\//g;
const unquotedCssRootIconPath = /url\(\s*\/icons\//g;

export function rewriteRootRelativeIconPaths(contents) {
  return contents
    .replace(quotedRootIconPath, "$1/demo/icons/")
    .replace(unquotedCssRootIconPath, "url(/demo/icons/");
}

export function containsRootRelativeIconPath(contents) {
  quotedRootIconPath.lastIndex = 0;
  unquotedCssRootIconPath.lastIndex = 0;
  return quotedRootIconPath.test(contents) || unquotedCssRootIconPath.test(contents);
}

async function textFiles(root, relative = "") {
  const directory = path.join(root, relative);
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await textFiles(root, child));
    } else if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
}

export async function normalizeDemoIconPaths(root) {
  const changed = [];

  for (const relative of await textFiles(root)) {
    const absolute = path.join(root, relative);
    const before = await readFile(absolute, "utf8");
    const after = rewriteRootRelativeIconPaths(before);
    if (after === before) continue;

    await writeFile(absolute, after);
    changed.push(relative);
  }

  return changed;
}

export async function findRootRelativeIconPaths(root) {
  const invalid = [];

  for (const relative of await textFiles(root)) {
    const contents = await readFile(path.join(root, relative), "utf8");
    if (containsRootRelativeIconPath(contents)) invalid.push(relative);
  }

  return invalid;
}
