(()=>{
'use strict';
const get=id=>document.getElementById(id);
const solve=get('calc-solve');if(!solve)return;
const fields={gross:get('calc-gross'),rate:get('calc-rate'),commission:get('calc-commission')};
const share=get('calc-share'),referral=get('calc-referral'),result=get('calc-results'),cell=get('calc-commission-cell');
const savings=get('calc-savings');
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const pct=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const baseline=687500;
const perUnitMoney=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
const dollars=new Intl.NumberFormat('en-US',{maximumFractionDigits:2});
const isDollar=input=>input===fields.gross||input===fields.commission;
function readNumber(input){
 const raw=input.value.trim();
 if(raw==='')return NaN;
 if(isDollar(input)){
  const text=raw.replace(/\s/g,'');
  if(!/^\$?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?$/.test(text))return NaN;
  const value=Number(text.replace(/[$,]/g,''));return value<=1e9?value:NaN;
 }
 const value=Number(raw);return input.validity.valid&&Number.isFinite(value)&&value>=0&&value<=100?value:NaN;
}
function formatDollars(input){const value=readNumber(input);if(Number.isFinite(value))input.value=dollars.format(value);}
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
function fail(message){cell.classList.remove('above-budget','below-budget');fields[solve.value].value='';get('calc-savings-amount').textContent='—';get('calc-expense-target').textContent='—';result.innerHTML='<p>'+message+'</p>';}
function render(){
 Object.entries(fields).forEach(([name,input])=>{input.readOnly=name===solve.value;input.setAttribute('aria-readonly',String(input.readOnly));get('calc-'+name+'-note').textContent=input.readOnly?'Calculated':'';get('calc-'+name+'-row').classList.toggle('calculated-row',input.readOnly);});
 const active=Object.entries(fields).filter(([name])=>name!==solve.value).map(([,input])=>input).concat([share,referral,savings]);
 if(active.some(i=>!Number.isFinite(readNumber(i)))){fail('Enter valid amounts in every editable cell. Dollars may include commas and must be $0–$1 billion. Percentages must be 0%–100%.');return;}
 const r=calculate({gross:readNumber(fields.gross),rate:readNumber(fields.rate),commission:readNumber(fields.commission),share:readNumber(share),referral:readNumber(referral),solve:solve.value});
 if(r.error){fail(r.error);return;}
 fields[solve.value].value=solve.value==='rate'?String(Number(r.rate.toFixed(6))):dollars.format(r[solve.value]);
 const saved=baseline*readNumber(savings)/100,target=baseline-saved;
 get('calc-savings-amount').textContent=money.format(saved);get('calc-expense-target').textContent=money.format(target);
 const delta=r.commission-target,level=Math.abs(delta)<.005?'equal':delta>0?'above':'below';
 cell.classList.toggle('above-budget',level==='above');cell.classList.toggle('below-budget',level==='below');
 const status=level==='equal'?'Matches the illustrative budget projection':money.format(Math.abs(delta))+' '+level+' budget projection';
 const unitAmount=perUnitMoney.format(Math.abs(delta)/90);
 const perUnitLabel=level==='below'?'Shortfall equivalent per rental unit':level==='above'?'Surplus equivalent per rental unit':'Difference per rental unit';
 const fundingNote=level==='below'?'If this were the final annual gap, dividing it equally among 90 rental-program units would mean '+unitAmount+' per unit. This shows the scale of the potential funding gap, not an actual assessment or amount due.':'This divides the illustrative income difference equally among 90 rental-program units. It does not represent an owner payout or an amount due.';
 const comparison='<div class="calc-comparison"><div><strong class="calc-status '+level+'">'+status+'</strong><span>Compared with '+money.format(target)+' in illustrative expenses after '+pct.format(readNumber(savings))+'% savings.</span></div><div><span>'+perUnitLabel+'</span><strong class="calc-per-unit '+level+'">'+unitAmount+'</strong><span>Assuming 90 rental-program units.</span></div></div><p class="calc-funding-note">'+fundingNote+'</p><p>Efficiency savings reduce the funding requirement by '+money.format(saved)+'. Compare lower commission rates, rental revenue growth and expense savings together. This illustration excludes other income and other changes in operating costs.</p>';
 const growth=(r.gross/2500000-1)*100;
 const detail='Gross rental income is '+money.format(r.gross)+', '+(Math.abs(growth)<.00001?'the same as the starting example':pct.format(Math.abs(growth))+'% '+(growth>0?'above':'below')+' the starting example')+'.';
 result.innerHTML=comparison+'<p>'+detail+'</p><ul><li><strong>Owner referrals:</strong> '+pct.format(Number(share.value))+'% of total gross rent ('+money.format(r.referralRent)+') × '+pct.format(Number(referral.value))+'% retained commission = '+money.format(r.referralIncome)+'.</li><li><strong>Seaspray-generated bookings:</strong> '+pct.format(100-Number(share.value))+'% of total gross rent ('+money.format(r.otherRent)+') × '+pct.format(r.rate)+'% retained commission = '+money.format(r.otherIncome)+'.</li></ul><p>The combined retained commission rate is '+pct.format(r.effective*100)+'%.</p>';
}
Object.values(fields).concat([share,referral,savings]).forEach(i=>{i.addEventListener('input',render);i.addEventListener('change',render);});solve.addEventListener('change',render);
 [fields.gross,fields.commission].forEach(input=>input.addEventListener('blur',()=>{formatDollars(input);render();}));
get('calc-reset').addEventListener('click',()=>{solve.value='commission';fields.gross.value='2500000';fields.rate.value='28';fields.commission.value='687500';share.value='5';referral.value='18';savings.value='0';render();});
 get('calc-reset').addEventListener('click',()=>{formatDollars(fields.gross);formatDollars(fields.commission);});
 formatDollars(fields.gross);formatDollars(fields.commission);
render();
})();
