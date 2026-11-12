import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AGS Workspace</h1>
        <p className="text-gray-600 mb-8">Aluminium Glass Solutions – Central Workspace</p>
        
        <div className="space-y-4">
          <Link href="/jobs" className="block w-full bg-blue-600 text-white text-center py-4 rounded-lg font-medium">
            My Jobs
          </Link>
          <Link href="/report" className="block w-full bg-green-600 text-white text-center py-4 rounded-lg font-medium">
            Report Progress
          </Link>
          <Link href="/request" className="block w-full bg-orange-600 text-white text-center py-4 rounded-lg font-medium">
            Request Stock / Tools
          </Link>
        </div>
      </div>
    </main>
  )
}
