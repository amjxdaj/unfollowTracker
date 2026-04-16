import { promises as fs } from "fs";
import path from "path";

const EXCLUDED_PARENT_FOLDERS = new Set(["media"]);

async function isDirectory(targetPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(targetPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function getExportRoot(): Promise<string> {
  const workspaceRoot = path.resolve(process.cwd(), "..");
  const candidates = await fs.readdir(workspaceRoot, { withFileTypes: true });
  const folder = candidates.find(
    (entry) => entry.isDirectory() && entry.name.startsWith("instagram-"),
  );

  if (!folder) {
    throw new Error("Instagram export folder not found beside app directory.");
  }

  return path.join(workspaceRoot, folder.name);
}

export async function getParentFolders(): Promise<string[]> {
  const exportRoot = await getExportRoot();
  const entries = await fs.readdir(exportRoot, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        entry.isDirectory() && !EXCLUDED_PARENT_FOLDERS.has(entry.name.toLowerCase()),
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export async function getSubfolders(parentFolder: string): Promise<string[]> {
  const exportRoot = await getExportRoot();
  const parentPath = path.join(exportRoot, parentFolder);
  const entries = await fs.readdir(parentPath, { withFileTypes: true });
  const subfolders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (subfolders.length === 0) {
    return ["__root__"];
  }

  return subfolders;
}

async function walkJsonFiles(baseDir: string): Promise<string[]> {
  const found: string[] = [];
  const entries = await fs.readdir(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkJsonFiles(fullPath);
      found.push(...nested);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      found.push(fullPath);
    }
  }

  return found;
}

export async function getJsonFilesForSection(
  parentFolder: string,
  subfolder: string,
): Promise<Array<{ relativePath: string; fileName: string }>> {
  const exportRoot = await getExportRoot();
  const rootPath =
    subfolder === "__root__"
      ? path.join(exportRoot, parentFolder)
      : path.join(exportRoot, parentFolder, subfolder);

  if (!(await isDirectory(rootPath))) {
    return [];
  }

  const files = await walkJsonFiles(rootPath);
  return files
    .map((absolutePath) => ({
      relativePath: path.relative(exportRoot, absolutePath).replaceAll("\\", "/"),
      fileName: path.basename(absolutePath),
    }))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export async function readJsonByRelativePath(relativePath: string): Promise<unknown> {
  const exportRoot = await getExportRoot();
  const normalized = path.normalize(relativePath);
  const targetPath = path.join(exportRoot, normalized);
  const resolvedRoot = path.resolve(exportRoot);
  const resolvedTarget = path.resolve(targetPath);

  if (!resolvedTarget.startsWith(resolvedRoot)) {
    throw new Error("Invalid path");
  }

  const raw = await fs.readFile(resolvedTarget, "utf-8");
  return JSON.parse(raw);
}
