"use strict";
exports.__esModule = true;
var Import_1 = require("../../imports/Import");
var ImportTypes;
(function (ImportTypes) {
    ImportTypes[ImportTypes["function"] = 0] = "function";
    ImportTypes[ImportTypes["table"] = 1] = "table";
    ImportTypes[ImportTypes["mem"] = 2] = "mem";
    ImportTypes[ImportTypes["global"] = 3] = "global";
})(ImportTypes || (ImportTypes = {}));
/**
 * Disassembles the Imports of an Import Section as described by the WASM binary
 * encoding specification.
 * @see https://webassembly.github.io/spec/core/bikeshed/index.html#binary-import
 */
var ImportSectionDisassembler = /** @class */ (function () {
    function ImportSectionDisassembler() {
    }
    ImportSectionDisassembler.FindImports = function (binaryProvider, initialPointer) {
        var _a;
        var result = [];
        var pointer = initialPointer;
        var importsLengthU32 = binaryProvider.Getu32(pointer);
        pointer += importsLengthU32.BytesUsed;
        while (result.length < importsLengthU32.Value) {
            var newImport = void 0;
            _a = this.FindImport(binaryProvider, pointer), newImport = _a[0], pointer = _a[1];
            result.push(newImport);
        }
        return result;
    };
    /**
     * Disassembles an import according to WASM specification.
     * @see https://webassembly.github.io/spec/core/bikeshed/index.html#syntax-import
     *
     * @param binaryProvider provider of binary layer of the encoded WASM.
     * @param initialPointer position in the byte array where to start looking for the import.
     */
    ImportSectionDisassembler.FindImport = function (binaryProvider, initialPointer) {
        var _a, _b;
        var newImport = new Import_1.Import();
        var pointer = initialPointer;
        var moduleName;
        _a = binaryProvider.ReadName(pointer), moduleName = _a[0], pointer = _a[1];
        if (!moduleName) {
            throw new Error("Could not determine module name in import");
        }
        newImport.Module = moduleName;
        var entityName;
        _b = binaryProvider.ReadName(pointer), entityName = _b[0], pointer = _b[1];
        if (!entityName) {
            throw new Error("Could not determine module name in import");
        }
        newImport.EntityName = entityName;
        var typeOfImport = binaryProvider.GetRawByte(pointer);
        switch (typeOfImport) {
            case ImportTypes["function"]:
                break;
            case ImportTypes.table:
                break;
            case ImportTypes.mem:
                break;
            case ImportTypes.global:
                break;
            default:
                throw new Error("Could not figure out the type of import from " + typeOfImport);
        }
        pointer++;
        return [newImport, pointer];
    };
    return ImportSectionDisassembler;
}());
exports.ImportSectionDisassembler = ImportSectionDisassembler;
