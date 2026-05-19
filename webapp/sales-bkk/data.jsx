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
// Sourced from GreenSpot_Integrated_Demo_Dataset.xlsx → Material Master + Sales Pricing (MT01-HYPER tier)
const PRODUCTS = {
  "VTM-LIT-300": { name: "ไวตามิ้ลค์ ไลท์ สูตรออริจินัล น้ำตาลน้อยลง 50% 300 มล. X 24 ขวด",
                   en: "Vitamilk Light Original 50% Less Sugar 300ml x 24 bottles",     price: 355.68 },
  "VTM-TGO-ORG": { name: "ไวตามิ้ลค์ นมถั่วเหลือง ทูโก ออริจินัล 300 มล. X 24 ขวด",
                   en: "Vitamilk Togo Original 300ml x 24 bottles",                     price: 299.52 },
  "VTM-TGO-CHO": { name: "ไวตามิ้ลค์ ทูโก ช็อกโก แกรนเด 300 มล. X 24 ขวด",
                   en: "Vitamilk Togo Choco Grande 300ml x 24 bottles",                 price: 355.68 },
  "VTM-TGO-RTT": { name: "ไวตามิ้ลค์ ทูโก รอยัล ไทย ที 300 มล. X 24 ขวด",
                   en: "Vitamilk Togo Royal Thai Tea 300ml x 24 bottles",               price: 355.68 },
  "VTM-UHT-BLK": { name: "ไวตามิ้ลค์ ยูเอชที สูตรงาดำ และข้าวสีนิล 300 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Black Sesame & Riceberry 300ml x 36 cartons",      price: 336.96 },
  "VTM-UHT-ORG": { name: "ไวตามิ้ลค์ ยูเอชที สูตรออริจินัล 300 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Original 300ml x 36 cartons",                      price: 336.96 },
  "VTM-UHT-LAC": { name: "ไวตามิ้ลค์ ยูเอชที สูตรน้ำตาลน้อยกว่า 250 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Less Sugar (Lactose Free) 250ml x 36",             price: 280.80 },
  "VTM-UHT-JAY": { name: "ไวตามิ้ลค์ ยูเอชที สูตรเจ 250 มล. X 36 กล่อง",
                   en: "Vitamilk UHT Vegetarian (Jay) 250ml x 36",                      price: 280.80 },
  "VSO-ALM-180": { name: "วีซอย นมถั่วเหลือง สูตรอัลมอนด์ 180 มล. X 36 กล่อง",
                   en: "V-Soy Almond 180ml x 36 cartons",                               price: 421.20 },
  "VSO-MLT-180": { name: "วีซอย นมถั่วเหลือง สูตรงามอลต์ 180 มล. X 36 กล่อง",
                   en: "V-Soy Sesame Malt 180ml x 36 cartons",                          price: 421.20 },
};

// ─── Customers (Thai FMCG channels) ────────────────────────────
// Sourced from GreenSpot_Integrated_Demo_Dataset.xlsx → Sold-to Master.
// payment type is dominant per customer; ship-tos inherit unless overridden
const CUSTOMERS = {
  "CN10045": { name: "บริษัท โลตัสส์ สโตร์ส (ประเทศไทย) จำกัด",         en: "Lotus's Stores (Thailand) Co., Ltd.",          pay: "credit", channel: "Modern Trade" },
  "CN10082": { name: "บริษัท ซีพี ออลล์ จำกัด (มหาชน) (เซเว่น อีเลฟเว่น)", en: "CP All Public Co., Ltd. (7-Eleven)",          pay: "credit", channel: "Convenience" },
  "CN10157": { name: "บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)",       en: "Big C Supercenter Public Co., Ltd.",           pay: "credit", channel: "Modern Trade" },
  "CN10213": { name: "บริษัท สยามแม็คโคร จำกัด (มหาชน)",                 en: "Siam Makro Public Co., Ltd.",                  pay: "credit", channel: "Cash & Carry" },
  "CN10421": { name: "ร้านสะดวกซื้อ ลุงสุข",                              en: "Lung Suk Convenience Shop",                    pay: "credit", channel: "Convenience" },
  "CN10560": { name: "ร้านป้าน้อย มาร์ท",                                 en: "Pa Noi Mart",                                  pay: "cash",   channel: "Traditional Trade" },
  "CN10732": { name: "ร้านเสริมทรัพย์ มินิมาร์ท",                          en: "Sermsap Mini-Mart",                            pay: "cash",   channel: "Traditional Trade" },
  "CN10891": { name: "ร้านคลองเตย เฟรช ชอป",                              en: "Khlong Toei Fresh Shop",                       pay: "cash",   channel: "Traditional Trade" },
  "CN11045": { name: "ร้านเจริญทรัพย์ ขายของชำ",                          en: "Jaroen Sap Grocery",                           pay: "cash",   channel: "Traditional Trade" },
  "CN11203": { name: "บริษัท เดอะมอลล์ กรุ๊ป จำกัด (กูร์เมต์ มาร์เก็ต)",   en: "The Mall Group Co., Ltd. (Gourmet Market)",    pay: "bank",   channel: "Premium Retail" },
  "CN11320": { name: "บริษัท สุขสำราญ ซูเปอร์มาร์เก็ต จำกัด",              en: "Suksamran Supermarket Co., Ltd.",              pay: "bank",   channel: "Local Supermarket" },
  "CN11451": { name: "บริษัท พิษณุโลก เฟรช มาร์ท จำกัด",                  en: "Phitsanulok Fresh Mart Co., Ltd.",             pay: "bank",   channel: "Local Supermarket" },
  "CN11620": { name: "ร้านซอยอารีย์ มินิมาร์ท",                            en: "Soi Aree Mini-Mart",                           pay: "credit", channel: "Convenience" },
  "CN11782": { name: "ร้านลาดพร้าว 71 มินิมาร์ท",                          en: "Lat Phrao 71 Mini-Mart",                       pay: "credit", channel: "Modern Trade" },
  "CN11901": { name: "บริษัท ไมเนอร์ โฮเทล กรุ๊ป จำกัด (มหาชน)",            en: "Minor Hotel Group Public Co., Ltd.",           pay: "bank",   channel: "HoReCa" },
  "CN12010": { name: "บริษัท เซ็นทรัล เรสตอรองส์ กรุ๊ป จำกัด",             en: "Central Restaurants Group Co., Ltd.",          pay: "cash",   channel: "HoReCa" },
  "CN12188": { name: "ร้านบางนา-ตราด ขายของชำ",                          en: "Bang Na Trad Shop",                            pay: "credit", channel: "Convenience" },
};

// ─── Ship-to addresses ─────────────────────────────────────────
// Sourced from GreenSpot_Integrated_Demo_Dataset.xlsx → Ship-to Master + Sold-to Master.
const SHIP_TO = {
  // Lotus's — Ship-to 2000101 / 2000102
  "ST-0451": { code: "CN10045", name: "ศูนย์กระจายสินค้าโลตัสส์ บางบัวทอง",  addr: "55 หมู่ 5 ถนนบางบัวทอง-สุพรรณบุรี ตำบลบางบัวทอง อำเภอบางบัวทอง นนทบุรี 11110" },
  "ST-0452": { code: "CN10045", name: "ศูนย์กระจายสินค้าโลตัสส์ วังน้อย",     addr: "99 หมู่ 2 ถนนพหลโยธิน ตำบลลำไทร อำเภอวังน้อย พระนครศรีอยุธยา 13170" },
  // CP All / 7-Eleven — Ship-to 2000301 / 2000302
  "ST-0821": { code: "CN10082", name: "ศูนย์กระจายสินค้า 7-Eleven สุวรรณภูมิ", addr: "111 ถนนบางนา-ตราด กม.19 อำเภอบางพลี สมุทรปราการ 10540" },
  "ST-0822": { code: "CN10082", name: "ศูนย์กระจายสินค้า 7-Eleven ลำพูน",     addr: "99 หมู่ 3 นิคมอุตสาหกรรมลำพูน ตำบลในเมือง อำเภอเมืองลำพูน ลำพูน 51000" },
  "ST-0823": { code: "CN10082", name: "ซีพี ออลล์ สำนักงานใหญ่ สีลม",          addr: "313 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500" },
  // Big C — Ship-to 2000202 (BKK store)
  "ST-1571": { code: "CN10157", name: "บิ๊กซี เอ็กซ์ตร้า พระราม 4",            addr: "2929 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110" },
  // Makro — Ship-to 2000501 / 2000502
  "ST-2131": { code: "CN10213", name: "แม็คโคร สาขาแจ้งวัฒนะ",                addr: "111 ถนนแจ้งวัฒนะ อำเภอปากเกร็ด นนทบุรี 11120" },
  "ST-2132": { code: "CN10213", name: "แม็คโคร สาขาภูเก็ต",                   addr: "100/9 ถนนเจ้าฟ้าตะวันตก ตำบลในเมือง อำเภอเมืองภูเก็ต ภูเก็ต 83000" },
  // Lung Suk Convenience Shop — Ship-to 2010801
  "ST-4211": { code: "CN10421", name: "ร้านสะดวกซื้อ ลุงสุข",                   addr: "15 ซอย 3 ถนนพหลโยธิน ตำบลในเมือง อำเภอเมืองลำปาง ลำปาง 52000" },
  // Pa Noi Mart — Ship-to 2010901
  "ST-5601": { code: "CN10560", name: "ร้านป้าน้อย มาร์ท",                     addr: "99/2 หมู่ 4 ตำบลท่าใหม่ อำเภอท่าใหม่ จันทบุรี 22120" },
  // Sermsap Mini-Mart — Ship-to 2010401
  "ST-7321": { code: "CN10732", name: "ร้านเสริมทรัพย์ มินิมาร์ท",              addr: "123 ถนนราชวิถี แขวงถนนพญาไท เขตพญาไท กรุงเทพฯ 10400" },
  // Khlong Toei Fresh Shop — Ship-to 2012301
  "ST-8911": { code: "CN10891", name: "ร้านคลองเตย เฟรช ชอป",                 addr: "189 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110" },
  // Jaroen Sap Grocery — Ship-to 2011201
  "ST-1045": { code: "CN11045", name: "ร้านเจริญทรัพย์ ขายของชำ",             addr: "78 ถนนเจริญกรุง แขวงบางรัก เขตบางรัก กรุงเทพฯ 10500" },
  // The Mall Group / Gourmet Market — Ship-to 2000401 / 2000402
  "ST-1203": { code: "CN11203", name: "กูร์เมต์ มาร์เก็ต สยามพารากอน",          addr: "991 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330" },
  "ST-1204": { code: "CN11203", name: "กูร์เมต์ มาร์เก็ต เอ็มควอเทียร์",         addr: "693 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110" },
  // Suksamran Supermarket — Ship-to 2010601 / 2010602
  "ST-1320": { code: "CN11320", name: "สุขสำราญ ซูเปอร์มาร์เก็ต โคราช",         addr: "88 ถนนสุขุมวิท ตำบลในเมือง อำเภอเมืองนครราชสีมา นครราชสีมา 30000" },
  // Phitsanulok Fresh Mart — Ship-to 2010701
  "ST-1451": { code: "CN11451", name: "พิษณุโลก เฟรช มาร์ท (สาขาหลัก)",        addr: "72/5 ถนนพระองค์ดำ ตำบลในเมือง อำเภอเมืองพิษณุโลก พิษณุโลก 65000" },
  // Soi Aree Mini-Mart — Ship-to 2012201
  "ST-1620": { code: "CN11620", name: "ร้านซอยอารีย์ มินิมาร์ท",                addr: "45 ซอยอารีย์ 5 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400" },
  // Lat Phrao 71 Mini-Mart — Ship-to 2012501
  "ST-1782": { code: "CN11782", name: "ร้านลาดพร้าว 71 มินิมาร์ท",              addr: "234 ซอยลาดพร้าว 71 แขวงวังทองหลาง เขตวังทองหลาง กรุงเทพฯ 10310" },
  // Minor Hotel Group / Anantara — Ship-to 2020101
  "ST-1901": { code: "CN11901", name: "อนันตรา ริเวอร์ไซด์ กรุงเทพฯ รีสอร์ท",    addr: "257/1-3 ถนนเจริญนคร เขตธนบุรี กรุงเทพฯ 10600" },
  // Central Restaurants Group — Ship-to 2020201
  "ST-2010": { code: "CN12010", name: "ครัวกลางและศูนย์กระจายสินค้า CRG บางนา", addr: "212 ถนนบางนา-ตราด กม.8 เขตบางนา กรุงเทพฯ 10260" },
  // Bang Na Trad Shop — Ship-to 2012601
  "ST-2188": { code: "CN12188", name: "ร้านบางนา-ตราด ขายของชำ",              addr: "555 ถนนบางนา-ตราด กม.6 แขวงบางนา เขตบางนา กรุงเทพฯ 10260" },
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
