import { Section, SectionIds } from './Section'

export class ElementSection extends Section {
    sectionId: SectionIds = SectionIds.Element;
    ReceivePayload(payload: any): void {
    }

}