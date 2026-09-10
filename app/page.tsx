'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role -- The named spatial carousel group is intentionally focusable for Left/Right keyboard navigation, with adjacent native controls as an alternative. */
import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowDown,
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
import ProjectPreview from './ProjectPreview';
import Playground from './Playground';
import { profile } from './content';
const Scene = lazy(() => import('./SystemScene'));
const DeliveryRush = lazy(() => import('./DeliveryRush'));
const spring = {
  type: 'spring' as const,
  stiffness: 180,
  damping: 25,
  mass: 1,
};
const modes = [
  {
    title: 'Build',
    heading: 'Turn ideas into working systems.',
    text: 'Frontend, backend and AI-assisted product projects. A foundation in computer engineering, with an interest in how the parts fit together.',
    project: 1,
    label: 'MiniWeather interface prototype',
  },
  {
    title: 'Analyze',
    heading: 'Find the question behind the numbers.',
    text: 'Explore delivery timeliness, utilization and exception causes. Connect analysis to the operational decisions it can help explain.',
    project: 0,
    label: 'Root Cause & Capacity Dashboard',
  },
  {
    title: 'Operate',
    heading: 'Understand what happens on the ground.',
    text: 'Hands-on last-mile capacity operations: DSP onboarding, cross-station coordination, route balance, billing and exceptions.',
    project: 0,
    label: 'Root Cause & Capacity Dashboard',
  },
];
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Fallback({
  mode,
  onMode,
}: {
  mode: number;
  onMode: (n: number) => void;
}) {
  return (
    <div className="scene-fallback">
      <svg viewBox="0 0 500 360" aria-label="System connections">
        <g fill="none" stroke="#7fabc6">
          <ellipse
            cx="250"
            cy="180"
            rx="130"
            ry="60"
            transform="rotate(-35 250 180)"
          />
          <ellipse
            cx="250"
            cy="180"
            rx="130"
            ry="60"
            transform="rotate(35 250 180)"
          />
          <path d="M250 105L315 150V225L250 260L185 225V150Z M250 180L315 150 M250 180L185 150 M250 180V260" />
          <path d="M110 95L185 150M390 100L315 150M250 260V315" />
        </g>
      </svg>
      <div>
        {modes.map((m, i) => (
          <button
            key={m.title}
            aria-pressed={mode === i}
            onClick={() => onMode(i)}
          >
            {m.title}
          </button>
        ))}
      </div>
      <p>System overview · interactive 2D fallback</p>
    </div>
  );
}
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
function Hero({
  mode,
  onMode,
  onProject,
}: {
  mode: number;
  onMode: (n: number) => void;
  onProject: (n: number) => void;
}) {
  const reduced = !!useReducedMotion();
  const area = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef({ x: 0, y: 0, hoverX: 0, hoverY: 0, dragging: false });
  const start = useRef({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({
    target: area,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.72]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 105]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -8]);
  useEffect(() => {
    const mq = window.matchMedia('(max-width:700px)');
    const resize = () => setCompact(mq.matches);
    resize();
    mq.addEventListener('change', resize);
    const timer = window.setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl) {
          setFailed(true);
          return;
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        setReady(true);
      } catch {
        setFailed(true);
      }
    }, 150);
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        update();
      },
      { threshold: 0.01 },
    );
    if (stage.current) observer.observe(stage.current);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      mq.removeEventListener('change', resize);
    };
  }, []);
  const end = () => {
    gesture.current.dragging = false;
    gesture.current.x = 0;
    gesture.current.y = 0;
    gesture.current.hoverX = 0;
    gesture.current.hoverY = 0;
    setDragging(false);
  };
  const fallback = <Fallback mode={mode} onMode={onMode} />;
  return (
    <section id="home" className="hero" ref={area}>
      <div className="hero-topline">
        <span>YINGCHI “JUNIE” ZHU</span>
        <span>SOFTWARE / DATA / OPERATIONS</span>
        <span>NEW JERSEY · NYC</span>
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="edition">
            <span /> A PORTFOLIO OF CONNECTED THINKING
          </div>
          <h1>
            Systems
            <br />
            in <em>motion.</em>
          </h1>
          <p className="hero-description">
            I connect software engineering and data analytics with the
            real-world complexity of last-mile logistics.
          </p>
          <div className="hero-actions">
            <Magnetic href="#work" className="primary-button">
              Explore selected work <ArrowDown size={17} />
            </Magnetic>
            <Magnetic href="#play" className="hero-play-button">
              Play Delivery Rush <ArrowRight size={17} />
            </Magnetic>
          </div>
          <div className="hero-credentials">
            <span>NYU TANDON / M.S.</span>
            <span>GOFO / CAPACITY OPERATIONS</span>
          </div>
        </div>
        <motion.div
          ref={stage}
          className={`scene-stage ${dragging ? 'is-dragging' : ''}`}
          style={reduced ? {} : { scale, y, rotateZ: rotate }}
          data-scene-state={failed ? 'fallback' : ready ? 'ready' : 'loading'}
          data-render-state={visible ? 'active' : 'paused'}
          data-dragging={dragging}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button') || reduced) return;
            start.current = { x: e.clientX, y: e.clientY };
            gesture.current.dragging = true;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (reduced) return;
            const g = gesture.current;
            if (g.dragging) {
              g.x = (e.clientX - start.current.x) * 0.006;
              g.y = (e.clientY - start.current.y) * 0.004;
            } else if (e.pointerType === 'mouse') {
              const r = e.currentTarget.getBoundingClientRect();
              g.hoverX = (e.clientX - r.left - r.width / 2) * 0.00035;
              g.hoverY = (e.clientY - r.top - r.height / 2) * 0.0003;
            }
          }}
          onPointerUp={end}
          onPointerCancel={end}
          onLostPointerCapture={end}
          onPointerLeave={() => {
            if (!gesture.current.dragging) {
              gesture.current.hoverX = 0;
              gesture.current.hoverY = 0;
            }
          }}
        >
          <div className="scene-aura" />
          <div className="scene-cross cross-a">+</div>
          <div className="scene-cross cross-b">+</div>
          {failed ? (
            fallback
          ) : ready ? (
            <SceneBoundary fallback={fallback}>
              <Suspense
                fallback={
                  <div className="scene-loading">Assembling the system…</div>
                }
              >
                <Scene
                  mode={mode}
                  onMode={onMode}
                  visible={visible}
                  reduced={reduced}
                  compact={compact}
                  gesture={gesture}
                  onFailure={() => setFailed(true)}
                />
              </Suspense>
            </SceneBoundary>
          ) : (
            <div className="scene-loading">Preparing the system…</div>
          )}
          <div className="scene-caption">
            <span>FIG. 01 / CONNECTED SYSTEM</span>
            <span>
              {reduced
                ? 'SELECT A NODE TO EXPLORE'
                : dragging
                  ? 'ROTATING / RELEASE TO RECENTER'
                  : 'DRAG TO ROTATE · SELECT A NODE'}
            </span>
          </div>
        </motion.div>
      </div>
      <div className="mode-strip">
        <div className="mode-tabs" aria-label="Explore capabilities">
          {modes.map((m, i) => (
            <button
              key={m.title}
              onClick={() => onMode(i)}
              aria-pressed={mode === i}
            >
              <span>0{i + 1}</span>
              {m.title}
              {mode === i && <motion.i layoutId="mode-line" />}
            </button>
          ))}
        </div>
        <div className="mode-copy" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reduced ? false : { y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2>{modes[mode].heading}</h2>
              <p>{modes[mode].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <button
          className="mode-project"
          onClick={() => {
            onProject(modes[mode].project);
            document
              .getElementById('work')
              ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
          }}
        >
          <span>RELATED EXPLORATION</span>
          <strong>{modes[mode].label}</strong>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </section>
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
  const change = (d: number) => setIndex((index + d + 4) % 4);
  const projectRole = [
    'Analytics exploration',
    'Frontend prototyping',
    'Backend development',
    'Mini program development',
  ][index];
  return (
    <section id="work" className="work section">
      <div className="section-top">
        <span className="eyebrow">02 / PROJECT EXPLORER</span>
        <span className="section-note">FOUR WAYS INTO THE WORK</span>
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
            let offset = (i - index + 4) % 4;
            if (offset === 3) offset = -1;
            return (
              <motion.div
                key={project.id}
                className={`project-slide ${offset === 0 ? 'current' : ''}`}
                data-active={offset === 0}
                aria-hidden={offset !== 0}
                animate={{
                  x: `${offset * 77}%`,
                  rotateY: offset === 0 ? 0 : offset < 0 ? 25 : -25,
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
            <span>0{index + 1} / 04</span>
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
            <div className="tags">
              {p.stack.split(' · ').map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
          <button
            ref={explore}
            className="explore-button"
            onClick={() => setOpened(true)}
          >
            Explore case study <MoveUpRight size={24} />
          </button>
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
                <button
                  className="primary-button case-play"
                  onClick={() => {
                    setOpened(false);
                    window.setTimeout(
                      () =>
                        document.getElementById('playground')?.scrollIntoView({
                          behavior: reduced ? 'instant' : 'smooth',
                        }),
                      80,
                    );
                  }}
                >
                  Try the Operations Playground <ArrowDown size={16} />
                </button>
              )}
              {p.url && (
                <a className="primary-button" href={p.url}>
                  View GitHub repository <ArrowUpRight size={18} />
                </a>
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
    project: 0,
    projectLabel: 'Related personal exploration: Root Cause & Capacity',
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
  const [mode, setMode] = useState(0);
  const [project, setProject] = useState(0);
  const [section, setSection] = useState('home');
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
          junie<span> / zhu</span>
          <i />
        </a>
        <nav aria-label="Main navigation">
          {[
            ['play', 'Play'],
            ['work', 'Work'],
            ['playground', 'Playground'],
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
        <Hero
          mode={mode}
          onMode={(n) => {
            setMode(n);
            setProject(modes[n].project);
          }}
          onProject={setProject}
        />
        <Suspense
          fallback={
            <section id="play" className="delivery-rush-loading">
              <span>Loading Delivery Rush…</span>
            </section>
          }
        >
          <DeliveryRush
            onSeeProject={() => {
              setProject(0);
              document.getElementById('work')?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                  .matches
                  ? 'instant'
                  : 'smooth',
              });
            }}
          />
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
            <span>JUNIE ZHU / SYSTEMS IN MOTION</span>
            <a href="#home">Back to the system ↑</a>
          </footer>
        </section>
      </main>
    </MotionConfig>
  );
}
