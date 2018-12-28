


import { Section, SectionIds } from './Section'

export class CodeSection extends Section {
    ReceivePayload(payload: any): void {
    }
    
    sectionId: SectionIds = SectionIds.Code;

}