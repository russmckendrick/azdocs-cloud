import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { digest, exportRoot, pdfName, pdfTheme, reportName, reportTheme, sourceDigest, sourceRoot } from "./product-export-source.mjs";

const run = promisify(execFile);
let stale = false;
let reason = "";

try {
  const manifest = JSON.parse(await readFile(path.join(exportRoot, "manifest.json"), "utf8"));
  const html = await readFile(path.join(exportRoot, reportName));
  const pdf = await readFile(path.join(exportRoot, pdfName));
  if (digest(html) !== manifest.outputSha256 || digest(pdf) !== manifest.pdfOutputSha256) {
    stale = true;
    reason = "artifact checksum changed";
  } else if (manifest.theme !== reportTheme || manifest.pdfTheme !== pdfTheme) {
    stale = true;
    reason = "export theme changed";
  } else {
    try {
      if (await sourceDigest() !== manifest.sourceSha256) {
        stale = true;
        reason = "renderer or fixture changed";
      }
    } catch {
      console.log(`Using checked product export from azdocs ${manifest.sourceRevision.slice(0, 12)}; no local source checkout is available.`);
    }
  }
} catch {
  stale = true;
  reason = "artifact is missing";
}

if (stale) {
  try {
    await readFile(path.join(sourceRoot, "Cargo.toml"));
  } catch {
    throw new Error(`Product export ${reason}, but no local azdocs checkout is available to regenerate it.`);
  }
  console.log(`Refreshing product export because its ${reason}…`);
  const result = await run(process.execPath, ["scripts/refresh-product-exports.mjs"], {
    cwd: process.cwd(),
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
}
