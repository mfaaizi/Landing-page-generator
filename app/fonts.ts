import { Fraunces, Manrope, Sora, Space_Grotesk } from "next/font/google";

/**
 * Typography is the cheapest way to make two pages feel like two brands.
 * One body face, three display faces, chosen from the brief's vibe.
 */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-serif",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-grotesk",
  display: "swap",
});

export const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display-round",
  display: "swap",
});

export const fontClassNames = [
  manrope.variable,
  fraunces.variable,
  spaceGrotesk.variable,
  sora.variable,
].join(" ");
