
import { Section } from './sections/Section'

export enum WasmVersions {
    Normal = 0x01,
    Experimental = 0x0d
}

export class WasmModule {

    static readonly MagicNumber = 0x6d736100;
    static readonly Version = WasmVersions.Normal;

    static readonly MagicNumberLength = 4;
    static readonly VersionLength = 4;

    Sections: Section[]

}