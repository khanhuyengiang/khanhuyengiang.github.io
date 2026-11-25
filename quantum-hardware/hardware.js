// Quantum hardware explorer. Plain script, no dependencies.
// To add a platform, append an object to PLATFORMS; every key under `parts` must be one of the node ids in index.html.
// Each part is [component name, [bullet, ...]]. Numbers are typical order-of-magnitude values, not records.

const PLATFORMS = [
  {
    id: 'superconducting',
    name: 'Superconducting',
    tag: 'Transmons on a chip, in a fridge',
    blurb: ['Artificial atoms: lithographically defined superconducting circuits [[krantz,kjaergaard]]', 'Controlled with microwaves; gates take tens of ns [[kjaergaard]]', 'Needs millikelvin temperatures [[kjaergaard]]'],
    temp: '~10–20 mK [[kjaergaard,krantz]]',
    conn: 'Nearest neighbour on a 2D lattice (square or heavy-hex) [[zuchongzhi,willow]]',
    perf: {
      typical: { gate: '~25–30 ns [[willow]] / ~40–100 ns [[willow]]', fid: '~99.9% [[zuchongzhi]] / ~99.6% (iSWAP-like) [[zuchongzhi]]', qubits: '~100 [[zuchongzhi,willow]]', life: 'T₁ ~70 µs (mean) [[willow,zuchongzhi]]' },
      sota: { gate: '~7 ns [[gao2025]] / ~24 ns [[chen2026]]', fid: '~99.99% [[li1q,bland]] / ~99.93% [[marxer]]', qubits: '1,121 on one chip (IBM Condor, 2023; from IBM’s roadmap, not a paper)', life: 'T₁ up to 1.7 ms (peak; 88 h average 1.0 ms) [[bland]]' },
    },
    advantage: { items: ['Gate times of tens of ns [[kjaergaard,willow]]', 'Lithographic fabrication, expected to scale to ~1,000 qubits with current techniques [[kjaergaard]]'], nodes: ['qubit', 'chip'] },
    challenge: { items: ['Millikelvin cooling [[krinner]]', 'Several cables per qubit: wiring and heat load limit fridge scaling [[krinner]]'], nodes: ['env', 'delivery'] },
    players: 'IBM, Google [[willow]], Rigetti [[chen2026]], IQM [[marxer]], USTC [[zuchongzhi]], Alice & Bob (cat qubits), and many university labs.',
    parts: {
      software: ['Circuit compiler and calibration stack', ['Compile circuits to pulses', 'Calibration frameworks (e.g. Qibocal) keep gate parameters tuned', 'Re-run regularly, since parameters drift']],
      control: ['AWGs and RFSoC FPGAs', ['4–8 GHz microwave pulses via IQ mixing', 'Fast flux pulses for tunable elements', 'Digitise the returned readout signal']],
      delivery: ['Attenuated coaxial lines', ['Coax through each fridge stage', '~60 dB attenuation on drive lines, plus filters, cuts thermal noise [[krinner]]', 'Separate flux lines']],
      readout: ['Resonator, parametric amplifier, HEMT', ['Dispersive readout through a resonator', 'TWPA or JPA at mK, then HEMT at 4 K', 'Room-temperature amplifiers']],
      env: ['Dilution refrigerator', ['Staged cooling from 300 K to ~10–20 mK', 'Infrared and magnetic shielding around the chip']],
      chip: ['Al, Nb or Ta films on silicon or sapphire', ['Josephson junctions: Al/AlOₓ/Al', 'Cleanroom fabrication', 'Packaged in a metal box; wire-bonded, or flip-chip bump-bonded in larger chips']],
      qubit: ['Transmon', ['Nonlinear LC oscillator at ~4–6 GHz', 'Two lowest levels, made addressable by the junction’s nonlinearity']],
      coupling: ['Capacitive or tunable couplers', ['Fixed coupling: cross-resonance (ZX) gates, ~300–400 ns [[krantz]]', 'Tunable couplers: CZ and iSWAP-type gates']],
    },
  },
  {
    id: 'ions',
    name: 'Trapped ions',
    tag: 'Atoms held by electric fields',
    blurb: ['Charged atoms suspended in vacuum by electric fields, manipulated with lasers [[bruz]]', 'Identical, highly coherent qubits [[wang1h]]', 'Slower gates: two-qubit gates take ~10–100 µs [[bruz]]'],
    temp: 'Trap at ~300 K [[smith]] or ~4–6 K [[pagano,guo]]',
    conn: 'All-to-all, via ion transport between zones [[helios]]',
    perf: {
      typical: { gate: '~5–35 µs [[smith]] / ~70–200 µs [[helios,hughes]]', fid: '~99.998% [[helios]] / ~99.92% [[helios]]', qubits: '~56–98 [[h2,helios]]', life: 'T₂ ~ seconds to minutes (clock qubits) [[smith,wang1h]]' },
      sota: { gate: '~4.4 µs [[smith]] / ~1.6 µs (99.8%) [[schafer]]', fid: '~99.99998% [[smith]] / ~99.99% (est.) [[hughes]]', qubits: '98 for gates [[helios]]; 512 trapped, 300 used, for analog simulation [[guo]]', life: 'T₂ > 1 hour, with dynamical decoupling [[wang1h]]' },
    },
    advantage: { items: ['Identical, long-lived qubits [[wang1h]]', 'All-to-all connectivity [[helios]]', 'Best gate fidelities [[smith,hughes]]'], nodes: ['qubit', 'coupling'] },
    challenge: { items: ['Slow gates; a full layer including ion transport takes tens of ms [[helios]]', 'Scaling traps, laser delivery and control to hundreds of qubits [[bruz,helios]]'], nodes: ['chip', 'delivery'] },
    players: 'Quantinuum [[helios]], IonQ (including Oxford Ionics [[hughes]]), Alpine Quantum Technologies, and many university labs.',
    parts: {
      software: ['Circuit compiler and pulse sequencer', ['Compile to native Mølmer–Sørensen and single-qubit rotations', 'Sequencers (e.g. ARTIQ) run the experiment timing']],
      control: ['FPGA sequencer, DDS and AWGs', ['RF tones drive acousto-optic modulators', 'Narrow-linewidth lasers locked to reference cavities']],
      delivery: ['Laser beams and optics', ['Beams through AOMs and individual-addressing optics', 'Free-space or fibre delivery', 'RF and DC lines to the trap electrodes']],
      readout: ['Fluorescence detection', ['Resonant laser: one state fluoresces, the other stays dark', 'PMT, camera or nanowire detector counts photons in ~10 µs to ms [[bruz]]']],
      env: ['Ultra-high vacuum chamber', ['~10⁻¹¹ Torr, so collisions are rare [[pagano]]', 'Some systems add a ~4–6 K cryostat to cut heating and background gas [[pagano,guo]]']],
      chip: ['Paul trap', ['Blade or surface-electrode design', 'RF and DC electrodes confine ions in a chain (or a 2D crystal)', 'Shuttling between zones (QCCD)']],
      qubit: ['Atomic ion (¹⁷¹Yb⁺, ¹³⁷Ba⁺, ⁴³Ca⁺, ⁴⁰Ca⁺)', ['Two hyperfine, Zeeman or optical levels of a single ion [[bruz]]', 'Every qubit identical']],
      coupling: ['Shared motional modes', ['Lasers or microwave/RF fields couple the spins to collective vibration', 'Mølmer–Sørensen entangling gate']],
    },
  },
  {
    id: 'neutral-atoms',
    name: 'Neutral atoms',
    tag: 'Tweezer arrays in vacuum',
    blurb: ['Atoms held in optical tweezers, entangled via Rydberg interactions [[evered]]', 'Geometry reconfigurable on the fly [[bluvstein]]', 'Hundreds to thousands of atoms [[bluvstein,manetsch]]'],
    temp: 'Mostly room-temperature apparatus [[manetsch]]; atoms laser-cooled to ~10 µK in ~1 mK-deep tweezers [[evered]]',
    conn: 'Reconfigurable: atoms are moved with AODs, giving non-local connectivity [[bluvstein]]',
    perf: {
      typical: { gate: '~1 µs [[bluvstein]] / ~0.3 µs [[evered]]', fid: '~99.9% [[radnaev]] / ~99.5% [[evered]]', qubits: '~100–300 [[bluvstein]]', life: 'T₂ > 1 s (with echo) [[bluvstein]]' },
      sota: { gate: '~0.25 µs [[radnaev]] / ~0.3 µs [[evered]]', fid: '~99.96% [[rozanov]] / ~99.7% [[muniz,tsai]]', qubits: '~6,100 trapped atoms [[manetsch]]; ~3,000 kept for 2 h [[chiu]]', life: 'T₂ = 12.6 s with dynamical decoupling [[manetsch]]' },
    },
    advantage: { items: ['Large arrays of identical atoms [[manetsch]]', 'Reconfigurable with moving tweezers [[bluvstein]]'], nodes: ['chip', 'qubit'] },
    challenge: { items: ['Slow cycles: imaging takes ~0.5–80 ms [[bluvstein,manetsch]]', 'Lost atoms must be reloaded [[chiu]]', 'Entangling distant atoms is costly [[saffman]]'], nodes: ['readout', 'env'] },
    players: 'QuEra [[evered]], Pasqal [[henriet]], Atom Computing [[muniz]], Infleqtion [[radnaev]], and many university labs.',
    parts: {
      software: ['Circuit and analog-mode compiler', ['Circuits map to laser pulses and atom-movement schedules', 'Same hardware runs analog Hamiltonian simulation']],
      control: ['AWGs, FPGAs and laser systems', ['Drive the AODs and spatial light modulators that shape the tweezers', 'Time the Raman (or clock-laser) and Rydberg pulses']],
      delivery: ['High-NA objective and laser beams', ['Objective focuses light into the vacuum cell', 'AODs steer individual tweezers']],
      readout: ['Fluorescence imaging', ['Camera (EMCCD or CMOS) images each atom', 'Atom present or missing gives the state, in ~0.5–80 ms']],
      env: ['Vacuum cell with laser cooling', ['Atoms loaded from a magneto-optical trap, cooled to µK', 'Apparatus usually at room temperature']],
      chip: ['Optical-tweezer array', ['No chip: focused laser spots are the traps', 'Arranged in 1D, 2D or 3D patterns']],
      qubit: ['Neutral atom (⁸⁷Rb, ¹³³Cs, ⁸⁸Sr, ¹⁷¹Yb)', ['Hyperfine, nuclear-spin or optical-clock levels', 'Rydberg states used transiently in gates (held during analog simulation)']],
      coupling: ['Rydberg blockade', ['One excited atom shifts its neighbour’s levels, blocking its excitation', 'Gives a CZ gate']],
    },
  },
  {
    id: 'photonic',
    name: 'Photonic',
    tag: 'Light in waveguides',
    blurb: ['Qubits in single photons or squeezed light, processed in optical circuits', 'Photons barely interact with the environment [[maring]]', 'Hard parts: loss and photon–photon gates'],
    temp: 'Chip at room temperature; nanowire detectors at ~1–2 K [[hu,alexander]]; transition-edge detectors at ~10 mK in Xanadu’s Aurora (Nature 2025)',
    conn: 'All-to-all within a universal interferometer [[maring]]; chips linked by fibre [[alexander]]',
    perf: {
      typical: { gate: '~ns photon pulses / probabilistic [[maring]]', fid: '~99.6% [[maring]] / ~94% [[maring]]', qubits: '6 photons in 12 modes [[maring]]', life: 'No decay; loss limits depth' },
      sota: { gate: '~ns (photon pulses) / ~µs (phase shifters) [[harris]]', fid: '~99.98% (SPAM) [[alexander]] / ~99.2% (fusion) [[alexander]]', qubits: '8,176 modes; up to 3,050 photons (sampling) [[liu]]', life: 'No decay; loss-limited. Fidelities are conditional on detection and exclude loss; chip link 99.7% [[alexander]]' },
    },
    advantage: { items: ['Photons barely decohere [[maring]]', 'Travel through fibre [[alexander]]', 'Standard foundry fabrication [[alexander,ji]]'], nodes: ['qubit', 'chip'] },
    challenge: { items: ['Photon loss (foundry Si₃N₄ waveguides ~1.4 dB/m [[ji]]; lower in lab devices)', 'Linear-optics two-photon gates are probabilistic (single-photon schemes) [[maring]]'], nodes: ['coupling', 'delivery'] },
    players: 'PsiQuantum [[alexander]], Xanadu, Quandela [[maring]], ORCA Computing, USTC [[liu]], and many university labs.',
    parts: {
      software: ['Linear-optics or fusion-based compiler', ['Compile to interferometer settings', 'Or to resource states plus measurements (measurement-based computing)']],
      control: ['Pump laser, drivers and time-to-digital converters', ['Pulsed lasers create the photons', 'Drivers set the thermo-optic phase shifters', 'Time-to-digital converters record detector clicks']],
      delivery: ['Optical fibre and waveguides', ['Fibre and edge couplers into the chip', 'Thermo-optic heaters set interferometer phases']],
      readout: ['Single-photon detectors', ['Nanowire (SNSPD) or transition-edge detectors, ~90–99% efficiency [[alexander,hu]]', 'Homodyne detection for continuous-variable schemes']],
      env: ['Optical table plus a small cryostat', ['Mostly room temperature', 'Nanowire detectors need a ~1–3 K cryocooler [[hu,alexander]]; transition-edge detectors need ~10 mK']],
      chip: ['Photonic integrated circuit', ['Silicon or silicon-nitride waveguides', 'Meshes of beamsplitters and phase shifters', 'Sources and detectors on or beside the chip']],
      qubit: ['Photon (dual-rail, time-bin or squeezed mode)', ['One photon across two paths or time slots', 'Or a squeezed / GKP state in one mode']],
      coupling: ['Interference and measurement', ['No direct photon–photon interaction', 'Entanglement from interference plus detection']],
    },
  },
  {
    id: 'silicon-spin',
    name: 'Silicon spin qubits',
    tag: 'Single electrons in quantum dots',
    blurb: ['Spin of one electron or hole in a transistor-like quantum dot [[camenzind]]', 'Tiny qubits (~100 nm) [[mills]], foundry-compatible', 'Device variability and demanding control'],
    temp: '~10–30 mK typical [[steinacker,takeda]]; 1.5 K for electron qubits [[yang]], above 4 K for a hole qubit [[camenzind]]',
    conn: 'Nearest neighbour in dot arrays (shuttling and resonator links have been demonstrated)',
    perf: {
      typical: { gate: '~100 ns [[wu,noiri]] / ~100–200 ns [[noiri,steinacker]]', fid: '~99.7% [[xue]] / ~99.4–99.7% [[steinacker,xue]]', qubits: '2–6 [[philips]]', life: 'T₂* ~10–30 µs [[wu,steinacker]]' },
      sota: { gate: '~70 ns [[mills]] / ~100 ns [[noiri]]', fid: '~99.9992% [[takeda]] / ~99.8% [[mills]]', qubits: '6 under universal control [[philips]]; 8 single-spin qubits tuned and driven [[nickl]]; 12-dot arrays [[george]]', life: 'T₂ ~35 s for a ³¹P donor nuclear spin [[muhonen]]; echo ~1.3 ms for single spins in dots [[nickl]], ~4 ms for a singlet–triplet qubit [[tomic]]' },
    },
    advantage: { items: ['Tiny qubits (~100 nm) [[mills]]', 'Industrial CMOS fabrication [[steinacker,george]]', 'Operation above 1 K demonstrated [[yang,petit,camenzind]]'], nodes: ['chip', 'qubit'] },
    challenge: { items: ['Device-to-device variability, e.g. in valley splitting [[nickl]]', 'Each dot needs its own tune-up; automation is in progress'], nodes: ['chip', 'software'] },
    players: 'Intel [[george]], Diraq [[steinacker]], HRL, Quantum Motion, QuTech [[philips]], RIKEN [[wu]], and many university labs.',
    parts: {
      software: ['Circuit compiler and tune-up software', ['Gate calibration', 'Automated tuning finds the voltages that form each dot']],
      control: ['AWGs, microwave sources and cryo-CMOS', ['Fast voltage pulses for gates and readout', 'Microwave bursts (EDSR or ESR) for spin rotations', 'Cryo-CMOS control chips demonstrated [[xuecmos]]']],
      delivery: ['DC and microwave lines, bias tees', ['Many low-noise DC lines set gate voltages', 'RF lines for spin driving and reflectometry']],
      readout: ['Spin-to-charge conversion and a charge sensor', ['Pauli spin blockade or spin-selective tunnelling', 'SET or RF reflectometry detects the charge, in ~10 µs [[philips]]']],
      env: ['Dilution refrigerator', ['Typically mK; some devices work at 1–4 K', 'Magnetic field splits the spin levels']],
      chip: ['Si/SiGe or Si-MOS gate-defined quantum dots', ['Metal gates on a Si/SiGe heterostructure or a Si/SiO₂ interface form the dots', 'CMOS-compatible process']],
      qubit: ['Electron or hole spin in a quantum dot', ['Spin up and down of a single carrier', 'Enriched ²⁸Si has almost no nuclear spins: a quiet host (residual ²⁹Si ~800 ppm)']],
      coupling: ['Exchange interaction', ['A barrier gate lowers the tunnel barrier between two dots', 'Gives CZ (adiabatic exchange pulse) or CROT/SWAP-type gates [[mills,petit]]']],
    },
  },
  {
    id: 'nv-centre',
    name: 'NV centres in diamond',
    tag: 'Defect spins, small registers',
    blurb: ['Electron spin of a nitrogen–vacancy defect in diamond, read out optically [[doherty]]', 'Works at room temperature [[xie,rong]]', 'Small registers, linked by photons [[pompili]]'],
    temp: 'Room temperature; ~4 K for the longest coherence [[abobeih]]',
    conn: 'Few qubits per node; nodes linked by photons [[pompili]]',
    perf: {
      typical: { gate: '~50 ns [[rong]] / ~100 µs–1 ms [[bartling,bradley]]', fid: '~99.9% [[rong]] / ~99% [[rong,xie]]', qubits: '1–3 [[rong,xie,bartling]]', life: 'T₂* ~2 µs [[rong]]; echo ~0.4 ms [[naydenov]]' },
      sota: { gate: '~20 ns [[bartling]] / ~100 µs [[bartling]]', fid: '~99.999% [[bartling]] / ~99.93% [[bartling]]', qubits: '10 (1 NV + 9 nuclear) [[bradley]]', life: 'Electron T₂ 1.58 s [[abobeih]], ~11 s (preprint) [[yamamoto]]; ¹⁴N nuclear spin 63 s [[bradley]]' },
    },
    advantage: { items: ['Optically readable spins at room temperature [[xie,rong]]', 'Long-lived nuclear memory [[bradley]]'], nodes: ['qubit', 'env'] },
    challenge: { items: ['Few qubits per centre [[bradley]]', 'Only ~4% of emission is in the zero-phonon line, so remote entanglement is slow (~9 Hz in the lab, 0.48 Hz over 10 km) [[johnson,pompili,stolk]]'], nodes: ['coupling', 'readout'] },
    players: 'QuTech (Delft) [[pompili]], University of Stuttgart [[naydenov]], USTC [[rong]], and many university labs.',
    parts: {
      software: ['Experiment control software', ['Pulse-sequence control', 'Network protocols coordinate remote entanglement between nodes']],
      control: ['AWG, microwave source and lasers', ['AWG and microwave source drive the spin', '532 nm laser initialises it at room temperature [[doherty]]; resonant 637 nm lasers at 4 K', 'AOMs time the optical pulses']],
      delivery: ['Microwave antenna and confocal optics', ['Stripline on the diamond carries microwaves', 'Objective or fibre for excitation and collection']],
      readout: ['Spin-dependent fluorescence', ['ms=0 fluoresces more brightly than ms=±1, detected on an APD [[doherty]]', 'Single-shot readout: ~93% with resonant excitation at ~8 K [[robledo]]; at room temperature the signal is averaged over many shots']],
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

// Small drawings of the qubit: device layout, equivalent circuit, and a physics plot. Styled in hardware.css (.schem).
// A <text data-tex="..."> is typeset with KaTeX after insertion (typeset below); its plain text is the fallback.
const SCHEMATICS = {
  'superconducting': [
    { caption: 'Device layout (top view)', svg: `<svg viewBox="-18 0 378 240" role="img" aria-label="Transmon chip layout: two capacitor pads joined by a Josephson junction, capacitively coupled to a meandering readout resonator"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><rect class="pad" x="120" y="34" width="60" height="60" rx="6"/><rect class="pad" x="120" y="146" width="60" height="60" rx="6"/><path class="lead" d="M150 94V111M150 129V146"/><rect class="jj" x="141" y="111" width="18" height="18" rx="2"/><path class="lead thin" d="M145 115L155 125M155 115L145 125"/><path class="res" d="M196 64H336V100H220V136H336"/><g class="tick"><path d="M106 64H116M106 120H138M106 176H116"/></g><text class="lbl" x="102" y="68" text-anchor="end">Capacitor pad</text><text class="lbl" x="102" y="124" text-anchor="end">Josephson junction</text><text class="lbl" x="102" y="180" text-anchor="end">Capacitor pad</text><text class="lbl" x="220" y="168">Readout resonator,</text><text class="lbl" x="220" y="183">capacitively coupled</text></svg>` },
    { caption: 'Equivalent circuit', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Equivalent circuit: a Josephson junction (inductance L_J, capacitance C_J) in parallel with a shunt capacitor C_s, between a phase node and ground"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><rect class="jbox" x="104" y="92" width="54" height="64" rx="10"/><path class="wire" d="M130 60H230M130 60V109M130 131V180H230M230 60V113M230 127V180M180 180V190"/><circle class="node" cx="180" cy="60" r="4"/><rect class="jj" x="119" y="109" width="22" height="22" rx="2"/><path class="wire thin" d="M123 113L137 127M137 113L123 127"/><path class="wire" d="M214 113H246M214 127H246"/><path class="wire" d="M168 190H192M173 196H187M177 202H183"/><text class="math big" x="180" y="46" text-anchor="middle" data-tex="\\varphi">φ</text><text class="math big" x="100" y="116" text-anchor="end" data-tex="L_J">L_J</text><text class="math big" x="100" y="140" text-anchor="end" data-tex="C_J">C_J</text><text class="math big" x="256" y="125" data-tex="C_s">C_s</text></svg>` },
    { caption: 'Potential and energy levels (not to scale)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Transmon potential: a cosine well with anharmonic energy levels, compared with a harmonic well"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><clipPath id="plotclip"><rect x="56" y="40" width="244" height="156"/></clipPath><g class="axes"><path d="M56 40V196H300"/><path d="M52 196.0H56"/><text class="ax" x="48" y="200.0" text-anchor="end" data-tex="0">0</text><path d="M52 166.0H56"/><text class="ax" x="48" y="170.0" text-anchor="end" data-tex="1">1</text><path d="M52 136.0H56"/><text class="ax" x="48" y="140.0" text-anchor="end" data-tex="2">2</text><path d="M52 106.0H56"/><text class="ax" x="48" y="110.0" text-anchor="end" data-tex="3">3</text><path d="M52 76.0H56"/><text class="ax" x="48" y="80.0" text-anchor="end" data-tex="4">4</text><path d="M55.8 196V200"/><text class="ax" x="55.8" y="213" text-anchor="middle" data-tex="-\\pi">−π</text><path d="M116.9 196V200"/><text class="ax" x="116.9" y="213" text-anchor="middle" data-tex="-\\pi/2">−π/2</text><path d="M178.0 196V200"/><text class="ax" x="178.0" y="213" text-anchor="middle" data-tex="0">0</text><path d="M239.1 196V200"/><text class="ax" x="239.1" y="213" text-anchor="middle" data-tex="\\pi/2">π/2</text><path d="M300.2 196V200"/><text class="ax" x="300.2" y="213" text-anchor="middle" data-tex="\\pi">π</text></g><path class="harm" clip-path="url(#plotclip)" d="M84.6 1.6L87.0 11.2L89.3 20.6L91.6 29.7L94.0 38.5L96.3 47.2L98.6 55.5L101.0 63.7L103.3 71.6L105.6 79.2L108.0 86.7L110.3 93.8L112.6 100.7L115.0 107.4L117.3 113.9L119.7 120.1L122.0 126.0L124.3 131.7L126.7 137.2L129.0 142.4L131.3 147.4L133.7 152.1L136.0 156.6L138.3 160.9L140.7 164.9L143.0 168.7L145.3 172.2L147.7 175.5L150.0 178.5L152.3 181.3L154.7 183.8L157.0 186.2L159.3 188.2L161.7 190.0L164.0 191.6L166.3 193.0L168.7 194.1L171.0 194.9L173.3 195.5L175.7 195.9L178.0 196.0L180.3 195.9L182.7 195.5L185.0 194.9L187.3 194.1L189.7 193.0L192.0 191.6L194.3 190.0L196.7 188.2L199.0 186.2L201.3 183.8L203.7 181.3L206.0 178.5L208.3 175.5L210.7 172.2L213.0 168.7L215.3 164.9L217.7 160.9L220.0 156.6L222.3 152.1L224.7 147.4L227.0 142.4L229.3 137.2L231.7 131.7L234.0 126.0L236.3 120.1L238.7 113.9L241.0 107.4L243.4 100.7L245.7 93.8L248.0 86.6L250.4 79.2L252.7 71.6L255.0 63.7L257.4 55.5L259.7 47.2L262.0 38.5L264.4 29.7L266.7 20.6L269.0 11.2L271.4 1.6"/><path class="well" d="M55.8 61.0L58.8 61.2L61.9 61.8L65.0 62.9L68.0 64.3L71.1 66.1L74.1 68.4L77.2 70.9L80.2 73.9L83.3 77.2L86.3 80.8L89.4 84.7L92.5 88.8L95.5 93.2L98.6 97.9L101.6 102.7L104.7 107.6L107.7 112.7L110.8 117.9L113.8 123.2L116.9 128.5L120.0 133.8L123.0 139.1L126.1 144.3L129.1 149.4L132.2 154.3L135.2 159.1L138.3 163.8L141.3 168.2L144.4 172.3L147.4 176.2L150.5 179.8L153.6 183.1L156.6 186.1L159.7 188.6L162.7 190.9L165.8 192.7L168.8 194.1L171.9 195.2L174.9 195.8L178.0 196.0L181.1 195.8L184.1 195.2L187.2 194.1L190.2 192.7L193.3 190.9L196.3 188.6L199.4 186.1L202.4 183.1L205.5 179.8L208.6 176.2L211.6 172.3L214.7 168.2L217.7 163.8L220.8 159.1L223.8 154.3L226.9 149.4L229.9 144.3L233.0 139.1L236.0 133.8L239.1 128.5L242.2 123.2L245.2 117.9L248.3 112.7L251.3 107.6L254.4 102.7L257.4 97.9L260.5 93.2L263.5 88.8L266.6 84.7L269.7 80.8L272.7 77.2L275.8 73.9L278.8 70.9L281.9 68.4L284.9 66.1L288.0 64.3L291.0 62.9L294.1 61.8L297.2 61.2L300.2 61.0"/><path class="lev l0" d="M151.6 181.0H204.4"/><text class="math" x="209.4" y="185.0" data-tex="\\lvert 0\\rangle">|0⟩</text><path class="lev l1" d="M130.1 151.0H225.9"/><text class="math" x="230.9" y="155.0" data-tex="\\lvert 1\\rangle">|1⟩</text><path class="lev l2" d="M115.2 125.5H240.8"/><text class="math dim" x="245.8" y="129.5" data-tex="\\lvert 2\\rangle">|2⟩</text><path class="lev l3" d="M100.9 101.5H255.1"/><path class="lev l4" d="M89.7 85.0H266.3"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M178 179.0V153.0"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M178 149.0V127.5"/><text class="math" x="172" y="170.0" text-anchor="end" data-tex="\\hbar\\omega_{01}">ħω₀₁</text><text class="math" x="172" y="142.2" text-anchor="end" data-tex="\\hbar\\omega_{12}">ħω₁₂</text><text class="lbl strong" x="178" y="62" text-anchor="middle">Transmon</text><text class="lbl" x="178" y="232" text-anchor="middle" data-tex="\\textsf{Superconducting phase }\\varphi">Superconducting phase φ</text><text class="lbl tex" transform="translate(14 118) rotate(-90)" x="0" y="0" text-anchor="middle" data-tex="\\textsf{Energy }(\\hbar\\omega_{01})">Energy (ħω₀₁)</text></svg>` },
  ],
  'ions': [
    { caption: 'Linear ion trap (schematic)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Linear ion trap: ions in a chain between RF electrodes and end caps, with a laser beam on one ion"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><rect class="elec" x="50" y="78" width="110" height="14" rx="3"/><rect class="elec" x="200" y="78" width="110" height="14" rx="3"/><rect class="elec" x="50" y="148" width="260" height="14" rx="3"/><rect class="elec" x="28" y="104" width="16" height="32" rx="3"/><rect class="elec" x="316" y="104" width="16" height="32" rx="3"/><circle class="ion" cx="110" cy="120" r="9"/><circle class="ion" cx="145" cy="120" r="9"/><circle class="ion" cx="180" cy="120" r="9"/><circle class="ion" cx="215" cy="120" r="9"/><circle class="ion" cx="250" cy="120" r="9"/><path class="beam" marker-end="url(#ahp)" d="M180 28V102"/><text class="lbl" x="190" y="40">Laser addresses one ion</text><text class="lbl" x="50" y="70">RF electrodes</text><text class="lbl" x="6" y="98">End cap</text><text class="lbl" x="180" y="188" text-anchor="middle">Ion chain</text></svg>` },
    { caption: 'Qubit levels and Raman beams', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Ion qubit levels: two ground states coupled by two Raman beams detuned from an excited state"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="lev" d="M60 196H130"/><path class="lev" d="M230 172H300"/><path class="lev" d="M130 56H230"/><path class="lev virt" d="M130 96H230"/><path class="beam" marker-end="url(#ahp)" d="M95 192L150 100"/><path class="beam" marker-end="url(#ahp)" d="M210 100L265 168"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M180 60V92"/><text class="math" x="54" y="200" text-anchor="end" data-tex="\\lvert 0\\rangle">|0⟩</text><text class="math" x="306" y="176" data-tex="\\lvert 1\\rangle">|1⟩</text><text class="lbl" x="236" y="60" data-tex="\\textsf{excited } P">excited P</text><text class="lbl dim" x="236" y="100">virtual level</text><text class="math" x="188" y="80" data-tex="\\Delta">Δ</text><text class="lbl" x="52" y="136">Raman beams</text><text class="lbl" x="180" y="222" text-anchor="middle" data-tex="\\omega_{01}\\ \\textsf{(hyperfine, }{\\sim}\\textsf{GHz)}">ω₀₁ (hyperfine, ~GHz)</text></svg>` },
    { caption: 'Spin–motion levels (not to scale)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Ion spin levels dressed by motional levels: carrier, red and blue sideband transitions"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="lev" d="M72 190H132"/><text class="ax" x="66" y="194" text-anchor="end" data-tex="n=0">n=0</text><path class="lev" d="M72 160H132"/><text class="ax" x="66" y="164" text-anchor="end" data-tex="n=1">n=1</text><path class="lev" d="M72 130H132"/><text class="ax" x="66" y="134" text-anchor="end" data-tex="n=2">n=2</text><path class="lev" d="M230 150H300"/><text class="ax" x="306" y="154" data-tex="n=0">n=0</text><path class="lev" d="M230 120H300"/><text class="ax" x="306" y="124" data-tex="n=1">n=1</text><path class="lev" d="M230 90H300"/><text class="ax" x="306" y="94" data-tex="n=2">n=2</text><text class="math" x="102" y="214" text-anchor="middle" data-tex="\\lvert{\\downarrow}\\rangle">|↓⟩</text><text class="math" x="265" y="66" text-anchor="middle" data-tex="\\lvert{\\uparrow}\\rangle">|↑⟩</text><path class="arr" marker-end="url(#ah)" d="M136 160L228 120"/><path class="arr" marker-end="url(#ah)" d="M136 160L228 90"/><path class="arr" marker-end="url(#ah)" d="M136 160L228 150"/><text class="lbl halo" x="176" y="96" text-anchor="middle">blue sideband</text><text class="lbl halo" x="176" y="138" text-anchor="middle">carrier</text><text class="lbl halo" x="176" y="176" text-anchor="middle">red sideband</text><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M30 190V160"/><text class="math" x="24" y="179" text-anchor="end" data-tex="\\hbar\\nu">ħν</text></svg>` },
  ],
  'neutral-atoms': [
    { caption: 'Atom array (schematic)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Tweezer array: a grid of single atoms, with the blockade radius drawn around one atom"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><circle class="blockade" cx="150" cy="110" r="50"/><circle class="ion" cx="70" cy="70" r="8"/><circle class="ion" cx="110" cy="70" r="8"/><circle class="ion" cx="150" cy="70" r="8"/><circle class="ion" cx="190" cy="70" r="8"/><circle class="empty" cx="230" cy="70" r="8"/><circle class="ion" cx="270" cy="70" r="8"/><circle class="ion" cx="70" cy="110" r="8"/><circle class="ion" cx="110" cy="110" r="8"/><circle class="ion" cx="150" cy="110" r="8"/><circle class="ion" cx="190" cy="110" r="8"/><circle class="ion" cx="230" cy="110" r="8"/><circle class="ion" cx="270" cy="110" r="8"/><circle class="ion" cx="70" cy="150" r="8"/><circle class="empty" cx="110" cy="150" r="8"/><circle class="ion" cx="150" cy="150" r="8"/><circle class="ion" cx="190" cy="150" r="8"/><circle class="ion" cx="230" cy="150" r="8"/><circle class="ion" cx="270" cy="150" r="8"/><circle class="ion" cx="70" cy="190" r="8"/><circle class="ion" cx="110" cy="190" r="8"/><circle class="ion" cx="150" cy="190" r="8"/><circle class="ion" cx="190" cy="190" r="8"/><circle class="ion" cx="230" cy="190" r="8"/><circle class="empty" cx="270" cy="190" r="8"/><path class="tick2" d="M70 38V60"/><text class="lbl" x="70" y="30">One atom per optical tweezer</text><text class="lbl" x="180" y="222" text-anchor="middle">Dashed circle: blockade radius around one atom</text></svg>` },
    { caption: 'Qubit and Rydberg levels', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Atom qubit levels: ground state |1> excited to a Rydberg state via an intermediate level"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="lev" d="M50 196H120"/><path class="lev" d="M150 180H220"/><path class="lev virt" d="M130 110H240"/><path class="lev" d="M130 46H240"/><path class="beam" marker-end="url(#ahp)" d="M175 176V114"/><path class="beam" marker-end="url(#ahp)" d="M195 108V50"/><text class="math" x="46" y="200" text-anchor="end" data-tex="\\lvert 0\\rangle">|0⟩</text><text class="math" x="226" y="184" data-tex="\\lvert 1\\rangle">|1⟩</text><text class="dim" x="246" y="114" data-tex="\\lvert e\\rangle\\textsf{, detuned by }\\Delta">|e⟩, detuned by Δ</text><text class="math" x="246" y="50" data-tex="\\lvert r\\rangle\\textsf{ Rydberg}">|r⟩ Rydberg</text><text class="math" x="165" y="148" text-anchor="end" data-tex="\\Omega_1">Ω₁</text><text class="math" x="205" y="84" data-tex="\\Omega_2">Ω₂</text><text class="lbl" x="180" y="222" text-anchor="middle">two-photon Rydberg excitation</text></svg>` },
    { caption: 'Rydberg blockade (not to scale)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Blockade: two-atom levels, with the doubly excited state shifted by the Rydberg interaction"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="lev" d="M120 190H240"/><path class="lev" d="M120 110H240"/><path class="lev virt" d="M120 80H240"/><path class="lev" d="M120 36H240"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M180 186V114"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M180 78V40"/><text class="math" x="114" y="194" text-anchor="end" data-tex="\\lvert gg\\rangle">|gg⟩</text><text class="math" x="246" y="114" data-tex="(\\lvert gr\\rangle+\\lvert rg\\rangle)/\\sqrt{2}">(|gr⟩+|rg⟩)/√2</text><text class="dim" x="246" y="84" data-tex="\\lvert rr\\rangle\\textsf{ (no interaction)}">|rr⟩ (no interaction)</text><text class="math" x="114" y="40" text-anchor="end" data-tex="\\lvert rr\\rangle\\textsf{ shifted}">|rr⟩ shifted</text><text class="math" x="186" y="154" data-tex="\\sqrt{2}\\,\\Omega">√2 Ω</text><text class="math" x="186" y="62" data-tex="V(R)">V(R)</text><text class="lbl" x="180" y="222" text-anchor="middle" data-tex="\\textsf{blockade: }\\lvert rr\\rangle\\textsf{ pushed out of resonance}">blockade: |rr⟩ pushed out of resonance</text></svg>` },
  ],
  'photonic': [
    { caption: 'Integrated photonic chip (schematic)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Photonic chip: four waveguides with couplers and phase shifters, ending in detectors"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="res thin2" d="M28 64H296"/><path class="res thin2" d="M28 104H296"/><path class="res thin2" d="M28 144H296"/><path class="res thin2" d="M28 184H296"/><rect class="pad" x="70" y="54" width="16" height="60" rx="4"/><rect class="pad" x="70" y="134" width="16" height="60" rx="4"/><rect class="pad" x="130" y="54" width="16" height="60" rx="4"/><rect class="pad" x="130" y="134" width="16" height="60" rx="4"/><rect class="pad" x="250" y="54" width="16" height="60" rx="4"/><rect class="pad" x="250" y="134" width="16" height="60" rx="4"/><rect class="pad" x="196" y="94" width="16" height="60" rx="4"/><rect class="heater" x="98" y="60" width="18" height="8" rx="2"/><rect class="heater" x="98" y="140" width="18" height="8" rx="2"/><rect class="heater" x="160" y="100" width="18" height="8" rx="2"/><rect class="heater" x="222" y="60" width="18" height="8" rx="2"/><rect class="heater" x="222" y="140" width="18" height="8" rx="2"/><rect class="pad" x="296" y="55" width="20" height="18" rx="3"/><rect class="pad" x="296" y="95" width="20" height="18" rx="3"/><rect class="pad" x="296" y="135" width="20" height="18" rx="3"/><rect class="pad" x="296" y="175" width="20" height="18" rx="3"/><text class="lbl" x="316" y="46" text-anchor="end">Detectors (cooled)</text><text class="lbl" x="28" y="46">Photons in</text><rect class="pad" x="58" y="212" width="12" height="12" rx="3"/><text class="lbl" x="76" y="222">Coupler</text><rect class="heater" x="150" y="214" width="14" height="8" rx="2"/><text class="lbl" x="170" y="222">Phase shifter</text></svg>` },
    { caption: 'Mach–Zehnder unit cell', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Mach-Zehnder unit cell: two beam splitters with a phase shifter between them and one at an output"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="res thin2" d="M48 90H340M48 150H340"/><rect class="pad" x="80" y="70" width="30" height="100" rx="6"/><rect class="pad" x="220" y="70" width="30" height="100" rx="6"/><text class="lbl" x="95" y="124" text-anchor="middle">BS</text><text class="lbl" x="235" y="124" text-anchor="middle">BS</text><rect class="heater" x="140" y="82" width="36" height="16" rx="3"/><rect class="heater" x="272" y="82" width="36" height="16" rx="3"/><text class="math" x="158" y="72" text-anchor="middle" data-tex="\\theta">θ</text><text class="math" x="290" y="72" text-anchor="middle" data-tex="\\varphi">φ</text><text class="lbl" x="44" y="94" text-anchor="end">mode 1</text><text class="lbl" x="44" y="154" text-anchor="end">mode 2</text><text class="lbl" x="180" y="206" text-anchor="middle">two beam splitters, internal phase θ, output phase φ</text></svg>` },
    { caption: 'Two-photon interference', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Hong-Ou-Mandel dip: coincidence rate against photon delay, with a dip to near zero at zero delay"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><g class="axes"><path d="M56 40V196H300"/></g><path class="dash" d="M56 121H300"/><path class="well" d="M58.0 121.0L61.0 121.0L64.0 121.0L67.0 121.0L70.0 121.0L73.0 121.0L76.0 121.0L79.0 121.1L82.0 121.1L85.0 121.1L88.0 121.2L91.0 121.3L94.0 121.5L97.0 121.6L100.0 121.9L103.0 122.3L106.0 122.7L109.0 123.3L112.0 124.1L115.0 125.1L118.0 126.4L121.0 127.9L124.0 129.8L127.0 132.0L130.0 134.6L133.0 137.7L136.0 141.1L139.0 144.9L142.0 149.1L145.0 153.6L148.0 158.4L151.0 163.2L154.0 168.1L157.0 172.9L160.0 177.5L163.0 181.6L166.0 185.3L169.0 188.2L172.0 190.4L175.0 191.8L178.0 192.2L181.0 191.8L184.0 190.4L187.0 188.2L190.0 185.3L193.0 181.6L196.0 177.5L199.0 172.9L202.0 168.1L205.0 163.2L208.0 158.4L211.0 153.6L214.0 149.1L217.0 144.9L220.0 141.1L223.0 137.7L226.0 134.6L229.0 132.0L232.0 129.8L235.0 127.9L238.0 126.4L241.0 125.1L244.0 124.1L247.0 123.3L250.0 122.7L253.0 122.3L256.0 121.9L259.0 121.6L262.0 121.5L265.0 121.3L268.0 121.2L271.0 121.1L274.0 121.1L277.0 121.1L280.0 121.0L283.0 121.0L286.0 121.0L289.0 121.0L292.0 121.0L295.0 121.0L298.0 121.0"/><path class="axes2" d="M52 196.0H56"/><text class="ax" x="48" y="200" text-anchor="end" data-tex="0">0</text><path class="axes2" d="M52 121.0H56"/><text class="ax" x="48" y="125.0" text-anchor="end" data-tex="0.5">0.5</text><path class="axes2" d="M52 46.0H56"/><text class="ax" x="48" y="50" text-anchor="end" data-tex="1">1</text><text class="lbl dim" x="300" y="112" text-anchor="end">distinguishable photons</text><text class="lbl" x="178" y="230" text-anchor="middle" data-tex="\\textsf{Delay between photons }\\tau">Delay between photons τ</text><text class="ax" x="178" y="212" text-anchor="middle" data-tex="0">0</text><text class="lbl" transform="translate(14 118) rotate(-90)" text-anchor="middle">Coincidence probability</text><text class="lbl strong" x="178" y="160" text-anchor="middle">dip</text></svg>` },
  ],
  'silicon-spin': [
    { caption: 'Si/SiGe double dot (not to scale)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Cross-section of a gate-defined double quantum dot in a Si/SiGe heterostructure"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><rect class="lay" x="20" y="160" width="320" height="56"/><rect class="pad" x="20" y="140" width="320" height="20"/><rect class="lay" x="20" y="112" width="320" height="28"/><rect class="heater" x="52" y="86" width="52" height="26" rx="3"/><rect class="heater" x="256" y="86" width="52" height="26" rx="3"/><rect class="heater strong" x="118" y="84" width="40" height="28" rx="3"/><rect class="heater strong" x="168" y="84" width="25" height="28" rx="3"/><rect class="heater strong" x="203" y="84" width="40" height="28" rx="3"/><circle class="ion" cx="138" cy="150" r="6"/><circle class="ion" cx="223" cy="150" r="6"/><path class="tick2" d="M138 70V82M223 70V82M180 40V82"/><text class="lbl" x="138" y="66" text-anchor="middle">Plunger gate</text><text class="lbl" x="223" y="66" text-anchor="middle">Plunger gate</text><text class="lbl" x="180" y="36" text-anchor="middle">Barrier gate</text><text class="lbl" x="26" y="134">SiGe</text><text class="lbl" x="26" y="154">Si well</text><text class="lbl" x="26" y="190">SiGe</text><text class="lbl" x="180" y="214" text-anchor="middle">electron spin in each dot</text></svg>` },
    { caption: 'Double-dot potential', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Double-well potential with one electron in each well and tunnelling across the barrier set by the barrier gate"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><g class="axes"><path d="M40 36V200H320"/></g><path class="well" d="M60.0 36.2L63.0 60.5L66.0 82.3L69.0 101.7L72.0 119.0L75.0 134.2L78.0 147.4L81.0 158.9L84.0 168.6L87.0 176.8L90.0 183.6L93.0 189.0L96.0 193.2L99.0 196.3L102.0 198.4L105.0 199.6L108.0 200.0L111.0 199.7L114.0 198.7L117.0 197.2L120.0 195.2L123.0 192.8L126.0 190.1L129.0 187.1L132.0 184.0L135.0 180.7L138.0 177.4L141.0 174.1L144.0 170.8L147.0 167.7L150.0 164.6L153.0 161.7L156.0 159.0L159.0 156.6L162.0 154.4L165.0 152.6L168.0 151.0L171.0 149.8L174.0 148.9L177.0 148.3L180.0 148.2L183.0 148.3L186.0 148.9L189.0 149.8L192.0 151.0L195.0 152.6L198.0 154.4L201.0 156.6L204.0 159.0L207.0 161.7L210.0 164.6L213.0 167.7L216.0 170.8L219.0 174.1L222.0 177.4L225.0 180.7L228.0 184.0L231.0 187.1L234.0 190.1L237.0 192.8L240.0 195.2L243.0 197.2L246.0 198.7L249.0 199.7L252.0 200.0L255.0 199.6L258.0 198.4L261.0 196.3L264.0 193.2L267.0 189.0L270.0 183.6L273.0 176.8L276.0 168.6L279.0 158.9L282.0 147.4L285.0 134.2L288.0 119.0L291.0 101.7L294.0 82.3L297.0 60.5L300.0 36.2"/><circle class="ion" cx="108" cy="190" r="6"/><circle class="ion" cx="252" cy="190" r="6"/><text class="math big" x="108" y="176" text-anchor="middle" data-tex="\\uparrow">↑</text><text class="math big" x="252" y="176" text-anchor="middle" data-tex="\\downarrow">↓</text><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M118 146H242"/><text class="math" x="180" y="136" text-anchor="middle" data-tex="\\textsf{exchange }J\\textsf{ (barrier gate)}">exchange J (barrier gate)</text><text class="lbl" x="108" y="222" text-anchor="middle">dot 1</text><text class="lbl" x="252" y="222" text-anchor="middle">dot 2</text><text class="lbl dim" x="180" y="222" text-anchor="middle">barrier</text><text class="lbl" transform="translate(22 118) rotate(-90)" text-anchor="middle">Energy</text></svg>` },
    { caption: 'Spin levels in a field', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Zeeman splitting of an electron spin: up and down levels diverge linearly with magnetic field"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><g class="axes"><path d="M56 36V200H310"/></g><path class="well" d="M70 120L300 50"/><path class="well" d="M70 120L300 190"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M240 71V169"/><text class="math" x="232" y="122" text-anchor="end" data-tex="g\\mu_B B">gμB B</text><text class="math" x="304" y="54" data-tex="\\lvert{\\uparrow}\\rangle">|↑⟩</text><text class="math" x="304" y="194" data-tex="\\lvert{\\downarrow}\\rangle">|↓⟩</text><text class="lbl" x="183" y="222" text-anchor="middle" data-tex="\\textsf{Magnetic field } B">Magnetic field B</text><text class="lbl" transform="translate(22 118) rotate(-90)" text-anchor="middle">Energy</text><text class="dim" x="76" y="144" data-tex="B=0">B = 0</text></svg>` },
  ],
  'nv-centre': [
    { caption: 'NV centre in diamond (schematic)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Diamond lattice sketch with a nitrogen atom next to a missing carbon atom (vacancy)"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="bond" d="M22.0 120.0L22.0 150.0"/><path class="bond" d="M22.0 120.0L48.0 105.0"/><path class="bond" d="M22.0 150.0L48.0 165.0"/><path class="bond" d="M48.0 165.0L48.0 195.0"/><path class="bond" d="M48.0 165.0L74.0 150.0"/><path class="bond" d="M22.0 30.0L22.0 60.0"/><path class="bond" d="M22.0 60.0L48.0 75.0"/><path class="bond" d="M48.0 75.0L48.0 105.0"/><path class="bond" d="M48.0 75.0L74.0 60.0"/><path class="bond" d="M48.0 105.0L74.0 120.0"/><path class="bond" d="M74.0 120.0L74.0 150.0"/><path class="bond" d="M74.0 120.0L99.9 105.0"/><path class="bond" d="M74.0 150.0L99.9 165.0"/><path class="bond" d="M99.9 165.0L99.9 195.0"/><path class="bond" d="M99.9 165.0L125.9 150.0"/><path class="bond" d="M74.0 30.0L74.0 60.0"/><path class="bond" d="M74.0 60.0L99.9 75.0"/><path class="bond" d="M99.9 75.0L99.9 105.0"/><path class="bond" d="M99.9 75.0L125.9 60.0"/><path class="bond" d="M99.9 105.0L125.9 120.0"/><path class="bond" d="M125.9 120.0L125.9 150.0"/><path class="bond" d="M125.9 120.0L151.9 105.0"/><path class="bond" d="M125.9 150.0L151.9 165.0"/><path class="bond" d="M151.9 165.0L151.9 195.0"/><path class="bond" d="M151.9 165.0L177.9 150.0"/><path class="bond" d="M125.9 30.0L125.9 60.0"/><path class="bond" d="M125.9 60.0L151.9 75.0"/><path class="bond" d="M151.9 75.0L151.9 105.0"/><path class="bond" d="M151.9 75.0L177.9 60.0"/><path class="bond" d="M151.9 105.0L177.9 120.0"/><path class="bond" d="M177.9 120.0L177.9 150.0"/><path class="bond" d="M177.9 120.0L203.9 105.0"/><path class="bond" d="M177.9 150.0L203.9 165.0"/><path class="bond" d="M203.9 165.0L203.9 195.0"/><path class="bond" d="M203.9 165.0L229.8 150.0"/><path class="bond" d="M177.9 30.0L177.9 60.0"/><path class="bond" d="M177.9 60.0L203.9 75.0"/><path class="bond" d="M203.9 75.0L203.9 105.0"/><path class="bond" d="M203.9 75.0L229.8 60.0"/><path class="bond" d="M203.9 105.0L229.8 120.0"/><path class="bond" d="M229.8 120.0L229.8 150.0"/><path class="bond" d="M229.8 120.0L255.8 105.0"/><path class="bond" d="M229.8 150.0L255.8 165.0"/><path class="bond" d="M255.8 165.0L255.8 195.0"/><path class="bond" d="M255.8 165.0L281.8 150.0"/><path class="bond" d="M229.8 30.0L229.8 60.0"/><path class="bond" d="M229.8 60.0L255.8 75.0"/><path class="bond" d="M255.8 75.0L255.8 105.0"/><path class="bond" d="M255.8 75.0L281.8 60.0"/><path class="bond" d="M255.8 105.0L281.8 120.0"/><path class="bond" d="M281.8 120.0L281.8 150.0"/><path class="bond" d="M281.8 120.0L307.8 105.0"/><path class="bond" d="M281.8 150.0L307.8 165.0"/><path class="bond" d="M307.8 165.0L307.8 195.0"/><path class="bond" d="M307.8 165.0L333.8 150.0"/><path class="bond" d="M281.8 30.0L281.8 60.0"/><path class="bond" d="M281.8 60.0L307.8 75.0"/><path class="bond" d="M307.8 75.0L307.8 105.0"/><path class="bond" d="M307.8 75.0L333.8 60.0"/><path class="bond" d="M307.8 105.0L333.8 120.0"/><path class="bond" d="M333.8 120.0L333.8 150.0"/><path class="bond" d="M333.8 30.0L333.8 60.0"/><circle class="carbon" cx="22.0" cy="120.0" r="5"/><circle class="carbon" cx="22.0" cy="150.0" r="5"/><circle class="carbon" cx="48.0" cy="165.0" r="5"/><circle class="carbon" cx="48.0" cy="195.0" r="5"/><circle class="carbon" cx="22.0" cy="30.0" r="5"/><circle class="carbon" cx="22.0" cy="60.0" r="5"/><circle class="carbon" cx="48.0" cy="75.0" r="5"/><circle class="carbon" cx="48.0" cy="105.0" r="5"/><circle class="carbon" cx="74.0" cy="120.0" r="5"/><circle class="carbon" cx="74.0" cy="150.0" r="5"/><circle class="carbon" cx="99.9" cy="165.0" r="5"/><circle class="carbon" cx="99.9" cy="195.0" r="5"/><circle class="carbon" cx="74.0" cy="30.0" r="5"/><circle class="carbon" cx="74.0" cy="60.0" r="5"/><circle class="carbon" cx="99.9" cy="75.0" r="5"/><circle class="carbon" cx="99.9" cy="105.0" r="5"/><circle class="carbon" cx="125.9" cy="120.0" r="5"/><circle class="carbon" cx="125.9" cy="150.0" r="5"/><circle class="carbon" cx="151.9" cy="165.0" r="5"/><circle class="carbon" cx="151.9" cy="195.0" r="5"/><circle class="carbon" cx="125.9" cy="30.0" r="5"/><circle class="carbon" cx="125.9" cy="60.0" r="5"/><circle class="carbon" cx="151.9" cy="75.0" r="5"/><circle class="carbon" cx="151.9" cy="105.0" r="5"/><circle class="nit" cx="177.9" cy="150.0" r="8"/><circle class="carbon" cx="203.9" cy="165.0" r="5"/><circle class="carbon" cx="203.9" cy="195.0" r="5"/><circle class="carbon" cx="177.9" cy="30.0" r="5"/><circle class="carbon" cx="177.9" cy="60.0" r="5"/><circle class="carbon" cx="203.9" cy="75.0" r="5"/><circle class="carbon" cx="203.9" cy="105.0" r="5"/><circle class="carbon" cx="229.8" cy="120.0" r="5"/><circle class="carbon" cx="229.8" cy="150.0" r="5"/><circle class="carbon" cx="255.8" cy="165.0" r="5"/><circle class="carbon" cx="255.8" cy="195.0" r="5"/><circle class="carbon" cx="229.8" cy="30.0" r="5"/><circle class="carbon" cx="229.8" cy="60.0" r="5"/><circle class="carbon" cx="255.8" cy="75.0" r="5"/><circle class="carbon" cx="255.8" cy="105.0" r="5"/><circle class="carbon" cx="281.8" cy="120.0" r="5"/><circle class="carbon" cx="281.8" cy="150.0" r="5"/><circle class="carbon" cx="307.8" cy="165.0" r="5"/><circle class="carbon" cx="307.8" cy="195.0" r="5"/><circle class="carbon" cx="281.8" cy="30.0" r="5"/><circle class="carbon" cx="281.8" cy="60.0" r="5"/><circle class="carbon" cx="307.8" cy="75.0" r="5"/><circle class="carbon" cx="307.8" cy="105.0" r="5"/><circle class="carbon" cx="333.8" cy="120.0" r="5"/><circle class="carbon" cx="333.8" cy="150.0" r="5"/><circle class="carbon" cx="333.8" cy="30.0" r="5"/><circle class="carbon" cx="333.8" cy="60.0" r="5"/><circle class="vac" cx="177.9" cy="120.0" r="9"/><text class="lbl halo" x="211.9" y="114.0">Vacancy</text><text class="lbl halo" x="211.9" y="166.0">Nitrogen</text><text class="lbl" x="180" y="224" text-anchor="middle">Carbon lattice (2D sketch of diamond)</text></svg>` },
    { caption: 'Level scheme and optical readout (not to scale)', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="NV centre level scheme: triplet ground and excited states, singlet states, optical pumping and fluorescence"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><path class="lev" d="M50 196H130"/><path class="lev" d="M50 172H130"/><path class="lev" d="M50 68H130"/><path class="lev" d="M50 52H130"/><path class="lev" d="M230 138H300"/><path class="lev" d="M230 118H300"/><path class="beam" marker-end="url(#ahp)" d="M70 192V74"/><path class="arr" marker-end="url(#ah)" d="M112 70V190"/><path class="dash2" marker-end="url(#ah)" d="M132 54L228 116"/><path class="dash2" marker-end="url(#ah)" d="M228 140L132 192"/><path class="dash2" marker-end="url(#ah)" d="M228 138L132 174" opacity=".5"/><path class="dash2" marker-end="url(#ah)" d="M265 121V135"/><text class="lbl" x="64" y="130" text-anchor="end" data-tex="532\\,\\textsf{nm}">532 nm</text><text class="lbl" x="120" y="130" data-tex="637\\textsf{–}800\\,\\textsf{nm}">637–800 nm</text><text class="lbl dim" x="182" y="80" text-anchor="middle">ISC</text><text class="math" x="46" y="200" text-anchor="end" data-tex="0">0</text><text class="math" x="46" y="176" text-anchor="end" data-tex="\\pm1">±1</text><text class="math" x="46" y="72" text-anchor="end" data-tex="0">0</text><text class="math" x="46" y="56" text-anchor="end" data-tex="\\pm1">±1</text><text class="math" x="306" y="142" data-tex="{}^1E">¹E</text><text class="math" x="306" y="122" data-tex="{}^1A_1">¹A₁</text><text class="math big" x="90" y="36" text-anchor="middle" data-tex="{}^3E">³E</text><text class="lbl" x="90" y="222" text-anchor="middle" data-tex="{}^3A_2\\ (D=2.87\\ \\textsf{GHz})">³A₂ (D = 2.87 GHz)</text></svg>` },
    { caption: 'ODMR spectrum', svg: `<svg viewBox="0 0 360 240" role="img" aria-label="Optically detected magnetic resonance: two fluorescence dips either side of 2.87 GHz"><defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead" d="M0 0L6 3L0 6z"/></marker><marker id="ahp" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="arrowhead-p" d="M0 0L6 3L0 6z"/></marker></defs><g class="axes"><path d="M56 36V196H300"/></g><path class="dash" d="M56 70H300"/><path class="well" d="M56 70.4L57 70.4L58 70.4L59 70.4L60 70.4L61 70.4L62 70.4L63 70.5L64 70.5L65 70.5L66 70.5L67 70.5L68 70.5L69 70.5L70 70.5L71 70.5L72 70.6L73 70.6L74 70.6L75 70.6L76 70.6L77 70.6L78 70.7L79 70.7L80 70.7L81 70.7L82 70.7L83 70.8L84 70.8L85 70.8L86 70.9L87 70.9L88 70.9L89 70.9L90 71.0L91 71.0L92 71.1L93 71.1L94 71.1L95 71.2L96 71.2L97 71.3L98 71.3L99 71.4L100 71.5L101 71.5L102 71.6L103 71.7L104 71.8L105 71.9L106 72.0L107 72.1L108 72.2L109 72.3L110 72.4L111 72.6L112 72.8L113 72.9L114 73.1L115 73.4L116 73.6L117 73.9L118 74.2L119 74.5L120 74.9L121 75.3L122 75.8L123 76.4L124 77.0L125 77.8L126 78.6L127 79.6L128 80.7L129 82.0L130 83.5L131 85.3L132 87.3L133 89.5L134 92.1L135 94.7L136 97.5L137 100.1L138 102.3L139 103.8L140 104.3L141 103.8L142 102.4L143 100.2L144 97.6L145 94.8L146 92.2L147 89.7L148 87.4L149 85.4L150 83.7L151 82.2L152 80.9L153 79.8L154 78.9L155 78.0L156 77.3L157 76.7L158 76.2L159 75.7L160 75.3L161 74.9L162 74.6L163 74.3L164 74.1L165 73.9L166 73.7L167 73.5L168 73.4L169 73.2L170 73.1L171 73.0L172 72.9L173 72.8L174 72.8L175 72.7L176 72.7L177 72.7L178 72.6L179 72.6L180 72.6L181 72.6L182 72.6L183 72.7L184 72.7L185 72.7L186 72.8L187 72.8L188 72.9L189 73.0L190 73.1L191 73.2L192 73.4L193 73.5L194 73.7L195 73.9L196 74.1L197 74.3L198 74.6L199 74.9L200 75.3L201 75.7L202 76.2L203 76.7L204 77.3L205 78.0L206 78.9L207 79.8L208 80.9L209 82.2L210 83.7L211 85.4L212 87.4L213 89.7L214 92.2L215 94.8L216 97.6L217 100.2L218 102.4L219 103.8L220 104.3L221 103.8L222 102.3L223 100.1L224 97.5L225 94.7L226 92.1L227 89.5L228 87.3L229 85.3L230 83.5L231 82.0L232 80.7L233 79.6L234 78.6L235 77.8L236 77.0L237 76.4L238 75.8L239 75.3L240 74.9L241 74.5L242 74.2L243 73.9L244 73.6L245 73.4L246 73.1L247 72.9L248 72.8L249 72.6L250 72.4L251 72.3L252 72.2L253 72.1L254 72.0L255 71.9L256 71.8L257 71.7L258 71.6L259 71.5L260 71.5L261 71.4L262 71.3L263 71.3L264 71.2L265 71.2L266 71.1L267 71.1L268 71.1L269 71.0L270 71.0L271 70.9L272 70.9L273 70.9L274 70.9L275 70.8L276 70.8L277 70.8L278 70.7L279 70.7L280 70.7L281 70.7L282 70.7L283 70.6L284 70.6L285 70.6L286 70.6L287 70.6L288 70.6L289 70.5L290 70.5L291 70.5L292 70.5L293 70.5L294 70.5L295 70.5L296 70.5L297 70.5L298 70.4L299 70.4L300 70.4"/><path class="dbl" marker-start="url(#ah)" marker-end="url(#ah)" d="M140 128H220"/><text class="math" x="180" y="122" text-anchor="middle" data-tex="2\\gamma B">2γB</text><text class="ax" x="178" y="214" text-anchor="middle" data-tex="2.87">2.87</text><text class="lbl" x="178" y="230" text-anchor="middle">Microwave frequency (GHz)</text><text class="lbl" transform="translate(22 118) rotate(-90)" text-anchor="middle">Fluorescence</text></svg>` },
  ],
};

function typeset(root) {
  if (!window.katex) return;
  const NS = 'http://www.w3.org/2000/svg', W = 190, H = 28;
  root.querySelectorAll('text[data-tex]').forEach(t => {
    const x = +t.getAttribute('x'), y = +t.getAttribute('y'), anchor = t.getAttribute('text-anchor') || 'start';
    const fo = document.createElementNS(NS, 'foreignObject');
    fo.setAttribute('width', W); fo.setAttribute('height', H);
    fo.setAttribute('x', anchor === 'middle' ? x - W / 2 : anchor === 'end' ? x - W : x);
    fo.setAttribute('y', y - H / 2 - 4);
    if (t.hasAttribute('transform')) fo.setAttribute('transform', t.getAttribute('transform'));
    const box = document.createElement('div');
    box.className = 'tex-box ' + (t.getAttribute('class') || '');
    box.style.justifyContent = anchor === 'middle' ? 'center' : anchor === 'end' ? 'flex-end' : 'flex-start';
    box.innerHTML = katex.renderToString(t.dataset.tex, { throwOnError: false });
    fo.appendChild(box);
    t.replaceWith(fo);
  });
}

const REFS = [
  // { key, platform, text, arxiv, chip?, org?, lead?, role?, info: [qubits, type, hardware, extra, headline] }; order = citation number, grouped by platform
  {"key": "krantz", "platform": "superconducting", "text": "Krantz et al., “A Quantum Engineer’s Guide to Superconducting Qubits” (2019).", "arxiv": "1904.06560", "info": ["Review: qubit design, noise, control and readout"]},
  {"key": "kjaergaard", "platform": "superconducting", "text": "Kjaergaard et al., “Superconducting Qubits: Current State of Play” (2019).", "arxiv": "1905.13641", "org": "MIT and Chalmers", "info": ["Review of superconducting qubits: hardware, gates, readout, NISQ algorithms and error correction"]},
  {"key": "zuchongzhi", "platform": "superconducting", "text": "Zuchongzhi collaboration, “Establishing a New Benchmark in Quantum Computational Advantage with 105-qubit Zuchongzhi 3.0 Processor” (2024).", "arxiv": "2412.11924", "chip": "Zuchongzhi 3.0", "org": "USTC", "lead": "Jian-Wei Pan and Xiaobo Zhu", "role": "email contacts; Pan is last author", "info": ["105 qubits (83 used in the experiment)", "transmons", "15×7 rectangular lattice, 182 tunable couplers, flip-chip (qubit chip + control/readout chip)", "83-qubit, 32-cycle random circuit sampling", "mean simultaneous errors: 1q 99.90%, iSWAP-like 2q 99.62%, readout 99.18%; T₁ ≈ 72 µs"]},
  {"key": "willow", "platform": "superconducting", "text": "Acharya et al., “Quantum error correction below the surface code threshold” (2024).", "arxiv": "2408.13687", "chip": "Willow", "org": "Google Quantum AI", "lead": "Hartmut Neven", "role": "correspondence contact", "info": ["105 qubits (a 72-qubit processor for distance 5)", "transmons", "square grid, CZ gates, 1.1 µs error-correction cycle", "logical memory 2.4× better than its best physical qubit", "distance-7 surface code on 101 qubits, 0.143% logical error per cycle"]},
  {"key": "chen2026", "platform": "superconducting", "text": "Chen et al., “Unlocking a fast adiabatic CZ gate and exact residual ZZ cancellation between fixed-frequency transmons using a floating tunable coupler” (2026).", "arxiv": "2604.05048", "org": "Rigetti Computing", "lead": "Stefano Poletto", "role": "last author, email contact", "info": ["2 qubits", "fixed-frequency transmons", "symmetric floating tunable coupler, exact ZZ = 0 point (gates run at ZZ = 27.3 kHz)", "8.5 h stability", "24 ns CZ: best 99.927%, 8.5 h average 99.878%"]},
  {"key": "li1q", "platform": "superconducting", "text": "Li et al., “Error per single-qubit gate below 10⁻⁴ in a superconducting qubit” (2023).", "arxiv": "2302.08690", "org": "BAQIS", "lead": "Jing-Ning Zhang and Weiyang Liu", "role": "corresponding authors", "info": ["5-transmon chip (one benchmarked)", "fixed-frequency tantalum-film transmon", "each qubit has its own readout cavity on a shared line", "T₁ 231 µs, 20 ns gates, gate set tomography", "average single-qubit gate error 7.42×10⁻⁵ (RB)"]},
  {"key": "bland", "platform": "superconducting", "text": "Bland et al., “2D transmons with lifetimes and coherence times exceeding 1 millisecond” (2025).", "arxiv": "2503.14798", "org": "Princeton University", "lead": "Nathalie de Leon and Andrew Houck", "role": "corresponding authors", "info": ["single-qubit devices (45 qubits on 9 chips)", "tantalum-on-silicon transmons", "Ta base layer on high-resistivity Si, Al/AlOₓ junctions", "materials study; echo T₂ exceeds T₁", "T₁ up to 1.68 ms (88 h average 1.0 ms); 1q error 6.4×10⁻⁵ (99.994%) on a different qubit"]},
  {"key": "marxer", "platform": "superconducting", "text": "Marxer et al., “Above 99.9% Fidelity Single-Qubit Gates, Two-Qubit Gates, and Readout in a Single Superconducting Quantum Device” (2025).", "arxiv": "2508.16437", "org": "IQM Quantum Computers", "lead": "Antti Vepsäläinen", "role": "last author, email contact", "info": ["2 qubits", "flux-tunable transmons + a tunable transmon coupler", "PALEA calibration", "all on one device", "CZ 99.93% (40 h average, 33 ns); 1q 99.98%; readout >99.94%"]},
  {"key": "krinner", "platform": "superconducting", "text": "Krinner et al., “Engineering cryogenic setups for 100-qubit scale superconducting circuit systems” (2018).", "arxiv": "1806.07862", "info": ["Engineering paper: cryogenic setups, wiring and heat load for ~100-qubit systems"]},
  {"key": "gao2025", "platform": "superconducting", "text": "Gao et al., “Ultrafast Single Qubit Gates through Multi-Photon Transition Removal” (2025).", "arxiv": "2511.22365", "info": ["single-qubit gates on a superconducting qubit", "multi-photon transition removal", "fidelity above 99.98% down to 6.8 ns"]},
  {"key": "helios", "platform": "ions", "text": "Ransford et al., “Helios: A 98-qubit trapped-ion quantum computer” (2025).", "arxiv": "2511.05465", "chip": "Helios", "org": "Quantinuum", "info": ["98 qubits", "¹³⁷Ba⁺ hyperfine (with Yb⁺ coolant ions)", "2D surface-electrode QCCD trap: rotatable ion ring + junction, all-to-all connectivity", "98-qubit random circuit sampling beyond classical simulation", "average infidelity 2.5×10⁻⁵ (1q), 7.9×10⁻⁴ (2q)"]},
  {"key": "h2", "platform": "ions", "text": "DeCross et al., “The computational power of random quantum circuits in arbitrary geometries” (2024).", "arxiv": "2406.02501", "chip": "H2", "org": "Quantinuum", "lead": "Michael Foss-Feig", "role": "last author", "info": ["up to 56 qubits", "¹⁷¹Yb⁺ with ¹³⁸Ba⁺ coolant ions", "QCCD race-track surface trap, arbitrary connectivity", "random circuit sampling beyond classical simulation", "average 2q fidelity 99.84%"]},
  {"key": "smith", "platform": "ions", "text": "Smith et al., “Single-qubit gates with errors at the 10⁻⁷ level” (2024).", "arxiv": "2412.04421", "org": "University of Oxford (Clarendon Laboratory)", "lead": "David Lucas", "role": "last author", "info": ["1 qubit", "⁴³Ca⁺ hyperfine clock qubit", "surface-electrode trap with integrated microwave resonator, room temperature, no magnetic shielding", "T₂ ≈ 70 s", "1.5×10⁻⁷ error per Clifford (13 µs gate); 2.9×10⁻⁷ at 4.4 µs"]},
  {"key": "hughes", "platform": "ions", "text": "Hughes et al., “Trapped-ion two-qubit gates with >99.99% fidelity without ground-state cooling” (2025).", "arxiv": "2510.17286", "org": "Oxford Ionics (IonQ)", "info": ["2 qubits", "⁴⁰Ca⁺ Zeeman qubits", "cryogenic trap, electronically controlled gate (~226 µs), Doppler cooling only", "works up to ~9 motional quanta", "estimated 2q error 8.4×10⁻⁵ (1.16×10⁻⁴ over the full 500-Clifford fit)"]},
  {"key": "schafer", "platform": "ions", "text": "Schäfer et al., “Fast quantum logic gates with trapped-ion qubits” (2017).", "arxiv": "1709.06952", "org": "University of Oxford (Clarendon Laboratory)", "lead": "David Lucas", "role": "corresponding author", "info": ["2 qubits", "⁴³Ca⁺ hyperfine", "blade Paul trap, amplitude-shaped laser pulses", "480 ns entangling gate at ~60% fidelity", "1.6 µs gate, 99.8% (SPAM-corrected)"]},
  {"key": "guo", "platform": "ions", "text": "Guo et al., “A Site-Resolved 2D Quantum Simulator with Hundreds of Trapped Ions” (2023).", "arxiv": "2311.17163", "org": "Tsinghua University", "lead": "L.-M. Duan", "role": "corresponding author", "info": ["512 ions trapped, 300 used", "¹⁷¹Yb⁺", "2D Wigner crystal in a monolithic 3D trap at 6.1 K; EIT and sideband cooling; global microwave + 411 nm control; site-resolved readout", "analog long-range Ising simulation and quench dynamics"]},
  {"key": "wang1h", "platform": "ions", "text": "Wang et al., “Single ion-qubit exceeding one hour coherence time” (2020).", "arxiv": "2008.00251", "org": "Tsinghua University", "lead": "Kihwan Kim", "role": "last author", "info": ["1 qubit (plus a ¹³⁸Ba⁺ coolant ion)", "¹⁷¹Yb⁺ hyperfine", "four-rod Paul trap, 12.6 GHz microwave control, two-layer µ-metal shielding", "dynamical decoupling", "coherence over 1 hour"]},
  {"key": "bruz", "platform": "ions", "text": "Bruzewicz et al., “Trapped-Ion Quantum Computing: Progress and Challenges” (2019).", "arxiv": "1904.04178", "org": "MIT Lincoln Laboratory", "lead": "Jeremy M. Sage", "role": "last author", "info": ["Review of trapped-ion quantum computing"]},
  {"key": "pagano", "platform": "ions", "text": "Pagano et al., “Cryogenic trapped-ion system for large scale quantum simulation” (2018).", "arxiv": "1802.03118", "info": ["over 100 ¹⁷¹Yb⁺ ions in a linear chain", "segmented-blade trap in a 4 K cryostat", "kept for hours; cryogenic pumping gives low background pressure"]},
  {"key": "evered", "platform": "neutral-atoms", "text": "Evered et al., “High-fidelity parallel entangling gates on a neutral atom quantum computer” (2023).", "arxiv": "2304.05420", "org": "Harvard / MIT", "lead": "Mikhail Lukin", "role": "last author", "info": ["up to 60 atoms", "⁸⁷Rb clock qubits", "850 nm SLM tweezers, global Raman 1q control (99.97%), single-pulse time-optimal Rydberg CZ (275 ns)", "CCZ gates also demonstrated", "2q fidelity 99.5% (99.48(2)% on 60 atoms)"]},
  {"key": "bluvstein", "platform": "neutral-atoms", "text": "Bluvstein et al., “Logical quantum processor based on reconfigurable atom arrays” (2023).", "arxiv": "2312.03982", "org": "Harvard / MIT / QuEra / NIST-UMD", "lead": "Mikhail Lukin", "role": "last author", "info": ["up to 280 atoms (48 logical qubits)", "⁸⁷Rb clock qubits", "zoned SLM + 2D-AOD tweezer array, local Raman 1q, 270 ns Rydberg CZ", "logical processor: surface code d = 3 to 7, color codes, error-detected (8,3,2) blocks", "up to 48 logical qubits, 228 logical 2q gates"]},
  {"key": "manetsch", "platform": "neutral-atoms", "text": "Manetsch et al., “A tweezer array with 6100 highly coherent atomic qubits” (2024).", "arxiv": "2403.12021", "org": "Caltech", "lead": "Manuel Endres", "role": "corresponding author", "info": ["6,100 atoms in ~12,000 sites", "¹³³Cs clock qubits", "circular SLM tweezer array, 7.2 µm spacing, room-temperature vacuum", "imaging survival 99.99%; global 1q RB 99.98%", "T₂ = 12.6 s with dynamical decoupling (3.2 s at full trap depth)"]},
  {"key": "rozanov", "platform": "neutral-atoms", "text": "Rozanov et al., “Benchmarking Single-Qubit Gates on a Neutral Atom Quantum Processor” (2025).", "arxiv": "2509.06881", "org": "Moscow State University / Russian Quantum Center", "lead": "Stanislav Straupe", "role": "last author", "info": ["25 qubits", "⁸⁷Rb hyperfine qubits", "2D SLM tweezer array (813 nm), 3.5 µm spacing, global microwave 1q control", "benchmarking by direct RB and gate set tomography", "1q fidelity 99.963% (single qubit); 99.946% averaged over the 25"]},
  {"key": "muniz", "platform": "neutral-atoms", "text": "Muniz et al., “High-fidelity universal gates in the ¹⁷¹Yb ground state nuclear spin qubit” (2024). 99.72% with post-selection.", "arxiv": "2411.11708", "org": "Atom Computing", "lead": "B. J. Bloom", "role": "last author, email contact", "info": ["84-site array (12×7); gates on a 7-site interaction zone", "¹⁷¹Yb nuclear spin", "tweezers, individually addressed Raman 1q gates; CZ via ³P₀ clock shelving + Rydberg", "1q Clifford 99.963%", "CZ 99.72% with post-selection (99.40% without)"]},
  {"key": "tsai", "platform": "neutral-atoms", "text": "Tsai et al., “Benchmarking and fidelity response theory of high-fidelity Rydberg entangling gates” (2024).", "arxiv": "2407.20184", "org": "Caltech", "lead": "Manuel Endres", "role": "last author, email contact", "info": ["tweezer array (size not stated)", "⁸⁸Sr", "time-optimal single-pulse Rydberg CZ with sinusoidal phase modulation, Rabi 7.7 MHz", "fidelity response theory for laser noise; projects ≳99.9%", "CZ fidelity 99.71% (symmetric-state average, leakage-corrected)"]},
  {"key": "radnaev", "platform": "neutral-atoms", "text": "Radnaev et al., “A universal neutral-atom quantum computer with individual optical addressing and non-destructive readout” (2024).", "arxiv": "2408.08288", "org": "Infleqtion / UW–Madison", "lead": "Tom Noel", "role": "corresponding author", "info": ["24 computational + 12 reservoir atoms", "Cs clock qubits", "1064 nm tweezers at 6 µm, local RZ via 459 nm beams, non-destructive readout", "416 ns Rydberg CZ", "CZ 99.35% (99.73% excluding loss events); local RZ 99.902%"]},
  {"key": "saffman", "platform": "neutral-atoms", "text": "Saffman, “Quantum computing with atomic qubit arrays: confronting the cost of connectivity” (2025).", "arxiv": "2505.11218", "org": "UW–Madison / Infleqtion", "lead": "Mark Saffman", "role": "sole author", "info": ["Lecture-notes review (Varenna 2024): connectivity in atom-array quantum computers, long-range Rydberg gates vs atom motion"]},
  {"key": "chiu", "platform": "neutral-atoms", "text": "Chiu et al., “Continuous operation of a coherent 3,000-qubit system” (2025).", "arxiv": "2506.20660", "org": "Harvard / MIT", "lead": "Mikhail Lukin and Simon Hollerith", "role": "corresponding authors", "info": [">3,000 atoms (3,217 in a 90×36 array)", "⁸⁷Rb", "SLM tweezer storage, two optical-lattice conveyor belts, reloading ~300,000 atoms/s", "array maintained for over 2 hours", "coherent storage T₂ ~1.1 s with shielding"]},
  {"key": "henriet", "platform": "neutral-atoms", "text": "Henriet et al., “Quantum computing with neutral atoms” (2020).", "arxiv": "2006.12326", "info": ["Review of quantum computing with neutral atoms"]},
  {"key": "alexander", "platform": "photonic", "text": "Alexander et al., “A manufacturable platform for photonic quantum computing” (2024).", "arxiv": "2404.17570", "org": "PsiQuantum", "lead": "Mark G. Thompson", "role": "email contact", "info": ["component benchmarks of dual-rail qubits", "silicon photonics, path-encoded", "300 mm SOI with GlobalFoundries, NbN SNSPDs, thermal phase shifters, ~2 K cryostat", "on-chip Hong–Ou–Mandel visibility 99.50%", "state prep. and measurement 99.98%, Bell fusion 99.22% (both conditional on detection), 42 m chip-to-chip link 99.72%; all excluding loss"]},
  {"key": "liu", "platform": "photonic", "text": "Liu et al., “Robust quantum computational advantage with programmable 3050-photon Gaussian boson sampling” (2025).", "arxiv": "2508.09092", "chip": "Jiuzhang 4.0", "org": "USTC", "lead": "Jian-Wei Pan and Chao-Yang Lu", "role": "email contacts; Pan is last author", "info": ["8,176 output modes", "Gaussian boson sampling, 1,024 squeezed states", "hybrid spatial–temporal encoding, 3×16-mode interferometers with fibre delay loops, 16 SNSPDs, 51% overall efficiency", "up to 3,050 detected photons, 25.6 µs per sample"]},
  {"key": "hu", "platform": "photonic", "text": "Hu et al., “Detecting single infrared photons toward optimal system detection efficiency” (2020).", "arxiv": "2009.14690", "org": "SIMIT, Chinese Academy of Sciences", "lead": "Lixing You and Hao Li", "role": "email contacts", "info": ["single detector (not a qubit device)", "NbN nanowire (SNSPD)", "twin-layer nanowires on a 13-layer SiO₂/Ta₂O₅ mirror; GM cryocooler", "73% of 45 detectors above 80% efficiency at 2.1 K", "98% efficiency at 0.8 K (1590 nm), 95% at 2.1 K (1550 nm)"]},
  {"key": "ji", "platform": "photonic", "text": "Ji et al., “Foundry compatible, efficient wafer-scale manufacturing of ultra-low loss, high-density Si₃N₄ photonic integrated circuits” (2024).", "arxiv": "2406.14296", "org": "EPFL", "lead": "Tobias J. Kippenberg", "role": "last author, email contact", "info": ["photonic circuits (no qubits)", "Si₃N₄ waveguides and resonators", "4-inch wafers, 820 nm LPCVD Si₃N₄, DUV stepper, subtractive etching, filler trenches against film stress", "on-chip soliton microcombs", "typical resonator loss 1.4 dB/m at 1550 nm (Q ~ 24 million); spiral waveguides 2.3–4 dB/m"]},
  {"key": "maring", "platform": "photonic", "text": "Maring et al., “A general-purpose single-photon-based quantum computing platform” (2023).", "arxiv": "2306.00874", "org": "Quandela", "info": ["6 photons in 12 modes", "single-photon qubits (quantum-dot source)", "12-mode universal Si₃N₄ interferometer, thermo-optic phase shifters", "1-, 2- and 3-qubit gates", "1q 99.6%, 2q 93.8% (post-selected), 3q 86%"]},
  {"key": "harris", "platform": "photonic", "text": "Harris et al., “Efficient, Compact and Low Loss Thermo-Optic Phase Shifter in Silicon” (2014).", "arxiv": "1410.3616", "info": ["silicon thermo-optic phase shifter", "−3 dB bandwidth ~130 kHz, low loss"]},
  {"key": "xue", "platform": "silicon-spin", "text": "Xue et al., “Computing with spin qubits at the surface code error threshold” (2021).", "arxiv": "2107.00628", "org": "QuTech, TU Delft", "lead": "Lieven Vandersypen", "role": "last author", "info": ["2 qubits", "²⁸Si/SiGe", "double dot with charge sensor; micromagnet for EDSR", "VQE of the H₂ ground-state energy", "all gates >99.5% (GST); CPHASE 99.65%"]},
  {"key": "noiri", "platform": "silicon-spin", "text": "Noiri et al., “Fast universal quantum control above the fault-tolerance threshold in silicon” (2021).", "arxiv": "2108.02626", "org": "RIKEN", "lead": "Seigo Tarucha", "role": "last author, email contact", "info": ["2 qubits (in a triple dot)", "enriched ²⁸Si/SiGe (800 ppm ²⁹Si)", "Co micromagnet, three Al gate layers", "Deutsch–Jozsa and Grover algorithms; 103 ns CNOT", "CNOT 99.51% (interleaved RB), 1q 99.84%"]},
  {"key": "steinacker", "platform": "silicon-spin", "text": "Steinacker et al., “A 300 mm foundry silicon spin qubit unit cell exceeding 99% fidelity in all operations” (2024).", "arxiv": "2410.15590", "org": "UNSW / Diraq (fabricated at imec)", "lead": "Andrew Dzurak", "role": "last author, one of three email contacts", "info": ["2 qubits", "Si-MOS, enriched ²⁸Si (400 ppm ²⁹Si)", "300 mm imec foundry line, triple-layer polysilicon gates, Al ESR stripline, 10 mK", "errors limited by residual ²⁹Si", "all gates >99% (CZ 99.37%), SPAM 99.95% (GST)"]},
  {"key": "wu", "platform": "silicon-spin", "text": "Wu et al., “Simultaneous High-Fidelity Single-Qubit Gates in a Spin Qubit Array” (2025).", "arxiv": "2507.11918", "org": "RIKEN", "lead": "Seigo Tarucha", "role": "last author, co-corresponding", "info": ["5 qubits", "²⁸Si/SiGe", "linear dot array with 2 charge sensors, Co micromagnet, one shared EDSR line, 83–125 ns gates", "simultaneous gates: >99.99% for up to 3 qubits, ~99.9% for all 5", "each 1q gate >99.99% individually"]},
  {"key": "takeda", "platform": "silicon-spin", "text": "Takeda et al., “Assessing fidelity-limiting factors and achieving single-qubit gate fidelity beyond 99.999% in driven silicon spin qubits” (2026).", "arxiv": "2608.11072", "org": "RIKEN", "lead": "Kenta Takeda and Seigo Tarucha", "role": "corresponding authors", "info": ["2 qubits (double dot of a 5-dot device)", "²⁸Si/SiGe (800 ppm ²⁹Si)", "Co micromagnet, RF charge sensor, no nearby reservoir, Gaussian pulses (156 ns), best at 100 mK", "errors mostly decoherence", "π/2 gate fidelity 99.9992% (RB)"]},
  {"key": "philips", "platform": "silicon-spin", "text": "Philips et al., “Universal control of a six-qubit quantum processor in silicon” (2022).", "arxiv": "2202.09252", "org": "QuTech, TU Delft", "lead": "Lieven Vandersypen", "role": "corresponding author", "info": ["6 qubits", "²⁸Si/SiGe (0.08% ²⁹Si)", "linear array between 2 sensing dots, 2 Co micromagnets", "QND readout with real-time feedback; 3-qubit GHZ states (71–84%)", "1q gates 99.77–99.96%; Bell states 89–95%"]},
  {"key": "george", "platform": "silicon-spin", "text": "George et al., “12-spin-qubit arrays fabricated on a 300 mm semiconductor manufacturing line” (2024). Twelve quantum dots per array.", "arxiv": "2410.16583", "chip": "Tunnel Falls", "org": "Intel", "lead": "James Clarke", "role": "last author", "info": ["12 dots per array (all 12 driven individually)", "Si/SiGe (natural Si in the measured sample)", "300 mm line, EUV + immersion lithography, integrated Co micromagnet", "96% of devices tuned to the single-electron regime at 1.7 K", "12-qubit Rabi oscillations; T₂* ≈ 1.3 µs, Hahn T₂ ≈ 112 µs"]},
  {"key": "muhonen", "platform": "silicon-spin", "text": "Muhonen et al., “Storing quantum information for 30 seconds in a nanoelectronic device” (2014).", "arxiv": "1402.7140", "org": "UNSW", "lead": "Andrea Morello", "role": "last author", "info": ["single donors (electron and nuclear spin qubits)", "³¹P in ²⁸Si (800 ppm ²⁹Si)", "SET readout, on-chip antenna, Al gates, ion-implanted donors, 20 mK", "electron coherence 0.56 s", "nuclear-spin T₂ up to 35.6 s (³¹P⁺, CPMG); nuclear control fidelity 99.99%"]},
  {"key": "yang", "platform": "silicon-spin", "text": "Yang et al., “Silicon quantum processor unit cell operation above one Kelvin” (2019).", "arxiv": "1902.09126", "org": "UNSW", "lead": "Andrew Dzurak", "role": "last author, email contact", "info": ["2 qubits", "Si-MOS, enriched ²⁸Si", "isolated double dot, Co micromagnet, SET sensor", "works down to 0.1 T", "at 1.5 K: 1q fidelity 98.6%, T₂* 2 µs (at 40 mK: 99.76%)"]},
  {"key": "petit", "platform": "silicon-spin", "text": "Petit et al., “High-fidelity two-qubit gates in silicon above one Kelvin” (2020).", "arxiv": "2007.09034", "org": "QuTech, TU Delft (with Intel)", "lead": "Menno Veldhorst", "role": "corresponding author", "info": ["2 qubits", "²⁸Si epilayer (800 ppm ²⁹Si)", "overlapping gates, on-chip Al ESR line, no micromagnet", "CROT, CPHASE and SWAP demonstrated at 1.05 K", "two-qubit fidelities up to 99.4% are simulated (predicted), not measured"]},
  {"key": "mills", "platform": "silicon-spin", "text": "Mills et al., “Two-qubit silicon quantum processor with operation fidelity exceeding 99%” (2021).", "arxiv": "2111.11937", "org": "Princeton University", "info": ["2 qubits", "Si/SiGe", "exchange-based CZ via the barrier gate; spin-selective tunnelling readout", "π/2 gate 70 ns; qubit size ~100 nm", "CZ 99.81% (RB); 1q and 2q >99%"]},
  {"key": "nickl", "platform": "silicon-spin", "text": "Nickl et al., “Eight-Qubit Operation of a 300 mm SiMOS Foundry-Fabricated Device” (2025).", "arxiv": "2512.10174", "org": "Diraq / UNSW / imec", "info": ["8 qubits tuned and coherently controlled (one 2q gate shown)", "single-spin qubits, Si-MOS", "300 mm foundry device", "Hahn T₂ up to 1.31 ms", "T₂* up to 41 µs"]},
  {"key": "tomic", "platform": "silicon-spin", "text": "Tomić et al., “Long coherence silicon spin qubit fabricated in a 300 mm industrial foundry” (2025).", "arxiv": "2512.20758", "info": ["singlet–triplet qubit", "silicon", "300 mm industrial foundry device", "Hahn T₂ = 4 ms"]},
  {"key": "camenzind", "platform": "silicon-spin", "text": "Camenzind et al., “A hole spin qubit in a fin field-effect transistor above 4 kelvin” (2021).", "arxiv": "2103.07369", "info": ["single hole spin qubit", "silicon FinFET", "operation above 4 K", "1q fidelity 98.9% at 1.5 K, 97.9% at 4.2 K"]},
  {"key": "xuecmos", "platform": "silicon-spin", "text": "Xue et al., “CMOS-based cryogenic control of silicon quantum circuits” (2020).", "arxiv": "2009.14185", "info": ["cryo-CMOS control chip", "Intel 22 nm FinFET", "drives silicon spin qubits at ~20 mK from a 3 K stage", "same fidelity as commercial instruments"]},
  {"key": "abobeih", "platform": "nv-centre", "text": "Abobeih et al., “One-second coherence for a single electron spin coupled to a multi-qubit nuclear-spin environment” (2018).", "arxiv": "1801.01196", "org": "QuTech, TU Delft", "lead": "Tim Taminiau", "role": "last author, email contact", "info": ["NV electron + 7 single ¹³C + 6 ¹³C pairs mapped (up to 19 nuclear spins)", "NV electron spin", "CVD natural-abundance (1.1% ¹³C) diamond, 3.7 K, solid-immersion lens, on-chip stripline", "tailored dynamical decoupling in a dense ¹³C bath", "electron coherence 1.58 s (1.46 s storage of arbitrary states)"]},
  {"key": "bradley", "platform": "nv-centre", "text": "Bradley et al., “A 10-qubit solid-state spin register with quantum memory up to one minute” (2019).", "arxiv": "1905.02094", "org": "QuTech, TU Delft", "lead": "Tim Taminiau", "role": "last author, email contact", "info": ["10 qubits", "NV electron + ¹⁴N + 8 ¹³C", "natural-abundance (1.1% ¹³C) CVD diamond, 3.7 K, solid-immersion lens", "all 45 pairs entangled, 7-qubit GHZ", "¹⁴N coherence 63(2) s (¹³C 4–25 s)"]},
  {"key": "bartling", "platform": "nv-centre", "text": "Bartling et al., “Universal high-fidelity quantum gates for spin-qubits in diamond” (2024). The 99.93% two-qubit gate is electron–¹⁴N.", "arxiv": "2403.10633", "org": "QuTech, TU Delft", "lead": "Tim Taminiau", "role": "last author, email contact", "info": ["2 qubits", "NV electron + ¹⁴N nuclear spin", "isotopically purified (0.01% ¹³C) diamond, 4 K, solid-immersion lens, gate set tomography", "nitrogen memory >100 s via SWAP", "1q up to 99.999(1)% (¹⁴N RF gates, electron in an eigenstate; ~99.94% in the full space); 2q 99.93(5)%"]},
  {"key": "xie", "platform": "nv-centre", "text": "Xie et al., “99.92%-Fidelity CNOT Gates in Solids by Filtering Time-dependent and Quantum Noises” (2022).", "arxiv": "2212.02831", "org": "USTC", "lead": "Fazhan Shi and Jiangfeng Du", "role": "email contacts; Du is last author", "info": ["2 qubits", "NV electron + ¹⁴N nuclear spin", "natural-abundance diamond (<5 ppb N), room temperature, optimised 1.5 µs shaped pulse", "pulse corrected against static, time-dependent and ¹³C-bath noise", "nuclear-controlled electron NOT (CNOT) 99.920(7)% (subspace interleaved RB)"]},
  {"key": "rong", "platform": "nv-centre", "text": "Rong et al., “Experimental fault-tolerant universal quantum gates with solid-state spins under ambient conditions” (2015).", "arxiv": "1506.08627", "org": "USTC", "lead": "Jiangfeng Du", "role": "last author, email contact", "info": ["2 qubits", "NV electron + ¹⁴N nuclear spin", "natural-abundance (1.1% ¹³C), <5 ppb N diamond, room temperature, composite pulses + optimal control", "universal gate set at ambient conditions", "1q 99.9952(6)% (RB); CNOT 99.20% (model-derived)"]},
  {"key": "yamamoto", "platform": "nv-centre", "text": "Yamamoto et al., “Ten-Second Electron-Spin Coherence in Isotopically Engineered Diamond” (2026). Preprint.", "arxiv": "2604.07439", "chip": "Samples “Fukuoka” and “Kagawa”", "org": "QuTech, TU Delft / QST / Tohoku / TNO", "lead": "Tim Taminiau", "role": "last author, email contact", "info": ["single NV", "isotopically engineered (111) diamond, ¹³C 0.0013–1.09% across layers", "4 K, 50 Hz mains-noise feedforward", "near-lifetime-limited optical linewidth 16.9 MHz", "electron T₂ 11.2(8) s (dynamical decoupling); Hahn echo 6.8 ms"]},
  {"key": "pompili", "platform": "nv-centre", "text": "Pompili et al., “Realization of a multi-node quantum network of remote solid-state qubits” (2021).", "arxiv": "2102.04471", "chip": "Alice, Bob and Charlie", "org": "QuTech, TU Delft", "lead": "Ronald Hanson", "role": "corresponding author", "info": ["3 nodes", "NV electron spins (middle node also has a ¹³C memory)", "4 K, solid-immersion lenses, on-chip microwaves, phase-stabilised fibre links", "GHZ across three nodes and entanglement swapping, no post-selection", "GHZ fidelity 0.538(18)"]},
  {"key": "naydenov", "platform": "nv-centre", "text": "Naydenov et al., “Dynamical decoupling of a single electron spin at room temperature” (2010).", "arxiv": "1008.1953", "org": "University of Stuttgart", "info": ["single NV", "NV electron spin", "room temperature, dynamical decoupling", "echo T₂ ~0.4 ms"]},
  {"key": "johnson", "platform": "nv-centre", "text": "Johnson et al., “Tunable cavity coupling of the zero phonon line of a nitrogen-vacancy defect in diamond” (2015).", "arxiv": "1506.05161", "info": ["single NV", "NV in diamond", "tunable open Fabry–Pérot cavity", "only ~4% of emission in the zero-phonon line; cavity gives ~10× enhancement"]},
  {"key": "stolk", "platform": "nv-centre", "text": "Stolk et al., “Metropolitan-scale heralded entanglement of solid-state qubits” (2024).", "arxiv": "2404.03723", "info": ["2 NV nodes ~10 km apart", "NV electron spins", "25 km of deployed fibre", "heralded entanglement at 0.48 Hz"]},
  {"key": "robledo", "platform": "nv-centre", "text": "Robledo et al., “High-fidelity projective readout of a solid-state spin quantum register” (2013).", "arxiv": "1301.0392", "info": ["single NV + nuclear register", "NV electron spin", "resonant excitation at 8.6 K", "single-shot readout fidelity 93.2%"]},
  {"key": "doherty", "platform": "nv-centre", "text": "Doherty et al., “The nitrogen-vacancy colour centre in diamond” (2013).", "arxiv": "1302.3288", "info": ["Review of the NV centre: structure, levels, optical and spin properties"]},
];

const NODE_ORDER = ['software', 'control', 'delivery', 'readout', 'env', 'chip', 'qubit', 'coupling'];

const $ = (s, r = document) => r.querySelector(s);
const nodes = Object.fromEntries(NODE_ORDER.map(k => [k, $(`[data-node="${k}"]`)]));

// Fill an element with a bullet list.
// ---------- citations: write [[key]] or [[key1,key2]] after a claim; keys are defined in REFS (grouped by platform, in order) ----------
const refNum = Object.fromEntries(REFS.map((r, i) => [r.key, i + 1]));
function cite(s) {
  return s.replace(/\s*\[\[([^\]]+)\]\]/g, (_, ks) => {
    const keys = ks.split(',').map(k => k.trim()).filter(k => refNum[k]);
    return keys.length ? '<sup class="cite">' + keys.map(k => `<a href="#ref-${k}" data-ref="${k}">${refNum[k]}</a>`).join(',') + '</sup>' : '';
  });
}
let refsView = 'device';
function renderRefs() {
  const body = $('#refs-body');
  const link = r => `<a href="https://arxiv.org/abs/${r.arxiv}" target="_blank" rel="noopener">arXiv:${r.arxiv}</a>`;
  let html = '';
  PLATFORMS.forEach(p => {
    const mine = REFS.filter(r => r.platform === p.id);
    if (!mine.length) return;
    html += `<h3>${p.name}</h3><ol start="${refNum[mine[0].key]}">` + mine.map(r => {
      if (refsView === 'full') return `<li id="ref-${r.key}">${r.text} ${link(r)}</li>`;
      const yr = (r.text.match(/\((\d{4})\)/g) || []).pop() || '';
      const head = [r.chip, r.org, r.lead].filter(Boolean).join(' · ') || `${r.text.split(',')[0]} ${yr}`;
      return `<li id="ref-${r.key}" class="dev"><b>${head}</b>` + (r.role ? ` <span class="who">(${r.role})</span>` : '') +
        (r.info && r.info.length ? `<span class="det">${r.info.join(' | ')}</span>` : '') +
        `<span class="det">${link(r)}</span></li>`;
    }).join('') + '</ol>';
  });
  body.innerHTML = html;
  document.querySelectorAll('#refs-view button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === refsView)));
}
$('#refs-view').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  refsView = b.dataset.view;
  renderRefs();
});
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-ref]');
  if (!a) return;
  e.preventDefault();
  $('#refs').open = true;
  const li = $('#ref-' + a.dataset.ref);
  li.scrollIntoView({ behavior: 'smooth', block: 'center' });
  li.classList.add('hit'); setTimeout(() => li.classList.remove('hit'), 1800);
});

// Hover card: device name, then qubit count | qubit type.
const tip = document.createElement('div');
tip.className = 'cite-tip'; tip.hidden = true;
document.body.appendChild(tip);
function showTip(a) {
  const r = REFS.find(x => x.key === a.dataset.ref);
  if (!r) return;
  const yr = (r.text.match(/\((\d{4})\)/g) || []).pop() || '';
  const head = [r.chip, r.org].filter(Boolean).join(' · ') || `${r.text.split(',')[0]} ${yr}`;
  const sub = (r.info || []).slice(0, 2).join(' | ');
  tip.replaceChildren();
  const b = document.createElement('b'); b.textContent = head; tip.appendChild(b);
  if (sub) { const s = document.createElement('span'); s.textContent = sub; tip.appendChild(s); }
  tip.hidden = false;
  const q = a.getBoundingClientRect(), t = tip.getBoundingClientRect();
  tip.style.left = Math.max(8, Math.min(q.left, innerWidth - t.width - 8)) + 'px';
  tip.style.top = (q.top - t.height - 6 < 8 ? q.bottom + 6 : q.top - t.height - 6) + 'px';
}
document.addEventListener('mouseover', e => { const a = e.target.closest('a[data-ref]'); if (a) showTip(a); });
document.addEventListener('mouseout', e => { if (e.target.closest('a[data-ref]')) tip.hidden = true; });
document.addEventListener('focusin', e => { const a = e.target.closest('a[data-ref]'); if (a) showTip(a); });
document.addEventListener('focusout', () => { tip.hidden = true; });

function bullets(el, items) {
  el.replaceChildren(...items.map(t => { const li = document.createElement('li'); li.innerHTML = cite(t); return li; }));
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
  const sc = SCHEMATICS[id], row = $('#schems');
  row.hidden = !sc;
  $('#schems-body').innerHTML = sc ? sc.map(f => `<figure class="panel schem">${f.svg}<figcaption>${f.caption}</figcaption></figure>`).join('') : '';
  typeset($('#schems-body'));
  $('#g-name').textContent = p.name;
  bullets($('#g-blurb'), p.blurb);
  $('#g-players').innerHTML = cite('Examples: ' + p.players);
  $('#g-temp').innerHTML = cite(p.temp);
  $('#g-conn').innerHTML = cite(p.conn);
  ['typical', 'sota'].forEach(col => {
    ['gate', 'fid', 'qubits', 'life'].forEach(row => {
      const cell = $(`#pf-${col}-${row}`);
      // Gate time and fidelity are "1-qubit / 2-qubit" pairs: one per line.
      const lines = (row === 'gate' || row === 'fid') ? p.perf[col][row].split(' / ') : [p.perf[col][row]];
      cell.replaceChildren(...lines.map(t => { const d = document.createElement('div'); d.innerHTML = cite(t); return d; }));
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
// On phones the details and drawings are collapsible (drawings start closed); elsewhere they are always open.
const phone = matchMedia('(max-width: 820px)');
const syncFolds = () => { $('#side').open = true; $('#schems').open = !phone.matches; };
syncFolds();
phone.addEventListener('change', syncFolds);

renderRefs();
const fromHash = location.hash.slice(1);
select(PLATFORMS.some(p => p.id === fromHash) ? fromHash : PLATFORMS[0].id, { updateHash: false });
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (h !== current && PLATFORMS.some(p => p.id === h)) select(h, { updateHash: false });
});
