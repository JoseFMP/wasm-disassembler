
import { WasmBinaryProvider } from './WasmBinaryProvider'
import { U32 } from './U32';
import { ValueType } from '../wasmTypes/ValueType';

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

    /** @inheritdoc */
    ReadName(initialPointer: number): [string, number] {

        let pointer = initialPointer
        let name: string = ""

        const nameLengthRes = this.Getu32(pointer)
        const nameLength = nameLengthRes.Value

        this.log(`name length should be ${nameLength}`)
        pointer += nameLengthRes.BytesUsed

        while (name.length < nameLength) {
            let codepoint: null | number = null
            let bytesToAdvance: number = 0
            const b1 = this.GetRawByte(pointer)
            const b2 = this.GetRawByte(pointer + 1)
            const b3 = this.GetRawByte(pointer + 2)
            const b4 = this.GetRawByte(pointer + 3)

            let testCodePoint = Math.pow(2, 18) * (b1 - 0xF0) + Math.pow(2, 12) * (b2 - 0x80) + Math.pow(2, 6) * (b3 - 0x80) + (b4 - 0x80)
            if (testCodePoint >= 0x10000 && testCodePoint < 0x110000) {
                codepoint = testCodePoint
                bytesToAdvance = 4
            }

            if (!codepoint) {
                testCodePoint = Math.pow(2, 12) * (b1 - 0xE0) + Math.pow(2, 6) * (b2 - 0x80) + (b3 - 0x80)
                if (testCodePoint >= 0x800 && testCodePoint < 0xD800 || testCodePoint >= 0xE000 && testCodePoint < 0x10000) {
                    codepoint = testCodePoint
                    bytesToAdvance = 3
                }
            }

            if (!codepoint) {
                testCodePoint = Math.pow(2, 6) * (b1 - 0xC0) + (b2 - 0x80)
                if (testCodePoint < 0x800 && testCodePoint >= 0x80) {
                    codepoint = testCodePoint
                    bytesToAdvance = 2
                }
            }

            if (!codepoint) {
                testCodePoint = b1
                if (testCodePoint < 0x80) {
                    codepoint = testCodePoint
                    bytesToAdvance = 1
                }
            }

            if (codepoint) {
                name += String.fromCodePoint(codepoint)
                pointer += bytesToAdvance
                this.log(`Code point found with ${bytesToAdvance} bytes`)
            }
            else {
                this.log(`Test codepoint ${testCodePoint}`)
                break
            }
        }
        return [name, pointer]
    }

    /** @inheritdoc */
    ReadValueType(initialPointer: number): ValueType | null {
        let result: ValueType | null = null
        if (Object.values(ValueType).includes(this.GetRawByte(initialPointer))) {
            result = this.GetRawByte(initialPointer);
        }
        return result;
    }
}