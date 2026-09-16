import assert from "node:assert/strict";
import test from "node:test";
import {
  containsRootRelativeIconPath,
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
