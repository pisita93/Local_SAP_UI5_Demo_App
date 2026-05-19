// Demo dataset — Green Spot Vitamilk / V-Soy (Thailand)
// Sourced from GreenSpot_Integrated_Demo_Dataset.xlsx (Material Master,
// Sold-to Master, Ship-to Master, Sales Pricing, Payment Terms).
window.AppData = (function() {

  // ── Customers (Sold-to + primary Ship-to) ──────────────────────
  // Keyed by SAP Sold-to code (string). Each carries a single primary
  // ship-to for the demo (most customers have several in the source).
  const customers = {
    '1000001': {
      id: '1000001', name: "Lotus's Stores (Thailand) Co., Ltd.",
      nameTh: 'บริษัท โลตัสส์ สโตร์ส (ประเทศไทย) จำกัด',
      channel: 'Modern Trade', subChannel: 'Hypermarket',
      shipTo: "Lotus's DC Bang Bua Thong",
      shipToTh: 'ศูนย์กระจายสินค้าโลตัสส์ บางบัวทอง',
      city: 'Bang Bua Thong', region: 'Nonthaburi, TH',
      priceGroup: 'MT01-HYPER', paymentTermsCode: 'NT45',
      contact: 'Khun Somchai Wattana', phone: '+66 2 711 1111',
    },
    '1000002': {
      id: '1000002', name: 'Big C Supercenter Public Co., Ltd.',
      nameTh: 'บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)',
      channel: 'Modern Trade', subChannel: 'Hypermarket',
      shipTo: 'Big C DC Bang Pa-In',
      shipToTh: 'ศูนย์กระจายสินค้าบิ๊กซี บางปะอิน',
      city: 'Bang Pa-in', region: 'Phra Nakhon Si Ayutthaya, TH',
      priceGroup: 'MT01-HYPER', paymentTermsCode: 'NT60',
      contact: 'Khun Niwat Supply Chain', phone: '+66 35 350 100',
    },
    '1000003': {
      id: '1000003', name: 'CP All Public Co., Ltd. (7-Eleven)',
      nameTh: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน) (เซเว่น อีเลฟเว่น)',
      channel: 'Modern Trade', subChannel: 'Convenience Store',
      shipTo: '7-Eleven Suvarnabhumi DC',
      shipToTh: 'ศูนย์กระจายสินค้า 7-Eleven สุวรรณภูมิ',
      city: 'Bang Phli', region: 'Samut Prakan, TH',
      priceGroup: 'MT02-CVS', paymentTermsCode: 'NT30',
      contact: 'Khun Logistics Manager', phone: '+66 2 705 8000',
    },
    '1000004': {
      id: '1000004', name: 'The Mall Group Co., Ltd. (Gourmet Market)',
      nameTh: 'บริษัท เดอะมอลล์ กรุ๊ป จำกัด (กูร์เมต์ มาร์เก็ต)',
      channel: 'Modern Trade', subChannel: 'Supermarket Premium',
      shipTo: 'Gourmet Market Siam Paragon',
      shipToTh: 'กูร์เมต์ มาร์เก็ต สยามพารากอน',
      city: 'Bangkok', region: 'Bangkok, TH',
      priceGroup: 'MT03-SUPER', paymentTermsCode: 'NT45',
      contact: 'Store Operations', phone: '+66 2 690 1000',
    },
    '1000005': {
      id: '1000005', name: 'Siam Makro Public Co., Ltd.',
      nameTh: 'บริษัท สยามแม็คโคร จำกัด (มหาชน)',
      channel: 'Modern Trade', subChannel: 'Cash & Carry',
      shipTo: 'Makro Chaengwattana',
      shipToTh: 'แม็คโคร สาขาแจ้งวัฒนะ',
      city: 'Pak Kret', region: 'Nonthaburi, TH',
      priceGroup: 'MT04-C&C', paymentTermsCode: 'NT30',
      contact: 'Khun Branch Manager', phone: '+66 2 832 7000',
    },
    '2000001': {
      id: '2000001', name: 'Chiang Mai Beverage Distribution Co., Ltd.',
      nameTh: 'บริษัท เชียงใหม่ เบฟเวอเรจ ดิสทริบิวชั่น จำกัด',
      channel: 'Traditional Trade', subChannel: 'Regional Distributor',
      shipTo: 'Chiang Mai Beverage Main Warehouse',
      shipToTh: 'คลังสินค้าหลัก เชียงใหม่ เบฟเวอเรจ',
      city: 'Chiang Mai', region: 'Chiang Mai, TH',
      priceGroup: 'TT01-DIST', paymentTermsCode: 'NT15',
      contact: 'Khun Suthep Wongchai', phone: '+66 53 244 555',
    },
    '2000003': {
      id: '2000003', name: 'Khon Kaen United Trading L.P.',
      nameTh: 'ห้างหุ้นส่วนจำกัด ขอนแก่น ยูไนเต็ด เทรดดิ้ง',
      channel: 'Traditional Trade', subChannel: 'Wholesaler',
      shipTo: 'Khon Kaen United Main Store',
      shipToTh: 'ร้านค้าหลัก ขอนแก่น ยูไนเต็ด',
      city: 'Khon Kaen', region: 'Khon Kaen, TH',
      priceGroup: 'TT02-WS', paymentTermsCode: 'NT07',
      contact: 'Khun Pichai Saetang', phone: '+66 43 221 888',
    },
    '2000004': {
      id: '2000004', name: 'Sermsap Mini-Mart',
      nameTh: 'ร้านเสริมทรัพย์ มินิมาร์ท',
      channel: 'Traditional Trade', subChannel: 'Local Shop',
      shipTo: 'Sermsap Mini-Mart (Shop)',
      shipToTh: 'ร้านเสริมทรัพย์ มินิมาร์ท (หน้าร้าน)',
      city: 'Bangkok', region: 'Bangkok, TH',
      priceGroup: 'TT03-LOCAL', paymentTermsCode: 'CASH',
      contact: 'Khun Sermsap (Owner)', phone: '+66 81 234 0001',
    },
    '2000006': {
      id: '2000006', name: 'Suksamran Supermarket Co., Ltd.',
      nameTh: 'บริษัท สุขสำราญ ซูเปอร์มาร์เก็ต จำกัด',
      channel: 'Traditional Trade', subChannel: 'Local Supermarket',
      shipTo: 'Suksamran Supermarket Korat',
      shipToTh: 'สุขสำราญ ซูเปอร์มาร์เก็ต โคราช',
      city: 'Mueang Nakhon Ratchasima', region: 'Nakhon Ratchasima, TH',
      priceGroup: 'TT04-LSUPER', paymentTermsCode: 'BT07',
      contact: 'Khun Wichai Boonkerd', phone: '+66 44 257 100',
    },
    '3000001': {
      id: '3000001', name: 'Minor Hotel Group Public Co., Ltd.',
      nameTh: 'บริษัท ไมเนอร์ โฮเทล กรุ๊ป จำกัด (มหาชน)',
      channel: 'HoReCa', subChannel: 'Hotel Chain',
      shipTo: 'Anantara Riverside Bangkok Resort',
      shipToTh: 'อนันตรา ริเวอร์ไซด์ กรุงเทพฯ รีสอร์ท',
      city: 'Bangkok', region: 'Bangkok, TH',
      priceGroup: 'HC01-HOTEL', paymentTermsCode: 'NT45',
      contact: 'F&B Procurement', phone: '+66 2 476 0022',
    },
  };

  // ── Payment Terms (channel → settlement) ───────────────────────
  const paymentTerms = {
    CASH: { label: 'COD — Cash',           method: 'Cash',           ztrm: '0001' },
    BT07: { label: 'Bank Transfer 7d',     method: 'Bank Transfer',  ztrm: 'ZB07' },
    BT15: { label: 'Bank Transfer 15d',    method: 'Bank Transfer',  ztrm: 'ZB15' },
    NT07: { label: 'Net 7',                method: 'Cheque/Transfer',ztrm: 'ZN07' },
    NT15: { label: 'Net 15',               method: 'Cheque/Transfer',ztrm: 'ZN15' },
    NT30: { label: 'Net 30',               method: 'Cheque/Transfer',ztrm: 'NT30' },
    NT45: { label: 'Net 45',               method: 'Cheque/Transfer',ztrm: 'NT45' },
    NT60: { label: 'Net 60',               method: 'Cheque/Transfer',ztrm: 'NT60' },
    LC30: { label: 'L/C 30 days',          method: 'Bank L/C',       ztrm: 'ZL30' },
    LC60: { label: 'L/C 60 days',          method: 'Bank L/C',       ztrm: 'ZL60' },
    PIA:  { label: 'Prepaid (PIA)',        method: 'Online/Card',    ztrm: '0003' },
  };

  // ── Products (Material Master) ─────────────────────────────────
  // All quantities are in CASE units. Weight/volume per case derived
  // from pack size × units/case + standard secondary packaging allowance.
  // Price is the channel-list reference (per case, THB) — Modern-Trade
  // Hypermarket tier, taken from Sales Pricing.
  const products = {
    'GS-VTG-01': { sku:'GS-VTG-01', brand:'Vitamilk', subBrand:'Vitamilk Togo',  name:'Vitamilk Togo Choco Grande 300ml × 24',         uom:'CSE', packSize:300, packType:'PET Bottle', unitsPerCase:24, plant:'Surat Thani', wPerU:7.6,  vPerU:0.022, price:355.68 },
    'GS-VTG-02': { sku:'GS-VTG-02', brand:'Vitamilk', subBrand:'Vitamilk Togo',  name:'Vitamilk Togo Royal Thai Tea 300ml × 24',       uom:'CSE', packSize:300, packType:'PET Bottle', unitsPerCase:24, plant:'Surat Thani', wPerU:7.6,  vPerU:0.022, price:355.68 },
    'GS-VTG-03': { sku:'GS-VTG-03', brand:'Vitamilk', subBrand:'Vitamilk Togo',  name:'Vitamilk Togo Barley & Malt 300ml × 24',        uom:'CSE', packSize:300, packType:'PET Bottle', unitsPerCase:24, plant:'Surat Thani', wPerU:7.6,  vPerU:0.022, price:299.52 },
    'GS-VTG-04': { sku:'GS-VTG-04', brand:'Vitamilk', subBrand:'Vitamilk Togo',  name:'Vitamilk Togo Black Sesame & Riceberry 300ml × 24', uom:'CSE', packSize:300, packType:'PET Bottle', unitsPerCase:24, plant:'Surat Thani', wPerU:7.6, vPerU:0.022, price:299.52 },
    'GS-VTG-05': { sku:'GS-VTG-05', brand:'Vitamilk', subBrand:'Vitamilk Togo',  name:'Vitamilk Togo Original 300ml × 24',             uom:'CSE', packSize:300, packType:'PET Bottle', unitsPerCase:24, plant:'Surat Thani', wPerU:7.6,  vPerU:0.022, price:299.52 },
    'GS-VTG-06': { sku:'GS-VTG-06', brand:'Vitamilk', subBrand:'Vitamilk Light', name:'Vitamilk Light Original 50% Less Sugar 300ml × 24', uom:'CSE', packSize:300, packType:'PET Bottle', unitsPerCase:24, plant:'Surat Thani', wPerU:7.6, vPerU:0.022, price:355.68 },
    'GS-VUH-01': { sku:'GS-VUH-01', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Barley & Malt 300ml × 36',         uom:'CSE', packSize:300, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:11.4, vPerU:0.028, price:336.96 },
    'GS-VUH-02': { sku:'GS-VUH-02', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Black Sesame & Riceberry 300ml × 36', uom:'CSE', packSize:300, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',  wPerU:11.4, vPerU:0.028, price:336.96 },
    'GS-VUH-03': { sku:'GS-VUH-03', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Less Sugar (Lactose Free) 250ml × 36', uom:'CSE', packSize:250, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit', wPerU:9.5,  vPerU:0.024, price:280.80 },
    'GS-VUH-04': { sku:'GS-VUH-04', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Original 300ml × 36',              uom:'CSE', packSize:300, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:11.4, vPerU:0.028, price:336.96 },
    'GS-VUH-05': { sku:'GS-VUH-05', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Vegetarian (Jay) 250ml × 36',      uom:'CSE', packSize:250, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:9.5,  vPerU:0.024, price:280.80 },
    'GS-VUH-06': { sku:'GS-VUH-06', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Vitamin Plus Black Sesame 180ml × 48', uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:48, plant:'Rangsit', wPerU:9.2,  vPerU:0.025, price:449.28 },
    'GS-VUH-07': { sku:'GS-VUH-07', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Vitamin Plus Almond 180ml × 48',   uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:48, plant:'Rangsit',     wPerU:9.2,  vPerU:0.025, price:449.28 },
    'GS-VUH-08': { sku:'GS-VUH-08', brand:'Vitamilk', subBrand:'Vitamilk UHT',   name:'Vitamilk UHT Vitamin Plus Malt 180ml × 48',     uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:48, plant:'Rangsit',     wPerU:9.2,  vPerU:0.025, price:449.28 },
    'GS-VUH-09': { sku:'GS-VUH-09', brand:'Vitamilk', subBrand:'Vitamilk Light', name:'Vitamilk Light UHT Original Less Sugar 250ml × 36', uom:'CSE', packSize:250, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit', wPerU:9.5,  vPerU:0.024, price:374.40 },
    'GS-VCH-01': { sku:'GS-VCH-01', brand:'Vitamilk', subBrand:'Vitamilk Champ', name:'Vitamilk Champ Unsweetened Lactose Free 180ml × 48', uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:48, plant:'Nong Kae', wPerU:9.2,  vPerU:0.025, price:449.28 },
    'GS-VCH-02': { sku:'GS-VCH-02', brand:'Vitamilk', subBrand:'Vitamilk Champ', name:'Vitamilk Champ Less Sugar Lactose Free 180ml × 48', uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:48, plant:'Nong Kae', wPerU:9.2,  vPerU:0.025, price:449.28 },
    'GS-VSY-01': { sku:'GS-VSY-01', brand:'V-Soy',    subBrand:'V-Soy',          name:'V-Soy Sesame Malt 180ml × 36',                  uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:6.9,  vPerU:0.020, price:421.20 },
    'GS-VSY-02': { sku:'GS-VSY-02', brand:'V-Soy',    subBrand:'V-Soy',          name:'V-Soy Pistachio 180ml × 36',                    uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:6.9,  vPerU:0.020, price:421.20 },
    'GS-VSY-03': { sku:'GS-VSY-03', brand:'V-Soy',    subBrand:'V-Soy',          name:'V-Soy Almond 1000ml × 12',                      uom:'CSE', packSize:1000,packType:'UHT Carton', unitsPerCase:12, plant:'Rangsit',     wPerU:12.6, vPerU:0.020, price:702.00 },
    'GS-VSY-04': { sku:'GS-VSY-04', brand:'V-Soy',    subBrand:'V-Soy',          name:'V-Soy Almond 180ml × 36',                       uom:'CSE', packSize:180, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:6.9,  vPerU:0.020, price:421.20 },
    'GS-VSY-05': { sku:'GS-VSY-05', brand:'V-Soy',    subBrand:'V-Soy Hi-Calcium', name:'V-Soy Hi-Calcium Unsweetened 1000ml × 12',    uom:'CSE', packSize:1000,packType:'UHT Carton', unitsPerCase:12, plant:'Rangsit',     wPerU:12.6, vPerU:0.020, price:552.24 },
    'GS-VSY-06': { sku:'GS-VSY-06', brand:'V-Soy',    subBrand:'V-Soy Hi-Calcium', name:'V-Soy Hi-Calcium Unsweetened 230ml × 36',     uom:'CSE', packSize:230, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:8.8,  vPerU:0.022, price:421.20 },
    'GS-VSY-07': { sku:'GS-VSY-07', brand:'V-Soy',    subBrand:'V-Soy Hi-Calcium', name:'V-Soy Hi-Calcium Multigrain 230ml × 36',      uom:'CSE', packSize:230, packType:'UHT Carton', unitsPerCase:36, plant:'Rangsit',     wPerU:8.8,  vPerU:0.022, price:421.20 },
  };

  // ── Helpers ────────────────────────────────────────────────────
  const PALLET_KG = 600;
  let _invSeq = 78420;

  // Customer-PO patterns reflect the buying organisation's own ERP.
  // We pick a deterministic-looking suffix per delivery for demo clarity.
  function customerPOFor(custId, seq) {
    const p = String(seq).padStart(5, '0');
    switch (custId) {
      case '1000001': return `LT-PO-2026-${p}`;
      case '1000002': return `BIGC/PO/26/${p}`;
      case '1000003': return `7E-PO-2604-${p.slice(-4)}`;
      case '1000004': return `TMG-PO-26-${p.slice(-4)}`;
      case '1000005': return `MAK-PO-2026-${p.slice(-4)}`;
      case '2000001': return `CMB/PO/2026/${p.slice(-4)}`;
      case '2000003': return `KKU-PO-26-${p.slice(-4)}`;
      case '2000004': return `SS-${p.slice(-3)}`;
      case '2000006': return `SKR-PO-26/${p.slice(-3)}`;
      case '3000001': return `MHG-FB-PO-26-${p.slice(-4)}`;
      default:        return `PO-2026-${p}`;
    }
  }

  function delivery(d, idx) {
    const totalWeight = d.items.reduce((s, i) => s + products[i.sku].wPerU * i.qty, 0);
    const totalVolume = d.items.reduce((s, i) => s + products[i.sku].vPerU * i.qty, 0);
    const subtotal    = d.items.reduce((s, i) => s + products[i.sku].price * i.qty, 0);
    const tax         = Math.round(subtotal * 0.07 * 100) / 100; // 7% VAT
    const invoiceAmount = Math.round((subtotal + tax) * 100) / 100;
    const pallets     = Math.max(1, Math.ceil(totalWeight / PALLET_KG));
    const invoiceNo   = d.invoiceNo || `INV-2026-${++_invSeq}`;
    const cust        = customers[d.customer];
    const termsCode   = d.paymentTermsCode || cust.paymentTermsCode || 'NT30';
    const paymentTermsLabel = paymentTerms[termsCode]?.label || termsCode;
    const customerPO  = d.customerPO || customerPOFor(d.customer, 10000 + (idx ?? 0) * 37);
    return { ...d,
      totalWeight: Math.round(totalWeight * 10) / 10,
      totalVolume: Math.round(totalVolume * 100) / 100,
      pallets, subtotal, tax, invoiceAmount, invoiceNo,
      paymentTermsCode: termsCode,
      paymentTerms: paymentTermsLabel,
      customerPO,
    };
  }

  // ── Deliveries (mix of statuses) ───────────────────────────────
  const _seed = [
    // Open — awaiting grouping
    { id:'D80001245', so:'SO-450231', customer:'1000001', plannedDate:'2026-05-21', status:'Open',     group:null, items:[ {sku:'GS-VTG-01', qty:60}, {sku:'GS-VTG-05', qty:80}, {sku:'GS-VUH-04', qty:40} ] },
    { id:'D80001246', so:'SO-450231', customer:'1000001', plannedDate:'2026-05-21', status:'Open',     group:null, items:[ {sku:'GS-VUH-01', qty:48}, {sku:'GS-VUH-09', qty:30} ] },
    { id:'D80001247', so:'SO-450232', customer:'1000002', plannedDate:'2026-05-22', status:'Open',     group:null, items:[ {sku:'GS-VTG-05', qty:120},{sku:'GS-VUH-04', qty:96},{sku:'GS-VSY-04', qty:36} ] },
    { id:'D80001248', so:'SO-450232', customer:'1000002', plannedDate:'2026-05-22', status:'Open',     group:null, items:[ {sku:'GS-VCH-01', qty:24}, {sku:'GS-VCH-02', qty:24} ] },
    { id:'D80001249', so:'SO-450233', customer:'1000003', plannedDate:'2026-05-21', status:'Open',     group:null, items:[ {sku:'GS-VTG-01', qty:240},{sku:'GS-VTG-02', qty:200} ] },
    { id:'D80001250', so:'SO-450234', customer:'1000004', plannedDate:'2026-05-23', status:'Open',     group:null, items:[ {sku:'GS-VSY-03', qty:30}, {sku:'GS-VSY-05', qty:24} ] },
    { id:'D80001251', so:'SO-450234', customer:'1000004', plannedDate:'2026-05-23', status:'Open',     group:null, items:[ {sku:'GS-VUH-06', qty:36}, {sku:'GS-VUH-07', qty:36}, {sku:'GS-VUH-08', qty:24} ] },
    { id:'D80001252', so:'SO-450235', customer:'1000005', plannedDate:'2026-05-22', status:'Open',     group:null, items:[ {sku:'GS-VTG-03', qty:96}, {sku:'GS-VTG-04', qty:96}, {sku:'GS-VSY-06', qty:48} ] },
    { id:'D80001253', so:'SO-450236', customer:'2000001', plannedDate:'2026-05-24', status:'Open',     group:null, items:[ {sku:'GS-VUH-01', qty:60}, {sku:'GS-VUH-04', qty:60} ] },
    { id:'D80001254', so:'SO-450237', customer:'2000003', plannedDate:'2026-05-24', status:'Open',     group:null, items:[ {sku:'GS-VSY-01', qty:36}, {sku:'GS-VSY-04', qty:36} ] },

    // Grouped — PGI / In Transit
    { id:'D80001230', so:'SO-450220', customer:'1000002', plannedDate:'2026-05-20', status:'PGI',        group:'Truck-2026-00012', pgiDate:'2026-05-20', items:[ {sku:'GS-VTG-05', qty:200},{sku:'GS-VUH-04', qty:120} ] },
    { id:'D80001231', so:'SO-450220', customer:'1000002', plannedDate:'2026-05-20', status:'PGI',        group:'Truck-2026-00012', pgiDate:'2026-05-20', items:[ {sku:'GS-VUH-06', qty:48}, {sku:'GS-VUH-08', qty:48} ] },
    { id:'D80001232', so:'SO-450221', customer:'1000003', plannedDate:'2026-05-20', status:'In Transit', group:'Truck-2026-00013', pgiDate:'2026-05-20', items:[ {sku:'GS-VTG-01', qty:300},{sku:'GS-VTG-02', qty:240} ] },
    { id:'D80001233', so:'SO-450221', customer:'1000003', plannedDate:'2026-05-20', status:'In Transit', group:'Truck-2026-00013', pgiDate:'2026-05-20', items:[ {sku:'GS-VUH-04', qty:180} ] },

    // POD complete
    { id:'D80001225', so:'SO-450215', customer:'1000001', plannedDate:'2026-05-18', status:'POD',        group:'Truck-2026-00010', pgiDate:'2026-05-18', podDate:'2026-05-19', items:[ {sku:'GS-VTG-05', qty:120},{sku:'GS-VUH-04', qty:96} ] },
    { id:'D80001226', so:'SO-450215', customer:'1000001', plannedDate:'2026-05-18', status:'POD',        group:'Truck-2026-00010', pgiDate:'2026-05-18', podDate:'2026-05-19', items:[ {sku:'GS-VTG-01', qty:60} ] },
    { id:'D80001220', so:'SO-450212', customer:'3000001', plannedDate:'2026-05-17', status:'POD',        group:'Truck-2026-00008', pgiDate:'2026-05-17', podDate:'2026-05-18', items:[ {sku:'GS-VSY-03', qty:24}, {sku:'GS-VUH-06', qty:24} ] },

    // POD with reject
    { id:'D80001218', so:'SO-450210', customer:'2000001', plannedDate:'2026-05-16', status:'POD Reject', group:'Truck-2026-00006', pgiDate:'2026-05-16', podDate:'2026-05-18', rejectReason:'Crushed cartons — 2 outer cases dented in transit', items:[ {sku:'GS-VUH-01', qty:36} ] },
    { id:'D80001219', so:'SO-450210', customer:'2000001', plannedDate:'2026-05-16', status:'POD',        group:'Truck-2026-00006', pgiDate:'2026-05-16', podDate:'2026-05-18', items:[ {sku:'GS-VUH-04', qty:60}, {sku:'GS-VUH-09', qty:36} ] },

    // POD — COD cash & bank transfer demos
    { id:'D80001215', so:'SO-450207', customer:'2000004', plannedDate:'2026-05-15', status:'POD',        group:'Truck-2026-00004', pgiDate:'2026-05-15', podDate:'2026-05-16', items:[ {sku:'GS-VTG-01', qty:6}, {sku:'GS-VTG-05', qty:8}, {sku:'GS-VSY-04', qty:4} ] },
    { id:'D80001216', so:'SO-450208', customer:'2000006', plannedDate:'2026-05-15', status:'POD',        group:'Truck-2026-00004', pgiDate:'2026-05-15', podDate:'2026-05-16', items:[ {sku:'GS-VUH-04', qty:18}, {sku:'GS-VSY-06', qty:12} ] },
  ];
  const deliveries = _seed.map((d, i) => delivery(d, i));

  // ── Truck capacity defaults ────────────────────────────────────
  const truckSpec = { maxWeight: 12000, maxVolume: 38, maxPallets: 28 };

  // ── Drivers & Trucks ───────────────────────────────────────────
  const drivers = [
    { id:'DR-01', name:'Somchai Wongsawat', plate:'70-3421 กรุงเทพ' },
    { id:'DR-02', name:'Niran Phromma',     plate:'82-1199 ระยอง' },
    { id:'DR-03', name:'Anucha Saetang',    plate:'71-5508 สมุทรปราการ' },
    { id:'DR-04', name:'Wichai Bunnag',     plate:'83-2274 ฉะเชิงเทรา' },
  ];

  const groups = {
    'Truck-2026-00004': { ref:'Truck-2026-00004', driver:'DR-02', plate:'82-1199 ระยอง',       createdOn:'2026-05-14' },
    'Truck-2026-00006': { ref:'Truck-2026-00006', driver:'DR-03', plate:'71-5508 สมุทรปราการ', createdOn:'2026-05-15' },
    'Truck-2026-00008': { ref:'Truck-2026-00008', driver:'DR-04', plate:'83-2274 ฉะเชิงเทรา',   createdOn:'2026-05-16' },
    'Truck-2026-00010': { ref:'Truck-2026-00010', driver:'DR-01', plate:'70-3421 กรุงเทพ',     createdOn:'2026-05-17' },
    'Truck-2026-00012': { ref:'Truck-2026-00012', driver:'DR-02', plate:'82-1199 ระยอง',       createdOn:'2026-05-19' },
    'Truck-2026-00013': { ref:'Truck-2026-00013', driver:'DR-04', plate:'83-2274 ฉะเชิงเทรา',   createdOn:'2026-05-19' },
  };

  // ── Status meta ────────────────────────────────────────────────
  const statusMeta = {
    'Open':        { label:'Open',              tone:'info', bg:'#D1EFFF', dot:'#0064D9', strip:'#0064D9' },
    'PGI':         { label:'PGI — pending POD', tone:'warn', bg:'#FFF3B8', dot:'#FF9900', strip:'#FF9900' },
    'In Transit':  { label:'In Transit',        tone:'warn', bg:'#FFE9C7', dot:'#E07A00', strip:'#E07A00' },
    'POD':         { label:'POD',               tone:'pos',  bg:'#C2FCEE', dot:'#30914C', strip:'#30914C' },
    'POD Reject':  { label:'POD with Reject',   tone:'neg',  bg:'#FFDBEF', dot:'#AA0808', strip:'#AA0808' },
  };

  // ── Formatters ─────────────────────────────────────────────────
  function fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }
  function fmtNum(n, d = 0) {
    if (n == null) return '—';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits:d, maximumFractionDigits:d });
  }
  function fmtMoney(n, cur='THB') {
    if (n == null) return '—';
    const sym = cur === 'THB' ? '฿' : cur === 'EUR' ? '€' : cur === 'USD' ? '$' : cur + ' ';
    return sym + Number(n).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
  }

  // ── Roles & Users ──────────────────────────────────────────────
  const roles = {
    'Admin':       { label:'IT Admin',             tone:'#7B3FF2', permissions:['ADMIN','GROUPING','POD_ENTRY','TRACKING'] },
    'Sales Admin': { label:'Sales Admin',          tone:'#0070F2', permissions:['GROUPING','TRACKING'] },
    'Driver':      { label:'Driver / Transporter', tone:'#E07A00', permissions:['POD_ENTRY'] },
    'Finance AR':  { label:'Finance AR',           tone:'#30914C', permissions:['TRACKING'] },
    'Finance AP':  { label:'Finance AP',           tone:'#1F7A8C', permissions:['TRACKING'] },
  };

  const users = [
    { id:'U001', name:'Ploy Suwanwong',        email:'ploy.s@greenspot.co.th',     role:'Sales Admin', status:'Active',   avatar:'PS', team:'Bangkok HQ',       lastLogin:'2026-05-19 09:32' },
    { id:'U002', name:'Pim Charoenkul',        email:'pim.c@greenspot.co.th',      role:'Sales Admin', status:'Active',   avatar:'PC', team:'Bangkok HQ',       lastLogin:'2026-05-19 08:55' },
    { id:'U003', name:'Somchai Wongsawat',     email:'somchai.w@greenspot-logistics.co.th', role:'Driver', status:'Active', avatar:'SW', team:'Fleet · Bangkok',  lastLogin:'2026-05-19 07:12' },
    { id:'U004', name:'Niran Phromma',         email:'niran.p@greenspot-logistics.co.th',   role:'Driver', status:'Active', avatar:'NP', team:'Fleet · Rayong',   lastLogin:'2026-05-19 06:48' },
    { id:'U005', name:'Anucha Saetang',        email:'anucha.s@greenspot-logistics.co.th',  role:'Driver', status:'Active', avatar:'AS', team:'Fleet · Bangkok',  lastLogin:'2026-05-18 17:20' },
    { id:'U006', name:'Wichai Bunnag',         email:'wichai.b@greenspot-logistics.co.th',  role:'Driver', status:'Active', avatar:'WB', team:'Fleet · Chonburi', lastLogin:'2026-05-17 19:04' },
    { id:'U007', name:'Apinya Tantipanichkit', email:'apinya.t@greenspot.co.th',   role:'Finance AR', status:'Active',  avatar:'AT', team:'Finance',          lastLogin:'2026-05-19 09:01' },
    { id:'U008', name:'Krit Phongphaew',       email:'krit.p@greenspot.co.th',     role:'Finance AP', status:'Active',  avatar:'KP', team:'Finance',          lastLogin:'2026-05-18 16:42' },
    { id:'U009', name:'Suchart Inthorn',       email:'suchart.i@greenspot.co.th',  role:'Admin',      status:'Active',  avatar:'SI', team:'IT',               lastLogin:'2026-05-19 08:10' },
    { id:'U010', name:'Nattaya Boonsom',       email:'nattaya.b@greenspot.co.th',  role:'Sales Admin',status:'Inactive',avatar:'NB', team:'Bangkok HQ',       lastLogin:'2026-04-22 14:11' },
    { id:'U011', name:'Thaksin Chuenklin',     email:'thaksin.c@greenspot.co.th',  role:'Finance AR', status:'Active',  avatar:'TC', team:'Finance',          lastLogin:'2026-05-18 11:25' },
    { id:'U012', name:'Malee Suksawat',        email:'malee.s@greenspot.co.th',    role:'Finance AP', status:'Active',  avatar:'MS', team:'Finance',          lastLogin:'2026-05-19 09:18' },
  ];

  // ── Seed mock POD evidence for already-completed deliveries ────
  function mockSig(name) {
    const initials = name.split(/\s+/).slice(0, 2).map(n => n[0]).join('');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'>
      <path d='M20 70 Q40 30 60 60 T100 50 Q130 40 150 70 T200 50' fill='none' stroke='#131E29' stroke-width='2.5' stroke-linecap='round'/>
      <text x='20' y='92' font-family='cursive, sans-serif' font-size='14' fill='#556B82'>${initials}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function mockReceipt(invoiceNo, amount) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 420' style='font-family:monospace'>
      <rect x='0' y='0' width='320' height='420' fill='#ffffff'/>
      <rect x='20' y='20' width='280' height='380' fill='#fafbfd' stroke='#d9d9d9'/>
      <text x='40' y='54' font-family='Arial' font-size='13' font-weight='700' fill='#0070F2'>KASIKORNBANK</text>
      <text x='40' y='72' font-family='Arial' font-size='10' fill='#7F8C9A'>Bank transfer slip</text>
      <line x1='40' y1='84' x2='280' y2='84' stroke='#d9d9d9'/>
      <text x='40' y='110' font-family='Arial' font-size='10' fill='#556B82'>Date</text>
      <text x='280' y='110' text-anchor='end' font-family='Arial' font-size='11' font-weight='700' fill='#131E29'>16/05/2026 14:22</text>
      <text x='40' y='134' font-family='Arial' font-size='10' fill='#556B82'>Reference</text>
      <text x='280' y='134' text-anchor='end' font-family='Arial' font-size='11' font-weight='700' fill='#131E29'>KBANK-2026-${(parseInt(invoiceNo.slice(-5)) % 99999).toString().padStart(5, '0')}</text>
      <text x='40' y='158' font-family='Arial' font-size='10' fill='#556B82'>From</text>
      <text x='280' y='158' text-anchor='end' font-family='Arial' font-size='11' fill='#131E29'>xxx-x-${(parseInt(invoiceNo.slice(-3)) * 31 % 999999).toString().padStart(6, '0')}</text>
      <text x='40' y='182' font-family='Arial' font-size='10' fill='#556B82'>To</text>
      <text x='280' y='182' text-anchor='end' font-family='Arial' font-size='11' fill='#131E29'>Green Spot Co., Ltd.</text>
      <line x1='40' y1='202' x2='280' y2='202' stroke='#d9d9d9' stroke-dasharray='3,3'/>
      <text x='40' y='240' font-family='Arial' font-size='10' fill='#556B82'>Amount</text>
      <text x='280' y='250' text-anchor='end' font-family='Arial' font-size='24' font-weight='700' fill='#30914C'>฿ ${Number(amount).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</text>
      <text x='280' y='270' text-anchor='end' font-family='Arial' font-size='10' fill='#7F8C9A'>THB · seven percent VAT included</text>
      <line x1='40' y1='290' x2='280' y2='290' stroke='#d9d9d9'/>
      <text x='40' y='318' font-family='Arial' font-size='10' fill='#556B82'>Status</text>
      <rect x='200' y='306' width='80' height='20' rx='4' fill='#C2FCEE'/>
      <text x='240' y='320' text-anchor='middle' font-family='Arial' font-size='11' font-weight='700' fill='#25713A'>SUCCESS</text>
      <text x='40' y='350' font-family='Arial' font-size='9' fill='#7F8C9A'>Invoice ${invoiceNo}</text>
      <text x='40' y='364' font-family='Arial' font-size='9' fill='#7F8C9A'>Captured by driver mobile · 16/05/2026 14:23</text>
      <rect x='220' y='340' width='60' height='40' rx='4' fill='none' stroke='#0070F2'/>
      <text x='250' y='358' text-anchor='middle' font-family='Arial' font-size='8' fill='#0070F2'>QR</text>
      <text x='250' y='370' text-anchor='middle' font-family='Arial' font-size='8' fill='#0070F2'>RECEIPT</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const signers = {
    '1000001': 'Khun Chai DC Manager',
    '1000002': 'Khun Niwat Supply Chain',
    '1000003': 'Khun Logistics Manager',
    '1000004': 'Store Operations',
    '1000005': 'Khun Branch Manager',
    '2000001': 'Khun Warehouse Manager',
    '2000003': 'Khun Pichai Saetang',
    '2000004': 'Khun Sermsap',
    '2000006': 'Khun Wichai Boonkerd',
    '3000001': 'F&B Procurement',
  };

  deliveries.forEach(d => {
    if (d.status === 'POD' || d.status === 'POD Reject') {
      const isReject = d.status === 'POD Reject';
      // Pick payment method based on terms code
      let method = 'none';
      if (d.paymentTermsCode === 'CASH') method = 'cash';
      else if (d.paymentTermsCode === 'BT07' || d.paymentTermsCode === 'BT15') method = 'bank';
      const sigName = signers[d.customer] || 'Customer';
      const items = d.items.map(it => {
        if (isReject) {
          return { ...it, received: Math.max(0, it.qty - 1), rejected: Math.min(it.qty, 1), reason: d.rejectReason ? d.rejectReason.split('—')[1]?.trim() || 'Damaged on arrival' : 'Damaged on arrival' };
        }
        return { ...it, received: it.qty, rejected: 0, reason: '' };
      });
      d.pod = {
        items, method,
        cashAmount: method === 'cash' ? d.invoiceAmount : 0,
        change: 0,
        receipt: method === 'bank' ? { name: `receipt-${d.invoiceNo}.png`, dataUrl: mockReceipt(d.invoiceNo, d.invoiceAmount), size: 18400, source: 'camera' } : null,
        reference: method === 'bank' ? `KBANK-2026-${(parseInt(d.invoiceNo.slice(-5)) % 99999).toString().padStart(5, '0')}` : '',
        signature: mockSig(sigName),
        podPhoto: null,
        sigMode: 'draw',
        signerName: sigName,
        notes: isReject ? 'Reject noted on delivery slip; customer acknowledged.' : '',
        capturedAt: (d.podDate || '2026-05-19') + 'T14:22:00.000Z',
        podDate: d.podDate,
        status: d.status,
        rejectReason: d.rejectReason,
      };
    }
  });

  return { customers, products, deliveries, truckSpec, drivers, groups, statusMeta,
           paymentTerms, fmtDate, fmtNum, fmtMoney, PALLET_KG, roles, users };
})();
