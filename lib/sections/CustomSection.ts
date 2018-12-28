import { Section, SectionIds } from './Section';



export class CustomSection extends Section {
    readonly sectionId: SectionIds = SectionIds.Custom;
    name: string;
    subpayLoad: Uint8Array;

    ReceivePayload(payload: { name: string, subpayLoad: Uint8Array }): void {
        this.name = payload.name;
        this.subpayLoad = payload.subpayLoad;
    }
}