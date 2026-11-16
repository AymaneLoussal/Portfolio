import {createRoot} from 'react-dom/client';
import {useEffect, useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import SpotlightCard from './components/react-bits/SpotlightCard';
import ShinyText from './components/react-bits/ShinyText';
import './motion.css';

gsap.registerPlugin(ScrollTrigger, SplitText);
window.portfolioMotion = true;
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const roots = [];

function Signature() {
  const [reduced, setReduced] = useState(preference.matches);
  useEffect(() => {
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  return <ShinyText text="THREE WORLDS. ONE IDENTITY." color="#9ba1ae" shineColor="#e0eaff" speed={3} delay={2} disabled={reduced} />;
}

const signature = document.querySelector('[data-react-signature]');
if (signature) {
  const root = createRoot(signature);
  root.render(<Signature />);
  roots.push(root);
}
document.querySelectorAll('.hero-gateways > a').forEach((link, index) => {
  const name = link.querySelector('strong').textContent;
  const description = link.lastElementChild.firstChild.textContent;
  const root = createRoot(link);
  root.render(<SpotlightCard className="world-spotlight" spotlightColor={['#9db9ff', '#e6c9a4', '#b4d99c'][index]} intensity={0.15} borderGlow={0.4} proximity={35}>
    <span className="mono">WORLD 0{index + 1}</span>
    <strong>{name}</strong>
    <span className="gateway-caption">{description}<i aria-hidden="true">↗</i></span>
  </SpotlightCard>);
  roots.push(root);
});

const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
const media = gsap.matchMedia();
let lenis;

media.add('(prefers-reduced-motion: no-preference)', () => {
  lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,
    prevent: node => node.closest('dialog, #mobile-menu-drawer')
  });
  document.documentElement.classList.add('motion-ready');
  lenis.on('scroll', ScrollTrigger.update);
  const tick = time => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);

  gsap.utils.toArray('.dev-heading h2, .editorial-heading h2, .football-heading h2, .contact h2').forEach(heading => {
    gsap.from(heading, {y: 38, opacity: 0.3, duration: 1.1, ease: 'power3.out',
      scrollTrigger: {trigger: heading, start: 'top 92%', once: true}});
  });
  gsap.utils.toArray('.project-copy, .gallery-item, .athlete-profile, .contact-path').forEach((element) => {
    gsap.from(element, {y: 32, opacity: 0.25, duration: 0.85, ease: 'power2.out',
      scrollTrigger: {trigger: element, start: 'top 96%', once: true}});
  });
  gsap.fromTo('.hero-portrait', {y: 0}, {y: -35, ease: 'none',
    scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.8}});
  gsap.fromTo(progress, {scaleX: 0}, {scaleX: 1, ease: 'none',
    scrollTrigger: {start: 0, end: 'max', scrub: true}});

  const onAnchor = event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.classList.contains('skip-link')) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 100;
    // Read the actual position after responsive reflow, rather than an in-flight scroll value.
    const destination = target.id === 'home' ? 0 : target.getBoundingClientRect().top + scrollY - padding;
    lenis.scrollTo(destination, {onComplete: () => {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});
      }
      target.focus({preventScroll: true});
    }});
  };
  document.addEventListener('click', onAnchor);
  const syncDialogs = () => document.querySelector('dialog[open]') ? lenis.stop() : lenis.start();
  const dialogs = new MutationObserver(syncDialogs);
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, {attributes: true, attributeFilter: ['open']}));
  syncDialogs();
  return () => {
    dialogs.disconnect();
    document.removeEventListener('click', onAnchor);
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = undefined;
    document.documentElement.classList.remove('motion-ready');
  };
});

let heroStarted = false;
function revealHero() {
  if (heroStarted) return;
  heroStarted = true;
  document.fonts.ready.then(() => {
    if (preference.matches || scrollY > innerHeight / 2) return;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('.hero h1', {type: 'chars', charsClass: 'hero-letter'});
      gsap.from(split.chars, {yPercent: 65, opacity: 0, stagger: 0.035, duration: 1, ease: 'power3.out', onComplete: () => split.revert()});
      return () => split.revert();
    });
  });
}
document.addEventListener('portfolio:intro-end', revealHero, {once: true});
addEventListener('DOMContentLoaded', () => {if (!document.querySelector('.intro')) revealHero();});
document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh(), {once: true});
addEventListener('pagehide', event => {
  if (event.persisted) return;
  media.revert();
  roots.forEach(root => root.unmount());
});
