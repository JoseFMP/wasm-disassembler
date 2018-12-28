import { WasmBinaryProvider } from '../../binaryProvider/WasmBinaryProvider';
import { WasmFunction } from '../../functions/WasmFunction';
import { SectionDisassembler } from './SectionDisassembler';


export class FunctionSectionDisassembler implements SectionDisassembler {
    private readonly binaryProvider: WasmBinaryProvider;

    constructor(binaryProvider: WasmBinaryProvider){
        this.binaryProvider = binaryProvider;
    }

    Disassemble(initialPointer: number): WasmFunction[] {
        let pointer = initialPointer;
        let functions: WasmFunction[] = [];

        const numberOfFunctionsLenght = this.binaryProvider.Getu32(pointer);

        pointer += numberOfFunctionsLenght.BytesUsed;

        while(functions.length < numberOfFunctionsLenght.Value){
            const newFunc = new WasmFunction();
            newFunc.Index = this.binaryProvider.GetRawByte(pointer);
            pointer++;
        }
        return functions;
    }

}