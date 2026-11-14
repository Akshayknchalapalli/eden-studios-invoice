# Eden Studios Invoice

A mobile-first offline invoice maker with a freshly typeset Eden Studios template. All labels, entered values, lines, checks and totals are rendered together using embedded regular and bold Noto Sans fonts; only the logo uses the original supplied artwork. Buildless HTML, CSS and JavaScript; no external libraries or customer-data APIs.

## Offline single-file version

Download the repository-root `index.html` as a file. This is the complete app: the invoice artwork, CSS, JavaScript and PDF generator are embedded. No internet, login, server, installation, CDN or external assets are needed while using it in a compatible browser. You can rename it `Eden_Studios_Offline.html` and send it as a WhatsApp document.

1. Save the HTML file on your device.
2. Open it in a browser or HTML viewer that executes JavaScript.
3. Fill the form and use Download PDF to create an A4 invoice.
4. Use Save editable copy to download an HTML file containing the entered values. Reopen that copy to continue editing. This is useful when browser localStorage is unavailable for local files.

On iPhones, Files/WhatsApp previews may be read-only and may not execute scripts or allow downloads. A compatible local HTML browser/viewer is required in that case. Physical iPhone Safari/local-file behavior has not been verified. Native sharing may be unavailable for file URLs; PDF download and printing depend on the viewer's capabilities.

The file's Content Security Policy prohibits network connections. Send invoice PDFs to customers, or send the blank HTML file if they need the invoice maker. An editable copy includes all the customer data entered in it.

Rebuild the single-file version after editing `dist/`:

```sh
python3 scripts/build_offline.py
```

## Development server (optional)

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Serve the directory over HTTPS for native mobile sharing. The artwork and all application assets are included.

## Features

- Live mappings for invoice number, dates, customer, phone, address, eight service selections, four payment modes, reference, six invoice rows, notes, terms and signature.
- Subtotal, fixed discount, percentage tax and grand total; currency rounding per row and at tax calculation.
- Freshly typeset A4 preview with consistent fonts, wrapped descriptions, aligned amounts, navy/gold branding, original studio details, six terms, notes, signature and Fit/1.5×–3× zoom. The PDF uses the same rendered page as the preview.
- Draft restoration from browser localStorage on the same device and origin. No cloud synchronization; private browsing or cleared site data may remove the draft.
- Direct one-page A4 PDF download, iOS file-sharing preparation, and print fallback.
- Validation blocks PDF export for incomplete line items, negative/invalid numbers, excessive discount and text that cannot fit the artwork.
- Safe-area-aware action bar, 16px form inputs, 44px+ controls and decimal/phone keyboards.

## Using on iPhone

For offline use, save the root HTML file and open it in a compatible HTML viewer. For the hosted version, open its URL in Safari. Enter the invoice details and tap Preview. Tap Save PDF to download; in the PDF viewer choose Share → Save to Files. Share PDF first prepares the file; a second tap opens the native share sheet on supported browsers. This second tap preserves Safari's user-gesture requirement.

## Limits

The A4 layout provides six service rows. Text wraps and fits within its section; fields that still do not fit are named in a warning and must be shortened before PDF export. The exported PDF preserves the artwork as an image and is not a searchable text PDF. Authorized signature is a typed name, not a handwritten or cryptographic signature. Studio contact details and the original six terms are recreated as template text in `dist/invoice-renderer.js`. The logo is drawn from the supplied artwork. Embedded Noto Sans fonts are licensed under SIL OFL; see `FONT-LICENSE.txt`. Drafts are local to the browser, and contain customer data entered by the user.

## Verification

See `QA.md`. Native iPhone Safari testing remains a release check; mobile viewport QA was performed in Chromium.
