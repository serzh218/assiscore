import axios from "axios";
import { FigmaFile, FigmaNode } from "./types";

const API_BASE = process.env.FIGMA_API_BASE || "https://api.figma.com";

function getToken(): string {
  const token = process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
  if (!token) {
    const err: any = new Error("FIGMA_TOKEN_MISSING");
    err.code = "FIGMA_TOKEN_MISSING";
    throw err;
  }
  return token;
}

export async function getFile(fileKey: string): Promise<FigmaFile> {
  const token = getToken();
  const res = await axios.get(`${API_BASE}/v1/files/${fileKey}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return FigmaFile.parse(res.data);
}

export async function getNodes(
  fileKey: string,
  ids: string[],
): Promise<Record<string, FigmaNode>> {
  const token = getToken();
  const res = await axios.get(`${API_BASE}/v1/files/${fileKey}/nodes`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { ids: ids.join(",") },
  });
  const nodes = res.data.nodes ?? {};
  const parsed: Record<string, FigmaNode> = {};
  for (const [id, node] of Object.entries(nodes)) {
    parsed[id] = (FigmaNode as any).parse((node as any).document || node);
  }
  return parsed;
}

export function resolveUrl(figmaUrl: string): { fileKey: string; nodeId?: string } | null {
  try {
    const url = new URL(figmaUrl);
    const match = url.pathname.match(/\/file\/([\w-]+)|\/design\/([\w-]+)/);
    const fileKey = match?.[1] || match?.[2];
    if (!fileKey) return null;
    const nodeId = url.searchParams.get("node-id") || undefined;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}
