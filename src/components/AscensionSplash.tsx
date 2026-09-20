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
 * prefers-reduced-motion. ~10 s, then unmounts (zero runtime cost after).
 */

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
      tl.to(bg, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0)
        .to(wash, { autoAlpha: 0.3, duration: 0.6 }, 0)
        .to(fig, { autoAlpha: 1, y: '0vh', scale: 1, duration: 0.8, ease: 'power1.out' }, 0.1)
        .to([title, line2, line3, rule, verse], { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power1.out' }, 0.5)
        .to(skip, { autoAlpha: 1, duration: 0.4 }, 0.4)
        .to(fig, { y: '-8vh', autoAlpha: 0, duration: 0.9, ease: 'power1.in' }, 3.6)
        .to(root, { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' }, 4.3);
    } else {
      tl = gsap.timeline({ paused: true, onComplete: finish });

      /* ── ACT 1 · THE PLACE WHERE HE WAS CRUCIFIED ───────────────────── */
      // Calvary fades in while breathing (slow Ken Burns, whole run).
      tl.fromTo(bg, { scale: 1.24 }, { scale: 1.0, duration: 10.6, ease: 'none' }, 0)
        .to(bg, { autoAlpha: 1, duration: 1.4, ease: 'power1.out' }, 0)
        .to(wash, { autoAlpha: 0.34, duration: 1.2, ease: 'power1.out' }, 0)

        /* ── ACT 2 · THE LIGHT RISES ──────────────────────────────────── */
        .fromTo(rays, { rotation: -12, autoAlpha: 0 }, { rotation: 0, autoAlpha: 0.95, duration: 2.2, ease: 'power2.out' }, 0.5)
        .to(rays, { rotation: 16, duration: 10.2, ease: 'none' }, 0)
        .fromTo(glow, { scale: 0.82, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.9, ease: 'power2.out' }, 0.8)
        .to(parts, { autoAlpha: 0.9, y: '-14vh', x: (i: number) => PARTICLES[i].drift, duration: 2.6, ease: 'sine.inOut', stagger: { each: 0.14, from: 'random' } }, 1.1)

        /* ── ACT 3 · JESUS COMES ONTO THE SCREEN ──────────────────────── */
        .to(fig, { autoAlpha: 1, y: '0vh', scale: 1, duration: 2.3, ease: 'power2.out' }, 0.9)
        // gentle "living" float while the words come
        .to(fig, { y: '-5vh', duration: 1.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 3.3)

        /* ── ACT 4 · THE DECLARATION ──────────────────────────────────── */
        .fromTo(title, { y: 30, letterSpacing: '0.55em' }, { y: 0, letterSpacing: '0.16em', autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 2.3)
        .fromTo(line2, { y: 20 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 2.9)
        .fromTo(line3, { y: 20 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 3.3)
        .fromTo(rule, { y: 18 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 3.6)
        .fromTo(verse, { y: 16 }, { y: 0, autoAlpha: 1, duration: 1.0, ease: 'power2.out' }, 3.8)
        .to(skip, { autoAlpha: 1, duration: 0.5 }, 1.1)

        /* ── ACT 5 · THE ASCENSION — He passes out of the top ─────────── */
        .to(fig, { y: '-140vh', scale: 1.14, duration: 3.5, ease: 'power2.in' }, 5.7)
        .to(fig, { autoAlpha: 0, duration: 1.1, ease: 'power1.in' }, 7.6)
        .to(glow, { autoAlpha: 0, scale: 1.4, duration: 3.1, ease: 'power2.in' }, 5.9)
        .to(rays, { autoAlpha: 0, duration: 3.1, ease: 'power2.in' }, 5.9)
        .to(parts, { y: '-130vh', autoAlpha: 0, duration: 2.5, ease: 'power2.in', stagger: 0.06 }, 5.8)
        .to(wash, { autoAlpha: 0.05, duration: 2.6, ease: 'power2.in' }, 5.9)
        // pillar of light at the top edge as He passes through
        .fromTo(beam, { autoAlpha: 0, scaleY: 0.35 }, { autoAlpha: 1, scaleY: 1.15, duration: 1.6, ease: 'power2.out' }, 6.0)
        .to(beam, { autoAlpha: 0, duration: 1.3, ease: 'power1.in' }, 7.6)
        // "He is ascended into glory"
        .fromTo(acts, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 6.6)
        .to(acts, { autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, 7.8)
        // flash of heaven, then dissolve into the page
        .fromTo(flash, { autoAlpha: 0 }, { autoAlpha: 0.95, duration: 0.55, ease: 'power2.in' }, 8.1)
        .to(flash, { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 8.7)
        .to(root, { autoAlpha: 0, duration: 0.9, ease: 'power1.inOut' }, 8.9);
    }

    // small beat so the art starts decoding before the curtain lifts
    const startTimer = window.setTimeout(() => tl.play(), 250);

    // Failsafe: a stalled timeline (background tab, throttled rAF, paused
    // media) must not leave the overlay parked over the header for ever.
    const failsafe = window.setTimeout(finish, tl.duration() * 1000 + 2500);

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
      role="region"
      aria-label="Intro: Jesus rises in glory and ascends. Jesus is God — Son of God, Perfect Son of Man."
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
        <p className="asc-title" lang="en" aria-hidden="false">JESUS IS GOD</p>
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
