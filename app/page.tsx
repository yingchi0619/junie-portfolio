'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDown, Plus, Minus, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { profile } from './content';

const nodes = [
  { x: 80, y: 205, n: 'Engineering', s: 'Build the system.' },
  { x: 280, y: 95, n: 'Analytics', s: 'Understand the signal.' },
  { x: 365, y: 300, n: 'Operations', s: 'Know what happens on the ground.' },
];
function Network() {
  const [active, setActive] = useState(0);
  return (
    <div className="network">
      <div className="network-head">
        <span>CONNECTED THINKING</span>
        <span className="live-dot">INTERACTIVE</span>
      </div>
      <svg
        viewBox="0 0 470 410"
        aria-label="An abstract route network connecting engineering, analytics and operations"
      >
        <defs>
          <pattern
            id="dots"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#424642" />
          </pattern>
        </defs>
        <rect width="470" height="410" fill="url(#dots)" />
        {[
          [80, 205, 280, 95],
          [280, 95, 365, 300],
          [365, 300, 80, 205],
          [80, 205, 60, 65],
          [280, 95, 410, 45],
          [365, 300, 215, 370],
          [80, 205, 140, 340],
          [365, 300, 425, 180],
        ].map((p, i) => (
          <path
            key={i}
            d={`M ${p[0]} ${p[1]} Q 235 205 ${p[2]} ${p[3]}`}
            className={i === active ? 'route selected' : 'route'}
          />
        ))}
        <path
          className="moving-route"
          d={`M ${nodes[active].x} ${nodes[active].y} Q 235 205 ${nodes[(active + 1) % 3].x} ${nodes[(active + 1) % 3].y}`}
        />
        {nodes.map((n, i) => (
          <g key={n.n} className={active === i ? 'node active' : 'node'}>
            <circle cx={n.x} cy={n.y} r="19" />
            <circle cx={n.x} cy={n.y} r="5" />
            <text x={n.x - 22} y={n.y + 40}>
              0{i + 1} / {n.n.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
      <div className="network-bottom">
        <span className="network-caption">{nodes[active].s}</span>
        <div
          className="node-controls"
          aria-label="Explore connected disciplines"
        >
          {nodes.map((n, i) => (
            <button
              key={n.n}
              onClick={() => setActive(i)}
              aria-label={n.n}
              aria-pressed={active === i}
            >
              0{i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function Demo() {
  const [extra, setExtra] = useState(0);
  const capacity = 1000 + extra;
  const load = Math.round((1200 / capacity) * 100);
  return (
    <div className="demo">
      <div className="demo-title">
        <div>
          <span className="eyebrow">CAPACITY LAB</span>
          <h4>Same volume. Different load.</h4>
        </div>
        <span className="badge">SIMULATED DATA</span>
      </div>
      <p>
        A simplified one-station scenario. Adjust daily capacity to see the
        arithmetic—not a delivery forecast.
      </p>
      <div className="demo-grid">
        <div>
          <div className="range-label">
            <span id="capacity-label">Additional daily capacity</span>
            <strong>+{extra} parcels</strong>
          </div>
          <Slider
            aria-labelledby="capacity-label"
            min={0}
            max={1000}
            step={50}
            value={[extra]}
            onValueChange={(v) => setExtra(Array.isArray(v) ? v[0] : v)}
          />
          <div className="range-ends">
            <span>0</span>
            <span>+1,000 parcels</span>
          </div>
          <button className="reset" onClick={() => setExtra(0)}>
            <RotateCcw size={14} /> Reset scenario
          </button>
        </div>
        <div className="load-result" aria-live="polite">
          <strong>
            {load}
            <small>%</small>
          </strong>
          <span>
            {load > 100
              ? 'Over capacity'
              : load === 100
                ? 'At capacity'
                : 'Within capacity'}
          </span>
        </div>
      </div>
      <div className="load-track">
        <div
          style={{
            width: `${Math.min((load / 150) * 100, 100)}%`,
            background: load > 100 ? '#c66531' : '#2457ff',
          }}
        />
        <span style={{ left: '66.666%' }} />
      </div>
      <div className="demo-foot">
        <span>Volume: 1,200 parcels/day</span>
        <span>Capacity: {capacity.toLocaleString()} parcels/day</span>
      </div>
      <p className="fine">
        Load = volume ÷ capacity. Fixed demand; equal parcel effort; no routing,
        staffing, cost or service-time constraints. Synthetic values are
        unrelated to GOFO operations.
      </p>
    </div>
  );
}
export default function Home() {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    root.current
      ?.querySelectorAll('.reveal')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} id="top">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <a href="#top" className="brand" aria-label="Junie Zhu home">
          jz<span>✳</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#about">About</a>
          <a href="#contact" className="contact-nav">
            Let’s connect <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="blue-dot" /> YINGCHI “JUNIE” ZHU{' '}
              <span className="location">NJ / NYC</span>
            </p>
            <h1>
              Built with code.
              <br />
              Informed by data.
              <br />
              <span>
                Grounded in
                <br className="desktop-br" /> the real world.
              </span>
            </h1>
            <p className="hero-description">
              I connect software engineering and data analytics with hands-on
              experience in last-mile logistics.
            </p>
            <a className="primary-button" href="#work">
              Explore my work <ArrowDown size={18} />
            </a>
          </div>
          <Network />
          <div className="hero-footer">
            <span>SOFTWARE ENGINEERING × DATA ANALYTICS × OPERATIONS</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </section>
        <section id="work" className="section work">
          <div className="section-heading reveal">
            <p className="eyebrow">01 / SELECTED WORK</p>
            <h2>
              From operational questions
              <br />
              to technical exploration.
            </h2>
            <p>
              Personal projects across analytics, frontend and backend
              development.
            </p>
          </div>
          <div className="projects">
            {profile.projects.map((p, i) => (
              <article
                className={`project reveal ${open === p.id ? 'is-open' : ''}`}
                key={p.id}
              >
                <button
                  className="project-toggle"
                  aria-expanded={open === p.id}
                  aria-controls={`case-${p.id}`}
                  onClick={() => setOpen(open === p.id ? null : p.id)}
                >
                  <span className="project-number">0{i + 1}</span>
                  <div className="project-main">
                    <span className="eyebrow">{p.type}</span>
                    <h3>{p.title}</h3>
                    <p>{p.intro}</p>
                    <span className="stack">{p.stack}</span>
                  </div>
                  <div
                    className={`project-preview preview-${i}`}
                    aria-hidden="true"
                  >
                    {i === 0 ? (
                      <>
                        <span>CAPACITY / EXPLORER</span>
                        <div className="mini-bars">
                          {[50, 82, 65, 95, 72, 58, 88].map((v, j) => (
                            <i key={j} style={{ height: `${v}%` }} />
                          ))}
                        </div>
                        <span>VOLUME ↗ UTILIZATION</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {
                            [
                              '',
                              'STATION / INTERFACE',
                              'SERVER / LOGIC',
                              'MINI / PROGRAM',
                            ][i]
                          }
                        </span>
                        <strong>{['', 'NJ↗', '{ / }', 'ootd.'][i]}</strong>
                        <span>
                          {['', 'FRONTEND', 'NODE + EXPRESS', 'WECHAT'][i]}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="expand-icon">
                    {open === p.id ? <Minus /> : <Plus />}
                    <span className="sr-only">
                      {open === p.id ? 'Close' : 'Read'} case study
                    </span>
                  </span>
                </button>
                <div
                  id={`case-${p.id}`}
                  hidden={open !== p.id}
                  className="case"
                >
                  <div className="case-grid">
                    {[
                      ['Problem', p.problem],
                      ['My Contribution', p.contribution],
                      ['Approach', p.approach],
                      ['Outcome', p.outcome],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <h4>{label}</h4>
                        <p>{value}</p>
                      </div>
                    ))}
                  </div>
                  {p.id === 'capacity' && <Demo />}
                  {p.url && (
                    <a href={p.url}>
                      View project <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="experience" className="section experience">
          <div className="section-heading reveal">
            <p className="eyebrow">02 / REAL-WORLD EXPERIENCE</p>
            <h2>
              Close to the operation.
              <br />
              <span>Closer to the problem.</span>
            </h2>
          </div>
          <div className="experience-body reveal">
            <div>
              <p className="company">GOFO INC</p>
              <h3>
                Capacity Operations
                <br />
                Specialist
              </h3>
              <span className="badge">PROFESSIONAL EXPERIENCE</span>
              {profile.roleDates && <p>{profile.roleDates}</p>}
            </div>
            <div>
              <p className="experience-intro">
                My work sits where delivery plans meet daily reality:
                coordinating capacity, partners and station needs across the
                last mile.
              </p>
              <div className="responsibility">
                <span>01</span>
                <div>
                  <h4>Capacity & coordination</h4>
                  <p>
                    Last-mile delivery capacity, cross-station coordination, and
                    balancing routes with parcel volume.
                  </p>
                </div>
              </div>
              <div className="responsibility">
                <span>02</span>
                <div>
                  <h4>Partner operations</h4>
                  <p>
                    Delivery service provider (DSP) onboarding and management,
                    billing and exception handling.
                  </p>
                </div>
              </div>
              <div className="responsibility">
                <span>03</span>
                <div>
                  <h4>Process improvement</h4>
                  <p>
                    Working through operational issues and improving the
                    processes that support daily delivery execution.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="experience-note">
            This operational context informs the questions I bring to software
            and data projects.
          </div>
        </section>
        <section id="about" className="section about">
          <div className="section-heading reveal">
            <p className="eyebrow">03 / EDUCATION & TOOLKIT</p>
            <h2>
              A technical foundation.
              <br />
              An operational perspective.
            </h2>
          </div>
          <div className="about-grid reveal">
            <div>
              <p className="eyebrow">EDUCATION</p>
              <div className="education">
                <span>NYU</span>
                <div>
                  <h3>New York University</h3>
                  <p>Tandon School of Engineering</p>
                  <strong>M.S. in Computer Engineering</strong>
                </div>
              </div>
              <div className="education">
                <span>UA</span>
                <div>
                  <h3>University of Arizona</h3>
                  <strong>
                    B.S. in Information Science
                    <br />
                    and Technology
                  </strong>
                </div>
              </div>
            </div>
            <div className="skills">
              <p className="eyebrow">TECHNICAL SKILLS</p>
              {Object.entries(profile.skills).map(([label, skills]) => (
                <div key={label}>
                  <h4>{label}</h4>
                  <p>{skills.join(' / ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="contact" className="contact section reveal">
          <p className="eyebrow">04 / WHAT’S NEXT</p>
          <h2>
            Let’s build something
            <br />
            <span>that works in the real world.</span>
          </h2>
          <div className="contact-bottom">
            <p>
              Yingchi Zhu · Call me Junie.
              <br />
              Based in New Jersey / NYC.
            </p>
            <div>
              {profile.email ? (
                <a className="primary-button" href={`mailto:${profile.email}`}>
                  Say hello <ArrowUpRight size={18} />
                </a>
              ) : (
                <p className="contact-note">
                  For opportunities in software engineering
                  <br />
                  and data analytics, please reach out through
                  <br />
                  the channel where you found my portfolio.
                </p>
              )}
              {profile.linkedin && <a href={profile.linkedin}>LinkedIn ↗</a>}
              {profile.github && <a href={profile.github}>GitHub ↗</a>}
              {profile.resume && <a href={profile.resume}>Résumé ↗</a>}
            </div>
          </div>
        </section>
      </main>
      <footer>
        <span>YINGCHI ZHU / JUNIE</span>
        <span>Engineering. Analytics. Operations.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}
