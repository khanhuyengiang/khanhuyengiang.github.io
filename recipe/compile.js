// Compile: find an ingredient order that keeps every step's ingredients (and every group) in one unbroken run.
// Pure functions on 0-based ingredient indices, so recipe.js stays about the page.
//
// An order is scored lexicographically by
//   1. group splits   (a group in two pieces counts 1)
//   2. step splits    (same, for each action of each step)
//   3. reading order  (inversions of "first step that uses it", so early ingredients sit high)
//   4. disruption     (inversions of the original order, so ties keep the user's order)
// Up to EXACT_LIMIT ingredients every order is tried; beyond that a seeded local search runs within a time budget.

const EXACT_LIMIT = 8;

function makeScorer(count, actions, sections, firstUse) {
  const sets = [...sections, ...actions].filter(s => s.length > 1); // singletons can't split
  const isSection = sets.map((_, k) => k < sections.filter(s => s.length > 1).length);
  const m = sets.length;
  const member = new Uint8Array(count * m);
  const memberOf = Array.from({ length: count }, () => []);
  sets.forEach((s, k) => s.forEach(i => { member[i * m + k] = 1; memberOf[i].push(k); }));
  const secSets = isSection.filter(Boolean).length;
  const K = count * count + 1; // bigger than any inversion count, so the weighted sum compares like a tuple

  function parts(order) {
    let sec = 0, act = 0;
    for (let p = 0; p < count; p++) {
      const x = order[p], prev = p ? order[p - 1] : -1;
      for (const k of memberOf[x]) {
        if (prev < 0 || !member[prev * m + k]) isSection[k] ? sec++ : act++;
      }
    }
    let early = 0, moved = 0;
    for (let p = 0; p < count; p++) {
      for (let q = p + 1; q < count; q++) {
        if (firstUse[order[p]] > firstUse[order[q]]) early++;
        if (order[p] > order[q]) moved++;
      }
    }
    return { sectionSplits: sec - secSets, stepSplits: act - (m - secSets), early, moved };
  }

  const score = order => {
    const s = parts(order);
    return ((s.sectionSplits * K + s.stepSplits) * K + s.early) * K + s.moved;
  };
  return { score, parts };
}

// small seeded PRNG (mulberry32) so compiling the same recipe twice gives the same answer
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function exactOrder(count, score) {
  const order = [...Array(count).keys()];
  let best = order.slice(), bestScore = score(order);
  // Heap's algorithm visits every permutation
  const c = new Array(count).fill(0);
  for (let i = 1; i < count;) {
    if (c[i] < i) {
      const j = i % 2 ? c[i] : 0;
      [order[j], order[i]] = [order[i], order[j]];
      const s = score(order);
      if (s < bestScore) { bestScore = s; best = order.slice(); }
      c[i]++; i = 1;
    } else { c[i] = 0; i++; }
  }
  return best;
}

// First-improvement local search: cut a block, optionally flip it, and reinsert it anywhere.
function polish(start, score, deadline) {
  let order = start.slice(), best = score(order);
  const n = order.length;
  let improved = true;
  while (improved && performance.now() < deadline) {
    improved = false;
    search:
    for (let len = 1; len < n; len++) {
      for (let i = 0; i + len <= n; i++) {
        const block = order.slice(i, i + len), flipped = block.slice().reverse();
        const rest = order.slice(0, i).concat(order.slice(i + len));
        for (let k = 0; k <= rest.length; k++) {
          for (const b of k === i ? [flipped] : [block, flipped]) {
            const cand = rest.slice(0, k).concat(b, rest.slice(k));
            const s = score(cand);
            if (s < best) { best = s; order = cand; improved = true; break search; }
          }
        }
        if (performance.now() > deadline) break search;
      }
    }
  }
  return { order, best };
}

function searchOrder(count, actions, sections, firstUse, score, budgetMs) {
  const deadline = performance.now() + budgetMs;
  const identity = [...Array(count).keys()];
  // starting points: as typed; by first use; by membership pattern, which already clumps ingredients that travel together
  const sets = [...sections, ...actions];
  const pattern = i => sets.map(s => (s.includes(i) ? "1" : "0")).join("");
  const starts = [
    identity,
    identity.slice().sort((a, b) => firstUse[a] - firstUse[b] || a - b),
    identity.slice().sort((a, b) => (pattern(a) < pattern(b) ? 1 : pattern(a) > pattern(b) ? -1 : a - b)),
  ];
  let best = null;
  const rand = seeded(count * 7919 + sets.length);
  for (let round = 0; round < starts.length || performance.now() < deadline; round++) {
    let start = starts[round];
    if (!start) {
      if (best && best.best < (count * count + 1) ** 2) break; // nothing split any more, so restarts can't help much
      start = identity.slice();
      for (let i = count - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [start[i], start[j]] = [start[j], start[i]]; }
    }
    const result = polish(start, score, Math.max(deadline, performance.now() + 50));
    if (!best || result.best < best.best) best = result;
  }
  return best.order;
}

// actions, sections: arrays of ingredient-index arrays. firstUse[i]: first step that uses ingredient i.
function bestOrder(count, actions, sections, firstUse, budgetMs = 300) {
  const { score, parts } = makeScorer(count, actions, sections, firstUse);
  const identity = [...Array(count).keys()];
  const order = count <= 1 ? identity
    : count <= EXACT_LIMIT ? exactOrder(count, score)
    : searchOrder(count, actions, sections, firstUse, score, budgetMs);
  return { order, before: parts(identity), after: parts(order) };
}
