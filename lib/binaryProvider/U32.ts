
/** 
 * Implements the u32 type in the WASM binaries.
 * Note that this type, as described in the WASM
 * the u32 type length is variable between 1 to 5 bytes.
 * @see https://webassembly.github.io/spec/core/bikeshed/index.html#integers%E2%91%A4
 */
export class U32 {
    Value: number
    BytesUsed: number
}