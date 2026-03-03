'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Tab = 'activity' | 'abuse'

export function AdminLogsClient() {
  const [tab, setTab] = useState<Tab>('activity')
  const [logs, setLogs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/logs?type=${tab}&limit=100`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || [])
      })
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('activity')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'activity' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-surface-hover'
          }`}
        >
          Activity Logs
        </button>
        <button
          onClick={() => setTab('abuse')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'abuse' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-surface-hover'
          }`}
        >
          Abuse Reports
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tab === 'activity' ? 'User Activity' : 'Abuse Reports'}</CardTitle>
          <CardDescription>
            {tab === 'activity'
              ? 'Recent user actions and API calls'
              : 'User-reported content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tab === 'abuse' ? (
            <div className="space-y-4">
              {(logs as Array<{ id: string; resource_type: string; reason: string; status: string; reporter_email?: string; created_at: string }>).map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{r.resource_type}</span>
                    <span className={`rounded px-2 py-0.5 text-xs ${
                      r.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      r.status === 'resolved' ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{r.reason}</p>
                  {r.reporter_email && (
                    <p className="text-xs text-muted-foreground">By {r.reporter_email}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(r.created_at)}
                  </p>
                </div>
              ))}
              {logs.length === 0 && <p className="text-sm text-muted-foreground">No reports</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium">Action</th>
                    <th className="pb-3 text-left text-sm font-medium">Resource</th>
                    <th className="pb-3 text-left text-sm font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs as Array<{ action: string; resource_type?: string; created_at: string }>).map((log, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 text-sm">{log.action}</td>
                      <td className="py-3 text-sm">{log.resource_type || '-'}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="py-8 text-sm text-muted-foreground text-center">No activity logs</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
