import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, formatDate, readingTime } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on interfaces, motion and the things I keep rebuilding.",
};

/**
 * The blog is fully wired even while it is hidden from the navigation. Routes,
 * schema, editor, drafts and preview all exist; the Blog toggle in Site Settings
 * only controls whether it is advertised. Nothing here changes when it goes on.
 */
export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="shell pt-10 md:pt-16">
      <SectionHeader
        index="04"
        label="Writing"
        lead={["Notes on interfaces,", "motion, and the things", "I keep rebuilding."]}
        aside={
          <span className="meta text-muted">
            {posts.length} {posts.length === 1 ? "entry" : "entries"}
          </span>
        }
      />

      {posts.length === 0 ? (
        <Reveal className="mt-20">
          <p className="text-headline text-muted">Nothing published yet.</p>
        </Reveal>
      ) : (
        <Reveal className="mt-16 md:mt-24" stagger="block">
          <ul className="border-t border-rule">
            {posts.map((post) => (
              <li key={post.id} data-reveal-item>
                <Link
                  href={`/blog/${post.slug}`}
                  data-cursor-state="view"
                  className="group block border-b border-rule py-8"
                >
                  <div className="grid-12 items-baseline gap-y-3">
                    <p className="meta col-span-4 text-muted md:col-span-6 lg:col-span-2">
                      {post.category ?? "Notes"}
                    </p>

                    <div className="col-span-4 md:col-span-6 lg:col-span-7">
                      <h2 className="text-title font-medium transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-2">
                        {post.title}
                        {post._status === "draft" ? (
                          <span className="meta ml-3 text-accent">Draft</span>
                        ) : null}
                      </h2>
                      <p className="mt-2 max-w-[54ch] text-small text-muted">{post.description}</p>
                    </div>

                    <div className="col-span-4 flex flex-col gap-1 md:col-span-6 lg:col-span-3 lg:items-end">
                      <span className="meta text-muted">{formatDate(post.publishedAt)}</span>
                      <span className="meta text-muted">{readingTime(post.layout)} min read</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  );
}
