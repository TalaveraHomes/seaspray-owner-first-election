(()=>{
'use strict';
const get=id=>document.getElementById(id);
const solve=get('calc-solve');if(!solve)return;
const fields={gross:get('calc-gross'),rate:get('calc-rate'),commission:get('calc-commission')};
const share=get('calc-share'),referral=get('calc-referral'),result=get('calc-results'),cell=get('calc-commission-cell');
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const pct=new Intl.NumberFormat('en-US',{maximumFractionDigits:1});
function calculate({gross,rate,commission,share,referral,solve}){
 const separate=referral!==null;
 const s=separate?share/100:0;
 const fixed=separate?s*referral/100:0;
 let effective=rate/100*(1-s)+fixed;
 if(solve==='commission')commission=gross*effective;
 if(solve==='gross'){
  if(effective===0&&commission>0)return {error:'A 0% commission rate cannot produce positive commission income.'};
  gross=effective>0?commission/effective:0;
 }
 if(solve==='rate'){
  if(gross===0&&commission>0)return {error:'Positive commission income requires rental income greater than $0.'};
  if(s===1){
   if(Math.abs(commission-gross*fixed)>.005)return {error:'With 100% owner referrals, change the referral rate or rental income to reach your commission target. The non-referral rate has no effect.'};
  }else rate=gross>0?((commission/gross-fixed)/(1-s))*100:0;
  effective=rate/100*(1-s)+fixed;
 }
 if(![gross,rate,commission,effective].every(Number.isFinite)||gross>1e9||commission>1e9||rate<-.000001||rate>100.000001)return {error:'These inputs cannot be combined within a commission rate of 0%–100% and rental income of $0–$1 billion. Adjust one of the editable figures.'};
 rate=Math.max(0,Math.min(100,rate));
 return {gross,rate,commission,effective,separate};
}
function fail(message){cell.classList.remove('above-budget','below-budget');fields[solve.value].value='';result.innerHTML='<p>'+message+'</p>';}
function render(){
 Object.entries(fields).forEach(([name,input])=>{input.readOnly=name===solve.value;input.setAttribute('aria-readonly',String(input.readOnly));get('calc-'+name+'-note').textContent=input.readOnly?'Calculated':'';get('calc-'+name+'-row').classList.toggle('calculated-row',input.readOnly);});
 const active=Object.entries(fields).filter(([name])=>name!==solve.value).map(([,input])=>input);
 if(share.value!=='')active.push(share);
 if(referral.value!=='')active.push(referral);
 if(active.some(i=>i.value.trim()===''||!i.validity.valid||!Number.isFinite(i.valueAsNumber))){fail('Please enter valid amounts in the editable cells. Dollar amounts must be $0–$1 billion and percentages must be 0%–100%.');return;}
 const separate=referral.value!=='';
 get('calc-rate-label').textContent=separate?'Non-referral commission rate (%)':'Commission rate (%)';
 if(separate&&share.value===''){fail('Enter the owner-referral share to apply a separate referral commission rate.');return;}
 const r=calculate({gross:Number(fields.gross.value),rate:Number(fields.rate.value),commission:Number(fields.commission.value),share:share.value===''?null:Number(share.value),referral:separate?Number(referral.value):null,solve:solve.value});
 if(r.error){fail(r.error);return;}
 fields[solve.value].value=String(Number(r[solve.value].toFixed(solve.value==='rate'?6:2)));
 const delta=r.commission-700000,level=Math.abs(delta)<.005?'equal':delta>0?'above':'below';
 cell.classList.toggle('above-budget',level==='above');cell.classList.toggle('below-budget',level==='below');
 const incomeStatus=level==='equal'?'Matches the $700,000 commission budget':money.format(Math.abs(delta))+' '+level+' the commission budget';
 const growth=(r.gross/2500000-1)*100;
 let detail='Gross rental income is '+money.format(r.gross)+', '+(Math.abs(growth)<.00001?'the same as budget':pct.format(Math.abs(growth))+'% '+(growth>0?'above':'below')+' budget')+'.';
 if(r.separate)detail+=' The combined commission rate is '+pct.format(r.effective*100)+'%.';
 let split='';
 if(share.value!==''){
  split='<p>'+money.format(r.gross*Number(share.value)/100)+' in owner-referral rentals and '+money.format(r.gross*(1-Number(share.value)/100))+' in other rentals.</p>';
  if(!separate)split+='<p class="calc-referral-explanation">The referral share divides rental income between the two sources. It does not change the overall commission assumption unless you enter a separate referral rate above.</p>';
 }
 result.innerHTML='<strong class="calc-status '+level+'">'+incomeStatus+'</strong><p>'+detail+'</p>'+split;
}
Object.values(fields).concat([share,referral]).forEach(i=>i.addEventListener('input',render));solve.addEventListener('change',render);
get('calc-reset').addEventListener('click',()=>{solve.value='commission';fields.gross.value='2500000';fields.rate.value='28';fields.commission.value='700000';share.value='';referral.value='';render();});
render();
})();
