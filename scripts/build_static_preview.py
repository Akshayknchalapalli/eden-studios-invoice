"""Generate script-free proportional styles from the native A4 layout."""
from pathlib import Path
import re

def build_static_preview(dist):
    layout = (dist / 'invoice-layout.css').read_text()
    # All layout lengths share one unit, so text, logo, rows and borders fit together.
    scaled = re.sub(r'(?<![\w.-])(\d*\.?\d+)px', lambda m: 'calc(var(--invoice-unit) * '+m[1]+')', layout)
    scaled = re.sub(r'(font-size:[^;}]+)', r'\1!important', scaled)
    css = '''/* Generated from invoice-layout.css; active only inside noscript. */
@media screen{
 #previewStage{--invoice-unit:calc((100vw - 80px) / 794);width:100%;height:calc(var(--invoice-unit) * 1123)}
 @media(max-width:350px){#previewStage{--invoice-unit:calc((100vw - 68px) / 794)}}
 @media(min-width:700px){#previewStage{--invoice-unit:calc(620px / 794)}}
 @media(min-width:901px){#previewStage{--invoice-unit:calc((52.5vw - 101.6px) / 794)}}
 @media(min-width:1400px){#previewStage{--invoice-unit:calc(633.4px / 794)}}
 /* Container units give exact fit even when an embedded host changes its width. */
 @supports(width:1cqw){
  #previewWrap{container-type:inline-size}
  #previewStage{--invoice-unit:calc(100cqw / 794)}
 }
 #preview{width:calc(var(--invoice-unit) * 794);height:calc(var(--invoice-unit) * 1123);transform:none!important;-webkit-transform:none!important}
'''+scaled+'\n}\n'
    (dist / 'invoice-static.css').write_text(css)
    return css

if __name__ == '__main__':
    build_static_preview(Path(__file__).resolve().parents[1] / 'dist')
