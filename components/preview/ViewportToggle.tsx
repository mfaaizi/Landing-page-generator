"use client";

export const VIEWPORTS = { mobile: 390, tablet: 834, desktop: 1280 } as const;
export type ViewportKey = keyof typeof VIEWPORTS;

const LABEL: Record<ViewportKey, string> = { mobile: "Phone", tablet: "Tablet", desktop: "Desktop" };

export function ViewportToggle({ value, onChange }: { value: ViewportKey; onChange: (next: ViewportKey) => void }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Preview width">
      {(Object.keys(VIEWPORTS) as ViewportKey[]).map((key) => (
        <button key={key} type="button" className="tool-button" onClick={() => onChange(key)} aria-pressed={value === key}>
          {LABEL[key]}
        </button>
      ))}
    </div>
  );
}
