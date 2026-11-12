import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a1c1e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Image
            src="/ags-logo.png"
            alt="AGS Aluminium Glass Services"
            width={220}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold text-white tracking-wide">Workspace</h1>
        </div>

        <div className="space-y-4">
          <Link
            href="/jobs"
            className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-medium shadow-lg hover:bg-gray-100 transition"
          >
            My Jobs
          </Link>
          <Link
            href="/jobs?action=report"
            className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-medium shadow-lg hover:bg-gray-100 transition"
          >
            Report Progress
          </Link>
          <Link
            href="/request"
            className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-medium shadow-lg hover:bg-gray-100 transition"
          >
            Request Stock / Tools
          </Link>
          <Link
            href="/sage"
            className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-medium shadow-lg hover:bg-gray-100 transition"
          >
            Sage
          </Link>
          <Link
            href="/lee"
            className="block w-full bg-white text-gray-900 text-center py-4 rounded-xl font-medium shadow-lg hover:bg-gray-100 transition"
          >
            Lee
          </Link>
        </div>
      </div>
    </main>
  )
}
