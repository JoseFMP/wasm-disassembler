import { WasmMemoryProvider } from '../../lib/binaryProvider/WasmMemoryProvider';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
mocha.describe('Tests WasmMemoryProvider', () => {

    it('Can create an WasmMemoryProvider from an Uint8Array', () => {
        const byteArray = new Uint8Array(10)
        let wasmBinaryProvider = new WasmMemoryProvider(byteArray);
        expect(wasmBinaryProvider).not.undefined
        expect(wasmBinaryProvider).not.null
        expect(wasmBinaryProvider.Length).not.undefined
        expect(wasmBinaryProvider.Length).to.be.equal(byteArray.length)
    });

});
