const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const original=require('../content.js').lessons,added=require('../grade-content.js'),G=require('../grades.js'),E=require('../engine.js'),all=[...original,...added];
test('each grade has real, distinct featured content and foundation review is separate',()=>{
  assert.deepEqual(G.grades.map(g=>g.grade),[3,4,5,6,7,8]);
  assert.equal(new Set(all.map(l=>l.id)).size,10);
  for(const grade of G.grades){
    const visible=G.visibleLessons(grade.grade,all);
    assert.ok(visible.length>0);
    assert.ok(!grade.featured.includes('relationships'));
    assert.equal(new Set([...grade.featured,...grade.review]).size,grade.featured.length+grade.review.length);
    for(const id of [...grade.featured,...grade.review])assert.ok(all.some(l=>l.id===id),id);
    for(const l of visible)if(grade.grade>3)assert.equal(l.gradeLevel,grade.grade);
  }
  for(const invalid of [0,2,9,null,'5',NaN,{},4.5])assert.equal(G.valid(invalid),false);
  assert.deepEqual(G.visibleLessons(99,all),[]);
});
test('all new quantitative answers are independently correct, including rational and signed quantities',()=>{
  const expected={r4a:4*18,r4b:84/6,r4d:24,r4f:96/8,r5a:6*(14-5),r5b:48/(2+4)+7,r5d:6*7-3*7,r5e:100-4*(6+9),r6a:3*7+4,r6b:8.5-2.75,r6c:30/4,r6d:2-3/4,r6f:3*4,r7a:(43-7)/4,r7b:27/3+2,r7c:(17-5)/-2,r7d:(8-3)/.5,r7e:(68-12)/4,r8a:4*6+7,r8b:(11-5)/(2-0),r8c:6*0+15,r8e:-2*5+9,r8f:(8-2)/(5-3)};
  let count=0;
  for(const l of added){assert.equal(l.questions.length,6);for(const q of l.questions){assert.ok(q.hint.length>15&&q.explain.length>25);if(q.type==='number'){count++;assert.equal(E.value(q.answer),expected[q.id],q.id);assert.ok(E.grade(q,String(expected[q.id])));assert.ok(!E.grade(q,String(expected[q.id]+1)));}else{assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(o=>o===q.answer).length,1);}}}
  assert.equal(count,Object.keys(expected).length);
  assert.ok(E.grade(added[2].questions[3],'5/4'));
  assert.ok(E.grade(added[3].questions[2],'-6'));
});
test('grade-specific print documents contain only that grade’s featured lessons and separate keys',()=>{
  const source=fs.readFileSync(require.resolve('../print.js'),'utf8');
  for(const grade of [3,4,5,6,7,8])for(const type of ['worksheet','key']){
    const elements={'#print-button':{},'#pages':{}},document={title:'',querySelector:s=>elements[s]};
    vm.runInNewContext(source,{MathContent:{lessons:all},MathGrades:G,URLSearchParams,location:{search:`?type=${type}&grade=${grade}`},document,window:{print(){}}});
    const html=elements['#pages'].innerHTML;
    assert.equal((html.match(/<article>/g)||[]).length,G.get(grade).featured.length);
    assert.ok(!html.includes('Parts & wholes'));
    if(grade>3)for(const l of added.filter(l=>l.gradeLevel!==grade))assert.ok(!html.includes(`<h2>${l.title}</h2>`));
    if(type==='worksheet')assert.ok(!html.includes('Review reasoning:'));
  }
});
