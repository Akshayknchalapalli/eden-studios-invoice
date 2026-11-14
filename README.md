# Eden Studios Offline Invoice

The root `index.html` is a standalone offline invoice maker. Download it and optionally rename it `Eden_Studios_Offline.html`. The supplied reference PDF defines the invoice appearance: the original full-height header and branding, contact details, address, bordered customer and bill fields, service/payment checkboxes, six-row service table, notes, totals, six printed terms, payment terms and signature.

## Use offline

1. Save the HTML file on your device.
2. Open it in a browser or local HTML viewer that runs JavaScript.
3. Enter the details; the preview fills the matching reference fields.
4. Download PDF for the final bill, or Save editable copy to keep an HTML invoice containing all entered values.

All artwork, scripts and fonts are embedded. No server, sign-in, CDN or network requests are required. You can send the blank HTML as a WhatsApp document. On iPhones, Files/WhatsApp may show a read-only HTML preview; use a compatible HTML viewer if the controls do not respond. Physical iPhone local-file execution and downloads remain unverified.

## Template fidelity

- The background is the exact original JPEG embedded in the supplied PDF, including all labels, borders, icons and printed terms.
- Dynamic values use the reference PDF's measured coordinates, font sizes, baselines and column alignment.
- Embedded Roboto weights 400, 600 and 900 match the regular values, payment reference and bold grand total. Dates use YYYY-MM-DD, as in the reference.
- Selected checkmarks reuse the reference checkmark outline. The preview and downloaded PDF use one renderer.
- The exported page matches the reference's 595 × 841 point A4 dimensions. PDF contents are rasterized.
- This is a reference-matching layout, so the original small text sizes and six-row limit are intentional. Values that exceed their available field space produce a warning and block PDF export.

Drafts are saved in localStorage where the viewer supports it. Saved editable copies embed the entered values and restore them independently of draft storage. Copies containing real customer information should be treated as customer records. Authorized signature is a typed name, not a cryptographic signature.

## Develop

```sh
python3 -m http.server 8080 --directory dist
```

Edit `dist/invoice-renderer.js` for field placement, `dist/app.js` for form/calculation/export behavior and `dist/index.html` / `dist/styles.css` for the editor. Rebuild the standalone file with:

```sh
python3 scripts/build_offline.py
```

Font license: `FONT-LICENSE.txt`. Verification: `QA.md`.
