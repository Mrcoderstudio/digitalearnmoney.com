interface AccountSummaryProps {
  totalInvested: number;
  totalWithdrawn: number;
  totalPayout: number;
  totalReferral: number;
  pendingDeposit: number;
  pendingWithdrawal: number;
  teamCount: number;
  teamInvest: number;
}

export function AccountSummary({
  totalInvested,
  totalWithdrawn,
  totalPayout,
  totalReferral,
  pendingDeposit,
  pendingWithdrawal,
  teamCount,
  teamInvest,
}: AccountSummaryProps) {
  const items = [
    { label: "TOTAL INVESTED", value: totalInvested, icon: "💰" },
    { label: "WITHDRAWAL", value: totalWithdrawn, icon: "💸" },
    { label: "PAYOUT", value: totalPayout, icon: "📤" },
    { label: "REFER BONUS", value: totalReferral, icon: "👥" },
    { label: "PENDING DEPOSIT", value: pendingDeposit, icon: "⏳" },
    { label: "PENDING WITHDRAWAL", value: pendingWithdrawal, icon: "⏳" },
    { label: "TEAM", value: `${teamCount} users`, icon: "👤" },
    { label: "TEAM INVEST", value: teamInvest, icon: "📊" },
  ];

  return (
    <div className="rounded-xl bg-[#0f213d] p-6 border border-[#1e3a66]">
      <h3 className="mb-4 font-semibold text-white">Account Summary</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#1e3a66] bg-[#0a1628] p-3 text-center transition hover:bg-[#0f213d]"
          >
            <p className="text-sm text-slate-400">{item.icon} {item.label}</p>
            <p className="text-lg font-bold text-white">
              {typeof item.value === "number" ? `Rs. ${item.value.toFixed(0)}` : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}