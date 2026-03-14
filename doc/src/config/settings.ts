export type {
  HeaderNavItem,
  ColorModeConfig,
  LocaleConfig,
} from "./settings-types";
import type {
  HeaderNavItem,
  ColorModeConfig,
  LocaleConfig,
} from "./settings-types";

export const settings = {
  colorScheme: "Default Dark",
  colorMode: false as ColorModeConfig | false,
  siteName: "Beat Saber Overlay Spec",
  siteDescription: "Internal specification for the Beat Saber stream overlay" as string,
  base: "/beatsaber-overlay/doc/",
  docsDir: "src/content/docs",
  locales: {} satisfies Record<string, LocaleConfig>,
  mermaid: false,
  noindex: true as boolean,
  editUrl: false as string | false,
  siteUrl: "" as string,
  sitemap: false,
  docMetainfo: false,
  docTags: false,
  math: false,
  docHistory: false,
  claudeResources: false as { claudeDir: string; projectRoot?: string } | false,
  headerNav: [] satisfies HeaderNavItem[],
};
