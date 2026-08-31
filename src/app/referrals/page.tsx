import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, referrals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { UserShell } from "@/components/user/UserShell";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ReferralShare } from "@/components/referral/ReferralShare";

export default async function ReferralsPage() {
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

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const userReferrals = await db
    .select({
      id: referrals.id,
      referredId: referrals.referredId,
      level: referrals.level,
      commission: referrals.commission,
      status: referrals.status,
      paidAt: referrals.paidAt,
      createdAt: referrals.createdAt,
      username: users.username,
      email: users.email,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, session.user.id))
    .orderBy(desc(referrals.createdAt));

  const totalCommission = userReferrals.reduce(
    (sum, ref) => sum + Number(ref.commission),
    0
  );

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <p className="text-sm text-gray-400">
          Invite friends and earn commission on their deposits
        </p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#1e3a66] bg-[#0f213d] p-4 text-center">
          <p className="text-xs text-gray-400">Total Referrals</p>
          <p className="text-xl font-bold text-white">{userReferrals.length}</p>
        </div>
        <div className="rounded-xl border border-[#1e3a66] bg-[#0f213d] p-4 text-center">
          <p className="text-xs text-gray-400">Total Commission</p>
          <p className="text-xl font-bold text-[#00D4FF]">
            {totalCommission.toFixed(0)} PKR
          </p>
        </div>
        <div className="rounded-xl border border-[#1e3a66] bg-[#0f213d] p-4 text-center">
          <p className="text-xs text-gray-400">Commission Rate</p>
          <p className="text-xl font-bold text-[#FFD700]">10%</p>
        </div>
      </div>

      {/* Referral Link - Using Client Component */}
      <ReferralShare referralCode={user.referralCode} />

      {/* Referral History */}
      <div className="rounded-xl border border-[#1e3a66] bg-[#0f213d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e3a66]">
          <h3 className="text-sm font-semibold text-white">Referral History</h3>
        </div>
        {userReferrals.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">
            No referrals yet. Share your referral link to start earning!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e3a66] bg-[#0a1628]">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400">User</th>
                <th className="px-4 py-3 text-left text-slate-400">Level</th>
                <th className="px-4 py-3 text-right text-slate-400">Commission</th>
                <th className="px-4 py-3 text-right text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a66]/50">
              {userReferrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white">
                    {ref.username || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#00D4FF]/10 px-2 py-1 text-xs font-semibold text-[#00D4FF]">
                      Level {ref.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#FFD700]">
                    {Number(ref.commission).toFixed(0)} PKR
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      ref.status === "paid"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-400">
                    {formatDistanceToNow(new Date(ref.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return <UserShell username={session.user.username}>{content}</UserShell>;
}