const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
const C = require('../facts-content.js');
const source = fs.readFileSync(require.resolve('../facts-print.js'), 'utf8');
function print(search) {
  const elements = { '#print-facts': {}, '#fact-print-pages': {} }, document = { title: '', querySelector: selector => elements[selector] };
  vm.runInNewContext(source, { FactsContent: C, URLSearchParams, location: { search }, document, window: { print() {} } });
  return { html: elements['#fact-print-pages'].innerHTML, title: document.title };
}
test('the full printed chart contains all 169 correct products', () => {
  const { html } = print('?type=chart');
  const cells = [...html.matchAll(/<td>(\d+)<\/td>/g)].map(m => Number(m[1]));
  assert.deepEqual(cells, C.facts.map(f => f.product));
  assert.equal((html.match(/scope="row"/g) || []).length, 13);
});
test('selected-table worksheets have 13 answer spaces per table and no worked answers', () => {
  const { html, title } = print('?type=worksheet&tables=6,12');
  assert.match(title, /worksheets/);
  assert.equal((html.match(/<article>/g) || []).length, 2);
  assert.equal((html.match(/class="problem"/g) || []).length, 26);
  assert.match(html, /6 × 12 = __________/);
  assert.match(html, /12 × 12 = __________/);
  assert.ok(!html.includes('<strong>144</strong>'));
  assert.ok(!html.includes('A worked strategy'));
});
test('separate keys contain the selected products and query parameters cannot inject HTML', () => {
  const { html } = print('?type=key&tables=0,12');
  assert.match(html, /12 × 12 = <strong>144<\/strong>/);
  assert.match(html, /0 × 12 = <strong>0<\/strong>/);
  assert.ok(!html.includes('class="problem"'));
  assert.match(print('?type=worksheet&tables=').html, /Choose at least one table/);
  assert.equal((print('?type=worksheet&tables=6,6,99,%3Cscript%3E').html.match(/<article>/g) || []).length, 1);
  assert.ok(!print('?type=%3Cscript%3E&tables=6').html.includes('<script>'));
});
