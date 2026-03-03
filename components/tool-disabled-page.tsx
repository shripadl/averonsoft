import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Ban } from 'lucide-react'

interface ToolDisabledPageProps {
  toolName: string
}

export function ToolDisabledPage({ toolName }: ToolDisabledPageProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Ban className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>This tool is not available</CardTitle>
          <CardDescription>
            {toolName} has been temporarily disabled. Please check back later or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button className="w-full">Back to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
