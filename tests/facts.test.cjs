const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../facts-content.js'), F = require('../facts-engine.js'), E = require('../engine.js');
const roundFor = (mode, ids) => F.start(F.fresh(), mode, ids);
test('every ordered 0–12 fact appears exactly once and every worked equation is true', () => {
  assert.equal(C.facts.length, 169);
  assert.equal(new Set(C.facts.map(f => f.id)).size, 169);
  for (let a = 0; a <= 12; a++) for (let b = 0; b <= 12; b++) {
    const f = C.byId[`${a}x${b}`];
    assert.equal(f.product, a * b);
    assert.equal(C.byId[`${b}x${a}`].product, f.product);
    for (const side of f.equation.split('=')) assert.equal(E.value(side.trim()), f.product, f.equation);
    assert.ok(f.hint && f.title && f.relationship);
    if (!a || !b) { assert.ok(!f.equation.includes('÷')); assert.ok(f.relationship.includes('undefined')); }
  }
  assert.throws(() => C.fact(-1, 2), RangeError);
  assert.throws(() => C.fact(3, 13), RangeError);
});
test('table filters, round sizes, and revisit pool cover the complete bank without duplicates', () => {
  let s = F.fresh(); s.settings.size = 'all';
  s = F.start(s, 'quiz');
  assert.equal(s.round.cards.length, 169);
  assert.equal(new Set(s.round.cards.map(c => c.id)).size, 169);
  s.settings.tables = [7]; s.settings.size = 20;
  s = F.start(s, 'flash'); assert.equal(s.round.cards.length, 13);
  assert.ok(s.round.cards.every(c => C.byId[c.id].a === 7));
  s.settings.size = 10; s = F.start(s, 'quiz'); assert.equal(s.round.cards.length, 10);
  s.settings.tables = []; assert.equal(F.pool(s.settings).length, 0);
  s.settings.tables = [7]; s.settings.scope = 'review'; assert.equal(F.pool(s.settings).length, 0);
  s.evidence['7x8'] = { ...F.emptyEvidence(), quizMissed: true };
  assert.deepEqual(F.pool(s.settings, s.evidence).map(f => f.id), ['7x8']);
  s.settings.tables = [6]; assert.equal(F.pool(s.settings, s.evidence).length, 0);
});
test('blank, malformed, noninteger, or nonfinite answers do not count, while zero and equivalent answers do', () => {
  const s = roundFor('quiz', ['6x7']);
  for (const input of ['', ' ', 'hello', '1/0', '1.5', '6 ×', '6 = 7']) {
    const result = F.check(s, input); assert.equal(result.valid, false, input); assert.equal(result.state, s); assert.deepEqual(s.evidence, {});
  }
  const correct = F.check(s, '40 + 2'); assert.ok(correct.state.round.cards[0].correct);
  assert.equal(correct.state.evidence['6x7'].retryCorrect, 1);
  const zero = F.check(roundFor('quiz', ['0x12']), '0'); assert.ok(zero.state.round.cards[0].correct);
  assert.deepEqual(s.evidence, {});
});
test('duplicate quiz submits and repeated advance cannot inflate checks or completed rounds', () => {
  let s = roundFor('quiz', ['8x9']);
  assert.equal(F.advance(s).round.index, 0);
  s = F.check(s, '72').state;
  const duplicate = F.check(s, '72'); assert.equal(duplicate.changed, false); assert.equal(duplicate.state.evidence['8x9'].retryAttempts, 1);
  // Explicit-id rounds are retries, so first-check records are untouched.
  assert.equal(s.evidence['8x9'].independentAttempts, 0);
  s = F.advance(s); assert.equal(s.totals.retryRounds, 1);
  s = F.advance(s); assert.equal(s.totals.retryRounds, 1);
  assert.equal(F.check(s, '72').changed, false);
});
test('hints classify first checks as supported, and a retry never rewrites first-check evidence', () => {
  let s = F.fresh(); s.settings.tables = [6]; s.settings.size = 'all'; s = F.start(s, 'quiz');
  const id = s.round.cards[0].id, product = C.byId[id].product;
  s = F.help(s); s = F.check(s, String(product + 1)).state;
  assert.equal(s.evidence[id].supportedAttempts, 1); assert.equal(s.evidence[id].supportedCorrect, 0);
  assert.equal(s.evidence[id].independentAttempts, 0); assert.ok(s.evidence[id].quizMissed);
  const missed = F.retryIds(s.round); assert.deepEqual(missed, [id]);
  s = F.start(s, 'quiz', missed); s = F.check(s, String(product)).state;
  assert.equal(s.evidence[id].retryCorrect, 1); assert.equal(s.evidence[id].supportedAttempts, 1);
  assert.equal(s.evidence[id].supportedCorrect, 0); assert.equal(s.evidence[id].quizMissed, false);
});
test('revealing flashcards is not a check, and self-ratings never enter quiz totals', () => {
  let s = roundFor('flash', ['9x12']);
  assert.deepEqual(F.rate(s, 'ready'), s);
  s = F.reveal(s); assert.deepEqual(s.evidence, {});
  s = F.rate(s, 'again'); const evidence = s.evidence['9x12'];
  assert.equal(evidence.flashReviews, 1); assert.equal(evidence.flashAgain, 1);
  assert.equal(evidence.independentAttempts + evidence.supportedAttempts + evidence.retryAttempts, 0);
  assert.ok(F.needsReview(evidence)); assert.equal(s.round.finished, true);
  assert.equal(F.rate(s, 'again').evidence['9x12'].flashReviews, 1);
  assert.deepEqual(F.retryIds(s.round), ['9x12']);
});
test('familiar flashcard ratings do not erase missed quiz evidence', () => {
  let s = roundFor('quiz', ['7x8']); s = F.check(s, '54').state;
  s = F.start(s, 'flash', ['7x8']); s = F.reveal(s); s = F.rate(s, 'ready');
  assert.equal(s.evidence['7x8'].flashReady, 1); assert.equal(s.evidence['7x8'].quizMissed, true);
  assert.ok(F.needsReview(s.evidence['7x8']));
});
test('saved quizzes, hints, revealed flashcards, and finished decks survive validated restoration', () => {
  let quiz = roundFor('quiz', ['12x12']); quiz = F.help(quiz); quiz = F.check(quiz, '144').state;
  assert.deepEqual(F.restore(JSON.parse(JSON.stringify(quiz))), quiz);
  let flash = roundFor('flash', ['0x0']); flash = F.reveal(flash);
  assert.deepEqual(F.restore(JSON.parse(JSON.stringify(flash))), flash);
  flash = F.rate(flash, 'ready'); assert.deepEqual(F.restore(JSON.parse(JSON.stringify(flash))), flash);
  assert.deepEqual(F.restore(null), F.fresh());
  for (const mutate of [s => { s.settings.tables = [13]; }, s => { s.round.index = -1; }, s => { s.round.cards[0].id = 'invalid'; }, s => { s.round.finished = true; }, s => { s.evidence['12x12'].retryCorrect = 99; }]) {
    const raw = JSON.parse(JSON.stringify(quiz)); mutate(raw); assert.deepEqual(F.restore(raw), F.fresh());
  }
});
test('mistake feedback distinguishes addition, an extra group, and a valid strategy', () => {
  const f = C.fact(6, 7);
  assert.match(F.feedback(f, '13'), /added the two factors/);
  assert.match(F.feedback(f, '49'), /one extra group/);
  assert.match(F.feedback(f, '35'), /one fewer group/);
  assert.match(F.feedback(f, '40+2'), /found the product/);
});
test('a complete new all-facts quiz records 169 independent checks and completes exactly once', () => {
  let s = F.fresh(); s.settings.size = 'all'; s = F.start(s, 'quiz');
  while (!s.round.finished) {
    const id = s.round.cards[s.round.index].id;
    s = F.check(s, String(C.byId[id].product)).state;
    s = F.advance(s);
  }
  assert.equal(Object.keys(s.evidence).length, 169);
  assert.equal(Object.values(s.evidence).reduce((n, e) => n + e.independentCorrect, 0), 169);
  assert.equal(Object.values(s.evidence).reduce((n, e) => n + e.retryAttempts + e.supportedAttempts, 0), 0);
  assert.equal(s.totals.quizRounds, 1);
  assert.equal(F.advance(s).totals.quizRounds, 1);
});
