"""Build a portable offline invoice with no external dependencies."""
from pathlib import Path
import base64,re
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
html=(dist/'index.html').read_text()
css=(dist/'styles.css').read_text()
js=(dist/'app.js').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
html=html.replace('<script src="app.js" defer></script>','')
html=html.replace('src="invoice-template.jpg"','src="data:image/jpeg;base64,'+base64.b64encode((dist/'invoice-template.jpg').read_bytes()).decode()+'"')
html=html.replace('<title>Eden Studios • Invoice maker</title>','<title>Eden Studios • Offline invoice</title>')
html=html.replace('<meta name="theme-color"', '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; font-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'"><meta name="theme-color"')
html=html.replace('Made for your mobile','Works offline • Single file')
html=html.replace('Fill in the details. Your original invoice updates instantly below.','No internet or sign-in needed. Fill in the details and save your invoice as a PDF.')
html=html.replace('<button id="printBtn"','<button id="saveCopyBtn" class="light">Save editable copy</button><button id="printBtn"')
html=html.replace('Your draft stays in this browser on this device.','Use Save editable copy to keep a filled HTML invoice you can reopen offline. Browser draft saving depends on your HTML viewer.')
html=html.replace('<p class="small">iPhone: open the PDF, then use Share → Save to Files. For printing, select A4 paper.</p>','<p class="small">iPhone: this file must be opened in an HTML browser/viewer that runs JavaScript. Files and WhatsApp previews may show a read-only preview. If buttons do not respond, open the file in a compatible HTML viewer. No internet is needed once the file is saved.</p><p class="small">Save PDF creates the final bill. Save editable copy includes all entered details so you can edit it later. For printing, select A4 paper.</p>')
# An explicitly saved invoice has priority over a browser draft.
js=js.replace("const DRAFT_KEY='eden-invoice-v1';", "const DRAFT_KEY='eden-offline-v1:'+location.pathname;\nlet snapshot=null;try{snapshot=JSON.parse(document.getElementById('invoiceSnapshot')?.textContent||'null');}catch{}")
js=js.replace("const draft=JSON.parse(localStorage.getItem(DRAFT_KEY));", "const draft=snapshot||JSON.parse(localStorage.getItem(DRAFT_KEY));")
js=js.replace("$('draftStatus').textContent='Your saved draft is restored';", "$('draftStatus').textContent=snapshot?'Your saved invoice is restored':'Your saved draft is restored';")
# Storage may be disabled for local files; still restore an explicit invoice snapshot.
js=js.replace("$('draftStatus').textContent='Start a new invoice — no saved draft available';", "$('draftStatus').textContent='Browser draft saving is unavailable — use Save editable copy';")
js=js.replace("Draft not saved — download your PDF before leaving", "Browser draft saving is unavailable — use Save editable copy before leaving")
js += r'''
$('saveCopyBtn').onclick=()=>{
 const copy=document.documentElement.cloneNode(true);
 // Dynamic rows must be regenerated once, when this saved copy opens.
 copy.querySelector('#serviceRows').innerHTML='';
 copy.querySelector('#previewRows').innerHTML='';
 const old=copy.querySelector('#invoiceSnapshot');if(old)old.remove();
 const state={version:1,values:inputs.map(el=>({id:el.id,value:el.value,checked:el.checked}))};
 const data=document.createElement('script');data.type='application/json';data.id='invoiceSnapshot';data.textContent=JSON.stringify(state).replace(/</g,'\\u003c');
 copy.querySelector('head').append(data);
 const content='<!doctype html>\n'+copy.outerHTML;
 const file=new File([content],`Eden-Editable-${($('f_invoice').value||'draft').replace(/[^a-zA-Z0-9_-]/g,'-')}.html`,{type:'text/html'});
 download(file);$('exportStatus').textContent='Editable HTML saved with your entered details. Reopen this file in your HTML viewer to continue.';
};
'''
# Escape only '<' in JSON, without adding extra literal backslashes.
js=js.replace("replace(/</g,'\\\\u003c')", "replace(/</g,'\\u003c')")
js=js.replace("'<!doctype html>\\n'", "'<!doctype html>\\n'")
html=html.replace('</body>', '<noscript><p>This offline invoice needs JavaScript enabled. Open it in an HTML browser/viewer that supports scripts.</p></noscript><script>'+js.replace('</script','<\\/script')+'</script></body>')
(root/'index.html').write_text(html)
print(f'Built {root / "index.html"}: {len(html.encode()):,} bytes')
