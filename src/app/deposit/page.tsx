import { DepositForm } from "./DepositForm";
import { UserShell } from "@/components/user/UserShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DepositPage() {
  const session = await getServerSession(authOptions);

  const content = (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Make a Deposit</h1>
        <p className="text-xs text-slate-400 mt-1">
          Enter amount, pay via Easypaisa, and upload the receipt for verification.
        </p>
      </div>
      <DepositForm />
    </div>
  );

  return session ? (
    <UserShell username={session.user?.username || "User"}>{content}</UserShell>
  ) : (
    content
  );
}
