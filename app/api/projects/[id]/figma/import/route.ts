import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import {
  getProjectById,
  getProjectFiles,
  setProjectFiles,
  updateProjectSpec,
} from '@/server/repo/project'
import { resolveUrl, getFile, getNodes } from '@/lib/figma/api'
import { parseFile, parseJsonUpload } from '@/lib/figma/parse'
import { mapFigmaTokensToCss, mapSectionsToScaffold } from '@/lib/figma/mapToTokens'
import { saveVersion } from '@/server/repo/version'
import { enqueueRebuild } from '@/server/queue/generationQueue'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const project = await getProjectById(id)
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const { figmaUrl, jsonUploadBase64, nodeIdOverride, applyToProject = true } = await req.json()
    let parsed
    if (figmaUrl && process.env.FIGMA_PERSONAL_ACCESS_TOKEN) {
      const resolved = resolveUrl(figmaUrl)
      if (!resolved) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      const file = await getFile(resolved.fileKey)
      let node
      const nodeId = nodeIdOverride || resolved.nodeId
      if (nodeId) {
        const nodes = await getNodes(resolved.fileKey, [nodeId])
        node = nodes[nodeId]
      }
      parsed = parseFile(file, node)
    } else if (jsonUploadBase64) {
      const decoded = JSON.parse(Buffer.from(jsonUploadBase64, 'base64').toString('utf-8'))
      parsed = parseJsonUpload(decoded)
    } else {
      return NextResponse.json({ error: 'No input' }, { status: 400 })
    }

    await updateProjectSpec(project.id, { ...(project.spec as any), figma: parsed, hasFigma: true })

    let hasApplied = false
    if (applyToProject) {
      const cssVars = mapFigmaTokensToCss(parsed)
      const sectionFiles = mapSectionsToScaffold(parsed)
      const files = await getProjectFiles(project.id)
      if (Object.keys(cssVars).length) {
        const lines = [':root {']
        for (const [k, v] of Object.entries(cssVars)) lines.push(`  ${k}: ${v};`)
        lines.push('}')
        files['styles/tokens.css'] = lines.join('\n')
      }
      for (const [p, c] of Object.entries(sectionFiles)) {
        if (!(p in files)) files[p] = c
      }
      await setProjectFiles(project.id, files)
      const clean = { ...files } as Record<string, string>
      delete clean['__preview.zip']
      delete clean['__previewPath']
      await saveVersion(project.id, user.id, 'figma-import', clean)
      await enqueueRebuild(project.id, 'figma-import')
      hasApplied = true
    }

    return NextResponse.json({ ok: true, hasApplied })
  } catch (err: any) {
    if (err.code === 'FIGMA_TOKEN_MISSING') {
      return NextResponse.json({ error: 'FIGMA_TOKEN_MISSING' }, { status: 400 })
    }
    console.error('[figma/import]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
