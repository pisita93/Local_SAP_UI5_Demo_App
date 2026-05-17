sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	var DEFAULT_FORM = {
		firstName: "",
		lastName: "",
		email: "",
		role: "engineer",
		remote: false,
		notes: ""
	};

	return Controller.extend("com.myorg.myapp.controller.demos.FormsDemo", {

		onInit: function () {
			this.getView().setModel(new JSONModel(Object.assign({}, DEFAULT_FORM)));
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		},

		onReset: function () {
			this.getView().getModel().setData(Object.assign({}, DEFAULT_FORM));
			MessageToast.show(this._t("toastReset"));
		},

		onSubmit: function () {
			var oData = this.getView().getModel().getData();
			if (!oData.firstName || !oData.lastName) {
				MessageToast.show(this._t("toastMissingFields"));
				return;
			}
			MessageToast.show(this._t("toastSubmitted", [oData.firstName, oData.lastName]));
		},

		_t: function (sKey, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
		}
	});
});
