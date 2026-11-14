'use strict';
// One layout is used for the live preview, printing and downloaded PDF.
const INVOICE_WIDTH=794,INVOICE_HEIGHT=1123,INVOICE_SCALE=3;
function drawInvoice(canvas,data,logo){
 if(canvas.width!==INVOICE_WIDTH*INVOICE_SCALE)canvas.width=INVOICE_WIDTH*INVOICE_SCALE;if(canvas.height!==INVOICE_HEIGHT*INVOICE_SCALE)canvas.height=INVOICE_HEIGHT*INVOICE_SCALE;
 const c=canvas.getContext('2d');c.setTransform(INVOICE_SCALE,0,0,INVOICE_SCALE,0,0);
 const navy='#061a38',gold='#e5aa19',ink='#162840',muted='#67758a',line='#dce3ec',pale='#f2f5fa';
 const issues=[];c.textBaseline='top';
 function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
 function rule(x,y,w,color=line){rect(x,y,w,.8,color);}
 function font(size=12,weight=400){c.font=`${weight} ${size}px InvoiceSans, Arial, sans-serif`;}
 function text(value,x,y,size=12,weight=400,color=ink,align='left'){font(size,weight);c.fillStyle=color;c.textAlign=align;c.fillText(String(value),x,y);c.textAlign='left';}
 function lines(value,width,size,weight){font(size,weight);const out=[];for(const paragraph of String(value||'').split('\n')){if(!paragraph){out.push('');continue;}let s='';for(const word of paragraph.split(/(\s+)/)){if(c.measureText(s+word).width<=width){s+=word;continue;}if(s.trim())out.push(s.trimEnd());s=word.trimStart();while(c.measureText(s).width>width){let chunk='';for(const ch of s){if(c.measureText(chunk+ch).width>width)break;chunk+=ch;}if(!chunk)break;out.push(chunk);s=s.slice(chunk.length);}}out.push(s.trimEnd());}return out;}
 function block(value,x,y,w,h,{size=12,weight=400,color=ink,label='',align='left',minSize=10}={}){
  let fitted=lines(value,w,size,weight),lh=size*1.42;
  while(size>minSize&&fitted.length*lh>h){size-=.5;lh=size*1.42;fitted=lines(value,w,size,weight);}
  if(fitted.length*lh>h+.1){issues.push(label||'Invoice text');rect(x-3,y-2,w+6,h+4,'#fff0c9');}
  const count=Math.max(1,Math.floor(h/lh));fitted.slice(0,count).forEach((s,i)=>text(s,align==='right'?x+w:x,y+i*lh,size,weight,color,align));
 }
 function label(s,x,y){text(s,x,y,9.5,700,muted);}
 function check(s,selected,x,y,w){c.strokeStyle=selected?navy:'#a6b2c3';c.lineWidth=1;c.strokeRect(x,y+1,10,10);if(selected){c.strokeStyle=navy;c.lineWidth=1.8;c.beginPath();c.moveTo(x+2,y+6);c.lineTo(x+4.5,y+8.5);c.lineTo(x+8,y+3);c.stroke();}block(s,x+16,y-1,w-16,32,{size:10.5,minSize:10.5,label:s});}
 function fmt(n){return n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
 rect(0,0,794,1123,'#fff');rect(0,0,794,200,navy);rect(0,0,7,200,gold);
 // Preserve only the supplied brand artwork. All invoice text and rules are rebuilt.
 if(logo?.complete&&logo.naturalWidth)c.drawImage(logo,76,25,420,411,34,17,170,166);
 else{text('Eden',34,43,40,700,gold);text('STUDIOS',34,100,21,700,'#fff');}
 text('UDYAM MSME : AP1000641666',250,21,9.5,700,gold);
 text('MUSIC PRODUCTION STUDIO',250,43,10,700,gold);
 text('BILL / INVOICE',250,65,28,700,'#fff');rule(250,104,506,gold);
 text('CONTACT',250,118,9,700,gold);
 text('9849982367  |  7799184847',250,136,11,400,'#fff');
 text('edenrecstudio95@gmail.com',250,154,11,400,'#fff');
 text('Instagram: _eden_studios',503,136,10,400,'#d9e2ef');
 text('Facebook: Eden Recording Studio',503,154,10,400,'#d9e2ef');
 text('YouTube: Eden Rec Studios',503,172,10,400,'#d9e2ef');
 const L=38,R=756,W=718;
 label('STUDIO ADDRESS',L,222);
 text('Door No. 50-40-26, Bhanu Prakash Nilayam, 2nd Floor,',L,242,10.5);
 text('Konaseema Street, TPT Colony, Seethamadhara,',L,258,10.5);
 text('Opposite AP Grameena Bank, Eenadu,',L,274,10.5);
 text('Visakhapatnam, AP - 530013',L,290,10.5);
 [['INVOICE NO.',data.invoice],['INVOICE DATE',data.date],['DUE DATE',data.due]].forEach(([k,v],i)=>{label(k,500,222+i*28);block(v||'—',596,219+i*28,160,25,{size:12,weight:700,label:k,align:'right'});rule(500,243+i*28,256);});
 rect(L,326,W,74,pale);rect(L,326,3,74,gold);
 label('CUSTOMER / BILL TO',L+14,337);
 block(data.customer||'—',L+14,353,432,25,{size:14,weight:700,label:'Customer name'});
 label('PHONE',562,337);block(data.phone||'—',562,354,180,23,{size:12,label:'Phone'});
 block(data.address||'—',L+14,377,690,20,{size:11,label:'Address / company',minSize:10.5});
 label('SERVICE TYPE / OPTIONAL',L,418);
 const services=[['music','Music composition'],['arrange','Track arrangements'],['record','Recording / pitch correction'],['mix','Mixing & mastering'],['voice','Voice-over / dubbing'],['score','Background score'],['live','Live instruments'],['plugins','Audio plugins / MIDI installation']];
 services.forEach(([key,s],i)=>check(s,!!data.checks[key],L+(i%4)*181,438+Math.floor(i/4)*27,171));
 label('PAYMENT MODE',L,501);
 ['Cash','UPI','Card','Bank transfer'].forEach((s,i)=>check(s,data.payment===s,156+i*98,500,96));
 label('REFERENCE / UPI ID',L,524);block(data.reference||'—',181,521,575,23,{size:11,label:'Payment reference'});
 const top=558,head=28,rowHeight=31;
 rect(L,top,W,head,navy);
 text('NO.',L+10,top+8,9,700,'#fff');text('SERVICE / DESCRIPTION',L+45,top+8,9,700,'#fff');
 text('QTY',505,top+8,9,700,'#fff','right');text('RATE (INR)',613,top+8,9,700,'#fff','right');text('AMOUNT (INR)',R-11,top+8,9,700,'#fff','right');
 for(let i=0;i<6;i++){
  const y=top+head+i*rowHeight,row=data.rows[i];if(i%2===0)rect(L,y,W,rowHeight,'#f6f8fb');
  text(i+1,L+10,y+9,10,400,muted);
  block(row.description,L+45,y+3,362,29,{size:12,label:`Service ${i+1} description`});
  block(row.quantity,465,y+8,40,rowHeight-8,{size:11,label:`Service ${i+1} quantity`,align:'right'});
  block(row.rateText,523,y+8,90,rowHeight-8,{size:11,label:`Service ${i+1} rate`,align:'right'});
  block(row.amountText,629,y+8,116,rowHeight-8,{size:11,weight:700,label:`Service ${i+1} amount`,align:'right'});
  rule(L,y+rowHeight,W);
 }
 label('PROJECT NOTES / DELIVERABLES',L,793);
 block(data.notes||'—',L,814,396,80,{size:11.5,label:'Project notes',minSize:11});
 const sums=[['SUBTOTAL (INR)',data.subtotal],['DISCOUNT (INR)',data.discount],[`GST / TAX (${data.taxRate}%)`,data.tax]];
 sums.forEach(([k,v],i)=>{label(k,475,793+i*25);block(fmt(v),617,790+i*25,139,24,{size:12,label:k,align:'right'});rule(475,811+i*25,281);});
 rect(475,867,281,32,navy);text('GRAND TOTAL',487,878,10,700,'#fff');block(fmt(data.grand),586,874,158,26,{size:17,weight:700,color:'#fff',minSize:12,label:'Grand total',align:'right'});
 rule(L,917,W,gold);text('TERMS & CONDITIONS',L,932,10,700,navy);
 const terms=[
 'Booking is confirmed upon receipt of the agreed advance payment.',
 'Remaining balance is payable before delivery of final audio files.',
 'Includes only the revisions agreed at booking; extra revisions or changes may incur additional charges.',
 'Client is responsible for providing accurate content and confirming rights/permissions for supplied material.',
 'Advance payments are non-refundable once work has commenced; cancellation charges may apply.',
 'Raw/project files and session backups are not included unless agreed in writing.'
 ];
 terms.forEach((s,i)=>{text(`${i+1}.`,L,952+i*16,10.5,400,muted);text(s,L+17,952+i*16,10.5);});
 rule(L,1051,W,gold);
 text('Thank you for choosing Eden Studios!',L,1064,12,700,navy);
 label('PAYMENT TERMS',L,1088);block(data.terms||'—',145,1085,325,27,{size:10.5,minSize:10,label:'Payment terms'});
 label('AUTHORIZED SIGNATURE',503,1065);block(data.signature||'—',503,1082,253,27,{size:12,weight:700,label:'Authorized signature'});rule(503,1110,253);
 text('CREATE   ·   RECORD   ·   PRODUCE   ·   BEYOND',L,1112,7.5,700,'#967017');
 return issues;
}
