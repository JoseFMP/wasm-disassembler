import { U32 } from './U32';


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
    GetRawUint32(startingPointer: number): number
    GetRawByte(pointer: number): number
    ReadBytes(pointer: number, length: number): Uint8Array

    Slice(initialPointer: number, finalPointer: number): Uint8Array

    /** The total length of the binary */
    Length: number
}

