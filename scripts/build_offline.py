"""Build a portable offline invoice with no external dependencies."""
from pathlib import Path
import base64,re
from build_static_preview import build_static_preview
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
static_css=build_static_preview(dist)
html=(dist/'index.html').read_text()
# Both the hosted page and offline downloads carry the same official artwork.
artwork='data:image/png;base64,'+base64.b64encode((dist/'eden-logo-landscape.png').read_bytes()).decode()
html=re.sub(r'(<img\b[^>]*\bdata-studio-artwork[^>]*\bsrc=")[^"]*(")',lambda m:m.group(1)+artwork+m.group(2),html)
(dist/'index.html').write_text(html)
html=html.replace('<link rel="stylesheet" href="invoice-static.css">','<style>'+static_css+'</style>')
css=(dist/'invoice-fonts.css').read_text()+'\n'+(dist/'styles.css').read_text()+'\n'+(dist/'invoice-layout.css').read_text()
fit_js=(dist/'preview-fit.js').read_text()
js=(dist/'invoice-math.js').read_text()+'\n'+(dist/'invoice-renderer.js').read_text()+'\n'+(dist/'app.js').read_text()
html=html.replace('<link rel="stylesheet" href="invoice-fonts.css">','').replace('<link rel="stylesheet" href="invoice-layout.css?v=logo-landscape-2">','')
html=html.replace('<link rel="stylesheet" href="styles.css?v=branding-v3">','<style>'+css+'</style>')
html=html.replace('<script src="invoice-math.js" defer></script>','').replace('<script src="preview-fit.js" defer></script>','').replace('<script src="app.js" defer></script>','').replace('<script src="invoice-renderer.js" defer></script>','')
html=html.replace('src="eden-logo-landscape.png"','src="data:image/png;base64,'+base64.b64encode((dist/'eden-logo-landscape.png').read_bytes()).decode()+'"')
html=html.replace('<title>Eden Studios • Invoice maker</title>','<title>Eden Studios • Offline HTML invoice</title>')
html=html.replace('<meta name="theme-color"', '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; font-src data:; object-src \'none\'; base-uri \'none\'; form-action \'none\'"><meta name="theme-color"')
html=html.replace('<a class="offline-download" href="Eden-Studios-Invoice.html" download="Eden-Studios-Invoice.html">Download offline HTML</a>','<span class="badge">Works offline • Single file</span>')
html=html.replace('Fill in the details. Your invoice updates instantly in the original reference layout below.','No internet or sign-in needed. Fill in the details and save your invoice as a PDF.')
html=html.replace('<button id="printBtn"','<button id="saveCopyBtn" class="light">Save editable copy</button><button id="printBtn"')
html=html.replace('Your draft stays in this browser on this device.','Use Save editable copy to keep a filled HTML invoice you can reopen offline. Browser draft saving depends on your HTML viewer.')
html=html.replace('<p class="small">iPhone: open the PDF, then use Share → Save to Files. For printing, select A4 paper.</p>','<p class="small">iPhone: this file must be opened in an HTML browser/viewer that runs JavaScript. Files and WhatsApp previews may show a read-only preview. If buttons do not respond, open the file in a compatible HTML viewer. No internet is needed once the file is saved.</p><p class="small">Save PDF creates the final bill. Save editable copy includes all entered details so you can edit it later. For printing, select A4 paper.</p>')
# An explicitly saved invoice has priority over a browser draft.
js=js.replace("const DRAFT_KEY='eden-invoice-v1';", "const DRAFT_KEY='eden-offline-v1:'+location.pathname;\nlet snapshot=null;try{snapshot=JSON.parse((document.getElementById('invoiceSnapshot')||{}).textContent||'null');}catch(error){}")
js=js.replace("const draft=JSON.parse(localStorage.getItem(DRAFT_KEY));", "const draft=snapshot||JSON.parse(localStorage.getItem(DRAFT_KEY));")
js=js.replace("$('draftStatus').textContent='Your saved draft is restored';", "$('draftStatus').textContent=snapshot?'Your saved invoice is restored':'Your saved draft is restored';")
# Storage may be disabled for local files; still restore an explicit invoice snapshot.
js=js.replace("$('draftStatus').textContent='Start a new invoice — no saved draft available';", "$('draftStatus').textContent='Browser draft saving is unavailable — use Save editable copy';")
js=js.replace("Draft not saved — download your PDF before leaving", "Browser draft saving is unavailable — use Save editable copy before leaving")
js += r'''
$('saveCopyBtn').onclick=()=>{
 const copy=document.documentElement.cloneNode(true);
 // Form rows are regenerated; preserve the complete invoice for read-only viewers.
 copy.querySelector('#serviceRows').innerHTML='';
 copy.querySelector('#previewStage').removeAttribute('style');
 copy.querySelector('#preview').removeAttribute('style');
 const old=copy.querySelector('#invoiceSnapshot');if(old)old.remove();
 inputs.forEach(el=>{const saved=copy.querySelector('#'+el.id);if(!saved)return;if(el.type==='checkbox')el.checked?saved.setAttribute('checked',''):saved.removeAttribute('checked');else if(el.tagName==='TEXTAREA')saved.textContent=el.value;else if(el.tagName==='SELECT')[...saved.options].forEach(option=>option.value===el.value?option.setAttribute('selected',''):option.removeAttribute('selected'));else saved.setAttribute('value',el.value);});
 const state={version:2,values:inputs.map(el=>({id:el.id,value:el.value,checked:el.checked}))};
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
html=html.replace('</body>', '<script>'+fit_js+'</script><script>'+js.replace('</script','<\\/script')+'</script></body>')
(root/'index.html').write_text(html)
(dist/'Eden-Studios-Invoice.html').write_text(html)
print(f'Built {root / "index.html"}: {len(html.encode()):,} bytes')
