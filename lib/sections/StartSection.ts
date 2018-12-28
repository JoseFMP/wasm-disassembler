import { Section, SectionIds } from "./Section";
import { WasmFunction } from '../functions/WasmFunction'

export class StartSection extends Section {

    sectionId: SectionIds = SectionIds.Start;
    startFunction: WasmFunction;

    ReceivePayload(payload: WasmFunction): void {
        this.startFunction = payload;
    }

}