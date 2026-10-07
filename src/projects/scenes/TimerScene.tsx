import { Bus, Crystal, DipMcu, DisplayModule, Grid, Panel, SceneDefs, Wire } from '../../electronics/Primitives';
import type { SceneProps } from '../sceneTypes';

const hex = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
const bits = (n: number) => n.toString(2).padStart(8, '0').split('').join(' ');

/**
 * Timer choreography: package → clock source → display → interconnect →
 * register configuration → counting. The clock is the actor here; pulses
 * travel into the MCU and the count register answers.
 */
export function TimerScene({ stage, tick }: SceneProps) {
  const ge = (n: number) => stage >= n;
  const enter = (n: number, dir: string, delay: string) => (ge(n) ? `arrive ${delay}` : `offscreen enter-${dir} ${delay}`);
  const running = ge(5);

  const count = running ? tick % 256 : 0;
  const seconds = count;
  const display = running ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '--:--';
  const overflow = running && count === 0;

  const state = running
    ? 'TIMER RUNNING · COUNT REGISTER INCREMENTING'
    : ge(4)
      ? 'TIMER CONFIGURED · RUN BIT PENDING'
      : ge(3)
        ? 'INTERCONNECT COMPLETE'
        : 'COMPONENTS STAGED';

  return (
    <svg
      className={`circuit-svg timer-svg stage-${stage}`}
      viewBox="0 0 1120 640"
      role="img"
      aria-label="An 8051 package, crystal and display module assemble, the timer registers are configured, and clock pulses increment the count register"
    >
      <SceneDefs />
      <Grid />
      <text x="26" y="34" className="svg-kicker">
        WORKBENCH / TIMER · 8051 CORE
      </text>
      <text x="1094" y="34" textAnchor="end" className="svg-kicker">
        FIG. 01
      </text>
      <path className="bench-line" d="M0 536h1120" />

      <g className="cam">
        {/* firmware register view */}
        <Panel x={348} y={48} w={452} h={168} title="TIMER REGISTERS · FIRMWARE VIEW" visible={ge(4)}>
          <text x="438" y="24" textAnchor="end" className={`reg-flag ${overflow ? 'is-set' : ''}`}>
            {overflow ? 'TF SET' : 'TF CLEAR'}
          </text>
          <g className="reg-rows">
            <g transform="translate(14 56)">
              <text className="reg-name">TMOD</text>
              <text x="62" className="reg-bits">
                {ge(4) ? '0 0 0 1 0 0 0 1' : '– – – – – – – –'}
              </text>
            </g>
            <g transform="translate(14 86)">
              <text className="reg-name">TCON</text>
              <text x="62" className="reg-bits">
                {running ? '0 1 0 0 0 1 0 0' : ge(4) ? '0 0 0 0 0 0 0 0' : '– – – – – – – –'}
              </text>
            </g>
            <g transform="translate(14 116)">
              <text className="reg-name">THx</text>
              <text x="62" className="reg-bits">
                {ge(4) ? hex(252) : '––'}
              </text>
              <text x="150" className="reg-name">
                TLx
              </text>
              <text x="196" className="reg-bits">
                {running ? hex(count) : ge(4) ? '00' : '––'}
              </text>
            </g>
          </g>
          <path d="M14 64h424M14 94h424" className="reg-rule" />
          <text x="14" y="150" className="panel-note">
            BIT PATTERNS SHOWN FOR DEMONSTRATION · PROJECT VALUES NOT SPECIFIED
          </text>
        </Panel>

        <DipMcu
          x={392}
          y={306}
          pins={20}
          title="AT89C51"
          sub="8051 CORE · 40-PIN DIP"
          note="TIMER 0 / TIMER 1 · 8-BIT PORTS"
          label="8051 MICROCONTROLLER"
          led={running ? 'on-g' : ge(4) ? 'on-g blink' : ''}
          className={enter(0, 'b', 'd1')}
        />

        <Crystal x={120} y={320} className={enter(1, 'l', 'd1')} capsClassName={enter(1, 'l', 'd2')} />

        <DisplayModule x={812} y={300} value={display} className={enter(2, 'r', 'd1')} />

        {/* oscillator line — the clock enters here */}
        <Wire
          d="M190 388 H340 Q352 388 352 376 V352 H400"
          color="#8d6a3f"
          className={`seq-1 ${ge(3) ? 'drawn d1' : ''} ${running ? 'live' : ''}`}
          pads={[
            [190, 388],
            [400, 352]
          ]}
        />
        <g className={`clock-train ${running ? 'ticking' : ''}`} transform="translate(246 388)">
          <rect className="clk-pulse" x="0" y="-16" width="8" height="14" />
          <rect className="clk-pulse" x="0" y="-16" width="8" height="14" />
          <rect className="clk-pulse" x="0" y="-16" width="8" height="14" />
        </g>

        {/* port bus to the display */}
        <Bus
          d="M726 330 H812 M726 346 H812 M726 362 H812 M726 378 H812"
          liveD={running ? 'M726 346 H812' : undefined}
          className={`seq-2 ${ge(3) ? 'drawn d2' : ''} ${running ? 'live' : ''}`}
        />

        {/* ground return */}
        <Wire
          d="M166 442 V512 Q166 524 178 524 H900 Q912 524 912 512 V440"
          color="#3f464c"
          className={`seq-3 ${ge(3) ? 'drawn d3' : ''}`}
          pads={[
            [166, 442],
            [912, 440]
          ]}
        />

        <Panel x={40} y={556} w={430} h={64} title="EXECUTION PATH" visible={ge(4)}>
          <text x="14" y="47" className="panel-value">
            CLOCK → TIMER REGISTER → FIRMWARE → DISPLAY
          </text>
        </Panel>
        <Panel x={640} y={556} w={440} h={64} title="SYSTEM STATE" visible={ge(4)}>
          <text x="16" y="47" className="panel-value">
            {state}
          </text>
        </Panel>

        {/* count register, read as a word */}
        <g className={`count-word ${running ? 'show' : ''}`} transform="translate(812 452)">
          <text className="panel-title">COUNT REGISTER</text>
          <text y="26" className="reg-bits">
            {running ? bits(count) : '– – – – – – – –'}
          </text>
        </g>
      </g>
    </svg>
  );
}
