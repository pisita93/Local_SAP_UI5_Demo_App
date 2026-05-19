// Thai E-Tax Invoice / Receipt / Delivery Note printable preview
// Renders a single A5-ish page (595×842 px) with bilingual labels

const COMPANY = {
  name: "บริษัท กรีนสปอต จำกัด",
  nameEn: "Greenspot Co., Ltd.",
  address: "288 ถนนศรีนครินทร์ แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240",
  addressEn: "288 Srinakarin Rd., Hua Mak, Bang Kapi, Bangkok 10240",
  taxId: "0105496000831",
  branch: "00000",
  phone: "+66 2 314 5000",
};

// docType: "tax" | "receipt" | "delivery" | "delivery-extra"
const PreviewPage = ({ docType, copyLabel, billingDoc, delivery, dateIso = "2026-05-05", showPrice = true, certified = false }) => {
  const headers = {
    tax:      { th: "ใบกำกับภาษี / ใบส่งของ",       en: "TAX INVOICE / DELIVERY ORDER",   stampClass: "s1", copyTh: "ต้นฉบับ", copyEn: "Original" },
    receipt:  { th: "ใบเสร็จรับเงิน",                en: "RECEIPT",                         stampClass: "s2", copyTh: "สำเนา",   copyEn: "Copy" },
    delivery: { th: "ใบส่งของ",                       en: "DELIVERY NOTE",                   stampClass: "s3", copyTh: "สำเนา",   copyEn: "Copy" },
    "delivery-extra": { th: "ใบส่งของ (ไม่ระบุราคา)", en: "DELIVERY NOTE (NO PRICE)",       stampClass: "s4", copyTh: "สำเนา (สำหรับลูกค้า)", copyEn: "Customer Copy" },
  };
  const h = headers[docType];
  const noPrice = docType === "delivery-extra";

  return (
    <div className="preview-page">
      {/* Top: company info + doc title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #131E29", paddingBottom: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{COMPANY.name}</div>
          <div style={{ fontSize: 10, color: "#556B82" }}>{COMPANY.nameEn}</div>
          <div style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.4 }}>{COMPANY.address}</div>
          <div style={{ fontSize: 9, color: "#556B82", marginTop: 1 }}>{COMPANY.addressEn}</div>
          <div style={{ fontSize: 9.5, marginTop: 3 }}>
            <strong>เลขประจำตัวผู้เสียภาษี / Tax ID:</strong> {COMPANY.taxId} &nbsp;
            <strong>สำนักงานใหญ่ / Head Office:</strong> {COMPANY.branch}
          </div>
        </div>
        <div style={{ width: 60, height: 60, background: "#1E5FBB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, borderRadius: 4, flexShrink: 0, textAlign: "center", lineHeight: 1.1 }}>
          GREEN<br/>SPOT
        </div>
      </div>

      {/* Document title centered */}
      <div className="pp-h1">{h.th}</div>
      <div className="pp-h2">{h.en}</div>
      <div style={{ textAlign: "center", marginTop: 4, fontSize: 10, color: "#556B82" }}>
        ({h.copyTh} / {h.copyEn} — {copyLabel})
      </div>

      {/* Customer + meta block */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", border: "1px solid #131E29", marginTop: 10 }}>
        <div style={{ padding: "6px 8px", borderRight: "1px solid #131E29" }}>
          <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700 }}>ลูกค้า / CUSTOMER</div>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{delivery.soldToNameTh}</div>
          <div style={{ fontSize: 9, color: "#556B82" }}>{delivery.soldToName}</div>
          <div style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.4 }}>{delivery.soldToAddressTh}</div>
          <div style={{ fontSize: 9, color: "#556B82" }}>{delivery.soldToAddress}</div>
          <div style={{ fontSize: 9.5, marginTop: 4 }}>
            <strong>เลขประจำตัวผู้เสียภาษี / Tax ID:</strong> {delivery.soldToTaxId}
          </div>
          <div style={{ fontSize: 9.5 }}>
            <strong>สำนักงาน / Branch:</strong> {delivery.soldToBranch}
          </div>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "4px 6px", borderBottom: "1px solid #131E29", borderRight: "1px solid #131E29" }}>
              <div style={{ fontSize: 8, color: "#556B82", fontWeight: 700 }}>เลขที่ / DOC NO.</div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{billingDoc}</div>
            </div>
            <div style={{ padding: "4px 6px", borderBottom: "1px solid #131E29" }}>
              <div style={{ fontSize: 8, color: "#556B82", fontWeight: 700 }}>วันที่ / DATE</div>
              <div style={{ fontSize: 10, fontWeight: 700 }}>{fmtThaiDate(dateIso)}</div>
              <div style={{ fontSize: 9, color: "#556B82" }}>{fmtEnDate(dateIso)}</div>
            </div>
            <div style={{ padding: "4px 6px", borderBottom: "1px solid #131E29", borderRight: "1px solid #131E29" }}>
              <div style={{ fontSize: 8, color: "#556B82", fontWeight: 700 }}>เลข PO ลูกค้า / CUSTOMER PO</div>
              <div style={{ fontSize: 10 }}>{delivery.poNumber}</div>
            </div>
            <div style={{ padding: "4px 6px", borderBottom: "1px solid #131E29" }}>
              <div style={{ fontSize: 8, color: "#556B82", fontWeight: 700 }}>ใบส่งสินค้า / DELIVERY</div>
              <div style={{ fontSize: 10 }}>{delivery.delivery}</div>
            </div>
            <div style={{ padding: "4px 6px", borderRight: "1px solid #131E29" }}>
              <div style={{ fontSize: 8, color: "#556B82", fontWeight: 700 }}>เงื่อนไขชำระ / TERMS</div>
              <div style={{ fontSize: 10 }}>{delivery.soldToPaymentTerms}</div>
            </div>
            <div style={{ padding: "4px 6px" }}>
              <div style={{ fontSize: 8, color: "#556B82", fontWeight: 700 }}>พนักงานขาย / SALES</div>
              <div style={{ fontSize: 10 }}>SN-014</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ship-to */}
      <div style={{ border: "1px solid #131E29", borderTop: "none", padding: "6px 8px" }}>
        <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700 }}>สถานที่ส่งของ / SHIP-TO</div>
        <div style={{ fontSize: 11, fontWeight: 700 }}>{delivery.shipToNameTh} <span style={{ fontSize: 9, color: "#556B82", fontWeight: 400 }}>· {delivery.shipToName}</span></div>
        <div style={{ fontSize: 9.5 }}>{delivery.shipToAddress}</div>
      </div>

      {/* Items table */}
      <table className="pp-table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th style={{ width: 26 }}>#</th>
            <th style={{ width: 90 }}>รหัสสินค้า<br/>Code</th>
            <th>รายการ / Description</th>
            <th className="pp-num" style={{ width: 50 }}>จำนวน<br/>Qty</th>
            <th style={{ width: 38 }}>หน่วย<br/>Unit</th>
            {showPrice && !noPrice && <>
              <th className="pp-num" style={{ width: 60 }}>ราคา/หน่วย<br/>Unit price</th>
              <th className="pp-num" style={{ width: 70 }}>มูลค่า / Amount</th>
            </>}
          </tr>
        </thead>
        <tbody>
          {delivery.items.map(it => (
            <tr key={it.line}>
              <td>{it.line}</td>
              <td style={{ fontFamily: "var(--fm)", fontSize: 9 }}>{it.code}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{it.desc}</div>
                <div style={{ fontSize: 8.5, color: "#556B82" }}>{it.descEn}</div>
              </td>
              <td className="pp-num">{fmtInt(it.qty)}</td>
              <td>{it.uom}</td>
              {showPrice && !noPrice && <>
                <td className="pp-num">{fmtNum(it.unitPrice)}</td>
                <td className="pp-num">{fmtNum(it.amount)}</td>
              </>}
            </tr>
          ))}
          {/* Pad rows for visual consistency */}
          {Array.from({ length: Math.max(0, 6 - delivery.items.length) }).map((_, i) => (
            <tr key={"pad" + i}><td>&nbsp;</td><td></td><td></td><td></td><td></td>{showPrice && !noPrice && <><td></td><td></td></>}</tr>
          ))}
        </tbody>
      </table>

      {/* Totals or Goods received */}
      {(showPrice && !noPrice) ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", border: "1px solid #131E29", borderTop: "none" }}>
          <div style={{ padding: "8px 10px", borderRight: "1px solid #131E29", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700 }}>จำนวนเงินเป็นตัวอักษร / AMOUNT IN WORDS</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2 }}>{bahtText(delivery.total)}</div>
            </div>
            <div style={{ fontSize: 8.5, color: "#556B82", marginTop: 6, fontStyle: "italic" }}>
              {docType === "tax" && "เอกสารนี้เป็นใบกำกับภาษีฉบับอิเล็กทรอนิกส์ ที่ได้รับการรับรองจากกรมสรรพากร"}
              {docType === "receipt" && "ขอแสดงความขอบคุณที่ใช้บริการ / Thank you for your business"}
              {(docType === "delivery" || docType === "delivery-extra") && "กรุณาตรวจสอบสินค้าก่อนเซ็นรับ / Please verify items before signing"}
            </div>
          </div>
          <div>
            {[
              ["มูลค่าสินค้า / Subtotal", fmtNum(delivery.subtotal)],
              ["ภาษีมูลค่าเพิ่ม 7% / VAT 7%", fmtNum(delivery.vat)],
              ["รวมเป็นเงินทั้งสิ้น / Grand Total", fmtNum(delivery.total)],
            ].map(([k, v], i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", borderBottom: i === arr.length - 1 ? "none" : "1px solid #D9D9D9", background: i === arr.length - 1 ? "#F5F6F7" : "transparent" }}>
                <span style={{ fontSize: 9.5, fontWeight: i === arr.length - 1 ? 700 : 400 }}>{k}</span>
                <span style={{ fontSize: i === arr.length - 1 ? 12 : 10, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ border: "1px solid #131E29", borderTop: "none", padding: "10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 9.5 }}>
          <div>
            <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700 }}>รวมจำนวนรายการ / TOTAL ITEMS</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{delivery.items.length} รายการ</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700 }}>รวมจำนวน / TOTAL QTY</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{fmtInt(delivery.items.reduce((a, b) => a + b.qty, 0))} CASE</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700 }}>หมายเหตุ / NOTE</div>
            <div style={{ fontSize: 9.5, marginTop: 2 }}>เอกสารฉบับนี้ไม่ระบุราคา<br/>(No price information)</div>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", border: "1px solid #131E29", borderTop: "none" }}>
        {[
          ["ผู้รับสินค้า / Received by", "วันที่ / Date ………………………"],
          ["ผู้ส่งสินค้า / Delivered by", "วันที่ / Date ………………………"],
          ["ผู้มีอำนาจลงนาม / Authorized by", "ในนามของ Greenspot Co., Ltd."],
        ].map(([role, sub], i) => (
          <div key={i} style={{ padding: "10px 8px", borderRight: i < 2 ? "1px solid #131E29" : "none", textAlign: "center", height: 70, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ fontSize: 9, color: "#556B82" }}>……………………………………………</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700 }}>{role}</div>
              <div style={{ fontSize: 8, color: "#556B82" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / footer-stamp / iNet cert */}
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8, color: "#556B82" }}>
        <div>หน้า 1 / 1 · Document ID: {billingDoc}-{docType.toUpperCase()}</div>
        {certified && docType === "tax" && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#25713A", fontWeight: 700 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            CERTIFIED BY iNET · 2026-05-05 14:23
          </div>
        )}
      </div>

      {/* Copy stamp */}
      <div className={"preview-stamp " + h.stampClass}>
        {h.copyTh.toUpperCase()} · {h.copyEn.toUpperCase()}
      </div>
    </div>
  );
};

const PrintPreview = ({ delivery, billingDoc, certified = false }) => {
  const plan = computeCopyPlan(delivery);
  const [activeTab, setActiveTab] = React.useState("all");

  // Build the list of pages this delivery will print
  const pages = [];
  for (let i = 0; i < plan.masterSets; i++) {
    const setLabel = `Master set ${i + 1}/${plan.masterSets}`;
    pages.push({ docType: "tax", copyLabel: setLabel, key: `tax-${i}` });
    pages.push({ docType: "receipt", copyLabel: setLabel, key: `rec-${i}` });
    pages.push({ docType: "delivery", copyLabel: setLabel, key: `dn-${i}` });
  }
  if (plan.extraDeliveryNote) pages.push({ docType: "delivery-extra", copyLabel: "Ship-to extra", key: "dn-extra" });
  if (plan.includePo) pages.push({ docType: "po-attach", copyLabel: "Customer PO", key: "po" });

  const tabs = [
    { id: "all", label: `All ${pages.length} pages` },
    { id: "tax", label: "Tax Invoice" },
    { id: "receipt", label: "Receipt" },
    { id: "delivery", label: "Delivery Note" },
    ...(plan.extraDeliveryNote ? [{ id: "extra", label: "Extra (No price)" }] : []),
    ...(plan.includePo ? [{ id: "po", label: "PO attachment" }] : []),
  ];

  const filteredPages = pages.filter(p => {
    if (activeTab === "all") return true;
    if (activeTab === "extra") return p.docType === "delivery-extra";
    if (activeTab === "po") return p.docType === "po-attach";
    return p.docType === activeTab;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div className="preview-tabs">
        {tabs.map(t => (
          <div key={t.id} className={"preview-tab" + (activeTab === t.id ? " active" : "")} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn btn-secondary btn-compact" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
            <Icon name="download" size={12} /> Download PDF
          </button>
          <button className="btn btn-primary btn-compact">
            <Icon name="printer" size={12} /> Print {filteredPages.length}
          </button>
        </div>
      </div>
      <div className="preview-area">
        {filteredPages.map((p, idx) => p.docType === "po-attach" ? (
          <div key={p.key} style={{ position: "relative" }}>
            <div className="preview-page-label">Page {idx + 1} · PO attachment</div>
            <div className="preview-page" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ borderBottom: "1px solid #131E29", paddingBottom: 8 }}>
                <div className="pp-h1" style={{ fontSize: 16 }}>เอกสารใบสั่งซื้อ (จากลูกค้า)</div>
                <div className="pp-h2">CUSTOMER PURCHASE ORDER · {delivery.poNumber}</div>
              </div>
              <div style={{ marginTop: 12, fontSize: 10, color: "#556B82" }}>
                ออกโดย: {delivery.soldToName}<br/>
                เลขที่ใบสั่งซื้อ: {delivery.poNumber}<br/>
                ลูกค้าระบุให้พิมพ์ใบสั่งซื้อแนบไปกับชุดใบกำกับภาษีต้นฉบับ (Sold-to flag: <strong style={{ color: "#0064D9" }}>requiresPo = true</strong>)
              </div>
              <div style={{ marginTop: 14, padding: 16, border: "1px dashed #BCC3CA", borderRadius: 4, background: "#F5F6F7", fontSize: 10, color: "#556B82", textAlign: "center" }}>
                [Scanned PO PDF — pulled from DMS — 2 pages]<br/>
                <span style={{ fontSize: 9 }}>Stored under: /dms/po/{delivery.poNumber}.pdf</span>
              </div>
              <div style={{ marginTop: "auto", fontSize: 8, color: "#556B82" }}>
                หน้า 1 / 1 · Attachment to {billingDoc}
              </div>
            </div>
          </div>
        ) : (
          <div key={p.key} style={{ position: "relative" }}>
            <div className="preview-page-label">Page {idx + 1} · {p.copyLabel}</div>
            <PreviewPage
              docType={p.docType}
              copyLabel={p.copyLabel}
              billingDoc={billingDoc}
              delivery={delivery}
              certified={certified}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { PreviewPage, PrintPreview, COMPANY });
