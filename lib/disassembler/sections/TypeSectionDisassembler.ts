import { FunctionType } from '../../wasmTypes/FunctionType';
import { WasmBinaryProvider } from '../../..';
import { ValueType } from '../../wasmTypes/ValueType';
import { SectionDisassembler } from './SectionDisassembler';


export class TypeSectionDisassembler implements SectionDisassembler{
    static readonly FuncTypeStartingByte = 0x60;

    private readonly binaryProvider: WasmBinaryProvider;


    constructor(binaryProvider: WasmBinaryProvider) {
        this.binaryProvider = binaryProvider;
    }

    Disassemble(initialPointer: number): FunctionType[] {
        let result: FunctionType[] = [];
        let pointer = initialPointer;
        const nFuncTypesLength = this.binaryProvider.Getu32(pointer);
        const numberOfFuncTypes = nFuncTypesLength.Value;
        pointer += nFuncTypesLength.BytesUsed;

        while (result.length < numberOfFuncTypes) {
            let readFunctypeRes: FunctionType | null
            [readFunctypeRes, pointer] = TypeSectionDisassembler.ReadFuncType(this.binaryProvider, pointer);
            if (!readFunctypeRes) {
                throw new Error("Could not read func type.");
            }
            result.push(readFunctypeRes);
        }
        return result;
    }


    static ReadFuncType(binaryProvider: WasmBinaryProvider, initialPointer: number): [FunctionType | null, number] {
        let result: FunctionType | null = null;
        let pointer = initialPointer;
        if (binaryProvider.GetRawByte(pointer) !== TypeSectionDisassembler.FuncTypeStartingByte) {
            throw new Error("Expected byte to be 0x60 as is the start of a functype")
        }
        result = new FunctionType();
        pointer += 1;
        const nParamsLengthRes = binaryProvider.Getu32(pointer);
        const numberOfParams = nParamsLengthRes.Value;
        pointer += nParamsLengthRes.BytesUsed;

        let params: ValueType[] = [];

        while (params.length < numberOfParams) {
            const valueType = binaryProvider.ReadValueType(pointer);
            if (valueType) {
                params.push(valueType);
                pointer++;
            }
        }

        let resTypes: ValueType[] = []
        const resTypesParamsLength = binaryProvider.Getu32(pointer);
        const numberOfResultTypes = resTypesParamsLength.Value;
        pointer += resTypesParamsLength.BytesUsed

        while (resTypes.length < numberOfResultTypes) {
            const valueType = binaryProvider.ReadValueType(pointer);
            if (valueType) {
                resTypes.push(valueType);
                pointer++;
            }
        }

        result.Parameters = params;
        result.ResultTypes = resTypes;
        return [result, pointer]
    }
}