import { buildUnfollowReport, type GenderGuess } from "@/lib/unfollowTracker";

export const dynamic = 'force-dynamic';

const GROUP_ORDER: GenderGuess[] = [
  "Girls",
  "Boys",
  "Unknown",
];

export default async function UnfollowTrackerPage() {
  const report = await buildUnfollowReport();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <section className="soft-card bg-gradient-to-r from-[#ffe8dc] to-[#fff4ea] p-8">
        <h1 className="text-3xl font-bold text-zinc-900">Unfollow Tracker</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Calculated logic: <strong>following - followers</strong>. Grouping into Girls/Boys is
          heuristic from username patterns, so treat it as estimate.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Followers" value={report.followersCount} />
        <StatCard label="Following" value={report.followingCount} />
        <StatCard label="Not Following Back" value={report.unfollowCount} highlight />
      </section>

      <section className="mt-6 space-y-6">
        {GROUP_ORDER.map((group) => {
          const items = report.groupedByGender[group];
          if (!items.length) {
            return null;
          }

          return (
            <details key={group} className="soft-card p-5" open>
              <summary className="mb-4 flex cursor-pointer list-none items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">{group}</h2>
                <span className="rounded-full border border-[var(--line)] bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                  {items.length} profiles
                </span>
              </summary>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((profile) => (
                  <a
                    key={profile.username}
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-[var(--line)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,138,61,0.18)]"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarPlaceholder username={profile.username} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          @{profile.username}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{profile.profileUrl}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <MetaChip label="Type" value={profile.accountType} />
                      <MetaChip label="Gender" value={profile.genderGuess} />
                      <MetaChip label="Followed" value={formatDate(profile.followedAt)} />
                    </div>

                    <div className="accent-btn mt-4 inline-flex items-center px-3 py-1 text-xs font-medium">
                      Open Profile
                    </div>
                  </a>
                ))}
              </div>
            </details>
          );
        })}

        {report.unfollowCount === 0 && (
          <div className="soft-card p-6 text-sm text-zinc-600">
            No unfollow candidates found with current export files.
          </div>
        )}
      </section>
    </main>
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
    <article
      className={`soft-card p-5 ${highlight ? "bg-gradient-to-r from-[#ffe5d4] to-[#ffd7bb]" : ""}`}
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value.toLocaleString()}</p>
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

function AvatarPlaceholder({ username }: { username: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-gradient-to-br from-orange-100 to-amber-100 text-xs font-semibold text-orange-700">
      {initials}
    </div>
  );
}

function formatDate(timestamp?: number): string {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp * 1000).toLocaleDateString();
}
