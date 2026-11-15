# Logo asset cache refresh — 2026-11-15

- Confirmed main contains the landscape logo change and Vercel reports a completed deployment.
- Changed the live image URL to eden-logo-landscape.png and versioned invoice-layout.css. The earlier filename remains available for compatibility; the current page requests the new asset identity and CSS URL.
- Rebuilt the standalone offline HTML with the same new artwork embedded. Old downloaded HTML files and immutable older deployment URLs cannot be changed by this update.

# Updated top-left logo artwork — 2026-11-15

- Rendered the supplied one-page Eden Studios PDF to a 960 × 540 PNG and replaced the old square promotional image.
- The header displays the complete landscape artwork in a 330 × 185.625 native-pixel box, preserving 16:9 proportions. The box is contained in the left header region without overlapping the invoice/contact details.
- Inspected the PDF render. Rebuilt the standalone file and proportional static-preview stylesheet. Existing calculation, row-mapping, selection and fit checks pass. Full browser/PDF-export layout verification remains pending.

# Empty preview and desktop form-only scrolling — 2026-11-15

- Added a no-services preview empty state and hid the invoice/tools/live badge until a service is selected. Removing the last selection restores the empty state. Empty invoices cannot be exported or printed.
- Desktop layout uses a bounded viewport with independent form scrolling and a fixed preview panel. Page fitting now takes the smaller width/height ratio. Desktop zoom controls are hidden; mobile interaction and print layout remain separate.
- Unit checks pass for the empty/selected transitions, disabled export actions and three desktop width/height combinations (including zoom attempts), plus the existing calculation, service row and static-preview checks. Browser assertions for full-page containment and form-only scrolling were added; visual verification remains pending.

# Selected-service lines and calculation update — 2026-11-15

- Step 3 and the native invoice now contain only the services checked in Step 2 (0–10 lines). Each service retains its own description, quantity and rate across deselection/reselection. No selection gives zero rows and a clear empty state.
- Service-specific descriptions/rate hints, default quantity 1, optional description with service-name fallback, and disabled unselected inputs prevent stale unselected charges or validation errors.
- Amounts use integer hundredths: line rounding, subtotal, fixed discount, tax on the post-discount amount and total. Step 4 includes discount applied and taxable amount. Invalid, excessive and negative values produce errors and block export.
- Calculation, native invoice row mapping, selection/synchronization, no-script layout and fit unit checks pass. Browser regression coverage was updated for ten services; browser/PDF rendering and physical WhatsApp execution have not run in this environment.
- New drafts/editable copies use snapshot version 2. Version 1 rows are migrated to checked services in checklist order. GitHub remains unchanged pending authorization to publish the local branch.

# Script-free proportional page fit — 2026-11-14

- Replaced the fixed-scale/trigonometric no-script approach with proportional native HTML sizing. The logo, type, rows, borders and footer share one page-width unit generated from the original layout stylesheet.
- The preview stage reserves the full proportional 794 × 1123 page, so horizontal width and vertical extent match. Modern container units measure the actual wrapper; older engines use the matching viewport/grid formulas. Dark mode is unchanged.
- Static-layout conversion/geometry checks, JavaScript fitting checks and form synchronization checks pass. Physical Android/WhatsApp rendering remains unverified in this environment.

# Android static-preview width follow-up — 2026-11-14

- The supplied Android screenshot visibly includes the noscript notice. The fixed .3 fallback was narrower than the available preview width on that device.
- Added progressive CSS-only fitting with container width and supported trigonometric ratio conversion, so modern embedded viewers can fit the full A4 page without JavaScript. Script-driven zoom and fitting still take precedence when available. Older engines without these CSS features retain the small safe fallback.
- Preserved the viewer's dark-mode preference as requested. Moved the no-script notice beside the form and hid inactive PDF/zoom controls when scripting is disabled, rather than displaying a misleading live state.
- Geometry and form synchronization unit checks pass. CSS rendering and the physical Android viewer still require verification; they cannot be verified by the Node unit checks.

# iPhone clipped-preview follow-up — 2026-11-14

- User screenshot shows a clipped native-size invoice with an enlarged logo inside the preview frame. Removed the SVG/foreignObject wrapper added in the previous fix; the invoice now lives in a plain HTML div.
- Added a separate ES5-compatible fitting script before the form code. It measures usable width, applies standard/WebKit scale, and sets the matching stage height. Resize, orientation and pageshow handlers work without ResizeObserver. A small CSS fallback retains the complete invoice before scripts run.
- `node scripts/test_preview_fit.cjs` passes for six available widths, zoom, resize and missing ResizeObserver; `node scripts/test_sync.cjs` still passes for mobile API compatibility. Generated JavaScript passes syntax checks.
- Physical iPhone rendering is not verified here. These are geometry and synchronization unit checks, not screenshots from Safari or WhatsApp. The requested GitHub push remains blocked pending explicit user authorization.

# Form synchronization compatibility follow-up — 2026-11-14

- Removed Object.fromEntries from form synchronization, optional chaining/nullish coalescing from application/build output, and toggleAttribute from preview mark updates.
- Added blur, Preview-link and pageshow synchronization. Guarded font and logo resource APIs so their absence cannot interrupt form initialization.
- `node scripts/test_sync.cjs` passes with Object.fromEntries absent, localStorage blocked, and font/image/share APIs absent: customer, address, reference, checkbox selection/unselection, UPI and the ₹18,290 sample total all propagate.
- This reproduces a compatibility failure of the original form code, but does not establish the exact cause on the user's physical iPhone. Mobile browser/rendering tests remain unexecuted in this environment.

# Mobile/read-only preview fix — 2026-11-14

- Verified the source and rebuilt standalone file both contain ten matching service choices, four payment choices, all six table rows, and the responsive SVG viewBox.
- Source scripts, generated inline JavaScript and the browser regression script pass Node syntax checks. The offline build is reproducible and the diff has no whitespace errors.
- Added Chromium/WebKit regression coverage at 320, 375, 390, 430, 768 and 1440 px, with JavaScript enabled/disabled, selected/unselected ticks, totals, zoom, PDF generation and saved HTML reopening. The workflow saves screenshots and PDFs for review.
- **The new browser checks have not run.** Local Chromium launch is blocked by socket permissions, the available cloud browser cannot access the local server, and publishing the branch to run CI was blocked by automatic approval review. Physical iPhone/WhatsApp/Files testing is still required.
- The fixes preserve a full invoice in read-only HTML viewers, but interactive form changes require a viewer that executes JavaScript. Save editable copy or PDF from that viewer before sharing.

---

The following notes describe verification of the earlier implementation, before this fix.

# Current verification: native HTML invoice

## Structure and source

- The preview is an actual `article` with `data-template-kind="native-html"`, semantic headings, definition lists and one service table containing six rows.
- Inspected the live DOM: **zero canvases**, **zero CSS background images**, and **one image**, the cropped 420 × 411 Eden logo.
- The standalone HTML has no full-page invoice-image asset or reference, no external font/image/script links, and a policy prohibiting network calls.
- The original `dist/invoice-template.jpg` asset is removed from the current source tree. The only raster brand asset is `dist/eden-logo.png`.
- Inline JavaScript passes `node --check`.

## Live behavior

- Entered all supplied sample customer/bill fields, notes, terms, reference, signature and six service rows. Preview uses real updated text nodes and table cells.
- Subtotal ₹16,000; discount ₹500; 18% tax ₹2,790; total ₹18,290. Service and UPI checkmarks appear in HTML.
- Downloaded and reopened an editable HTML copy: invoice/customer fields and total restored, with exactly six service input rows and six invoice table rows.
- At a 390px embedded viewport: no horizontal body overflow; live customer, amounts and checkbox ticks update; 1.5× zoom works.
- Removed global smooth scrolling to keep focused form controls and checkbox interaction stable while moving between sections.

## Export and visual review

- Downloaded the PDF produced from the native HTML and rendered it with Poppler.
- Checked the full header, logo, SVG contact icons, bordered fields, service table, notes, totals, all six numbered terms, payment terms and signature/footer. No clipped or overlapping sample values.
- Terms numbers are real HTML spans so the direct PDF export includes them, rather than depending on browser list-marker pseudo-elements.
- Print CSS hides the app header and form while retaining the invoice header and native text.

## Limits

The reference design is recreated in HTML/CSS; it is not a pixel-identical raster reproduction. Direct PDF download is rasterized from the DOM, while native browser printing can preserve text. Physical iPhone Safari/local-file behavior and native share-sheet operation remain unverified. Local HTML requires a viewer that executes JavaScript and supports downloads.

## Added services and larger populated text

- Added two independent service keys (`score_sfx`, `voice_artist`) without removing existing service selections: ten form checkboxes and ten native HTML preview checkboxes.
- Selected both new options; both preview marks became ✓. Sample values had zero overflow warnings.
- Read computed font sizes: customer 12 px, description 12 px, subtotal 12.5 px, grand total 17.5 px. The old populated text was mostly 7–7.35 px.
- Increased field/cell heights, widened footer payment terms, added a third checklist row, and spaced the sections to retain one-page A4 output. Text fitting stops at 11 px.
- Generated and rendered the updated PDF; visually checked all ten service options, larger customer details, quantities/prices/amounts, totals, notes and footer.
- Reopened saved HTML: both new form checkboxes and preview ticks restored as selected; grand total remained ₹18,290.
- Mobile 390px viewport: both new checks update in preview, no horizontal body overflow and no fit warnings for the sample.
- Oversized customer value stops at 11 px and shows an overflow warning instead of silently shrinking further.
