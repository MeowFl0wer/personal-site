import type { Metadata } from "next";
import { getResume, getHome, getSettings, getSocials, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SocialIcon, SocialRow } from "@/components/ui/SocialIcon";
import { PrintButton } from "@/components/resume/PrintButton";

export async function generateMetadata(): Promise<Metadata> {
  const [resume, home] = await Promise.all([getResume(), getHome()]);
  return {
    title: "About Me",
    description: `${home.name} — ${resume.title}. Introduction, experience, education, projects and skills.`,
  };
}

/**
 * The most formal, most restrained page on the site — and the one that answers
 * "who is this", which is why it opens the navigation.
 *
 * It is one page doing two jobs, in that order: a portrait, a name and an
 * introduction someone actually reads, and beneath them the formal record.
 * Splitting those into /about and /resume would have meant two pages, two URLs
 * and the same facts maintained twice.
 *
 * Motion budget: fades and nothing else. No scroll snap, no velocity, no WebGL,
 * no video. Someone reading this is deciding whether to email me, and every
 * effect would be in their way.
 *
 * ONE data source: this same DOM is what the print stylesheet turns into an A4.
 * There is no second PDF document and no way for the two to disagree. The
 * portrait is the one thing the print version drops — a résumé is a document,
 * not a page.
 */
type Entry = {
  organisation: string;
  role: string;
  location?: string | null;
  start?: string | null;
  end?: string | null;
  current?: boolean | null;
  body?: { text: string }[] | null;
  highlights?: { text: string }[] | null;
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14 first:mt-0 md:mt-20">
      <Reveal>
        <h2 className="meta">{title}</h2>
      </Reveal>
      <hr className="rule mt-4 mb-8" />
      {children}
    </section>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  const period = entry.current
    ? `${entry.start ?? ""} — Now`
    : [entry.start, entry.end].filter(Boolean).join(" — ");

  return (
    <Reveal as="article" className="grid-12 gap-y-3 border-b border-rule pb-8 last:border-0">
      <div className="col-span-4 md:col-span-6 lg:col-span-3">
        <h3 className="text-title font-medium">{entry.organisation}</h3>
        {entry.location ? <p className="meta mt-2 text-muted">{entry.location}</p> : null}
      </div>

      <div className="col-span-4 md:col-span-6 lg:col-span-7">
        <p className="text-small font-medium">{entry.role}</p>
        {(entry.body ?? []).map((paragraph) => (
          <p key={paragraph.text} className="mt-3 max-w-[62ch] text-small pretty text-muted">
            {paragraph.text}
          </p>
        ))}
        {(entry.highlights ?? []).length > 0 ? (
          <ul className="mt-4 flex max-w-[62ch] list-none flex-col gap-2">
            {(entry.highlights ?? []).map((highlight) => (
              <li key={highlight.text} className="flex gap-3 text-small pretty text-muted">
                <span aria-hidden="true">—</span>
                <span>{highlight.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {period ? (
        <p className="meta col-span-4 text-muted md:col-span-6 lg:col-span-2 lg:justify-self-end">
          {period}
        </p>
      ) : null}
    </Reveal>
  );
}

export default async function AboutPage() {
  const [resume, home, settings, socials] = await Promise.all([
    getResume(),
    getHome(),
    getSettings(),
    getSocials(),
  ]);
  const portrait = toMedia(resume.portrait, `${home.name} — portrait`);

  const facts = [
    { label: "Based in", value: home.basedIn },
    { label: "Currently", value: home.currently },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  // The address is spelled out next to Download CV, so the envelope in the
  // accounts row would be the same destination twice under two different names.
  const elsewhere = socials.filter((social) => social.platform !== "email");

  const identity = portrait
    ? "col-span-4 md:col-span-4 lg:col-span-8 lg:col-start-5"
    : "col-span-4 md:col-span-6 lg:col-span-9";

  return (
    <div className="shell pt-10 md:pt-16" data-resume>
      {/* 00, not 05: this is the preface to the numbered sections, not another
          one of them. */}
      <SectionHeader index="00" label="About Me" />

      {/* The masthead. Portrait and the standing facts on the left, the name and
          the introduction on the right — the arrangement a printed profile page
          has used for a century, and the reason it survives is that the eye
          lands on the face and then reads. */}
      <div data-resume-masthead className="grid-12 mt-12 items-start gap-y-10 md:mt-16">
        {/* `data-print` has to sit on a plain element: Reveal renders its own
            node and forwards nothing but className. */}
        {portrait ? (
          <div className="col-span-4 md:col-span-2 lg:col-span-3" data-print="hide">
            <Reveal>
              <MediaFrame
                media={portrait}
                ratio="4 / 5"
                priority
                sizes="(max-width: 639px) 60vw, (max-width: 1023px) 33vw, 24vw"
                className="max-w-[220px] md:max-w-none"
              />
            </Reveal>
          </div>
        ) : null}

        <div className={identity}>
          <div data-resume-name>
            <Reveal>
              <h1 className="text-display font-medium">{home.name}</h1>
              <p className="text-lead mt-3 text-muted">{resume.title}</p>
            </Reveal>
          </div>

          {/* What the reader came for, directly under the name. `items-stretch`
              is doing real work: the mail square takes its height from the CV
              button rather than from a hard-coded size that would drift the
              moment the type scale moves. */}
          <div className="mt-8 md:mt-10" data-print="hide">
            <Reveal delay={0.06}>
              <div className="flex flex-wrap items-stretch gap-3">
                <PrintButton />
                <a
                  href={`mailto:${settings.email}`}
                  aria-label={`Email ${settings.email}`}
                  title={settings.email}
                  data-cursor-state="external"
                  className="inline-flex items-center justify-center border border-ink px-4 text-ink transition-colors duration-[--duration-fast] hover:bg-ink hover:text-paper"
                >
                  <SocialIcon platform="email" size={18} />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Standing facts and accounts as two columns under the name. The
              nested grid inherits --columns, so this splits 50/50 on a wide
              screen and stacks on a narrow one without a second breakpoint. */}
          {facts.length > 0 || elsewhere.length > 0 ? (
            <div className="grid-12 mt-10 gap-y-8 md:mt-12">
              {facts.length > 0 ? (
                <div className="col-span-4 md:col-span-3 lg:col-span-6">
                  <Reveal delay={0.08}>
                    <dl className="flex flex-col gap-4 border-t border-rule pt-5">
                      {facts.map((fact) => (
                        <div key={fact.label}>
                          <dt className="meta text-muted">{fact.label}</dt>
                          <dd className="mt-1 text-small">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                </div>
              ) : null}

              {/* The Contact block below prints these as text. A row of glyphs
                  on paper is decoration with no destination. */}
              {elsewhere.length > 0 ? (
                <div className="col-span-4 md:col-span-3 lg:col-span-6" data-print="hide">
                  <Reveal delay={0.12}>
                    <div className="border-t border-rule pt-5">
                      <p className="meta mb-4 text-muted">Elsewhere</p>
                      <SocialRow links={elsewhere} className="gap-x-6 gap-y-3" />
                    </div>
                  </Reveal>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* The introduction gets its own row under the masthead, a step down in
          size from the name block. At lead size beside the portrait it competed
          with the h1; here it is prose again.

          It runs the full width of the shell with no character cap. A 68ch
          measure is the textbook answer and it was wrong here: at body size it
          broke a sentence that fits on one line into two and left half the row
          empty. The band is two short paragraphs, not an essay. */}
      {(resume.profile ?? []).length > 0 ? (
        <div data-resume-intro className="mt-12 md:mt-16">
          <Reveal className="flex flex-col gap-4" delay={0.06}>
            {(resume.profile ?? []).map((paragraph) => (
              <p key={paragraph.text} className="text-body pretty">
                {paragraph.text}
              </p>
            ))}
          </Reveal>
        </div>
      ) : null}

      <div className="mt-[clamp(3.5rem,10vh,7rem)] max-w-[1200px]" data-resume-body>
        {(resume.experience ?? []).length > 0 ? (
          <Block title="Experience">
            <div className="flex flex-col gap-8">
              {(resume.experience ?? []).map((entry, index) => (
                <EntryRow key={`${entry.organisation}-${index}`} entry={entry as Entry} />
              ))}
            </div>
          </Block>
        ) : null}

        {(resume.education ?? []).length > 0 ? (
          <Block title="Education">
            <div className="flex flex-col gap-8">
              {(resume.education ?? []).map((entry, index) => (
                <EntryRow key={`${entry.organisation}-${index}`} entry={entry as Entry} />
              ))}
            </div>
          </Block>
        ) : null}

        {(resume.projects ?? []).length > 0 ? (
          <Block title="Projects">
            <div className="flex flex-col gap-6">
              {(resume.projects ?? []).map((project) => (
                <Reveal key={project.name} className="grid-12 gap-y-2">
                  <h3 className="col-span-4 text-small font-medium md:col-span-6 lg:col-span-3">
                    {project.name}
                  </h3>
                  <p className="col-span-4 max-w-[62ch] text-small text-muted md:col-span-6 lg:col-span-7">
                    {project.body}
                  </p>
                  {project.period ? (
                    <p className="meta col-span-4 text-muted md:col-span-6 lg:col-span-2 lg:justify-self-end">
                      {project.period}
                    </p>
                  ) : null}
                </Reveal>
              ))}
            </div>
          </Block>
        ) : null}

        {(resume.skills ?? []).length > 0 ? (
          <Block title="Skills">
            <div className="grid-12 gap-y-8">
              {(resume.skills ?? []).map((group) => (
                <Reveal key={group.category} className="col-span-4 md:col-span-3 lg:col-span-3">
                  <h3 className="meta mb-3 text-muted">{group.category}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {(group.items ?? []).map((item) => (
                      <li key={item} className="text-small">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </Block>
        ) : null}

        {(resume.awards ?? []).length > 0 ? (
          <Block title="Awards">
            <div className="flex flex-col gap-6">
              {(resume.awards ?? []).map((award) => (
                <Reveal key={award.name} className="grid-12 gap-y-2">
                  <h3 className="col-span-4 text-small font-medium md:col-span-6 lg:col-span-3">
                    {award.name}
                  </h3>
                  <p className="col-span-4 max-w-[62ch] text-small text-muted md:col-span-6 lg:col-span-7">
                    {award.body}
                  </p>
                  {award.period ? (
                    <p className="meta col-span-4 text-muted md:col-span-6 lg:col-span-2 lg:justify-self-end">
                      {award.period}
                    </p>
                  ) : null}
                </Reveal>
              ))}
            </div>
          </Block>
        ) : null}

        <Block title="Contact">
          <Reveal className="flex flex-wrap gap-x-10 gap-y-4">
            {(resume.contact ?? []).map((link) => (
              <ArrowLink
                key={link.label}
                href={link.href}
                external={link.external ?? undefined}
                arrow={link.external ? "↗" : null}
                className="text-small"
              >
                {link.label}
              </ArrowLink>
            ))}
          </Reveal>
          {resume.printNote ? <p className="meta mt-8 text-muted">{resume.printNote}</p> : null}
        </Block>
      </div>
    </div>
  );
}
