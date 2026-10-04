import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ProtectionState } from '../types/heirloom';

interface ArchivalStampProps {
  state: ProtectionState | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ArchivalStamp: React.FC<ArchivalStampProps> = ({ state, size = 'sm' }) => {
  const getStampStyles = (s: string) => {
    switch (s) {
      case 'SEALED':
      case 'RE-SEALED':
      case 'CANCELLED_RESEALED':
      case 'PRESERVED':
        return 'text-[#30483B] border-[#30483B]/45 bg-[#E8EFEA]/70';
      case 'PROTECTED':
      case 'VERIFIED':
      case 'GUARDIAN_REVIEW':
        return 'text-[#242421] border-[#242421]/35 bg-[#EFECE4]';
      case 'CHALLENGED':
      case 'QUORUM 2/3':
      case 'CASE OPENED':
      case 'REQUESTED':
      case 'CHALLENGE_PERIOD':
        return 'text-[#9C6B30] border-[#9C6B30]/55 bg-[#F7EFE4]';
      case 'OBJECTED':
      case 'OBJECTION FILED':
        return 'text-[#7A3236] border-[#7A3236]/55 bg-[#F5E8E9]';
      case 'AUTHORIZED':
      case 'RELEASED':
      case 'SHARE RELEASED':
        return 'text-[#30483B] border-[#B0925A] bg-[#F5EFE2]';
      default:
        return 'text-[#77736A] border-[#DED9CE] bg-[#EFECE4]/60';
    }
  };

  const formatLabel = (s: string) => {
    if (s === 'CANCELLED_RESEALED') return 'RE-SEALED';
    if (s === 'CHALLENGE_PERIOD') return 'CHALLENGED';
    if (s === 'GUARDIAN_REVIEW') return 'IN REVIEW';
    return s.replace(/_/g, ' ');
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-[0.12em]',
    md: 'text-[11px] px-2.5 py-1 tracking-[0.14em]',
    lg: 'text-xs px-3.5 py-1.5 tracking-[0.16em]'
  };

  return (
    <span
      className={`font-mono uppercase font-medium inline-flex items-center gap-1.5 border select-none whitespace-nowrap shrink-0 transition-colors duration-200 ${getStampStyles(
        state
      )} ${sizeStyles[size]}`}
    >
      <span className="w-1.5 h-1.5 bg-current opacity-75 shrink-0" />
      {formatLabel(state)}
    </span>
  );
};

/**
 * Tactile, editorial Archival Dossier & Sealed Letter composition with subtle entrance motion.
 */
export const SealedArchiveGraphic: React.FC<{
  state?: 'SEALED' | 'CHALLENGED' | 'OBJECTED' | 'AUTHORIZED' | 'RELEASED';
  className?: string;
}> = ({ state = 'SEALED', className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  const isAuthorized = state === 'AUTHORIZED' || state === 'RELEASED';
  const isChallenged = state === 'CHALLENGED';
  const isObjected = state === 'OBJECTED';

  const easeCurve: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeCurve, delay: 0.1 }}
      className={`relative mx-auto w-full max-w-[460px] pt-4 pb-6 px-3 sm:px-5 ${className}`}
    >
      {/* Partially visible second archival folio sheet underneath */}
      <motion.div
        aria-hidden="true"
        initial={shouldReduceMotion ? false : { opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: -1.75 }}
        transition={{ duration: 0.85, ease: easeCurve, delay: 0.2 }}
        className="absolute inset-x-6 top-2 bottom-8 bg-[#EFECE4] border border-[#D5CFC2] shadow-[0_8px_24px_rgba(36,36,33,0.04)] pointer-events-none flex flex-col justify-between p-6"
      >
        <div className="flex items-center justify-between text-[9px] font-mono tracking-[0.18em] text-[#77736A]/70 uppercase">
          <span>FOLIO II · ANNEX OF CUSTODY</span>
          <span>14 JAN 2026</span>
        </div>
        <div className="text-[9px] font-mono tracking-[0.16em] text-[#77736A]/60 uppercase">
          SEALED ENCLOSURE · DO NOT OPEN PREMATURELY
        </div>
      </motion.div>

      {/* Third subtle backing card on the right edge */}
      <motion.div
        aria-hidden="true"
        initial={shouldReduceMotion ? false : { opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 1.15 }}
        transition={{ duration: 0.85, ease: easeCurve, delay: 0.26 }}
        className="absolute inset-x-7 top-6 bottom-3 bg-[#F3EFE6] border border-[#DED9CE] pointer-events-none"
      />

      {/* Primary Preserved Manuscript / Sealed Letter Sheet */}
      <div className="relative bg-[#FBF9F4] border border-[#D4CEC1] shadow-[0_18px_42px_-12px_rgba(36,36,33,0.09)] p-7 sm:p-9">
        {/* Fine inner archival double-border frame */}
        <div className="border border-[#E5DFD3] p-6 sm:p-7 relative">
          {/* Subtle folded top-right paper corner */}
          <div
            aria-hidden="true"
            className="w-6 h-6 bg-[#EFECE4] border-l border-b border-[#D4CEC1] absolute top-0 right-0"
          />

          {/* Top Archival Header Metadata */}
          <div className="flex items-center justify-between gap-2 pb-5 border-b border-[#E5DFD3]">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#77736A]">
                PRIVATE ARCHIVE · HLM-2026-001
              </div>
              <div className="text-[11px] font-serif italic text-[#77736A]">
                Deposited at Zurich · 14 January 2026
              </div>
            </div>

            {/* Understated physical ink stamp */}
            <div className="border border-[#30483B]/45 px-2 py-0.5 text-[9px] font-mono tracking-[0.2em] uppercase text-[#30483B] -rotate-2 select-none">
              {isAuthorized ? 'AUTHORIZED' : isObjected ? 'HELD' : 'PRESERVED'}
            </div>
          </div>

          {/* Editorial Manuscript Title & Handwritten-Style Epigraph */}
          <div className="py-7 space-y-4 text-center">
            <div className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#B0925A]">
              DIRECTIVE OF SUCCESSION &amp; CUSTODY
            </div>

            <h3 className="font-serif text-2xl sm:text-[28px] font-normal text-[#242421] leading-snug px-2">
              Letters, Sovereign Instructions &amp; Family Provenance
            </h3>

            <p className="font-serif italic text-base text-[#77736A] max-w-xs mx-auto leading-relaxed">
              “For Hannah — to be unsealed only when the time is right.”
            </p>

            {/* Delicate redacted / sealed manuscript lines */}
            <div className="pt-3 max-w-[240px] mx-auto space-y-2 opacity-45" aria-hidden="true">
              <div className="h-[1px] bg-[#77736A]/60 w-full" />
              <div className="h-[1px] bg-[#77736A]/50 w-5/6 mx-auto" />
              <div className="h-[1px] bg-[#77736A]/40 w-4/6 mx-auto" />
            </div>
          </div>

          {/* Central Binding Thread & Brass Seal */}
          <div className="relative py-5 flex flex-col items-center justify-center">
            {/* Horizontal thin brass binding cord with 3 subtle guardian knots */}
            <div className="w-full flex items-center justify-between relative">
              <motion.div
                initial={shouldReduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.75, ease: easeCurve, delay: 0.3 }}
                className="w-full h-[1px] bg-[#B0925A]/55 absolute inset-x-0 top-1/2 -translate-y-1/2 origin-center"
              />

              {/* Left Guardian Witness Knot */}
              <div className="relative z-10 bg-[#FBF9F4] px-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border border-[#30483B] bg-[#E8EFEA]" />
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#77736A]">
                  G.I
                </span>
              </div>

              {/* Center Wax / Brass Archival Seal Medallion */}
              <motion.div
                initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.55, ease: easeCurve, delay: 0.35 }}
                className="relative z-10 bg-[#FBF9F4] px-3"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border transition-colors duration-300 shadow-[0_4px_14px_rgba(176,146,90,0.22)] ${
                    isObjected
                      ? 'bg-[#F5E8E9] border-[#7A3236]'
                      : isAuthorized
                      ? 'bg-[#E8EFEA] border-[#30483B]'
                      : 'bg-[#F5EFE2] border-[#B0925A]'
                  }`}
                >
                  <div
                    className={`w-[52px] h-[52px] rounded-full border border-dashed flex flex-col items-center justify-center ${
                      isObjected
                        ? 'border-[#7A3236]/60 text-[#7A3236]'
                        : isAuthorized
                        ? 'border-[#30483B]/60 text-[#30483B]'
                        : 'border-[#B0925A]/80 text-[#242421]'
                    }`}
                  >
                    <span className="font-serif text-[13px] tracking-[0.16em] uppercase font-medium leading-none">
                      HLM
                    </span>
                    <span className="text-[7px] font-mono tracking-[0.18em] uppercase text-[#77736A] mt-1">
                      {isAuthorized ? 'OPEN' : isChallenged ? '72H' : 'SEALED'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right Guardian Witness Knot */}
              <div className="relative z-10 bg-[#FBF9F4] px-1.5 flex items-center gap-1">
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#77736A]">
                  G.II
                </span>
                <span className="w-2 h-2 rounded-full border border-[#30483B] bg-[#E8EFEA]" />
              </div>
            </div>

            {/* Bottom Guardian Witness Knot */}
            <div className="mt-3 flex items-center gap-1.5 text-[9px] font-mono tracking-[0.16em] uppercase text-[#77736A]">
              <span className="w-1.5 h-1.5 rounded-full border border-[#B0925A] bg-[#F5EFE2]" />
              <span>2-of-3 Guardian Witness Seal</span>
            </div>
          </div>

          {/* Bottom Archival Provenance Footnote */}
          <div className="pt-5 border-t border-[#E5DFD3] flex items-center justify-between text-[11px] text-[#77736A]">
            <div>
              <span className="font-serif italic text-[#242421]">
                Julian Vance-Sterling
              </span>
              <span className="mx-1.5">·</span>
              <span className="text-[10px] font-mono uppercase tracking-wider">Depositor</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#30483B]">
              Custody Verified
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
