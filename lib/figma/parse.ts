import { FigmaFile, FigmaNode, paintSolidToHex } from "./types";

export type ParsedFigma = {
  tokens: {
    brandColor?: string;
    brandPalette?: string[];
    text?: string;
    background?: string;
    fontPrimary?: { family: string; weight: number; style?: string };
    radius?: number;
    spacingBase?: number;
  };
  sections: Array<{
    kind: "hero" | "features" | "cta" | "contact" | "gallery" | "about";
    title?: string;
    subtitle?: string;
    bullets?: string[];
    media?: { type: "image" | "vector"; src?: string; alt?: string };
  }>;
  pages: Array<{ name: string; frames: string[] }>;
  meta: { fileName?: string; nodeId?: string; source: "api" | "json-upload" };
};

function extractSections(nodes: FigmaNode[]): ParsedFigma["sections"] {
  const sections: ParsedFigma["sections"] = [];
  const kinds = ["hero", "features", "cta", "contact", "gallery", "about"] as const;

  for (const node of nodes) {
    if (node.type !== "FRAME" || !node.name) continue;
    const name = node.name.toLowerCase();
    const kind = kinds.find((k) => name.includes(k));
    if (kind) {
      const texts = (node.children || []).filter((c) => c.type === "TEXT" && c.characters);
      const title = texts[0]?.characters;
      const subtitle = texts[1]?.characters;
      sections.push({ kind, title, subtitle });
    }
  }
  return sections;
}

export function parseFile(file: FigmaFile, node?: FigmaNode): ParsedFigma {
  const tokens: ParsedFigma["tokens"] = {};

  if (file.styles) {
    for (const style of Object.values(file.styles)) {
      if (!tokens.brandColor && style.styleType === "FILL" && style.paints && style.paints.length > 0) {
        const hex = paintSolidToHex(style.paints[0]);
        if (hex) tokens.brandColor = hex;
      }
      if (!tokens.fontPrimary && (style.styleType === "TEXT" || (style as any).fontFamily)) {
        const s: any = style as any;
        if (s.fontFamily) {
          tokens.fontPrimary = { family: s.fontFamily, weight: Number(s.fontWeight) || 400, style: s.italic ? "italic" : undefined };
        }
      }
    }
  }

  let sections: ParsedFigma["sections"] = [];
  if (node) {
    sections = extractSections([node]);
  } else if (file.document.children) {
    sections = extractSections(file.document.children as any);
  }

  const pages = (file.document.children || []).map((p) => ({
    name: p.name || "Page",
    frames: (p.children || []).filter((f: any) => f.type === "FRAME").map((f: any) => f.id),
  }));

  return {
    tokens,
    sections,
    pages,
    meta: { fileName: file.name, source: "api", nodeId: node?.id },
  };
}

export function parseJsonUpload(json: any): ParsedFigma {
  const file = FigmaFile.parse(json);
  const parsed = parseFile(file);
  parsed.meta.source = "json-upload";
  return parsed;
}
