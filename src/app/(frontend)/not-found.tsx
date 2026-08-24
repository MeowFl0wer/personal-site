import { getNavigation } from "@/lib/cms";
import { SectionNumber } from "@/components/ui/SectionHeader";
import { ArrowLinkLarge } from "@/components/ui/ArrowLink";

export default async function NotFound() {
  const navigation = await getNavigation();

  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center pt-10 md:pt-16">
      <SectionNumber index="404" label="Not found" />
      <hr className="rule mt-4" />

      <h1 className="text-display mt-12 max-w-[16ch] font-medium">
        This page doesn&apos;t exist.
      </h1>

      <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
        {navigation.map((item) => (
          <li key={item.href}>
            <ArrowLinkLarge href={item.href}>{item.label}</ArrowLinkLarge>
          </li>
        ))}
      </ul>
    </div>
  );
}
