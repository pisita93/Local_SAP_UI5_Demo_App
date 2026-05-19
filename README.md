# Local SAP UI5 Demo App

A local SAPUI5 application that serves as a **catalog of demos** — small
OpenUI5 examples plus several enterprise Fiori prototypes embedded as
standalone pages.

The shell is built with OpenUI5 1.120 (`sap.m`, `sap.ui.layout`,
`themelib_sap_horizon`) and uses the standard UI5 CLI tooling. Prototype
demos imported from [Claude Design](https://claude.ai/design) are kept
as static React/Babel-standalone bundles and embedded into the catalog
via iframe.

## Quick start

```bash
npm install
npm run start     # ui5 serve  → http://localhost:8080
npm run build     # ui5 build --clean-dest → dist/
```

UI5 framework artifacts are pulled from the OpenUI5 CDN on first run
(see `ui5.yaml`).

## Demo catalog

The home page (`webapp/view/Home.view.xml`) lists every demo. Each one
is a separate route in `webapp/manifest.json` with its own view and
controller under `webapp/view/demos/` and `webapp/controller/demos/`.

### Native OpenUI5 demos

| Demo | Folder | What it shows |
|---|---|---|
| Forms & Inputs | `view/demos/FormsDemo.view.xml` | `sap.ui.layout.form` with labeled inputs, selects, switches, submit flow |
| Responsive Table | `view/demos/TableDemo.view.xml` | `sap.m.Table` with growing, search filter, `ObjectStatus`, `ObjectNumber` |
| Bar Chart | `view/demos/ChartDemo.view.xml` | Lightweight bar chart from `sap.m.ProgressIndicator` rows |

### Embedded Fiori prototypes (from Claude Design)

These demos are static HTML/CSS/JS prototypes generated with
[claude.ai/design](https://claude.ai/design). Each lives in its own
folder under `webapp/` and is loaded into the catalog through an iframe
controller.

| Demo | Prototype folder | Description |
|---|---|---|
| Sales BKK · Payment Settlement | `webapp/sales-bkk/` | Cashier, evidence, and admin settlement flows |
| Partner Portal · Master Data | `webapp/partner-portal/` | Customer/supplier master data with multi-level approval and credit review |
| Delivery Optimization & Tracking | `webapp/delivery-tracking/` | Truck-load grouping, proof-of-delivery capture, role-based status tracking |
| Sales Order Creation App | `webapp/sales-order/` | Sales order creation with line items, pricing, and summary |
| E-Tax Invoice Portal | `webapp/etax-invoice/` | Thai e-tax invoice worklist, billing creation, INET submission, master data |

Each prototype is self-contained: it ships its own CSS, web fonts,
React + Babel-standalone, and JSX modules. You can open any prototype
directly (`/<folder>/index.html`) or via the catalog tile.

## Project layout

```
webapp/
  Component.js, manifest.json, index.html, index.js
  view/
    App.view.xml, Home.view.xml
    demos/<DemoName>.view.xml          # one per route
  controller/
    App.controller.js, Home.controller.js
    demos/<DemoName>.controller.js     # iframe demos call setContent(...)
  i18n/
    i18n.properties, i18n_en.properties
  <prototype-folder>/                  # one per embedded Claude Design demo
    index.html, *.css, *.jsx, fonts/, assets/
```

## Adding a new Claude Design prototype

1. Copy the design bundle into `webapp/<new-folder>/`, renaming the
   primary HTML to `index.html`. Keep all relative paths intact
   (`fonts/`, `components/`, etc.).
2. Add a view (`webapp/view/demos/<Name>Demo.view.xml`) and a
   controller (`webapp/controller/demos/<Name>Demo.controller.js`) that
   embeds the prototype in an iframe — copy the pattern from
   `SalesBkkDemo` / `DeliveryTrackingDemo`.
3. Register the route and target in `webapp/manifest.json`.
4. Add a catalog tile entry in `webapp/controller/Home.controller.js`
   and matching i18n strings (`demo<Name>Title`, `demo<Name>Desc`,
   `demo<Name>OpenStandalone`) in both `i18n.properties` files.

## Branching

Active development happens on `Dev_On_ClaudeCode_Web`. `main` tracks
released work.

## License

Apache-2.0.
