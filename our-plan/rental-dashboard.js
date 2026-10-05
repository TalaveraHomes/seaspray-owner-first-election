(()=>{
'use strict';
const $=id=>document.getElementById(id),qa=s=>[...document.querySelectorAll(s)];
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const calendar=[31,28,31,30,31,30,31,31,30];
const nights=[13,14,18,15,18,23,24,24,20],gross=[1600,1800,2850,2300,3450,5500,6100,5600,3800],bookings=[2,2,3,3,4,5,5,5,4],fees=[185,185,277,277,370,462,462,462,370],ownerUse=[5,4,2,2,2,0,0,1,2],closed=[0,0,2,0,0,0,0,1,2];
const channelPattern=['website','website','website','phone','phone','vrbo','vrbo','airbnb','booking','person'];
const units=Array.from({length:48},(_,u)=>{
 const bedrooms=u<24?2:1,side=u%24<12?'north':'south';
 const records=calendar.map((days,m)=>{
  const factor=u===0?1:1.03+((u%7)-3)*.035+Math.sin((u+m)*.8)*.05;
  const own=u===0?ownerUse[m]:Math.max(0,Math.round(ownerUse[m]*(.75+(u%5)*.12)));
  const maintenance=u===0?closed[m]:(u+m)%17===0?2:0;
  const available=days-own-maintenance;
  const paid=u===0?nights[m]:Math.min(available,Math.max(0,Math.round(nights[m]*factor)));
  const count=u===0?bookings[m]:Math.max(1,Math.round(bookings[m]*factor));
  const rate=gross[m]/nights[m]*(u===0?1:(bedrooms===1?.77:.99)*(side==='north'?1.025:.975)*(1+((u%5)-2)*.025));
  const revenue=u===0?gross[m]:Math.round(paid*rate);
  const extra=u===0?fees[m]:Math.round(count*85);
  const rows=[];let remainingGross=revenue,remainingFees=extra;
  for(let b=0;b<count;b++){
   const n=Math.floor(paid/count)+(b<paid%count?1:0);
   const g=b===count-1?remainingGross:Math.round(revenue*n/paid*100)/100;
   const f=b===count-1?remainingFees:Math.round(extra/count*100)/100;
   remainingGross=Math.round((remainingGross-g)*100)/100;remainingFees=Math.round((remainingFees-f)*100)/100;
   rows.push({nights:n,revenue:g,expenses:g*.25+f,type:(u+m+b)%5===0?'referral':'program',source:channelPattern[(u*2+m+b*3)%10]});
  }
  return {days,available,owner:own,rows};
 });return {id:(bedrooms===2?'2BR-':'1BR-')+String(bedrooms===2?u+1:u-23).padStart(2,'0'),bedrooms,side,records};
});
const groups={unit:{label:'Your unit',color:'#bd413b',match:(u,i)=>i===0},program:{label:'Rental program total',color:'#b66a12',match:()=>true,total:true},all:{label:'Average: all rental units',color:'#174e85',match:()=>true},br2:{label:'Average: 2 bedrooms',color:'#77519c',match:u=>u.bedrooms===2},br1:{label:'Average: 1 bedroom',color:'#08747a',match:u=>u.bedrooms===1},n2:{label:'North: 2 bedrooms',color:'#277646',match:u=>u.bedrooms===2&&u.side==='north'},s2:{label:'South: 2 bedrooms',color:'#865d27',match:u=>u.bedrooms===2&&u.side==='south'},n1:{label:'North: 1 bedroom',color:'#436991',match:u=>u.bedrooms===1&&u.side==='north'},s1:{label:'South: 1 bedroom',color:'#8c486e',match:u=>u.bedrooms===1&&u.side==='south'}};
const metrics={revenue:{label:'Rental revenue',money:true,help:'Gross rent from selected bookings. Comparison lines are averages per unit.'},net:{label:'Revenue minus expenses',money:true,help:'Money remaining for owners after example commissions and booking-related charges. This is before private ownership costs.'},nights:{label:'Booked nights',help:'Paid guest nights from the selected booking types and sources.'},occupancy:{label:'Occupancy: calendar nights',percent:true,help:'Selected paid guest nights divided by all calendar nights.'},available:{label:'Occupancy: available nights',percent:true,help:'Selected paid guest nights divided by nights available to rent, excluding owner use and maintenance.'},owner:{label:'Owner-use nights',help:'Owner-use nights. Guest booking type and source filters do not change this measure.'}};
let metric='revenue',view='trends';
const sum=(a,f)=>a.reduce((t,v)=>t+f(v),0);
const dollars=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const format=(n,key=metric)=>metrics[key].money?dollars(n):metrics[key].percent?n.toFixed(1)+'%':Number.isInteger(n)?String(n):n.toFixed(1);
function selection(selector){return qa(selector).filter(e=>e.checked).map(e=>e.value)}
function values(id,types,sources){
 const group=groups[id],selected=units.filter(group.match);
 return calendar.map((_,m)=>{
  const rows=selected.flatMap(u=>u.records[m].rows.filter(r=>types.includes(r.type)&&sources.includes(r.source)));
  const n=sum(rows,r=>r.nights),rev=sum(rows,r=>r.revenue),expense=sum(rows,r=>r.expenses);
  if(metric==='occupancy')return n/sum(selected,u=>u.records[m].days)*100;
  if(metric==='available')return n/sum(selected,u=>u.records[m].available)*100;
  const total=metric==='owner'?sum(selected,u=>u.records[m].owner):metric==='nights'?n:metric==='net'?rev-expense:rev;
  return group.total?total:total/selected.length;
 });
}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function unitValue(unit,types,sources,period){
 const records=period==='ytd'?unit.records:[unit.records[Number(period)]];
 const rows=records.flatMap(m=>m.rows.filter(r=>types.includes(r.type)&&sources.includes(r.source)));
 const paid=sum(rows,r=>r.nights);
 if(metric==='occupancy')return paid/sum(records,m=>m.days)*100;
 if(metric==='available')return paid/sum(records,m=>m.available)*100;
 if(metric==='owner')return sum(records,m=>m.owner);
 if(metric==='nights')return paid;
 return sum(rows,r=>metric==='net'?r.revenue-r.expenses:r.revenue);
}
function rankRows(types,sources){
 const period=$('rental-rank-period').value,group=groups[$('rental-rank-group').value];
 const rows=units.filter(group.match).map(u=>{const raw=unitValue(u,types,sources,period);return {unit:u,value:metrics[metric].percent?Number(raw.toFixed(1)):Math.round(raw)}}).sort((a,b)=>b.value-a.value||a.unit.id.localeCompare(b.unit.id));
 let rank=0,previous=null;rows.forEach((r,i)=>{if(previous===null||Math.abs(previous-r.value)>.0001)rank=i+1;r.rank=rank;previous=r.value});return rows;
}
function renderRanks(types,sources){
 const rows=rankRows(types,sources),max=Math.max(0,...rows.map(r=>r.value)),my=rows.find(r=>r.unit.id==='2BR-01');
 const period=$('rental-rank-period').value,time=period==='ytd'?'January–September':months[Number(period)];
 $('rental-rank-summary').textContent=my?`${time}: Your unit is ranked ${my.rank} of ${rows.length} for ${metrics[metric].label.toLowerCase()}, with ${format(my.value)}. ${metric==='owner'?'Guest filters do not change owner-use nights.':'Selected booking filters apply.'}`:`${time}: ${rows.length} units shown. Your two-bedroom unit is outside this comparison group.`;
 $('rental-rank-bars').innerHTML=rows.map(r=>`<li class="rank-row${r.unit.id==='2BR-01'?' your-rank':''}"><div class="rank-label"><span class="rank-position">${r.rank}</span><strong>${r.unit.id}${r.unit.id==='2BR-01'?' • Your unit':''}</strong><span>${r.unit.side==='north'?'North':'South'} • ${r.unit.bedrooms} bedroom${r.unit.bedrooms===2?'s':''}</span></div><div class="rank-result"><div class="rank-track" aria-hidden="true"><span style="width:${max?Math.max(0,r.value)/max*100:0}%"></span></div><strong>${escape(format(r.value))}</strong></div></li>`).join('');
}
function niceMax(value){if(value<=0)return 1;const step=10**Math.floor(Math.log10(value));return Math.ceil(value/step)*step;}
function axisValue(n){if(metrics[metric].percent)return Math.round(n)+'%';if(metrics[metric].money)return n>=1000?'$'+(n/1000).toFixed(n%1000?1:0)+'k':dollars(n);return n>=1000?(n/1000).toFixed(1)+'k':String(Math.round(n*10)/10)}
function chart(target,series){
 const box=$(target);
 if(!series.length){box.innerHTML='<p class="empty-chart">Select a comparison below to display a line.</p>';return;}
 const scale=Number($('text-size').value||100)/100;
 const width=Math.max(260,Math.round(box.clientWidth||800)),mobile=width<550,height=mobile?335+30*(scale-1):360+30*(scale-1);
 const left=(mobile?55:74)*scale,right=18,top=36*scale,bottom=(mobile?60:49)*scale,pw=width-left-right,ph=height-top-bottom;
 const max=metrics[metric].percent?100:niceMax(Math.max(...series.flatMap(s=>s.values))*1.1);
 const x=m=>left+pw*m/11,y=v=>top+ph-v/max*ph;
 const month=Number($('rental-month').value);
 let svg=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(metrics[metric].label)} by month. Exact values follow below." xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="white"/><text x="${left}" y="20" font-family="Arial" font-size="${14*scale}" fill="#455e6a">${metrics[metric].money?'USD':metrics[metric].percent?'Percent':'Nights'}</text>`;
 const missingStart=(x(8)+x(9))/2;
 svg+=`<rect x="${missingStart}" y="${top}" width="${left+pw-missingStart}" height="${ph}" fill="#f1f4f6"/>`;
 for(let t=0;t<=4;t++){const v=max*t/4,yy=y(v);svg+=`<line x1="${left}" x2="${left+pw}" y1="${yy}" y2="${yy}" stroke="#d5e1e6"/><text x="${left-9}" y="${yy+5}" text-anchor="end" font-family="Arial" font-size="${14*scale}" fill="#455e6a">${axisValue(v)}</text>`;}
 months.forEach((m,i)=>{svg+=`<text x="${x(i)}" y="${top+ph+24*scale+(mobile&&i%2?21*scale:0)}" text-anchor="middle" font-family="Arial" font-size="${(mobile?14:16)*scale}" fill="#455e6a">${m}</text>`});
 svg+=`<line x1="${x(month)}" x2="${x(month)}" y1="${top}" y2="${top+ph}" stroke="#718b97" stroke-dasharray="3 4"/>`;
 series.forEach((s,i)=>{
  const points=s.values.map((v,m)=>`${x(m)},${y(v)}`).join(' '),dash=i>2?' stroke-dasharray="7 3"':'';
  svg+=`<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="${s.id==='unit'?3.5:2.5}"${dash}/>`;
  s.values.forEach((v,m)=>{svg+=`<circle cx="${x(m)}" cy="${y(v)}" r="${m===month?5.5:3}" fill="${m===month?'white':s.color}" stroke="${s.color}" stroke-width="2"><title>${escape(s.label)}: ${months[m]} ${escape(format(v))}</title></circle>`});
 });
 svg+='</svg>';box.innerHTML=svg;
}
function ring(target,revenue,expenses,label){
 const remaining=revenue-expenses,fraction=expenses/revenue,c=2*Math.PI*82;
 $(target).innerHTML=`<svg viewBox="0 0 260 260" role="img" aria-label="${label}. Revenue ${dollars(revenue)}, expenses ${dollars(expenses)}, remaining ${dollars(remaining)}." xmlns="http://www.w3.org/2000/svg"><circle cx="130" cy="130" r="82" fill="none" stroke="#24744d" stroke-width="30"/><circle cx="130" cy="130" r="82" fill="none" stroke="#bc4945" stroke-width="30" stroke-dasharray="${fraction*c} ${c}" transform="rotate(-90 130 130)"/><text x="130" y="118" text-anchor="middle" font-family="Arial" font-size="17" fill="#455e6a">Revenue</text><text x="130" y="151" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="25" fill="#103f55">${dollars(revenue)}</text></svg>`;
 const prefix=target==='unit-financial-chart'?'unit':'program';
 $(prefix+'-financial-values').innerHTML=`<div><dt>Revenue</dt><dd>${dollars(revenue)}</dd></div><div><dt><span class="financial-dot" style="--dot:#bc4945" aria-hidden="true"></span>Expenses</dt><dd>${dollars(expenses)}</dd></div><div class="remainder"><dt><span class="financial-dot" style="--dot:#24744d" aria-hidden="true"></span>${prefix==='unit'?'Money remaining for you':'Operating surplus'}</dt><dd>${dollars(remaining)}</dd></div>`;
}
function render(){
 const types=selection('[data-booking-type]'),sources=selection('[data-booking-source]'),ids=selection('[data-comparison]');
 const series=ids.map(id=>({id,...groups[id],values:values(id,types,sources)}));
 $('rental-metric-help').textContent=metrics[metric].help;
 $('rental-trends-view').hidden=view!=='trends';$('rental-ranked-view').hidden=view!=='ranked';$('rental-line-comparisons').hidden=view!=='trends';
 renderRanks(types,sources);
 const main=series.filter(s=>s.id!=='program'),program=series.filter(s=>s.id==='program');
 chart('rental-trend-chart',main);
 $('rental-program-trend').hidden=!program.length;if(program.length)chart('rental-program-chart',program);
 const month=Number($('rental-month').value);
 $('rental-month-values').innerHTML=series.map(s=>`<div class="month-value" style="--series:${s.color}"><span>${months[month]} • ${escape(s.label)}</span><strong>${escape(format(s.values[month]))}</strong></div>`).join('')||'<p>Select at least one comparison.</p>';
 const head=series.map(s=>`<th scope="col">${escape(s.label)}</th>`).join('');
 const rows=calendar.map((_,m)=>'<tr><th scope="row">'+months[m]+'</th>'+series.map(s=>'<td>'+escape(format(s.values[m]))+'</td>').join('')+'</tr>').join('');
 $('rental-monthly-table').innerHTML=series.length?`<table><caption>${escape(metrics[metric].label)} • Selected filters • Illustrative data</caption><thead><tr><th scope="col">Month</th>${head}</tr></thead><tbody>${rows}</tbody></table>`:'<p>No comparison selected.</p>';
}
function syncAll(master,selector){const list=qa(selector),checked=list.filter(e=>e.checked).length;$(master).checked=checked===list.length;$(master).indeterminate=checked>0&&checked<list.length;}
qa('[data-rental-metric]').forEach(b=>b.addEventListener('click',()=>{metric=b.dataset.rentalMetric;qa('[data-rental-metric]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));render()}));
qa('[data-rental-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.rentalView;qa('[data-rental-view]').forEach(e=>e.setAttribute('aria-pressed',String(e===b)));render()}));
['rental-rank-group','rental-rank-period'].forEach(id=>$(id).addEventListener('change',render));
qa('[data-comparison]').forEach(e=>{e.closest('label').style.setProperty('--series',groups[e.value].color);e.addEventListener('change',render)});
[['all-booking-types','[data-booking-type]'],['all-booking-sources','[data-booking-source]']].forEach(([master,selector])=>{
 $(master).addEventListener('change',()=>{qa(selector).forEach(e=>e.checked=$(master).checked);$(master).indeterminate=false;render()});
 qa(selector).forEach(e=>e.addEventListener('change',()=>{syncAll(master,selector);render()}));
});
$('rental-month').addEventListener('change',render);
$('rental-reset').addEventListener('click',()=>{
 metric='revenue';view='trends';$('rental-rank-group').value='all';$('rental-rank-period').value='ytd';qa('[data-rental-view]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.rentalView===view)));qa('[data-rental-metric]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.rentalMetric===metric)));
 qa('[data-comparison]').forEach(e=>e.checked=['unit','all','br2'].includes(e.value));qa('[data-booking-type], [data-booking-source]').forEach(e=>e.checked=true);
 ['all-booking-types','all-booking-sources'].forEach(id=>{$(id).checked=true;$(id).indeterminate=false});$('rental-month').value='8';render();
});
const unitRows=units[0].records.flatMap(m=>m.rows),allRows=units.flatMap(u=>u.records.flatMap(m=>m.rows));
const unitRevenue=sum(unitRows,r=>r.revenue),unitExpenses=sum(unitRows,r=>r.expenses);
const programRevenue=sum(allRows,r=>r.revenue*.25+25),programExpenses=153000+allRows.length*22+sum(allRows,r=>r.revenue*.01)+20000;
ring('unit-financial-chart',unitRevenue,unitExpenses,'Your unit year to date');ring('program-financial-chart',programRevenue,programExpenses,'Rental program year to date');
render();
let frame;const resize=()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(render)};
if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(resize);observer.observe($('rental-report'))}else window.addEventListener('resize',resize);
$('text-size').addEventListener('change',resize);
})();
