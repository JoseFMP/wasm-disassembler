


import { Section, SectionIds } from './Section'
import { WasmFunction } from '../functions/WasmFunction';

export class FunctionSection extends Section {
    sectionId: SectionIds = SectionIds.Function;

    Functions: WasmFunction[];

    ReceivePayload(payload: WasmFunction[]): void {
        this.Functions = payload;
    }
}