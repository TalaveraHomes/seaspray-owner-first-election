(()=>{
'use strict';
const size=document.getElementById('text-size');
try{const saved=localStorage.getItem('seaspray-plan-text-size');if(['100','115','130'].includes(saved)){size.value=saved;document.documentElement.style.fontSize=saved+'%';}}catch{}
size.addEventListener('change',()=>{document.documentElement.style.fontSize=size.value+'%';try{localStorage.setItem('seaspray-plan-text-size',size.value)}catch{}});
document.querySelectorAll('[data-open-topic]').forEach(a=>a.addEventListener('click',()=>{const d=document.getElementById(a.dataset.openTopic);if(d)d.open=true}));
function openHash(){const id=location.hash.slice(1);if(!id)return;const d=document.getElementById(id);if(d&&d.tagName==='DETAILS')d.open=true;}
openHash();window.addEventListener('hashchange',openHash);
const tabs=[...document.querySelectorAll('.report-tabs [role="tab"]')];
function selectTab(tab){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.setAttribute('tabindex',selected?'0':'-1');document.getElementById(t.getAttribute('aria-controls')).hidden=!selected});}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=tabs[(index+1)%tabs.length];if(e.key==='ArrowLeft')next=tabs[(index+tabs.length-1)%tabs.length];if(e.key==='Home')next=tabs[0];if(e.key==='End')next=tabs.at(-1);if(next){e.preventDefault();selectTab(next);next.focus()}})});
document.querySelectorAll('[data-open-report]').forEach(a=>a.addEventListener('click',()=>{const tab=document.getElementById(a.dataset.openReport);if(tab)selectTab(tab)}));
let printState=[];window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('details')].map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true)});window.addEventListener('afterprint',()=>printState.forEach(([d,open])=>d.open=open));
})();
