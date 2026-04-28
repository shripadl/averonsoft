'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type PracticeExamCard = {
  id: string
  slug: string
  name: string
  provider: string
  description: string
}

interface PracticeProviderSectionsProps {
  exams: PracticeExamCard[]
}

const providerOrder = ['AWS', 'Azure', 'GCP', 'Kubernetes', 'OpenShift', 'Docker', 'Ansible', 'Other'] as const
const providerDescriptions: Record<string, string> = {
  AWS: 'Architecture, reliability, security, and cost-focused cloud practice exams.',
  Azure: 'Identity, networking, operations, and developer-focused Microsoft cloud practice exams.',
  GCP: 'Platform, infrastructure, observability, and architecture-focused Google cloud practice exams.',
  Kubernetes: 'Cluster administration, app development, and cloud-native fundamentals practice exams.',
  OpenShift: 'Platform administration and developer workflow practice exams for OpenShift ecosystems.',
  Docker: 'Container runtime, image workflows, networking, and registry practice exams.',
  Ansible: 'Automation playbooks, roles, inventory, and enterprise orchestration practice exams.',
  Other: 'Additional provider practice exams.',
}

export function PracticeProviderSections({ exams }: PracticeProviderSectionsProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, PracticeExamCard[]>()
    for (const exam of exams) {
      const provider = exam.provider || 'Other'
      const current = map.get(provider) || []
      current.push(exam)
      map.set(provider, current)
    }
    return map
  }, [exams])

  const availableProviders = useMemo(
    () => providerOrder.filter((provider) => (grouped.get(provider) || []).length > 0),
    [grouped],
  )

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const selectedExams = selectedProvider ? grouped.get(selectedProvider) ?? [] : []

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {availableProviders.map((provider) => {
          const active = provider === selectedProvider
          return (
            <button
              key={provider}
              type="button"
              onClick={() => setSelectedProvider(provider)}
              className={`rounded-xl border p-5 text-left transition ${
                active
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-surface text-foreground hover:border-primary/40'
              }`}
            >
              <p className="text-xl font-semibold">{provider}</p>
              <p className={`mt-2 text-sm ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {providerDescriptions[provider] || providerDescriptions.Other}
              </p>
            </button>
          )
        })}
      </div>

      {selectedProvider ? (
        <div>
          <h2 className="mb-3 text-xl font-semibold">{selectedProvider} Exams</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedExams.map((exam) => (
              <div key={exam.id} className="rounded-lg border border-border bg-surface p-5">
                <h3 className="text-xl font-semibold">{exam.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{exam.description}</p>
                <Link
                  href={`/practice/${exam.slug}`}
                  className="mt-4 inline-flex rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
                >
                  Start Practice
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
          Select a provider above to view its exams.
        </div>
      )}
    </div>
  )
}

