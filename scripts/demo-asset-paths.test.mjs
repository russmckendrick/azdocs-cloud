import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  containsRootRelativeIconPath,
  findMissingDemoAssets,
  referencedDemoAssets,
  rewriteRootRelativeIconPaths,
} from "./demo-asset-paths.mjs";

test("rewrites generated root-relative icon URLs beneath the demo base", () => {
  const generated = [
    'const dashboard = "/icons/general/dashboard.svg";',
    "const estate = '/icons/general/estate.svg';",
    "const topology = `/icons/general/topology.svg`;",
    ".icon { background: url(/icons/general/background.svg); }",
  ].join("\n");

  const rewritten = rewriteRootRelativeIconPaths(generated);

  assert.equal(containsRootRelativeIconPath(rewritten), false);
  assert.match(rewritten, /"\/demo\/icons\/general\/dashboard\.svg"/);
  assert.match(rewritten, /'\/demo\/icons\/general\/estate\.svg'/);
  assert.match(rewritten, /`\/demo\/icons\/general\/topology\.svg`/);
  assert.match(rewritten, /url\(\/demo\/icons\/general\/background\.svg\)/);
});

test("leaves already based and unrelated asset URLs unchanged", () => {
  const generated = [
    'const dashboard = "/demo/icons/general/dashboard.svg";',
    'const font = "/demo/fonts/IBMPlexSans-Regular.ttf";',
  ].join("\n");

  assert.equal(rewriteRootRelativeIconPaths(generated), generated);
});

test("collects referenced demo assets, decoding encoded paths", () => {
  const generated = [
    'const a = `/demo/icons/app services/10035-icon-service-App-Services.svg`;',
    'const b = "/demo/icons/management%20+%20governance/00011-icon-service-Compliance.svg";',
    "@font-face { src: url(/demo/fonts/IBMPlexMono-Regular.ttf) format('truetype'); }",
    '<script src="/demo/assets/index-abc.js"></script>',
    'const base = "/demo/";',
  ].join("\n");

  assert.deepEqual([...referencedDemoAssets(generated)].sort(), [
    "assets/index-abc.js",
    "fonts/IBMPlexMono-Regular.ttf",
    "icons/app services/10035-icon-service-App-Services.svg",
    "icons/management + governance/00011-icon-service-Compliance.svg",
  ]);
});

test("reports demo assets that are referenced but not shipped", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "demo-assets-"));
  await mkdir(path.join(root, "icons/general"), { recursive: true });
  await writeFile(path.join(root, "icons/general/present.svg"), "<svg/>");
  await mkdir(path.join(root, "assets"));
  await writeFile(
    path.join(root, "assets/index.js"),
    'const a = "/demo/icons/general/present.svg", b = "/demo/icons/general/absent.svg";',
  );

  assert.deepEqual(await findMissingDemoAssets(root), [
    "icons/general/absent.svg (referenced in assets/index.js)",
  ]);
});
