import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function SupportPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Center</h1>
          <p className="text-sm text-gray-400">We're here to help you</p>
        </div>
        {session ? (
          <Link href="/dashboard" className="text-sm text-[#00D4FF] hover:underline">
            ← Back to Dashboard
          </Link>
        ) : (
          <Link href="/" className="text-sm text-[#00D4FF] hover:underline">
            ← Back to Home
          </Link>
        )}
      </div>

      {/* WhatsApp Channel Card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-xl font-bold text-white mb-2">Join Our WhatsApp Channel</h2>
          <p className="text-gray-400 mb-6">
            Get updates, announcements, and support directly on WhatsApp.
          </p>
          <a
            href="https://whatsapp.com/channel/0029VbE1E4jC6Zvj8sD3qU0U"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#128C7E]"
          >
            Join WhatsApp Channel →
          </a>
        </div>
      </div>
    </div>
  );
}