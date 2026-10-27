(function(root){
 'use strict';
 // Restricted numeric grammar: no eval, identifiers, implicit multiplication, or equations.
 function value(source){
  const s=String(source).replace(/×/g,'*').replace(/[÷]/g,'/').replace(/−/g,'-').replace(/\s/g,'');
  if(!s||s.length>120||/[^\d.+*/()\-]/.test(s))return NaN;
  let i=0;
  function atom(){if(s[i]==='+'||s[i]==='-'){const sign=s[i++];return (sign==='-'?-1:1)*atom();}if(s[i]==='('){i++;const n=sum();if(s[i++]!==')')throw Error();return n;}const m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error();i+=m[0].length;return Number(m[0]);}
  function product(){let n=atom();while(s[i]==='*'||s[i]==='/'){const op=s[i++],r=atom();n=op==='*'?n*r:n/r;}return n;}
  function sum(){let n=product();while(s[i]==='+'||s[i]==='-'){const op=s[i++],r=product();n=op==='+'?n+r:n-r;}return n;}
  try{const n=sum();return i===s.length&&Number.isFinite(n)?n:NaN;}catch{return NaN;}
 }
 function equivalent(a,b){const x=value(a),y=value(b);return Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-y)<=1e-9*Math.max(1,Math.abs(x),Math.abs(y));}
 function grade(q,answer){return q.type==='choice'?String(answer)===q.answer:equivalent(answer,q.answer);}
 function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function record(stats,correct,supported,retry){const next={...stats};if(retry){next.retryAttempts++;if(correct)next.retryCorrect++;}else{const key=supported?'supported':'independent';next[key+'Attempts']++;if(correct)next[key+'Correct']++;}return next;}
 const emptyStats=()=>({rounds:0,independentAttempts:0,independentCorrect:0,supportedAttempts:0,supportedCorrect:0,retryAttempts:0,retryCorrect:0});
 const api={value,equivalent,grade,shuffle,record,emptyStats};if(typeof module==='object')module.exports=api;root.MathEngine=api;
})(typeof window==='object'?window:globalThis);
