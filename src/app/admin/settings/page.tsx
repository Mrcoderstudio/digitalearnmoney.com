"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Settings {
  siteName: string;
  easypaisaName: string;
  easypaisaNumber: string;
  minDeposit: number;
  minWithdrawal: number;
  referralLevels: {
    level1: number;
    level2: number;
  };
  whatsappNumber: string;
  whatsappChannelLink: string;
}

const DEFAULT_SETTINGS: Settings = {
  siteName: "Digital Earn Money",
  easypaisaName: "Mohammed Younas",
  easypaisaNumber: "03292993220",
  minDeposit: 150,
  minWithdrawal: 30,
  referralLevels: { level1: 10, level2: 2 },
  whatsappNumber: "03276376052",
  whatsappChannelLink: "https://whatsapp.com/channel/0029VbE1E4jC6Zvj8sD3qU0U",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateReferralLevel = (level: keyof Settings["referralLevels"], value: number) => {
    setSettings((prev) => ({
      ...prev,
      referralLevels: { ...prev.referralLevels, [level]: value },
    }));
  };

  if (fetching) {
    return <div className="text-center py-10 text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#0f213d] p-6 rounded-xl border border-[#1e3a66]">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => updateSetting("siteName", e.target.value)}
            className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
          />
        </div>

        {/* Easypaisa Details */}
        <div className="border-t border-[#1e3a66] pt-4">
          <h3 className="font-bold text-[#00D4FF] mb-3">💳 Easypaisa Account Details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">Account Name</label>
              <input
                type="text"
                value={settings.easypaisaName}
                onChange={(e) => updateSetting("easypaisaName", e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Account Number</label>
              <input
                type="text"
                value={settings.easypaisaNumber}
                onChange={(e) => updateSetting("easypaisaNumber", e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Min Deposit & Min Withdrawal */}
        <div className="border-t border-[#1e3a66] pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">Min Deposit (PKR)</label>
              <input
                type="number"
                value={settings.minDeposit}
                onChange={(e) => updateSetting("minDeposit", Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Min Withdrawal (PKR)</label>
              <input
                type="number"
                value={settings.minWithdrawal}
                onChange={(e) => updateSetting("minWithdrawal", Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Referral Levels */}
        <div className="border-t border-[#1e3a66] pt-4">
          <h3 className="font-bold text-[#FFD700] mb-3">👥 Referral Commission (%)</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">Level 1</label>
              <input
                type="number"
                value={settings.referralLevels.level1}
                onChange={(e) => updateReferralLevel("level1", Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Level 2</label>
              <input
                type="number"
                value={settings.referralLevels.level2}
                onChange={(e) => updateReferralLevel("level2", Number(e.target.value))}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Details */}
        <div className="border-t border-[#1e3a66] pt-4">
          <h3 className="font-bold text-[#25D366] mb-3">📱 WhatsApp</h3>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => updateSetting("whatsappNumber", e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">WhatsApp Channel Link</label>
              <input
                type="text"
                value={settings.whatsappChannelLink}
                onChange={(e) => updateSetting("whatsappChannelLink", e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#0a1628] border border-[#1e3a66] px-4 py-2 text-white focus:border-[#00D4FF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#00D4FF] py-3 font-semibold text-[#0a1628] hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}