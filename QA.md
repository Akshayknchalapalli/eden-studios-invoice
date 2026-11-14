# Verification

## Passed in the live browser

- Populated every bill field, reference, notes, terms and signature; inspected corresponding preview text.
- Selected Music composition, Mixing & mastering and UPI; checked corresponding preview ticks.
- Entered 2 × ₹2,500, ₹500 discount, 18% tax: subtotal ₹5,000, tax ₹810, total ₹5,310.
- Populated sixth row (1 × ₹500): sixth row and updated total ₹5,900 appeared.
- Reloaded: text, amounts, payment mode and service selections restored.
- At 390px embedded viewport: no horizontal body overflow; bottom actions visible; preview fits; 1.5× zoom works.
- Long notes produce a fit warning and block export; excessive discount produces a validation warning.
- Share PDF preparation succeeds without external dependencies.
- Downloaded PDF parsed by Poppler: one page, A4 (595.28 × 841.89 points), no encryption, 932 KB for the sample.
- Rendered the PDF to PNG and visually inspected all populated boxes, totals, notes and checkmarks.
- JavaScript syntax check: `node --check dist/app.js`.

## Remaining device checks

Test on a physical iPhone in Safari: keyboard, focus zoom, safe-area padding, PDF download/Files, and native share sheet. Native Web Share cannot be fully confirmed using desktop Chromium. Printing uses the supplied raster artwork, and direct PDF text is rasterized.
