sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var IFRAME_SRC = "partner-portal/index.html";
	var IFRAME_HTML =
		'<iframe ' +
		'src="' + IFRAME_SRC + '" ' +
		'title="Partner Portal" ' +
		'style="width:100%;height:calc(100vh - 48px);border:0;display:block;background:#F5F6F7;" ' +
		'loading="lazy"></iframe>';

	return Controller.extend("com.myorg.myapp.controller.demos.PartnerPortalDemo", {

		onInit: function () {
			this.byId("partnerPortalFrame").setContent(IFRAME_HTML);
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("home");
		},

		onOpenStandalone: function () {
			window.open(IFRAME_SRC, "_blank", "noopener");
		}
	});
});
