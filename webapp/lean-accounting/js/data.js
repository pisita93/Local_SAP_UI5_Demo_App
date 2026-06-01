/* LEAN Accounting — SAC Story dataset.
   Source: GreenSpot_Integrated_Demo_Dataset.xlsx → "VS Box Score (Mock)" sheet
   (authoritative box-score numbers) + "Material Master" (93 SKUs, BCG per SKU)
   reconciled to the box-score financial anchors (VS-UHT 188m, VS-ToGo 72m).
   Green Spot Co., Ltd · Period May 2026 · THB million / month unless noted.
   Two value streams: VS-UHT (UHT carton, Rangsit) and VS-ToGo (glass bottle,
   Rangsit + Nong Kae). 90 finished SKUs (44 domestic / 46 export). FICTIONAL
   demo data; profit/ROS/margins are formula-driven from the sheet's inputs. */
window.LEAN_DATA = (function () {

  // ---- Box Score (value stream operational + financial) ----
  const boxScore = {
    streams: [
      { id: "uht",  name: "VS-UHT",  sub: "UHT carton · Rangsit" },
      { id: "togo", name: "VS-ToGo", sub: "Glass bottle · Rangsit + Nong Kae" }
    ],
    sections: [
      {
        name: "Operational",
        rows: [
          { metric: "On-time-in-full (OTIF)", unit: "%", better: "high", targetLabel: "97 · 95",
            uht:  { n: 96.8, label: "96.8%", target: 97, status: "watch" },
            togo: { n: 92.5, label: "92.5%", target: 95, status: "watch" } },
          { metric: "Units / day", unit: "000", better: "high", targetLabel: "135 · 95",
            uht:  { n: 142, label: "142k", target: 135, status: "good" },
            togo: { n: 92,  label: "92k",  target: 95,  status: "watch" } },
          { metric: "First-pass quality (FTT)", unit: "%", better: "high", targetLabel: "98 · 97",
            uht:  { n: 98.2, label: "98.2%", target: 98, status: "good" },
            togo: { n: 95.0, label: "95.0%", target: 97, status: "watch" } },
          { metric: "Dock-to-dock", unit: "days", better: "low", targetLabel: "3 · 4",
            uht:  { n: 3.1, label: "3.1", target: 3, status: "watch" },
            togo: { n: 4.8, label: "4.8", target: 4, status: "bad" } },
          { metric: "Fill loss / breakage", unit: "%", better: "low", targetLabel: "3 · 3",
            uht:  { n: 2.1, label: "2.1%", target: 3, status: "good" },
            togo: { n: 4.8, label: "4.8%", target: 3, status: "bad" } }
        ]
      },
      {
        name: "Capacity",
        sub: "% of available",
        rows: [
          { metric: "Productive", unit: "%", better: "high", targetLabel: "65 · 60",
            uht:  { n: 64, label: "64%", target: 65, status: "watch" },
            togo: { n: 52, label: "52%", target: 60, status: "bad" } },
          { metric: "Non-productive", unit: "%", better: "low", targetLabel: "20 · 25",
            uht:  { n: 21, label: "21%", target: 20, status: "watch" },
            togo: { n: 33, label: "33%", target: 25, status: "bad" } },
          { metric: "Available (idle)", unit: "%", better: "neutral", targetLabel: "15 · 15",
            uht:  { n: 15, label: "15%", target: 15, status: "good" },
            togo: { n: 15, label: "15%", target: 15, status: "good" } }
        ]
      },
      {
        name: "Financial",
        sub: "THB million / month",
        rows: [
          { metric: "Revenue", unit: "THB m", better: "high", targetLabel: "185 · 78",
            uht:  { n: 188, label: "188", target: 185, status: "good" },
            togo: { n: 72,  label: "72",  target: 78,  status: "watch" } },
          { metric: "Material cost", unit: "THB m", better: "low", targetLabel: "104 · 42",
            uht:  { n: 105, label: "105", target: 104, status: "watch" },
            togo: { n: 41,  label: "41",  target: 42,  status: "good" } },
          { metric: "Conversion cost", unit: "THB m", better: "low", targetLabel: "43 · 20",
            uht:  { n: 42,   label: "42",   target: 43, status: "good" },
            togo: { n: 22.5, label: "22.5", target: 20, status: "bad" } },
          { metric: "Value-stream profit", unit: "THB m", better: "high", targetLabel: "38 · 16", emphasis: true,
            uht:  { n: 41,  label: "41.0", target: 38, status: "good" },
            togo: { n: 8.5, label: "8.5",  target: 16, status: "bad" } },
          { metric: "Return on sales", unit: "%", better: "high", targetLabel: "20.5 · 20.5", emphasis: true,
            uht:  { n: 21.8, label: "21.8%", target: 20.5, status: "good" },
            togo: { n: 11.8, label: "11.8%", target: 20.5, status: "bad" } },
          { metric: "Inventory (days of stock)", unit: "days", better: "low", targetLabel: "10 · 15",
            uht:  { n: 11, label: "11", target: 10, status: "watch" },
            togo: { n: 22, label: "22", target: 15, status: "bad" } }
        ]
      }
    ],
    // headline company-level tiles
    kpis: [
      { t: "Net Revenue", s: "THB m / month · vs 263 plan", num: "260", delta: "−1.1% vs plan", dir: "neg", pl: "blended", spark: [248,250,252,255,254,258,259,256,260,261,259,260] },
      { t: "Value-Stream Profit", s: "THB m · before sustaining", num: "49.5", delta: "ROS 19.0%", dir: "pos", pl: "UHT-led", spark: [44,45,46,47,46,48,49,48,49,50,49,49.5] },
      { t: "Company Op. Profit", s: "after THB 20m sustaining", num: "29.5", delta: "11.3% margin", dir: "pos", pl: "month", spark: [24,25,26,27,26,28,29,28,29,30,29,29.5] },
      { t: "OTIF (blended)", s: "vs 96.4% target", num: "95.6%", delta: "−0.8pp", dir: "neg", pl: "ToGo drag", spark: [94.8,95.0,95.2,95.5,95.3,95.7,95.4,95.6,95.5,95.6,95.5,95.6] }
    ],
    // company bridge: VS profits less sustaining = operating profit
    bridge: [
      { label: "VS-UHT profit", value: 41, type: "pos" },
      { label: "VS-ToGo profit", value: 8.5, type: "pos" },
      { label: "Sustaining costs", value: -20, type: "neg", note: "corporate, R&D, IT/Finance, idle occupancy" },
      { label: "Company op. profit", value: 29.5, type: "total" }
    ],
    // orthogonal cut of company total
    market: [
      { name: "Domestic", rev: 182, profit: 44,  ros: 24.2, share: 70, yoy: "+1.2%", dir: "pos" },
      { name: "Export",   rev: 78,  profit: 5.5, ros: 7.1,  share: 30, yoy: "−14.5%", dir: "neg" }
    ],
    marketTotal: { rev: 260, profit: 49.5, ros: 19.0 },
    // VS by plant — each value stream followed by its plants (UHT is Rangsit-only)
    vsByPlant: {
      groups: [
        { stream: "VS-UHT", total: { rev: 188, profit: 41, ros: 21.8 }, rows: [
          { name: "Rangsit Factory", rev: 188, profit: 41, ros: 21.8, productive: 64, otif: 96.8 }
        ]},
        { stream: "VS-ToGo", total: { rev: 72, profit: 8.5, ros: 11.8 }, rows: [
          { name: "Rangsit Factory",  rev: 45, profit: 6.5, ros: 14.4, productive: 58, otif: 94 },
          { name: "Nong Kae Factory", rev: 27, profit: 2,   ros: 7.4,  productive: 43, otif: 90 }
        ]}
      ],
      grandTotal: { rev: 260, profit: 49.5, ros: 19.0 }
    }
  };

  // capacity utilisation (% of available) for the stacked-bar widget
  boxScore.capacityUtil = {
    rows: [
      { name: "VS-UHT",        productive: 64, nonproductive: 21, available: 15 },
      { name: "VS-ToGo",       productive: 52, nonproductive: 33, available: 15 },
      { name: "Company total", productive: 61, nonproductive: 24, available: 15 }
    ],
    lever: "VS-ToGo carries 33% non-productive capacity. Converting half of it frees ~16pp of capacity — enough to serve growing export demand without a capex line addition."
  };

  // ---- Metric Time Sequence (weekly trend vs target) ----
  const weeks = ["W1","W2","W3","W4","W5","W6","W7","W8"];
  const trend = {
    weeks,
    metrics: [
      { name: "On-time-in-full (OTIF)", unit: "%", suffix: "%", better: "high", real: true,
        uhtTarget: 97, togoTarget: 95,
        uht:  [95.8, 96.2, 96.0, 96.7, 96.4, 96.9, 96.5, 96.8],
        togo: [90.8, 91.5, 90.2, 92.0, 91.6, 92.2, 92.0, 92.5] },
      { name: "First-pass quality (FTT)", unit: "%", suffix: "%", better: "high",
        uhtTarget: 98, togoTarget: 97,
        uht:  [97.5, 97.8, 98.0, 98.1, 97.9, 98.3, 98.0, 98.2],
        togo: [94.0, 94.3, 94.6, 94.8, 94.5, 95.1, 94.8, 95.0] },
      { name: "Productive capacity", unit: "%", suffix: "%", better: "high",
        uhtTarget: 65, togoTarget: 60,
        uht:  [62, 63, 64, 65, 63, 64, 64, 64],
        togo: [50, 51, 53, 52, 51, 53, 52, 52] }
    ]
  };

  // ---- Analytic Dashboard — Financial dimension drill ----
  // rev (THB m) and ros (%) allocated from box-score anchors by SKU/stream mix;
  // star/cow/qm/dog are REAL BCG counts from the Material Master.
  const slices = {
    "Value stream": {
      explain: "VS-UHT carries the revenue (THB 188m) and the margin (21.8% ROS) — 27 of its 44 SKUs are Stars, but it also holds 9 Dogs and 7 Question Marks. VS-ToGo is the mature volume base: 38 of 46 SKUs are Cash Cows, yet ROS is only 11.8% under cost and capacity pressure.",
      impact: "If pack type / profit centre is wrong on a material, revenue and cost surface under the wrong value stream and the margin conclusion is wrong.",
      rows: [
        { name: "VS-UHT",  skus: 44, rev: 188.0, ros: 21.8, star: 27, cow: 1,  qm: 7, dog: 9, signal: "ok" },
        { name: "VS-ToGo", skus: 46, rev: 72.0,  ros: 11.8, star: 4,  cow: 38, qm: 3, dog: 1, signal: "bad" }
      ]
    },
    "Brand": {
      explain: "Vitamilk is the anchor (51 SKUs, THB 126m) but blends a long tail — 10 Question Marks and 7 Dogs dilute its 17.6% ROS. V-Soy is almost all Stars (24 of 25) and the highest-margin brand at 21.0%. Vamino is a small Cash-Cow export niche.",
      impact: "If brand (Material Group 2) is missing or inconsistent on the material master, brand profitability becomes incomplete.",
      rows: [
        { name: "Vitamilk",       skus: 51, rev: 125.9, ros: 17.6, star: 2,  cow: 32, qm: 10, dog: 7, signal: "warn" },
        { name: "V-Soy",          skus: 25, rev: 93.3,  ros: 21.0, star: 24, cow: 0,  qm: 0,  dog: 1, signal: "ok" },
        { name: "Vitamilk Champ", skus: 4,  rev: 17.1,  ros: 21.8, star: 2,  cow: 0,  qm: 0,  dog: 2, signal: "ok" },
        { name: "Vitaplus",       skus: 3,  rev: 12.8,  ros: 21.8, star: 3,  cow: 0,  qm: 0,  dog: 0, signal: "ok" },
        { name: "Vamino",         skus: 7,  rev: 11.0,  ros: 11.8, star: 0,  cow: 7,  qm: 0,  dog: 0, signal: "bad" }
      ]
    },
    "Market": {
      explain: "Domestic and Export carry similar SKU counts, but Export holds 7 Dogs and is shrinking (−14.5% YoY volume). Domestic holds all 10 Question Marks — local launches still proving out.",
      impact: "If customer country / sales org is incorrect, the Domestic vs Export split misleads pricing and freight decisions.",
      rows: [
        { name: "Domestic", skus: 44, rev: 136.6, ros: 19.6, star: 15, cow: 16, qm: 10, dog: 3, signal: "ok" },
        { name: "Export",   skus: 46, rev: 123.4, ros: 18.4, star: 16, cow: 23, qm: 0,  dog: 7, signal: "ok" }
      ]
    },
    "Plant": {
      explain: "Rangsit runs both streams and 70 of the 93 SKUs at strong 20.2% ROS. Nong Kae is ToGo-only, smaller and dilutive at 11.8% — the productive-capacity gap (43% vs Rangsit's 58%) shows up directly in margin.",
      impact: "If plant assignment is wrong on the material, capacity and conversion cost land on the wrong site.",
      rows: [
        { name: "Rangsit",  skus: 70, rev: 224.0, ros: 20.2, star: 28, cow: 23, qm: 9, dog: 10, signal: "ok" },
        { name: "Nong Kae", skus: 23, rev: 36.0,  ros: 11.8, star: 3,  cow: 19, qm: 1, dog: 0,  signal: "bad" }
      ]
    },
    "Pack size": {
      explain: "300ml is the portfolio backbone (48 SKUs, almost all ToGo Cash Cows) but its 13.3% ROS is the lowest — high volume, thin margin. The UHT-heavy 1L, 200ml and 180ml formats earn the full 21.8% stream margin.",
      impact: "If pack/size coding is loose, the team misreads which format earns or destroys margin.",
      rows: [
        { name: "300ml",  skus: 48, rev: 83.3, ros: 13.3, star: 4, cow: 38, qm: 3, dog: 3, signal: "bad" },
        { name: "1000ml", skus: 11, rev: 47.0, ros: 21.8, star: 9, cow: 0,  qm: 0, dog: 2, signal: "ok" },
        { name: "200ml",  skus: 10, rev: 42.7, ros: 21.8, star: 5, cow: 0,  qm: 5, dog: 0, signal: "ok" },
        { name: "180ml",  skus: 9,  rev: 38.5, ros: 21.8, star: 8, cow: 1,  qm: 0, dog: 0, signal: "ok" },
        { name: "250ml",  skus: 5,  rev: 18.7, ros: 21.0, star: 0, cow: 0,  qm: 2, dog: 3, signal: "ok" },
        { name: "Other",  skus: 10, rev: 29.8, ros: 18.5, star: 5, cow: 3,  qm: 0, dog: 2, signal: "ok" }
      ]
    },
    "Sugar level": {
      explain: "No-sugar SKUs are Star-heavy (12 of 15) and earn the full UHT margin — the growth bet is also margin-accretive. High-sugar (>8%) is all Cash Cows at the diluted 11.8% ToGo margin.",
      impact: "If the sugar attribute is not maintained, the health-positioning mix cannot be tied to its financial result.",
      rows: [
        { name: "Low (0-5%)",    skus: 40, rev: 111.3, ros: 18.7, star: 13, cow: 17, qm: 8, dog: 2, signal: "ok" },
        { name: "Medium (5-8%)", skus: 28, rev: 81.7,  ros: 19.1, star: 6,  cow: 12, qm: 2, dog: 8, signal: "ok" },
        { name: "No sugar",      skus: 15, rev: 51.3,  ros: 21.8, star: 12, cow: 3,  qm: 0, dog: 0, signal: "ok" },
        { name: "High (>8%)",    skus: 10, rev: 15.7,  ros: 11.8, star: 0,  cow: 10, qm: 0, dog: 0, signal: "bad" }
      ]
    }
  };

  // VS-UHT profitability by channel (real, from the box score sheet)
  const channelDrill = {
    title: "VS-UHT profitability by channel",
    note: "Revenue & direct material in THB m / month · margin after material",
    rows: [
      { name: "Modern Trade",      rev: 92, mat: 52, margin: 43.5, signal: "ok" },
      { name: "Traditional Trade", rev: 50, mat: 29, margin: 42.0, signal: "ok" },
      { name: "HoReCa",            rev: 14, mat: 8,  margin: 42.9, signal: "warn" },
      { name: "Export",            rev: 22, mat: 13, margin: 40.9, signal: "warn" },
      { name: "E-Commerce",        rev: 10, mat: 5,  margin: 50.0, signal: "ok" }
    ],
    total: { rev: 188, mat: 107 }
  };

  // VS-ToGo profitability by channel (analogous to VS-UHT; reconciled to 72m / 41m)
  const channelDrillToGo = {
    title: "VS-ToGo profitability by channel",
    note: "Revenue & direct material in THB m / month · margin after material",
    rows: [
      { name: "Modern Trade",      rev: 30, mat: 17,  margin: 43.3, signal: "ok" },
      { name: "Traditional Trade", rev: 20, mat: 11,  margin: 45.0, signal: "ok" },
      { name: "HoReCa",            rev: 6,  mat: 3.5, margin: 41.7, signal: "warn" },
      { name: "Export",            rev: 12, mat: 7,   margin: 41.7, signal: "warn" },
      { name: "E-Commerce",        rev: 4,  mat: 2.5, margin: 37.5, signal: "warn" }
    ],
    total: { rev: 72, mat: 41 }
  };

  // ---- Metric drill-downs (operational / capacity) ----
  // Each metric carries multiple breakdown MODES the user can switch between.
  // Real per-stream + plant anchors from the box score; channel & line sub-rows
  // illustrative but reconciled to each stream's box-score actual.
  const metricDrills = {
    operational: [
      {
        metric: "On-time-in-full (OTIF)", suffix: "%", better: "high",
        modes: [
          { id: "channel", label: "By Channel", additive: false, streams: [
            { name: "VS-UHT", label: "96.8%", total: 96.8, target: 97, status: "watch", rows: [
              { name: "Modern Trade",      n: 97.5, label: "97.5%" },
              { name: "Traditional Trade", n: 96.2, label: "96.2%" },
              { name: "HoReCa",            n: 95.0, label: "95.0%" },
              { name: "Export",            n: 96.0, label: "96.0%" },
              { name: "E-Commerce",        n: 98.0, label: "98.0%" }
            ]},
            { name: "VS-ToGo", label: "92.5%", total: 92.5, target: 95, status: "watch", rows: [
              { name: "Modern Trade",      n: 93.5, label: "93.5%" },
              { name: "Traditional Trade", n: 92.0, label: "92.0%" },
              { name: "HoReCa",            n: 90.5, label: "90.5%" },
              { name: "Export",            n: 91.5, label: "91.5%" },
              { name: "E-Commerce",        n: 94.0, label: "94.0%" }
            ]}
          ]},
          { id: "plant", label: "By Plant", additive: false, streams: [
            { name: "VS-UHT", label: "96.8%", total: 96.8, target: 97, status: "watch", rows: [
              { name: "Rangsit Factory", n: 96.8, label: "96.8%" }
            ]},
            { name: "VS-ToGo", label: "92.5%", total: 92.5, target: 95, status: "watch", rows: [
              { name: "Rangsit Factory",  n: 94.0, label: "94.0%" },
              { name: "Nong Kae Factory", n: 90.0, label: "90.0%" }
            ]}
          ]}
        ]
      },
      {
        metric: "First-pass quality (FTT)", suffix: "%", better: "high",
        modes: [
          { id: "plant", label: "By Plant", additive: false, streams: [
            { name: "VS-UHT", label: "98.2%", total: 98.2, target: 98, status: "good", rows: [
              { name: "Rangsit Factory", n: 98.2, label: "98.2%" }
            ]},
            { name: "VS-ToGo", label: "95.0%", total: 95.0, target: 97, status: "watch", rows: [
              { name: "Rangsit Factory",  n: 96.0, label: "96.0%" },
              { name: "Nong Kae Factory", n: 93.8, label: "93.8%" }
            ]}
          ]},
          { id: "line", label: "By Production Line", additive: false, streams: [
            { name: "VS-UHT", label: "98.2%", total: 98.2, target: 98, status: "good", rows: [
              { name: "Rangsit · UHT Line A", n: 98.6, label: "98.6%" },
              { name: "Rangsit · UHT Line B", n: 97.8, label: "97.8%" }
            ]},
            { name: "VS-ToGo", label: "95.0%", total: 95.0, target: 97, status: "watch", rows: [
              { name: "Rangsit · ToGo Line 1",  n: 96.2, label: "96.2%" },
              { name: "Rangsit · ToGo Line 2",  n: 95.8, label: "95.8%" },
              { name: "Nong Kae · ToGo Line 3", n: 93.8, label: "93.8%" }
            ]}
          ]}
        ]
      }
    ],
    capacity: [
      {
        metric: "Productive capacity", suffix: "%", better: "high",
        modes: [
          { id: "plant", label: "By Plant", additive: false, streams: [
            { name: "VS-UHT", label: "64%", total: 64, target: 65, status: "watch", rows: [
              { name: "Rangsit Factory", n: 64, label: "64%" }
            ]},
            { name: "VS-ToGo", label: "52%", total: 52, target: 60, status: "bad", rows: [
              { name: "Rangsit Factory",  n: 58, label: "58%" },
              { name: "Nong Kae Factory", n: 43, label: "43%" }
            ]}
          ]},
          { id: "line", label: "By Production Line", additive: false, streams: [
            { name: "VS-UHT", label: "64%", total: 64, target: 65, status: "watch", rows: [
              { name: "Rangsit · UHT Line A", n: 67, label: "67%" },
              { name: "Rangsit · UHT Line B", n: 61, label: "61%" }
            ]},
            { name: "VS-ToGo", label: "52%", total: 52, target: 60, status: "bad", rows: [
              { name: "Rangsit · ToGo Line 1",  n: 60, label: "60%" },
              { name: "Rangsit · ToGo Line 2",  n: 56, label: "56%" },
              { name: "Nong Kae · ToGo Line 3", n: 43, label: "43%" }
            ]}
          ]}
        ]
      },
      {
        metric: "Idle / non-productive", suffix: "%", better: "low",
        modes: [
          { id: "reason", label: "By Reason", additive: true, streams: [
            { name: "VS-UHT", label: "36%", total: 36, target: 35, status: "watch", rows: [
              { name: "Non-productive (changeover, breakdown)", n: 21, label: "21%" },
              { name: "Available (idle)",                       n: 15, label: "15%" }
            ]},
            { name: "VS-ToGo", label: "48%", total: 48, target: 40, status: "bad", rows: [
              { name: "Non-productive (changeover, breakdown)", n: 33, label: "33%" },
              { name: "Available (idle)",                       n: 15, label: "15%" }
            ]}
          ]}
        ]
      }
    ]
  };

  // ---- Portfolio (BCG growth-share matrix) — real brand BCG + SKU counts ----
  const bcg = {
    brands: [
      { name: "Vitamilk",       x: 82, y: 30, size: 51, profit: "moderate", quadrant: "Cash Cows",      products: 51, rev: 125.9, ros: 17.6,
        note: "Core domestic volume & margin. 51 SKUs, mostly Cash Cows, but a long tail of 10 Question Marks and 7 Dogs dilutes ROS — rationalize the tail, protect the core." },
      { name: "V-Soy",          x: 58, y: 82, size: 25, profit: "healthy",  quadrant: "Stars",          products: 25, rev: 93.3,  ros: 21.0,
        note: "Premium / functional growth. Almost entirely Stars (24 of 25) and the highest-margin brand at 21.0% ROS — fund the growth." },
      { name: "Vitamilk Champ", x: 40, y: 74, size: 4,  profit: "healthy",  quadrant: "Stars",          products: 4,  rev: 17.1,  ros: 21.8,
        note: "Kids functional, lactose-free. Small Star line at full UHT margin — clear opportunity to scale distribution." },
      { name: "Vitaplus",       x: 30, y: 60, size: 3,  profit: "moderate", quadrant: "Question Marks",  products: 3,  rev: 12.8,  ros: 21.8,
        note: "Small niche line, all Stars but weak share. Decide whether to invest behind it to create scale." },
      { name: "Vamino",         x: 46, y: 22, size: 7,  profit: "thin",     quadrant: "Question Marks",  products: 7,  rev: 11.0,  ros: 11.8,
        note: "Export-only ToGo niche; volume declining (−14.5% YoY). Cash-Cow SKUs but thin 11.8% margin — reposition or limit exposure." }
    ],
    counts: { star: 31, cow: 42, qm: 10, dog: 10, total: 93 },
    quadrantInfo: {
      "All":            "93 SKUs: 31 Stars, 42 Cash Cows, 10 Question Marks, 10 Dogs. Bubble size = active SKUs, colour = margin quality. VS-ToGo supplies most Cash Cows; VS-UHT supplies most Stars but also all the Dogs.",
      "Stars":          "31 Star SKUs — high growth, strong share, led by V-Soy and the UHT range. Focus: support growth while preventing margin erosion.",
      "Cash Cows":      "42 Cash Cow SKUs — the stable base, mostly Vitamilk ToGo bottles. Focus: protect margin and fund improvement.",
      "Question Marks": "10 Question Mark SKUs — growth opportunity but weak share, all Domestic. Focus: decide invest, reposition, or limit.",
      "Dogs":           "10 Dog SKUs — low growth and weak share, concentrated in VS-UHT and Export. Focus: simplification and SKU rationalization."
    }
  };

  // ---- filters per page (Fiori filter bar) ----
  const filters = {
    boxscore: [
      { label: "Value Stream", value: "(All)", options: ["(All)", "VS-UHT", "VS-ToGo"] },
      { label: "Period", value: "May 2026", options: ["May 2026", "Apr 2026", "Q2 2026", "FY 2026"] },
      { label: "Plant", value: "(All)", options: ["(All)", "Rangsit", "Nong Kae"] }
    ],
    trend: [
      { label: "Value Stream", value: "(All)", options: ["(All)", "VS-UHT", "VS-ToGo"] },
      { label: "Period", value: "Last 8 weeks", options: ["Last 8 weeks", "Last 13 weeks", "Quarter"] }
    ],
    analytic: [
      { label: "Period", value: "May 2026", options: ["May 2026", "Q2 2026", "FY 2026"] },
      { label: "Market", value: "(All)", options: ["(All)", "Domestic", "Export"] }
    ],
    portfolio: [
      { label: "Period", value: "FY 2026", options: ["FY 2026", "FY 2025"] }
    ]
  };

  return {
    appTitle: "LEAN Accounting",
    client: "Green Spot Co., Ltd.",
    period: "May 2026",
    pages: [
      { id: "boxscore",  name: "Box Score",            title: "Box Score — Value Stream Performance" },
      { id: "trend",     name: "Metric Time Sequence", title: "Metric Time Sequence — Weekly vs. Target" },
      { id: "analytic",  name: "Analytic Dashboard",   title: "Analytic Dashboard — Metric Drill-down" },
      { id: "portfolio", name: "Portfolio",            title: "Portfolio — Brand Growth-Share Matrix" }
    ],
    boxScore, trend, slices, channelDrill, channelDrillToGo, bcg, metricDrills, filters
  };
})();
