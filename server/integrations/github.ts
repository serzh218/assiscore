export async function createRepo(
  user: { githubUsername?: string | null },
  { project, visibility }: { project: { title: string }; visibility: 'public' | 'private' }
): Promise<{ repoUrl: string }> {
  const username = user.githubUsername || 'demo';
  const slug = project.title.toLowerCase().replace(/\s+/g, '-');
  return { repoUrl: `https://github.com/${username}/${slug}` };
}

export async function pushFiles(repoUrl: string, files: Record<string, string>): Promise<void> {
  console.log(`Pushing to ${repoUrl}:`, Object.keys(files));
}

// TODO: Подключить реальный GitHub API через @octokit/rest
