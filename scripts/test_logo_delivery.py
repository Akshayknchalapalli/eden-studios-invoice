"""Verify hosted and downloadable branding use the exact supplied artwork."""
from pathlib import Path
from html.parser import HTMLParser
import base64
import unittest

ROOT = Path(__file__).resolve().parents[1]
class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='img' and 'data-studio-artwork' in attrs:
            self.images.append(attrs['src'])

class LogoDeliveryTests(unittest.TestCase):
    def test_all_rendered_logos_match_supplied_artwork(self):
        artwork=(ROOT/'dist/eden-logo-landscape.png').read_bytes()
        for name in ['dist/index.html','index.html','dist/Eden-Studios-Invoice.html']:
            html=(ROOT/name).read_text()
            parser=Images();parser.feed(html)
            self.assertEqual(len(parser.images),2,name)
            for image in parser.images:
                self.assertTrue(image.startswith('data:image/png;base64,'))
                self.assertEqual(base64.b64decode(image.split(',',1)[1]),artwork)
            self.assertNotIn('<span class="brand-mark">E</span>',html)
    def test_live_download_serves_current_offline_app(self):
        self.assertEqual((ROOT/'index.html').read_bytes(),(ROOT/'dist/Eden-Studios-Invoice.html').read_bytes())
        self.assertIn('href="Eden-Studios-Invoice.html" download=',(ROOT/'dist/index.html').read_text())
        self.assertNotIn('href="styles.css',(ROOT/'index.html').read_text())

if __name__=='__main__':
    unittest.main()
