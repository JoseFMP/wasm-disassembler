import { Section, SectionIds } from './Section'
import { FunctionType } from '../wasmTypes/FunctionType';

export class TypeSection extends Section {
    sectionId: SectionIds = SectionIds.Type;

    Functions: FunctionType[];
}