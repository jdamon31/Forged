export async function createGitHubIssue({
  title,
  body,
}: {
  title: string
  body: string
}): Promise<{ url: string; number: number } | null> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO

  if (!token || !repo) return null

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[BUG] ${title}`,
      body,
      labels: ['bug', 'claude-fix'],
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  return { url: data.html_url, number: data.number }
}
