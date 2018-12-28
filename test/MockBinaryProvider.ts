import { WasmBinaryProvider } from '../lib/binaryProvider/WasmBinaryProvider';
import { U32 } from '../lib/binaryProvider/U32';


export class MockBinaryProvider implements WasmBinaryProvider {
    ReadName(initialPointer: number): [string, number] {
        throw new Error('Method not implemented.');
    }
    ReadValueType(initialPointer: number): import("/home/josem/repos/wasm-disassembler/lib/wasmTypes/ValueType").ValueType | null {
        throw new Error('Method not implemented.');
    }

    configuredCallbacks: WasmBinaryProvider | null = null
    logger: (message: string) => void

    Getu32(initialPointer: number): U32 {

        if (this.configuredCallbacks && this.configuredCallbacks.GetRawUint32){
            this.configuredCallbacks.GetRawUint32(initialPointer)
        }

        throw new Error('Method not implemented.');
    }    
    GetRawUint32(startingPointer: number): number {
        throw new Error('Method not implemented.');
    }
    GetRawByte(pointer: number): number {
        throw new Error('Method not implemented.');
    }
    ReadBytes(pointer: number, length: number): Uint8Array {
        throw new Error('Method not implemented.');
    }
    Slice(initialPointer: number, finalPointer: number): Uint8Array {
        throw new Error('Method not implemented.');
    }
    Length: number;






}