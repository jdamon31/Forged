import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createGitHubIssue } from '@/lib/github'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { title, description, steps_to_reproduce } = body

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    return NextResponse.json(
      { error: 'Title must be at least 5 characters.' },
      { status: 422 }
    )
  }

  const supabase = createAdminClient()

  // Save to database first
  const { data: bug, error } = await supabase
    .from('bug_reports')
    .insert({
      title: title.trim(),
      description: description?.trim() ?? null,
      steps_to_reproduce: steps_to_reproduce?.trim() ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Create GitHub issue (non-blocking — if it fails, bug is still saved)
  const issueBody = [
    description ? `**Description:**\n${description}` : null,
    steps_to_reproduce ? `**Steps to reproduce:**\n${steps_to_reproduce}` : null,
    `---\n*Filed via Forged*`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const issue = await createGitHubIssue({ title: title.trim(), body: issueBody })

  if (issue) {
    await supabase
      .from('bug_reports')
      .update({ github_issue_url: issue.url })
      .eq('id', bug.id)
  }

  return NextResponse.json({ id: bug.id }, { status: 201 })
}
