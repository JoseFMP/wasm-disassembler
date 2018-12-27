


import { Section, SectionIds } from './Section'
import { Import } from '../imports/Import'
export class ImportSection extends Section {
    sectionId: SectionIds = SectionIds.Import;

    Imports: Import[]
}