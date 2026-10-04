import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArchivalStamp, SealedArchiveGraphic } from './ArchivalSeal';
import { smoothScrollToElement } from '../utils/smoothScroll';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface LandingPageProps {
  onEnterVault: () => void;
  onExploreRecoveryCase: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterVault,
  onExploreRecoveryCase
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [documentStage, setDocumentStage] = useState<'SEALED' | 'CHALLENGED' | 'AUTHORIZED'>(
    'SEALED'
  );

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    targetId: string
  ) => {
    e.preventDefault();
    smoothScrollToElement(targetId, 64, 760);
  };

  const revealProps = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.18 },
          transition: { duration: 0.65, ease: easeCurve, delay }
        };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242421] flex flex-col selection:bg-[#30483B] selection:text-[#F7F4ED]">
      {/* Strict 3-Zone Top Bar */}
      <header className="w-full border-b border-[#DED9CE] bg-[#F7F4ED]/95 backdrop-blur-[2px] sticky top-0 z-30">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <a
            href="#top"
            onClick={(e) => handleAnchorClick(e, 'top')}
            className="font-serif text-2xl tracking-[0.16em] uppercase font-normal text-[#242421] whitespace-nowrap cursor-pointer"
          >
            Heirloom
          </a>

          <nav className="hidden md:flex items-center gap-9 text-sm text-[#77736A]">
            <a
              href="#preserved-moment"
              onClick={(e) => handleAnchorClick(e, 'preserved-moment')}
              className="editorial-link hover:text-[#242421] whitespace-nowrap cursor-pointer"
            >
              The Right Moment
            </a>
            <a
              href="#trust-relationship"
              onClick={(e) => handleAnchorClick(e, 'trust-relationship')}
              className="editorial-link hover:text-[#242421] whitespace-nowrap cursor-pointer"
            >
              Trust Network
            </a>
            <a
              href="#safety-layer"
              onClick={(e) => handleAnchorClick(e, 'safety-layer')}
              className="editorial-link hover:text-[#242421] whitespace-nowrap cursor-pointer"
            >
              Recovery Safety
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onEnterVault}
              className="editorial-btn px-5 py-2.5 text-xs font-medium tracking-[0.14em] uppercase bg-[#242421] text-[#F7F4ED] hover:bg-[#30483B] whitespace-nowrap cursor-pointer"
            >
              Enter Private Archive
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION — Spacious, Asymmetric, Editorial */}
      <section
        id="top"
        className="max-w-[1240px] mx-auto w-full px-6 sm:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-[#DED9CE]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12 items-center">
          {/* Left 7 Columns: Emotional Centerpiece Typography */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeCurve }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-[#77736A]">
              <span>Private Digital Archive</span>
              <span className="text-[#B0925A]">·</span>
              <span>Accession Series 2026</span>
            </div>

            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-[74px] leading-[1.03] font-normal tracking-tight text-[#242421]"
              style={{ textWrap: 'balance' }}
            >
              Some things are worth keeping.
            </h1>

            <p className="font-serif text-xl sm:text-2xl text-[#77736A] leading-relaxed max-w-xl font-normal">
              A quiet place for the letters, instructions, and records that must remain strictly private today—yet reach the people you love when the right conditions are met.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-5">
              <button
                onClick={onEnterVault}
                className="editorial-btn px-7 py-4 bg-[#242421] text-[#F7F4ED] text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#30483B] inline-flex items-center gap-3 cursor-pointer whitespace-nowrap"
              >
                <span>Enter Your Archive</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => handleAnchorClick(e, 'preserved-moment')}
                className="editorial-btn px-6 py-4 border border-[#242421]/30 text-[#242421] text-xs font-medium tracking-[0.14em] uppercase hover:border-[#242421] inline-flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                <span>How It Works</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#77736A]" />
              </button>
            </div>

            {/* Subtle Archival Footnote + Direct Case Link */}
            <div className="pt-8 flex flex-wrap items-center justify-between gap-6 border-t border-[#DED9CE]/80 max-w-xl text-xs text-[#77736A]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest block text-[#B0925A]">
                  Folio Standard
                </span>
                <span className="font-serif italic text-base text-[#242421]">
                  Sealed in your browser, entrusted to three witnesses
                </span>
              </div>

              <button
                onClick={onExploreRecoveryCase}
                className="editorial-link font-mono text-[11px] uppercase tracking-[0.14em] text-[#242421] cursor-pointer whitespace-nowrap"
              >
                Inspect Case #14 →
              </button>
            </div>
          </motion.div>

          {/* Right 5 Columns: Tactile Preserved Digital Heirloom Manuscript */}
          <div className="lg:col-span-5">
            <SealedArchiveGraphic state="SEALED" />
          </div>
        </div>
      </section>

      {/* EDITORIAL SECTION 1: PRESERVED UNTIL THE RIGHT MOMENT (Interactive Document State Transition) */}
      <motion.section
        id="preserved-moment"
        {...revealProps(0)}
        className="max-w-[1240px] mx-auto w-full px-6 sm:px-10 py-24 lg:py-32 border-b border-[#DED9CE]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Editorial Prose & State Selector */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#77736A]">
                01 · The Discipline of Timing
              </div>
              <h2
                className="font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Preserved until the right moment.
              </h2>
              <p className="text-sm sm:text-base text-[#77736A] leading-relaxed pt-2">
                Digital inheritance fails at two dangerous extremes: access happening too early while you are still here, or access never happening at all. Heirloom holds your record in a calm, deliberate middle ground.
              </p>
            </div>

            {/* Interactive Three-State Selector */}
            <div className="border-t border-[#DED9CE] divide-y divide-[#DED9CE]">
              {[
                {
                  id: 'SEALED' as const,
                  num: 'I',
                  title: 'Sealed in Quiet Custody',
                  subtitle: 'During your lifetime',
                  desc: 'Your record is sealed before it ever leaves your browser. Neither Heirloom nor your guardians can read a single line.'
                },
                {
                  id: 'CHALLENGED' as const,
                  num: 'II',
                  title: 'Held in the 72-Hour Safety Window',
                  subtitle: 'When recovery is requested',
                  desc: 'Even after two guardians verify a request, the seal does not break immediately. A 72-hour window gives you time to return and re-seal the archive.'
                },
                {
                  id: 'AUTHORIZED' as const,
                  num: 'III',
                  title: 'Authorized for Your Successor',
                  subtitle: 'When conditions are fulfilled',
                  desc: 'Only after guardian consensus and an uncontested waiting period may the record be unsealed by your designated beneficiary.'
                }
              ].map((item) => {
                const active = documentStage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setDocumentStage(item.id)}
                    className={`w-full text-left py-5 transition-opacity duration-200 cursor-pointer group ${
                      active ? 'opacity-100' : 'opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs text-[#B0925A]">{item.num}.</span>
                        <h3 className="font-serif text-2xl text-[#242421]">{item.title}</h3>
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#77736A]">
                        {item.subtitle}
                      </span>
                    </div>
                    {active && (
                      <motion.p
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: easeCurve }}
                        className="mt-2.5 pl-6 text-sm text-[#77736A] leading-relaxed"
                      >
                        {item.desc}
                      </motion.p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 7 Columns: The Transitioning Archival Sheet */}
          <div className="lg:col-span-7 lg:pl-8">
            <div className="bg-[#EFECE4]/60 border border-[#DED9CE] p-8 sm:p-12">
              <div className="bg-[#FBF9F4] border border-[#D4CEC1] p-8 sm:p-10 space-y-8 shadow-[0_12px_32px_rgba(36,36,33,0.05)]">
                {/* Top Folio Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E5DFD3]">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#77736A]">
                      RECORD HLM-2026-001 · FAMILY TRUST DIRECTIVE
                    </div>
                    <div className="font-serif italic text-sm text-[#77736A]">
                      Designated Successor: Hannah Vance
                    </div>
                  </div>
                  <ArchivalStamp state={documentStage} size="md" />
                </div>

                {/* Middle Document Excerpt Changing Smoothly by State */}
                <div className="py-6 space-y-5 min-h-[210px] flex flex-col justify-center">
                  <div className="font-serif text-3xl text-[#242421]">
                    Primary Family Trust &amp; Sovereign Custody Directives
                  </div>

                  <AnimatePresence mode="wait">
                    {documentStage === 'SEALED' && (
                      <motion.div
                        key="stage-sealed"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.28, ease: easeCurve }}
                        className="space-y-4 py-2"
                      >
                        <p className="font-serif italic text-lg text-[#77736A]">
                          This manuscript is sealed under private custody. Its contents are withheld until two independent guardians attest and the 72-hour waiting period concludes.
                        </p>
                        <div className="space-y-2.5 pt-2" aria-hidden="true">
                          <div className="h-2.5 bg-[#EFECE4] border border-[#E5DFD3] w-11/12" />
                          <div className="h-2.5 bg-[#EFECE4] border border-[#E5DFD3] w-4/5" />
                          <div className="h-2.5 bg-[#EFECE4] border border-[#E5DFD3] w-9/12" />
                        </div>
                      </motion.div>
                    )}

                    {documentStage === 'CHALLENGED' && (
                      <motion.div
                        key="stage-challenged"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.28, ease: easeCurve }}
                        className="space-y-4 border-l-2 border-[#9C6B30] pl-5 bg-[#F7EFE4]/50 p-4"
                      >
                        <div className="text-xs font-mono uppercase tracking-wider text-[#9C6B30]">
                          Recovery Case #14 · 46 Hours Remaining in Safety Window
                        </div>
                        <p className="font-serif text-lg text-[#242421] leading-relaxed">
                          Dr. Clara Vance and Marcus Sterling have attested to Hannah Vance’s petition. The document remains sealed for 46 additional hours so the owner can cancel if the request was premature.
                        </p>
                      </motion.div>
                    )}

                    {documentStage === 'AUTHORIZED' && (
                      <motion.div
                        key="stage-authorized"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.28, ease: easeCurve }}
                        className="space-y-4 border-l-2 border-[#30483B] pl-5 bg-[#E8EFEA]/40 p-4"
                      >
                        <div className="text-xs font-mono uppercase tracking-wider text-[#30483B]">
                          Unsealed for Designated Beneficiary
                        </div>
                        <p className="font-serif italic text-xl text-[#242421] leading-relaxed">
                          “My dear Hannah, if you are reading this page, the guardian quorum and waiting period have completed as intended. Everything in this folio was prepared so you would never have to guess where our records stand…”
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Folio Signature */}
                <div className="pt-5 border-t border-[#E5DFD3] flex flex-wrap items-center justify-between gap-4 text-xs text-[#77736A]">
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    {documentStage === 'SEALED' && 'STATE I · ENCLOSURE INTACT'}
                    {documentStage === 'CHALLENGED' && 'STATE II · AWAITING EXPIRY OF SAFETY WINDOW'}
                    {documentStage === 'AUTHORIZED' && 'STATE III · LAWFULLY RECONSTRUCTED'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setDocumentStage(
                          documentStage === 'SEALED'
                            ? 'CHALLENGED'
                            : documentStage === 'CHALLENGED'
                            ? 'AUTHORIZED'
                            : 'SEALED'
                        )
                      }
                      className="editorial-link font-mono text-[11px] uppercase tracking-wider text-[#242421] hover:text-[#30483B] cursor-pointer"
                    >
                      Step to Next State →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* EDITORIAL SECTION 2: DELICATE ARCHIVAL TRUST DIAGRAM */}
      <motion.section
        id="trust-relationship"
        {...revealProps(0)}
        className="max-w-[1240px] mx-auto w-full px-6 sm:px-10 py-24 lg:py-32 border-b border-[#DED9CE]"
      >
        <div className="max-w-2xl space-y-3 mb-16">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#77736A]">
            02 · Human Custody, Divided Gently
          </div>
          <h2
            className="font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            Entrusted to three witnesses. Controlled by no single hand.
          </h2>
          <p className="text-sm sm:text-base text-[#77736A] leading-relaxed pt-2">
            Heirloom separates the private record from the authority to unlock it. Your three guardians—an estate counsel, a sibling, a trusted archivist—never see your files, yet any two can verify when the time has come.
          </p>
        </div>

        {/* Delicate Editorial Ledger Diagram */}
        <div className="border-t border-b border-[#DED9CE] py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Depositor / Owner */}
            <motion.div {...revealProps(0.05)} className="lg:col-span-3 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#77736A]">
                I · The Depositor
              </div>
              <div className="font-serif text-3xl text-[#242421]">Julian Vance-Sterling</div>
              <p className="text-xs text-[#77736A] leading-relaxed">
                Preserves the manuscript and retains unconditional authority to re-seal the archive at any moment.
              </p>
            </motion.div>

            {/* Thin Horizontal Thread + Three Witnesses */}
            <motion.div
              {...revealProps(0.12)}
              className="lg:col-span-6 border-y lg:border-y-0 lg:border-x border-[#DED9CE] py-8 lg:py-2 lg:px-10 space-y-6"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-[#B0925A]">
                <span>II · The Three Witnesses</span>
                <span>2-of-3 Concurrence Required</span>
              </div>

              <div className="divide-y divide-[#DED9CE]">
                {[
                  {
                    name: 'Dr. Clara Vance',
                    role: 'Primary Legal Fiduciary · Zurich',
                    note: 'Holds Seal Portion I'
                  },
                  {
                    name: 'Marcus Sterling',
                    role: 'Brother & Executor · London',
                    note: 'Holds Seal Portion II'
                  },
                  {
                    name: 'Elena Rostova',
                    role: 'Independent Archivist · Geneva',
                    note: 'Holds Seal Portion III'
                  }
                ].map((witness) => (
                  <div
                    key={witness.name}
                    className="py-3.5 flex items-baseline justify-between gap-4"
                  >
                    <div>
                      <span className="font-serif text-xl text-[#242421]">{witness.name}</span>
                      <span className="block text-xs text-[#77736A]">{witness.role}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#30483B] shrink-0">
                      {witness.note}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Successor / Beneficiary */}
            <motion.div {...revealProps(0.2)} className="lg:col-span-3 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B0925A]">
                III · The Successor
              </div>
              <div className="font-serif text-3xl text-[#242421]">Hannah Vance</div>
              <p className="text-xs text-[#77736A] leading-relaxed">
                Receives the unsealed record only after two witnesses concur and the 72-hour safety window concludes quietly.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* EDITORIAL SECTION 3: WHY IT IS NOT A DEAD-MAN SWITCH */}
      <motion.section
        id="safety-layer"
        {...revealProps(0)}
        className="max-w-[1240px] mx-auto w-full px-6 sm:px-10 py-24 lg:py-28 border-b border-[#DED9CE]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#77736A]">
              03 · Reversible by Design
            </div>
            <h2
              className="mt-3 font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              A recovery case can always be challenged, halted, and re-sealed.
            </h2>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <motion.div {...revealProps(0.08)} className="space-y-2.5 border-t border-[#242421]/30 pt-5">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[#30483B]">
                Owner Return &amp; Re-Sealing
              </div>
              <h3 className="font-serif text-2xl text-[#242421]">
                Checking in closes any active case immediately.
              </h3>
              <p className="text-sm text-[#77736A] leading-relaxed">
                If you are merely traveling or unreachable, a single check-in cancels the recovery case, invalidates past guardian approvals so they can never be reused, and returns your manuscript to sealed custody.
              </p>
            </motion.div>

            <motion.div {...revealProps(0.16)} className="space-y-2.5 border-t border-[#242421]/30 pt-5">
              <div className="font-mono text-[11px] uppercase tracking-widest text-[#9C6B30]">
                Guardian Objection
              </div>
              <h3 className="font-serif text-2xl text-[#242421]">
                Any witness can pause a premature release.
              </h3>
              <p className="text-sm text-[#77736A] leading-relaxed">
                During the 72-hour waiting period, if your third guardian knows you are safe, they can record a formal objection—halting automatic release before a single page is disclosed.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* QUIET CLOSING INVITATION */}
      <motion.section
        {...revealProps(0)}
        className="max-w-[1240px] mx-auto w-full px-6 sm:px-10 py-24"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-3 max-w-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#B0925A]">
              Private Archival Custody
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-tight">
              Begin your archive.
            </h2>
            <p className="font-serif text-xl text-[#77736A]">
              Preserve a record in your browser, or step inside Recovery Case #14 to experience how the archive protects what matters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              onClick={onEnterVault}
              className="editorial-btn px-7 py-4 bg-[#242421] text-[#F7F4ED] text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#30483B] inline-flex items-center gap-3 cursor-pointer whitespace-nowrap"
            >
              <span>Enter Private Archive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreRecoveryCase}
              className="editorial-btn px-6 py-4 border border-[#242421] text-[#242421] text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#242421] hover:text-[#F7F4ED] cursor-pointer whitespace-nowrap"
            >
              Inspect Case File #14
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
