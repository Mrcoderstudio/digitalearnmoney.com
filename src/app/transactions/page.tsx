import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { UserShell } from "@/components/user/UserShell";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function TransactionsPage() {
  const session = await getSession();

  if (!session || !session.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Please login first</p>
          <Link href="/login" className="mt-4 inline-block text-[#00D4FF] hover:underline">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, session.user.id))
    .orderBy(desc(transactions.createdAt));

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit": return "text-green-500";
      case "withdrawal": return "text-red-500";
      case "reward": return "text-[#00D4FF]";
      case "referral": return "text-blue-500";
      default: return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit": return "⬇️";
      case "withdrawal": return "⬆️";
      case "reward": return "⭐";
      case "referral": return "👥";
      default: return "📝";
    }
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-sm text-gray-400">View all your deposits, withdrawals, and rewards</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e3a66] bg-[#0f213d]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1e3a66]">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">Type</th>
              <th className="px-4 py-3 text-left text-slate-400">Description</th>
              <th className="px-4 py-3 text-right text-slate-400">Amount</th>
              <th className="px-4 py-3 text-right text-slate-400">Status</th>
              <th className="px-4 py-3 text-right text-slate-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {userTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No transactions yet.
                  <Link href="/deposit" className="ml-2 text-[#00D4FF] hover:underline">
                    Make a deposit
                  </Link>
                </td>
              </tr>
            ) : (
              userTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-[#1e3a66]/50 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(tx.type)}</span>
                      <span className="capitalize text-white">{tx.type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{tx.description || "-"}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${getTypeColor(tx.type)}`}>
                    {Number(tx.amount) > 0 ? "+" : ""}
                    {Number(tx.amount).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      tx.status === "completed"
                        ? "bg-green-500/20 text-green-500"
                        : tx.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-400">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return <UserShell username={session.user.username}>{content}</UserShell>;
}