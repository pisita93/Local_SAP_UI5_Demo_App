sap.ui.define([
	"sap/ui/core/ComponentSupport"
], function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/ComponentContainer"
	], function (ComponentContainer) {
		new ComponentContainer({
			name: "com.myorg.myapp",
			settings: {
				id: "myapp"
			},
			async: true
		}).placeAt("content");
	});
});
