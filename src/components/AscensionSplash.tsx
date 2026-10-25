/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { artUrl } from '../lib/artUrl';
import '../styles/ascension.css';

/**
 * AscensionSplash — the site-wide "splash screen" that plays the moment the
 * app opens (website or installed PWA, any route/link).
 *
 * Inspired by the Volume 51 hero banner ("Christ enthroned as King of Kings,
 * the Alpha and the Omega"):
 *   1. The calvary scene — the place where Jesus was crucified — fades in
 *      behind everything (slow Ken Burns breathing).
 *   2. Light rays + golden dust bloom behind the Lord.
 *   3. Jesus rises up onto the screen from below (cropped from the Vol. 51
 *      hero banner artwork).
 *   4. The declaration: "JESUS IS GOD — Son of GOD, Perfect Son of Man".
 *   5. Jesus ASCENDS — accelerating upward until He passes out of the top of
 *      the screen in a pillar of light, and the splash dissolves into the
 *      page behind it.
 *
 * Skippable (Skip button / tap / Esc) and fully respectful of
 * prefers-reduced-motion. Runs for exactly 2 seconds end-to-end, then
 * unmounts (zero runtime cost after).
 */

/** Hard cap on the whole splash, in seconds. The timeline is authored against
 *  this number: every act is placed on a 0 → 2 s beat. */
const SPLASH_SECONDS = 2;

const JESUS_SRC = artUrl('/images/volumes/kings-of-the-bible-v2/hero-1920.webp');
const CROSS_SRC = '/images/stories/scenes/cross.webp';

/** Deterministic pseudo-random fields for the golden-dust particles. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: 6 + ((i * 37) % 100) * 0.88,          // % across the screen
  bottom: 4 + ((i * 13) % 6) * 2.2,           // vh from the bottom
  size: 3 + ((i * 29) % 5),                   // px
  drift: ((i * 17) % 44) - 22,                // horizontal drift, px
}));

export const AscensionSplash: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef<() => void>(() => {});
  const [done, setDone] = useState(false);

  // useLayoutEffect, NOT useEffect. GSAP writes the initial state of every
  // layer here, and layout effects run before the browser paints. With
  // useEffect the first frame was painted straight from the stylesheet, and
  // Jesus — centred only by gsap.set(xPercent/yPercent -50) — showed up on the
  // RIGHT half of the screen for a moment before the curtain lifted.
  useLayoutEffect(() => {
    // Tell the static boot curtain in index.html that the app is painted. It
    // covers the crawler-facing pre-render shell during boot; removing it here
    // means the hand-over happens on the splash's first frame (no gap, and no
    // flash of the pre-render link list before the hero banner).
    try { window.dispatchEvent(new CustomEvent('sp-app-ready')); } catch { /* no-op */ }

    const root = rootRef.current;
    if (!root) return;
    const $ = (sel: string) => root.querySelector<HTMLElement>(sel);
    const bg = $('.asc-bg');
    const wash = $('.asc-wash');
    const rays = $('.asc-rays');
    const glow = $('.asc-glow');
    const fig = $('.asc-fig');
    const beam = $('.asc-beam');
    const flash = $('.asc-flash');
    const title = $('.asc-title');
    const line2 = $('.asc-line2');
    const line3 = $('.asc-line3');
    const verse = $('.asc-verse');
    const acts = $('.asc-acts');
    const rule = $('.asc-rule');
    const skip = $('.asc-skip');
    const parts = Array.from(root.querySelectorAll<HTMLElement>('.asc-p'));

    // Lock page scroll while the splash is on screen.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const finish = () => {
      document.body.style.overflow = prevOverflow;
      // stop intercepting clicks the instant the curtain drops — React unmounts
      // a frame later, and the header/nav must be usable immediately.
      root.style.pointerEvents = 'none';
      setDone(true);
    };

    // This splash is a fixed, full-screen overlay at z-index 9999 — it sits on
    // top of the site header, the nav and every dropdown. If anything goes
    // wrong it has to get out of the way, never hold the chrome hostage.
    if (!bg || !wash || !rays || !glow || !fig || !beam || !flash || !title || !line2 || !line3 || !verse || !acts || !rule || !skip) {
      finish();
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      // GSAP owns the transform of every animated node — CSS must not set one.
      gsap.set(fig, { xPercent: -50, yPercent: -50, y: '110vh', scale: 0.94, autoAlpha: 0 });
      gsap.set(rays, { xPercent: -50, yPercent: -50, rotation: 0, autoAlpha: 0 });
      gsap.set(glow, { xPercent: -50, yPercent: -50, scale: 0.82, autoAlpha: 0 });
      gsap.set(beam, { xPercent: -50, scaleY: 0.35, transformOrigin: '50% 0%', autoAlpha: 0 });
      gsap.set(acts, { xPercent: -50, autoAlpha: 0 });
      gsap.set(parts, { autoAlpha: 0 });
      gsap.set([bg, wash], { autoAlpha: 0 });
      gsap.set([title, line2, line3, rule, verse], { autoAlpha: 0, y: 24 });
      gsap.set(skip, { autoAlpha: 0 });
    } catch (err) {
      console.warn('[AscensionSplash] GSAP unavailable — skipping the intro:', err);
      finish();
      return;
    }

    let tl: gsap.core.Timeline;

    if (reduced) {
      // Reduced motion: calm cross-fade, no travel, no flash.
      tl = gsap.timeline({ paused: true, onComplete: finish });
      tl.to(bg, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, 0)
        .to(wash, { autoAlpha: 0.3, duration: 0.3 }, 0)
        .to(fig, { autoAlpha: 1, y: '0vh', scale: 1, duration: 0.4, ease: 'power1.out' }, 0.05)
        .to([title, line2, line3, rule, verse], { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power1.out' }, 0.25)
        .to(skip, { autoAlpha: 1, duration: 0.3 }, 0.2)
        .to(fig, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 1.35)
        .to(root, { autoAlpha: 0, duration: 0.3, ease: 'power1.inOut' }, 1.6);
    } else {
      // ── 2-SECOND CUT ────────────────────────────────────────────────
      // Every act keeps its place, but the whole five-act sequence is
      // compressed onto a 0 → 2 s beat: the page behind the curtain is
      // interactive after two seconds instead of ten.
      tl = gsap.timeline({ paused: true, onComplete: finish });

      /* ── ACT 1 · THE PLACE WHERE HE WAS CRUCIFIED ───────────────────── */
      // Calvary fades in while breathing (Ken Burns, whole run).
      tl.fromTo(bg, { scale: 1.18 }, { scale: 1.0, duration: SPLASH_SECONDS, ease: 'none' }, 0)
        .to(bg, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, 0)
        .to(wash, { autoAlpha: 0.34, duration: 0.3, ease: 'power1.out' }, 0)

        /* ── ACT 2 · THE LIGHT RISES ──────────────────────────────────── */
        .fromTo(rays, { rotation: -12, autoAlpha: 0 }, { rotation: 0, autoAlpha: 0.95, duration: 0.5, ease: 'power2.out' }, 0.1)
        .to(rays, { rotation: 16, duration: SPLASH_SECONDS, ease: 'none' }, 0)
        .fromTo(glow, { scale: 0.82, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, 0.12)
        .to(parts, { autoAlpha: 0.9, y: '-14vh', x: (i: number) => PARTICLES[i].drift, duration: 0.6, ease: 'sine.inOut', stagger: { each: 0.015, from: 'random' } }, 0.15)

        /* ── ACT 3 · JESUS COMES ONTO THE SCREEN ──────────────────────── */
        .to(fig, { autoAlpha: 1, y: '0vh', scale: 1, duration: 0.55, ease: 'power2.out' }, 0.05)
        // gentle "living" float while the words come (ends before the ascension)
        .to(fig, { y: '-4vh', duration: 0.24, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.62)

        /* ── ACT 4 · THE DECLARATION ──────────────────────────────────── */
        .fromTo(title, { y: 22, letterSpacing: '0.42em' }, { y: 0, letterSpacing: '0.16em', autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, 0.28)
        .fromTo(line2, { y: 14 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0.42)
        .fromTo(line3, { y: 14 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0.52)
        .fromTo(rule, { y: 12 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0.6)
        .fromTo(verse, { y: 12 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.66)
        .to(skip, { autoAlpha: 1, duration: 0.3 }, 0.2)

        /* ── ACT 5 · THE ASCENSION — He passes out of the top ─────────── */
        .to(fig, { y: '-140vh', scale: 1.12, duration: 0.85, ease: 'power2.in' }, 1.15)
        .to(fig, { autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, 1.6)
        .to(glow, { autoAlpha: 0, scale: 1.35, duration: 0.85, ease: 'power2.in' }, 1.15)
        .to(rays, { autoAlpha: 0, duration: 0.85, ease: 'power2.in' }, 1.15)
        .to(parts, { y: '-130vh', autoAlpha: 0, duration: 0.8, ease: 'power2.in', stagger: 0.015 }, 1.12)
        .to(wash, { autoAlpha: 0.05, duration: 0.75, ease: 'power2.in' }, 1.15)
        // pillar of light at the top edge as He passes through
        .fromTo(beam, { autoAlpha: 0, scaleY: 0.35 }, { autoAlpha: 1, scaleY: 1.15, duration: 0.4, ease: 'power2.out' }, 1.18)
        .to(beam, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 1.6)
        // "He is ascended into glory"
        .fromTo(acts, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 1.32)
        .to(acts, { autoAlpha: 0, duration: 0.22, ease: 'power1.in' }, 1.66)
        // flash of heaven, then dissolve into the page
        .fromTo(flash, { autoAlpha: 0 }, { autoAlpha: 0.95, duration: 0.16, ease: 'power2.in' }, 1.6)
        .to(flash, { autoAlpha: 0, duration: 0.26, ease: 'power2.out' }, 1.76)
        .to(root, { autoAlpha: 0, duration: SPLASH_SECONDS - 1.74, ease: 'power1.inOut' }, 1.74);
    }

    // The art is preloaded, so the curtain lifts immediately: no dead beat.
    const startTimer = window.setTimeout(() => tl.play(), 40);

    // Failsafe: a stalled timeline (background tab, throttled rAF, paused
    // media) must not leave the overlay parked over the header for ever.
    const failsafe = window.setTimeout(finish, SPLASH_SECONDS * 1000 + 1500);

    // Skip = fast-forward the remaining animation (never a hard cut).
    const skipNow = () => {
      window.clearTimeout(startTimer);
      if (!tl.isActive() && tl.progress() < 1) tl.play();
      tl.timeScale(Math.max(tl.timeScale(), 6));
    };
    skipRef.current = skipNow;
    const onSkipClick = (e: Event) => { e.stopPropagation(); skipNow(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') skipNow();
    };
    skip.addEventListener('click', onSkipClick);
    window.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(failsafe);
      window.removeEventListener('keydown', onKey);
      skip.removeEventListener('click', onSkipClick);
      tl.kill();
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="asc-root"
      role="img"
      aria-label="Splash: against the hill of the crucifixion, Jesus rises in glory, declares Himself God, and ascends out of the top of the screen. Jesus is God — Son of God, Perfect Son of Man."
      onClick={() => skipRef.current()}
      style={{ cursor: 'pointer' }}
    >
      {/* the place where Jesus was crucified — calvary, always behind */}
      <img
        src={CROSS_SRC}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="asc-bg"
      />
      <div className="asc-wash" aria-hidden="true" />
      <div className="asc-vignette" aria-hidden="true" />

      {/* heaven breaking through behind the Lord */}
      <div className="asc-rays" aria-hidden="true" />
      <div className="asc-glow" aria-hidden="true" />

      {/* golden dust */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="asc-p"
          aria-hidden="true"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}vh`,
            width: p.size,
            height: p.size,
          }}
        />
      ))}

      {/* Jesus — cropped from the Volume 51 hero banner (Christ, Alpha & Omega) */}
      <div className="asc-fig" aria-hidden="true">
        <img
          src={JESUS_SRC}
          alt="Jesus Christ — King of Kings, the Alpha and the Omega"
          width={1920}
          height={1082}
          fetchPriority="high"
          decoding="async"
          className="asc-jesus"
        />
      </div>

      {/* pillar of light where He passes through the top edge */}
      <div className="asc-beam" aria-hidden="true" />

      {/* the words */}
      <div className="asc-text">
        <h1 className="asc-title" lang="en">JESUS IS GOD</h1>
        <p className="asc-line2">Son of GOD &mdash; Perfect Son of Man</p>
        <p className="asc-line3">
          Accept this truth in your life, and receive His grace through keeping faith.
        </p>
        <div className="asc-rule" aria-hidden="true" />
        <blockquote className="asc-verse">
          &ldquo;I am the way, the truth, and the life: no man cometh unto the Father, but by me.&rdquo;
          <cite> &mdash; John 14:6</cite>
        </blockquote>
      </div>

      {/* ascension caption */}
      <p className="asc-acts">He is ascended into glory &mdash; Acts 1:9</p>

      {/* final flash */}
      <div className="asc-flash" aria-hidden="true" />

      <button
        type="button"
        className="asc-skip"
        aria-label="Skip the ascension animation"
      >
        Skip &bull; Enter the Word
      </button>
    </div>
  );
};

export default AscensionSplash;
