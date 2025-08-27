import { execSync } from 'child_process'

function getChangedFiles(
  base = process.env.GITHUB_BASE_REF || 'origin/main',
  head = process.env.GITHUB_HEAD_REF || 'HEAD',
) {
  const out = execSync(`git diff --name-only ${base}...${head}`, { encoding: 'utf8' })
  return out.split('\n').filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
}

import { pathToFileURL } from 'url'

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = getChangedFiles()
  if (files.length === 0) {
    console.log('No changed files to lint')
    process.exit(0)
  }
  try {
    execSync(`pnpm exec eslint ${files.join(' ')}`, { stdio: 'inherit' })
  } catch (e) {
    process.exit(1)
  }
}
