import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { WithdrawalForm } from "./WithdrawalForm";
import { UserShell } from "@/components/user/UserShell";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WithdrawalPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  const settings = await getSettings();
  const minWithdrawal = Number(settings.minWithdrawal) || 100;

  const content = (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Withdraw Funds</h1>
        <p className="text-xs text-slate-400 mt-1">
          Withdraw your earnings to your Easypaisa account. Minimum withdrawal is <span className="text-[#FFD700] font-bold">{minWithdrawal} PKR</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WithdrawalForm balance={session.user.balance} minWithdrawal={minWithdrawal} />
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#132a4e] to-[#0f213d] border border-[#00D4FF]/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-[#FFD700]">
              <span className="text-sm font-bold">📌 Important</span>
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li>Minimum withdrawal: <span className="text-[#FFD700] font-bold">{minWithdrawal} PKR</span></li>
              <li>Withdrawals are processed manually</li>
              <li>Approval usually takes 15-30 minutes</li>
              <li>Make sure your account details are correct</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <UserShell username={session.user.username}>{content}</UserShell>
  );
}
