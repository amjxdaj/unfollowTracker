"use client";

import { type UnfollowProfile, type GenderGuess } from "@/lib/unfollowTrackerClient";

const GROUP_ORDER: GenderGuess[] = ["Girls", "Boys", "Unknown"];

export default function UnfollowResults({
  report,
}: {
  report: {
    followersCount: number;
    followingCount: number;
    unfollowCount: number;
    profiles: UnfollowProfile[];
    groupedByGender: Record<GenderGuess, UnfollowProfile[]>;
  };
}) {
  return (
    <div className="w-full space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Followers" value={report.followersCount} />
        <StatCard label="Following" value={report.followingCount} />
        <StatCard label="Not Back" value={report.unfollowCount} highlight />
      </div>

      {/* Results */}
      {report.unfollowCount === 0 ? (
        <div className="rounded-xl border border-[var(--line)] bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center">
          <p className="text-sm font-medium text-green-700">✓ Everyone you follow follows you back!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {GROUP_ORDER.map((group) => {
            const items = report.groupedByGender[group];
            if (!items.length) return null;

            return (
              <details key={group} className="group rounded-xl border border-[var(--line)] bg-white" open>
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-medium text-zinc-900">
                  <span>{group}</span>
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
                    {items.length}
                  </span>
                </summary>

                <div className="border-t border-[var(--line)] px-4 py-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {items.map((profile) => (
                      <ProfileCard key={profile.username} profile={profile} />
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
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
    <div
      className={`rounded-lg p-3 text-center ${
        highlight
          ? "bg-gradient-to-br from-orange-100 to-red-100"
          : "bg-zinc-100"
      }`}
    >
      <p className="text-xs text-zinc-600">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? "text-orange-600" : "text-zinc-900"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function ProfileCard({ profile }: { profile: UnfollowProfile }) {
  // Deep link to Instagram app - will work on mobile
  const instagramLink = `instagram://user?username=${profile.username}`;
  const fallbackLink = profile.profileUrl;

  return (
    <a
      href={instagramLink}
      onClick={(e) => {
        // Fallback to web if app not available
        setTimeout(() => {
          window.location.href = fallbackLink;
        }, 100);
      }}
      className="group flex items-start gap-2 rounded-lg border border-[var(--line)] bg-white p-3 transition hover:border-orange-300 hover:shadow-[0_4px_12px_rgba(255,138,61,0.1)]"
    >
      {/* Avatar Initial */}
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-200 to-orange-400 text-xs font-bold text-white">
        {profile.username.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">@{profile.username}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge label={profile.accountType} />
          {profile.followedAt && (
            <span className="text-xs text-zinc-500">
              {formatDate(profile.followedAt)}
            </span>
          )}
        </div>
      </div>

      {/* External icon */}
      <svg
        className="h-4 w-4 flex-shrink-0 text-zinc-400 transition group-hover:text-orange-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </a>
  );
}

function Badge({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    "Business/Brand": "bg-blue-100 text-blue-700",
    "Creator/Theme": "bg-purple-100 text-purple-700",
    Personal: "bg-zinc-100 text-zinc-700",
    Unknown: "bg-gray-100 text-gray-700",
  };

  const color = colorMap[label] || "bg-zinc-100 text-zinc-700";

  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
