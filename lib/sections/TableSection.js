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
var Section_1 = require("./Section");
var TableSection = /** @class */ (function (_super) {
    __extends(TableSection, _super);
    function TableSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sectionId = Section_1.SectionIds.Table;
        return _this;
    }
    return TableSection;
}(Section_1.Section));
exports.TableSection = TableSection;