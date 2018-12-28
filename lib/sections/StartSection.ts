import { Section, SectionIds } from "./Section";
import { Function } from '../functions/WasmFunction'

export class StartSection extends Section {

    sectionId: SectionIds = SectionIds.Start;
    startFunction: Function;

}