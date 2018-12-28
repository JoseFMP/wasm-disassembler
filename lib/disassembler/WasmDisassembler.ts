import { Section, SectionIds } from '../sections/Section'
import { WasmModule, WasmVersions } from '../WasmModule';
import { WasmBinaryProvider } from '../binaryProvider/WasmBinaryProvider'
import { InstantiateSection, PossibleSections } from '../sections/Mapping';
import { Disassembly } from './Disassembly';
import { InstantiateSectionDisassembler } from './sections/SectionDisassembler';
import { Logger, LoggingVerbosity } from '../logging/logger';
import { SimpleLogger } from '../logging/simpleLogger';

export class WasmDisassembler {

    static readonly SectionIdLength = 1
    private readonly bp: WasmBinaryProvider
    
    private readonly logger: Logger;

    private log: (message: any) => void;

    constructor(binaryProvider: WasmBinaryProvider, logger: Logger = new SimpleLogger(null)) {
        this.bp = binaryProvider;
        this.logger = logger;
        this.log = (message: any): void => { this.logger.log(message, LoggingVerbosity.Trace); }
    }


    async Disassemble(): Promise<Disassembly | null> {
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

            const findSectionResult = this.FindSection(pointer);
            let newSection: Section;
            if (findSectionResult) {  
                [newSection, pointer] = findSectionResult;
                sections.push(newSection);
            }
            else {
                this.log('Could not find more sections :/')
                break;
            }
        }
        return [sections, pointer]
    }


    private FindSection(initialPointer: number): [Section, number] | null {
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

        let newSection = InstantiateSection(sectionType) as Section;

        pointer += WasmDisassembler.SectionIdLength
        const csu32 = this.bp.Getu32(pointer)
        const contentSize = csu32.Value
        pointer += csu32.BytesUsed

        newSection.sectionId = sectionType
        newSection.contentSize = contentSize

        const sectionDisassembler = InstantiateSectionDisassembler(this.bp, newSection.sectionId);
        const sectionDisassembly = sectionDisassembler.Disassemble(pointer);
        newSection.ReceivePayload(sectionDisassembly);

        pointer += contentSize;
        return [newSection, pointer];
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

}