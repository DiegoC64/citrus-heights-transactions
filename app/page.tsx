import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Citrus Heights Transactions</h1>
        <p className="mt-3 text-gray-600">
          Transaction coordination portal for California escrows.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">Sign in</div>
            <div className="mt-1 text-sm text-gray-600">
              Access your transactions and timelines.
            </div>
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50"
          >
            <div className="font-semibold">Create account</div>
            <div className="mt-1 text-sm text-gray-600">
              Set up your admin login first.
            </div>
          </Link>

          <Link
            href="/protected"
            className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50 sm:col-span-2"
          >
            <div className="font-semibold">Dashboard (temporary)</div>
            <div className="mt-1 text-sm text-gray-600">
              This will become your transaction dashboard.
            </div>
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-500">
          Next up: build “New Transaction”, acceptance date timelines, and agent
          invites.
        </p>
      </div>
    </main>
  );
}
