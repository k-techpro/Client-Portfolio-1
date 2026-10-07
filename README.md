# A. Berthinand — Embedded Systems Portfolio

A React, TypeScript and Vite portfolio built around one idea: the website should
behave like an embedded system rather than merely describe one. Hardware
assembles itself, wiring routes subsystem by subsystem, rails come up, firmware
runs, and the projects demonstrate their own output.

```bash
npm install
npm run dev      # development
npm run build    # type-check + production build
npm run preview  # serve the build
```

## Structure

```
src/
  App.tsx                     page composition: hero boot sequence + sections
  signals.ts                  protocol / peripheral waveform generators
  styles.css                  design tokens, scene engine, responsive, reduced motion
  data/portfolio.ts           projects, stages, stage hints, specs, skills, contact
  electronics/Primitives.tsx  physical parts: boards, DIP packages, LCD, relay, pump, wires
  projects/
    ProjectSceneShell.tsx     scroll + manual control, simulation clock, hand-off
    sceneTypes.ts             the scene contract
    scenes/TimerScene.tsx     clock → timer register → firmware → display
    scenes/ADCScene.tsx       analog → sample/hold → quantise → word → LCD
    scenes/IrrigationScene.tsx  sense → decide → actuate → recover
```

## How the scenes work

Each project declares an ordered list of `stages` in `data/portfolio.ts`, plus one
`hints` line per stage. `ProjectSceneShell` maps scroll progress through the
article onto a stage index and renders the matching scene with `{ stage, tick }`.

- **`stage`** is the only thing that changes the composition. Scenes are pure
  functions of stage: parts get `arrive` or `offscreen enter-*`, wires get
  `drawn`, and the staggers `d1`–`d5` order them. All motion lives in
  `styles.css`, so React never animates frame by frame.
- **`tick`** is a 220 ms counter that runs *only while the scene is on screen*.
  It drives the live values — the timer's count register, the ADC's sample
  index, the irrigation soil level — so off-screen scenes cost nothing.

### Controls

Scroll is the primary experience. `PREV` / `NEXT` step through stages, `REPLAY`
returns to the staged components, and `RUN` loops the operating stages in place
so a visitor can stop scrolling and watch the system work. Stepping switches the
scene out of scroll mode; `RUN` toggles back to it.

### Hand-off between projects

At the extremes of a scene's scroll range the frame gets `.tearing`: signals
stop, indicators go dark, the harness retracts along its own path and parts
separate downward. The next project then assembles from nothing. No scene ever
cross-fades into another.

### Adding a part

Add it to `electronics/Primitives.tsx` as a `<g className="part …">` with real
pins, labels and shadow, render `<SceneDefs />` once per scene for the shared
materials, and let the scene pass `arrive` / `offscreen enter-*` plus a stagger
class. Parts should never be flat icons: pins, sockets, PCB thickness, silkscreen
and a plastic/metal distinction are what make the assembly read as hardware.

## Technical honesty

Several details of the original projects are not recorded, and the UI says so
rather than inventing them. Specifically **do not** assert:

- the timer project's display hardware (it is deliberately a neutral,
  configurable module — not a seven-segment or LCD product),
- the external ADC device or its resolution,
- exact thresholds, reload values or crystal frequency,
- measured historical sensor readings,
- pin numbers or wiring not confirmed by the project notes,
- protocols for projects whose notes do not mention them.

Values shown in the scenes are clearly labelled demonstrations of the control
logic and conversion principle. Each project carries a `caveat` string, rendered
beneath its controls, and the panels repeat the qualification inside the scene.

## Responsive behaviour

Desktop gets the full cinematic treatment, including a cursor-aware camera
offset and per-stage framing. Tablet keeps assembly, connection and simulation
with the sticky copy column released. Mobile keeps **assembly → connection →
power on → working output** — the scenes are never replaced by a static card.
Only depth is reduced: bench grid off, shallower shadows, no camera motion.

## Reduced motion

`prefers-reduced-motion` resolves every circuit to its completed, operating
state. Travelling signals, spinning rotors, blinking indicators, the LCD scan
line and the section rails all stop; transitions collapse to near-zero rather
than being removed, so stage changes still read. A hand-off under reduced motion
shows a complete circuit instead of a teardown.

## Performance notes

- The simulation clock is gated on `useInView`, and every interval and listener
  is cleaned up on unmount.
- Scenes are SVG and CSS. There is no WebGL: nothing here needed it, and this
  keeps mobile GPU cost flat.
- Only `transform`, `opacity`, `stroke-dashoffset` and `filter` animate.
- Layout is fixed-aspect (`viewBox` + `height: auto`), so scenes cause no
  cumulative layout shift as they sequence.
