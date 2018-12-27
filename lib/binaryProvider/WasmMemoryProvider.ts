
import { WasmBinaryProvider } from './WasmBinaryProvider'
import { U32 } from './U32';

export class WasmMemoryProvider extends Uint8Array implements WasmBinaryProvider {


    Length: number;

    private log: (message: string) => void

    constructor(binary: Uint8Array, logger: (message: string) => void = () => {}){
        if (!binary || binary.length === 0) {
            throw new Error("The provided array of bytes is empty")
        }
        if (binary.length < 8) {
            throw new Error("The array of bytes provided has less than 8 bytes. Not enough to represent a Wasm binary")
        }
        super(binary)
        this.log = logger
        this.Length = binary.length
        this.log("Constructed WasmMemoryProvider")
    }

    Slice(initialPointer: number, finalPointer: number): Uint8Array {
        return this.slice(initialPointer, finalPointer)
    }

    GetRawByte(pointer: number): number {
        if (pointer >= this.length){
            throw new Error("Trying to fetch a byte from Wasm binary beyond the length of the binary")
        }
        return this[pointer]
    }

    Getu32(initialPointer: number): U32 {
        const decodingResult = this.GetUnsigned128Leb(initialPointer)

        if (decodingResult.bytesUsed > 5) {
            throw new Error(`Trying to decode 4 LEB bytes but got to decode ${decodingResult.bytesUsed}`)
        }

        return {Value: decodingResult.result, BytesUsed: decodingResult.bytesUsed}
    }
 

    GetUnsigned128Leb(initialPointer: number): { result: number, bytesUsed: number } {
        var result = 0;
        var shift = 0;
        let pointer = initialPointer
        while (true) {
            var byte = this[pointer];
            result += ((byte & 0x7F) << shift);
            shift += 7;
            if ((byte & 0x80) === 0) {
                break
            }
            pointer++
        }
        return { result, bytesUsed: (pointer - initialPointer + 1) }
    }

    GetRawUint32(startingPointer: number) {
        if (this.length < startingPointer + 4) {
            throw new Error("Trying to get 4 bytes but no more bytes available")
        }

        let result = (this[startingPointer])
        result += (this[startingPointer + 1] * 256)
        result += (this[startingPointer + 2] * 256 * 256)
        result += (this[startingPointer + 3] * 256 * 256 * 256)
        return result
    }


    ReadBytes(pointer: number, length: number): Uint8Array {
        var result = this.subarray(pointer, pointer + length);
        return new Uint8Array(result); // making a clone of the data
    }
}