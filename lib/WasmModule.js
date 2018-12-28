"use strict";
exports.__esModule = true;
var WasmVersions;
(function (WasmVersions) {
    WasmVersions[WasmVersions["Normal"] = 1] = "Normal";
    WasmVersions[WasmVersions["Experimental"] = 13] = "Experimental";
})(WasmVersions = exports.WasmVersions || (exports.WasmVersions = {}));
var WasmModule = /** @class */ (function () {
    function WasmModule() {
    }
    WasmModule.MagicNumber = 0x6d736100;
    WasmModule.Version = WasmVersions.Normal;
    WasmModule.MagicNumberLength = 4;
    WasmModule.VersionLength = 4;
    return WasmModule;
}());
exports.WasmModule = WasmModule;
