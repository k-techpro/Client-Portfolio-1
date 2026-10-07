import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { bootLines, contact, projects, skillGroups, workflow } from './data/portfolio';
import { studies, studyNames } from './signals';
import ProjectSceneShell from './projects/ProjectSceneShell';

/* ------------------------------------------------------------------ *
 * Hero — the system wakes up.
 *
 * A single power indicator, then the clock, then the pins activate in
 * sequence, then the board traces carry current, and only then does the
 * name resolve. The whole sequence is CSS-driven off a `boot-N` class so
 * nothing animates per frame in JavaScript.
 * ------------------------------------------------------------------ */
function Hero() {
  const reduced = useReducedMotion();
  const [boot, setBoot] = useState(0);

  useEffect(() => {
    if (reduced) {
      setBoot(5);
      return;
    }
    const marks: [number, number][] = [
      [260, 1],
      [1000, 2],
      [1850, 3],
      [2600, 4],
      [3350, 5]
    ];
    const timers = marks.map(([delay, value]) => window.setTimeout(() => setBoot(value), delay));
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);

  /* Quad pin field around the package: 14 pins per edge. */
  const pins: { key: string; x: number; y: number; w: number; h: number; delay: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const p = 220 + i * 20;
    pins.push({ key: `t${i}`, x: p, y: 168, w: 8, h: 34, delay: i * 26 });
    pins.push({ key: `b${i}`, x: p, y: 498, w: 8, h: 34, delay: i * 26 + 180 });
    pins.push({ key: `l${i}`, x: 168, y: p, w: 34, h: 8, delay: i * 26 + 90 });
    pins.push({ key: `r${i}`, x: 498, y: p, w: 34, h: 8, delay: i * 26 + 270 });
  }

  const traces = [
    'M168 240 H80 Q62 240 62 258 V420 Q62 438 80 438 H168',
    'M532 240 H628 Q646 240 646 258 V140',
    'M240 532 V620 Q240 638 258 638 H470',
    'M460 168 V84 Q460 66 478 66 H628'
  ];

  return (
    <section className={`hero boot-${boot}`} id="top">
      <div className="hero-layout">
        <div className="hero-content">
          <div className="eyebrow reveal r1">
            <span className="eyebrow-line" /> EMBEDDED SYSTEMS / FIRMWARE / HARDWARE
          </div>
          <h1 className="reveal r1">
            A. BERTHI<span>NAND</span>
          </h1>
          <div className="hero-role reveal r2">
            <span>EMBEDDED SYSTEMS</span>
            <b>&amp;</b>
            <span>FIRMWARE ENGINEER</span>
          </div>
          <p className="hero-intro reveal r2">Turning registers, signals and microcontrollers into working systems.</p>
          <div className="hero-actions reveal r3">
            <a className="button button-accent" href="#lab">
              VIEW PROJECT LAB <span>↘</span>
            </a>
            <a className="button button-quiet" href={contact.github} target="_blank" rel="noreferrer">
              GITHUB <span>↗</span>
            </a>
            <a className="button button-quiet" href={`mailto:${contact.email}`}>
              EMAIL <span>↗</span>
            </a>
          </div>
          <div className="boot-log" aria-live="polite">
            {bootLines.map(line => (
              <span key={line.text} className={boot >= line.step ? 'is-on' : ''}>
                {line.text}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <svg
            viewBox="0 0 700 700"
            role="img"
            aria-label="A microcontroller package powers up: the supply indicator lights, a clock signal appears, the pins activate in sequence and the board traces begin carrying current"
          >
            <defs>
              <linearGradient id="hero-package" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2b3238" />
                <stop offset=".45" stopColor="#171c21" />
                <stop offset="1" stopColor="#0a0d10" />
              </linearGradient>
              <linearGradient id="hero-die" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3a4a52" />
                <stop offset="1" stopColor="#1b2429" />
              </linearGradient>
              <radialGradient id="hero-glow" cx=".5" cy=".5">
                <stop offset="0" stopColor="rgba(127,212,200,.13)" />
                <stop offset="1" stopColor="rgba(127,212,200,0)" />
              </radialGradient>
            </defs>

            <circle cx="350" cy="350" r="330" fill="url(#hero-glow)" />
            <g className="grid-lines" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <path key={`v${i}`} d={`M${70 + i * 70} 0v700`} />
              ))}
              {Array.from({ length: 9 }, (_, i) => (
                <path key={`h${i}`} d={`M0 ${70 + i * 70}h700`} />
              ))}
            </g>

            {traces.map(d => (
              <path key={d} className="hero-trace" d={d} />
            ))}
            {traces.slice(0, 3).map(d => (
              <path key={`flow-${d}`} className="hero-flow" d={d} />
            ))}

            <g>
              {pins.map(pin => (
                <rect
                  key={pin.key}
                  className="hero-pin"
                  x={pin.x}
                  y={pin.y}
                  width={pin.w}
                  height={pin.h}
                  style={{ animationDelay: `${pin.delay}ms` }}
                />
              ))}
            </g>

            <rect x="206" y="206" width="292" height="292" fill="#02050a" opacity=".6" />
            <rect x="200" y="200" width="300" height="300" fill="url(#hero-package)" stroke="#05080a" strokeWidth="2" />
            <rect x="214" y="214" width="272" height="272" fill="none" stroke="rgba(255,255,255,.05)" />
            <circle cx="238" cy="238" r="9" fill="none" stroke="rgba(255,255,255,.14)" />
            <circle cx="238" cy="238" r="3.5" fill="#4b545b" />
            <g className="hero-die">
              <rect x="268" y="268" width="164" height="164" fill="url(#hero-die)" opacity=".5" />
              <path
                d="M268 300h164M268 330h164M268 360h164M268 390h164M298 268v164M328 268v164M358 268v164M388 268v164"
                stroke="rgba(127,212,200,.16)"
                strokeWidth="1"
              />
            </g>
            <text x="350" y="332" textAnchor="middle" className="hero-chip-text">
              AB · 8051
            </text>
            <text x="350" y="362" textAnchor="middle" className="hero-chip-sub">
              EMBEDDED SYSTEMS
            </text>
            <text x="350" y="384" textAnchor="middle" className="hero-chip-sub">
              FIRMWARE ENGINEER
            </text>
            <text x="350" y="430" textAnchor="middle" className="hero-chip-note">
              CHENNAI · INDIA
            </text>

            <circle className="hero-power" cx="624" cy="604" r="7" />
            <text x="604" y="632" textAnchor="middle" className="hero-chip-note">
              PWR
            </text>
            <path
              className="hero-clock"
              d="M48 664 H84 V634 H120 V664 H156 V634 H192 V664 H228 V634 H264 V664 H300 V634 H336 V664 H372 V634 H408 V664 H444 V634 H480 V664 H516"
            />
            <text x="48" y="690" className="hero-chip-note">
              CLK
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div className="section-heading">
      <span>
        {index} / {label}
      </span>
      <span>{title}</span>
    </div>
  );
}

function Connector() {
  return (
    <div className="connector" aria-hidden="true">
      <span />
    </div>
  );
}

function About() {
  return (
    <section className="section about-section" id="about">
      <SectionHeading index="01" label="ENGINEERING IDENTITY" title="ABOUT THE ENGINEER" />
      <div className="about-layout">
        <div>
          <h2 className="section-title">
            Curious by nature.
            <br />
            <em>Precise by design.</em>
          </h2>
          <p className="about-text">
            I am an Electronics and Communication Engineering student drawn to the layer where code meets current. I work with
            microcontrollers, firmware and real hardware, building a careful understanding of how a system behaves from pin to output.
          </p>
          <div className="fact-grid">
            <div>
              <span>FOCUS</span>
              <strong>LOW-LEVEL SYSTEMS</strong>
            </div>
            <div>
              <span>METHOD</span>
              <strong>BUILD · DEBUG · VALIDATE</strong>
            </div>
            <div>
              <span>BASED IN</span>
              <strong>CHENNAI, INDIA</strong>
            </div>
          </div>
        </div>

        <div className="identity-card">
          <div className="identity-card-head">
            <span>ENGINEER PROFILE</span>
            <span>001 / ACTIVE</span>
          </div>
          <div className="identity-chip">
            <svg viewBox="0 0 220 150" aria-hidden="true">
              <g fill="#9aa4ab">
                {Array.from({ length: 7 }, (_, i) => (
                  <g key={i}>
                    <rect x={34 + i * 24} y="10" width="7" height="12" />
                    <rect x={34 + i * 24} y="128" width="7" height="12" />
                  </g>
                ))}
              </g>
              <rect x="26" y="22" width="168" height="106" fill="#1a1f24" stroke="#05080a" strokeWidth="1.5" />
              <path d="M26 66a11 11 0 0 0 0 20z" fill="#0a0d10" />
              <text x="110" y="72" textAnchor="middle" className="identity-mark">
                A.B.
              </text>
              <text x="110" y="94" textAnchor="middle" className="identity-sub">
                ECE · 40-PIN THINKING
              </text>
              <circle cx="178" cy="36" r="4" fill="#79dc8f" />
            </svg>
          </div>
          <div className="identity-rows">
            <div>
              <span>DEGREE</span>
              <strong>B.E. ECE</strong>
            </div>
            <div>
              <span>EXPECTED</span>
              <strong>2027</strong>
            </div>
            <div>
              <span>PINOUT</span>
              <strong>01.01</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Interactive embedded architecture: pick a subsystem, see its signal. */
function Stack() {
  const [selected, setSelected] = useState('UART');
  const study = studies[selected] ?? studies.UART;

  return (
    <section className="section stack-section" id="stack">
      <SectionHeading index="02" label="TECHNICAL STACK" title="EMBEDDED ARCHITECTURE" />
      <div className="stack-layout">
        <div className="stack-intro">
          <h2>
            Every pin has
            <br />
            <em>a purpose.</em>
          </h2>
          <p>Select a peripheral or protocol to see what it actually does on the wire.</p>
          <div className="stack-categories">
            {skillGroups.map(group => (
              <div className="skill-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="skill-items">
                  {group.items.map(item => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="signal-lab">
          <div className="scope-head">
            <span>PERIPHERAL / PROTOCOL STUDY</span>
            <span>{selected}</span>
          </div>
          <div className="signal-select">
            {studyNames.map(name => (
              <button
                key={name}
                type="button"
                className={selected === name ? 'selected' : ''}
                onClick={() => setSelected(name)}
                onMouseEnter={() => setSelected(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="wave-scope">
            <svg viewBox="0 0 760 250" key={selected} role="img" aria-label={`${selected} waveform`}>
              <g className="grid-lines" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <path key={`v${i}`} d={`M${40 + i * 80} 0v250`} />
                ))}
                {Array.from({ length: 4 }, (_, i) => (
                  <path key={`h${i}`} d={`M0 ${50 + i * 50}h760`} />
                ))}
              </g>
              <g transform="translate(26 18)">
                {study.lanes.map((lane, i) => (
                  <g key={lane.name} transform={`translate(0 ${i * 58})`}>
                    <text x="-22" y="30" className="lane-name">
                      {lane.name}
                    </text>
                    <path d="M0 48H714" className="lane-base" />
                    <path className="lane" d={lane.d} />
                  </g>
                ))}
              </g>
            </svg>
          </div>
          <p className="scope-note">{study.note}</p>
        </div>
      </div>
    </section>
  );
}

/* Firmware passing through its stages — no progress bars, no percentages. */
function Experience() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setActive(i => (i + 1) % workflow.length), 1400);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <section className="section experience-section" id="experience">
      <SectionHeading index="03" label="EXPERIENCE" title="FIRMWARE DEVELOPMENT CYCLE" />
      <div className="experience-layout">
        <div className="experience-main">
          <div className="experience-date">
            MAY 2024 — JULY 2024 <span>12 WEEKS</span>
          </div>
          <h2>MetaWyse</h2>
          <div className="experience-role">
            INTERN <span>·</span> EMBEDDED SYSTEMS
          </div>
          <p>
            Hands-on firmware work spanning microcontroller programming, debugging and testing, contributing to hardware–software
            integration and embedded code validation.
          </p>
          <p className="project-note">Internship scope as recorded. No proprietary project detail is shown.</p>
        </div>

        <ol className="workflow">
          {workflow.map((item, i) => (
            <li key={item.step} className={`workflow-step ${i === active ? 'is-active' : i < active ? 'is-done' : ''}`}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <span className="workflow-node" />
              <strong>{item.step}</strong>
              <small>{item.sub}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProjectLab() {
  return (
    <section className="section lab-section" id="lab">
      <SectionHeading index="04" label="INTERACTIVE PROJECTS" title="PROJECT LAB · THREE SYSTEMS" />
      <div className="lab-head">
        <h2>
          Watch the system
          <br />
          <em>come online.</em>
        </h2>
        <p>
          Each scene assembles its own hardware, routes its own wiring and then runs. Scroll to sequence, or step through with the
          controls.
        </p>
      </div>
      <div className="project-scenes">
        {projects.map((project, i) => (
          <ProjectSceneShell key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

function Credentials() {
  return (
    <section className="section credentials-section" id="credentials">
      <SectionHeading index="05" label="CREDENTIALS" title="STUDY & RECOGNITION" />
      <div className="credentials-grid">
        <div className="credential-block">
          <h2>
            Built on
            <br />
            <em>strong basics.</em>
          </h2>
          <span className="credential-label">CERTIFICATIONS</span>
          <div className="credential-row">
            <span>01</span>
            <div>
              <strong>Embedded Systems</strong>
              <small>NPTEL · IIT MADRAS</small>
            </div>
          </div>
          <div className="credential-row">
            <span>02</span>
            <div>
              <strong>C Programming</strong>
              <small>SKILLRACK</small>
            </div>
          </div>
        </div>

        <div className="education-block">
          <span className="credential-label">EDUCATION</span>
          <div className="edu-year">
            2023 — 2027 <i>EXPECTED</i>
          </div>
          <h3>
            Peri Institute
            <br />
            of Technology
          </h3>
          <p>B.E. Electronics and Communication Engineering</p>
          <div className="edu-footer">
            <span>CHENNAI, INDIA</span>
            <b>
              CGPA <i>6.9</i> / 10
            </b>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const rows = [
    { key: 'EMAIL', value: contact.email, href: `mailto:${contact.email}` },
    { key: 'PHONE', value: contact.phone, href: contact.phoneHref },
    { key: 'LINKEDIN', value: contact.linkedinLabel, href: contact.linkedin },
    { key: 'GITHUB', value: contact.githubLabel, href: contact.github }
  ];

  return (
    <section className="contact-section" id="contact">
      <SectionHeading index="06" label="NEXT CONNECTION" title="OPEN CIRCUIT" />
      <div className="contact-content">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-line" /> GOT A SYSTEM TO BUILD?
          </span>
          <h2>
            Let’s make
            <br />
            <em>it work.</em>
          </h2>
          <p>For embedded projects, internship opportunities or a good conversation about hardware and firmware.</p>
        </div>
        <div className="contact-rows">
          {rows.map(row => (
            <a
              key={row.key}
              href={row.href}
              {...(row.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <span>{row.key}</span>
              <strong>{row.value}</strong>
              <b>↗</b>
            </a>
          ))}
        </div>
      </div>
      <div className="contact-footer">
        <span>A. BERTHINAND · EMBEDDED SYSTEMS &amp; FIRMWARE ENGINEER</span>
        <a href="#top">BACK TO TOP ↑</a>
        <span>{contact.location}</span>
      </div>
    </section>
  );
}

function TopBar() {
  const [menu, setMenu] = useState(false);
  const links = [
    ['about', 'PROFILE'],
    ['stack', 'STACK'],
    ['lab', 'PROJECT LAB'],
    ['experience', 'EXPERIENCE'],
    ['contact', 'CONTACT']
  ];

  return (
    <>
      <header className="topbar">
        <a href="#top" className="brand">
          <span className="brand-mark">AB</span>
          <span>
            A. BERTHINAND
            <small>EMBEDDED SYSTEMS ENGINEER</small>
          </span>
        </a>
        <nav>
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <span className="availability">
          <i /> OPEN TO OPPORTUNITIES
        </span>
      </header>

      <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>
        {menu ? '×' : '☰'}
      </button>
      {menu && (
        <div className="mobile-menu">
          <button aria-label="Close navigation" onClick={() => setMenu(false)}>
            ×
          </button>
          {links.map(([id, label]) => (
            <a href={`#${id}`} onClick={() => setMenu(false)} key={id}>
              {label} ↘
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <>
      <TopBar />
      <Hero />
      <main>
        <Connector />
        <About />
        <Connector />
        <Stack />
        <Connector />
        <Experience />
        <Connector />
        <ProjectLab />
        <Connector />
        <Credentials />
        <Connector />
        <Contact />
      </main>
    </>
  );
}
