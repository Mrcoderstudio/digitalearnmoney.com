import { getPlans, getSettings } from "@/lib/data";
import { DepositForm } from "./DepositForm";
import { UserShell } from "@/components/user/UserShell";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  const [plans, settings] = await Promise.all([getPlans(), getSettings()]);
  const session = await getSession();

  const plansData = plans.map((p) => ({
    id: p.id,
    name: p.name,
    amount: p.amount,
    dailyProfit: p.dailyProfit,
    totalProfit: p.totalProfit,
  }));

  const content = (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Make a Deposit</h1>
        <p className="text-xs text-slate-400 mt-1">
          Enter amount, pay via Easypaisa, and upload the receipt for verification.
        </p>
      </div>

      <DepositForm plans={plansData} />
    </div>
  );

  return session ? (
    <UserShell username={session.user?.username || "User"}>{content}</UserShell>
  ) : (
    content
  );
}