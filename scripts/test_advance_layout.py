"""Check advance placement and the A4 summary's reserved geometry."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
ROOT=Path(__file__).resolve().parents[1]
class Summary(HTMLParser):
 def __init__(self):super().__init__();self.total_keys=[];self.ids=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'data-total' in attrs:self.total_keys.append(attrs['data-total'])
  if 'id' in attrs:self.ids.append(attrs['id'])
class AdvanceLayoutTests(unittest.TestCase):
 def test_summary_order_and_offline_delivery(self):
  for name in ['dist/index.html','index.html','dist/Eden-Studios-Invoice.html']:
   page=(ROOT/name).read_text();summary=Summary();summary.feed(page)
   self.assertEqual(summary.total_keys,['advance','subtotal','discount','tax','grand','balance'])
   self.assertLess(summary.ids.index('f_advance'),summary.ids.index('sum_sub'))
   self.assertIn('sum_balance',summary.ids)
 def test_summary_table_terms_and_footer_do_not_overlap(self):
  css=(ROOT/'dist/invoice-layout.css').read_text()
  def last(pattern):return float(re.findall(pattern,css)[-1])
  summary_top=last(r'\.invoice-totals\{[^}]*?top:([\d.]+)px')
  row=last(r'\.invoice-totals>div\{height:([\d.]+)px')
  balance=last(r'\.invoice-totals>\.invoice-grand\{height:([\d.]+)px')
  terms_top=last(r'\.invoice-conditions\{top:([\d.]+)px')
  terms_height=last(r'\.invoice-conditions\{top:[\d.]+px;height:([\d.]+)px')
  table_top=last(r'\.has-many-services \.invoice-table\{top:([\d.]+)px')
  compact_row=last(r'\.invoice-table\.is-compact td\{height:([\d.]+)px')
  self.assertLessEqual(table_top+26+14*compact_row,summary_top)
  self.assertLessEqual(summary_top+5*row+2+balance,terms_top)
  self.assertLessEqual(terms_top+terms_height,1047)
  self.assertLessEqual(1047+49+22,1123)
if __name__=='__main__':unittest.main()
