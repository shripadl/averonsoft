import { requireAdmin } from '@/lib/admin'
import { PracticeRefundsClient } from '@/components/admin/PracticeRefundsClient'

export default async function PracticeRefundsPage() {
  await requireAdmin('full')
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Practice Refund Decisions</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review refunded payments and choose revoke vs allow on a case-by-case basis.
      </p>
      <div className="mt-8">
        <PracticeRefundsClient />
      </div>
    </div>
  )
}
