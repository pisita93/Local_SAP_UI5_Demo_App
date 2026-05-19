sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.myorg.myapp.controller.Home", {

		onInit: function () {
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oModel = new JSONModel({
				demos: [
					{
						key: "formsDemo",
						title: oBundle.getText("demoFormsTitle"),
						description: oBundle.getText("demoFormsDesc"),
						icon: "sap-icon://form"
					},
					{
						key: "tableDemo",
						title: oBundle.getText("demoTableTitle"),
						description: oBundle.getText("demoTableDesc"),
						icon: "sap-icon://table-view"
					},
					{
						key: "chartDemo",
						title: oBundle.getText("demoChartTitle"),
						description: oBundle.getText("demoChartDesc"),
						icon: "sap-icon://bar-chart"
					},
					{
						key: "salesBkkDemo",
						title: oBundle.getText("demoSalesBkkTitle"),
						description: oBundle.getText("demoSalesBkkDesc"),
						icon: "sap-icon://sales-order"
					},
					{
						key: "partnerPortalDemo",
						title: oBundle.getText("demoPartnerPortalTitle"),
						description: oBundle.getText("demoPartnerPortalDesc"),
						icon: "sap-icon://customer"
					},
					{
						key: "deliveryTrackingDemo",
						title: oBundle.getText("demoDeliveryTrackingTitle"),
						description: oBundle.getText("demoDeliveryTrackingDesc"),
						icon: "sap-icon://shipping-status"
					}
				]
			});
			this.getView().setModel(oModel);
		},

		onDemoPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var sRouteName = oContext.getProperty("key");
			this.getOwnerComponent().getRouter().navTo(sRouteName);
		}
	});
});
