"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var ValueType_1 = require("../wasmTypes/ValueType");
var WasmMemoryProvider = /** @class */ (function (_super) {
    __extends(WasmMemoryProvider, _super);
    function WasmMemoryProvider(binary, logger) {
        if (logger === void 0) { logger = function () { }; }
        var _this = this;
        if (!binary || binary.length === 0) {
            throw new Error("The provided array of bytes is empty");
        }
        if (binary.length < 8) {
            throw new Error("The array of bytes provided has less than 8 bytes. Not enough to represent a Wasm binary");
        }
        _this = _super.call(this, binary) || this;
        _this.log = logger;
        _this.Length = binary.length;
        _this.log("Constructed WasmMemoryProvider");
        return _this;
    }
    WasmMemoryProvider.prototype.Slice = function (initialPointer, finalPointer) {
        return this.slice(initialPointer, finalPointer);
    };
    WasmMemoryProvider.prototype.GetRawByte = function (pointer) {
        if (pointer >= this.length) {
            throw new Error("Trying to fetch a byte from Wasm binary beyond the length of the binary");
        }
        return this[pointer];
    };
    WasmMemoryProvider.prototype.Getu32 = function (initialPointer) {
        var decodingResult = this.GetUnsigned128Leb(initialPointer);
        if (decodingResult.bytesUsed > 5) {
            throw new Error("Trying to decode 4 LEB bytes but got to decode " + decodingResult.bytesUsed);
        }
        return { Value: decodingResult.result, BytesUsed: decodingResult.bytesUsed };
    };
    WasmMemoryProvider.prototype.GetUnsigned128Leb = function (initialPointer) {
        var result = 0;
        var shift = 0;
        var pointer = initialPointer;
        while (true) {
            var byte = this[pointer];
            result += ((byte & 0x7F) << shift);
            shift += 7;
            if ((byte & 0x80) === 0) {
                break;
            }
            pointer++;
        }
        return { result: result, bytesUsed: (pointer - initialPointer + 1) };
    };
    WasmMemoryProvider.prototype.GetRawUint32 = function (startingPointer) {
        if (this.length < startingPointer + 4) {
            throw new Error("Trying to get 4 bytes but no more bytes available");
        }
        var result = (this[startingPointer]);
        result += (this[startingPointer + 1] * 256);
        result += (this[startingPointer + 2] * 256 * 256);
        result += (this[startingPointer + 3] * 256 * 256 * 256);
        return result;
    };
    /** @inheritdoc */
    WasmMemoryProvider.prototype.ReadName = function (initialPointer) {
        var pointer = initialPointer;
        var name = "";
        var nameLengthRes = this.Getu32(pointer);
        var nameLength = nameLengthRes.Value;
        this.log("name length should be " + nameLength);
        pointer += nameLengthRes.BytesUsed;
        while (name.length < nameLength) {
            var codepoint = null;
            var bytesToAdvance = 0;
            var b1 = this.GetRawByte(pointer);
            var b2 = this.GetRawByte(pointer + 1);
            var b3 = this.GetRawByte(pointer + 2);
            var b4 = this.GetRawByte(pointer + 3);
            var testCodePoint = Math.pow(2, 18) * (b1 - 0xF0) + Math.pow(2, 12) * (b2 - 0x80) + Math.pow(2, 6) * (b3 - 0x80) + (b4 - 0x80);
            if (testCodePoint >= 0x10000 && testCodePoint < 0x110000) {
                codepoint = testCodePoint;
                bytesToAdvance = 4;
            }
            if (!codepoint) {
                testCodePoint = Math.pow(2, 12) * (b1 - 0xE0) + Math.pow(2, 6) * (b2 - 0x80) + (b3 - 0x80);
                if (testCodePoint >= 0x800 && testCodePoint < 0xD800 || testCodePoint >= 0xE000 && testCodePoint < 0x10000) {
                    codepoint = testCodePoint;
                    bytesToAdvance = 3;
                }
            }
            if (!codepoint) {
                testCodePoint = Math.pow(2, 6) * (b1 - 0xC0) + (b2 - 0x80);
                if (testCodePoint < 0x800 && testCodePoint >= 0x80) {
                    codepoint = testCodePoint;
                    bytesToAdvance = 2;
                }
            }
            if (!codepoint) {
                testCodePoint = b1;
                if (testCodePoint < 0x80) {
                    codepoint = testCodePoint;
                    bytesToAdvance = 1;
                }
            }
            if (codepoint) {
                name += String.fromCodePoint(codepoint);
                pointer += bytesToAdvance;
                this.log("Code point found with " + bytesToAdvance + " bytes");
            }
            else {
                this.log("Test codepoint " + testCodePoint);
                break;
            }
        }
        return [name, pointer];
    };
    WasmMemoryProvider.prototype.ReadValueType = function (initialPointer) {
        var result = null;
        if (Object.values(ValueType_1.ValueType).includes(this.GetRawByte(initialPointer))) {
            result = this.GetRawByte(initialPointer);
        }
        return result;
    };
    return WasmMemoryProvider;
}(Uint8Array));
exports.WasmMemoryProvider = WasmMemoryProvider;
