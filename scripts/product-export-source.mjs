import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const sourceRoot = path.resolve(process.env.AZDOCS_SOURCE ?? "../azdocs");
export const exportRoot = path.resolve("public/product-exports");
export const reportName = "azure-estate-report.html";
export const pdfName = "azure-estate-report.pdf";
// Theme names come from azdocs' report ThemePack (src/report/theme). The HTML
// preview keeps Field Report; the downloadable PDF uses the Azure theme.
export const reportTheme = "field-report";
export const pdfTheme = "azure";
export const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

// Include renderer dependencies, embedded assets and the fixture, not timestamps.
export async function sourceDigest() {
  const hash = createHash("sha256");
  async function visit(relative) {
    const absolute = path.join(sourceRoot, relative);
    if ((await stat(absolute)).isDirectory()) {
      for (const name of (await readdir(absolute)).sort()) await visit(`${relative}/${name}`);
    } else {
      hash.update(relative).update("\0").update(await readFile(absolute)).update("\0");
    }
  }
  for (const input of ["Cargo.toml", "Cargo.lock", "src", "templates", "data", "queries", "tests/common", "tests/report_preview.rs"]) {
    await visit(input);
  }
  return hash.digest("hex");
}
