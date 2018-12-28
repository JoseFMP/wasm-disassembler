"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Section_1 = require("../sections/Section");
var WasmModule_1 = require("../WasmModule");
var Function_1 = require("../functions/Function");
var Mapping_1 = require("../sections/Mapping");
var Disassembly_1 = require("./Disassembly");
var ImportSectionDisassembler_1 = require("./sections/ImportSectionDisassembler");
var TypeSectionDisassembler_1 = require("./sections/TypeSectionDisassembler");
var WasmDisassembler = /** @class */ (function () {
    function WasmDisassembler(binaryProvider, logger) {
        if (logger === void 0) { logger = function () { }; }
        this.bp = binaryProvider;
        this.log = logger;
    }
    WasmDisassembler.prototype.Parse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var disassembly;
            return __generator(this, function (_a) {
                disassembly = new Disassembly_1.Disassembly();
                disassembly.FileSize = this.bp.Length;
                disassembly.Modules = this.FindModules(0);
                return [2 /*return*/, disassembly];
            });
        });
    };
    WasmDisassembler.prototype.FindModules = function (startPointer) {
        var pointer = startPointer;
        var modules = [];
        while (pointer < this.bp.Length) {
            var moduleResult = this.FindModule(pointer);
            if (moduleResult) {
                var module_1 = void 0;
                module_1 = moduleResult[0], pointer = moduleResult[1];
                modules.push(module_1);
            }
            else {
                break;
            }
        }
        return modules;
    };
    WasmDisassembler.prototype.FindModule = function (startPointer) {
        var pointer = startPointer;
        this.log("Looking for module at pointer " + pointer);
        if (!this.FindMagicNumber(pointer)) {
            this.log('Could not find initial fingerprint');
            return null;
        }
        pointer += WasmModule_1.WasmModule.MagicNumberLength;
        var version = this.FindVersion(pointer);
        if (version !== WasmModule_1.WasmVersions.Normal) {
            this.log("Module versio is not normal version. Version found: " + version);
            return null;
        }
        pointer += WasmModule_1.WasmModule.VersionLength;
        var sections = this.FindSections(pointer);
        var module = new WasmModule_1.WasmModule();
        module.Sections = sections[0], pointer = sections[1];
        return [module, pointer];
    };
    WasmDisassembler.prototype.FindMagicNumber = function (initialPointer) {
        var fingerprint = this.bp.GetRawUint32(initialPointer);
        if (fingerprint !== WasmModule_1.WasmModule.MagicNumber) {
            return false;
        }
        this.log('Fingerprint found :)');
        return true;
    };
    WasmDisassembler.prototype.FindVersion = function (initialPointer) {
        var version = this.bp.GetRawUint32(initialPointer);
        if (!Object.values(WasmModule_1.WasmVersions).includes(version)) {
            this.log("Version unknown: " + version);
            return null;
        }
        this.log("Found version: " + WasmModule_1.WasmVersions[version]);
        return version;
    };
    WasmDisassembler.prototype.FindSections = function (initialPointer) {
        var pointer = initialPointer;
        var maxIts = 500;
        var its = 0;
        var sections = [];
        while ((pointer + WasmDisassembler.SectionIdLength + 5) < this.bp.Length) {
            its++;
            if (its > maxIts && false) {
                break;
            }
            var sectionHeader = this.FindSectionHeader(pointer);
            var newSection = void 0;
            if (sectionHeader !== null) {
                newSection = sectionHeader[0], pointer = sectionHeader[1];
                this.FindSectionPayload(pointer, newSection);
                sections.push(newSection);
                pointer += newSection.contentSize;
            }
            else {
                this.log('Could not find more sections :/');
                break;
            }
        }
        return [sections, pointer];
    };
    WasmDisassembler.prototype.FindSectionHeader = function (initialPointer) {
        this.log("Finding section header at pointer " + initialPointer);
        var pointer = initialPointer;
        if (pointer >= this.bp.Length) {
            return null; // no section header available
        }
        if (pointer < this.bp.Length - 4 && this.FindMagicNumber(pointer)) {
            return null; // no section header available
        }
        if (!this.HasVarIntBytes(pointer)) {
            return null;
        }
        var sectionType = this.GetSectionId(pointer);
        if (sectionType === null) {
            return null;
        }
        var newSection = Mapping_1.InstantiateSection(sectionType);
        pointer += WasmDisassembler.SectionIdLength;
        var csu32 = this.bp.Getu32(pointer);
        var contentSize = csu32.Value;
        pointer += csu32.BytesUsed;
        newSection.sectionId = sectionType;
        newSection.contentSize = contentSize;
        this.log(newSection);
        return [newSection, pointer];
    };
    WasmDisassembler.prototype.FindSectionPayload = function (initialPointer, section) {
        var _a;
        var pointer = initialPointer;
        switch (section.sectionId) {
            case Section_1.SectionIds.Custom:
                if (this.HasStringBytes(pointer)) {
                    var name_1;
                    _a = this.bp.ReadName(pointer), name_1 = _a[0], pointer = _a[1];
                    if (name_1) {
                        section.name = name_1;
                    }
                    else {
                        this.log('Section of type "Custom" but name not found');
                    }
                }
                pointer += 4;
                section.payload = this.bp.Slice(pointer, pointer + section.contentSize);
                break;
            case Section_1.SectionIds.Start:
                section.startFunction = new Function_1.Function(this.bp.Getu32(pointer).Value);
                break;
            case Section_1.SectionIds.Type:
                section.Functions = TypeSectionDisassembler_1.TypeSectionDisassembler.ReadFunctionTypes(this.bp, pointer);
                break;
            case Section_1.SectionIds.Import:
                section.Imports = ImportSectionDisassembler_1.ImportSectionDisassembler.FindImports(this.bp, pointer);
            default:
            // throw Error(`Not implemented section of type: ${section.sectionId}`)
        }
        return pointer;
    };
    WasmDisassembler.prototype.GetSectionId = function (initialPointer) {
        var sectionIdAsNumber = this.bp.GetRawByte(initialPointer);
        if (!Mapping_1.PossibleSections.includes(sectionIdAsNumber)) {
            this.log("Unknown section id: " + sectionIdAsNumber);
            return null;
        }
        this.log("Found a section ID: " + Section_1.SectionIds[sectionIdAsNumber]);
        return sectionIdAsNumber;
    };
    WasmDisassembler.prototype.HasVarIntBytes = function (initialPointer) {
        var pointer = initialPointer;
        while (pointer < this.bp.Length) {
            if ((this.bp.GetRawByte(pointer) & 0x80) === 0) {
                return true;
            }
            pointer++;
        }
        return false;
    };
    WasmDisassembler.prototype.HasStringBytes = function (pointer) {
        if (!this.HasVarIntBytes(pointer)) {
            return false;
        }
        var stringLength = this.bp.Getu32(pointer).Value;
        var stringBytesAvailable = this.bp.Length >= pointer + stringLength;
        return stringBytesAvailable;
    };
    WasmDisassembler.SectionIdLength = 1;
    return WasmDisassembler;
}());
exports.WasmDisassembler = WasmDisassembler;
