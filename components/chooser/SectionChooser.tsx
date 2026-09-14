"use client";

import { VariantThumbnail } from "./VariantThumbnail";
import { VARIANT_CATALOG } from "@/lib/variants/catalog";
import type { Section } from "@/lib/schemas/section";
import type { PageTheme } from "@/components/preview/ThemeToggle";

export function SectionChooser({ section, theme, onPick }: { section: Section; theme: PageTheme; onPick: (variant: string) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {VARIANT_CATALOG[section.type].map((v) => (
        <VariantThumbnail
          key={v.id}
          section={section}
          variant={v.id}
          theme={theme}
          selected={v.id === section.variant}
          onPick={() => onPick(v.id)}
        />
      ))}
    </div>
  );
}
