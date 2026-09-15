import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { digest, exportRoot, pdfName, reportName, sourceDigest, sourceRoot } from "./product-export-source.mjs";

const run = promisify(execFile);
const inputHash = await sourceDigest();
const { stdout: revision } = await run("git", ["rev-parse", "HEAD"], { cwd: sourceRoot });
console.log("Compiling the current azdocs fixture export runner…");
const { stdout } = await run("cargo", [
  "test", "--locked", "--offline", "--test", "report_preview", "--no-run", "--message-format=json"
], { cwd: sourceRoot, maxBuffer: 32 * 1024 * 1024 });
const executable = stdout.split("\n").filter(Boolean).map((line) => JSON.parse(line))
  .find((message) => message.reason === "compiler-artifact" && message.target.name === "report_preview" && message.executable)?.executable;
if (!executable) throw new Error("Cargo did not produce the current fixture runner.");

await mkdir(".azdocs-source", { recursive: true });
const temporary = await mkdtemp(path.resolve(".azdocs-source/export-"));
try {
  console.log("Rendering the canonical fixture through the application’s report exporters…");
  const rendered = await run(executable, [
    "--ignored", "--exact", "writes_every_theme_in_every_format", "--nocapture"
  ], { cwd: temporary, maxBuffer: 8 * 1024 * 1024 });
  process.stdout.write(rendered.stdout);
  if (await sourceDigest() !== inputHash) throw new Error("azdocs changed during export; run the refresh again.");
  const html = await readFile(path.join(temporary, "output/preview/field-report/report.html"));
  const pdf = await readFile(path.join(temporary, "output/preview/field-report/report.pdf"));
  if (!html.includes("Operational and compliance evidence") || !html.includes("Query provenance")) {
    throw new Error("The rendered report is missing the current evidence sections.");
  }
  if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error("The rendered assessment is not a valid PDF artifact.");
  }
  await mkdir(exportRoot, { recursive: true });
  await writeFile(path.join(exportRoot, reportName), html);
  await writeFile(path.join(exportRoot, pdfName), pdf);
  await writeFile(path.join(exportRoot, "manifest.json"), JSON.stringify({
    sourceRepository: "russmckendrick/azdocs",
    sourceRevision: revision.trim(),
    sourceSha256: inputHash,
    generatedAt: new Date().toISOString(),
    fixture: "tests/common/mod.rs::seed_estate",
    runner: "tests/report_preview.rs::writes_every_theme_in_every_format",
    renderer: "src/report/html.rs",
    theme: "field-report",
    output: reportName,
    outputSha256: digest(html),
    pdfOutput: pdfName,
    pdfOutputSha256: digest(pdf)
  }, null, 2) + "\n");
  console.log(`Refreshed ${reportName} and ${pdfName} from ${revision.trim().slice(0, 12)}.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
