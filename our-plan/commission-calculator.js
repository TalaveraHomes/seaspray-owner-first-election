(()=>{
'use strict';
const get=id=>document.getElementById(id);
const solve=get('calc-solve');if(!solve)return;
const fields={gross:get('calc-gross'),rate:get('calc-rate'),commission:get('calc-commission')};
const share=get('calc-share'),referral=get('calc-referral'),result=get('calc-results'),cell=get('calc-commission-cell');
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const pct=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const baseline=696500;
function calculate({gross,rate,commission,share,referral,solve}){
 const s=share/100,f=referral/100;
 let effective=(1-s)*rate/100+s*f;
 if(solve==='commission')commission=gross*effective;
 if(solve==='gross'){
  if(effective===0&&commission>0)return {error:'A 0% combined commission rate cannot produce positive commission income.'};
  gross=effective>0?commission/effective:0;
 }
 if(solve==='rate'){
  if(gross===0&&commission>0)return {error:'Positive retained commission income requires rental income greater than $0.'};
  if(s===1){
   if(Math.abs(commission-gross*f)>.005)return {error:'At 100% owner referrals, the Seaspray-generated rate has no effect. Change rental income, the referral rate or the income target.'};
  }else if(gross>0){rate=(commission/gross-s*f)/(1-s)*100;}
  effective=(1-s)*rate/100+s*f;
 }
 if(![gross,rate,commission,effective].every(Number.isFinite)||gross<0||gross>1e9||commission<-.005||commission>1e9||rate<-.000001||rate>100.000001)return {error:'These figures require a rate outside 0%–100% or an invalid rental amount. Adjust the editable figures.'};
 rate=Math.max(0,Math.min(100,rate));
 return {gross,rate,commission:Math.max(0,commission),effective,referralRent:gross*s,referralIncome:gross*s*f,otherRent:gross*(1-s),otherIncome:gross*(1-s)*rate/100};
}
function fail(message){cell.classList.remove('above-budget','below-budget');fields[solve.value].value='';result.innerHTML='<p>'+message+'</p>';}
function render(){
 Object.entries(fields).forEach(([name,input])=>{input.readOnly=name===solve.value;input.setAttribute('aria-readonly',String(input.readOnly));get('calc-'+name+'-note').textContent=input.readOnly?'Calculated':'';get('calc-'+name+'-row').classList.toggle('calculated-row',input.readOnly);});
 const active=Object.entries(fields).filter(([name])=>name!==solve.value).map(([,input])=>input).concat([share,referral]);
 if(active.some(i=>i.value.trim()===''||!i.validity.valid||!Number.isFinite(i.valueAsNumber))){fail('Enter valid amounts in every editable cell. Dollars must be $0–$1 billion and percentages 0%–100%.');return;}
 const r=calculate({gross:Number(fields.gross.value),rate:Number(fields.rate.value),commission:Number(fields.commission.value),share:Number(share.value),referral:Number(referral.value),solve:solve.value});
 if(r.error){fail(r.error);return;}
 fields[solve.value].value=String(Number(r[solve.value].toFixed(solve.value==='rate'?6:2)));
 const delta=r.commission-baseline,level=Math.abs(delta)<.005?'equal':delta>0?'above':'below';
 cell.classList.toggle('above-budget',level==='above');cell.classList.toggle('below-budget',level==='below');
 const status=level==='equal'?'Matches the $696,500 retained-commission budget':money.format(Math.abs(delta))+' '+level+' the retained-commission budget';
 const growth=(r.gross/2500000-1)*100;
 const detail='Gross rental income is '+money.format(r.gross)+', '+(Math.abs(growth)<.00001?'the same as budget':pct.format(Math.abs(growth))+'% '+(growth>0?'above':'below')+' budget')+'.';
 result.innerHTML='<strong class="calc-status '+level+'">'+status+'</strong><p>'+detail+'</p><ul><li><strong>Owner referrals:</strong> '+pct.format(Number(share.value))+'% of total gross rent ('+money.format(r.referralRent)+') × '+pct.format(Number(referral.value))+'% retained commission = '+money.format(r.referralIncome)+'.</li><li><strong>Seaspray-generated bookings:</strong> '+pct.format(100-Number(share.value))+'% of total gross rent ('+money.format(r.otherRent)+') × '+pct.format(r.rate)+'% retained commission = '+money.format(r.otherIncome)+'.</li></ul><p>The combined retained commission rate is '+pct.format(r.effective*100)+'%.</p>';
}
Object.values(fields).concat([share,referral]).forEach(i=>{i.addEventListener('input',render);i.addEventListener('change',render);});solve.addEventListener('change',render);
get('calc-reset').addEventListener('click',()=>{solve.value='commission';fields.gross.value='2500000';fields.rate.value='28';fields.commission.value='687500';share.value='5';referral.value='18';render();});
render();
})();
