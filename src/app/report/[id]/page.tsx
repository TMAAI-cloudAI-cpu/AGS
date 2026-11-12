import { Suspense } from 'react'
import ReportForm from './report-form'

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ReportForm />
    </Suspense>
  )
}
