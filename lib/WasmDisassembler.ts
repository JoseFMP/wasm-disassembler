import { Section, SectionIds } from './sections/Section'
import { WasmModule, WasmVersions } from './WasmModule';
import { CustomSection } from './sections/CustomSection';
import { StartSection } from './sections/StartSection';
import Index from './indexes/Index';
import { WasmBinaryProvider } from './binaryProvider/WasmBinaryProvider'
import { InstantiateSection, PossibleSections } from './sections/Mapping';
import { Disassembly } from './Disassembly';
import { FunctionType } from './wasmTypes/FunctionType';
import { ValueType } from './wasmTypes/ValueType';
import { TypeSection } from './sections/TypeSection';

export class WasmDisassembler {


    static readonly SectionIdLength = 1
    static readonly FuncTypeStartingByte = 0x60
    private readonly bp: WasmBinaryProvider

    private log: (message: string | object) => void

    constructor(binaryProvider: WasmBinaryProvider, logger: (message: string | object) => void = () => {} ) {
        this.bp = binaryProvider
        this.log = logger
    }


    async Parse(): Promise<Disassembly | null> {
        const disassembly = new Disassembly()
        disassembly.FileSize = this.bp.Length
        disassembly.Modules = this.FindModules(0)
        return disassembly
    }

    FindModules(startPointer: number): WasmModule[] {

        let pointer = startPointer
        let modules: WasmModule[] = []
        while (pointer < this.bp.Length) {
            const moduleResult = this.FindModule(pointer);
            if (moduleResult) {
                let module: WasmModule
                [module, pointer] = moduleResult
                modules.push(module)
            }
            else {
                break
            }
        }
        return modules
    }

    FindModule(startPointer: number): [WasmModule, number] | null {
        let pointer = startPointer
        this.log(`Looking for module at pointer ${pointer}`)

        if (!this.FindMagicNumber(pointer)) {
            this.log('Could not find initial fingerprint')
            return null
        }

        pointer += WasmModule.MagicNumberLength
        const version = this.FindVersion(pointer)
        if (version !== WasmVersions.Normal) {
            this.log(`Module versio is not normal version. Version found: ${version}`);
            return null;
        }

        pointer += WasmModule.VersionLength;
        const sections = this.FindSections(pointer);
        let module: WasmModule = new WasmModule();
        [module.Sections, pointer] = sections;
        return [module, pointer]
    }

    private FindMagicNumber(initialPointer: number): boolean {
        const fingerprint: number = this.bp.GetRawUint32(initialPointer)
        if (fingerprint !== WasmModule.MagicNumber) {
            return false;
        }
        this.log('Fingerprint found :)')
        return true
    }

    private FindVersion(initialPointer: number): (WasmVersions | null) {
        const version = this.bp.GetRawUint32(initialPointer)
        if (!Object.values(WasmVersions).includes(version)) {
            this.log(`Version unknown: ${version}`)
            return null;
        }
        this.log(`Found version: ${WasmVersions[version]}`)
        return version
    }

    private FindSections(initialPointer: number): [Section[], number] {
        let pointer = initialPointer
        const maxIts = 500
        let its = 0
        let sections: Section[] = []

        while ((pointer + WasmDisassembler.SectionIdLength + 5) < this.bp.Length) {
            its++
            if (its > maxIts && false) {
                break
            }
            const sectionHeader = this.FindSectionHeader(pointer)
            let newSection: Section

            if (sectionHeader !== null) {
                
                [newSection, pointer] = sectionHeader
                this.FindSectionPayload(pointer, newSection)
                sections.push(newSection)
                pointer += newSection.contentSize
            }
            else {
                this.log('Could not find more sections :/')
                break
            }

        }
        return [sections, pointer]
    }


    private FindSectionHeader(initialPointer: number): [Section, number] | null {

        this.log(`Finding section header at pointer ${initialPointer}`)
        let pointer = initialPointer
        if (pointer >= this.bp.Length) {
            return null // no section header available
        }

        if (pointer < this.bp.Length - 4 && this.FindMagicNumber(pointer)) {
            return null // no section header available
        }

        if (!this.HasVarIntBytes(pointer)) {
            return null;
        }


        const sectionType = this.GetSectionId(pointer)
        if (sectionType === null) {
            return null
        }

        let newSection = InstantiateSection(sectionType)

        pointer += WasmDisassembler.SectionIdLength
        const csu32 = this.bp.Getu32(pointer)
        const contentSize = csu32.Value
        pointer += csu32.BytesUsed

        newSection.sectionId = sectionType
        newSection.contentSize = contentSize
        this.log(newSection)

        return [newSection, pointer]
    }


    FindSectionPayload(initialPointer: number, section: Section): number {
        let pointer = initialPointer
        switch (section.sectionId) {
            case SectionIds.Custom:
                if (this.HasStringBytes(pointer)) {
                    const name = this.ReadName(pointer)
                    if (name) {
                        (section as CustomSection).name = name
                    }
                    else {
                        this.log('Section of type "Custom" but name not found')
                    }
                    pointer += (name ? name.length : 0)
                }
                pointer += 4;
                (section as CustomSection).payload = this.bp.Slice(pointer, pointer + section.contentSize)
                break;
            case SectionIds.Start:
                (section as StartSection).startFunction = new Index(this.bp.Getu32(pointer).Value)
                break;
            case SectionIds.Type:
                (section as TypeSection).Functions = this.ReadFunctionTypes(pointer);
                break;
            default:
               // throw Error(`Not implemented section of type: ${section.sectionId}`)
        }

        return pointer

    }


    GetSectionId(initialPointer: number): SectionIds | null {
        const sectionIdAsNumber = this.bp.GetRawByte(initialPointer)
        if (!PossibleSections.includes(sectionIdAsNumber)) {
            this.log(`Unknown section id: ${sectionIdAsNumber}`)
            return null;
        }
        this.log(`Found a section ID: ${SectionIds[sectionIdAsNumber]}`)
        return sectionIdAsNumber
    }

    private HasVarIntBytes(initialPointer: number): boolean {
        let pointer = initialPointer;
        while (pointer < this.bp.Length) {
            if ((this.bp.GetRawByte(pointer) & 0x80) === 0) {
                return true;
            }
            pointer++
        }
        return false;
    }

    private HasStringBytes(pointer: number): boolean {
        if (!this.HasVarIntBytes(pointer)) {
            return false;
        }
        const stringLength = this.bp.Getu32(pointer).Value;
        const stringBytesAvailable = this.bp.Length >= pointer + stringLength
        return stringBytesAvailable;
    }

    private ReadName(initialPointer: number): string | null {

        let pointer = initialPointer
        let name: string = ""

        const nameLengthRes = this.bp.Getu32(pointer)
        const nameLength = nameLengthRes.Value

        this.log(`name length should be ${nameLength}`)
        pointer += nameLengthRes.BytesUsed

        while (name.length < nameLength) {
            let codepoint: null | number = null
            let bytesToAdvance: number = 0
            const b1 = this.bp.GetRawByte(pointer)
            const b2 = this.bp.GetRawByte(pointer + 1)
            const b3 = this.bp.GetRawByte(pointer + 2)
            const b4 = this.bp.GetRawByte(pointer + 3)

            let testCodePoint = Math.pow(2, 18) * (b1 - 0xF0) + Math.pow(2, 12) * (b2 - 0x80) + Math.pow(2, 6) * (b3 - 0x80) + (b4 - 0x80)
            if (testCodePoint >= 0x10000 && testCodePoint < 0x110000) {
                codepoint = testCodePoint
                bytesToAdvance = 4
            }

            if (!codepoint) {
                testCodePoint = Math.pow(2, 12) * (b1 - 0xE0) + Math.pow(2, 6) * (b2 - 0x80) + (b3 - 0x80)
                if (testCodePoint >= 0x800 && testCodePoint < 0xD800 || testCodePoint >= 0xE000 && testCodePoint < 0x10000) {
                    codepoint = testCodePoint
                    bytesToAdvance = 3
                }
            }

            if (!codepoint) {
                testCodePoint = Math.pow(2, 6) * (b1 - 0xC0) + (b2 - 0x80)
                if (testCodePoint < 0x800 && testCodePoint >= 0x80) {
                    codepoint = testCodePoint
                    bytesToAdvance = 2
                }
            }

            if (!codepoint) {
                testCodePoint = b1
                if (testCodePoint < 0x80) {
                    codepoint = testCodePoint
                    bytesToAdvance = 1
                }
            }

            if (codepoint) {
                name += String.fromCodePoint(codepoint)
                pointer += bytesToAdvance
                this.log(`Code point found with ${bytesToAdvance} bytes`)
            }
            else {
                this.log(`Test codepoint ${testCodePoint}`)
                break
            }
        }
        return name.length > 0 ? name : null
    }

    ReadFunctionTypes(initialPointer: number): FunctionType[] {
        let result: FunctionType[] = [];
        let pointer = initialPointer;
        const nFuncTypesLength = this.bp.Getu32(pointer);
        const numberOfFuncTypes = nFuncTypesLength.Value;
        pointer += nFuncTypesLength.BytesUsed;

        while (result.length < numberOfFuncTypes) {
            let readFunctypeRes: FunctionType | null
            [readFunctypeRes, pointer] = this.ReadFuncType(pointer)
            if (!readFunctypeRes){
                throw new Error("Could not read func type.")
            }
            result.push(readFunctypeRes)
        }
        return result
    }


    ReadFuncType(initialPointer: number): [FunctionType | null, number] {
        let result : FunctionType | null = null;
        let pointer = initialPointer;
        if (this.bp.GetRawByte(pointer) !== WasmDisassembler.FuncTypeStartingByte) {
            throw new Error("Expected byte to be 0x60 as is the start of a functype")
        }
        result = new FunctionType();
        pointer += 1;
        const nParamsLengthRes = this.bp.Getu32(pointer);
        const numberOfParams = nParamsLengthRes.Value;
        pointer += nParamsLengthRes.BytesUsed

        let params: ValueType[] = []

        while (params.length < numberOfParams) {
            const valueType = this.ReadValueType(pointer);
            if (valueType) {
                params.push(valueType);
                pointer++;
            }
        }

        let resTypes: ValueType[] = []
        const resTypesParamsLength = this.bp.Getu32(pointer);
        const numberOfResultTypes = resTypesParamsLength.Value;
        pointer += resTypesParamsLength.BytesUsed

        while (resTypes.length < numberOfResultTypes) {
            const valueType = this.ReadValueType(pointer);
            if (valueType) {
                resTypes.push(valueType);
                pointer++;
            }
        }

        result.Parameters = params;
        result.ResultTypes = resTypes;
        return [result, pointer]
    }

    ReadValueType(initialPointer: number): ValueType | null {
        let result : ValueType | null = null
        if (Object.values(ValueType).includes(this.bp.GetRawByte(initialPointer))){
            result = this.bp.GetRawByte(initialPointer);
        }
        return result;
    }

}