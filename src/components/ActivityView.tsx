import React, { useState } from 'react';
import { AuditEvent } from '../types/heirloom';
import { ArchivalStamp } from './ArchivalSeal';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ActivityViewProps {
  events: AuditEvent[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ events }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const categories = ['ALL', 'Preservation', 'Check-In', 'Recovery', 'Quorum', 'Safety Layer'];

  const filteredEvents = events.filter(
    (e) => selectedCategory === 'ALL' || e.category === selectedCategory
  );

  return (
    <div className="space-y-12">
      {/* Calm Header */}
      <div className="border-b border-[#DED9CE] pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
            Chronological Audit Trail
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#242421]">
            Archive Ledger
          </h1>
          <p className="text-base text-[#77736A] leading-relaxed">
            A human-readable record of every sealed deposit, owner check-in, guardian decision, challenge window, and key share release.
          </p>
        </div>

        <div className="text-xs font-mono text-[#77736A] tabular-nums">
          {filteredEvents.length} Entries
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#242421] text-[#F7F4ED]'
                : 'bg-[#EFECE4]/60 text-[#77736A] hover:text-[#242421]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Readable Archive Ledger Rows */}
      <div className="border-t border-b border-[#DED9CE] divide-y divide-[#DED9CE]">
        {filteredEvents.map((ev) => {
          const isExpanded = expandedEventId === ev.id;
          return (
            <div key={ev.id} className="py-6 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#77736A] tabular-nums">
                    <span>{ev.timestamp}</span>
                    <span>·</span>
                    <span className="text-[#242421] font-medium">{ev.actor}</span>
                    <span>({ev.actorRole})</span>
                    {ev.assetRef && (
                      <>
                        <span>·</span>
                        <span>{ev.assetRef}</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-serif text-2xl text-[#242421]">{ev.actionTitle}</h2>
                  <p className="text-sm text-[#77736A] leading-relaxed">{ev.explanation}</p>
                </div>

                <div className="flex items-center gap-4 self-start lg:self-center shrink-0">
                  <ArchivalStamp state={ev.stateAfter} size="sm" />
                  <button
                    onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                    className="text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Details</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-[#EFECE4]/50 border border-[#DED9CE] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[#77736A]">
                  <div>
                    <div className="text-[10px] uppercase">Recovery Nonce</div>
                    <div className="text-[#242421] mt-0.5">{ev.epochRef}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[10px] uppercase">Event Commitment Hash</div>
                    <div className="text-[#242421] mt-0.5 break-all">{ev.txHash}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
