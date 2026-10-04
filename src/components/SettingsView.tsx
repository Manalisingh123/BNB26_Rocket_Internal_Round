import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

interface SettingsViewProps {
  inactivityCadenceDays: number;
  challengeWindowHours: number;
  onUpdatePolicy: (cadenceDays: number, challengeHours: number) => void;
  onResetVaultDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  inactivityCadenceDays,
  challengeWindowHours,
  onUpdatePolicy,
  onResetVaultDemo
}) => {
  const [cadence, setCadence] = useState(inactivityCadenceDays);
  const [challengeHours, setChallengeHours] = useState(challengeWindowHours);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePolicy(cadence, challengeHours);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-12">
      <div className="border-b border-[#DED9CE] pb-6 space-y-2">
        <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
          Configuration
        </div>
        <h1 className="font-serif text-4xl text-[#242421] font-normal">Settings</h1>
        <p className="text-sm text-[#77736A]">
          Manage your vault check-in cadence, post-quorum challenge period, and local browser archive storage.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-[#242421] border-b border-[#DED9CE] pb-2">
            Account & Custody Identity
          </h2>
          <div className="divide-y divide-[#DED9CE] text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-[#77736A]">Vault Owner</span>
              <span className="font-medium text-[#242421]">Julian Vance-Sterling</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#77736A]">Designated Beneficiary</span>
              <span className="text-[#242421]">Hannah Vance</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-[#242421] border-b border-[#DED9CE] pb-2">
            Timing & Recovery Policy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-2">
                Owner Check-In Cadence
              </label>
              <select
                value={cadence}
                onChange={(e) => setCadence(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421]"
              >
                <option value={30}>Every 30 Days</option>
                <option value={60}>Every 60 Days</option>
                <option value={90}>Every 90 Days (Standard)</option>
                <option value={180}>Every 180 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-2">
                Post-Quorum Challenge Window
              </label>
              <select
                value={challengeHours}
                onChange={(e) => setChallengeHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421]"
              >
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (3 Days · Standard)</option>
                <option value={168}>168 Hours (7 Days)</option>
              </select>
            </div>
          </div>
        </section>

        <div className="pt-2 flex items-center justify-between">
          <div>
            {savedNotice && (
              <span className="inline-flex items-center gap-2 text-xs font-mono text-[#30483B]">
                <Check className="w-4 h-4" />
                <span>Saved to local vault policy</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#242421] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#30483B] transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Reset Local Storage State */}
      <section className="border-t border-[#DED9CE] pt-8 space-y-3">
        <h2 className="font-serif text-xl text-[#242421]">
          Local Browser Persistence
        </h2>
        <p className="text-xs text-[#77736A] leading-relaxed">
          All encrypted records, guardian approvals, recovery nonces, and released key shares are persisted automatically in your browser’s local storage across page refreshes.
        </p>
        <button
          type="button"
          onClick={onResetVaultDemo}
          className="px-4 py-2 border border-[#DED9CE] text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] hover:border-[#242421] inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Archive to Initial Seed State</span>
        </button>
      </section>
    </div>
  );
};
