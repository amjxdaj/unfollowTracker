import Link from "next/link";
import { getParentFolders } from "@/lib/instagramExport";

export const dynamic = 'force-dynamic';

function labelize(input: string): string {
  return input.replaceAll("_", " ").replace(/\b\w/g, (s) => s.toUpperCase());
}

export default async function Dashboard() {
  const parentFolders = await getParentFolders();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <section className="soft-card bg-gradient-to-r from-[#ffe7db] to-[#fff4e8] p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-500">Instagram Archive</p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-900">Full Export Explorer</h1>
        <p className="mt-3 max-w-3xl text-sm text-zinc-600">
          Open any parent folder page, switch subfolders with tabs, and inspect all JSON content in structured UI cards and table views.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parentFolders.map((folder) => (
          <Link
            key={folder}
            href={`/data/${folder}`}
            className="soft-card p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,138,61,0.15)]"
          >
            <p className="text-lg font-semibold text-zinc-900">{labelize(folder)}</p>
            <p className="mt-2 text-xs text-zinc-500">Open page and browse subfolder tabs</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
