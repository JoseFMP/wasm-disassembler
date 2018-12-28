import { Section, SectionIds } from './Section'

export class ExportSection extends Section {
    sectionId: SectionIds = SectionIds.Export;
    ReceivePayload(payload: any): void {
    }

}