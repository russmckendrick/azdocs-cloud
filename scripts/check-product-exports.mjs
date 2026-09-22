import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { digest, exportRoot, pdfName, pdfTheme, reportName, reportTheme, sourceDigest, sourceRoot } from "./product-export-source.mjs";

const manifest = JSON.parse(await readFile(path.join(exportRoot, "manifest.json"), "utf8"));
const html = await readFile(path.join(exportRoot, reportName));
if (digest(html) !== manifest.outputSha256) throw new Error("Product export differs from its generated artifact. Run pnpm refresh:exports.");
const pdf = await readFile(path.join(exportRoot, pdfName));
if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-")) || digest(pdf) !== manifest.pdfOutputSha256) {
  throw new Error("PDF export differs from its generated artifact. Run pnpm refresh:exports.");
}
if (manifest.theme !== reportTheme || manifest.pdfTheme !== pdfTheme) {
  throw new Error(`Exports were rendered with ${manifest.theme}/${manifest.pdfTheme ?? manifest.theme}, expected ${reportTheme}/${pdfTheme}. Run pnpm refresh:exports.`);
}
let localSource = true;
try { await access(path.join(sourceRoot, "Cargo.toml")); } catch { localSource = false; }
if (localSource && await sourceDigest() !== manifest.sourceSha256) {
  throw new Error("Product export is stale against the current azdocs renderer or fixture. Run pnpm refresh:exports.");
}
console.log(`Verified HTML and PDF exports from ${manifest.sourceRevision.slice(0, 12)}${localSource ? " against current azdocs source" : ""}.`);
