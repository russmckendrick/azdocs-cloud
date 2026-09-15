import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { digest, exportRoot, pdfName } from "./product-export-source.mjs";

const run = promisify(execFile);
const pagesRoot = path.join(exportRoot, "pages");
const pagesManifestPath = path.join(pagesRoot, "manifest.json");
const exportManifest = JSON.parse(await readFile(path.join(exportRoot, "manifest.json"), "utf8"));
let current = false;

try {
  const manifest = JSON.parse(await readFile(pagesManifestPath, "utf8"));
  current = manifest.pdfSha256 === exportManifest.pdfOutputSha256 && manifest.pages.length > 0;
  for (const page of manifest.pages) {
    const bytes = await readFile(path.join(pagesRoot, page.file));
    if (digest(bytes) !== page.sha256) current = false;
  }
} catch {
  current = false;
}

if (current) {
  console.log(`Verified ${exportManifest.pdfOutput} page gallery against the current PDF.`);
  process.exit(0);
}

await rm(pagesRoot, { recursive: true, force: true });
await mkdir(pagesRoot, { recursive: true });
console.log("Rendering PDF pages for the three-column report gallery…");

try {
  await run("pdftoppm", [
    "-jpeg",
    "-r", "96",
    "-jpegopt", "quality=84,optimize=y,progressive=y",
    path.join(exportRoot, pdfName),
    path.join(pagesRoot, "page"),
  ], { maxBuffer: 8 * 1024 * 1024 });
} catch (error) {
  if (error.code === "ENOENT") {
    throw new Error("pdftoppm is required to build the PDF page gallery. Install Poppler and run the build again.");
  }
  throw error;
}

const files = (await readdir(pagesRoot)).filter((name) => /^page-\d+\.jpg$/.test(name)).sort();
if (files.length === 0) throw new Error("The PDF renderer did not produce any page images.");
const pages = [];
for (const [index, file] of files.entries()) {
  pages.push({
    page: index + 1,
    file,
    sha256: digest(await readFile(path.join(pagesRoot, file))),
  });
}

await writeFile(pagesManifestPath, `${JSON.stringify({
  pdf: exportManifest.pdfOutput,
  pdfSha256: exportManifest.pdfOutputSha256,
  generatedAt: new Date().toISOString(),
  pages,
}, null, 2)}\n`);
console.log(`Rendered ${pages.length} PDF pages for the site gallery.`);
