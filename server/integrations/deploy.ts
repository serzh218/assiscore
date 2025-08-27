export type DeployProvider = "vercel" | "render" | "cloudflare";

export type DeployInput = {
  provider: DeployProvider;
  project: { id: string; title: string };
  domain?: string | null;
  files: Record<string, string>;
};

export type DeployResult = {
  deployUrl: string;
  providerProjectUrl: string;
  notes?: string;
};

export async function deploySite(input: DeployInput): Promise<DeployResult> {
  const slug = input.project.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const sub = `${slug || "site"}-${input.project.id.slice(0, 6)}`;

  if (input.domain) {
    return {
      deployUrl: `https://${input.domain}`,
      providerProjectUrl: `https://${input.provider}.mock/${sub}`,
      notes: `Добавьте A/AAAA/CNAME записи для домена ${input.domain} согласно инструкции провайдера.`,
    };
  }

  if (input.provider === "vercel") {
    return {
      deployUrl: `https://${sub}.vercel.app`,
      providerProjectUrl: `https://vercel.com/mock/${sub}`,
    };
  }
  if (input.provider === "render") {
    return {
      deployUrl: `https://${sub}.onrender.com`,
      providerProjectUrl: `https://dashboard.render.com/mock/${sub}`,
    };
  }
  return {
    deployUrl: `https://${sub}.pages.dev`,
    providerProjectUrl: `https://dash.cloudflare.com/mock/${sub}`,
  };
}
