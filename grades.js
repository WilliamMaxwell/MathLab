(function(root){
  'use strict';
  const grades=[
    {grade:3,title:'Multiplication & division',description:'Equal groups, fact families, missing numbers, and multiplication strategies.',featured:['groups','missing','split','balance'],review:['relationships'],next:'Fractions and measurement',symbol:'6 × 8 = ?',factPractice:true},
    {grade:4,title:'Factors & comparisons',description:'Find factor pairs and multiples. Solve “times as many” situations.',featured:['grade4-factors'],review:['groups','missing','split'],next:'Fraction equivalence and multi-digit operations',symbol:'84 = 6 × ?',factPractice:false},
    {grade:5,title:'Expressions & patterns',description:'Work with grouping symbols, read expressions, and compare number rules.',featured:['grade5-expressions'],review:['split','balance','grade4-factors'],next:'Fraction operations and decimal calculations',symbol:'6 × (14 − 5)',factPractice:false},
    {grade:6,title:'Variables & equations',description:'Represent quantities with letters and solve one-step equations with fractions and decimals.',featured:['grade6-variables'],review:['grade5-expressions','balance'],next:'Ratios, signed numbers, and broader rational-number operations',symbol:'4x = 30',factPractice:false},
    {grade:7,title:'Two-step equations',description:'Reason through two-step equations, including signed numbers and real situations.',featured:['grade7-equations'],review:['grade6-variables','grade5-expressions'],next:'Proportions, rational-number operations, and inequalities',symbol:'3x + 5 = 26',factPractice:false},
    {grade:8,title:'Linear relationships',description:'Connect tables, rules, starting values, and rates of change.',featured:['grade8-linear'],review:['grade7-equations','grade6-variables'],next:'Graphs, systems of equations, and broader functions work',symbol:'y = 3x + 5',factPractice:false}
  ];
  const get=grade=>grades.find(g=>g.grade===Number(grade));
  const valid=grade=>Number.isInteger(grade)&&Boolean(get(grade));
  const visibleLessons=(grade,all)=>{const g=get(grade);return g?g.featured.map(id=>all.find(l=>l.id===id)).filter(Boolean):[];};
  const api={grades,get,valid,visibleLessons};
  if(typeof module==='object')module.exports=api;
  root.MathGrades=api;
})(typeof window==='object'?window:globalThis);
