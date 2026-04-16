import Link from "next/link";

const TOOLS = [
  {
    name: "Unfollow Tracker",
    desc: "Find users you follow who do not follow you back.",
    href: "/tools/unfollow-tracker",
    cta: "Open Tool",
  },
  {
    name: "Comment Cleanup",
    desc: "Review comments in a clean UI and shortlist delete candidates.",
    href: "/tools/comment-cleanup",
    cta: "Review Comments",
  },
  {
    name: "Like Cleanup",
    desc: "Inspect likes and prepare small manual unlike sets.",
    href: "/tools/like-cleanup",
    cta: "Review Likes",
  },
];

export default function ToolsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <section className="soft-card bg-gradient-to-r from-[#ffe8dc] to-[#fff4ea] p-8">
        <h1 className="text-3xl font-bold text-zinc-900">Tools</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Utility pages for action-focused workflows like unfollow tracking and cleanup tasks.
        </p>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <article key={tool.name} className="soft-card p-5">
            <h2 className="text-xl font-semibold text-zinc-900">{tool.name}</h2>
            <p className="mt-2 min-h-12 text-sm text-zinc-600">{tool.desc}</p>
            <Link
              href={tool.href}
              className="accent-btn mt-4 inline-flex w-full items-center justify-center px-4 py-2 text-sm"
            >
              {tool.cta}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
