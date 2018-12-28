"use strict";
exports.__esModule = true;
var FunctionType_1 = require("../../wasmTypes/FunctionType");
var TypeSectionDisassembler = /** @class */ (function () {
    function TypeSectionDisassembler() {
    }
    TypeSectionDisassembler.ReadFunctionTypes = function (binaryProvider, initialPointer) {
        var _a;
        var result = [];
        var pointer = initialPointer;
        var nFuncTypesLength = binaryProvider.Getu32(pointer);
        var numberOfFuncTypes = nFuncTypesLength.Value;
        pointer += nFuncTypesLength.BytesUsed;
        while (result.length < numberOfFuncTypes) {
            var readFunctypeRes = void 0;
            _a = TypeSectionDisassembler.ReadFuncType(binaryProvider, pointer), readFunctypeRes = _a[0], pointer = _a[1];
            if (!readFunctypeRes) {
                throw new Error("Could not read func type.");
            }
            result.push(readFunctypeRes);
        }
        return result;
    };
    TypeSectionDisassembler.ReadFuncType = function (binaryProvider, initialPointer) {
        var result = null;
        var pointer = initialPointer;
        if (binaryProvider.GetRawByte(pointer) !== TypeSectionDisassembler.FuncTypeStartingByte) {
            throw new Error("Expected byte to be 0x60 as is the start of a functype");
        }
        result = new FunctionType_1.FunctionType();
        pointer += 1;
        var nParamsLengthRes = binaryProvider.Getu32(pointer);
        var numberOfParams = nParamsLengthRes.Value;
        pointer += nParamsLengthRes.BytesUsed;
        var params = [];
        while (params.length < numberOfParams) {
            var valueType = binaryProvider.ReadValueType(pointer);
            if (valueType) {
                params.push(valueType);
                pointer++;
            }
        }
        var resTypes = [];
        var resTypesParamsLength = binaryProvider.Getu32(pointer);
        var numberOfResultTypes = resTypesParamsLength.Value;
        pointer += resTypesParamsLength.BytesUsed;
        while (resTypes.length < numberOfResultTypes) {
            var valueType = binaryProvider.ReadValueType(pointer);
            if (valueType) {
                resTypes.push(valueType);
                pointer++;
            }
        }
        result.Parameters = params;
        result.ResultTypes = resTypes;
        return [result, pointer];
    };
    TypeSectionDisassembler.FuncTypeStartingByte = 0x60;
    return TypeSectionDisassembler;
}());
exports.TypeSectionDisassembler = TypeSectionDisassembler;
