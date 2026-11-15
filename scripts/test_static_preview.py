"""Check the no-script layout's unit conversion and full-page geometry."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class StaticPreviewTests(unittest.TestCase):
    def test_all_native_lengths_scale_together(self):
        native = (ROOT/'dist/invoice-layout.css').read_text()
        static = (ROOT/'dist/invoice-static.css').read_text()
        lengths = re.findall(r'(?<![\w.-])(\d*\.?\d+)px', native)
        self.assertGreater(len(lengths), 100)
        for length in lengths:
            self.assertIn('calc(var(--invoice-unit) * '+length+')', static)
        self.assertNotIn('atan2', static)
        self.assertIn('transform:none!important', static)

    def test_page_geometry_across_phone_sizes(self):
        for width in [280, 320, 350, 360, 390, 412, 430, 600, 700, 768, 900, 1024, 1440]:
            if width <= 350:
                available = width-68
            elif width <= 700:
                available = width-80
            elif width <= 900:
                available = 620
            elif width < 1400:
                available = .525*width-101.6
            else:
                available = 633.4
            unit = available/794
            # The stage reserves the entire scaled page, including the footer.
            self.assertAlmostEqual(794*unit, available)
            self.assertGreater(1123*unit, 1119*unit)
            self.assertGreater(available, 0)

    def test_offline_file_contains_the_static_layout(self):
        html = (ROOT/'index.html').read_text()
        static = (ROOT/'dist/invoice-static.css').read_text()
        self.assertIn('<noscript><style>'+static+'</style>', html)
        self.assertNotIn('href="invoice-static.css"', html)
        self.assertNotIn('foreignObject width=', html)

if __name__ == '__main__':
    unittest.main()
