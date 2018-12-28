"use strict";
exports.__esModule = true;
var _a;
var CustomSection_1 = require("./CustomSection");
var ImportSection_1 = require("./ImportSection");
var CodeSection_1 = require("./CodeSection");
var StartSection_1 = require("./StartSection");
var DataSection_1 = require("./DataSection");
var ElementSection_1 = require("./ElementSection");
var ExportSection_1 = require("./ExportSection");
var FunctionSection_1 = require("./FunctionSection");
var GlobalSection_1 = require("./GlobalSection");
var MemorySection_1 = require("./MemorySection");
var TableSection_1 = require("./TableSection");
var TypeSection_1 = require("./TypeSection");
var Section_1 = require("./Section");
var SectionTypesToModels = (_a = {},
    _a[Section_1.SectionIds.Custom] = CustomSection_1.CustomSection,
    _a[Section_1.SectionIds.Import] = ImportSection_1.ImportSection,
    _a[Section_1.SectionIds.Code] = CodeSection_1.CodeSection,
    _a[Section_1.SectionIds.Start] = StartSection_1.StartSection,
    _a[Section_1.SectionIds.Data] = DataSection_1.DataSection,
    _a[Section_1.SectionIds.Element] = ElementSection_1.ElementSection,
    _a[Section_1.SectionIds.Export] = ExportSection_1.ExportSection,
    _a[Section_1.SectionIds.Function] = FunctionSection_1.FunctionSection,
    _a[Section_1.SectionIds.Global] = GlobalSection_1.GlobalSection,
    _a[Section_1.SectionIds.Memory] = MemorySection_1.MemorySection,
    _a[Section_1.SectionIds.Table] = TableSection_1.TableSection,
    _a[Section_1.SectionIds.Type] = TypeSection_1.TypeSection,
    _a);
exports.PossibleSections = Object.values(Section_1.SectionIds).filter(function (val) { return !Number.isNaN(val); });
exports.InstantiateSection = function (sectionType) {
    if (!Object.values(exports.PossibleSections).includes(sectionType)) {
        throw new Error("The section type specified does not exist: " + sectionType);
    }
    var newSection = new SectionTypesToModels[sectionType]();
    return newSection;
};
