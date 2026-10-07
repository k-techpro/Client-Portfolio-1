import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ *
 * Shared scene primitives.
 *
 * Every part renders as <g class="part …">. The scene decides whether a
 * part has arrived by giving it `arrive` or one of the `enter-*` classes;
 * all motion lives in styles.css so React only ever re-renders markup.
 * ------------------------------------------------------------------ */

export type PartProps = { x: number; y: number; className?: string; label?: string };

const DEFS_ID = {
  metal: 'mat-metal',
  pcbGreen: 'mat-pcb-green',
  pcbBlue: 'mat-pcb-blue',
  plastic: 'mat-plastic',
  dip: 'mat-dip',
  glassOn: 'mat-glass-on',
  glassOff: 'mat-glass-off',
  pump: 'mat-pump',
  pixels: 'mat-pixels'
};

/** One shared <defs> block. Render once per scene, before any part. */
export function SceneDefs() {
  return (
    <defs>
      <linearGradient id={DEFS_ID.metal} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d4dade" />
        <stop offset=".45" stopColor="#99a3aa" />
        <stop offset="1" stopColor="#5e676e" />
      </linearGradient>
      <linearGradient id={DEFS_ID.pcbGreen} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#12403e" />
        <stop offset="1" stopColor="#08201f" />
      </linearGradient>
      <linearGradient id={DEFS_ID.pcbBlue} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#15375c" />
        <stop offset="1" stopColor="#091b2e" />
      </linearGradient>
      <linearGradient id={DEFS_ID.plastic} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#23292f" />
        <stop offset="1" stopColor="#0d1114" />
      </linearGradient>
      <linearGradient id={DEFS_ID.dip} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#262b30" />
        <stop offset=".5" stopColor="#15191d" />
        <stop offset="1" stopColor="#0b0e11" />
      </linearGradient>
      <linearGradient id={DEFS_ID.glassOn} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f8f63" />
        <stop offset="1" stopColor="#1d5a3c" />
      </linearGradient>
      <linearGradient id={DEFS_ID.glassOff} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#16241d" />
        <stop offset="1" stopColor="#0d1713" />
      </linearGradient>
      <radialGradient id={DEFS_ID.pump} cx=".35" cy=".3">
        <stop offset="0" stopColor="#4b545b" />
        <stop offset="1" stopColor="#1a1f23" />
      </radialGradient>
      <pattern id={DEFS_ID.pixels} width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="2.1" height="2.1" fill="rgba(0,0,0,.16)" />
      </pattern>
    </defs>
  );
}

/* ---------- small shared bits ---------- */

/** A row of gold-finger pins along one edge. */
function PinRow({ count, x, y, pitch, vertical = false, len = 9 }: { count: number; x: number; y: number; pitch: number; vertical?: boolean; len?: number }) {
  return (
    <g fill={`url(#${DEFS_ID.metal})`}>
      {Array.from({ length: count }, (_, i) =>
        vertical ? (
          <rect key={i} x={x} y={y + i * pitch} width={len} height="4" />
        ) : (
          <rect key={i} x={x + i * pitch} y={y} width="4" height={len} />
        )
      )}
    </g>
  );
}

/** Through-hole DIP leads down both long edges. */
function DipLeads({ count, width, height }: { count: number; width: number; height: number }) {
  const pitch = width / count;
  return (
    <g fill={`url(#${DEFS_ID.metal})`}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <rect x={pitch * i + pitch * 0.3} y={-14} width="8" height="14" />
          <rect x={pitch * i + pitch * 0.3} y={height} width="8" height="14" />
        </g>
      ))}
    </g>
  );
}

export function Led({ cx, cy, state = '' }: { cx: number; cy: number; state?: '' | 'on' | 'on-g' | 'on-a' | 'on-g blink' }) {
  return <circle cx={cx} cy={cy} r="5" className={`led ${state}`} />;
}

export function Pad({ cx, cy }: { cx: number; cy: number }) {
  return <circle className="pad" cx={cx} cy={cy} r="4" />;
}

/* ---------- boards and packages ---------- */

/** Arduino-type board: USB and barrel jack, headers, MCU, crystal, reset, LEDs. */
export function ArduinoUno({ x, y, className = '', powered, statusLed }: PartProps & { powered: boolean; statusLed: '' | 'on' | 'on-g' | 'on-a' | 'on-g blink' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <rect x="2" y="6" width="300" height="172" fill="#030607" opacity=".55" />
        <rect width="300" height="172" fill={`url(#${DEFS_ID.pcbGreen})`} stroke="#071a19" strokeWidth="2" />
        <rect x="6" y="6" width="288" height="160" className="silk" />
        {[
          [16, 16],
          [284, 16],
          [16, 156],
          [284, 156]
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" className="hole" />
        ))}

        {/* USB-B */}
        <rect x="-16" y="22" width="34" height="48" fill={`url(#${DEFS_ID.metal})`} stroke="#444c52" />
        <rect x="-10" y="30" width="22" height="32" fill="#2a3135" />
        {/* barrel jack */}
        <rect x="-12" y="108" width="30" height="40" fill={`url(#${DEFS_ID.plastic})`} stroke="#000" />
        <circle cx="-2" cy="128" r="6" fill="#05070a" />

        {/* digital header */}
        <rect x="66" y="2" width="186" height="15" fill="#0a0d10" stroke="#000" />
        <PinRow count={15} x={70} y={5} pitch={12} />
        <text x="66" y="28" className="pin-t">DIGITAL  (PWM ~)</text>

        {/* power + analog header */}
        <rect x="40" y="155" width="210" height="15" fill="#0a0d10" stroke="#000" />
        <PinRow count={17} x={46} y={158} pitch={12} />
        <text x="40" y="150" className="pin-t">POWER</text>
        <text x="150" y="150" className="pin-t">ANALOG IN</text>

        {/* MCU */}
        <rect x="96" y="62" width="124" height="54" fill="#10151a" stroke="#05080a" strokeWidth="1.5" />
        <path d="M96 84a10 10 0 0 0 0 10" fill="#05080a" />
        <g fill="#8b949b">
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={100 + i * 16} y="56" width="7" height="7" />
              <rect x={100 + i * 16} y="115" width="7" height="7" />
            </g>
          ))}
        </g>
        <text x="158" y="86" textAnchor="middle" className="silk-t">ATmega328P</text>
        <text x="158" y="100" textAnchor="middle" className="pin-t">8-BIT AVR MCU</text>

        {/* crystal, reset */}
        <rect x="40" y="46" width="30" height="16" fill={`url(#${DEFS_ID.metal})`} stroke="#3f474d" />
        <text x="55" y="76" textAnchor="middle" className="pin-t">XTAL</text>
        <rect x="262" y="40" width="22" height="22" fill="#2a3036" stroke="#0a0d10" />
        <circle cx="273" cy="51" r="6" fill="#55606a" />
        <text x="273" y="74" textAnchor="middle" className="pin-t">RST</text>

        <text x="20" y="100" className="silk-t board-wordmark">UNO</text>
        <Led cx={246} cy={128} state={powered ? 'on' : ''} />
        <text x="232" y="146" className="pin-t">ON</text>
        <Led cx={226} cy={128} state={statusLed} />
        <text x="208" y="146" className="pin-t">L13</text>
      </g>
      <text x="150" y="208" textAnchor="middle" className={`part-label ${className}`}>
        ARDUINO UNO
      </text>
    </g>
  );
}

/** Through-hole DIP microcontroller with pin-1 notch and chip markings. */
export function DipMcu({
  x,
  y,
  className = '',
  width = 332,
  height = 120,
  pins = 20,
  title,
  sub,
  note,
  label,
  led = ''
}: PartProps & { width?: number; height?: number; pins?: number; title: string; sub?: string; note?: string; led?: '' | 'on' | 'on-g' | 'on-g blink' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <DipLeads count={pins} width={width} height={height} />
        <rect x="4" y="8" width={width - 4} height={height - 2} fill="#02050a" opacity=".6" />
        <rect width={width} height={height} fill={`url(#${DEFS_ID.dip})`} stroke="#05080a" strokeWidth="1.5" />
        <path d={`M0 ${height / 2 - 12}a12 12 0 0 0 0 24z`} fill="#0a0d10" stroke="#05080a" />
        <rect x="8" y="8" width={width - 16} height={height - 16} fill="none" stroke="rgba(255,255,255,.045)" />
        <circle cx="22" cy={height - 16} r="4" fill="#3b4349" />
        <text x={width / 2} y={height * 0.42} textAnchor="middle" className="package-title">
          {title}
        </text>
        {sub && (
          <text x={width / 2} y={height * 0.62} textAnchor="middle" className="pin-t package-sub">
            {sub}
          </text>
        )}
        {note && (
          <text x={width / 2} y={height * 0.8} textAnchor="middle" className="pin-t">
            {note}
          </text>
        )}
        {led !== '' && <Led cx={width - 22} cy={24} state={led} />}
      </g>
      {label && (
        <text x={width / 2} y={height + 62} textAnchor="middle" className={`part-label ${className}`}>
          {label}
        </text>
      )}
    </g>
  );
}

/** 16×2 character LCD: bezel, glass, pixel grid, header, mounting holes. */
export function Lcd16x2({ x, y, className = '', lit, line1, line2, label = 'CHARACTER LCD · 16 × 2' }: PartProps & { lit: boolean; line1: string; line2: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <rect x="2" y="5" width="264" height="108" fill="#030607" opacity=".5" />
        <rect width="264" height="108" fill="#15191d" stroke="#05080a" strokeWidth="2" />
        <rect x="10" y="100" width="150" height="12" fill="#0a0d10" stroke="#000" />
        <PinRow count={16} x={14} y={103} pitch={9} len={7} />
        {[
          [8, 8],
          [256, 8],
          [8, 92],
          [256, 92]
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" className="hole" />
        ))}
        <g className={lit ? 'lit' : undefined}>
          <rect x="20" y="16" width="224" height="68" className="lcd-glass" fill={`url(#${lit ? DEFS_ID.glassOn : DEFS_ID.glassOff})`} stroke="#0a120e" />
          <rect x="20" y="16" width="224" height="68" fill={`url(#${DEFS_ID.pixels})`} opacity=".5" />
          <text x="32" y="44" className="lcd-chars" xmlSpace="preserve">
            {line1}
          </text>
          <text x="32" y="70" className="lcd-chars" xmlSpace="preserve">
            {line2}
          </text>
          <rect x="20" y="16" width="224" height="10" className="lcd-scan" />
        </g>
        <text x="196" y="96" className="pin-t">16 × 2</text>
      </g>
      <text x="264" y="134" textAnchor="end" className={`part-label ${className}`}>
        {label}
      </text>
    </g>
  );
}

/** Hardware-neutral display module — deliberately not a seven-segment or LCD product. */
export function DisplayModule({ x, y, className = '', value, label = 'DISPLAY MODULE' }: PartProps & { value: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x="129" y="-28" textAnchor="middle" className={`part-label ${className}`}>
        {label}
      </text>
      <text x="129" y="-12" textAnchor="middle" className={`part-label-sub ${className}`}>
        TYPE CONFIGURABLE
      </text>
      <g className={`part lift ${className}`}>
        <rect x="3" y="6" width="258" height="134" fill="#02050a" opacity=".55" />
        <rect width="258" height="134" fill="#15191d" stroke="#05080a" strokeWidth="2" />
        <rect x="18" y="18" width="222" height="76" fill="#16241d" stroke="#0a120e" />
        <text x="129" y="68" textAnchor="middle" className="display-value">
          {value}
        </text>
        <rect x="18" y="104" width="120" height="12" fill="#0a0d10" stroke="#000" />
        <PinRow count={12} x={22} y={107} pitch={9} len={7} />
        <text x="240" y="114" textAnchor="end" className="pin-t">
          HEADER
        </text>
      </g>
    </g>
  );
}

/** LM35-style TO-92 temperature sensor with three legs. */
export function Lm35({ x, y, className = '' }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <path d="M8 44a30 30 0 0 1 60 0v30H8z" fill={`url(#${DEFS_ID.plastic})`} stroke="#05070a" strokeWidth="1.5" />
        <path d="M8 60h60" stroke="rgba(255,255,255,.07)" />
        <ellipse cx="38" cy="38" rx="16" ry="11" fill="#2d3439" opacity=".8" />
        <text x="38" y="42" textAnchor="middle" className="silk-t">
          LM35
        </text>
        <g stroke={`url(#${DEFS_ID.metal})`} strokeWidth="3.2">
          <path d="M22 74v18" />
          <path d="M38 74v18" />
          <path d="M54 74v18" />
        </g>
        <text x="20" y="104" className="pin-t">+Vs  OUT  GND</text>
      </g>
      <text x="38" y="124" textAnchor="middle" className={`part-label ${className}`}>
        LM35 · TEMP
      </text>
    </g>
  );
}

/** Soil-moisture probe: board, header, status LED, two electrodes. */
export function SoilSensor({ x, y, className = '', led = '' }: PartProps & { led?: '' | 'on' | 'on-g' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <rect width="96" height="46" fill={`url(#${DEFS_ID.pcbBlue})`} stroke="#06121d" strokeWidth="1.5" />
        <rect x="4" y="4" width="88" height="38" className="silk" />
        <rect x="60" y="12" width="30" height="22" fill="#0e1318" stroke="#000" />
        <PinRow count={3} x={64} y={15} pitch={8} len={7} />
        <circle cx="22" cy="23" r="6" className={`led ${led}`} />
        <text x="8" y="40" className="pin-t">A0 · MOIST</text>
        <g fill={`url(#${DEFS_ID.metal})`}>
          <rect x="24" y="46" width="9" height="72" />
          <rect x="58" y="46" width="9" height="72" />
        </g>
        <path d="M24 118h9l-4.5 10zM58 118h9l-4.5 10z" fill="#8c959c" />
      </g>
      <text x="48" y="152" textAnchor="middle" className={`part-label ${className}`}>
        SOIL MOISTURE
      </text>
    </g>
  );
}

/** Relay module: control side (coil, armature) and switch side (screw terminals). */
export function RelayModule({ x, y, className = '', closed, led = '' }: PartProps & { closed: boolean; led?: '' | 'on' | 'on-a' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <rect x="2" y="5" width="152" height="104" fill="#030607" opacity=".5" />
        <rect width="152" height="104" fill={`url(#${DEFS_ID.pcbBlue})`} stroke="#06121d" strokeWidth="2" />
        <rect x="5" y="5" width="142" height="94" className="silk" />
        <rect x="-2" y="34" width="22" height="34" fill="#0e1318" stroke="#000" />
        <PinRow count={3} x={4} y={38} pitch={10} vertical len={4} />
        <text x="24" y="44" className="pin-t">IN</text>
        <text x="24" y="54" className="pin-t">VCC</text>
        <text x="24" y="64" className="pin-t">GND</text>

        <g className={closed ? 'closed' : undefined}>
          <rect x="48" y="22" width="60" height="58" fill="#16365f" stroke="#081527" strokeWidth="1.5" opacity=".92" />
          <rect x="52" y="26" width="52" height="50" fill="rgba(10,22,38,.55)" />
          <rect x="56" y="34" width="16" height="34" fill="#2a4a74" className="coil-f" />
          <rect x="56" y="34" width="16" height="34" fill="none" stroke="#4e7bb0" strokeWidth="1.2" />
          <path d="M58 38h12M58 44h12M58 50h12M58 56h12M58 62h12" stroke="#7fa6d4" strokeWidth="1" opacity=".5" />
          <rect className="arm" x="76" y="42" width="26" height="4" fill={`url(#${DEFS_ID.metal})`} />
          <circle cx="80" cy="44" r="2.5" fill="#cdd4d9" />
          <circle cx="100" cy="38" r="2" fill="#9aa4ab" />
          <circle cx="100" cy="54" r="2" fill="#9aa4ab" />
          <text x="78" y="72" className="pin-t">NO / NC</text>
        </g>

        <rect x="112" y="24" width="34" height="54" fill="#1d5a2e" stroke="#0a2514" />
        <g fill="#b9c1c7">
          <rect x="120" y="32" width="18" height="4" />
          <rect x="120" y="48" width="18" height="4" />
          <rect x="120" y="64" width="18" height="4" />
        </g>
        <circle cx="30" cy="86" r="5" className={`led ${led}`} />
        <text x="42" y="90" className="pin-t">ACTIVE</text>
      </g>
      <text x="76" y="134" textAnchor="middle" className={`part-label ${className}`}>
        RELAY MODULE
      </text>
    </g>
  );
}

/** DC pump: housing, impeller that spins when driven, outlet and hose. */
export function Pump({ x, y, className = '', running }: PartProps & { running: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <rect x="4" y="8" width="84" height="76" fill="#030607" opacity=".5" />
        <rect x="8" y="12" width="78" height="72" rx="6" fill={`url(#${DEFS_ID.pump})`} stroke="#0a0e11" strokeWidth="2" />
        <ellipse cx="47" cy="12" rx="39" ry="9" fill="#39424a" stroke="#0a0e11" />
        <g className={running ? 'spin' : undefined}>
          <circle cx="47" cy="50" r="21" fill="#141a1e" stroke="#2c343a" />
          <g className="rotor">
            <path d="M47 32v36M29 50h36M34 37l26 26M60 37L34 63" stroke="#7b858c" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="47" cy="50" r="5" fill="#aab3b9" />
          </g>
        </g>
        <path d="M86 56h20v16H86z" fill="#2b3237" stroke="#0a0e11" />
        <path d="M106 60c14 0 18 8 18 18" fill="none" stroke="#1d2328" strokeWidth="9" strokeLinecap="round" />
        <text x="47" y="104" textAnchor="middle" className="part-label-sub">
          12 V DC
        </text>
      </g>
      <text x="47" y="126" textAnchor="middle" className={`part-label ${className}`}>
        WATER PUMP
      </text>
    </g>
  );
}

/** Metal-can crystal with two load capacitors. */
export function Crystal({ x, y, className = '', capsClassName = '' }: PartProps & { capsClassName?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x="47" y="-28" textAnchor="middle" className={`part-label ${className}`}>
        CRYSTAL + CAPS
      </text>
      <text x="47" y="-12" textAnchor="middle" className={`part-label-sub ${className}`}>
        VALUE CONFIGURABLE
      </text>
      <g className={`part lift ${className}`}>
        <path d="M0 14a14 14 0 0 1 14-14h66a14 14 0 0 1 14 14v34H0z" fill={`url(#${DEFS_ID.metal})`} stroke="#49525a" />
        <path d="M6 20h82" stroke="rgba(255,255,255,.4)" strokeWidth="1" />
        <text x="47" y="34" textAnchor="middle" className="crystal-mark">
          XTAL
        </text>
        <g stroke={`url(#${DEFS_ID.metal})`} strokeWidth="3">
          <path d="M24 48v20" />
          <path d="M70 48v20" />
        </g>
      </g>
      <g className={`part lift ${capsClassName}`}>
        <circle cx="14" cy="86" r="11" fill="#9a7b3c" stroke="#5c4a24" />
        <circle cx="80" cy="86" r="11" fill="#9a7b3c" stroke="#5c4a24" />
        <g stroke={`url(#${DEFS_ID.metal})`} strokeWidth="2.4">
          <path d="M14 97v14" />
          <path d="M80 97v14" />
        </g>
      </g>
    </g>
  );
}

/** Generic analog sensor board with a trimmer and a 4-pin header. */
export function AnalogSensor({ x, y, className = '' }: PartProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`part lift ${className}`}>
        <rect width="104" height="56" fill={`url(#${DEFS_ID.pcbBlue})`} stroke="#06121d" strokeWidth="1.5" />
        <rect x="4" y="4" width="96" height="48" className="silk" />
        <circle cx="30" cy="28" r="15" fill="#2b3238" stroke="#141a1f" />
        <path d="M30 28 L42 19" stroke="#c6ced4" strokeWidth="2.4" />
        <circle cx="30" cy="28" r="3" fill="#8e979e" />
        <rect x="70" y="14" width="22" height="28" fill="#0e1318" stroke="#000" />
        <g fill={`url(#${DEFS_ID.metal})`}>
          <rect x="75" y="18" width="4" height="7" />
          <rect x="83" y="18" width="4" height="7" />
          <rect x="75" y="30" width="4" height="7" />
          <rect x="83" y="30" width="4" height="7" />
        </g>
        <text x="8" y="50" className="pin-t">Vout 0 – 5 V</text>
      </g>
      <text x="52" y="82" textAnchor="middle" className={`part-label ${className}`}>
        ANALOG SENSOR
      </text>
    </g>
  );
}

/* ---------- interconnect ---------- */

/**
 * A routed wire. The jacket, the conductor and the travelling signal all
 * follow the same path, so a signal always runs *through* the wire.
 */
export function Wire({
  d,
  className = '',
  color = '#8d5f3f',
  width = 4.5,
  live,
  pads
}: {
  d: string;
  className?: string;
  color?: string;
  width?: number;
  live?: string;
  pads?: readonly [number, number][];
}) {
  return (
    <g className={`wire-group ${className}`}>
      <path className="wire-jacket" d={d} />
      <path className="wire-core" d={d} stroke={color} strokeWidth={width} />
      <path className="wire-live" d={d} strokeDasharray={live} />
      {pads?.map(([cx, cy]) => (
        <Pad key={`${cx}-${cy}`} cx={cx} cy={cy} />
      ))}
      {pads?.length ? <circle className="snap" cx={pads[pads.length - 1][0]} cy={pads[pads.length - 1][1]} r="2" /> : null}
    </g>
  );
}

/** A parallel bus: several conductors drawn as one group. */
export function Bus({ d, className = '', liveD }: { d: string; className?: string; liveD?: string }) {
  return (
    <g className={`wire-group ${className}`}>
      <path className="wire-jacket bus" d={d} />
      <path className="wire-core bus" d={d} stroke="#6a717a" strokeWidth="2.6" />
      {liveD && <path className="wire-live" d={liveD} strokeDasharray="10 70" />}
    </g>
  );
}

/** Bench grid. Hidden by CSS when the viewer turns decoration down. */
export function Grid({ w = 1120, h = 640, step = 40 }: { w?: number; h?: number; step?: number }) {
  return (
    <g className="grid-lines" aria-hidden="true">
      {Array.from({ length: Math.floor(w / step) }, (_, i) => (
        <path key={`v${i}`} d={`M${i * step} 0v${h}`} />
      ))}
      {Array.from({ length: Math.floor(h / step) }, (_, i) => (
        <path key={`h${i}`} d={`M0 ${i * step}h${w}`} />
      ))}
    </g>
  );
}

/** A floating annotation panel — register views, decision logic, state read-outs. */
export function Panel({ x, y, w, h, title, visible, children }: { x: number; y: number; w: number; h: number; title: string; visible: boolean; children?: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`panel ${visible ? 'show' : ''}`}>
        <rect width={w} height={h} className="panel-bg" />
        <text x="14" y="24" className="panel-title">
          {title}
        </text>
        {children}
      </g>
    </g>
  );
}

export function Trace({ d }: { d: string }) {
  return <path d={d} className="pcb-trace" />;
}
