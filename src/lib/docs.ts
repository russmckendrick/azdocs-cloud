import type { CollectionEntry } from "astro:content";

export type DocsEntry = CollectionEntry<"docs">;

const sectionOrder = ["usage", "development", "reference", "releases", "marks", "licenses"];

export function docTitle(entry: DocsEntry) {
  const match = entry.body?.match(/^#\s+(.+)$/m);
  return match?.[1]?.replace(/[`*_]/g, "") ?? entry.id.split("/").at(-1) ?? "Documentation";
}

export function docSlug(entry: DocsEntry) {
  if (entry.id === "README") return undefined;
  if (entry.id.endsWith("/README")) return entry.id.slice(0, -"/README".length);
  return entry.id;
}

export function docHref(entry: DocsEntry) {
  const slug = docSlug(entry);
  return slug ? `/docs/${slug}/` : "/docs/";
}

export function docSection(entry: DocsEntry) {
  if (entry.id === "README") return "overview";
  return entry.id.split("/")[0] ?? "overview";
}

export function orderedDocs(entries: DocsEntry[]) {
  return [...entries].sort((a, b) => {
    const sectionA = docSection(a);
    const sectionB = docSection(b);
    const rankA = sectionA === "overview" ? -1 : sectionOrder.indexOf(sectionA);
    const rankB = sectionB === "overview" ? -1 : sectionOrder.indexOf(sectionB);
    if (rankA !== rankB) return rankA - rankB;

    const aIndex = a.id.endsWith("README") ? -1 : 0;
    const bIndex = b.id.endsWith("README") ? -1 : 0;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return docTitle(a).localeCompare(docTitle(b));
  });
}

export function docsBySection(entries: DocsEntry[]) {
  const groups = new Map<string, DocsEntry[]>();
  for (const entry of orderedDocs(entries)) {
    const section = docSection(entry);
    const group = groups.get(section) ?? [];
    group.push(entry);
    groups.set(section, group);
  }
  return groups;
}
