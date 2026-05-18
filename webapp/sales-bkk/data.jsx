/* ──────────────────────────────────────────────────────────────
 * Mock data — Sales BKK Payment Settlement
 * Thai FMCG (non-daily / UHT long-shelf dairy)
 * Date context: 16 May 2026
 * ────────────────────────────────────────────────────────────── */

const TODAY = "16 May 2026";

// ─── Status taxonomy ──────────────────────────────────────────
// Draft → Submitted → Under review → (Settled → Closed) | Rejected → Rework
const STATUS = {
  draft:     { key: "draft",     label: "Draft",                     short: "Draft" },
  submitted: { key: "submitted", label: "Sales Admin Submitted",     short: "Submitted" },
  review:    { key: "review",    label: "Cashier Under Review",      short: "Under Review" },
  settled:   { key: "settled",   label: "Settled",                   short: "Settled" },
  closed:    { key: "closed",    label: "Closed (SAP Posted)",       short: "Closed" },
  rejected:  { key: "rejected",  label: "Rejected",                  short: "Rejected" },
  rework:    { key: "rework",    label: "Sales Admin Rework",        short: "Rework" },
};

// Status palettes — selectable via Tweaks
const STATUS_PALETTES = {
  fiori: {
    label: "Fiori default",
    draft:     { bg: "#EAE4EE", fg: "#556B82", dot: "#7F8C9A" },
    submitted: { bg: "#D1EFFF", fg: "#0064D9", dot: "#0070F2" },
    review:    { bg: "#FFF3B8", fg: "#7A5A00", dot: "#FF9900" },
    settled:   { bg: "#C2FCEE", fg: "#25713A", dot: "#30914C" },
    closed:    { bg: "#30914C", fg: "#FFFFFF", dot: "#FFFFFF" },
    rejected:  { bg: "#FFDBEF", fg: "#AA0808", dot: "#AA0808" },
    rework:    { bg: "#FFEEDB", fg: "#A65500", dot: "#FF9900" },
  },
  vivid: {
    label: "Vivid",
    draft:     { bg: "#3E4C5C", fg: "#FFFFFF", dot: "#FFFFFF" },
    submitted: { bg: "#0070F2", fg: "#FFFFFF", dot: "#FFFFFF" },
    review:    { bg: "#FF9900", fg: "#FFFFFF", dot: "#FFFFFF" },
    settled:   { bg: "#30914C", fg: "#FFFFFF", dot: "#FFFFFF" },
    closed:    { bg: "#1A5C30", fg: "#FFFFFF", dot: "#FFFFFF" },
    rejected:  { bg: "#AA0808", fg: "#FFFFFF", dot: "#FFFFFF" },
    rework:    { bg: "#C26200", fg: "#FFFFFF", dot: "#FFFFFF" },
  },
  subtle: {
    label: "Subtle",
    draft:     { bg: "#F5F6F7", fg: "#556B82", dot: "#7F8C9A",  border: "#D9D9D9" },
    submitted: { bg: "#F5F6F7", fg: "#0064D9", dot: "#0070F2",  border: "#80C8F0" },
    review:    { bg: "#F5F6F7", fg: "#A65500", dot: "#FF9900",  border: "#F0D56A" },
    settled:   { bg: "#F5F6F7", fg: "#25713A", dot: "#30914C",  border: "#96E6C8" },
    closed:    { bg: "#F5F6F7", fg: "#1A5C30", dot: "#1A5C30",  border: "#30914C" },
    rejected:  { bg: "#F5F6F7", fg: "#AA0808", dot: "#AA0808",  border: "#E8A0A0" },
    rework:    { bg: "#F5F6F7", fg: "#A65500", dot: "#FF9900",  border: "#FFB060" },
  },
};

// ─── Routes ────────────────────────────────────────────────────
const ROUTES = [
  { code: "BKK-CTR", name: "Bangkok Central"       },
  { code: "BKK-NOR", name: "Bangkok North"         },
  { code: "BKK-EST", name: "Bangkok East / Sukhumvit" },
  { code: "BKK-WST", name: "Bangkok West / Thonburi"  },
  { code: "BKK-STH", name: "Bangkok South / Bangna"   },
];

// ─── Payment types ─────────────────────────────────────────────
const PAYMENT_TYPES = [
  { key: "credit", label: "Credit",        thai: "เครดิต",         color: "#0064D9" },
  { key: "cash",   label: "Cash",          thai: "เงินสด",          color: "#30914C" },
  { key: "bank",   label: "Bank Transfer", thai: "โอนเงิน",         color: "#7B4FAB" },
];

// ─── Product catalogue (Vitamilk / V-Soy) ──────────────────────
const PRODUCTS = {
  "VTM-LIT-300": { name: "ไวตามิ้ลค์ ไลท์ สูตรออริจินัล น้ำตาลน้อยลง 50% 300 มล. X 24 ขวด",
                   en: "Vitamilk Light Original (50% less sugar) 300ml × 24 bottles",   price: 432 },
  "VTM-TGO-ORG": { name: "ไวตามิ้ลค์ นมถั่วเหลือง ทูโก ออริจินัล 300 มล. X 24 ขวด",
                   en: "Vitamilk ToGo Original Soy Milk 300ml × 24 bottles",            price: 432 },
  "VTM-TGO-CHO": { name: "ไวตามิ้ลค์ ทูโก ช็อกโก แกรนเด 300 มล. X 24 ขวด",
                   en: "Vitamilk ToGo Choco Grande 300ml × 24 bottles",                 price: 456 },
  "VTM-TGO-RTT": { name: "ไวตามิ้ลค์ ทูโก รอยัล ไทย ที 300 มล. X 24 ขวด",
                   en: "Vitamilk ToGo Royal Thai Tea 300ml × 24 bottles",               price: 456 },
  "VTM-UHT-BLK": { name: "ไวตามิ้ลค์ ยูเอชที สูตรงาดำ และข้าวสีนิล 300 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Black Sesame & Riceberry 300ml × 36 boxes",         price: 612 },
  "VTM-UHT-ORG": { name: "ไวตามิ้ลค์ ยูเอชที สูตรออริจินัล 300 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Original 300ml × 36 boxes",                         price: 540 },
  "VTM-UHT-LAC": { name: "ไวตามิ้ลค์ ยูเอชที สูตรน้ำตาลน้อยกว่า (ปราศจากน้ำตาลแลคโตส) 250 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Less Sugar (Lactose-free) 250ml × 36 boxes",        price: 504 },
  "VTM-UHT-JAY": { name: "ไวตามิ้ลค์ ยูเอชที สูตรเจ 250 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Vegetarian (Jay) 250ml × 36 boxes",                 price: 504 },
  "VSO-ALM-180": { name: "วีซอย นมถั่วเหลือง สูตรอัลมอนด์ 180 มล. X 36 กล่อง",
                   en: "V-Soy Almond Soy Milk 180ml × 36 boxes",                         price: 396 },
  "VSO-MLT-180": { name: "วีซอย นมถั่วเหลือง สูตรงามอลต์ 180 มล. X 36 กล่อง",
                   en: "V-Soy Malt Soy Milk 180ml × 36 boxes",                           price: 396 },
};

// ─── Customers (Thai FMCG channels) ────────────────────────────
// payment type is dominant per customer; ship-tos inherit unless overridden
const CUSTOMERS = {
  "CN10045": { name: "บริษัท เอก-ชัย ดีสทริบิวชั่น ซิสเทม จำกัด",  en: "Lotus's HQ (Ek-Chai)",     pay: "credit", channel: "Modern Trade" },
  "CN10082": { name: "บริษัท ซีพี ออลล์ จำกัด (มหาชน)",            en: "CP All — 7-Eleven",        pay: "credit", channel: "Convenience" },
  "CN10157": { name: "บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)", en: "Big C Supercenter",         pay: "credit", channel: "Modern Trade" },
  "CN10213": { name: "บริษัท สยามแม็คโคร จำกัด (มหาชน)",         en: "Siam Makro",                pay: "credit", channel: "Wholesale" },
  "CN10421": { name: "บริษัท เซ็นทรัล แฟมิลี่มาร์ท จำกัด",         en: "Family Mart Thailand",      pay: "credit", channel: "Convenience" },
  "CN10560": { name: "ร้านสะดวกซื้อ ป้าน้อย เจริญกรุง",            en: "Pa Noi mini-mart",          pay: "cash",   channel: "Traditional Trade" },
  "CN10732": { name: "มินิมาร์ท แสงสว่าง สีลม",                    en: "Saeng Sawang mini-mart",    pay: "cash",   channel: "Traditional Trade" },
  "CN10891": { name: "ร้านค้าส่ง คลองเตย ล็อค A-12",               en: "Khlong Toei wholesale A-12",pay: "cash",   channel: "Wholesale" },
  "CN11045": { name: "ร้านโชห่วย จิตติพร อโศก",                    en: "Jittiporn grocery",         pay: "cash",   channel: "Traditional Trade" },
  "CN11203": { name: "บริษัท เดอะ มอลล์ กรุ๊ป จำกัด — กูร์เมต์ มาร์เก็ต", en: "Gourmet Market (The Mall)", pay: "bank", channel: "Premium Retail" },
  "CN11320": { name: "บริษัท วิลลา มาร์เก็ต เจพี จำกัด",            en: "Villa Market",              pay: "bank",   channel: "Premium Retail" },
  "CN11451": { name: "บริษัท ฟู้ดแลนด์ ซูเปอร์มาร์เก็ต จำกัด",      en: "Foodland Supermarket",      pay: "bank",   channel: "Premium Retail" },
  "CN11620": { name: "บริษัท สห ลอว์สัน จำกัด",                    en: "Lawson 108",                pay: "credit", channel: "Convenience" },
  "CN11782": { name: "บริษัท เซ็นทรัล ฟู้ด รีเทล จำกัด — ท็อปส์",   en: "Tops Daily / Central Food", pay: "credit", channel: "Modern Trade" },
  "CN11901": { name: "โรงแรม เซ็นทารา แกรนด์ ลาดพร้าว",            en: "Centara Grand Ladprao",     pay: "bank",   channel: "HoReCa" },
  "CN12010": { name: "ร้านกาแฟ บ้านระเบียง ทองหล่อ",               en: "Baan Rabieng Cafe",         pay: "cash",   channel: "HoReCa" },
  "CN12188": { name: "บริษัท ซีเจ มอร์ จำกัด",                     en: "CJ More",                   pay: "credit", channel: "Convenience" },
};

// ─── Ship-to addresses ─────────────────────────────────────────
const SHIP_TO = {
  // Lotus's branches
  "ST-0451": { code: "CN10045", name: "Lotus's สาขาพระราม 4",        addr: "1693 ถ.พระราม 4 คลองเตย กรุงเทพฯ 10110" },
  "ST-0452": { code: "CN10045", name: "Lotus's สาขาบางนา",            addr: "589/15 ถ.บางนา-ตราด บางนา กรุงเทพฯ 10260" },
  // 7-Eleven branches
  "ST-0821": { code: "CN10082", name: "7-Eleven สาขาสุขุมวิท 23",     addr: "23/4 สุขุมวิท 23 วัฒนา กรุงเทพฯ 10110" },
  "ST-0822": { code: "CN10082", name: "7-Eleven สาขาอโศก",            addr: "100/1 ถ.อโศกมนตรี วัฒนา กรุงเทพฯ 10110" },
  "ST-0823": { code: "CN10082", name: "7-Eleven สาขาทองหล่อ 10",      addr: "55 ทองหล่อ 10 วัฒนา กรุงเทพฯ 10110" },
  // Big C
  "ST-1571": { code: "CN10157", name: "Big C สาขารัชดาภิเษก",         addr: "97/11 ถ.รัชดาภิเษก ดินแดง กรุงเทพฯ 10400" },
  // Makro
  "ST-2131": { code: "CN10213", name: "Makro สาขาลาดพร้าว",           addr: "3498 ถ.ลาดพร้าว วังทองหลาง กรุงเทพฯ 10310" },
  "ST-2132": { code: "CN10213", name: "Makro สาขาบางบอน",             addr: "127 ถ.บางบอน 1 บางบอน กรุงเทพฯ 10150" },
  // Family Mart
  "ST-4211": { code: "CN10421", name: "Family Mart สำนักงานใหญ่",     addr: "999/9 ถ.พระราม 1 ปทุมวัน กรุงเทพฯ 10330" },
  // Mom-and-pop
  "ST-5601": { code: "CN10560", name: "ป้าน้อย เจริญกรุง 36",         addr: "245 เจริญกรุง 36 บางรัก กรุงเทพฯ 10500" },
  "ST-7321": { code: "CN10732", name: "แสงสว่าง สีลม ซ.5",            addr: "12/3 สีลม ซ.5 บางรัก กรุงเทพฯ 10500" },
  "ST-8911": { code: "CN10891", name: "ตลาดคลองเตย ล็อค A-12",        addr: "ตลาดคลองเตย คลองเตย กรุงเทพฯ 10110" },
  "ST-1045": { code: "CN11045", name: "จิตติพร อโศก ซ.13",             addr: "78 อโศก-ดินแดง วัฒนา กรุงเทพฯ 10110" },
  // Gourmet / Villa / Foodland
  "ST-1203": { code: "CN11203", name: "Gourmet Market สยามพารากอน",    addr: "991 พระราม 1 ปทุมวัน กรุงเทพฯ 10330" },
  "ST-1204": { code: "CN11203", name: "Gourmet Market เอ็มควอเทียร์",  addr: "693 สุขุมวิท วัฒนา กรุงเทพฯ 10110" },
  "ST-1320": { code: "CN11320", name: "Villa Market สุขุมวิท 33",      addr: "32 สุขุมวิท 33 วัฒนา กรุงเทพฯ 10110" },
  "ST-1451": { code: "CN11451", name: "Foodland ปิ่นเกล้า",             addr: "7/3 บรมราชชนนี บางพลัด กรุงเทพฯ 10700" },
  // Lawson
  "ST-1620": { code: "CN11620", name: "Lawson 108 สาขาเอกมัย",         addr: "1093 สุขุมวิท 63 วัฒนา กรุงเทพฯ 10110" },
  // Tops
  "ST-1782": { code: "CN11782", name: "Tops Daily ทองหล่อ ซ.13",       addr: "55 ทองหล่อ 13 วัฒนา กรุงเทพฯ 10110" },
  // Centara
  "ST-1901": { code: "CN11901", name: "Centara Grand ลาดพร้าว",        addr: "1695 ถ.พหลโยธิน จตุจักร กรุงเทพฯ 10900" },
  // Cafe
  "ST-2010": { code: "CN12010", name: "บ้านระเบียง ทองหล่อ",            addr: "10 ทองหล่อ 13 วัฒนา กรุงเทพฯ 10110" },
  // CJ
  "ST-2188": { code: "CN12188", name: "CJ More สาขาบางนา",             addr: "788 บางนา-ตราด บางนา กรุงเทพฯ 10260" },
};

// ─── Trucks (today: 16 May 2026) ───────────────────────────────
const TRUCKS = [
  { no: "TRK-1042", plate: "70-8845",  driver: "สมชาย ใจดี",      driverEn: "Somchai Jaidee",     route: "BKK-CTR", depart: "06:20", returnT: "14:50" },
  { no: "TRK-1043", plate: "70-9120",  driver: "วิชัย รุ่งเรือง",   driverEn: "Wichai Rungrueang",  route: "BKK-NOR", depart: "06:00", returnT: "15:30" },
  { no: "TRK-1044", plate: "71-2245",  driver: "ประยุทธ มั่นคง",   driverEn: "Prayuth Mankong",    route: "BKK-EST", depart: "06:10", returnT: "16:15" },
  { no: "TRK-1045", plate: "71-5567",  driver: "อนุชา สว่างใส",   driverEn: "Anucha Sawangsai",   route: "BKK-WST", depart: "06:30", returnT: "15:45" },
  { no: "TRK-1046", plate: "72-1183",  driver: "ธนากร พิมพ์งาม",  driverEn: "Tanakorn Pimngam",   route: "BKK-STH", depart: "05:50", returnT: "14:30" },
  { no: "TRK-1047", plate: "72-4490",  driver: "สุชาติ พรหมเทพ",  driverEn: "Suchart Promtep",    route: "BKK-CTR", depart: "06:25", returnT: "15:10" },
  { no: "TRK-1048", plate: "72-7712",  driver: "นิรันดร์ ทองดี",   driverEn: "Niran Thongdee",     route: "BKK-EST", depart: "06:00", returnT: "16:00" },
];

// helpers
const fmtTHB = n => "฿" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = n => n.toLocaleString("en-US") + " CS"; // cases

// ─── Billings & deliveries — generated from a tight description ──
// Each billing: { billingNo, deliveryNo, shipTo, lines:[{sku,qty}], payment, status }
// Truck rolls up its billings.

const RAW = [
  // ─── TRK-1042 — central — Modern + premium mix ──────────────
  { truck: "TRK-1042", shipTo: "ST-0451", delivery: "DN-540021", billing: "BL-880331",
    status: "settled", payment: "credit",
    lines: [["VTM-UHT-ORG", 120], ["VTM-TGO-CHO", 60], ["VTM-UHT-BLK", 30], ["VTM-LIT-300", 24]] },
  { truck: "TRK-1042", shipTo: "ST-0452", delivery: "DN-540022", billing: "BL-880332",
    status: "settled", payment: "credit",
    lines: [["VTM-UHT-ORG", 80], ["VTM-UHT-JAY", 24]] },
  { truck: "TRK-1042", shipTo: "ST-1203", delivery: "DN-540023", billing: "BL-880333",
    status: "review", payment: "bank",
    lines: [["VTM-UHT-ORG", 40], ["VTM-TGO-RTT", 30], ["VSO-MLT-180", 12]] },
  { truck: "TRK-1042", shipTo: "ST-1204", delivery: "DN-540024", billing: "BL-880334",
    status: "review", payment: "bank",
    lines: [["VTM-TGO-CHO", 36], ["VTM-UHT-LAC", 18]] },
  { truck: "TRK-1042", shipTo: "ST-5601", delivery: "DN-540025", billing: "BL-880335",
    status: "review", payment: "cash",
    lines: [["VTM-UHT-ORG", 6], ["VTM-TGO-ORG", 4], ["VSO-ALM-180", 3]] },

  // ─── TRK-1043 — north — convenience-heavy ───────────────────
  { truck: "TRK-1043", shipTo: "ST-0821", delivery: "DN-540031", billing: "BL-880341",
    status: "review", payment: "credit",
    lines: [["VTM-UHT-ORG", 24], ["VTM-TGO-CHO", 24], ["VTM-TGO-ORG", 18]] },
  { truck: "TRK-1043", shipTo: "ST-0822", delivery: "DN-540032", billing: "BL-880342",
    status: "review", payment: "credit",
    lines: [["VTM-UHT-ORG", 30], ["VTM-TGO-RTT", 18], ["VTM-LIT-300", 12]] },
  { truck: "TRK-1043", shipTo: "ST-1901", delivery: "DN-540033", billing: "BL-880343",
    status: "review", payment: "bank",
    lines: [["VTM-UHT-LAC", 24], ["VSO-MLT-180", 36], ["VSO-ALM-180", 18]] },
  { truck: "TRK-1043", shipTo: "ST-2010", delivery: "DN-540034", billing: "BL-880344",
    status: "rejected", payment: "cash",
    lines: [["VTM-UHT-ORG", 4], ["VSO-MLT-180", 6]],
    rejectReason: "Cash short by ฿420. Driver to reconcile receipts." },
  { truck: "TRK-1043", shipTo: "ST-2188", delivery: "DN-540035", billing: "BL-880345",
    status: "submitted", payment: "credit",
    lines: [["VTM-UHT-ORG", 30], ["VTM-TGO-CHO", 12], ["VTM-TGO-ORG", 12]] },

  // ─── TRK-1044 — east — high-volume convenience ──────────────
  { truck: "TRK-1044", shipTo: "ST-0823", delivery: "DN-540041", billing: "BL-880351",
    status: "submitted", payment: "credit",
    lines: [["VTM-UHT-ORG", 36], ["VTM-TGO-CHO", 24], ["VTM-TGO-RTT", 18]] },
  { truck: "TRK-1044", shipTo: "ST-1620", delivery: "DN-540042", billing: "BL-880352",
    status: "submitted", payment: "credit",
    lines: [["VTM-UHT-ORG", 24], ["VTM-TGO-ORG", 18], ["VSO-ALM-180", 6]] },
  { truck: "TRK-1044", shipTo: "ST-1320", delivery: "DN-540043", billing: "BL-880353",
    status: "submitted", payment: "bank",
    lines: [["VTM-UHT-ORG", 18], ["VTM-UHT-JAY", 12], ["VSO-MLT-180", 12]] },
  { truck: "TRK-1044", shipTo: "ST-1782", delivery: "DN-540044", billing: "BL-880354",
    status: "submitted", payment: "credit",
    lines: [["VTM-UHT-ORG", 30], ["VTM-TGO-CHO", 18], ["VTM-UHT-LAC", 12]] },
  { truck: "TRK-1044", shipTo: "ST-1045", delivery: "DN-540045", billing: "BL-880355",
    status: "submitted", payment: "cash",
    lines: [["VTM-UHT-ORG", 6], ["VTM-TGO-CHO", 6], ["VTM-UHT-BLK", 3]] },

  // ─── TRK-1045 — west — wholesale + premium ──────────────────
  { truck: "TRK-1045", shipTo: "ST-2131", delivery: "DN-540051", billing: "BL-880361",
    status: "draft", payment: "credit",
    lines: [["VTM-UHT-ORG", 240], ["VTM-TGO-CHO", 120], ["VTM-UHT-JAY", 60], ["VTM-UHT-BLK", 96], ["VTM-LIT-300", 36]] },
  { truck: "TRK-1045", shipTo: "ST-2132", delivery: "DN-540052", billing: "BL-880362",
    status: "draft", payment: "credit",
    lines: [["VTM-UHT-ORG", 180], ["VTM-UHT-LAC", 48], ["VSO-ALM-180", 36]] },
  { truck: "TRK-1045", shipTo: "ST-1451", delivery: "DN-540053", billing: "BL-880363",
    status: "draft", payment: "bank",
    lines: [["VTM-UHT-ORG", 24], ["VTM-TGO-RTT", 18], ["VSO-MLT-180", 12]] },

  // ─── TRK-1046 — south — small shops, cash-heavy ─────────────
  { truck: "TRK-1046", shipTo: "ST-7321", delivery: "DN-540061", billing: "BL-880371",
    status: "rework", payment: "cash",
    lines: [["VTM-UHT-ORG", 8], ["VTM-TGO-CHO", 6], ["VTM-TGO-ORG", 4]],
    rejectReason: "Receipt #R-7321-3 amount mismatch with billing total. Please re-submit with correction." },
  { truck: "TRK-1046", shipTo: "ST-8911", delivery: "DN-540062", billing: "BL-880372",
    status: "rework", payment: "cash",
    lines: [["VTM-UHT-ORG", 12], ["VTM-UHT-LAC", 6], ["VTM-UHT-BLK", 8]] },
  { truck: "TRK-1046", shipTo: "ST-1571", delivery: "DN-540063", billing: "BL-880373",
    status: "closed", payment: "credit",
    lines: [["VTM-UHT-ORG", 60], ["VTM-TGO-CHO", 36], ["VTM-UHT-JAY", 18]] },
  { truck: "TRK-1046", shipTo: "ST-4211", delivery: "DN-540064", billing: "BL-880374",
    status: "closed", payment: "credit",
    lines: [["VTM-UHT-ORG", 36], ["VTM-TGO-RTT", 24], ["VTM-TGO-ORG", 12]] },

  // ─── TRK-1047 — central — split status (in-progress) ────────
  { truck: "TRK-1047", shipTo: "ST-0822", delivery: "DN-540071", billing: "BL-880381",
    status: "submitted", payment: "credit",
    lines: [["VTM-UHT-ORG", 30], ["VTM-TGO-CHO", 18]] },
  { truck: "TRK-1047", shipTo: "ST-1203", delivery: "DN-540072", billing: "BL-880382",
    status: "submitted", payment: "bank",
    lines: [["VTM-UHT-ORG", 36], ["VTM-UHT-LAC", 12], ["VSO-ALM-180", 6]] },

  // ─── TRK-1048 — east — settled & closed mix ─────────────────
  { truck: "TRK-1048", shipTo: "ST-0821", delivery: "DN-540081", billing: "BL-880391",
    status: "closed", payment: "credit",
    lines: [["VTM-UHT-ORG", 24], ["VTM-TGO-CHO", 18], ["VTM-TGO-ORG", 12]] },
  { truck: "TRK-1048", shipTo: "ST-1782", delivery: "DN-540082", billing: "BL-880392",
    status: "settled", payment: "credit",
    lines: [["VTM-UHT-ORG", 30], ["VTM-TGO-RTT", 24]] },
  { truck: "TRK-1048", shipTo: "ST-1620", delivery: "DN-540083", billing: "BL-880393",
    status: "settled", payment: "credit",
    lines: [["VTM-UHT-ORG", 18], ["VTM-TGO-CHO", 12], ["VSO-ALM-180", 6]] },
];

// ─── Compute totals + denormalize ───────────────────────────────
const TAX_RATE = 0.07; // Thailand VAT 7%

function computeBilling(b) {
  let net = 0, qty = 0;
  const lines = b.lines.map(([sku, q]) => {
    const p = PRODUCTS[sku];
    const lineNet = p.price * q;
    net += lineNet;
    qty += q;
    return { sku, name: p.name, en: p.en, qty: q, unitPrice: p.price, net: lineNet };
  });
  const tax = +(net * TAX_RATE).toFixed(2);
  const total = +(net + tax).toFixed(2);
  return { ...b, lines, net, tax, total, qty };
}

const BILLINGS = RAW.map(computeBilling);

// Group customers → deliveries → billings
function groupCustomers(billings) {
  const byCust = {};
  billings.forEach(b => {
    const st = SHIP_TO[b.shipTo];
    const cust = CUSTOMERS[st.code];
    if (!byCust[st.code]) byCust[st.code] = { code: st.code, ...cust, shipTos: {} };
    if (!byCust[st.code].shipTos[b.shipTo]) byCust[st.code].shipTos[b.shipTo] = { code: b.shipTo, ...st, deliveries: {} };
    if (!byCust[st.code].shipTos[b.shipTo].deliveries[b.delivery])
      byCust[st.code].shipTos[b.shipTo].deliveries[b.delivery] = { no: b.delivery, billings: [] };
    byCust[st.code].shipTos[b.shipTo].deliveries[b.delivery].billings.push(b);
  });
  return byCust;
}

// Per-truck rollup
function truckRollup(truckNo) {
  const bs = BILLINGS.filter(b => b.truck === truckNo);
  const sum = { qty: 0, credit: 0, cash: 0, bank: 0, total: 0, net: 0, tax: 0 };
  bs.forEach(b => {
    sum.qty   += b.qty;
    sum.net   += b.net;
    sum.tax   += b.tax;
    sum.total += b.total;
    sum[b.payment] += b.total;
  });
  // dominant truck status: worst-active wins
  const order = ["draft","rework","rejected","submitted","review","settled","closed"];
  const statuses = bs.map(b => b.status);
  let truckStatus = "closed";
  for (const s of order) if (statuses.includes(s)) { truckStatus = s; break; }
  return { ...sum, count: bs.length, status: truckStatus, billings: bs };
}

const TRUCKS_WITH_TOTALS = TRUCKS.map(t => ({ ...t, ...truckRollup(t.no) }));

// Global KPIs
const KPIS = (() => {
  const k = { qty: 0, credit: 0, cash: 0, bank: 0, total: 0, count: BILLINGS.length, customers: 0,
              pendingReview: 0, rework: 0, closed: 0, settled: 0 };
  BILLINGS.forEach(b => {
    k.qty += b.qty; k.total += b.total;
    k[b.payment] += b.total;
    if (b.status === "submitted") k.pendingReview++;
    if (b.status === "review")    k.pendingReview++;
    if (b.status === "rework")    k.rework++;
    if (b.status === "closed")    k.closed++;
    if (b.status === "settled")   k.settled++;
  });
  const customers = new Set();
  BILLINGS.forEach(b => customers.add(SHIP_TO[b.shipTo].code));
  k.customers = customers.size;
  return k;
})();

// Expose globally
Object.assign(window, {
  TODAY, STATUS, STATUS_PALETTES, ROUTES, PAYMENT_TYPES, PRODUCTS,
  CUSTOMERS, SHIP_TO, TRUCKS, BILLINGS, TRUCKS_WITH_TOTALS, KPIS,
  fmtTHB, fmtQty, groupCustomers, TAX_RATE,
});
