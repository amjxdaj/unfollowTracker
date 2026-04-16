import Link from "next/link";
import { getParentFolders } from "@/lib/instagramExport";

function folderLabel(input: string): string {
  return input.replaceAll("_", " ").replace(/\b\w/g, (s) => s.toUpperCase());
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const parents = await getParentFolders();

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--background)]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-800">
              Instagram Export Explorer
            </Link>
            <nav className="pill-nav flex items-center gap-1 p-1 text-xs">
              <Link href="/dashboard" className="rounded-full px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100">
                Dashboard
              </Link>
              <Link
                href="/tools"
                className="rounded-full px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100"
              >
                Tools
              </Link>
            </nav>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2">
            {parents.map((folder) => (
              <Link
                key={folder}
                href={`/data/${folder}`}
                className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-zinc-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                {folderLabel(folder)}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </>
  );
}
