export type FeatureStatus = 'pending' | 'building' | 'shipped' | 'rejected'

export interface FeatureRequest {
  id: string
  title: string
  description: string | null
  status: FeatureStatus
  vote_count: number
  submitter_fingerprint: string | null
  github_pr_url: string | null
  created_at: string
}

export interface BugReport {
  id: string
  title: string
  description: string | null
  steps_to_reproduce: string | null
  status: 'open' | 'in-progress' | 'fixed'
  github_issue_url: string | null
  github_pr_url: string | null
  created_at: string
}

export interface ChangelogEntry {
  id: string
  title: string
  description: string | null
  feature_request_id: string | null
  bug_report_id: string | null
  github_pr_url: string | null
  deployed_at: string
}
