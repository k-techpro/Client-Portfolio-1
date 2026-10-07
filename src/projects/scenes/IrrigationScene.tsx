import { ArduinoUno, Bus, Grid, Lcd16x2, Lm35, Panel, Pump, RelayModule, SceneDefs, SoilSensor, Wire } from '../../electronics/Primitives';
import type { SceneProps } from '../sceneTypes';

const pad16 = (left: string, right: string) => `${left}${' '.repeat(Math.max(1, 16 - left.length - right.length))}${right}`.slice(0, 16);

/* Demonstration soil level. Stage 6 is the dry condition, stage 7 drives the
   pump and recovers moisture, stage 8 is the settled state. Nothing here is a
   recorded measurement. */
function soilLevel(stage: number, tick: number) {
  if (stage <= 5) return 46;
  if (stage === 6) return 16;
  if (stage === 7) return Math.min(76, 16 + (tick % 26) * 2.6);
  return 76;
}

/**
 * Irrigation choreography — the portfolio's benchmark scene.
 * Board, sensing, actuation, harness, power-on, then a closed control loop:
 * sense → decide → actuate → recover.
 */
export function IrrigationScene({ stage, tick }: SceneProps) {
  const ge = (n: number) => stage >= n;
  const enter = (n: number, dir: string, delay: string) => (ge(n) ? `arrive ${delay}` : `offscreen enter-${dir} ${delay}`);

  const powered = ge(4);
  const pumping = stage === 7;
  const soil = soilLevel(stage, tick);
  const dry = soil < 30;
  const temp = powered ? 31.2 + Math.sin(tick / 12) * 0.3 : 31.2;

  let line1 = ' '.repeat(16);
  let line2 = ' '.repeat(16);
  if (stage === 4) {
    line1 = 'SYSTEM  BOOT';
    line2 = 'LCD INIT  ....';
  } else if (ge(5)) {
    line1 = pad16('TEMP', `${temp.toFixed(1)}C`);
    line2 = pad16(`SOIL ${dry ? 'DRY' : 'OK'}`, `PMP ${pumping ? 'ON' : 'OFF'}`);
  }

  const states = [
    'COMPONENTS STAGED',
    'SENSORS PLACED',
    'ACTUATORS PLACED',
    'ROUTING HARNESS',
    'POWER RAIL UP · FIRMWARE BOOT',
    'MONITORING · SAMPLING BOTH SENSORS',
    'MOISTURE BELOW THRESHOLD',
    'RELAY CLOSED · PUMP RUNNING',
    'MOISTURE RECOVERED · RELAY OPEN'
  ];

  const soilHeight = (soil / 100) * 86;

  return (
    <svg
      className={`circuit-svg irrigation-svg stage-${stage}`}
      viewBox="0 0 1120 640"
      role="img"
      aria-label="An Arduino, LM35, soil sensor, LCD, relay and pump assemble, wire themselves, power on and run a closed irrigation loop"
    >
      <SceneDefs />
      <Grid />
      <path className="bench-line" d="M0 548h1120" />
      <text x="26" y="34" className="svg-kicker">
        WORKBENCH / FIELD CONTROL · ARDUINO UNO
      </text>
      <text x="1094" y="34" textAnchor="end" className="svg-kicker">
        FIG. 03
      </text>

      <g className="cam">
        <ArduinoUno
          x={410}
          y={252}
          powered={powered}
          statusLed={pumping ? 'on-a' : ge(5) ? 'on-g blink' : ''}
          className={enter(0, 'b', 'd1')}
        />

        <Lm35 x={96} y={124} className={enter(1, 'l', 'd1')} />
        <SoilSensor x={130} y={452} led={powered ? 'on-g' : ''} className={enter(1, 'l', 'd3')} />

        <Lcd16x2 x={430} y={52} lit={powered} line1={line1} line2={line2} className={enter(2, 't', 'd1')} />
        <RelayModule x={786} y={258} closed={pumping} led={pumping ? 'on-a' : ''} className={enter(2, 'r', 'd3')} />
        <Pump x={956} y={376} running={pumping} className={enter(2, 'r', 'd5')} />

        {/* demonstration pot — context, not decoration */}
        <g transform="translate(826 452)" className={ge(2) ? 'pot-group arrive' : 'pot-group offscreen'}>
          <path d="M6 44h108l-12 92H18z" className="pot-shell" />
          <rect className="soil-fill" x="14" y={136 - soilHeight} width="92" height={soilHeight} fill={dry ? '#6b4b33' : '#3f6b3a'} />
          <path d="M10 44h100" className="pot-rim" />
          <path d="M60 46V8M60 28C38 26 34 12 36 2c15 1 25 8 24 24M61 20C64 3 77-2 88 0c-1 15-12 24-27 25" className="plant-stem" />
          <text x="60" y="152" textAnchor="middle" className="part-label-sub">
            DEMO SOIL · {Math.round(soil)}%
          </text>
        </g>

        {/* harness — one subsystem at a time */}
        <Wire
          d="M145 216 V436 Q145 448 157 448 H518 Q530 448 530 436 V412"
          color="#8d5f3f"
          className={`seq-1 ${ge(3) ? 'drawn d1' : ''} ${ge(5) ? 'live-slow' : ''}`}
          pads={[
            [145, 216],
            [530, 412]
          ]}
        />
        <Wire
          d="M230 492 H538 Q550 492 550 480 V412"
          color="#4e7d53"
          className={`seq-2 ${ge(3) ? 'drawn d2' : ''} ${ge(5) ? 'live-slow' : ''}`}
          pads={[
            [230, 492],
            [550, 412]
          ]}
        />
        <Bus
          d="M500 254 V166 M520 254 V166 M540 254 V166 M560 254 V166 M580 254 V166 M600 254 V166"
          liveD={powered ? 'M540 254 V166' : undefined}
          className={`seq-3 ${ge(3) ? 'drawn d3' : ''} ${powered ? 'live' : ''}`}
        />
        <Wire
          d="M710 310 H756 Q768 310 768 300 H784"
          color="#b5733f"
          live="10 70"
          className={`seq-4 ${ge(3) ? 'drawn d4' : ''} ${ge(6) ? 'live' : ''}`}
          pads={[
            [710, 310],
            [784, 300]
          ]}
        />
        <Wire
          d="M932 300 H968 Q980 300 980 312 V384"
          color="#8d2f24"
          live="12 60"
          className={`seq-5 pump-wire ${ge(3) ? 'drawn d5' : ''} ${pumping ? 'live' : ''}`}
          pads={[
            [932, 300],
            [980, 384]
          ]}
        />

        {/* water only moves while the pump is driven */}
        <g className={`water-flow ${pumping ? 'flowing' : ''}`}>
          <path d="M1080 448 V508 Q1080 522 1066 522 H912" className="water-channel" />
          <path d="M1080 448 V508 Q1080 522 1066 522 H912" className="water-stream" />
          <circle className="water-drop" r="4">
            <animateMotion dur="1.25s" repeatCount="indefinite" path="M1080 448 V508 Q1080 522 1066 522 H912" />
          </circle>
          <circle className="water-drop is-trailing" r="3">
            <animateMotion dur="1.25s" begin=".45s" repeatCount="indefinite" path="M1080 448 V508 Q1080 522 1066 522 H912" />
          </circle>
        </g>

        <Panel x={40} y={556} w={430} h={64} title="FIRMWARE DECISION · DEMONSTRATION LOGIC" visible={ge(6)}>
          <text x="14" y="47" className="panel-code">
            {'if (soil < '}
            <tspan className="is-amber">[threshold]</tspan>
            {') pump = '}
            <tspan className="is-amber">{pumping ? 'ON' : 'OFF'}</tspan>
            {';'}
          </text>
        </Panel>
        <Panel x={640} y={556} w={440} h={64} title="SYSTEM STATE" visible={powered}>
          <text x="16" y="47" className="panel-value">
            {states[stage]}
          </text>
        </Panel>
      </g>
    </svg>
  );
}
