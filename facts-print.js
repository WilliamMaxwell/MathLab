(() => {
  'use strict';
  const C = FactsContent, params = new URLSearchParams(location.search), type = ['chart', 'worksheet', 'key'].includes(params.get('type')) ? params.get('type') : 'chart';
  const requested = params.has('tables') ? params.get('tables').split(',').filter(s => /^\d+$/.test(s)).map(Number) : C.factors;
  const tables = C.factors.filter(n => requested.includes(n));
  const footer = '<footer>Math Lab · Independent learning resource. Not affiliated with Wilton Public Schools. Short practice does not establish mastery.</footer>';
  const titles = { chart: 'Multiplication chart', worksheet: 'Multiplication worksheets', key: 'Multiplication answer key' };
  document.title = `Math Lab · ${titles[type]}`;
  document.querySelector('#print-facts').onclick = () => window.print();
  let html;
  if (!tables.length) html = '<h1>Choose at least one table.</h1><p>Return to Multiplication studio and select the tables you want to print.</p>';
  else if (type === 'chart') html = `<article><p class="sub">MATH LAB · FACT REFERENCE</p><h1>Multiplication connections · 0–12</h1><p>Read a row and column to find a product. Turning a fact around keeps the same product.</p><div class="table-scroll"><table><caption>Selected times tables with partners 0 through 12</caption><thead><tr><th scope="col">×</th>${C.factors.map(n => `<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>${tables.map(a => `<tr><th scope="row">${a}</th>${C.factors.map(b => `<td>${C.fact(a, b).product}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="strategy"><strong>Use relationships when a fact feels unfamiliar.</strong><p>6 × 7 = (5 × 7) + 7 = 42</p><p>9 × 8 = (10 × 8) − 8 = 72</p><p>0 × 12 = 0. One zero factor means no objects altogether.</p></div><p class="sub">10–12 facts are an optional extension to one-digit fact practice.</p>${footer}</article>`;
  else html = tables.map(a => {
    const example = C.fact(a, 6);
    return `<article><p class="sub">MATH LAB · ${titles[type].toUpperCase()}</p><h1>The ${a} times table</h1>${type === 'worksheet' ? `<p class="sub">Name (optional): __________________________ Date: ______________</p><p>Find each product. No timer. Use a strategy when it helps.</p><div class="problems">${C.factors.map(b => `<div class="problem">${a} × ${b} = __________</div>`).join('')}</div><div class="model">Choose one fact. Draw equal groups, an array, or a way to split it.</div><p><strong>Explain:</strong> How could a fact you know help you find a fact you are still practicing?</p><p>__________________________________________________________________</p><p>__________________________________________________________________</p><p class="sub">Worksheet only. Answers are in the separate answer-key document.</p>` : `<p>Each product is also valid with the factors in the opposite order.</p><div class="key-list">${C.factors.map(b => `<p>${a} × ${b} = <strong>${C.fact(a, b).product}</strong></p>`).join('')}</div><div class="strategy"><strong>A worked strategy · ${example.title}</strong><p>${example.equation}</p><p>${example.relationship}</p></div><p>For explanations, accept accurate equal-group models, repeated addition, a related fact, or a valid decomposition. Ask students to explain what each quantity represents.</p><p class="sub">Keep this answer key separate from student worksheets.</p>`}${footer}</article>`;
  }).join('');
  document.querySelector('#fact-print-pages').innerHTML = html;
})();
