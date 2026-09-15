import { access, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const generatedRoot = path.join(projectRoot, ".azdocs-source");
const markdownRoot = path.join(generatedRoot, "docs");
const publicDocsRoot = path.join(projectRoot, "public", "docs");
const publicFontsRoot = path.join(projectRoot, "public", "fonts");
const publicIconsRoot = path.join(projectRoot, "public", "azure-icons");
const localRoot = path.resolve(
  projectRoot,
  process.env.AZDOCS_SOURCE ?? "../azdocs"
);
const repository = "russmckendrick/azdocs";
const ref = process.env.AZDOCS_REF ?? "main";

const sharedAssets = new Map([
  ["data/fonts/IBMPlexSans-Regular.ttf", "fonts/IBMPlexSans-Regular.ttf"],
  ["data/fonts/IBMPlexSans-SemiBold.ttf", "fonts/IBMPlexSans-SemiBold.ttf"],
  ["data/fonts/IBMPlexSans-Bold.ttf", "fonts/IBMPlexSans-Bold.ttf"],
  ["data/fonts/IBMPlexMono-Regular.ttf", "fonts/IBMPlexMono-Regular.ttf"],
  ["data/fonts/IBMPlexMono-Bold.ttf", "fonts/IBMPlexMono-Bold.ttf"],
  ["data/icons/general/10001-icon-service-All-Resources.svg", "azure-icons/all-resources.svg"],
  ["data/icons/general/10002-icon-service-Subscriptions.svg", "azure-icons/subscription.svg"],
  ["data/icons/general/10007-icon-service-Resource-Groups.svg", "azure-icons/resource-group.svg"],
  ["data/icons/networking/10061-icon-service-Virtual-Networks.svg", "azure-icons/virtual-network.svg"],
  ["data/icons/compute/10021-icon-service-Virtual-Machine.svg", "azure-icons/virtual-machine.svg"],
  ["data/icons/storage/10086-icon-service-Storage-Accounts.svg", "azure-icons/storage-account.svg"],
  ["data/icons/databases/10130-icon-service-SQL-Database.svg", "azure-icons/sql-database.svg"],
  ["data/icons/app services/10035-icon-service-App-Services.svg", "azure-icons/app-service.svg"],
  ["data/icons/management + governance/00011-icon-service-Compliance.svg", "azure-icons/compliance.svg"],
  ["data/icons/general/10797-icon-service-Download.svg", "azure-icons/download.svg"],
  ["data/icons/networking/10067-icon-service-Network-Security-Groups.svg", "azure-icons/network-security-group.svg"],
  ["data/icons/networking/10080-icon-service-Network-Interfaces.svg", "azure-icons/network-interface.svg"],
  ["data/icons/other/02579-icon-service-Private-Endpoints.svg", "azure-icons/private-endpoint.svg"],
  ["data/icons/databases/10132-icon-service-SQL-Server.svg", "azure-icons/sql-server.svg"]
]);

async function exists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(root, relative = "") {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(root, child)));
    } else if (entry.isFile()) {
      files.push(child);
    }
  }

  return files;
}

function isHiddenPath(relative) {
  return relative.split(/[\\/]/).some((segment) => segment.startsWith("."));
}

function shouldImportDocsFile(relative) {
  if (isHiddenPath(relative)) return false;
  if (relative.endsWith(".md")) return true;
  return !relative.split(/[\\/]/).includes("tools");
}

async function writeAsset(relative, contents) {
  const destination = path.join(projectRoot, "public", relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, contents);
}

async function syncLocal() {
  const docsRoot = path.join(localRoot, "docs");
  const docsFiles = await listFiles(docsRoot);
  let markdownCount = 0;
  let staticCount = 0;

  for (const relative of docsFiles) {
    if (!shouldImportDocsFile(relative)) continue;

    const source = path.join(docsRoot, relative);
    if (relative.endsWith(".md")) {
      const destination = path.join(markdownRoot, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination);
      markdownCount += 1;
    } else {
      const destination = path.join(publicDocsRoot, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination);
      staticCount += 1;
    }
  }

  for (const [sourceRelative, outputRelative] of sharedAssets) {
    const source = path.join(localRoot, sourceRelative);
    if (!(await exists(source))) {
      throw new Error(`Required azdocs asset is missing: ${sourceRelative}`);
    }
    await writeAsset(outputRelative, await readFile(source));
  }

  return { source: localRoot, markdownCount, staticCount };
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "azdocs-cloud-build" }
  });
  if (!response.ok) {
    throw new Error(`Could not import ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function syncRemote() {
  const treeUrl = `https://api.github.com/repos/${repository}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
  const response = await fetch(treeUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "azdocs-cloud-build"
    }
  });
  if (!response.ok) {
    throw new Error(`Could not read azdocs source tree: ${response.status} ${response.statusText}`);
  }

  const tree = await response.json();
  if (tree.truncated) {
    throw new Error("The GitHub source tree was truncated; refusing a partial documentation import.");
  }

  const paths = new Set(
    tree.tree
      .filter((entry) => entry.type === "blob")
      .map((entry) => entry.path)
  );
  const docsPaths = [...paths].filter((entry) => {
    if (!entry.startsWith("docs/")) return false;
    return shouldImportDocsFile(entry.slice("docs/".length));
  });
  const requested = [
    ...docsPaths,
    ...[...sharedAssets.keys()].filter((entry) => !paths.has(entry) ? false : true)
  ];

  for (const asset of sharedAssets.keys()) {
    if (!paths.has(asset)) {
      throw new Error(`Required azdocs asset is missing at ${ref}: ${asset}`);
    }
  }

  const imported = await Promise.all(
    requested.map(async (sourcePath) => {
      const rawUrl = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(ref)}/${sourcePath
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
      return [sourcePath, await fetchBuffer(rawUrl)];
    })
  );

  let markdownCount = 0;
  let staticCount = 0;
  for (const [sourcePath, contents] of imported) {
    if (sourcePath.startsWith("docs/")) {
      const relative = sourcePath.slice("docs/".length);
      if (relative.endsWith(".md")) {
        const destination = path.join(markdownRoot, relative);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, contents);
        markdownCount += 1;
      } else {
        const destination = path.join(publicDocsRoot, relative);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, contents);
        staticCount += 1;
      }
      continue;
    }

    const output = sharedAssets.get(sourcePath);
    if (output) await writeAsset(output, contents);
  }

  return {
    source: `https://github.com/${repository}/tree/${ref}`,
    markdownCount,
    staticCount
  };
}

await rm(markdownRoot, { recursive: true, force: true });
await rm(publicDocsRoot, { recursive: true, force: true });
await rm(publicFontsRoot, { recursive: true, force: true });
await rm(publicIconsRoot, { recursive: true, force: true });
await mkdir(markdownRoot, { recursive: true });
await mkdir(publicDocsRoot, { recursive: true });

const localDocs = path.join(localRoot, "docs", "README.md");
const result = (await exists(localDocs)) ? await syncLocal() : await syncRemote();

console.log(
  `Imported ${result.markdownCount} documentation pages and ${result.staticCount} supporting assets from ${result.source}`
);
