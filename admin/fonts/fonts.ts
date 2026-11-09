import { Inter, Jersey_10, Tiny5 } from "next/font/google";
import localFont from "next/font/local";

/**
 * The admin panel shares the storefront's type system: Inter for body
 * copy, Tiny5 for labels, navigation and titles, Jersey 10 for large
 * figures, and the "after" display face for the Pointet wordmark.
 * Every font is exposed as a CSS variable consumed by `globals.css`.
 */
export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const tiny5 = Tiny5({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-tiny5",
});

export const jersey10 = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
});

export const after = localFont({
  src: "./after-regular.otf",
  variable: "--font-after",
  display: "swap",
});

export const fontVariables = [
  inter.variable,
  tiny5.variable,
  jersey10.variable,
  after.variable,
].join(" ");
