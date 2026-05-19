// Mock data for the E-Tax Invoice Portal
// All amounts in THB

window.MOCK_DATA = (() => {
  const customers = [
    { soldTo: "10001245", name: "Tesco Lotus Public Co., Ltd.", nameTh: "บริษัท เทสโก้ โลตัส (ประเทศไทย) จำกัด", taxId: "0107536000235", branch: "00000", address: "629/1 Nawamin Rd., Khlong Kum, Bueng Kum, Bangkok 10240", addressTh: "629/1 ถนนนวมินทร์ แขวงคลองกุ่ม เขตบึงกุ่ม กรุงเทพมหานคร 10240", masterCopies: 3, requiresPo: true, paymentTerms: "Net 30" },
    { soldTo: "10002387", name: "Big C Supercenter Co., Ltd.", nameTh: "บริษัท บิ๊กซี ซูเปอร์เซ็นเตอร์ จำกัด (มหาชน)", taxId: "0107536000758", branch: "00000", address: "97/11 Rajdamri Rd., Lumpini, Pathumwan, Bangkok 10330", addressTh: "97/11 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330", masterCopies: 2, requiresPo: true, paymentTerms: "Net 45" },
    { soldTo: "10003411", name: "CP All Public Co., Ltd. (7-Eleven)", nameTh: "บริษัท ซีพี ออลล์ จำกัด (มหาชน)", taxId: "0107542000011", branch: "00001", address: "313 Silom Rd., Silom, Bang Rak, Bangkok 10500", addressTh: "313 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500", masterCopies: 4, requiresPo: true, paymentTerms: "Net 30" },
    { soldTo: "10004102", name: "Makro Public Co., Ltd.", nameTh: "บริษัท สยามแม็คโคร จำกัด (มหาชน)", taxId: "0107537000513", branch: "00000", address: "1468 Phatthanakan Rd., Suanluang, Bangkok 10250", addressTh: "1468 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร 10250", masterCopies: 2, requiresPo: false, paymentTerms: "Net 60" },
    { soldTo: "10005523", name: "Family Mart (Thailand) Co., Ltd.", nameTh: "บริษัท แฟมิลี่มาร์ท จำกัด", taxId: "0105549000178", branch: "00000", address: "108 Sukhumvit 23, Khlong Toei Nuea, Watthana, Bangkok 10110", addressTh: "108 ถนนสุขุมวิท 23 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110", masterCopies: 2, requiresPo: false, paymentTerms: "Net 30" },
    { soldTo: "10006108", name: "Robinson Department Store Plc.", nameTh: "บริษัท โรบินสัน จำกัด (มหาชน)", taxId: "0107535000269", branch: "00000", address: "139 Rajadamri Rd., Lumpini, Pathumwan, Bangkok 10330", addressTh: "139 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330", masterCopies: 1, requiresPo: false, paymentTerms: "Net 30" },
    { soldTo: "10007220", name: "Villa Market JP Co., Ltd.", nameTh: "บริษัท วิลล่ามาร์เก็ต เจพี จำกัด", taxId: "0105525000324", branch: "00000", address: "33 Soi Sukhumvit 49, Khlong Tan Nuea, Watthana, Bangkok 10110", addressTh: "33 ซอยสุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110", masterCopies: 1, requiresPo: false, paymentTerms: "Net 30" },
    { soldTo: "10008441", name: "Foodland Supermarket Co., Ltd.", nameTh: "บริษัท ฟู้ดแลนด์ ซูเปอร์มาร์เก็ต จำกัด", taxId: "0105515006621", branch: "00000", address: "1037 Phloen Chit Rd., Lumpini, Pathum Wan, Bangkok 10330", addressTh: "1037 ถนนเพลินจิต แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330", masterCopies: 2, requiresPo: false, paymentTerms: "Net 45" },
  ];

  const shipTos = [
    // Format: [shipTo, soldTo, name, address, requiresDeliveryNote]
    { shipTo: "20001245", soldTo: "10001245", name: "Tesco Lotus Bangkapi DC", nameTh: "เทสโก้ โลตัส ศูนย์กระจายสินค้า บางกะปิ", address: "555 Lat Phrao Rd., Bangkapi, Bangkok 10240", requiresDeliveryNote: true },
    { shipTo: "20001246", soldTo: "10001245", name: "Tesco Lotus Wang Hin Branch", nameTh: "เทสโก้ โลตัส สาขาวังหิน", address: "Wang Hin Rd., Lat Phrao, Bangkok 10230", requiresDeliveryNote: true },
    { shipTo: "20001247", soldTo: "10001245", name: "Tesco Lotus Rama 2 DC", nameTh: "เทสโก้ โลตัส ศูนย์กระจายสินค้า พระราม 2", address: "Rama II Rd., Bang Khun Thian, Bangkok 10150", requiresDeliveryNote: false },
    { shipTo: "20002387", soldTo: "10002387", name: "Big C Rajdamri Branch", nameTh: "บิ๊กซี สาขาราชดำริ", address: "97/11 Rajdamri Rd., Lumpini, Bangkok 10330", requiresDeliveryNote: true },
    { shipTo: "20002388", soldTo: "10002387", name: "Big C Bang Phli DC", nameTh: "บิ๊กซี ศูนย์กระจายสินค้า บางพลี", address: "Bang Phli, Samut Prakan 10540", requiresDeliveryNote: false },
    { shipTo: "20003411", soldTo: "10003411", name: "CP All Bang Bua Thong DC", nameTh: "ซีพี ออลล์ ศูนย์กระจายสินค้า บางบัวทอง", address: "Bang Bua Thong, Nonthaburi 11110", requiresDeliveryNote: true },
    { shipTo: "20003412", soldTo: "10003411", name: "CP All Lat Krabang DC", nameTh: "ซีพี ออลล์ ศูนย์กระจายสินค้า ลาดกระบัง", address: "Lat Krabang, Bangkok 10520", requiresDeliveryNote: true },
    { shipTo: "20004102", soldTo: "10004102", name: "Makro Lat Phrao", nameTh: "แม็คโคร ลาดพร้าว", address: "3498 Lat Phrao Rd., Khlong Chan, Bangkok 10240", requiresDeliveryNote: false },
    { shipTo: "20005523", soldTo: "10005523", name: "Family Mart Sukhumvit DC", nameTh: "แฟมิลี่มาร์ท ศูนย์กระจายสินค้า สุขุมวิท", address: "108 Sukhumvit 23, Watthana, Bangkok 10110", requiresDeliveryNote: false },
    { shipTo: "20006108", soldTo: "10006108", name: "Robinson Rajdamri", nameTh: "โรบินสัน ราชดำริ", address: "139 Rajadamri Rd., Lumpini, Bangkok 10330", requiresDeliveryNote: false },
    { shipTo: "20007220", soldTo: "10007220", name: "Villa Market Sukhumvit 49", nameTh: "วิลล่ามาร์เก็ต สุขุมวิท 49", address: "33 Soi Sukhumvit 49, Watthana, Bangkok 10110", requiresDeliveryNote: false },
    { shipTo: "20008441", soldTo: "10008441", name: "Foodland Phloen Chit", nameTh: "ฟู้ดแลนด์ เพลินจิต", address: "1037 Phloen Chit Rd., Lumpini, Bangkok 10330", requiresDeliveryNote: true },
  ];

  // Materials catalog (Greenspot product line — drinks)
  const materials = [
    { code: "GS-EQ-325-24", desc: "Equal น้ำผลไม้รวมเพื่อสุขภาพ 325ml × 24", descEn: "Equal Mixed Fruit Juice 325ml × 24", uom: "CASE", unitPrice: 480.00 },
    { code: "GS-OR-325-24", desc: "Greenspot น้ำส้ม 325ml × 24", descEn: "Greenspot Orange 325ml × 24", uom: "CASE", unitPrice: 444.00 },
    { code: "GS-LY-325-24", desc: "Greenspot ลิ้นจี่ 325ml × 24", descEn: "Greenspot Lychee 325ml × 24", uom: "CASE", unitPrice: 456.00 },
    { code: "GS-CR-325-24", desc: "Greenspot ครีมโซดา 325ml × 24", descEn: "Greenspot Cream Soda 325ml × 24", uom: "CASE", unitPrice: 432.00 },
    { code: "GS-WT-600-12", desc: "น้ำดื่มกรีนสปอต 600ml × 12", descEn: "Greenspot Drinking Water 600ml × 12", uom: "CASE", unitPrice: 84.00 },
    { code: "GS-EQ-1L-12", desc: "Equal น้ำส้ม 1L × 12", descEn: "Equal Orange Juice 1L × 12", uom: "CASE", unitPrice: 588.00 },
    { code: "GS-VT-180-30", desc: "Veggie น้ำผักรวม 180ml × 30", descEn: "Veggie Mixed Vegetable 180ml × 30", uom: "CASE", unitPrice: 540.00 },
  ];

  // Helper to build a delivery
  const mkDelivery = (i, opts) => {
    const c = customers.find(x => x.soldTo === opts.soldTo);
    const s = shipTos.find(x => x.shipTo === opts.shipTo);
    const items = opts.items.map((it, idx) => {
      const m = materials.find(m => m.code === it.code);
      return {
        line: (idx + 1) * 10,
        ...m,
        qty: it.qty,
        amount: +(m.unitPrice * it.qty).toFixed(2),
      };
    });
    const subtotal = items.reduce((a, b) => a + b.amount, 0);
    const vat = +(subtotal * 0.07).toFixed(2);
    const total = +(subtotal + vat).toFixed(2);
    return {
      id: opts.id,
      delivery: opts.delivery,
      poNumber: opts.po,
      pgiDate: opts.pgiDate,
      shippingPoint: opts.sp || "BKK1",
      route: opts.route || "BKK-Central",
      soldTo: c.soldTo,
      soldToName: c.name,
      soldToNameTh: c.nameTh,
      soldToAddress: c.address,
      soldToAddressTh: c.addressTh,
      soldToTaxId: c.taxId,
      soldToBranch: c.branch,
      soldToPaymentTerms: c.paymentTerms,
      soldToMasterCopies: c.masterCopies,
      soldToRequiresPo: c.requiresPo,
      shipTo: s.shipTo,
      shipToName: s.name,
      shipToNameTh: s.nameTh,
      shipToAddress: s.address,
      shipToRequiresDeliveryNote: s.requiresDeliveryNote,
      items,
      subtotal,
      vat,
      total,
      status: opts.status || "ready",
      billingDoc: opts.billingDoc || null,
      inetStatus: opts.inetStatus || null,
      printCount: opts.printCount || 0,
    };
  };

  const deliveries = [
    mkDelivery(0, { id: "D-0001", delivery: "0080145201", po: "PO-2026-08821", pgiDate: "2026-05-04", soldTo: "10001245", shipTo: "20001245", items: [{ code: "GS-EQ-325-24", qty: 240 }, { code: "GS-OR-325-24", qty: 180 }, { code: "GS-CR-325-24", qty: 120 }], status: "ready" }),
    mkDelivery(1, { id: "D-0002", delivery: "0080145202", po: "PO-2026-08822", pgiDate: "2026-05-04", soldTo: "10001245", shipTo: "20001246", items: [{ code: "GS-WT-600-12", qty: 800 }], status: "ready" }),
    mkDelivery(2, { id: "D-0003", delivery: "0080145203", po: "PO-2026-08823", pgiDate: "2026-05-04", soldTo: "10001245", shipTo: "20001247", items: [{ code: "GS-LY-325-24", qty: 96 }, { code: "GS-CR-325-24", qty: 72 }], status: "ready" }),
    mkDelivery(3, { id: "D-0004", delivery: "0080145210", po: "PO-2026-08840", pgiDate: "2026-05-04", soldTo: "10002387", shipTo: "20002387", items: [{ code: "GS-EQ-325-24", qty: 360 }, { code: "GS-VT-180-30", qty: 96 }], status: "ready" }),
    mkDelivery(4, { id: "D-0005", delivery: "0080145211", po: "PO-2026-08841", pgiDate: "2026-05-04", soldTo: "10002387", shipTo: "20002388", items: [{ code: "GS-OR-325-24", qty: 240 }, { code: "GS-LY-325-24", qty: 192 }], status: "ready" }),
    mkDelivery(5, { id: "D-0006", delivery: "0080145220", po: "PO-2026-08855", pgiDate: "2026-05-04", soldTo: "10003411", shipTo: "20003411", items: [{ code: "GS-EQ-1L-12", qty: 144 }, { code: "GS-WT-600-12", qty: 1200 }, { code: "GS-CR-325-24", qty: 96 }], status: "ready" }),
    mkDelivery(6, { id: "D-0007", delivery: "0080145221", po: "PO-2026-08856", pgiDate: "2026-05-04", soldTo: "10003411", shipTo: "20003412", items: [{ code: "GS-EQ-325-24", qty: 480 }], status: "ready" }),
    mkDelivery(7, { id: "D-0008", delivery: "0080145230", po: "—", pgiDate: "2026-05-04", soldTo: "10004102", shipTo: "20004102", items: [{ code: "GS-OR-325-24", qty: 144 }, { code: "GS-VT-180-30", qty: 60 }], status: "ready" }),
    mkDelivery(8, { id: "D-0009", delivery: "0080145240", po: "—", pgiDate: "2026-05-04", soldTo: "10005523", shipTo: "20005523", items: [{ code: "GS-WT-600-12", qty: 600 }, { code: "GS-EQ-325-24", qty: 96 }], status: "ready" }),
    mkDelivery(9, { id: "D-0010", delivery: "0080145245", po: "—", pgiDate: "2026-05-03", soldTo: "10006108", shipTo: "20006108", items: [{ code: "GS-CR-325-24", qty: 48 }], status: "ready" }),
    mkDelivery(10, { id: "D-0011", delivery: "0080145250", po: "—", pgiDate: "2026-05-03", soldTo: "10007220", shipTo: "20007220", items: [{ code: "GS-LY-325-24", qty: 24 }, { code: "GS-EQ-1L-12", qty: 36 }], status: "ready" }),
    mkDelivery(11, { id: "D-0012", delivery: "0080145260", po: "—", pgiDate: "2026-05-03", soldTo: "10008441", shipTo: "20008441", items: [{ code: "GS-EQ-325-24", qty: 144 }, { code: "GS-OR-325-24", qty: 96 }], status: "ready" }),
    // Some already-billed for variety
    mkDelivery(12, { id: "D-0013", delivery: "0080145100", po: "PO-2026-08800", pgiDate: "2026-05-03", soldTo: "10001245", shipTo: "20001245", items: [{ code: "GS-EQ-325-24", qty: 120 }], status: "sent", billingDoc: "9100021456", inetStatus: "certified", printCount: 5 }),
    mkDelivery(13, { id: "D-0014", delivery: "0080145105", po: "PO-2026-08805", pgiDate: "2026-05-03", soldTo: "10003411", shipTo: "20003412", items: [{ code: "GS-WT-600-12", qty: 480 }], status: "sent", billingDoc: "9100021460", inetStatus: "submitted" }),
    mkDelivery(14, { id: "D-0015", delivery: "0080145090", po: "PO-2026-08790", pgiDate: "2026-05-02", soldTo: "10002387", shipTo: "20002387", items: [{ code: "GS-EQ-325-24", qty: 240 }], status: "error", billingDoc: "9100021450", inetStatus: "rejected" }),
    mkDelivery(15, { id: "D-0016", delivery: "0080145080", po: "PO-2026-08780", pgiDate: "2026-05-02", soldTo: "10004102", shipTo: "20004102", items: [{ code: "GS-OR-325-24", qty: 96 }], status: "draft" }),
  ];

  return { customers, shipTos, materials, deliveries };
})();
