import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import {
  getJsonFilesForSection,
  getParentFolders,
  getSubfolders,
  readJsonByRelativePath,
} from "@/lib/instagramExport";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ parent: string }>;
  searchParams?: Promise<{ sub?: string; file?: string; view?: string }>;
};

function labelize(input: string): string {
  return input.replaceAll("_", " ").replace(/\b\w/g, (s) => s.toUpperCase());
}

export default async function ParentFolderPage({ params, searchParams }: Props) {
  const { parent } = await params;
  const query = (await searchParams) || {};
  const allowedParents = await getParentFolders();

  if (!allowedParents.includes(parent)) {
    notFound();
  }

  const subfolders = await getSubfolders(parent);
  const activeSubfolder =
    query.sub && subfolders.includes(query.sub) ? query.sub : subfolders[0];

  const files = await getJsonFilesForSection(parent, activeSubfolder);
  const activeFile =
    query.file && files.some((item) => item.relativePath === query.file)
      ? query.file
      : files[0]?.relativePath;

  let payload: unknown = null;
  let payloadError = "";
  const viewMode = query.view === "raw" ? "raw" : "ui";
  if (activeFile) {
    try {
      payload = await readJsonByRelativePath(activeFile);
    } catch {
      payloadError = "Could not read this JSON file.";
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <section className="soft-card bg-gradient-to-r from-[#ffe9de] to-[#fff5ec] p-5">
        <h1 className="text-2xl font-semibold text-zinc-900">{labelize(parent)}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Switch subfolders using tabs, then choose any JSON file to inspect full raw data.
        </p>
      </section>

      <section className="mt-4">
        <div className="flex flex-wrap gap-2">
          {subfolders.map((subfolder) => (
            <Link
              key={subfolder}
              href={{
                pathname: `/data/${parent}`,
                query: { sub: subfolder },
              }}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                subfolder === activeSubfolder
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-[var(--line)] bg-white text-zinc-700 hover:border-orange-300"
              }`}
            >
              {subfolder === "__root__" ? "Root" : labelize(subfolder)}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="soft-card">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">JSON Files</h2>
            <p className="mt-1 text-xs text-zinc-500">{files.length} files detected</p>
          </div>
          <div className="max-h-[70vh] overflow-auto p-2">
            {files.length === 0 && (
              <p className="px-2 py-3 text-sm text-zinc-500">No JSON files in this subfolder.</p>
            )}
            {files.map((file) => (
              <Link
                key={file.relativePath}
                href={{
                  pathname: `/data/${parent}`,
                  query: { sub: activeSubfolder, file: file.relativePath },
                }}
                className={`mb-1 block rounded-md px-3 py-2 text-xs transition ${
                  file.relativePath === activeFile
                    ? "bg-orange-50 text-orange-700"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <p className="truncate font-medium">{file.fileName}</p>
                <p className="mt-1 truncate text-[11px] text-zinc-500">{file.relativePath}</p>
              </Link>
            ))}
          </div>
        </aside>

        <article className="soft-card">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">JSON Viewer</h2>
            {activeFile ? (
              <p className="mt-1 truncate text-xs text-zinc-500">{activeFile}</p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">Select a file to view details.</p>
            )}
            {activeFile && (
              <div className="mt-3 flex gap-2">
                <Link
                  href={{
                    pathname: `/data/${parent}`,
                    query: { sub: activeSubfolder, file: activeFile, view: "ui" },
                  }}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    viewMode === "ui"
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-[var(--line)] text-zinc-600"
                  }`}
                >
                  Structured UI
                </Link>
                <Link
                  href={{
                    pathname: `/data/${parent}`,
                    query: { sub: activeSubfolder, file: activeFile, view: "raw" },
                  }}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    viewMode === "raw"
                      ? "border-orange-300 bg-orange-50 text-orange-700"
                      : "border-[var(--line)] text-zinc-600"
                  }`}
                >
                  Raw JSON
                </Link>
              </div>
            )}
          </div>
          <div className="max-h-[70vh] overflow-auto p-4">
            {payloadError && <p className="text-sm text-red-300">{payloadError}</p>}
            {!activeFile && <p className="text-sm text-zinc-500">No file selected.</p>}
            {payload !== null && (
              <>
                {viewMode === "raw" ? (
                  <pre className="whitespace-pre-wrap break-words text-xs leading-5 text-zinc-800">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                ) : (
                  <StructuredJsonView data={payload} filePath={activeFile || ""} />
                )}
              </>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

type ProfileCard = {
  username: string;
  href: string;
  timestamp?: number;
};

function StructuredJsonView({ data, filePath }: { data: unknown; filePath: string }) {
  const profiles = extractProfiles(data);
  if (
    profiles.length > 0 &&
    (filePath.includes("followers") ||
      filePath.includes("following") ||
      filePath.includes("close_friends") ||
      filePath.includes("blocked"))
  ) {
    return <InstagramProfileCards profiles={profiles} />;
  }

  if (Array.isArray(data)) {
    return <ArrayView data={data} />;
  }
  if (isObject(data)) {
    return <ObjectView data={data} />;
  }
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm text-zinc-700">
      {String(data)}
    </div>
  );
}

function InstagramProfileCards({ profiles }: { profiles: ProfileCard[] }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="View" value="Instagram Cards" />
        <Stat label="Profiles" value={String(profiles.length)} />
        <Stat label="Action" value="Open Profile" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => (
          <a
            key={`${profile.username}-${profile.href}`}
            href={profile.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-[var(--line)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,138,61,0.18)]"
          >
            <div className="flex items-center gap-3">
              <AvatarPlaceholder username={profile.username} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  @{profile.username}
                </p>
                <p className="truncate text-xs text-zinc-500">{profile.href}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MetaChip label="ID" value={profile.username} />
              <MetaChip label="Followed" value={formatTimestamp(profile.timestamp)} />
            </div>

            <div className="accent-btn mt-4 inline-flex items-center px-3 py-1 text-xs font-medium">
              View Profile
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function AvatarPlaceholder({ username }: { username: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-200 bg-gradient-to-br from-orange-100 to-amber-100 text-sm font-semibold text-orange-700">
      {initials}
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-zinc-50 px-2 py-1">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="truncate text-xs text-zinc-700">{value}</p>
    </div>
  );
}

function ObjectView({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Type" value="Object" />
        <Stat label="Keys" value={String(entries.length)} />
        <Stat label="Nested" value={String(entries.filter(([, v]) => isObject(v) || Array.isArray(v)).length)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {entries.map(([key, value]) => (
          <section key={key} className="rounded-xl border border-[var(--line)] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">{key}</p>
            <div className="mt-2 text-sm text-zinc-700">{renderValue(value)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ArrayView({ data }: { data: unknown[] }) {
  const preview = data.slice(0, 50);
  const objectRows = preview.filter((item) => isObject(item)) as Record<string, unknown>[];
  const columns = getColumns(objectRows);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Type" value="Array" />
        <Stat label="Total Items" value={String(data.length)} />
        <Stat label="Preview Rows" value={String(preview.length)} />
      </div>

      {columns.length > 0 ? (
        <div className="overflow-auto rounded-xl border border-[var(--line)] bg-white">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {objectRows.map((row, idx) => (
                <tr key={idx} className="border-t border-[var(--line)]">
                  {columns.map((col) => (
                    <td key={col} className="max-w-[320px] truncate px-3 py-2 text-zinc-700">
                      {stringifyCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2">
          {preview.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-zinc-700">
              {renderValue(item)}
            </div>
          ))}
        </div>
      )}

      {data.length > preview.length && (
        <p className="text-xs text-zinc-500">Showing first {preview.length} items for performance.</p>
      )}
    </div>
  );
}

function renderValue(value: unknown): ReactNode {
  if (isPrimitive(value)) {
    return <span>{stringifyCell(value)}</span>;
  }

  if (Array.isArray(value)) {
    return (
      <details className="rounded-md border border-[var(--line)] bg-zinc-50 p-2">
        <summary className="cursor-pointer text-xs text-orange-600">
          Array ({value.length} items)
        </summary>
        <div className="mt-2">
          <ArrayView data={value} />
        </div>
      </details>
    );
  }

  if (isObject(value)) {
    return (
      <details className="rounded-md border border-[var(--line)] bg-zinc-50 p-2">
        <summary className="cursor-pointer text-xs text-orange-600">
          Object ({Object.keys(value).length} keys)
        </summary>
        <div className="mt-2">
          <ObjectView data={value} />
        </div>
      </details>
    );
  }

  return <span className="text-zinc-500">Unsupported value</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function isObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isPrimitive(input: unknown): input is string | number | boolean | null {
  return (
    input === null ||
    typeof input === "string" ||
    typeof input === "number" ||
    typeof input === "boolean"
  );
}

function stringifyCell(input: unknown): string {
  if (input === null || input === undefined) {
    return "-";
  }
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }
  return JSON.stringify(input);
}

function getColumns(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => seen.add(key));
  });
  return [...seen].slice(0, 14);
}

function extractProfiles(data: unknown): ProfileCard[] {
  const profiles: ProfileCard[] = [];

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (!isObject(item)) {
        return;
      }

      const title = typeof item.title === "string" ? item.title : "";
      const stringList = Array.isArray(item.string_list_data) ? item.string_list_data : [];

      stringList.forEach((entry) => {
        if (!isObject(entry)) {
          return;
        }
        const href = typeof entry.href === "string" ? entry.href : "";
        const value = typeof entry.value === "string" ? entry.value : "";
        const username = normalizeUsername(value || title || fromHref(href));
        if (!username || !href) {
          return;
        }
        profiles.push({
          username,
          href: toProfileUrl(username, href),
          timestamp: typeof entry.timestamp === "number" ? entry.timestamp : undefined,
        });
      });
    });
  } else if (isObject(data) && Array.isArray(data.relationships_following)) {
    data.relationships_following.forEach((item) => {
      if (!isObject(item)) {
        return;
      }
      const title = typeof item.title === "string" ? item.title : "";
      const stringList = Array.isArray(item.string_list_data) ? item.string_list_data : [];
      const first = stringList[0];
      const href = isObject(first) && typeof first.href === "string" ? first.href : "";
      const timestamp =
        isObject(first) && typeof first.timestamp === "number" ? first.timestamp : undefined;
      const username = normalizeUsername(title || fromHref(href));
      if (!username) {
        return;
      }
      profiles.push({
        username,
        href: toProfileUrl(username, href),
        timestamp,
      });
    });
  }

  const seen = new Set<string>();
  return profiles.filter((p) => {
    if (seen.has(p.username)) {
      return false;
    }
    seen.add(p.username);
    return true;
  });
}

function normalizeUsername(value: string): string {
  return value
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^_u\//, "")
    .replace(/\/$/, "")
    .replace(/\?.*$/, "")
    .trim()
    .toLowerCase();
}

function fromHref(href: string): string {
  return normalizeUsername(href.split("/").filter(Boolean).pop() || "");
}

function toProfileUrl(username: string, href: string): string {
  if (href.startsWith("http")) {
    return `https://www.instagram.com/${username}/`;
  }
  return `https://www.instagram.com/${username}/`;
}

function formatTimestamp(timestamp?: number): string {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp * 1000).toLocaleDateString();
}
