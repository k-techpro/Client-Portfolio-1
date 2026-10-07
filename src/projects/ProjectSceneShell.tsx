import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import type { Project } from '../data/portfolio';
import type { SceneProps } from './sceneTypes';
import { TimerScene } from './scenes/TimerScene';
import { ADCScene } from './scenes/ADCScene';
import { IrrigationScene } from './scenes/IrrigationScene';

const sceneMap: Record<Project['id'], FC<SceneProps>> = {
  timer: TimerScene,
  adc: ADCScene,
  irrigation: IrrigationScene
};

/** Stage from which a project keeps operating on its own. */
const liveFrom: Record<Project['id'], number> = { timer: 5, adc: 7, irrigation: 5 };

type Mode = 'scroll' | 'manual' | 'loop';

/**
 * Drives one project scene.
 *
 * Scroll remains the primary cinematic experience: scroll progress maps to a
 * stage index. PREV / NEXT / REPLAY let a visitor stop and inspect, and RUN
 * loops the working simulation in place. At the very start and end of the
 * scroll range the scene is marked `tearing`, which powers the circuit down
 * and retracts the harness so one project hands off to the next instead of
 * cross-fading.
 */
export default function ProjectSceneShell({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isInView = useInView(ref, { margin: '140px 0px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<Mode>('scroll');
  const [manualStage, setManualStage] = useState(0);
  const [tick, setTick] = useState(0);

  const lastStage = project.stages.length - 1;

  useMotionValueEvent(scrollYProgress, 'change', value => {
    setProgress(Math.max(0, Math.min(1, value)));
  });

  const scrollStage = reduced ? lastStage : Math.min(lastStage, Math.floor(progress * project.stages.length));
  const stage = mode === 'scroll' ? scrollStage : manualStage;
  const tearing = !reduced && mode === 'scroll' && (progress > 0.965 || progress < 0.012);

  /* The simulation clock. Runs only while the scene is on screen, so
     off-screen scenes cost nothing, and never under reduced motion. */
  useEffect(() => {
    if (!isInView || reduced) return;
    const id = window.setInterval(() => setTick(t => t + 1), 220);
    return () => window.clearInterval(id);
  }, [isInView, reduced]);

  /* RUN cycles the operating stages in place. */
  useEffect(() => {
    if (mode !== 'loop' || reduced) return;
    const from = liveFrom[project.id];
    const id = window.setInterval(() => {
      setManualStage(s => (s >= lastStage ? from : Math.max(from, s + 1)));
    }, 2600);
    return () => window.clearInterval(id);
  }, [mode, reduced, project.id, lastStage]);

  const step = useCallback(
    (delta: number) => {
      setManualStage(current => {
        const base = mode === 'scroll' ? scrollStage : current;
        return Math.max(0, Math.min(lastStage, base + delta));
      });
      setMode('manual');
    },
    [mode, scrollStage, lastStage]
  );

  const replay = useCallback(() => {
    setManualStage(0);
    setMode('manual');
  }, []);

  const toggleRun = useCallback(() => {
    if (mode === 'loop') {
      setMode('scroll');
      return;
    }
    const from = liveFrom[project.id];
    setManualStage(current => Math.max(from, mode === 'scroll' ? scrollStage : current));
    setMode('loop');
  }, [mode, scrollStage, project.id]);

  /* Cursor parallax: a small, controlled camera offset, desktop only. */
  const viewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced || !isInView) return;
    const el = viewportRef.current;
    if (!el || window.matchMedia('(max-width: 760px)').matches) return;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const my = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.setProperty('--mx', `${(mx * 9).toFixed(2)}px`);
      el.style.setProperty('--my', `${(my * 6).toFixed(2)}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, isInView]);

  const Scene = sceneMap[project.id];
  const scene = useMemo(() => (isInView ? <Scene stage={stage} tick={tick} /> : null), [Scene, stage, tick, isInView]);

  return (
    <article
      className={`project-row project-${project.id}`}
      id={`project-${project.id}`}
      ref={ref}
      style={{ '--accent': project.accent } as CSSProperties}
    >
      <div className="project-copy">
        <div className="project-meta">
          <span>PROJECT {project.number}</span>
          <span>{project.eyebrow}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>

        <div className="scene-readout">
          <span className="signal-led" />
          <span>{project.stages[stage]}</span>
          <span className="stage-count">
            {String(stage + 1).padStart(2, '0')} / {String(project.stages.length).padStart(2, '0')}
          </span>
        </div>
        <div className="stage-track" aria-label="Scene progress">
          {project.stages.map((name, i) => (
            <span key={name} className={i === stage ? 'is-current' : i < stage ? 'is-past' : ''} />
          ))}
        </div>
        <p className="stage-hint">{project.hints[stage]}</p>

        <div className="scene-controls" role="group" aria-label={`${project.title} scene controls`}>
          <button type="button" onClick={() => step(-1)} disabled={stage === 0}>
            PREV
          </button>
          <button type="button" onClick={() => step(1)} disabled={stage === lastStage}>
            NEXT
          </button>
          <button type="button" onClick={replay}>
            REPLAY
          </button>
          <button type="button" onClick={toggleRun} className={mode === 'loop' ? 'is-active' : ''}>
            {mode === 'loop' ? 'SCROLL' : 'RUN'}
          </button>
        </div>

        <div className="component-list">
          {project.components.map((part, i) => (
            <span className={`component-chip ${stage >= Math.min(i, 2) ? 'is-present' : ''}`} key={part}>
              {part}
            </span>
          ))}
        </div>

        <dl className="project-spec">
          {project.spec.map(row => (
            <div key={row.key}>
              <dt>{row.key}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        {project.caveat && <p className="project-note">{project.caveat}</p>}
      </div>

      <div className="scene-viewport" ref={viewportRef}>
        <div className="scene-topline">
          <span>LIVE CIRCUIT SIMULATION</span>
          <span>SCROLL TO SEQUENCE ↓</span>
        </div>
        <div className={`scene-frame ${tearing ? 'tearing' : ''}`}>{scene}</div>
        <div className="scene-foot">
          <span>FIG. {String(index + 1).padStart(2, '0')} / ASSEMBLY LOGIC</span>
          <span>{Math.round(progress * 100).toString().padStart(3, '0')}% SEQUENCE</span>
        </div>
      </div>
    </article>
  );
}
