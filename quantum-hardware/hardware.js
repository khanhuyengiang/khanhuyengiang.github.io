// Quantum hardware explorer. Plain script, no dependencies.
// To add a platform, append an object to PLATFORMS; every key under `parts` must be one of the node ids in index.html.
// Each part is [component name, [bullet, ...]]. Numbers are typical order-of-magnitude values, not records.

const PLATFORMS = [
  {
    id: 'superconducting',
    name: 'Superconducting',
    tag: 'Transmons on a chip, in a fridge',
    blurb: ['Artificial atoms: superconducting circuits patterned on a chip', 'Controlled with microwaves; gates are fast', 'Needs millikelvin temperatures'],
    temp: '10–20 mK',
    conn: 'Nearest neighbour on a 2D lattice',
    perf: {
      typical: { gate: '~30 ns / ~100–500 ns', fid: '~99.9% / ~99.5%', qubits: '~100', life: 'T₁ ~100–300 µs' },
      sota: { gate: '~10 ns / ~30 ns', fid: '~99.99% / ~99.9%', qubits: '1,000+ (lower quality)', life: 'T₁ ~1 ms' },
    },
    advantage: { items: ['Very fast gates', 'Lithographic fabrication that already scales'], nodes: ['qubit', 'chip'] },
    challenge: { items: ['Millikelvin cooling', 'A cable for every qubit: wiring and fridge size limit scaling'], nodes: ['env', 'delivery'] },
    players: 'IBM, Google, Rigetti, IQM, Alice & Bob, and many university labs.',
    parts: {
      software: ['Circuit compiler and calibration stack', ['Compile circuits to pulses', 'Calibration (Qibocal, Qiskit Experiments) keeps gate parameters tuned', 'Re-run several times a day']],
      control: ['AWGs and RFSoC FPGAs', ['4–8 GHz microwave pulses via IQ mixing', 'Fast flux pulses for tunable elements', 'Digitise the returned readout signal']],
      delivery: ['Attenuated coaxial lines', ['Coax through each fridge stage', '~60 dB attenuation and filters cut thermal noise', 'Separate flux lines']],
      readout: ['Resonator, parametric amplifier, HEMT', ['Dispersive readout through a resonator', 'TWPA or JPA at mK, then HEMT at 4 K', 'Room-temperature amplifiers']],
      env: ['Dilution refrigerator', ['Staged cooling from 300 K to ~10 mK', 'Infrared and magnetic shielding around the chip']],
      chip: ['Al or Nb films on silicon or sapphire', ['Josephson junctions: Al/AlOₓ/Al', 'Cleanroom fabrication', 'Wire-bonded in a metal package']],
      qubit: ['Transmon', ['Nonlinear LC oscillator at ~4–6 GHz', 'Two lowest levels, split by the Josephson junction']],
      coupling: ['Capacitive or tunable couplers', ['Fixed coupling: cross-resonance (ZX) gates', 'Tunable couplers: CZ and iSWAP-type gates']],
    },
  },
  {
    id: 'ions',
    name: 'Trapped ions',
    tag: 'Atoms held by electric fields',
    blurb: ['Charged atoms suspended in vacuum by electric fields, manipulated with lasers', 'Identical, highly coherent qubits', 'Slower gates'],
    temp: 'Trap at 300 K or ~4 K',
    conn: 'All-to-all in a chain; shuttling between zones',
    perf: {
      typical: { gate: '~5 µs / ~100–200 µs', fid: '~99.9% / ~99.5%', qubits: '~30', life: 'T₂ ~ seconds' },
      sota: { gate: '~µs / ~2 µs (fast gates)', fid: '~99.9999% / ~99.9%', qubits: '~100', life: 'T₂ ~ 1 hour' },
    },
    advantage: { items: ['Identical, long-lived qubits', 'All-to-all connectivity', 'Best gate fidelities'], nodes: ['qubit', 'coupling'] },
    challenge: { items: ['Slow gates', 'Trap and laser delivery are hard to scale beyond tens of ions'], nodes: ['chip', 'delivery'] },
    players: 'Quantinuum, IonQ, Alpine Quantum Technologies, Oxford Ionics, and many university labs.',
    parts: {
      software: ['Circuit compiler and pulse sequencer', ['Compile to native Mølmer–Sørensen and single-qubit rotations', 'Sequencers (e.g. ARTIQ) run the experiment timing']],
      control: ['FPGA sequencer, DDS and AWGs', ['RF tones drive acousto-optic modulators', 'Lasers locked to reference cavities']],
      delivery: ['Laser beams and optics', ['Beams through AOMs and individual-addressing optics', 'Free-space or fibre delivery', 'RF and DC lines to the trap electrodes']],
      readout: ['Fluorescence detection', ['Resonant laser: one state fluoresces, the other stays dark', 'PMT or camera counts photons in ~100 µs to ms']],
      env: ['Ultra-high vacuum chamber', ['~10⁻¹¹ mbar, so collisions are rare', 'Some systems add a 4–10 K cryostat to cut heating and background gas']],
      chip: ['Paul trap', ['Blade or surface-electrode design', 'RF and DC electrodes confine ions in a linear chain', 'Shuttling between zones (QCCD)']],
      qubit: ['Atomic ion (¹⁷¹Yb⁺, ¹³³Ba⁺, ⁴³Ca⁺, ⁴⁰Ca⁺)', ['Two hyperfine or optical levels of a single ion', 'Every qubit identical']],
      coupling: ['Shared motional modes', ['Lasers couple the spins to collective vibration', 'Mølmer–Sørensen entangling gate']],
    },
  },
  {
    id: 'neutral-atoms',
    name: 'Neutral atoms',
    tag: 'Tweezer arrays in vacuum',
    blurb: ['Atoms held in optical tweezers, entangled via Rydberg states', 'Geometry reconfigurable on the fly', 'Hundreds to thousands of atoms'],
    temp: 'Room temperature; atoms laser-cooled to ~µK',
    conn: 'Reconfigurable; atoms can be moved',
    perf: {
      typical: { gate: '~1 µs / ~0.3 µs', fid: '~99.5% / ~99%', qubits: '~100–300', life: 'T₂ ~ 1 s' },
      sota: { gate: '~µs / ~0.2 µs', fid: '~99.9% / ~99.5%', qubits: '~6,000 trapped atoms', life: 'T₂ ~ 10 s' },
    },
    advantage: { items: ['Large, reconfigurable arrays', 'Identical atoms; hundreds to thousands of qubits'], nodes: ['chip', 'qubit'] },
    challenge: { items: ['Slow cycles: imaging takes ~ms', 'Lost atoms must be reloaded'], nodes: ['readout', 'env'] },
    players: 'QuEra, Pasqal, Atom Computing, Infleqtion, and many university labs.',
    parts: {
      software: ['Circuit and analog-mode compiler', ['Circuits map to laser pulses and atom-movement schedules', 'Same hardware runs analog Hamiltonian simulation']],
      control: ['AWGs, FPGAs and laser systems', ['Drive the AODs and spatial light modulators that shape the tweezers', 'Time the Raman and Rydberg laser pulses']],
      delivery: ['High-NA objective and laser beams', ['Objective focuses light into the vacuum cell', 'AODs steer individual tweezers']],
      readout: ['Fluorescence imaging', ['Camera (EMCCD or sCMOS) images each atom', 'Atom present or missing gives the state, in ~ms']],
      env: ['Vacuum cell with laser cooling', ['Atoms loaded from a magneto-optical trap, cooled to µK', 'Apparatus at room temperature']],
      chip: ['Optical-tweezer array', ['No chip: focused laser spots are the traps', 'Arranged in 1D, 2D or 3D patterns']],
      qubit: ['Neutral atom (⁸⁷Rb, ¹³³Cs, ⁸⁸Sr, ¹⁷¹Yb)', ['Hyperfine or nuclear-spin levels', 'Rydberg states used only during gates']],
      coupling: ['Rydberg blockade', ['One excited atom shifts its neighbour’s levels, blocking its excitation', 'Gives a CZ gate']],
    },
  },
  {
    id: 'photonic',
    name: 'Photonic',
    tag: 'Light in waveguides',
    blurb: ['Qubits in single photons or squeezed light, processed in optical circuits', 'Photons barely interact with the environment', 'Hard parts: loss and photon–photon gates'],
    temp: 'Chip at room temperature; detectors at ~2–4 K',
    conn: 'Set by the circuit; networks via fibre',
    perf: {
      typical: { gate: '~ns / probabilistic', fid: '~99.9% / ~99%', qubits: '~10', life: 'No decay; loss limits depth' },
      sota: { gate: '~ns / ~ns', fid: '~99.98% / ~99.2% (fusion)', qubits: '~12 universal; 100+ photons (sampling)', life: 'No decay; ~99.7% inter-chip link' },
    },
    advantage: { items: ['Photons barely decohere', 'Travel through fibre', 'Standard foundry fabrication'], nodes: ['qubit', 'chip'] },
    challenge: { items: ['Photon loss', 'Two-photon gates only work probabilistically'], nodes: ['coupling', 'delivery'] },
    players: 'PsiQuantum, Xanadu, Quandela, ORCA Computing, and many university labs.',
    parts: {
      software: ['Linear-optics or fusion-based compiler', ['Compile to interferometer settings', 'Or to resource states plus measurements (measurement-based computing)']],
      control: ['Pump laser, drivers and time taggers', ['Pulsed lasers create the photons', 'DAC drivers set phase shifters', 'Time taggers record detector clicks']],
      delivery: ['Optical fibre and waveguides', ['Fibre and edge couplers into the chip', 'Thermo-optic heaters set interferometer phases']],
      readout: ['Single-photon detectors', ['Superconducting nanowire detectors, >90% efficiency', 'Homodyne detection for continuous-variable schemes']],
      env: ['Optical table plus a small cryostat', ['Mostly room temperature', 'Nanowire detectors need a 2–4 K cryocooler']],
      chip: ['Photonic integrated circuit', ['Silicon or silicon-nitride waveguides', 'Meshes of beamsplitters and phase shifters', 'Sources and detectors on or beside the chip']],
      qubit: ['Photon (dual-rail, time-bin or squeezed mode)', ['One photon across two paths or time slots', 'Or a squeezed / GKP state in one mode']],
      coupling: ['Interference and measurement', ['No direct photon–photon interaction', 'Entanglement from interference plus detection']],
    },
  },
  {
    id: 'silicon-spin',
    name: 'Silicon spin qubits',
    tag: 'Single electrons in quantum dots',
    blurb: ['Spin of one electron or hole in a transistor-like quantum dot', 'Tiny qubits, foundry-compatible', 'Device variability and demanding control'],
    temp: '~10 mK to 1 K',
    conn: 'Nearest neighbour in dot arrays',
    perf: {
      typical: { gate: '~100 ns / ~100 ns', fid: '~99.5% / ~99%', qubits: '2–6', life: 'T₂* ~10–100 µs' },
      sota: { gate: '~50 ns / ~50 ns', fid: '~99.9% / ~99.5%', qubits: '~12', life: 'T₂ ~ ms (echo); seconds for donors' },
    },
    advantage: { items: ['Tiny qubits', 'Industrial CMOS fabrication'], nodes: ['chip', 'qubit'] },
    challenge: { items: ['Device-to-device variability', 'Each dot must be tuned individually'], nodes: ['chip', 'software'] },
    players: 'Intel, Diraq, Quantum Motion, Equal1, HRL, QuTech, and many university labs.',
    parts: {
      software: ['Circuit compiler and tune-up software', ['Gate calibration', 'Automated tuning finds the voltages that form each dot']],
      control: ['AWGs, microwave sources and cryo-CMOS', ['Fast voltage pulses for gates and readout', 'Microwave bursts for spin rotations', 'Cryo-CMOS control chips in development']],
      delivery: ['DC and microwave lines, bias tees', ['Many low-noise DC lines set gate voltages', 'RF lines for spin driving and reflectometry']],
      readout: ['Spin-to-charge conversion and a charge sensor', ['Pauli spin blockade or spin-selective tunnelling', 'SET or RF reflectometry detects the charge, in ~µs']],
      env: ['Dilution refrigerator', ['Typically mK; some devices work at ~1 K', 'Magnetic field splits the spin levels']],
      chip: ['Si/SiGe or Si-MOS gate-defined quantum dots', ['Metal gates on a silicon heterostructure form the dots', 'CMOS-compatible process']],
      qubit: ['Electron or hole spin in a quantum dot', ['Spin up and down of a single carrier', '²⁸Si has no nuclear spins: a quiet host']],
      coupling: ['Exchange interaction', ['A barrier gate lowers the tunnel barrier between two dots', 'Gives √SWAP or CZ']],
    },
  },
  {
    id: 'nv-centre',
    name: 'NV centres in diamond',
    tag: 'Defect spins, small registers',
    blurb: ['Electron spin of a nitrogen–vacancy defect in diamond, read out optically', 'Works at room temperature', 'Small registers, linked by photons'],
    temp: 'Room temperature to ~4 K (for networking)',
    conn: 'Few qubits per node; nodes linked by photons',
    perf: {
      typical: { gate: '~50 ns / ~100 µs–1 ms', fid: '~99% / ~95–99%', qubits: '1–3', life: 'T₂* ~ µs; echo ~1 ms' },
      sota: { gate: '~10 ns / ~100 µs', fid: '~99.9% / ~99%', qubits: '~10 (1 NV + 9 nuclear)', life: 'T₂ ~ 1.5 s (electron)' },
    },
    advantage: { items: ['Optically readable spins at room temperature', 'Long-lived nuclear memory'], nodes: ['qubit', 'env'] },
    challenge: { items: ['Few qubits per centre', 'Weak photon collection makes remote entanglement slow'], nodes: ['coupling', 'readout'] },
    players: 'QuTech (Delft), Harvard, University of Stuttgart, and many university labs.',
    parts: {
      software: ['Experiment control software', ['Pulse-sequence control', 'Network protocols coordinate remote entanglement between nodes']],
      control: ['AWG, microwave source and green laser', ['AWG and microwave source drive the spin', '532 nm laser initialises it', 'AOM times the optical pulses']],
      delivery: ['Microwave antenna and confocal optics', ['Stripline on the diamond carries microwaves', 'Objective or fibre for excitation and collection']],
      readout: ['Spin-dependent fluorescence', ['ms=0 fluoresces more brightly than ms=±1, detected on an APD', 'Single-shot readout needs cryogenic resonant excitation']],
      env: ['Ambient or cryostat, with a bias magnet', ['Room temperature for sensing and small registers', '~4 K for coherent optical links', 'Permanent magnet sets the field']],
      chip: ['Diamond sample with solid-immersion lens', ['High-purity diamond with a single NV', 'Nanofabricated lens or cavity collects more light']],
      qubit: ['NV electron spin plus ¹³C or ¹⁴N nuclear spins', ['Electron: fast and readable', 'Nuclear spins: long-lived memory']],
      coupling: ['Hyperfine coupling and photonic links', ['Electron couples directly to nearby nuclear spins', 'Between NV centres: entanglement via photons']],
    },
  },
];

// How warm each platform operates (0 = millikelvin, 1 = room temperature); sets the dot colour: blue, then purple, then pink.
const HEAT = { superconducting: 0, 'silicon-spin': 0.12, ions: 0.5, photonic: 0.7, 'nv-centre': 0.85, 'neutral-atoms': 1 };
const heatColor = h => h <= 0.5
  ? `color-mix(in srgb, var(--lavender-strong) ${h * 200}%, var(--blue-strong))`
  : `color-mix(in srgb, var(--pink-strong) ${(h - 0.5) * 200}%, var(--lavender-strong))`;

const NODE_ORDER = ['software', 'control', 'delivery', 'readout', 'env', 'chip', 'qubit', 'coupling'];

const $ = (s, r = document) => r.querySelector(s);
const nodes = Object.fromEntries(NODE_ORDER.map(k => [k, $(`[data-node="${k}"]`)]));

// Fill an element with a bullet list.
function bullets(el, items) {
  el.replaceChildren(...items.map(t => { const li = document.createElement('li'); li.textContent = t; return li; }));
}

let current = null;
let tradeoffNodes = { adv: [], chal: [] };
let pinned = null; // 'adv' | 'chal' | null: a click keeps the highlight, which is how it works on touch screens

// Highlight the flowchart boxes that an advantage or challenge refers to.
function setHighlight(which) {
  NODE_ORDER.forEach(k => nodes[k].classList.remove('hl'));
  $('#chart').classList.toggle('focusing', !!which);
  ['adv', 'chal'].forEach(w => $('#t-' + w).classList.toggle('on', w === which));
  if (!which) return;
  tradeoffNodes[which].forEach(k => nodes[k].classList.add('hl'));
  $('#chart').dataset.kind = which;
}

function initTradeoffs() {
  ['adv', 'chal'].forEach(w => {
    const el = $('#t-' + w);
    const show = () => setHighlight(w);
    const hide = () => setHighlight(pinned);
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    el.addEventListener('click', () => { pinned = pinned === w ? null : w; setHighlight(pinned); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
}

function renderList() {
  const list = $('#plist');
  PLATFORMS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pbtn';
    b.id = 'p-' + p.id;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.tabIndex = -1;
    const t = document.createElement('b'); t.textContent = p.name;
    const s = document.createElement('span'); s.textContent = p.tag;
    b.append(t, s);
    b.addEventListener('click', () => select(p.id));
    list.append(b);
  });
  list.addEventListener('keydown', e => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const i = PLATFORMS.findIndex(p => p.id === current);
    const n = (i + keys[e.key] + PLATFORMS.length) % PLATFORMS.length;
    select(PLATFORMS[n].id);
    $('#p-' + PLATFORMS[n].id).focus();
  });
}

function select(id, { updateHash = true } = {}) {
  const p = PLATFORMS.find(x => x.id === id);
  if (!p) return;
  current = id;

  PLATFORMS.forEach(q => {
    const b = $('#p-' + q.id);
    const on = q.id === id;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
    // On narrow screens the list scrolls sideways; keep the selection in view without moving the page.
    if (on) {
      const list = b.parentElement;
      list.scrollLeft = Math.max(0, b.offsetLeft - (list.clientWidth - b.offsetWidth) / 2);
    }
  });

  $('.side').style.setProperty('--dot', heatColor(HEAT[id] ?? 0.5));
  $('#g-name').textContent = p.name;
  bullets($('#g-blurb'), p.blurb);
  $('#g-players').textContent = 'Examples: ' + p.players;
  $('#g-temp').textContent = p.temp;
  $('#g-conn').textContent = p.conn;
  ['typical', 'sota'].forEach(col => {
    ['gate', 'fid', 'qubits', 'life'].forEach(row => {
      const cell = $(`#pf-${col}-${row}`);
      // Gate time and fidelity are "1-qubit / 2-qubit" pairs: one per line.
      const lines = (row === 'gate' || row === 'fid') ? p.perf[col][row].split(' / ') : [p.perf[col][row]];
      cell.replaceChildren(...lines.map(t => { const d = document.createElement('div'); d.textContent = t; return d; }));
    });
  });
  bullets($('#t-adv-text'), p.advantage.items);
  bullets($('#t-chal-text'), p.challenge.items);
  tradeoffNodes = { adv: p.advantage.nodes, chal: p.challenge.nodes };
  pinned = null;
  setHighlight(null); // a new platform clears any highlight

  // Fill the flowchart. Restarting the animation needs a reflow between removing and re-adding the class.
  NODE_ORDER.forEach((k, i) => {
    const el = nodes[k];
    const [what, items] = p.parts[k];
    $(':scope > .what', el).textContent = what;
    const ul = document.createElement('ul');
    bullets(ul, items);
    $(':scope > .detail', el).replaceChildren(ul);
    el.classList.add('has');
    el.classList.remove('flash');
    void el.offsetWidth;
    el.style.setProperty('--d', (i * 45) + 'ms');
    el.classList.add('flash');
  });

  if (updateHash) history.replaceState(null, '', '#' + id);
}

renderList();
initTradeoffs();
const fromHash = location.hash.slice(1);
select(PLATFORMS.some(p => p.id === fromHash) ? fromHash : PLATFORMS[0].id, { updateHash: false });
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (h !== current && PLATFORMS.some(p => p.id === h)) select(h, { updateHash: false });
});
