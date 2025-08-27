import { pathToFileURL } from 'url'

export function generatePreviewUrl(pr: string) {
  return `https://pr-${pr}.preview.mock`
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pr = process.argv[2] || '0'
  const deployUrl = generatePreviewUrl(pr)
  console.log(JSON.stringify({ deployUrl }))
}
