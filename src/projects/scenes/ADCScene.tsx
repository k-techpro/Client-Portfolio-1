import { AnalogSensor, Bus, DipMcu, Grid, Lcd16x2, SceneDefs, Wire } from '../../electronics/Primitives';
import type { SceneProps } from '../sceneTypes';

const WAVE_W = 660;
const SAMPLES = 16;
const SPACING = WAVE_W / SAMPLES;
const AMP = 55;
const PERIOD = 330;
const STEP = AMP / 4;

const analogAt = (x: number) => -Math.sin((2 * Math.PI * x) / PERIOD) * AMP;
const quantise = (y: number) => Math.round(y / STEP) * STEP;

const sinePath = () => {
  let d = `M0 ${analogAt(0).toFixed(1)}`;
  for (let x = 6; x <= WAVE_W; x += 6) d += ` L${x} ${analogAt(x).toFixed(1)}`;
  return d;
};

const stairPath = () => {
  let d = '';
  for (let i = 0; i < SAMPLES; i++) {
    const y = quantise(analogAt(i * SPACING + SPACING / 2)).toFixed(1);
    d += `${i === 0 ? `M0 ${y}` : ` L${(i * SPACING).toFixed(1)} ${y}`} L${((i + 1) * SPACING).toFixed(1)} ${y}`;
  }
  return d;
};

const SINE = sinePath();
const STAIR = stairPath();

const pad16 = (left: string, right: string) => `${left}${' '.repeat(Math.max(1, 16 - left.length - right.length))}${right}`.slice(0, 16);

/**
 * ADC choreography: the conversion itself is the subject. The waveform is
 * expanded across the bench, quantisation levels overlay it, the held
 * sample becomes a staircase, then a word, then characters on the LCD.
 */
export function ADCScene({ stage, tick }: SceneProps) {
  const ge = (n: number) => stage >= n;
  const enter = (n: number, dir: string, delay: string) => (ge(n) ? `arrive ${delay}` : `offscreen enter-${dir} ${delay}`);

  const k = ge(3) ? tick % SAMPLES : 0;
  const held = quantise(analogAt(k * SPACING + SPACING / 2));
  const volts = 2.5 + (-held / AMP) * 2;
  const code = Math.round((volts / 5) * 255);

  const lit = ge(7);
  const state = lit
    ? 'SAMPLE → CONVERT → PROCESS → DISPLAY · LOOPING'
    : ge(5)
      ? 'DIGITAL WORD READY'
      : ge(3)
        ? 'SAMPLING ANALOG INPUT'
        : ge(2)
          ? 'SIGNAL PATH ROUTED'
          : 'COMPONENTS STAGED';

  return (
    <svg
      className={`circuit-svg adc-svg stage-${stage}`}
      viewBox="0 0 1120 640"
      role="img"
      aria-label="An analog voltage is sampled, quantised to discrete levels, encoded as a binary word, processed by the 8051 and displayed on a 16 by 2 LCD"
    >
      <SceneDefs />
      <Grid />
      <text x="26" y="34" className="svg-kicker">
        WORKBENCH / SIGNAL PATH · ANALOG TO DIGITAL
      </text>
      <text x="1094" y="34" textAnchor="end" className="svg-kicker">
        FIG. 02
      </text>

      <g className="cam">
        <AnalogSensor x={54} y={150} className={enter(0, 'l', 'd1')} />

        <DipMcu
          x={272}
          y={140}
          width={144}
          height={76}
          pins={6}
          title="ADC"
          sub="CONVERTER MODULE"
          note="DEVICE CONFIGURABLE"
          label="ADC MODULE"
          led={lit ? 'on-g' : ''}
          className={enter(1, 'b', 'd1')}
        />

        <DipMcu
          x={508}
          y={146}
          width={236}
          height={94}
          pins={14}
          title="8051"
          sub="PORT READ · SCALE · WRITE"
          label="8051 MICROCONTROLLER"
          led={lit ? 'on-g' : ''}
          className={enter(1, 'b', 'd3')}
        />

        <Lcd16x2
          x={810}
          y={138}
          lit={lit}
          line1={lit ? 'SENSOR  INPUT' : ' '.repeat(16)}
          line2={lit ? pad16('', `${volts.toFixed(2)} V`) : ' '.repeat(16)}
          className={enter(1, 'r', 'd5')}
        />

        {/* analog line */}
        <Wire
          d="M164 178 H268"
          color="#2e6b64"
          className={`seq-1 ${ge(2) ? 'drawn d1' : ''} ${ge(3) ? 'live-slow' : ''}`}
          live="10 60"
          pads={[
            [164, 178],
            [268, 178]
          ]}
        />
        {/* data bus into the MCU */}
        <Bus
          d="M420 160 H504 M420 176 H504 M420 192 H504 M420 208 H504"
          liveD={ge(6) ? 'M420 176 H504' : undefined}
          className={`seq-2 ${ge(2) ? 'drawn d2' : ''} ${ge(6) ? 'live' : ''}`}
        />
        <text x="462" y="146" textAnchor="middle" className="pin-t bus-label">
          DATA BUS
        </text>
        {/* MCU to display */}
        <Bus
          d="M750 176 H806 M750 192 H806 M750 208 H806"
          liveD={lit ? 'M750 192 H806' : undefined}
          className={`seq-3 ${ge(2) ? 'drawn d3' : ''} ${lit ? 'live' : ''}`}
        />

        {/* the transformation itself */}
        <g transform="translate(40 300)">
          <rect width="1040" height="300" className="panel-bg" />
          <text x="18" y="26" className="zone-title">
            SIGNAL TRANSFORMATION · THE CONVERSION ITSELF
          </text>
          <text x="1022" y="26" textAnchor="end" className="svg-kicker">
            {ge(3) ? `SAMPLE ${String(k + 1).padStart(2, '0')} / ${SAMPLES}` : 'SAMPLE —'}
          </text>
          <path d="M18 38H1022" className="panel-rule" />

          <g transform="translate(40 170)">
            <path d="M0 -84H660M0 84H660" className="scope-bound" />
            <g className={`quant-levels ${ge(4) ? 'show' : ''}`}>
              <path className="qline" d="M0 -55H660M0 -41.25H660M0 -27.5H660M0 -13.75H660M0 0H660M0 13.75H660M0 27.5H660M0 41.25H660M0 55H660" />
              <text x="668" y="-52" className="pin-t">
                LEVELS
              </text>
              <text x="668" y="-38" className="pin-t">
                ILLUSTRATIVE
              </text>
            </g>
            <path className="sine-ghost" d={SINE} />
            <path className="sine" d={SINE} />
            <path className={`stair ${ge(4) ? 'show' : ''}`} d={STAIR} />
            <g className="sample-marker" style={{ transform: `translateX(${(k * SPACING + SPACING / 2).toFixed(1)}px)` }}>
              <path d="M0 -96V96" className="marker-line" />
              <g className="marker-hold" style={{ transform: `translateY(${held.toFixed(1)}px)` }}>
                <circle r="6" className="hold-dot" />
                <circle r="12" className="hold-ring" />
              </g>
            </g>
            <text x="0" y="118" className="pin-t">
              t
            </text>
            <text x="-18" y="-80" className="pin-t">
              V
            </text>
          </g>

          <text x="58" y="78" className="zone-title">
            CONTINUOUS INPUT
          </text>
          <text x="330" y="78" className="zone-title">
            SAMPLE &amp; HOLD → QUANTISE
          </text>

          <g transform="translate(768 60)">
            <path d="M0 0V220" className="panel-rule" />
            <text x="24" y="18" className="panel-title">
              DIGITAL WORD
            </text>
            <text x="24" y="54" className="word-bits">
              {ge(5) ? code.toString(2).padStart(8, '0').split('').join(' ') : '– – – – – – – –'}
            </text>
            <g transform="translate(24 86)">
              <text className="kv-key">HEX</text>
              <text x="224" textAnchor="end" className="kv-val">
                {ge(5) ? `0x${code.toString(16).toUpperCase().padStart(2, '0')}` : '0x––'}
              </text>
              <path d="M0 10h224" className="panel-rule" />
              <text y="34" className="kv-key">
                SCALED
              </text>
              <text x="224" y="34" textAnchor="end" className="kv-val is-amber">
                {ge(3) ? `${volts.toFixed(2)} V` : '—— V'}
              </text>
            </g>
            <g transform="translate(24 138)">
              <rect width="224" height="6" className="bar-track" />
              <rect width={ge(5) ? (code / 255) * 224 : 0} height="6" className="bar-fill" />
            </g>
            <text x="24" y="180" className="panel-note">
              8-BIT SCALING SHOWN FOR DEMONSTRATION
            </text>
            <text x="24" y="196" className="panel-note">
              DEVICE RESOLUTION NOT SPECIFIED
            </text>
          </g>
        </g>

        <g transform="translate(40 622)">
          <text className="panel-value">{state}</text>
          <text x="1040" textAnchor="end" className="svg-kicker">
            SAMPLE → CONVERT → PROCESS → DISPLAY
          </text>
        </g>
      </g>
    </svg>
  );
}
