import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Wrench } from 'lucide-react'

interface ToolMaintenancePageProps {
  toolName: string
  customMessage?: string
}

export function ToolMaintenancePage({ toolName, customMessage }: ToolMaintenancePageProps) {
  const message =
    customMessage ||
    'We are performing scheduled maintenance on this tool. Please check back soon.'

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
            <Wrench className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <CardTitle>{toolName} is under maintenance</CardTitle>
          <CardDescription>{message}</CardDescription>
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
