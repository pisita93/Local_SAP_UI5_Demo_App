sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	// Source: GreenSpot_Integrated_Demo_Dataset.xlsx → Material Master
	// Price column: per CASE (THB) — MT01-HYPER reference from Sales Pricing
	var PRODUCTS = [
		{ name: "GS-VTG-01 · Vitamilk Togo Choco Grande 300ml x 24 bottles",         category: "Vitamilk Togo",     price: 355.68, stock: 240, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VTG-02 · Vitamilk Togo Royal Thai Tea 300ml x 24 bottles",       category: "Vitamilk Togo",     price: 355.68, stock: 180, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VTG-03 · Vitamilk Togo Barley & Malt 300ml x 24 bottles",        category: "Vitamilk Togo",     price: 299.52, stock:  60, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VTG-04 · Vitamilk Togo Black Sesame & Riceberry 300ml x 24",     category: "Vitamilk Togo",     price: 299.52, stock:  18, statusText: "Low Stock", statusState: "Warning" },
		{ name: "GS-VTG-05 · Vitamilk Togo Original 300ml x 24 bottles",             category: "Vitamilk Togo",     price: 299.52, stock: 320, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VTG-06 · Vitamilk Light Original 50% Less Sugar 300ml x 24",     category: "Vitamilk Light",    price: 355.68, stock:   0, statusText: "Sold Out",  statusState: "Error"   },
		{ name: "GS-VUH-01 · Vitamilk UHT Barley & Malt 300ml x 36 cartons",         category: "Vitamilk UHT",      price: 336.96, stock: 120, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VUH-02 · Vitamilk UHT Black Sesame & Riceberry 300ml x 36",      category: "Vitamilk UHT",      price: 336.96, stock:  96, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VUH-03 · Vitamilk UHT Less Sugar (Lactose Free) 250ml x 36",     category: "Vitamilk UHT",      price: 280.80, stock:  24, statusText: "Low Stock", statusState: "Warning" },
		{ name: "GS-VUH-04 · Vitamilk UHT Original 300ml x 36 cartons",              category: "Vitamilk UHT",      price: 336.96, stock: 480, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VUH-05 · Vitamilk UHT Vegetarian (Jay) 250ml x 36",              category: "Vitamilk UHT",      price: 280.80, stock:  72, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VUH-06 · Vitamilk UHT Vitamin Plus Black Sesame 180ml x 48",     category: "Vitamilk UHT",      price: 449.28, stock:  48, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VUH-07 · Vitamilk UHT Vitamin Plus Almond 180ml x 48",           category: "Vitamilk UHT",      price: 449.28, stock:  36, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VUH-08 · Vitamilk UHT Vitamin Plus Malt 180ml x 48",             category: "Vitamilk UHT",      price: 449.28, stock:   0, statusText: "Sold Out",  statusState: "Error"   },
		{ name: "GS-VUH-09 · Vitamilk Light UHT Original Less Sugar 250ml x 36",     category: "Vitamilk Light",    price: 374.40, stock:  30, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VCH-01 · Vitamilk Champ Unsweetened Lactose Free 180ml x 48",    category: "Vitamilk Champ",    price: 449.28, stock:  24, statusText: "Low Stock", statusState: "Warning" },
		{ name: "GS-VCH-02 · Vitamilk Champ Less Sugar Lactose Free 180ml x 48",     category: "Vitamilk Champ",    price: 449.28, stock:  24, statusText: "Low Stock", statusState: "Warning" },
		{ name: "GS-VSY-01 · V-Soy Sesame Malt 180ml x 36 cartons",                  category: "V-Soy",             price: 421.20, stock:  72, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VSY-02 · V-Soy Pistachio 180ml x 36 cartons",                    category: "V-Soy",             price: 421.20, stock:  36, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VSY-03 · V-Soy Almond 1000ml x 12 cartons",                      category: "V-Soy",             price: 702.00, stock:  30, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VSY-04 · V-Soy Almond 180ml x 36 cartons",                       category: "V-Soy",             price: 421.20, stock:  60, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VSY-05 · V-Soy Hi-Calcium Unsweetened 1000ml x 12",              category: "V-Soy Hi-Calcium",  price: 552.24, stock:  24, statusText: "Low Stock", statusState: "Warning" },
		{ name: "GS-VSY-06 · V-Soy Hi-Calcium Unsweetened 230ml x 36",               category: "V-Soy Hi-Calcium",  price: 421.20, stock:  48, statusText: "In Stock",  statusState: "Success" },
		{ name: "GS-VSY-07 · V-Soy Hi-Calcium Multigrain 230ml x 36",                category: "V-Soy Hi-Calcium",  price: 421.20, stock:  36, statusText: "In Stock",  statusState: "Success" }
	];

	return Controller.extend("com.myorg.myapp.controller.demos.TableDemo", {

		onInit: function () {
			this.getView().setModel(new JSONModel({ products: PRODUCTS }));
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		},

		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("newValue") || "";
			var oTable = this.byId("productsTable");
			var oBinding = oTable.getBinding("items");
			if (!sQuery) {
				oBinding.filter([]);
				return;
			}
			oBinding.filter([
				new Filter({
					filters: [
						new Filter("name", FilterOperator.Contains, sQuery),
						new Filter("category", FilterOperator.Contains, sQuery)
					],
					and: false
				})
			]);
		}
	});
});
