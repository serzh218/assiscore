import { prisma } from '@/lib/db'

export async function logCopilotEvent(data: {
  userId: string
  projectId: string
  filePath: string
  action: string
  text: string
}) {
  try {
    await prisma.copilotEvent.create({ data })
  } catch {
    // ignore logging errors
  }
}
