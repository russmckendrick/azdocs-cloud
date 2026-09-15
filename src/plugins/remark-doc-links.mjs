import path from "node:path";

const sourceMarker = "/.azdocs-source/docs/";
const githubRoot = "https://github.com/russmckendrick/azdocs/blob/main/";

function walk(node, visitor) {
  visitor(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) walk(child, visitor);
}

function sourceRelative(file) {
  const normalized = String(file.path ?? file.history?.[0] ?? "").replaceAll("\\", "/");
  const markerIndex = normalized.indexOf(sourceMarker);
  return markerIndex === -1 ? "README.md" : normalized.slice(markerIndex + sourceMarker.length);
}

function docsRoute(target) {
  const withoutExtension = target.replace(/\.md$/i, "");
  if (withoutExtension === "README") return "/docs/";
  if (withoutExtension.endsWith("/README")) {
    return `/docs/${withoutExtension.slice(0, -"README".length)}`;
  }
  return `/docs/${withoutExtension}/`;
}

function rewriteLink(url, currentSource) {
  if (!url || /^(?:[a-z]+:|\/|#)/i.test(url)) return url;
  const [pathname, hash = ""] = url.split("#", 2);
  if (!pathname) return url;

  const target = path.posix.normalize(
    path.posix.join(path.posix.dirname(currentSource), decodeURIComponent(pathname))
  );
  const suffix = hash ? `#${hash}` : "";

  if (target.startsWith("../")) {
    return `${githubRoot}${target.replace(/^\.\.\//, "")}${suffix}`;
  }
  if (/\.md$/i.test(target)) return `${docsRoute(target)}${suffix}`;
  return `/docs/${target}${suffix}`;
}

export default function remarkDocsLinks() {
  return (tree, file) => {
    const currentSource = sourceRelative(file);
    walk(tree, (node) => {
      if (node.type === "link" || node.type === "image") {
        node.url = rewriteLink(node.url, currentSource);
      }

      if (node.type === "code" && node.lang === "mermaid") {
        const escaped = node.value
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
        node.type = "html";
        node.value = `<pre class="mermaid">${escaped}</pre>`;
        delete node.lang;
        delete node.meta;
      }
    });
  };
}

