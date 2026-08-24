import Link from "next/link";
import { toMedia } from "@/lib/cms";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SectionNumber } from "@/components/ui/SectionHeader";
import { Figure } from "@/components/ui/Meta";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { RichText } from "./RichText";
import { layoutClasses, motionOf, isVisible, ratioClasses } from "./presets";
import { cn, pad } from "@/lib/utils";

/**
 * Turns the admin's block list into the site's own components.
 *
 * Every case below renders components that already existed before the CMS did.
 * The renderer chooses *which* component and passes it a preset; it never
 * invents styling. A block type with no case here simply does not render —
 * which is the safety net that stops an unknown block from reaching a page.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Block = Record<string, any> & { blockType: string; id?: string | null };

const asLines = (rows?: { text?: string | null }[] | null) =>
  (rows ?? []).map((row) => row.text).filter((text): text is string => Boolean(text));

/** Wraps a block in its reveal, honouring the block's own motion preset. */
function Animated({
  motion,
  children,
  className,
  delay = 0,
}: {
  motion: ReturnType<typeof motionOf>;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  if (motion === "none") return <div className={className}>{children}</div>;
  return (
    <Reveal className={className} y={motion === "subtle" ? 10 : 20} delay={delay}>
      {children}
    </Reveal>
  );
}

function BlockBody({ block }: { block: Block }) {
  const motion = motionOf(block);

  switch (block.blockType) {
    /* ---------------------------------------------------------------- text */

    case "text":
      return (
        <Animated motion={motion}>
          <RichText data={block.body} />
        </Animated>
      );

    case "heading":
      return (
        <Animated motion={motion}>
          {block.level === "h3" ? (
            <h3 className="text-title font-medium">{block.text}</h3>
          ) : (
            <h2 className="text-headline font-medium">{block.text}</h2>
          )}
        </Animated>
      );

    case "statement": {
      const lines = asLines(block.lines);
      return (
        <Animated motion={motion}>
          <p className="text-display max-w-[20ch] font-medium">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Animated>
      );
    }

    case "sectionIntro": {
      const lead = asLines(block.lead);
      return (
        <Animated motion={motion}>
          <SectionNumber index={block.index} label={block.label} />
          <hr className="rule mt-4" />
          {lead.length > 0 ? (
            <h2 className="text-display mt-10 max-w-[22ch] font-medium md:mt-14">
              {lead.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          ) : null}
        </Animated>
      );
    }

    case "quote":
      return (
        <Animated motion={motion}>
          <blockquote className="border-l border-rule pl-6">
            <p className="text-headline max-w-[24ch] font-medium">{block.quote}</p>
            {block.attribution ? (
              <cite className="meta mt-4 block text-muted not-italic">{block.attribution}</cite>
            ) : null}
          </blockquote>
        </Animated>
      );

    case "stats":
      return (
        <Animated motion={motion}>
          <dl className="flex flex-wrap gap-x-12 gap-y-6 border-t border-rule pt-6">
            {(block.items ?? []).map((item: { label: string; value: string }) => (
              <Figure key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        </Animated>
      );

    case "locationMeta":
      return (
        <Animated motion={motion}>
          <div className="flex flex-wrap gap-x-12 gap-y-4 border-t border-rule pt-6">
            {block.place ? <Figure label="Place" value={block.place} /> : null}
            {block.date ? <Figure label="Date" value={block.date} /> : null}
            {block.coordinates ? <Figure label="Coordinates" value={block.coordinates} /> : null}
          </div>
        </Animated>
      );

    /* --------------------------------------------------------------- media */

    case "image":
    case "wideImage":
    case "fullBleedImage": {
      const media = toMedia(block.image, block.alt ?? "");
      if (!media) return null;
      const withAlt = block.alt ? { ...media, alt: block.alt } : media;

      const frame = (
        <MediaFrame
          media={withAlt}
          caption={block.caption ?? undefined}
          sizes={block.blockType === "image" ? "(max-width: 1024px) 100vw, 60vw" : "100vw"}
          className={block.fit === "contain" ? "[&_img]:object-contain" : undefined}
        />
      );

      return (
        <Animated motion={motion}>
          {block.parallax && motion !== "none" ? (
            <Parallax className="w-full" amount={motion === "subtle" ? 3 : 6}>
              {frame}
            </Parallax>
          ) : (
            frame
          )}
        </Animated>
      );
    }

    case "photoPair": {
      const left = toMedia(block.left);
      const right = toMedia(block.right);
      const [leftSpan, rightSpan] = ratioClasses[block.ratio as keyof typeof ratioClasses] ?? ratioClasses["50-50"];

      return (
        <div className="grid-12 gap-y-8">
          {left ? (
            <Animated motion={motion} className={cn("col-span-4 md:col-span-3", leftSpan)}>
              <MediaFrame media={left} sizes="(max-width: 1024px) 50vw, 45vw" />
            </Animated>
          ) : null}
          {right ? (
            <Animated
              motion={motion}
              delay={0.08}
              className={cn(
                "col-span-4 md:col-span-3",
                rightSpan,
                block.offset ? "lg:pt-[8vh]" : undefined,
              )}
            >
              <MediaFrame media={right} sizes="(max-width: 1024px) 50vw, 45vw" />
            </Animated>
          ) : null}
          {block.caption ? (
            <p className="meta col-span-4 text-muted md:col-span-6 lg:col-span-12">{block.caption}</p>
          ) : null}
        </div>
      );
    }

    case "imageText": {
      const media = toMedia(block.image);
      const [firstSpan, secondSpan] = ratioClasses[block.ratio as keyof typeof ratioClasses] ?? ratioClasses["50-50"];
      const imageFirst = block.order !== "image-right";

      const imageEl = media ? (
        <Animated
          motion={motion}
          className={cn("col-span-4 md:col-span-6", imageFirst ? firstSpan : secondSpan)}
        >
          <MediaFrame media={media} caption={block.caption ?? undefined} sizes="(max-width: 1024px) 100vw, 45vw" />
        </Animated>
      ) : null;

      const textEl = (
        <Animated
          motion={motion}
          delay={0.08}
          className={cn(
            "col-span-4 self-center md:col-span-6",
            imageFirst ? secondSpan : firstSpan,
          )}
        >
          <RichText data={block.body} />
        </Animated>
      );

      return (
        <div className="grid-12 gap-y-8">
          {imageFirst ? (
            <>
              {imageEl}
              {textEl}
            </>
          ) : (
            <>
              {textEl}
              {imageEl}
            </>
          )}
        </div>
      );
    }

    case "video": {
      const video = toMedia(block.video);
      const poster = toMedia(block.poster);
      if (!video) return null;

      return (
        <Animated motion={motion}>
          <figure>
            <video
              src={video.src}
              poster={poster?.src}
              muted={block.autoplay !== false}
              loop={block.loop !== false}
              autoPlay={block.autoplay !== false}
              controls={block.controls === true}
              playsInline
              preload="metadata"
              className="w-full"
            />
            {block.caption ? <figcaption className="meta mt-3 text-muted">{block.caption}</figcaption> : null}
          </figure>
        </Animated>
      );
    }

    case "gallery": {
      const photos = (block.photos ?? []).filter(
        (photo: unknown) => typeof photo === "object" && photo !== null,
      );
      if (photos.length === 0) return null;

      return (
        <div className="grid-12 gap-y-8">
          {photos.map((photo: Record<string, any>, index: number) => {
            const media = toMedia(photo.image, `${photo.place}, ${photo.date}`);
            if (!media) return null;
            return (
              <Animated
                key={photo.id}
                motion={motion}
                delay={index * 0.04}
                className="col-span-4 md:col-span-3 lg:col-span-4"
              >
                <MediaFrame media={media} caption={photo.place} sizes="(max-width: 1024px) 50vw, 30vw" />
              </Animated>
            );
          })}
        </div>
      );
    }

    /* --------------------------------------------------------- interactive */

    case "projectPreview": {
      const projects = (block.projects ?? []).filter(
        (project: unknown) => typeof project === "object" && project !== null,
      );
      if (projects.length === 0) return null;

      return (
        <Animated motion={motion}>
          <ul className="border-t border-rule">
            {projects.map((project: Record<string, any>, index: number) => (
              <li key={project.id}>
                <Link
                  href={`/work/${project.slug}`}
                  data-cursor-state="view"
                  className="group grid-12 items-baseline gap-y-2 border-b border-rule py-6"
                >
                  <span className="meta col-span-1 text-muted">{pad(index + 1)}</span>
                  <span className="col-span-3 text-title font-medium transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-2 md:col-span-4 lg:col-span-7">
                    {project.title}
                  </span>
                  <span className="meta col-span-4 text-muted md:col-span-1 lg:col-span-4 lg:justify-self-end">
                    {project.year}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Animated>
      );
    }

    case "toolPreview": {
      const tools = (block.tools ?? []).filter(
        (tool: unknown) => typeof tool === "object" && tool !== null,
      );
      if (tools.length === 0) return null;

      return (
        <Animated motion={motion}>
          <ul className="border-t border-rule">
            {tools.map((tool: Record<string, any>) => (
              <li key={tool.id} className="border-b border-rule py-5">
                <span className="text-title font-medium">{tool.name}</span>
                <span className="mt-1 block max-w-[48ch] text-small text-muted">{tool.description}</span>
              </li>
            ))}
          </ul>
        </Animated>
      );
    }

    default:
      // Unknown block type — render nothing rather than guessing.
      return null;
  }
}

export function BlockRenderer({ blocks }: { blocks?: Block[] | null }) {
  const visible = (blocks ?? []).filter(isVisible);
  if (visible.length === 0) return null;

  return (
    <div className="grid-12">
      {visible.map((block, index) => (
        <div key={block.id ?? `${block.blockType}-${index}`} className={layoutClasses(block)}>
          <BlockBody block={block} />
        </div>
      ))}
    </div>
  );
}
