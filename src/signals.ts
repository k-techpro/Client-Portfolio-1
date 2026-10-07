/* ------------------------------------------------------------------ *
 * Protocol and peripheral waveforms.
 *
 * Each study returns labelled lanes as SVG paths, so hovering a node in
 * the stack section shows what the signal actually does on the wire.
 * These are teaching illustrations, not captures from any project.
 * ------------------------------------------------------------------ */

export type Lane = { name: string; d: string };
export type Study = { note: string; lanes: Lane[] };

const WIDTH = 714;
const HIGH = 8;
const LOW = 40;

/** Square-wave path from a bit pattern. */
function levels(pattern: number[]) {
  const slot = WIDTH / pattern.length;
  let x = 0;
  let d = `M0 ${pattern[0] ? HIGH : LOW}`;
  pattern.forEach((bit, i) => {
    const y = bit ? HIGH : LOW;
    if (i) d += ` L${x.toFixed(1)} ${y}`;
    x += slot;
    d += ` L${x.toFixed(1)} ${y}`;
  });
  return d;
}

/** `cycles` complete clock periods. */
function clock(cycles: number) {
  return Array.from({ length: cycles * 2 }, (_, i) => (i % 2 === 0 ? 0 : 1));
}

/** Stepped path from a list of levels, used for counters and held samples. */
function steps(values: number[]) {
  const slot = WIDTH / values.length;
  let d = '';
  values.forEach((y, i) => {
    d += `${i ? ' L' : 'M'}${(i * slot).toFixed(1)} ${y.toFixed(1)} L${((i + 1) * slot).toFixed(1)} ${y.toFixed(1)}`;
  });
  return d;
}

const DATA_BYTE = [1, 0, 1, 1, 0, 0, 1, 0];

export const studies: Record<string, Study> = {
  UART: {
    note: 'ASYNCHRONOUS · ONE START BIT, EIGHT DATA BITS, ONE STOP BIT · NO SHARED CLOCK',
    lanes: [
      { name: 'TX', d: levels([1, 1, 0, ...DATA_BYTE, 1, 1, 1]) },
      { name: 'RX', d: levels([1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1]) }
    ]
  },
  'I²C': {
    note: 'TWO WIRES, ADDRESSED, CLOCK DRIVEN BY THE MASTER · START AND STOP CONDITIONS FRAME THE BYTE',
    lanes: [
      { name: 'SCL', d: levels([1, 1, ...clock(8), 1, 1]) },
      { name: 'SDA', d: levels([1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1]) }
    ]
  },
  SPI: {
    note: 'FOUR WIRES, FULL DUPLEX · CHIP SELECT FRAMES THE TRANSFER, DATA SHIFTS ON THE CLOCK EDGE',
    lanes: [
      { name: 'SCLK', d: levels([1, 1, ...clock(8), 1, 1]) },
      { name: 'MOSI', d: levels([1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1]) },
      { name: 'MISO', d: levels([1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1]) },
      { name: 'CS', d: levels([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]) }
    ]
  },
  PWM: {
    note: 'FIXED PERIOD, VARYING ON-TIME · THE AVERAGE VOLTAGE FOLLOWS THE DUTY CYCLE',
    lanes: [
      { name: '25%', d: levels([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]) },
      { name: '50%', d: levels([1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0]) },
      { name: '75%', d: levels([1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0]) }
    ]
  },
  ADC: {
    note: 'A CONTINUOUS LEVEL BECOMES A NUMBER · SAMPLE, HOLD, COMPARE, ENCODE',
    lanes: [
      {
        name: 'ANALOG',
        d: (() => {
          let d = 'M0 24';
          for (let x = 6; x <= WIDTH; x += 6) d += ` L${x} ${(24 - Math.sin((2 * Math.PI * x) / 360) * 16).toFixed(1)}`;
          return d;
        })()
      },
      {
        name: 'HELD',
        d: steps(
          Array.from({ length: 12 }, (_, i) => {
            const slot = WIDTH / 12;
            return 24 - Math.round((Math.sin((2 * Math.PI * (i * slot + slot / 2)) / 360) * 16) / 4) * 4;
          })
        )
      }
    ]
  },
  TIMER: {
    note: 'EVERY PULSE ADVANCES THE COUNT REGISTER · OVERFLOW RAISES THE FLAG',
    lanes: [
      { name: 'CLK', d: levels(clock(12)) },
      { name: 'COUNT', d: steps(Array.from({ length: 12 }, (_, i) => 40 - (i % 6) * 6)) },
      { name: 'FLAG', d: levels([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]) }
    ]
  },
  GPIO: {
    note: 'A PIN DRIVEN HIGH OR LOW UNDER FIRMWARE CONTROL · READ AS INPUT, SET AS OUTPUT',
    lanes: [
      { name: 'PORT', d: levels([0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0]) },
      { name: 'READ', d: levels([0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]) }
    ]
  },
  INTERRUPT: {
    note: 'MAIN LOOP YIELDS ON THE REQUEST, THE SERVICE ROUTINE RUNS, EXECUTION RESUMES WHERE IT LEFT OFF',
    lanes: [
      { name: 'MAIN', d: levels([1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]) },
      { name: 'IRQ', d: levels([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
      { name: 'ISR', d: levels([0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]) }
    ]
  }
};

export const studyNames = Object.keys(studies);
