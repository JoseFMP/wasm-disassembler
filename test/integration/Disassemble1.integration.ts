
import * as mocha from 'mocha';
import * as fs from 'fs'
import * as chai from 'chai';
import { WasmMemoryProvider } from '../../lib/binaryProvider/WasmMemoryProvider'
import { WasmDisassembler } from '../../lib/disassembler/WasmDisassembler'
import { Disassembly } from '../../lib/disassembler/Disassembly';

const expect = chai.expect;
const assert = chai.assert;

const binaryPath = __dirname + '/../wasm-binaries/1.wasm';

fs.accessSync(binaryPath, fs.constants.R_OK);
const binary1 = fs.readFileSync(binaryPath, {flag: ""});

mocha.describe('Tests Disassembler', () => {

    it('Test disassembling does not crash', async () => {
        const byteArray = new Uint8Array(binary1)
        assert(byteArray !== null, "The file must be read correctly for the test to proceed.");
        assert(byteArray.length > 5, "The file must contain some bytes for the disassembling to make sense.");

        const memoryProvider = new WasmMemoryProvider(byteArray)
        expect(memoryProvider).not.null;
        expect(memoryProvider.length).is.equal(binary1.length);
        
        const disassembler = new WasmDisassembler(memoryProvider);

        expect(disassembler).not.null;
        
        const pormiseDisassembling = await disassembler.Disassemble().catch((reason:any) => {
            expect.fail(`Exception disassembling: ${reason}`)
        });

        expect(pormiseDisassembling).not.undefined;
        expect(pormiseDisassembling).not.null;
        expect(pormiseDisassembling as Disassembly).not.null;

        assert.isNotNull(pormiseDisassembling)
    });

    it('Test can find one module', async () => {
        const byteArray = new Uint8Array(binary1)
        const memoryProvider = new WasmMemoryProvider(byteArray)
        const disassembler = new WasmDisassembler(memoryProvider);

        const disassembly = await disassembler.Disassemble();

        expect(disassembly).not.undefined;
        expect(disassembly).not.null;

        if (!disassembly){
            expect.fail("Disassembly is null but should not be.");
        }
        else{
            expect(disassembly.Modules).not.undefined;
            expect(disassembly.Modules).not.null;
            expect(disassembly.Modules.length).is.equal(1);
        }
    });

    it('Test can find sections', async () => {
        const byteArray = new Uint8Array(binary1)
        const memoryProvider = new WasmMemoryProvider(byteArray)
        const disassembler = new WasmDisassembler(memoryProvider);

        const disassembly = await disassembler.Disassemble();

        expect(disassembly).not.undefined;
        expect(disassembly).not.null;

        if (!disassembly) {
            expect.fail("Disassembly is null but should not be.");
        }
        else {
           expect(disassembly.Modules[0].Sections.length).equals(13);
        }
    })
});
