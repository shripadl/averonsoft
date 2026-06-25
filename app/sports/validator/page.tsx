import { ValidationReportClient } from '@/components/sports/ValidationReportClient'
import { SportsShell } from '@/components/sports/SportsShell'
import { getValidationReport } from '@/lib/sports-engine/validation/get-validation-report'

export default async function ValidatorPage() {
  const report = await getValidationReport('7d')

  return (
    <SportsShell
      title="Prediction Validator"
      subtitle="Track how prior-day model outputs compare to finished match results. Reports cover the last 7 or 30 days; export CSV for longer history."
      icon="✓"
      disclaimerCompact
    >
      <ValidationReportClient initial={report} />
    </SportsShell>
  )
}
