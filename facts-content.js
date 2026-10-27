(function (root) {
  'use strict';
  const factors = Array.from({ length: 13 }, (_, i) => i);
  const strategies = {
    2: { title: 'Use a double', hint: b => `Double ${b}: add ${b} to itself.`, expression: b => `${b} + ${b}` },
    3: { title: 'Double, then add one group', hint: b => `Find two groups of ${b}, then add one more group of ${b}.`, expression: b => `(2 × ${b}) + ${b}` },
    4: { title: 'Double a double', hint: b => `Double ${b}, then double that amount again.`, expression: b => `2 × (2 × ${b})` },
    5: { title: 'Use half of ten groups', hint: b => `Ten groups of ${b} are easy to find. Five groups are half as many.`, expression: b => `(10 × ${b}) ÷ 2` },
    6: { title: 'Five groups and one more', hint: b => `Split six groups into five groups of ${b} and one more group of ${b}.`, expression: b => `(5 × ${b}) + ${b}` },
    7: { title: 'Five groups and two more', hint: b => `Split seven groups into five groups of ${b} and two groups of ${b}.`, expression: b => `(5 × ${b}) + (2 × ${b})` },
    8: { title: 'Double four groups', hint: b => `Find four groups of ${b}, then double that amount.`, expression: b => `2 × (4 × ${b})` },
    9: { title: 'Ten groups, less one', hint: b => `Start with ten groups of ${b}. Take away one group of ${b}.`, expression: b => `(10 × ${b}) − ${b}` },
    10: { title: 'Use place value', hint: b => `Think of ${b} tens. Ten equal groups have ten times the amount in one group.`, expression: b => `${b} × 10` },
    11: { title: 'Ten groups and one more', hint: b => `Split eleven groups into ten groups of ${b} and one group of ${b}.`, expression: b => `(10 × ${b}) + ${b}` },
    12: { title: 'Ten groups and two more', hint: b => `Split twelve groups into ten groups of ${b} and two groups of ${b}.`, expression: b => `(10 × ${b}) + (2 × ${b})` }
  };
  function fact(a, b) {
    if (!factors.includes(a) || !factors.includes(b)) throw new RangeError('Factors must be whole numbers from 0 through 12.');
    let title, hint, expression;
    if (a === 0 || b === 0) {
      title = 'Notice the zero factor';
      hint = a === 0 ? `There are zero groups of ${b}. How many objects are there?` : `There are ${a} groups, with zero objects in each. How many objects are there?`;
      expression = '0';
    } else if (a === 1 || b === 1) {
      title = 'One group, or groups of one';
      hint = a === 1 ? `One group of ${b} contains exactly ${b} objects.` : `${a} groups of one object contain exactly ${a} objects.`;
      expression = String(a * b);
    } else {
      const recipe = strategies[a];
      title = recipe.title; hint = recipe.hint(b); expression = recipe.expression(b);
    }
    return {
      id: `${a}x${b}`, a, b, product: a * b, title, hint,
      equation: `${a} × ${b} = ${expression} = ${a * b}`,
      relationship: a > 0 && b > 0
        ? `${a * b} ÷ ${a} = ${b} and ${a * b} ÷ ${b} = ${a}. Multiplication and division connect the same quantities.`
        : 'A zero factor makes the product zero. Division by zero is undefined, so do not turn this into a division-by-zero fact.'
    };
  }
  const facts = factors.flatMap(a => factors.map(b => fact(a, b)));
  const api = { factors, facts, strategies, fact, byId: Object.fromEntries(facts.map(f => [f.id, f])) };
  if (typeof module === 'object') module.exports = api;
  root.FactsContent = api;
})(typeof window === 'object' ? window : globalThis);
