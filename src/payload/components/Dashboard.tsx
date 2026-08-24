import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Admin dashboard.
 *
 * Counts and recent edits — no analytics, no charts, no widgets. This is the
 * back of a personal website, and the only questions worth answering here are
 * "how much is there" and "what did I touch last".
 */
const COUNTS: { label: string; slug: "projects" | "life" | "gallery" | "built-tools" | "posts" }[] = [
  { label: "Work projects", slug: "projects" },
  { label: "Life stories", slug: "life" },
  { label: "Gallery photos", slug: "gallery" },
  { label: "Tools", slug: "built-tools" },
  { label: "Blog posts", slug: "posts" },
];

export async function Dashboard() {
  const payload = await getPayload({ config });

  const counts = await Promise.all(
    COUNTS.map(async (entry) => {
      const result = await payload.count({ collection: entry.slug, overrideAccess: true });
      return { ...entry, total: result.totalDocs };
    }),
  );

  const [recentProjects, recentLife, recentPosts] = await Promise.all([
    payload.find({ collection: "projects", limit: 3, sort: "-updatedAt", depth: 0, overrideAccess: true }),
    payload.find({ collection: "life", limit: 3, sort: "-updatedAt", depth: 0, overrideAccess: true }),
    payload.find({ collection: "posts", limit: 3, sort: "-updatedAt", depth: 0, overrideAccess: true }),
  ]);

  const recent = [
    ...recentProjects.docs.map((d) => ({ id: d.id, title: d.title, slug: "projects", updatedAt: d.updatedAt, status: d._status })),
    ...recentLife.docs.map((d) => ({ id: d.id, title: d.title, slug: "life", updatedAt: d.updatedAt, status: d._status })),
    ...recentPosts.docs.map((d) => ({ id: d.id, title: d.title, slug: "posts", updatedAt: d.updatedAt, status: d._status })),
  ]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 6);

  const drafts = recent.filter((entry) => entry.status === "draft").length;

  return (
    <div className="gutter--left gutter--right" style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>Welcome back</h2>
      <p style={{ opacity: 0.6, marginTop: 0 }}>
        Content lives here. Design, animation and components live in the code.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1px",
          background: "var(--theme-elevation-100)",
          border: "1px solid var(--theme-elevation-100)",
          marginTop: "1.75rem",
        }}
      >
        {counts.map((entry) => (
          <Link
            key={entry.slug}
            href={`/admin/collections/${entry.slug}`}
            style={{
              background: "var(--theme-elevation-0)",
              padding: "1.25rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontSize: "1.75rem", lineHeight: 1.1 }}>{entry.total}</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.4rem" }}>{entry.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", marginTop: "2rem" }}>
        <div style={{ minWidth: "240px" }}>
          <h4 style={{ marginBottom: "0.75rem" }}>Recently edited</h4>
          {recent.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Nothing yet. Run `npm run seed` to load the starter content.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recent.map((entry) => (
                <li key={`${entry.slug}-${entry.id}`} style={{ padding: "0.35rem 0" }}>
                  <Link href={`/admin/collections/${entry.slug}/${entry.id}`}>{entry.title}</Link>
                  {entry.status === "draft" ? (
                    <span style={{ opacity: 0.5, fontSize: "0.7rem", marginLeft: "0.5rem" }}>DRAFT</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 style={{ marginBottom: "0.75rem" }}>Drafts</h4>
          <div style={{ fontSize: "1.75rem" }}>{drafts}</div>
        </div>
      </div>
    </div>
  );
}
