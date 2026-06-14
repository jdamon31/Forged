#!/usr/bin/env node
/**
 * Claude Auto-Fix Script
 * Reads a GitHub issue, identifies relevant source files, asks Claude to
 * generate a minimal fix, and writes the changed files to disk.
 * The GitHub Actions workflow then commits and opens a PR.
 */

const { Anthropic } = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSourceFiles() {
  const extensions = ['.ts', '.tsx', '.css', '.js', '.jsx']
  const dirs = ['app', 'components', 'lib']
  const files = []
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    try {
      execSync(`find ${dir} -type f`)
        .toString()
        .trim()
        .split('\n')
        .filter((f) => f && extensions.some((ext) => f.endsWith(ext)))
        .forEach((f) => files.push(f))
    } catch {
      // dir may be empty
    }
  }
  return files
}

function scoreRelevance(filePath, issueText) {
  const lowerIssue = issueText.toLowerCase()
  const parts = filePath
    .toLowerCase()
    .replace(/[/.\-[\]]/g, ' ')
    .split(' ')
    .filter((p) => p.length > 2)
  return parts.reduce((score, part) => (lowerIssue.includes(part) ? score + 2 : score), 0)
}

async function main() {
  const issueTitle  = process.env.ISSUE_TITLE  || ''
  const issueBody   = process.env.ISSUE_BODY   || ''
  const issueNumber = process.env.ISSUE_NUMBER || '0'
  const issueText   = `${issueTitle} ${issueBody}`

  const allFiles = getSourceFiles()

  // Score and pick top 10 most relevant files
  const topFiles = allFiles
    .map((f) => ({ file: f, score: scoreRelevance(f, issueText) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((x) => x.file)

  // Build file context
  let fileContext = ''
  for (const filePath of topFiles) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      fileContext += `\n\n=== ${filePath} ===\n${content}\n=== end ${filePath} ===`
    }
  }

  const prompt = `You are an expert Next.js 16 developer fixing a bug in Forged.
Forged is a community-directed PWA built with: Next.js 16 App Router, React 19, Tailwind v4, Framer Motion, Supabase.

Bug Report #${issueNumber}:
Title: ${issueTitle}
Description: ${issueBody}

Relevant source files:
${fileContext}

Instructions:
1. Make the smallest surgical change that fixes the bug.
2. Do not refactor unrelated code.
3. Do not add comments explaining what you changed.
4. Respond ONLY with valid JSON in exactly this format — no other text:

{
  "explanation": "One sentence explaining what was wrong and what you changed.",
  "changes": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "complete new file content"
    }
  ]
}`

  console.log(`Sending issue #${issueNumber} to Claude...`)

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0]?.text ?? ''

  // Extract JSON — handle markdown code blocks if Claude wraps it
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/)
  if (!jsonMatch) {
    console.error('Could not find JSON in Claude response.')
    console.error('Response:', text.slice(0, 500))
    process.exit(1)
  }

  const jsonStr = jsonMatch[1] ?? jsonMatch[0]
  let result
  try {
    result = JSON.parse(jsonStr)
  } catch (err) {
    console.error('Failed to parse JSON:', err.message)
    console.error('JSON string:', jsonStr.slice(0, 500))
    process.exit(1)
  }

  console.log('Fix explanation:', result.explanation)

  // Apply changes
  for (const change of result.changes ?? []) {
    const dir = path.dirname(change.path)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(change.path, change.content, 'utf8')
    console.log(`Updated: ${change.path}`)
  }

  // Write explanation for the PR body
  fs.writeFileSync('.github/claude-explanation.txt', result.explanation ?? '', 'utf8')
  console.log('Done.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
