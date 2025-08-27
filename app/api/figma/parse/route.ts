import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveUrl, getFile, getNodes } from "@/lib/figma/api";
import { parseFile, parseJsonUpload } from "@/lib/figma/parse";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { figmaUrl, jsonUploadBase64, nodeIdOverride } = await req.json();
    if (figmaUrl && process.env.FIGMA_PERSONAL_ACCESS_TOKEN) {
      const resolved = resolveUrl(figmaUrl);
      if (!resolved) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      const file = await getFile(resolved.fileKey);
      let node;
      const nodeId = nodeIdOverride || resolved.nodeId;
      if (nodeId) {
        const nodes = await getNodes(resolved.fileKey, [nodeId]);
        node = nodes[nodeId];
      }
      const parsed = parseFile(file, node);
      return NextResponse.json(parsed);
    }
    if (jsonUploadBase64) {
      const decoded = JSON.parse(Buffer.from(jsonUploadBase64, "base64").toString("utf-8"));
      const parsed = parseJsonUpload(decoded);
      return NextResponse.json(parsed);
    }
    return NextResponse.json({ error: "No input" }, { status: 400 });
  } catch (err: any) {
    if (err.code === "FIGMA_TOKEN_MISSING") {
      return NextResponse.json({ error: "FIGMA_TOKEN_MISSING" }, { status: 400 });
    }
    console.error("[figma/parse]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
