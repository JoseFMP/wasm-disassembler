import { Section, SectionIds } from "./Section";
import Index from "../indexes/Index";

export class StartSection extends Section {

    sectionId: SectionIds = SectionIds.Start;
    startFunction: Index

}