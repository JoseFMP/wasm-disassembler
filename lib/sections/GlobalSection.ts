


import { Section, SectionIds } from './Section'

export class GlobalSection extends Section {
    sectionId: SectionIds = SectionIds.Function;

    ReceivePayload(payload: any): void {
    }

}