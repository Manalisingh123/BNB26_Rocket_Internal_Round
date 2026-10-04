/**
 * Editorial smooth scrolling & reduced-motion utilities for Heirloom.
 * Uses a custom cubic-bezier / easeInOutCubic requestAnimationFrame loop (~720ms)
 * so section navigation glides smoothly without abrupt browser jumps, while
 * strictly respecting `prefers-reduced-motion: reduce`.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollToY(targetY: number, durationMs = 740): void {
  if (typeof window === 'undefined') return;

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;

  if (Math.abs(distance) < 4) return;

  const startTime = performance.now();

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

export function smoothScrollToElement(
  elementId: string,
  headerOffset = 64,
  durationMs = 760
): void {
  if (typeof document === 'undefined') return;
  const cleanId = elementId.replace(/^#/, '');
  const target = document.getElementById(cleanId);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + (window.scrollY || window.pageYOffset);
  const destination = Math.max(0, absoluteTop - headerOffset);

  smoothScrollToY(destination, durationMs);
}
