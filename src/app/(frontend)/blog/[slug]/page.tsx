import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts, getNextPost, formatDate, readingTime, toMedia } from "@/lib/cms";
import { SectionNumber } from "@/components/ui/SectionHeader";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ArrowLink, ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
  };
};

/**
 * Article layout. Narrow measure, generous leading, no WebGL — the motion budget
 * here is a fade, the same as /about.
 */
export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const next = await getNextPost(slug);
  const cover = toMedia(post.cover, post.title);

  return (
    <article className="shell pt-10 md:pt-16">
      <Reveal>
        <SectionNumber index={post.category ?? "Notes"} label={formatDate(post.publishedAt)} />
      </Reveal>
      <RuleReveal className="mt-4" />

      <div className="grid-12 mt-12 md:mt-20">
        <header className="col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-3">
          <Reveal>
            <h1 className="text-display max-w-[18ch] font-medium">{post.title}</h1>
          </Reveal>

          <Reveal className="mt-6" delay={0.05}>
            <p className="text-lead max-w-[54ch] text-muted">{post.description}</p>
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap gap-x-8 gap-y-2" delay={0.1}>
            <span className="meta text-muted">{readingTime(post.layout)} min read</span>
            {(post.tags ?? []).length > 0 ? (
              <span className="meta text-muted">{(post.tags ?? []).join(" · ")}</span>
            ) : null}
          </Reveal>
        </header>
      </div>

      {cover ? (
        <Reveal className="mt-14 md:mt-20">
          <MediaFrame media={cover} ratio="16 / 9" sizes="100vw" priority />
        </Reveal>
      ) : null}

      <div className="mt-[clamp(3.5rem,10vh,7rem)]">
        <BlockRenderer blocks={post.layout} />
      </div>

      <nav className="mt-[clamp(5rem,14vh,11rem)] border-t border-rule pt-8" aria-label="Article">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <ArrowLink href="/blog" arrow="←" className="text-small">
            All writing
          </ArrowLink>

          {next ? (
            <ArrowLinkLarge href={`/blog/${next.slug}`} cursorState="view">
              Next — {next.title}
            </ArrowLinkLarge>
          ) : null}
        </div>
      </nav>
    </article>
  );
}
