import { Section, SectionIds } from './Section';



export class CustomSection extends Section {

    readonly sectionId: SectionIds = SectionIds.Custom;
    name: string | null
    payload: Uint8Array
}