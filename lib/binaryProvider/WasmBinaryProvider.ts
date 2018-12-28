import { U32 } from './U32';
import { ValueType } from '../wasmTypes/ValueType';


/** Represents an entity that provides access to the binary of a WASM
 * The goal of this interface is to decouple the logic of the disassembling
 * from the binary plugging. This increases testability of the logic of
 * the disassembler and allows plugging the WASM binary in arbitrary ways.
 */
export interface WasmBinaryProvider {

    /**Provides an u32 at the specified pointer. u32 type is not
     * a generic uint32 but as defined in WASM spec:
     * @see https://webassembly.github.io/spec/core/bikeshed/index.html#integers%E2%91%A4
     */
    Getu32(initialPointer: number): U32

    /** Provides an uint which is the raw value of the yuxtaposition of
     * 4 consecutive bytes.
     */
    GetRawUint32(startingPointer: number): number
    GetRawByte(pointer: number): number
    Slice(initialPointer: number, finalPointer: number): Uint8Array

    /** The total length of the binary */
    Length: number

    /** Reads a name from the WASM binary.
     * Name type are defined in WASM spec:
     * @see https://webassembly.github.io/spec/core/bikeshed/index.html#names%E2%91%A0
     * 
     * Note that the amount of bytes to encode the name is NOT equal to the length of the string.
     * Therefore the position of the pointer after finishing reading the name is returned as well.
     * Notice that the lenght of the string could be 0. In that case the pointer does not move.
     */
    ReadName(initialPointer: number): [string, number];

    /**
     * Reads the type of a value.
     * Types of values are defined according to WASM specification.
     * @see https://webassembly.github.io/spec/core/bikeshed/index.html#value-types%E2%91%A2
     * 
     * @param initialPointer position at which to read the value type.
     */
    ReadValueType(initialPointer: number): ValueType | null;

}

