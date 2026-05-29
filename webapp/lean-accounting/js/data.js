/* LEAN Accounting — SAC Story dataset.
   Reconstructed from the LEAN Accounting Data Flow / Box Score source.
   A Thai beverage manufacturer reporting two value streams: VS-UHT and VS-GLASS.
   Currency: THB millions. Units: thousands/day. */
window.LEAN_DATA = (function () {

  // ---- Box Score (value stream operational + financial) ----
  const boxScore = {
    streams: [
      { id: "uht",   name: "VS-UHT",   sub: "UHT carton lines" },
      { id: "glass", name: "VS-GLASS", sub: "Glass bottle lines" }
    ],
    sections: [
      {
        name: "Operational",
        rows: [
          { metric: "Units / day", unit: "000", better: "high", targetLabel: "120k · 90k",
            uht:   { n: 128, label: "128k", target: 120, status: "good" },
            glass: { n: 82,  label: "82k",  target: 90,  status: "watch" } },
          { metric: "On-time delivery", unit: "%", better: "high", targetLabel: "≥ 95%",
            uht:   { n: 94, label: "94%", target: 95, status: "watch" },
            glass: { n: 91, label: "91%", target: 95, status: "bad" } },
          { metric: "First-time-through", unit: "%", better: "high", targetLabel: "≥ 96%",
            uht:   { n: 97, label: "97%", target: 96, status: "good" },
            glass: { n: 93, label: "93%", target: 96, status: "watch" } },
          { metric: "Fill loss / breakage", unit: "%", better: "low", targetLabel: "< 3%",
            uht:   { n: 2.1, label: "2.1%", target: 3, status: "good" },
            glass: { n: 4.8, label: "4.8%", target: 3, status: "bad" } }
        ]
      },
      {
        name: "Capacity",
        rows: [
          { metric: "Productive capacity", unit: "%", better: "high", targetLabel: "≥ 85%",
            uht:   { n: 88, label: "88%", target: 85, status: "good" },
            glass: { n: 79, label: "79%", target: 85, status: "bad" } },
          { metric: "Idle capacity", unit: "%", better: "low", targetLabel: "< 15%",
            uht:   { n: 12, label: "12%", target: 15, status: "good" },
            glass: { n: 21, label: "21%", target: 15, status: "bad" } }
        ]
      },
      {
        name: "Financial",
        rows: [
          { metric: "Revenue", unit: "THB m", better: "high", targetLabel: "Trend ↑",
            uht:   { n: 42.0, label: "THB 42.0m", target: 40, status: "good" },
            glass: { n: 31.5, label: "THB 31.5m", target: 33, status: "watch" } },
          { metric: "Material cost", unit: "THB m", better: "low", targetLabel: "≤ plan",
            uht:   { n: 24.5, label: "THB 24.5m", target: 25, status: "good" },
            glass: { n: 20.6, label: "THB 20.6m", target: 19, status: "watch" } },
          { metric: "Return on sales", unit: "%", better: "high", targetLabel: "> 10%",
            uht:   { n: 12.5, label: "12.5%", target: 10, status: "good" },
            glass: { n: 8.2,  label: "8.2%",  target: 10, status: "watch" } }
        ]
      }
    ],
    // headline numeric-point tiles
    kpis: [
      { t: "Net Revenue", s: "This period · THB m", num: "73.5", delta: "+6.2%", dir: "pos", pl: "+4.3m", spark: [58,60,59,63,62,66,68,67,70,71,72,73] },
      { t: "Return on Sales", s: "Blended · vs 10% target", num: "10.6%", delta: "+0.4pp", dir: "pos", pl: "above tgt", spark: [9.2,9.4,9.5,9.7,9.8,10.0,10.1,10.2,10.3,10.4,10.5,10.6] },
      { t: "On-time Delivery", s: "Blended · vs 95% target", num: "92.5%", delta: "−2.5pp", dir: "neg", pl: "below tgt", spark: [94,93.5,93,93.2,92.8,92.6,92.4,92.5,92.3,92.4,92.5,92.5] },
      { t: "Idle Capacity", s: "Blended · vs 15% target", num: "16.5%", delta: "+1.5pp", dir: "neg", pl: "above tgt", spark: [14,14.5,15,15.4,15.8,16,16.2,16.4,16.5,16.6,16.5,16.5] }
    ]
  };

  // ---- Metric Time Sequence (weekly trend vs target) ----
  const weeks = ["W1","W2","W3","W4","W5","W6","W7","W8"];
  const trend = {
    weeks,
    metrics: [
      { name: "Units / day", unit: "000", suffix: "k", better: "high",
        uhtTarget: 120, glassTarget: 90,
        uht:   [112,118,121,124,120,126,128,130],
        glass: [78, 80, 83, 79, 82, 84, 82, 85] },
      { name: "On-time delivery", unit: "%", suffix: "%", better: "high",
        uhtTarget: 95, glassTarget: 95,
        uht:   [92,93,94,95,94,93,94,95],
        glass: [88,89,90,91,90,91,91,92] },
      { name: "First-time-through", unit: "%", suffix: "%", better: "high",
        uhtTarget: 96, glassTarget: 96,
        uht:   [95,96,96,97,97,96,97,98],
        glass: [91,92,93,92,93,94,93,94] }
    ]
  };

  // ---- Analytic Dashboard (drill by dimension) ----
  // rev / mat in THB m, ros %. signal: ok | warn | bad
  const slices = {
    "Value stream": {
      explain: "Compares VS-UHT and VS-GLASS as the primary management view. Signal: VS-GLASS carries lower ROS and higher idle capacity — improvement focus.",
      impact: "If profit center is wrong on a material, revenue and cost surface under the wrong value stream and the margin conclusion is wrong.",
      rows: [
        { name: "VS-UHT",   rev: 42.0, mat: 24.5, ros: 12.5, signal: "ok" },
        { name: "VS-GLASS", rev: 31.5, mat: 20.6, ros: 8.2,  signal: "warn" }
      ]
    },
    "Brand": {
      explain: "Brand-level analysis shows whether one brand is carrying another brand's margin pressure inside a shared value stream.",
      impact: "If brand is missing or inconsistent on the material master, brand profitability becomes incomplete.",
      rows: [
        { name: "Vitamilk", rev: 38.5, mat: 22.1, ros: 13.1, signal: "ok" },
        { name: "V-Soy",    rev: 25.0, mat: 16.8, ros: 9.0,  signal: "warn" },
        { name: "Vamino",   rev: 10.0, mat: 6.2,  ros: 7.4,  signal: "bad" }
      ]
    },
    "Product type": {
      explain: "Product type links the physical production logic (carton vs. bottle) with financial performance.",
      impact: "If product type is not maintained, operational loss cannot be connected cleanly to the financial result.",
      rows: [
        { name: "UHT carton",  rev: 42.0, mat: 24.5, ros: 12.5, signal: "ok" },
        { name: "Glass bottle", rev: 31.5, mat: 20.6, ros: 8.2, signal: "warn" }
      ]
    },
    "Recipe family": {
      explain: "Recipe family explains yield, complexity, and cost differences across formulas.",
      impact: "If recipe family is not aligned, the team cannot identify which formula drives high loss.",
      rows: [
        { name: "Base soymilk",    rev: 28.0, mat: 16.4, ros: 12.0, signal: "ok" },
        { name: "Premium protein", rev: 19.5, mat: 12.9, ros: 8.6,  signal: "warn" },
        { name: "Flavored recipe", rev: 15.0, mat: 9.7,  ros: 10.1, signal: "ok" }
      ]
    },
    "Pack / variant": {
      explain: "Pack economics shows whether 250ml, 180ml, 1L glass or ToGo formats perform differently.",
      impact: "If pack/variant coding is loose, the team misreads which format earns or destroys margin.",
      rows: [
        { name: "250ml UHT", rev: 18.2, mat: 10.4, ros: 11.8, signal: "ok" },
        { name: "180ml UHT", rev: 23.8, mat: 13.8, ros: 11.2, signal: "ok" },
        { name: "1L glass",  rev: 17.5, mat: 11.4, ros: 7.9,  signal: "warn" },
        { name: "ToGo PET",  rev: 14.0, mat: 9.6,  ros: 6.8,  signal: "bad" }
      ]
    },
    "Market": {
      explain: "Domestic vs. export split. Export carries higher freight and pricing complexity.",
      impact: "If customer country is incorrect, the domestic/export split misleads pricing and freight decisions.",
      rows: [
        { name: "Domestic", rev: 48.0, mat: 28.1, ros: 11.0, signal: "ok" },
        { name: "Export",   rev: 25.5, mat: 17.0, ros: 8.4,  signal: "warn" }
      ]
    },
    "Sales channel": {
      explain: "Channel mix shows cost-to-serve differences across modern trade, traditional trade, export and food service.",
      impact: "If sales channel is not captured, channel profitability and cost-to-serve cannot be compared.",
      rows: [
        { name: "Modern trade",      rev: 30.0, mat: 17.2, ros: 12.2, signal: "ok" },
        { name: "Traditional trade", rev: 22.5, mat: 13.6, ros: 9.6,  signal: "warn" },
        { name: "Export",            rev: 15.0, mat: 10.1, ros: 8.1,  signal: "warn" },
        { name: "Food service",      rev: 6.0,  mat: 3.9,  ros: 7.0,  signal: "bad" }
      ]
    }
  };

  // ---- Portfolio (BCG growth-share matrix) ----
  // x = relative market share (0 low → 100 high), y = market growth (0 low → 100 high)
  // size = relative number of active products; profit = healthy | moderate | thin
  const bcg = {
    brands: [
      { name: "Vitaplus",       x: 56, y: 84, size: 24, profit: "thin",     quadrant: "Stars",          products: 6,  rev: 6.5,  ros: 6.4,
        note: "Good market position but thin margin; review pricing, mix, or cost drivers." },
      { name: "V-Soy",          x: 70, y: 74, size: 54, profit: "moderate", quadrant: "Stars",          products: 14, rev: 25.0, ros: 9.0,
        note: "Strong growth and share; support growth while monitoring cost-to-serve and capacity pressure." },
      { name: "Vitamilk Champ", x: 46, y: 62, size: 24, profit: "moderate", quadrant: "Question Marks",  products: 5,  rev: 7.8,  ros: 8.7,
        note: "Growth opportunity with weaker share; evaluate whether investment can create scale." },
      { name: "Base soymilk",   x: 60, y: 23, size: 26, profit: "moderate", quadrant: "Dogs",           products: 7,  rev: 9.2,  ros: 8.0,
        note: "Low growth and weak share; consider simplification or SKU rationalization." },
      { name: "Vitamilk",       x: 74, y: 37, size: 76, profit: "healthy",  quadrant: "Cash Cows",      products: 22, rev: 38.5, ros: 13.1,
        note: "Large profitable brand; protect margin and use stable cash flow to fund improvement." },
      { name: "Vamino",         x: 86, y: 25, size: 34, profit: "healthy",  quadrant: "Cash Cows",      products: 9,  rev: 10.0, ros: 7.4,
        note: "Profitable niche; maintain focused support and operational efficiency." }
    ],
    quadrantInfo: {
      "All":            "Compare brand position and profit quality. Large green Cash Cow or Star bubbles are commercially meaningful and financially healthy; red or amber bubbles show where growth/share does not fully translate into profit quality.",
      "Stars":          "High-growth brands with strong share. Focus: support growth while preventing margin erosion.",
      "Cash Cows":      "Strong share in lower-growth categories. Focus: protect margin and use stable contribution wisely.",
      "Question Marks": "Growth opportunity but weaker share. Focus: decide whether to invest, reposition, or limit exposure.",
      "Dogs":           "Low growth and weak share. Focus: simplification, SKU rationalization, or selective support."
    }
  };

  // ---- filters per page (Fiori filter bar) ----
  const filters = {
    boxscore: [
      { label: "Value Stream", value: "(All)", options: ["(All)", "VS-UHT", "VS-GLASS"] },
      { label: "Category", value: "Actual", options: ["Actual", "Plan", "Forecast"] },
      { label: "Period", value: "Jun 2026", options: ["Jun 2026", "May 2026", "Q2 2026", "FY 2026"] },
      { label: "Plant", value: "(All)", options: ["(All)", "Bangkok", "Rayong"] }
    ],
    trend: [
      { label: "Value Stream", value: "(All)", options: ["(All)", "VS-UHT", "VS-GLASS"] },
      { label: "Category", value: "Actual", options: ["Actual", "Plan"] },
      { label: "Period", value: "Last 8 weeks", options: ["Last 8 weeks", "Last 13 weeks", "Quarter"] }
    ],
    analytic: [
      { label: "Category", value: "Actual", options: ["Actual", "Plan", "Forecast"] },
      { label: "Period", value: "Jun 2026", options: ["Jun 2026", "Q2 2026", "FY 2026"] },
      { label: "Market", value: "(All)", options: ["(All)", "Domestic", "Export"] }
    ],
    portfolio: [
      { label: "Category", value: "Actual", options: ["Actual", "Plan"] },
      { label: "Period", value: "FY 2026", options: ["FY 2026", "FY 2025"] }
    ]
  };

  return {
    appTitle: "LEAN Accounting",
    pages: [
      { id: "boxscore",  name: "Box Score",            title: "Box Score — Value Stream Performance" },
      { id: "trend",     name: "Metric Time Sequence", title: "Metric Time Sequence — Weekly vs. Target" },
      { id: "analytic",  name: "Analytic Dashboard",   title: "Analytic Dashboard — Profitability Drill-down" },
      { id: "portfolio", name: "Portfolio",            title: "Portfolio — Brand Growth-Share Matrix" }
    ],
    boxScore, trend, slices, bcg, filters
  };
})();
