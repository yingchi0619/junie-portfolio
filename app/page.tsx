'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role -- The named spatial carousel group is intentionally focusable for Left/Right keyboard navigation, with adjacent native controls as an alternative. */
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MoveUpRight,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import ProjectPreview from './ProjectPreview';
import Playground from './Playground';
import DeliveryDash from './DeliveryDash';
import { useSafeReducedMotion as useReducedMotion } from './use-safe-reduced-motion';
import { profile, miniweather, groundDsp, capacityProject } from './content';
import PixelWorld from './PixelWorld';
const spring = {
  type: 'spring' as const,
  stiffness: 180,
  damping: 25,
  mass: 1,
};
function Magnetic({
  children,
  href,
  className = '',
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  return (
    <motion.a
      href={href}
      className={`magnetic ${className}`}
      animate={offset}
      transition={spring}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        setOffset({
          x: (e.clientX - r.left - r.width / 2) * 0.09,
          y: (e.clientY - r.top - r.height / 2) * 0.12,
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.a>
  );
}
function Explorer({
  index,
  setIndex,
}: {
  index: number;
  setIndex: (n: number) => void;
}) {
  const reduced = !!useReducedMotion();
  const [opened, setOpened] = useState(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef(0);
  const dragDistance = useRef(0);
  const explore = useRef<HTMLButtonElement>(null);
  const p = profile.projects[index];
  const count = profile.projects.length;
  const change = (d: number) => setIndex((index + d + count) % count);
  const projectRole = [
    'Analytics exploration',
    'Real weather & generative AI',
    'Backend development',
    'Application flow & email integration',
  ][index];
  return (
    <section id="work" className="work section">
      <div className="section-top">
        <span className="eyebrow">02 / THE PROJECT JOURNAL</span>
        <span className="section-note">A FEW THINGS I’VE GROWN</span>
      </div>
      <div className="work-heading">
        <h2>
          Not just the output.
          <br />
          <span>The thinking behind it.</span>
        </h2>
        <p>
          Explore software and data projects.
          <br />
          Each starts with a different part of the system.
        </p>
      </div>
      <LayoutGroup id="projects">
        <div
          className={`project-stage ${dragging ? 'dragging' : ''}`}
          role="group"
          aria-roledescription="carousel"
          tabIndex={0}
          aria-label="Project Explorer. Drag or use left and right arrow keys to switch projects."
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              change(1);
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              change(-1);
            }
          }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            start.current = e.clientX;
            dragDistance.current = 0;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragging) dragDistance.current = e.clientX - start.current;
          }}
          onPointerUp={() => {
            if (dragging && Math.abs(dragDistance.current) > 45)
              change(dragDistance.current < 0 ? 1 : -1);
            setDragging(false);
          }}
          onPointerCancel={() => setDragging(false)}
          onLostPointerCapture={() => setDragging(false)}
        >
          {profile.projects.map((project, i) => {
            let offset = (i - index + count) % count;
            if (offset > count / 2) offset -= count;
            return (
              <motion.div
                key={project.id}
                className={`project-slide ${offset === 0 ? 'current' : ''}`}
                data-active={offset === 0}
                aria-hidden={offset !== 0}
                animate={{
                  x: `${offset * 77}%`,
                  rotateY: 0,
                  rotateZ: 0,
                  scale: offset === 0 ? 1 : 0.82,
                  z: offset === 0 ? 0 : -120,
                  opacity: Math.abs(offset) > 1 ? 0 : offset === 0 ? 1 : 0.42,
                }}
                transition={reduced ? { duration: 0 } : spring}
                style={{
                  zIndex: offset === 0 ? 3 : 1,
                  pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                }}
              >
                <motion.div
                  layoutId={`preview-${project.id}`}
                  transition={reduced ? { duration: 0 } : spring}
                >
                  <ProjectPreview id={project.id} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        <div className="explorer-controls">
          <span className="drag-instruction">← DRAG TO EXPLORE →</span>
          <div className="project-dots" aria-label="Select a project">
            {profile.projects.map((project, i) => (
              <button
                key={project.id}
                onClick={() => setIndex(i)}
                aria-label={`Show ${project.title}`}
                aria-pressed={index === i}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="arrow-controls">
            <button aria-label="Previous project" onClick={() => change(-1)}>
              <ArrowLeft size={18} />
            </button>
            <span>
              0{index + 1} / 0{count}
            </span>
            <button aria-label="Next project" onClick={() => change(1)}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="project-info" aria-live="polite">
          <div>
            <span className="eyebrow">
              {p.type} / {projectRole}
            </span>
            <motion.h3
              key={p.id}
              initial={reduced ? false : { y: 8, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {p.title}
            </motion.h3>
            <p>{p.intro}</p>
            {p.id === 'miniweather' && (
              <ul className="mw-highlights">
                {miniweather.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            <div className="tags">
              {p.stack.split(' · ').map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
          <div className="project-actions">
            <button
              ref={explore}
              className="explore-button"
              onClick={() => setOpened(true)}
            >
              {p.id === 'miniweather'
                ? 'View Case Study'
                : 'Explore case study'}{' '}
              <MoveUpRight size={24} />
            </button>
            {p.id === 'capacity' && (
              <>
                <a
                  className="mw-action"
                  href={capacityProject.screenshot}
                  target="_blank"
                  rel="noreferrer"
                >
                  View dashboard screenshot <ArrowUpRight size={17} />
                </a>
                <a className="mw-action" href={p.url}>
                  GitHub <ArrowUpRight size={17} />
                </a>
              </>
            )}
            {p.id === 'miniweather' && (
              <>
                <a
                  className="mw-action"
                  href={miniweather.demo}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Live App <ArrowUpRight size={17} />
                </a>
                <a className="mw-action" href={p.url}>
                  GitHub <ArrowUpRight size={17} />
                </a>
              </>
            )}
            {p.id === 'ground-dsp' && (
              <>
                <a className="mw-action" href={groundDsp.live}>
                  Become a DSP <ArrowUpRight size={17} />
                </a>
                <a className="mw-action" href={p.url}>
                  GitHub <ArrowUpRight size={17} />
                </a>
              </>
            )}
          </div>
        </div>
        <Dialog open={opened} onOpenChange={setOpened}>
          <DialogContent
            className="case-dialog"
            showCloseButton={false}
            finalFocus={explore}
          >
            <DialogClose className="case-close" aria-label="Close case study">
              <X size={22} />
            </DialogClose>
            <div className="case-scroll">
              <div className="case-head">
                <span className="eyebrow">
                  {p.type} · {p.stack}
                </span>
                <DialogTitle className="case-title">{p.title}</DialogTitle>
                <DialogDescription className="case-description">
                  {p.intro}
                </DialogDescription>
              </div>
              <motion.div
                layoutId={`preview-${p.id}`}
                transition={reduced ? { duration: 0 } : spring}
              >
                <ProjectPreview id={p.id} />
              </motion.div>
              <div className="case-grid">
                {[
                  ['01', 'Problem', p.problem],
                  ['02', 'My Contribution', p.contribution],
                  ['03', 'Approach', p.approach],
                  ['04', 'Outcome', p.outcome],
                ].map(([n, title, text]) => (
                  <div key={title}>
                    <span>{n}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              {p.id === 'capacity' && (
                <a
                  className="primary-button case-play"
                  href={capacityProject.screenshot}
                  target="_blank"
                  rel="noreferrer"
                >
                  View actual dashboard screenshot <ArrowUpRight size={16} />
                </a>
              )}
              {p.url && (
                <a className="primary-button" href={p.url}>
                  View GitHub repository <ArrowUpRight size={18} />
                </a>
              )}
              {p.id === 'ground-dsp' && (
                <div className="ground-dsp-invite">
                  <div>
                    <h3>Interested in becoming our DSP?</h3>
                    <p>
                      Explore available service areas and submit your
                      application on our partner recruitment website.
                    </p>
                  </div>
                  <a className="primary-button" href={groundDsp.live}>
                    Become a DSP <ArrowUpRight size={18} />
                  </a>
                </div>
              )}
              {p.id === 'miniweather' && (
                <section
                  className="mw-real-example"
                  aria-labelledby="mw-example-heading"
                >
                  <div className="mw-example-copy">
                    <span className="eyebrow">
                      A REAL GENERATION · SEPTEMBER 16, 2026
                    </span>
                    <h3 id="mw-example-heading">
                      Atlanta, dressed for a warm day.
                    </h3>
                    <p>
                      29°C, feels like 34°C · 65% humidity · 0% rain chance · UV
                      5.7. Preferences: Minimal / Everyday / Balanced comfort.
                    </p>
                    <p>
                      The generated look pairs a lightweight white cotton
                      T-shirt with beige linen trousers, white canvas sneakers,
                      sunglasses and a leather crossbody bag. Qwen recommended
                      breathable fabrics for the heat and humidity; FLUX
                      visualized the outfit from its image prompt.
                    </p>
                    <p className="mw-example-note">
                      Captured from the running app using real weather and AI
                      APIs. This saved example is not a current forecast; each
                      new request can produce a different look.
                    </p>
                    <a
                      className="primary-button"
                      href={miniweather.demo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Try your city & style <ArrowUpRight size={18} />
                    </a>
                  </div>
                  <a
                    href={miniweather.outfitScreenshot}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View the actual AI outfit screenshot full size"
                  >
                    <Image
                      unoptimized
                      src={miniweather.outfitScreenshot}
                      width={407}
                      height={695}
                      alt="Saved AI outfit result from MiniWeather, generated for Atlanta"
                      loading="lazy"
                    />
                  </a>
                </section>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </LayoutGroup>
    </section>
  );
}
const journeys = [
  {
    id: 'gofo',
    label: 'PROFESSIONAL EXPERIENCE',
    name: 'GOFO INC',
    degree: 'Capacity Operations Specialist',
    body: 'Coordinating last-mile delivery capacity where plans meet daily reality.',
    details: [
      'Last-mile capacity, cross-station coordination, route and parcel-volume balance.',
      'DSP onboarding and management, billing, exception handling and process improvement.',
    ],
    skills: [
      'Capacity planning',
      'DSP coordination',
      'Exception analysis',
      'Process improvement',
    ],
    project: 3,
    projectLabel: 'Related project: GROUND DSP Partner Recruitment',
  },
  {
    id: 'nyu',
    label: 'GRADUATE EDUCATION',
    name: 'New York University',
    degree: 'M.S. in Computer Engineering · Tandon',
    body: 'A graduate foundation in computer engineering.',
    details: [
      'Degree information is shown without unverified dates, coursework or academic results.',
    ],
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'AWS',
      'Docker',
      'CI/CD',
    ],
    project: 2,
    projectLabel: 'Explore the Node.js / Express project',
  },
  {
    id: 'arizona',
    label: 'UNDERGRADUATE EDUCATION',
    name: 'University of Arizona',
    degree: 'B.S. in Information Science and Technology',
    body: 'An undergraduate foundation in information science and technology.',
    details: [
      'Explore the technical toolkit and independent project work alongside this education.',
    ],
    skills: ['Python', 'SQL', 'PostgreSQL'],
    project: 1,
    projectLabel: 'Explore the MiniWeather prototype',
  },
];
function Journey({ onProject }: { onProject: (n: number) => void }) {
  const [selected, setSelected] = useState<string[]>(['gofo']);
  const active = journeys.find((j) => j.id === selected[0]);
  return (
    <section id="experience" className="journey section">
      <div className="section-top">
        <span className="eyebrow">04 / EXPERIENCE & EDUCATION</span>
        <span className="section-note">CONTEXT SHAPES THE QUESTIONS</span>
      </div>
      <h2>
        Engineering meets
        <br />
        <span>operational reality.</span>
      </h2>
      <div className="journey-grid">
        <Accordion
          value={selected}
          onValueChange={(v) => setSelected(v as string[])}
          className="timeline"
        >
          {journeys.map((j) => (
            <AccordionItem value={j.id} key={j.id} className="timeline-item">
              <AccordionTrigger className="timeline-trigger">
                <span className="timeline-node" />
                <span>
                  <span className="eyebrow">{j.label}</span>
                  <strong>{j.name}</strong>
                  <small>{j.degree}</small>
                </span>
              </AccordionTrigger>
              <AccordionContent className="timeline-content">
                <p>{j.body}</p>
                {j.details.map((d) => (
                  <p key={d}>{d}</p>
                ))}
                {j.id === 'gofo' && profile.roleDates && (
                  <p>{profile.roleDates}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <aside className="connected-context">
          <span className="eyebrow">CONNECTED CONTEXT</span>
          <AnimatePresence mode="wait">
            <motion.div
              key={active?.id || 'none'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h3>
                {active
                  ? active.id === 'gofo'
                    ? 'What operations teaches me'
                    : 'A foundation to build on'
                  : 'Select an experience'}
              </h3>
              <p>
                {active?.id === 'gofo'
                  ? 'Technical solutions start with understanding the constraints, handoffs and exceptions in a real operation.'
                  : 'Skills and independent projects from my portfolio; no coursework or project affiliation is implied.'}
              </p>
              <div className="tags">
                {active?.skills.map((s) => (
                  <span className="highlight" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              {active && (
                <button
                  className="journey-project"
                  onClick={() => {
                    onProject(active.project);
                    document.getElementById('work')?.scrollIntoView({
                      behavior: window.matchMedia(
                        '(prefers-reduced-motion: reduce)',
                      ).matches
                        ? 'instant'
                        : 'smooth',
                    });
                  }}
                >
                  {active.projectLabel}
                  <ArrowUpRight size={20} />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
      <div className="toolkit">
        <span className="eyebrow">TECHNICAL TOOLKIT</span>
        {Object.entries(profile.skills).map(([label, skills]) => (
          <div key={label}>
            <h4>{label}</h4>
            <div>
              {skills.map((s) => (
                <span
                  key={s}
                  className={active?.skills.includes(s) ? 'skill-active' : ''}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default function Home() {
  const [project, setProject] = useState(0);
  const [section, setSection] = useState('home');
  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get('project');
    const found = profile.projects.findIndex((item) => item.id === selected);
    if (found >= 0) queueMicrotask(() => setProject(found));
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setSection(e.target.id);
        }),
      { rootMargin: '-20% 0px -55% 0px' },
    );
    document
      .querySelectorAll('main>section')
      .forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <a className="brand" href="#home">
          Yingchi <span>Zhu</span>
          <i />
        </a>
        <nav aria-label="Main navigation">
          {[
            ['play', 'Play'],
            ['work', 'Work'],
            ['playground', 'Lab'],
            ['experience', 'Experience'],
            ['contact', 'Contact'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={section === id ? 'location' : undefined}
            >
              {label}
              <span />
            </a>
          ))}
        </nav>
        <span className="nav-locale">
          NJ / NYC <ArrowUpRight size={13} />
        </span>
      </header>
      <main id="main">
        <PixelWorld onProject={setProject} />
        <Suspense
          fallback={
            <section id="play" className="delivery-rush-loading">
              <span>Loading Delivery Dash…</span>
            </section>
          }
        >
          <DeliveryDash />
        </Suspense>
        <Explorer index={project} setIndex={setProject} />
        <Playground />
        <Journey onProject={setProject} />
        <section id="contact" className="contact section">
          <span className="eyebrow">05 / THE NEXT CONNECTION</span>
          <h2>
            Good systems start
            <br />
            with a <em>conversation.</em>
          </h2>
          <div className="contact-bottom">
            <p>
              Yingchi Zhu. Call me Junie.
              <br />
              Software engineering / Data analytics
              <br />
              New Jersey · NYC
            </p>
            <div>
              {profile.email ? (
                <Magnetic
                  className="primary-button"
                  href={`mailto:${profile.email}`}
                >
                  Let’s connect <ArrowUpRight size={20} />
                </Magnetic>
              ) : (
                <p>
                  Have a role where software meets real-world complexity?
                  <br />
                  Reach out through the channel where you found this portfolio.
                </p>
              )}
              <div className="contact-links">
                {profile.linkedin && <a href={profile.linkedin}>LinkedIn ↗</a>}
                {profile.github && <a href={profile.github}>GitHub ↗</a>}
                {profile.resume && <a href={profile.resume}>Résumé ↗</a>}
              </div>
            </div>
          </div>
          <footer>
            <span>YINGCHI ZHU / MADE WITH CURIOSITY</span>
            <a href="#home">Back to the village ↑</a>
          </footer>
        </section>
      </main>
    </MotionConfig>
  );
}
