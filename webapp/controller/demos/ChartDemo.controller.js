sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	var LABELS = ["Q1", "Q2", "Q3", "Q4"];

	function buildBars(values) {
		return values.map(function (nValue, i) {
			var sState = nValue >= 75 ? "Success" : nValue >= 50 ? "Information" : nValue >= 25 ? "Warning" : "Error";
			return {
				label: LABELS[i],
				value: nValue,
				percent: nValue,
				state: sState
			};
		});
	}

	return Controller.extend("com.myorg.myapp.controller.demos.ChartDemo", {

		onInit: function () {
			this.getView().setModel(new JSONModel({
				bars: buildBars([42, 68, 81, 55])
			}));
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		},

		onRandomize: function () {
			var aValues = [0, 0, 0, 0].map(function () {
				return Math.floor(Math.random() * 100) + 1;
			});
			this.getView().getModel().setProperty("/bars", buildBars(aValues));
		}
	});
});
