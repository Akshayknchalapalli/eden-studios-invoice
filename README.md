# Eden Studios Offline HTML Invoice

The root `index.html` is the complete standalone offline app. The invoice preview is **real HTML/CSS**: an `<article>` with a header, definition lists, customer fields, a semantic service table, notes, totals, terms and footer. All static and entered text is selectable. The only image is the Eden artwork supplied as a PDF, converted to `dist/eden-logo-landscape.png` (960 × 540). There is no full-page invoice background image and no on-screen preview canvas.

## Offline use

Download `index.html`, rename it if desired, and open it in a browser or local HTML viewer that runs JavaScript. All fonts, logo artwork, styles and scripts are embedded. No server, login, CDN or network calls are required. You can share the HTML as a WhatsApp document.

Fill the form to update the HTML invoice. Download PDF generates a one-page A4 invoice from the **live HTML elements and text**. Save editable copy downloads an HTML invoice containing your entered values and selections. Print invoice uses the native HTML print layout, which can produce searchable PDF text when the browser supports saving to PDF.

On iPhones, Files/WhatsApp may show a read-only preview. A compatible HTML viewer is needed if interactive controls or downloads are unavailable. Physical iPhone local-file execution and native sharing have not been verified.

## Layout

The tall navy/gold header, studio contact details, customer fields, service/payment checkboxes, service table, notes, bordered totals, six terms and signature/footer follow the supplied reference design. The page is rebuilt in HTML rather than placed over a raster copy. See `dist/invoice-layout.css` for layout and typography, and the `invoicePaper` article in `dist/index.html` for markup.

Amounts and totals calculate automatically. Draft storage uses localStorage where supported; editable HTML copies restore their embedded state independently of storage. Long values are fitted within their fields, and content that still overflows is reported before PDF export. The invoice supports one line for each of the ten selected services. Signature is a typed name.

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

## Mobile and read-only previews

The complete invoice (ten service choices, four payment choices and six table rows) is present in the HTML. A plain HTML wrapper scales the A4 article to the available preview width. Fitting runs independently of form, storage, fonts and export setup, with window resize events when ResizeObserver is unavailable. When JavaScript is disabled, generated proportional CSS sizes the native invoice itself to fit the width and full A4 height, without transforms. Container units provide exact sizing in modern viewers; viewport calculations cover older viewers. Text remains selectable. Zoom controls enlarge the preview when scripts are available. Checkmarks use inline SVG strokes so they do not depend on a phone font containing a tick glyph.

Save editable copy preserves the populated invoice and selected checkmarks, so they remain visible in read-only HTML viewers. Editing a form still requires JavaScript; Files/WhatsApp previews cannot update an invoice when scripts are disabled. Save an editable copy or PDF from the interactive viewer before sharing.

Browser regression checks (requires Node.js and Playwright browser dependencies):

```sh
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install --with-deps chromium webkit
node scripts/test_preview.cjs
```

The GitHub Actions workflow runs these checks and retains screenshots, PDFs and saved HTML copies as test artifacts. See the top of `QA.md` for the current verification status.

## Selected-service pricing

Step 3 shows exactly one pricing card per checked service from Step 2, and an empty-state message when none are selected. Each card names the service and has its own description and rate placeholders. Description is optional: the service name appears on the invoice if it is left blank. Quantity starts at 1. A rate is required; zero is accepted for complimentary work. Unchecking excludes the line and its charge while retaining its entries for reselection. New invoice clears all retained entries.

The preview/PDF includes only selected services, in checklist order. Seven to ten lines use a compact table within the existing A4 area. Drafts and editable copies preserve the service-to-line association (snapshot version 2); older version-1 lines are matched to checked services in order.

Calculations use integer hundredths rather than floating-point currency accumulation: each quantity × rate line rounds to paise, then the subtotal is summed, a fixed rupee discount is deducted, and GST/tax is calculated on the remainder. Step 4 shows subtotal, discount applied, amount after discount, tax and grand total. Invalid/negative/oversized values, more than two decimal places, quantities of zero, GST above 100%, and discounts exceeding the subtotal block export with an explanation. A 100% discount and zero-priced work are supported.

Additional checks:

```sh
node scripts/test_invoice_math.cjs
node scripts/test_invoice_rows.cjs
node scripts/test_sync.cjs
```

## Preview workspace

With no services checked, the preview shows “No services selected” and PDF/print actions are disabled. Selecting a service reveals the invoice; removing the last service restores the empty state. On desktop screens wider than 900 px and at least 600 px tall, the workspace fills the viewport, only the form scrolls, and the preview fits the complete A4 page within both the available width and height. Zoom controls are hidden in that desktop mode to prevent a cropped or scrolling preview. Smaller screens retain the mobile page layout.

## Invoice logo

The top-left header block uses the supplied landscape Eden Studios artwork, rendered from the provided PDF at its native 960 × 540 resolution. It replaces the previous square promotional poster. The display box keeps the artwork's 16:9 aspect ratio; invoice/contact details remain on the right.

## Current offline download

The hosted page's **Download offline HTML** link serves `dist/Eden-Studios-Invoice.html`, rebuilt together with the root offline file. Both files are identical and self-contained. The workspace header and invoice preview both use the supplied official landscape artwork, embedded directly in the live page and offline HTML to avoid separate image-cache requests. Rebuild after changing artwork; the generator refreshes every `data-studio-artwork` image.

The workspace header displays only the supplied logo, without a repeated studio title or workspace subtitle. Page and invoice header backgrounds use black to match the artwork's existing dark backdrop.
