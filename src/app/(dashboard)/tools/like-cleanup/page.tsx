import { buildLikeCleanupReport } from "@/lib/cleanupTools";

export default async function LikeCleanupPage() {
  const report = await buildLikeCleanupReport();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <section className="soft-card bg-gradient-to-r from-[#ffe8dc] to-[#fff4ea] p-8">
        <h1 className="text-3xl font-bold text-zinc-900">Like Cleanup</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Review likes in cards and clean them in small safe sessions. Oldest likes are shown in
          suggested queue first.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Likes" value={report.total} />
        <StatCard label="Suggested Queue" value={report.suggested.length} highlight />
        <StatCard label="Liked Posts" value={report.bySource["Liked Post"].length} />
        <StatCard label="Liked Comments" value={report.bySource["Liked Comment"].length} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <details className="soft-card p-5" open>
            <summary className="mb-4 cursor-pointer text-lg font-semibold text-zinc-900">
              Suggested Unlike Queue (Oldest First)
            </summary>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {report.suggested.map((item, idx) => (
                <LikeCard key={`${item.owner}-${item.timestamp}-${idx}`} item={item} />
              ))}
            </div>
          </details>

          <details className="soft-card p-5">
            <summary className="mb-4 cursor-pointer text-lg font-semibold text-zinc-900">
              Liked Posts
            </summary>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {report.bySource["Liked Post"].slice(0, 80).map((item, idx) => (
                <LikeCard key={`post-${item.owner}-${item.timestamp}-${idx}`} item={item} />
              ))}
            </div>
          </details>

          <details className="soft-card p-5">
            <summary className="mb-4 cursor-pointer text-lg font-semibold text-zinc-900">
              Liked Comments
            </summary>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {report.bySource["Liked Comment"].slice(0, 80).map((item, idx) => (
                <LikeCard key={`comment-${item.owner}-${item.timestamp}-${idx}`} item={item} />
              ))}
            </div>
          </details>
        </div>

        <aside className="soft-card h-fit p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Most Liked Owners</h2>
          <p className="mt-1 text-xs text-zinc-500">Accounts you like most frequently.</p>
          <div className="mt-4 space-y-2">
            {report.topOwners.map((owner) => (
              <div
                key={owner.owner}
                className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-zinc-50 px-3 py-2"
              >
                <span className="truncate text-sm text-zinc-700">@{owner.owner}</span>
                <span className="text-xs text-zinc-500">{owner.count}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function LikeCard({
  item,
}: {
  item: { owner: string; targetUrl: string; timestamp?: number; source: string };
}) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <p className="truncate text-sm font-semibold text-zinc-800">@{item.owner || "unknown"}</p>
      <p className="mt-1 truncate text-xs text-zinc-500">{item.targetUrl}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MetaChip label="Type" value={item.source} />
        <MetaChip label="Date" value={formatDate(item.timestamp)} />
      </div>

      <a
        href={item.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="accent-btn mt-4 inline-flex w-full items-center justify-center px-3 py-2 text-xs font-medium"
      >
        Open in Instagram (Unlike There)
      </a>
    </article>
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

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <article className={`soft-card p-5 ${highlight ? "bg-gradient-to-r from-[#ffe5d4] to-[#ffd7bb]" : ""}`}>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value.toLocaleString()}</p>
    </article>
  );
}

function formatDate(timestamp?: number): string {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp * 1000).toLocaleDateString();
}
