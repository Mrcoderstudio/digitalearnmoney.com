import Link from "next/link";
import Logo from "@/components/common/Logo";
import { MessageCircle, Shield, Zap, Lock, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#070e1a] border-t border-[#1e3a66] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Logo />
            <p className="text-xs leading-relaxed text-slate-400">
              The premier automated daily earnings ecosystem. High yield 30-day investment plans with instant daily profit distribution and instant local withdrawals.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-xs text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-1 rounded-full border border-[#00D4FF]/20">
                <Zap className="w-3.5 h-3.5" /> 24/7 Automated
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded-full border border-[#FFD700]/20">
                <Shield className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/plans" className="hover:text-[#00D4FF] transition-colors">
                  All Investment Plans
                </Link>
              </li>
              <li>
                <Link href="/deposit" className="hover:text-[#00D4FF] transition-colors">
                  Deposit Funds
                </Link>
              </li>
              <li>
                <Link href="/withdrawal" className="hover:text-[#00D4FF] transition-colors">
                  Instant Withdrawal
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-[#00D4FF] transition-colors">
                  Referral Program (10% + 2%)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#00D4FF] transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Support & Community</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/support" className="hover:text-[#00D4FF] transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link href="/whatsapp" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Official WhatsApp Channel
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Working Hours: 24/7 Automated</span>
              </li>
              <li>
                <span className="text-slate-500">Min. Deposit: 140 PKR</span>
              </li>
              <li>
                <span className="text-slate-500">Min. Withdrawal: 30 PKR</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Supported Methods</h4>
            <p className="text-xs text-slate-400">
              Direct and frictionless transactions via Pakistan&apos;s leading payment networks:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-red-950/40 text-red-400 border border-red-800/40 rounded-lg">
                JazzCash
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded-lg">
                Easypaisa
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-950/40 text-cyan-400 border border-blue-800/40 rounded-lg">
                All Banks / Raast
              </span>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-bit Encrypted Banking</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1e3a66]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Digital Earn Money. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/support" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/support" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/support" className="hover:text-slate-300">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
