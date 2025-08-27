import type { ParsedFigma } from "./parse";

export type PartialCssVars = Record<string, string>;

export function mapFigmaTokensToCss(parsed: ParsedFigma): PartialCssVars {
  const vars: PartialCssVars = {};
  const t = parsed.tokens;
  if (t.brandColor) vars["--primary"] = t.brandColor;
  if (t.text) vars["--text"] = t.text;
  if (t.background) vars["--bg"] = t.background;
  if (typeof t.radius === "number") vars["--radius-lg"] = `${t.radius}px`;
  return vars;
}

export function mapSectionsToScaffold(parsed: ParsedFigma): Record<string, string> {
  const files: Record<string, string> = {};
  const imports: string[] = [];
  const sections: string[] = [];

  for (const sec of parsed.sections) {
    const comp = sec.kind.charAt(0).toUpperCase() + sec.kind.slice(1);
    imports.push(`import ${comp} from "@/components/sections/${comp}";`);
    sections.push(`      <${comp} />`);
    const component = `import { Card } from "@/components/ui";

export default function ${comp}() {
  return (
    <section className="py-16">
      <Card className="p-8 text-center">
        <h2 className="text-3xl font-bold">${sec.title || comp}</h2>
        ${sec.subtitle ? `<p className=\"mt-4 text-lg text-muted\">${sec.subtitle}</p>` : ""}
      </Card>
    </section>
  );
}
`;
    files[`components/sections/${comp}.tsx`] = component;
  }

  const page = `${imports.join("\n")}

export default function Page() {
  return (
    <>
${sections.join("\n")}
    </>
  );
}
`;
  files["app/(app)/page.tsx"] = page;
  return files;
}
