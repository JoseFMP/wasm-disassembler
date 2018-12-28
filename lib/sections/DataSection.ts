import { Section, SectionIds } from './Section'

export class DataSection extends Section {
    sectionId: SectionIds = SectionIds.Data;

    ReceivePayload(payload: any): void {
    }

}