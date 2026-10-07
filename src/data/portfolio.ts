export type ProjectId = 'timer' | 'adc' | 'irrigation';

export type Project = {
  id: ProjectId;
  number: string;
  title: string;
  eyebrow: string;
  description: string;
  components: string[];
  tags: string[];
  stages: readonly string[];
  /** One short line per stage, shown beside the scene as it sequences. */
  hints: readonly string[];
  /** Compact engineering annotations rendered as a key/value list. */
  spec: readonly { key: string; value: string }[];
  accent: string;
  /** Honest note about anything the project notes do not confirm. */
  caveat?: string;
};

export const projects: Project[] = [
  {
    id: 'timer',
    number: '01',
    title: 'Digital timer',
    eyebrow: '8051 · Embedded C',
    description:
      'A clock source, the on-chip timer registers and a display module assembled into one working circuit: pulses in, count out.',
    components: ['8051 MCU', 'Crystal + caps', 'Display module'],
    tags: ['8051', 'AT89C51', 'Timer registers', 'Keil µVision 5', 'Proteus'],
    stages: ['PACKAGE', 'CLOCK', 'DISPLAY', 'WIRING', 'CONFIGURE', 'COUNTING'],
    hints: [
      'The 8051 package arrives on the bench.',
      'Crystal and load capacitors arrive.',
      'A hardware-neutral display module arrives.',
      'Oscillator, port bus and ground are routed in turn.',
      'TMOD selects the mode; TCON enables the run bit.',
      'Each clock pulse increments the count register; overflow sets the flag.'
    ],
    spec: [
      { key: 'MICROCONTROLLER', value: '8051 · AT89C51' },
      { key: 'LANGUAGE', value: 'Embedded C' },
      { key: 'TOOLS', value: 'Keil µVision 5 · Proteus' }
    ],
    accent: '#7fd4c8',
    caveat:
      'Display hardware, crystal value and reload values are not specified in the project notes. The module and register values shown are a configurable demonstration.'
  },
  {
    id: 'adc',
    number: '02',
    title: 'ADC interfacing',
    eyebrow: '8051 · Analog input',
    description:
      'A continuous sensor voltage is held, compared against discrete steps, encoded as a word, read by the 8051 and written to a 16×2 LCD.',
    components: ['Analog sensor', 'ADC module', '8051 MCU', '16×2 LCD'],
    tags: ['8051', 'ADC interfacing', 'Embedded C', '16×2 LCD'],
    stages: ['SENSOR', 'CONVERTER', 'WIRING', 'SAMPLE', 'QUANTIZE', 'ENCODE', 'PROCESS', 'DISPLAY'],
    hints: [
      'An analog sensor arrives.',
      'A conversion module arrives; its device type stays configurable.',
      'Analog line, data bus and display lines are routed.',
      'The converter holds the analog level at the sampling instant.',
      'The held level is compared against discrete steps.',
      'The step index becomes a binary word.',
      'The word crosses the data bus into the 8051.',
      'Firmware scales the word and writes characters to the LCD.'
    ],
    spec: [
      { key: 'MICROCONTROLLER', value: '8051' },
      { key: 'LANGUAGE', value: 'Embedded C' },
      { key: 'OUTPUT', value: '16 × 2 character LCD' }
    ],
    accent: '#bf7a4d',
    caveat:
      'The converter device and its resolution are not specified in the project notes. Levels, word width and voltages here illustrate the conversion principle.'
  },
  {
    id: 'irrigation',
    number: '03',
    title: 'Smart temperature monitoring & automatic irrigation',
    eyebrow: 'Arduino · Closed-loop control',
    description:
      'Temperature and soil moisture feed an Arduino. When the demonstration soil dries, firmware closes a relay and the pump runs until moisture recovers.',
    components: ['Arduino UNO', 'LM35', 'Soil sensor', '16×2 LCD', 'Relay module', 'DC pump'],
    tags: ['Arduino UNO', 'LM35', 'Soil moisture', 'Relay control', 'Embedded C'],
    stages: ['BOARD', 'SENSORS', 'ACTUATORS', 'WIRING', 'POWER ON', 'MONITOR', 'DECIDE', 'IRRIGATE', 'RECOVER'],
    hints: [
      'Board arrives on the bench.',
      'Temperature and moisture sensing arrive.',
      'Display, relay and pump arrive.',
      'Each subsystem is wired in turn.',
      'Rail energises, firmware boots, display initialises.',
      'Firmware samples both sensors.',
      'Comparison against the configured threshold.',
      'Output pin high, relay closed, pump driving water.',
      'Moisture restored; output pin low, relay opens.'
    ],
    spec: [
      { key: 'CONTROLLER', value: 'Arduino UNO · ATmega328P' },
      { key: 'SENSING', value: 'LM35 · soil moisture' },
      { key: 'ACTUATION', value: 'Relay module · DC pump' }
    ],
    accent: '#e3a33c',
    caveat:
      'Readings, threshold and wiring positions shown are a demonstration of the control logic, not recorded measurements.'
  }
];

export const skillGroups = [
  { title: 'PROGRAMMING', items: ['C', 'Embedded C'] },
  { title: 'MCUs / PLATFORMS', items: ['8051', 'AT89C51', 'ATmega', 'Arduino', 'ARM · Basic'] },
  { title: 'PROTOCOLS', items: ['UART', 'I²C', 'SPI'] },
  { title: 'PERIPHERALS', items: ['ADC', 'Timers', 'PWM', 'GPIO', 'Interrupts'] },
  { title: 'TOOLS', items: ['Keil µVision', 'Proteus', 'Arduino IDE', 'STM32CubeIDE', 'MPLAB X IDE'] },
  { title: 'OPERATING SYSTEM', items: ['Linux · Beginner'] }
];

export const bootLines = [
  { text: 'PWR  RAIL STABLE', step: 1 },
  { text: 'CLK  OSCILLATOR SOURCE DETECTED', step: 2 },
  { text: 'GPIO PORTS INITIALISED', step: 3 },
  { text: 'SYSTEM ONLINE', step: 4 },
  { text: 'FIRMWARE INITIALISED', step: 4 },
  { text: 'PORTFOLIO READY', step: 5 }
];

export const workflow = [
  { step: 'WRITE CODE', sub: 'EMBEDDED C' },
  { step: 'COMPILE', sub: 'KEIL µVISION' },
  { step: 'FLASH', sub: 'TARGET DEVICE' },
  { step: 'DEBUG', sub: 'STEP / INSPECT' },
  { step: 'TEST', sub: 'ON HARDWARE' },
  { step: 'VALIDATE', sub: 'SIGN-OFF' }
];

export const contact = {
  email: 'berthinand99@gmail.com',
  phone: '+91 98845 50536',
  phoneHref: 'tel:+919884550536',
  linkedin: 'https://linkedin.com/in/berthinand-a-76884628a',
  linkedinLabel: 'berthinand-a',
  github: 'https://github.com/a-berthinand',
  githubLabel: 'a-berthinand',
  location: 'CHENNAI, INDIA · 13°04′ N / 80°16′ E'
};
