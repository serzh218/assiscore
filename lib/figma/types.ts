import { z } from "zod";
import { colord } from "colord";

export const FigmaColor = z.object({
  r: z.number(),
  g: z.number(),
  b: z.number(),
  a: z.number().optional(),
});

export const FigmaPaint = z.object({
  type: z.string(),
  color: FigmaColor.optional(),
  opacity: z.number().optional(),
});

export const FigmaStyle = z.object({
  key: z.string().optional(),
  name: z.string().optional(),
  styleType: z.enum(["FILL", "TEXT", "GRID"]).optional(),
  paints: z.array(FigmaPaint).optional(),
}).passthrough();

export const FigmaNode: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().optional(),
    type: z.string(),
    children: z.array(FigmaNode).optional(),
    fills: z.array(FigmaPaint).optional(),
    characters: z.string().optional(),
    style: z.any().optional(),
    cornerRadius: z.number().optional(),
    itemSpacing: z.number().optional(),
  }),
);

export const FigmaFile = z.object({
  name: z.string(),
  document: FigmaNode,
  styles: z.record(FigmaStyle).optional(),
  components: z.record(z.any()).optional(),
});

export type FigmaFile = z.infer<typeof FigmaFile>;
export type FigmaNode = z.infer<typeof FigmaNode>;
export type FigmaStyle = z.infer<typeof FigmaStyle>;

export function toHex(color: { r: number; g: number; b: number }): string {
  return colord({
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
  }).toHex();
}

export function fontToCSS(font: {
  family: string;
  style?: string;
  weight?: number | string;
}): string {
  const weight = font.weight ?? 400;
  const style = font.style ?? "normal";
  return `${font.family}, ${style} ${weight}`;
}

export function paintSolidToHex(paint?: {
  type?: string;
  color?: { r: number; g: number; b: number };
  opacity?: number;
}): string | undefined {
  if (!paint || paint.type !== "SOLID" || !paint.color) return undefined;
  const hex = toHex(paint.color);
  const opacity = paint.opacity ?? 1;
  if (opacity < 1) {
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex}${alpha}`;
  }
  return hex;
}
