import { SectionDisassembler } from './SectionDisassembler'
import { WasmBinaryProvider } from '../../binaryProvider/WasmBinaryProvider';


export class CustomSectionDisassembler implements SectionDisassembler {

    private binaryProvider: WasmBinaryProvider;
  
    constructor(binaryProvider: WasmBinaryProvider){
        this.binaryProvider = binaryProvider;
    }

    Disassemble(initialPointer: number): {name: string, subPayload: Uint8Array} {
        let name: string;
        let pointer = initialPointer;
        [name, pointer] = this.binaryProvider.ReadName(pointer)

        const subPayload = this.binaryProvider.Slice(pointer, pointer + 1);

        return { name, subPayload};
    }





}