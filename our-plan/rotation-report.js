(()=>{
'use strict';
const $=id=>document.getElementById(id),my='2BR-01';
// Fictional reporting data only. No connection to live reservations.
const queue=['2BR-02','2BR-03','2BR-04','2BR-01','2BR-05','2BR-06'];
const bookings=[
 {unit:'2BR-03',booked:'2026-10-04T09:10:00-05:00',arrival:'2026-11-12',departure:'2026-11-15',type:'Owner-generated',source:'Owner referral',rent:660},
 {unit:'2BR-06',booked:'2026-10-04T09:00:00-05:00',arrival:'2026-11-19',departure:'2026-11-26',type:'General rotation',source:'Phone',rent:1540},
 {unit:'2BR-05',booked:'2026-10-03T14:15:00-05:00',arrival:'2026-11-05',departure:'2026-11-09',type:'General rotation',source:'Seaspray website',rent:880},
 {unit:my,booked:'2026-10-02T11:00:00-05:00',arrival:'2026-11-19',departure:'2026-11-26',type:'General rotation',source:'Phone',rent:1540},
 {unit:'2BR-04',booked:'2026-10-01T10:30:00-05:00',arrival:'2026-11-12',departure:'2026-11-17',type:'General rotation',source:'Seaspray website',rent:1100},
 {unit:'2BR-03',booked:'2026-09-30T15:00:00-05:00',arrival:'2026-11-01',departure:'2026-11-04',type:'General rotation',source:'Phone',rent:660},
 {unit:'2BR-02',booked:'2026-09-29T13:00:00-05:00',arrival:'2026-11-08',departure:'2026-11-10',type:'General rotation',source:'Phone',rent:440}
].sort((a,b)=>Date.parse(b.booked)-Date.parse(a.booked));
const dates=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'America/Chicago'});
const times=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Chicago'});
const date=value=>dates.format(new Date(value.length===10?value+'T12:00:00-06:00':value));
const nights=b=>(Date.parse(b.departure)-Date.parse(b.arrival))/86400000;
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
const latest=id=>bookings.find(b=>b.unit===id&&b.type==='General rotation');
$('rotation-summary').innerHTML=`<div><span>Your place in line</span><strong>${queue.indexOf(my)+1} of ${queue.length}</strong><small>Two-bedroom queue</small></div><div><span>Your last general booking</span><strong>${date(latest(my).booked)}</strong><small>${times.format(new Date(latest(my).booked))} Central</small></div><div><span>Your next booked stay</span><strong>${date(latest(my).arrival)}–${date(latest(my).departure)}</strong><small>${nights(latest(my))} nights • Sample data</small></div>`;
$('rotation-queue').innerHTML=queue.map((id,i)=>`<li class="queue-row${id===my?' your-queue':''}"><div class="queue-position">${i+1}<span>in line</span></div><div class="queue-unit"><strong>${id}${id===my?' • Your unit':''}</strong><span>Last general booking: ${date(latest(id).booked)}</span></div></li>`).join('');
$('rotation-history').innerHTML=bookings.map(b=>`<article class="rotation-event${b.unit===my?' your-booking':''}"><div class="event-heading"><strong>${b.unit}${b.unit===my?' • Your unit':''}</strong><strong>${nights(b)} nights</strong></div><dl class="booking-facts"><div><dt>Booked</dt><dd>${date(b.booked)} • ${times.format(new Date(b.booked))}</dd></div><div><dt>Gross rent</dt><dd>${money(b.rent)}</dd></div><div><dt>Check-in</dt><dd>${date(b.arrival)}</dd></div><div><dt>Check-out</dt><dd>${date(b.departure)}</dd></div></dl><p class="booking-source"><strong>${b.type}</strong> • ${b.source}</p></article>`).join('');
})();
