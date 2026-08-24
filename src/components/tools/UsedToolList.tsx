"use client";

import { ProximityField, ProximityItem } from "@/components/motion/ProximityField";
import { Reveal } from "@/components/motion/Reveal";

/** Flat shape mapped from the CMS by the page. */
export type ToolGroup = {
  category: string;
  items: { name: string; note?: string; href?: string }[];
};

/**
 * Everyday stack.
 *
 * Grouped plain lists — no logo wall, no cards. The only motion is the same
 * proximity repulsion used in the home hero, at roughly half strength, which is
 * what ties the two pages together without introducing a new idea.
 */
export function UsedToolList({ groups }: { groups: ToolGroup[] }) {
  return (
    <ProximityField radius={110} strength={10} rotation={2.5}>
      <div className="grid-12 gap-y-14">
        {groups.map((group, index) => (
          <Reveal
            key={group.category}
            className="col-span-4 md:col-span-3 lg:col-span-3"
            delay={index * 0.05}
            stagger="tight"
          >
            <h3 className="meta mb-6 text-muted">{group.category}</h3>
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <li key={item.name} data-reveal-item>
                  <ProximityItem className="text-title font-medium">{item.name}</ProximityItem>
                  {item.note ? (
                    <span className="mt-0.5 block text-small text-muted">{item.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </ProximityField>
  );
}
