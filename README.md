# Eden Studios Offline HTML Invoice

The root `index.html` is the complete standalone offline app. The invoice preview is **real HTML/CSS**: an `<article>` with a header, definition lists, customer fields, a semantic service table, notes, totals, terms and footer. All static and entered text is selectable. The only image is the cropped Eden logo (`dist/eden-logo.png`, 420 × 411). There is no full-page invoice background image and no on-screen preview canvas.

## Offline use

Download `index.html`, rename it if desired, and open it in a browser or local HTML viewer that runs JavaScript. All fonts, logo artwork, styles and scripts are embedded. No server, login, CDN or network calls are required. You can share the HTML as a WhatsApp document.

Fill the form to update the HTML invoice. Download PDF generates a one-page A4 invoice from the **live HTML elements and text**. Save editable copy downloads an HTML invoice containing your entered values and selections. Print invoice uses the native HTML print layout, which can produce searchable PDF text when the browser supports saving to PDF.

On iPhones, Files/WhatsApp may show a read-only preview. A compatible HTML viewer is needed if interactive controls or downloads are unavailable. Physical iPhone local-file execution and native sharing have not been verified.

## Layout

The tall navy/gold header, studio contact details, customer fields, service/payment checkboxes, six-row service table, notes, bordered totals, six terms and signature/footer follow the supplied reference design. The page is rebuilt in HTML rather than placed over a raster copy. See `dist/invoice-layout.css` for layout and typography, and the `invoicePaper` article in `dist/index.html` for markup.

Amounts and totals calculate automatically. Draft storage uses localStorage where supported; editable HTML copies restore their embedded state independently of storage. Long values are fitted within their fields, and content that still overflows is reported before PDF export. The template has six service rows. Signature is a typed name.

## PDF implementation

`dist/invoice-renderer.js` updates DOM text nodes and table cells. Its export function reads those DOM element boxes, borders, SVG icons, logo and text-line positions, and paints a temporary export-only canvas. It does not draw an invoice-template image or keep a second hand-positioned invoice layout. The direct downloaded PDF is rasterized; use native print-to-PDF when selectable PDF text is required. Fonts are embedded Roboto subsets; see `FONT-LICENSE.txt`.

## Development

```sh
python3 -m http.server 8080 --directory dist
```

Rebuild the single-file artifact:

```sh
python3 scripts/build_offline.py
```

Verification notes are in `QA.md`.

## Services and readable populated values

The service checklist has ten options, including the additional **Background Score SFX** and **Voice Dub / Voice over Artist** checkboxes. All ten appear in the form, live HTML invoice and downloaded PDF, and their selection is preserved in saved drafts/editable copies.

Populated customer details and line items use 12 px text at the native A4 layout size, metadata/notes/reference use 11.5 px, totals use 12.5 px and grand total uses 17.5 px. Text fitting has an 11 px minimum; values that still do not fit are reported instead of becoming tiny. The checklist has three rows and the remaining invoice sections are spaced to keep the result on one A4 page.
