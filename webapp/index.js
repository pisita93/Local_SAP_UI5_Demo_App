sap.ui.define([
	"sap/ui/core/ComponentSupport"
], function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/ComponentContainer"
	], function (ComponentContainer) {
		new ComponentContainer({
			id: "myapp",
			name: "com.myorg.myapp",
			async: true
		}).placeAt("content");
	});
});
