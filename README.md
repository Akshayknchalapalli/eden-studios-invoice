# Eden Studios Invoice

A mobile-first invoice editor that populates the supplied Eden Studios artwork as you type. Buildless HTML, CSS and JavaScript; no external libraries or customer-data APIs.

## Run locally

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Serve the directory over HTTPS for native mobile sharing. The artwork and all application assets are included.

## Features

- Live mappings for invoice number, dates, customer, phone, address, eight service selections, four payment modes, reference, six invoice rows, notes, terms and signature.
- Subtotal, fixed discount, percentage tax and grand total; currency rounding per row and at tax calculation.
- Read-only preview using the original artwork, with Fit and 1.5×–3× zoom.
- Draft restoration from browser localStorage on the same device and origin. No cloud synchronization; private browsing or cleared site data may remove the draft.
- Direct one-page A4 PDF download, iOS file-sharing preparation, and print fallback.
- Validation blocks PDF export for incomplete line items, negative/invalid numbers, excessive discount and text that cannot fit the artwork.
- Safe-area-aware action bar, 16px form inputs, 44px+ controls and decimal/phone keyboards.

## Using on iPhone

Open the deployed URL in Safari. Enter the invoice details and tap Preview. Tap Save PDF to download; in the PDF viewer choose Share → Save to Files. Share PDF first prepares the file; a second tap opens the native share sheet on supported browsers. This second tap preserves Safari's user-gesture requirement.

## Limits

The original artwork has exactly six service rows. Long values shrink within their boxes; values that still do not fit are highlighted and must be shortened before export. The exported PDF preserves the artwork as an image and is not a searchable text PDF. Authorized signature is a typed name, not a handwritten or cryptographic signature. Studio contact details and printed terms are part of the supplied artwork. Drafts are local to the browser, and contain customer data entered by the user.

## Verification

See `QA.md`. Native iPhone Safari testing remains a release check; mobile viewport QA was performed in Chromium.
