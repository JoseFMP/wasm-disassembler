import { WasmBinaryProvider } from '../lib/binaryProvider/WasmBinaryProvider';
import { U32 } from '../lib/binaryProvider/U32';


export class MockBinaryProvider extends Uint8Array implements WasmBinaryProvider {

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