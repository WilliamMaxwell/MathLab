(function (root) {
  'use strict';
  const C = typeof module === 'object' ? require('./facts-content.js') : root.FactsContent;
  const E = typeof module === 'object' ? require('./engine.js') : root.MathEngine;
  const emptyEvidence = () => ({ independentAttempts: 0, independentCorrect: 0, supportedAttempts: 0, supportedCorrect: 0, retryAttempts: 0, retryCorrect: 0, flashReviews: 0, flashReady: 0, flashAgain: 0, quizMissed: false, flashNeedsReview: false });
  const fresh = () => ({ version: 1, settings: { tables: [...C.factors], scope: 'all', size: 10, mode: 'quiz' }, evidence: {}, totals: { quizRounds: 0, flashDecks: 0, retryRounds: 0 }, round: null });
  const clone = state => JSON.parse(JSON.stringify(state));
  const needsReview = evidence => Boolean(evidence && (evidence.quizMissed || evidence.flashNeedsReview));
  function pool(settings, evidence = {}) {
    return C.facts.filter(f => settings.tables.includes(f.a) && (settings.scope !== 'review' || needsReview(evidence[f.id])));
  }
  function start(state, mode, ids) {
    if (!['quiz', 'flash'].includes(mode)) throw new Error('Choose quiz or flashcards.');
    const next = clone(state), candidates = ids ? ids.map(id => C.byId[id]).filter(Boolean) : pool(state.settings, state.evidence);
    const unique = [...new Map(candidates.map(f => [f.id, f])).values()];
    if (!unique.length) return next;
    const chosen = E.shuffle(unique).slice(0, ids || state.settings.size === 'all' ? unique.length : Number(state.settings.size));
    next.round = { mode, retry: Boolean(ids), index: 0, finished: false, cards: chosen.map(f => ({ id: f.id, answer: '', checked: false, correct: null, supported: false, revealed: false, rating: null })) };
    return next;
  }
  function help(state) {
    const next = clone(state), r = next.round, card = r?.cards[r.index];
    if (r?.mode === 'quiz' && card && !card.checked) card.supported = true;
    return next;
  }
  function check(state, answer) {
    const r = state.round, card = r?.cards[r.index], n = E.value(answer);
    if (!r || r.mode !== 'quiz' || !card || card.checked || r.finished) return { state, valid: true, changed: false };
    if (!Number.isFinite(n) || !Number.isInteger(n) || Math.abs(n) > 1000000) return { state, valid: false, changed: false };
    const next = clone(state), c = next.round.cards[r.index];
    c.answer = String(answer).slice(0, 120); c.correct = E.equivalent(answer, C.byId[c.id].product); c.checked = true;
    let evidence = next.evidence[c.id] || emptyEvidence();
    evidence = E.record(evidence, c.correct, c.supported, r.retry);
    evidence.quizMissed = !c.correct; next.evidence[c.id] = evidence;
    return { state: next, valid: true, changed: true };
  }
  function advance(state) {
    const next = clone(state), r = next.round, c = r?.cards[r.index];
    if (!r || r.finished || !c || (r.mode === 'quiz' ? !c.checked : !c.rating)) return next;
    r.index++;
    if (r.index === r.cards.length) {
      r.finished = true;
      next.totals[r.retry ? 'retryRounds' : r.mode === 'quiz' ? 'quizRounds' : 'flashDecks']++;
    }
    return next;
  }
  function reveal(state) {
    const next = clone(state), r = next.round, c = r?.cards[r.index];
    if (r?.mode === 'flash' && c && !r.finished) c.revealed = true;
    return next;
  }
  function rate(state, rating) {
    const r = state.round, c = r?.cards[r.index];
    if (r?.mode !== 'flash' || !c || !c.revealed || c.rating || !['ready', 'again'].includes(rating)) return state;
    const next = clone(state), card = next.round.cards[r.index], evidence = next.evidence[c.id] || emptyEvidence();
    card.rating = rating;
    evidence.flashReviews++;
    evidence[rating === 'ready' ? 'flashReady' : 'flashAgain']++;
    evidence.flashNeedsReview = rating === 'again'; next.evidence[c.id] = evidence;
    return advance(next);
  }
  function retryIds(round) { return round.cards.filter(c => round.mode === 'quiz' ? c.checked && !c.correct : c.rating === 'again').map(c => c.id); }
  function feedback(f, answer) {
    const n = E.value(answer);
    if (E.equivalent(answer, f.product)) return 'That fits. You found the product.';
    if (n === f.a + f.b) return `You added the two factors. Multiplication asks for ${f.a} equal groups of ${f.b}, rather than ${f.a} + ${f.b}.`;
    if (f.b > 0 && (n === (f.a - 1) * f.b || n === (f.a + 1) * f.b)) return `Your answer counts ${n < f.product ? 'one fewer group' : 'one extra group'} of ${f.b}. Use exactly ${f.a} groups.`;
    return `Picture ${f.a} equal groups with ${f.b} in each. The total is ${f.product}. Use this strategy to check the groups.`;
  }
  function restore(raw) {
    const fallback = fresh();
    try {
      if (!raw || raw.version !== 1 || !raw.settings || !Array.isArray(raw.settings.tables) || raw.settings.tables.some(n => !C.factors.includes(n)) || new Set(raw.settings.tables).size !== raw.settings.tables.length || !['all', 'review'].includes(raw.settings.scope) || ![10, 20, 'all'].includes(raw.settings.size) || !['quiz', 'flash'].includes(raw.settings.mode)) return fallback;
      if (!raw.evidence || typeof raw.evidence !== 'object' || Array.isArray(raw.evidence)) return fallback;
      for (const [id, ev] of Object.entries(raw.evidence)) {
        if (!C.byId[id] || !ev || Object.entries(emptyEvidence()).some(([k, v]) => typeof v === 'boolean' ? typeof ev[k] !== 'boolean' : !Number.isSafeInteger(ev[k]) || ev[k] < 0)) return fallback;
        if (ev.independentCorrect > ev.independentAttempts || ev.supportedCorrect > ev.supportedAttempts || ev.retryCorrect > ev.retryAttempts || ev.flashReviews !== ev.flashReady + ev.flashAgain) return fallback;
      }
      if (!raw.totals || Object.keys(fallback.totals).some(k => !Number.isSafeInteger(raw.totals[k]) || raw.totals[k] < 0)) return fallback;
      const r = raw.round;
      if (r) {
        if (!['quiz', 'flash'].includes(r.mode) || typeof r.retry !== 'boolean' || typeof r.finished !== 'boolean' || !Array.isArray(r.cards) || r.cards.length < 1 || r.cards.length > 169 || new Set(r.cards.map(c => c?.id)).size !== r.cards.length || !Number.isInteger(r.index) || r.index < 0 || r.index > r.cards.length || r.finished !== (r.index === r.cards.length)) return fallback;
        if (r.cards.some(c => !c || !C.byId[c.id] || typeof c.answer !== 'string' || c.answer.length > 120 || typeof c.checked !== 'boolean' || typeof c.supported !== 'boolean' || typeof c.revealed !== 'boolean' || ![null, true, false].includes(c.correct) || ![null, 'ready', 'again'].includes(c.rating))) return fallback;
        if (r.cards.some((c, i) => (i < r.index && (r.mode === 'quiz' ? !c.checked : !c.rating)) || (c.checked && c.correct !== E.equivalent(c.answer, C.byId[c.id].product)) || (c.rating && !c.revealed))) return fallback;
      }
      return clone(raw);
    } catch { return fallback; }
  }
  const api = { fresh, emptyEvidence, pool, start, help, check, advance, reveal, rate, retryIds, feedback, restore, needsReview };
  if (typeof module === 'object') module.exports = api;
  root.FactsEngine = api;
})(typeof window === 'object' ? window : globalThis);
