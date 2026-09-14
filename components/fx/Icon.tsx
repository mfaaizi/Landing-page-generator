"use client";

import {
  Calendar,
  Check,
  Clock,
  Coffee,
  Compass,
  Gauge,
  Globe,
  Heart,
  Layers,
  Leaf,
  Lock,
  MessageCircle,
  Package,
  Palette,
  Phone,
  Scissors,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/schemas/primitives";

/** One entry per value in ICON_NAMES. The schema guarantees nothing else arrives. */
const ICONS: Record<IconName, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  leaf: Leaf,
  clock: Clock,
  compass: Compass,
  layers: Layers,
  "message-circle": MessageCircle,
  users: Users,
  "trending-up": TrendingUp,
  package: Package,
  wand: Wand2,
  lock: Lock,
  globe: Globe,
  phone: Phone,
  calendar: Calendar,
  star: Star,
  check: Check,
  gauge: Gauge,
  palette: Palette,
  truck: Truck,
  coffee: Coffee,
  scissors: Scissors,
};

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp size={size} className={className} strokeWidth={1.75} aria-hidden />;
}

/** Icon inside a small glass disc with the accent tint. Used by feature cards. */
export function IconBadge({ name }: { name: IconName }) {
  return (
    <span
      className="glass"
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: 44,
        height: 44,
        borderRadius: "14px",
        color: "var(--accent)",
        background: "color-mix(in srgb, var(--accent) 12%, var(--page-glass))",
      }}
    >
      <Icon name={name} />
    </span>
  );
}
