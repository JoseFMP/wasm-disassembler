import { Section, SectionIds } from "./Section";
import { Function } from '../functions/Function'

export class StartSection extends Section {

    sectionId: SectionIds = SectionIds.Start;
    startFunction: Function;

}