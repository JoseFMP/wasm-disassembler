import U32 from './U32';



export default interface WasmProvider extends Uint8Array {
    Getu32(initialPointer: number): U32
    GetUnsigned128Leb(initialPointer: number): { result: number, bytesUsed: number }
    GetRawUint32(startingPointer: number): number
    GetRawByte(pointer: number): number

    ReadBytes(pointer: number, length: number): Uint8Array

}

