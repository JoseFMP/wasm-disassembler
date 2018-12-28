import { Section, SectionIds } from './Section'

export class TableSection extends Section {
    sectionId: SectionIds = SectionIds.Table;
    ReceivePayload(payload: any): void {
    }
}