import Section, { SectionIds } from "./Section";
import Index from "../indexes/Index";

export default class StartSection extends Section {

    sectionId: SectionIds = SectionIds.Start;
    startFunction: Index

}