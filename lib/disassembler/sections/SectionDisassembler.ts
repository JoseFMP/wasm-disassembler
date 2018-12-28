import { WasmBinaryProvider } from '../../binaryProvider/WasmBinaryProvider';
import { SectionIds } from '../../sections/Section';
import { CustomSectionDisassembler } from './CustomSectionDisassembler';
import { ImportSectionDisassembler } from './ImportSectionDisassembler';

const SectionTypesDisassemblers: 
    { [sectionId: number]: (new (binaryProvider: WasmBinaryProvider) => SectionDisassembler) } = {
    [SectionIds.Custom]: CustomSectionDisassembler,
    [SectionIds.Import]: ImportSectionDisassembler,
    [SectionIds.Code]: CustomSectionDisassembler,
    [SectionIds.Start]: CustomSectionDisassembler,
    [SectionIds.Data]: CustomSectionDisassembler,
    [SectionIds.Element]: CustomSectionDisassembler,
    [SectionIds.Export]: CustomSectionDisassembler,
    [SectionIds.Function]: CustomSectionDisassembler,
    [SectionIds.Global]: CustomSectionDisassembler,
    [SectionIds.Memory]: CustomSectionDisassembler,
    [SectionIds.Table]: CustomSectionDisassembler,
    [SectionIds.Type]: CustomSectionDisassembler,
};


export interface SectionDisassembler {
    Disassemble(initialPointer: number): any;
}

export const InstantiateSectionDisassembler = 
(binaryProvider: WasmBinaryProvider,
     sectionType: SectionIds): SectionDisassembler => {
    return new SectionTypesDisassemblers[sectionType](binaryProvider);
}


