export const dynamic = "force-dynamic";

import { auth, signOut } from "app/auth";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transaction Dashboard</h1>
            <p className="text-sm text-gray-600">
              Logged in as {session?.user?.email}
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100">
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Transactions</h2>
          <p className="mt-2 text-sm text-gray-500">
            No transactions yet. This is where your escrows will appear.
          </p>
        </section>

        <div className="mt-6">
          <Link
            href="#"
            className="inline-block rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-900"
          >
            + New Transaction (coming next)
          </Link>
        </div>
      </div>
    </main>
  );
}
