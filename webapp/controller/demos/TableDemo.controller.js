sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	var PRODUCTS = [
		{ name: "Notebook 14\"",        category: "Electronics", price: 1199.00, stock: 24, statusText: "In Stock",  statusState: "Success" },
		{ name: "Wireless Mouse",       category: "Accessories", price:   29.90, stock: 80, statusText: "In Stock",  statusState: "Success" },
		{ name: "USB-C Hub",            category: "Accessories", price:   45.50, stock:  5, statusText: "Low Stock", statusState: "Warning" },
		{ name: "27\" Monitor",         category: "Electronics", price:  349.00, stock: 12, statusText: "In Stock",  statusState: "Success" },
		{ name: "Mechanical Keyboard",  category: "Accessories", price:  129.00, stock:  0, statusText: "Sold Out",  statusState: "Error"   },
		{ name: "Webcam HD",            category: "Electronics", price:   79.00, stock: 18, statusText: "In Stock",  statusState: "Success" },
		{ name: "Desk Lamp",            category: "Office",      price:   39.99, stock: 33, statusText: "In Stock",  statusState: "Success" },
		{ name: "Office Chair",         category: "Furniture",   price:  279.00, stock:  2, statusText: "Low Stock", statusState: "Warning" },
		{ name: "Standing Desk",        category: "Furniture",   price:  599.00, stock:  4, statusText: "Low Stock", statusState: "Warning" },
		{ name: "Headphones",           category: "Accessories", price:  199.00, stock: 27, statusText: "In Stock",  statusState: "Success" },
		{ name: "Tablet 10\"",          category: "Electronics", price:  499.00, stock:  9, statusText: "In Stock",  statusState: "Success" },
		{ name: "External SSD 1TB",     category: "Electronics", price:  149.00, stock: 41, statusText: "In Stock",  statusState: "Success" }
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
