import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { getProjectById } from '@/server/repo/project'
import { getCurrentUser } from '@/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.visibility !== 'public') {
    const user = await getCurrentUser()
    if (!user || user.id !== project.ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  const files = project.files as Record<string, any> | null
  const zipBase64 = files?.['__preview.zip']
  const htmlPath = files?.['__previewPath'] || 'index.html'
  if (!zipBase64) {
    return NextResponse.json({ error: 'Preview not ready' }, { status: 404 })
  }
  const zip = await JSZip.loadAsync(Buffer.from(zipBase64, 'base64'))
  const file = zip.file(htmlPath)
  if (!file) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const html = await file.async('string')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' },
  })
}
