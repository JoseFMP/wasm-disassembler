import { CustomSection } from './CustomSection';
import { ImportSection } from './ImportSection';
import { CodeSection } from './CodeSection';
import { StartSection } from './StartSection';
import { DataSection } from './DataSection';
import { ElementSection } from './ElementSection';
import { ExportSection } from './ExportSection';
import { FunctionSection } from './FunctionSection';
import { GlobalSection } from './GlobalSection';
import { MemorySection } from './MemorySection';
import { TableSection } from './TableSection';
import { TypeSection } from './TypeSection';
import { SectionIds } from './Section';



const SectionTypesToModels: { [sectionId: number]: (new () => any) } = {
    [SectionIds.Custom]: CustomSection,
    [SectionIds.Import]: ImportSection,
    [SectionIds.Code]: CodeSection,
    [SectionIds.Start]: StartSection,
    [SectionIds.Data]: DataSection,
    [SectionIds.Element]: ElementSection,
    [SectionIds.Export]: ExportSection,
    [SectionIds.Function]: FunctionSection,
    [SectionIds.Global]: GlobalSection,
    [SectionIds.Memory]: MemorySection,
    [SectionIds.Table]: TableSection,
    [SectionIds.Type]: TypeSection,
};

export const PossibleSections = Object.values(SectionIds).filter((val: any) => !Number.isNaN(val))


export const InstantiateSection = (sectionType: SectionIds): any => {
    if (!Object.values(PossibleSections).includes(sectionType)) {
        throw new Error(`The section type specified does not exist: ${sectionType}`);
    }

    let newSection: any = new SectionTypesToModels[sectionType]()
    return newSection
}