import type { Metadata } from "next";
import { getResume, getHome } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { PrintButton } from "@/components/resume/PrintButton";

export async function generateMetadata(): Promise<Metadata> {
  const [resume, home] = await Promise.all([getResume(), getHome()]);
  return {
    title: "Resume",
    description: `${home.name} — ${resume.title}. Experience, education, projects and skills.`,
  };
}

/**
 * The most formal, most restrained page on the site.
 *
 * Motion budget: fades and nothing else. No scroll snap, no velocity, no WebGL,
 * no video. Someone reading this is deciding whether to email me, and every
 * effect would be in their way.
 *
 * ONE data source: this same DOM is what the print stylesheet turns into an A4.
 * There is no second PDF document and no way for the two to disagree.
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

export default async function ResumePage() {
  const [resume, home] = await Promise.all([getResume(), getHome()]);

  return (
    <div className="shell pt-10 md:pt-16" data-resume>
      <SectionHeader index="04" label="Resume" aside={<PrintButton />} />

      <Reveal className="mt-12 md:mt-16" data-resume-name>
        <h1 className="text-display font-medium">{home.name}</h1>
        <p className="text-lead mt-3 text-muted">{resume.title}</p>
      </Reveal>

      <div className="mt-[clamp(3.5rem,10vh,7rem)] max-w-[1200px]" data-resume-body>
        {(resume.profile ?? []).length > 0 ? (
          <Block title="Profile">
            <Reveal className="flex max-w-[70ch] flex-col gap-4">
              {(resume.profile ?? []).map((paragraph) => (
                <p key={paragraph.text} className="text-lead pretty">
                  {paragraph.text}
                </p>
              ))}
            </Reveal>
          </Block>
        ) : null}

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
