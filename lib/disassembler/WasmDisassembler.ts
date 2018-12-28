import { Section, SectionIds } from '../sections/Section'
import { WasmModule, WasmVersions } from '../WasmModule';
import { CustomSection } from '../sections/CustomSection';
import { StartSection } from '../sections/StartSection';
import { Function } from '../functions/Function';
import { WasmBinaryProvider } from '../binaryProvider/WasmBinaryProvider'
import { InstantiateSection, PossibleSections } from '../sections/Mapping';
import { Disassembly } from './Disassembly';
import { TypeSection } from '../sections/TypeSection';
import { ImportSection } from '../sections/ImportSection';
import { ImportSectionDisassembler } from './sections/ImportSectionDisassembler';
import { TypeSectionDisassembler } from './sections/TypeSectionDisassembler';

export class WasmDisassembler {


    static readonly SectionIdLength = 1
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
                    let name: string;
                    [name, pointer] = this.bp.ReadName(pointer)
                    if (name) {
                        (section as CustomSection).name = name
                    }
                    else {
                        this.log('Section of type "Custom" but name not found')
                    }
                }
                pointer += 4;
                (section as CustomSection).payload = this.bp.Slice(pointer, pointer + section.contentSize)
                break;
            case SectionIds.Start:
                (section as StartSection).startFunction = new Function(this.bp.Getu32(pointer).Value)
                break;
            case SectionIds.Type:
                (section as TypeSection).Functions = TypeSectionDisassembler.ReadFunctionTypes(this.bp, pointer);
                break;
            case SectionIds.Import:
                (section as ImportSection).Imports = ImportSectionDisassembler.FindImports(this.bp, pointer);
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

}