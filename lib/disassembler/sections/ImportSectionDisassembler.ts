import { WasmBinaryProvider } from '../../binaryProvider/WasmBinaryProvider';
import { Import } from '../../imports/Import';

enum ImportTypes {
    function = 0x00,
    table = 0x01,
    mem = 0x02,
    global = 0x03
}

/**
 * Disassembles the Imports of an Import Section as described by the WASM binary
 * encoding specification.
 * @see https://webassembly.github.io/spec/core/bikeshed/index.html#binary-import
 */
export class ImportSectionDisassembler {




    static FindImports(binaryProvider: WasmBinaryProvider, initialPointer: number): Import[] {
        let result: Import[] = [];
        let pointer = initialPointer;
        let importsLengthU32 = binaryProvider.Getu32(pointer);

        pointer += importsLengthU32.BytesUsed
        while (result.length < importsLengthU32.Value) {
            let newImport: Import;
            [newImport, pointer] = this.FindImport(binaryProvider, pointer);
            result.push(newImport);
        }
        return result;
    }


    /**
     * Disassembles an import according to WASM specification.
     * @see https://webassembly.github.io/spec/core/bikeshed/index.html#syntax-import
     * 
     * @param binaryProvider provider of binary layer of the encoded WASM.
     * @param initialPointer position in the byte array where to start looking for the import.
     */
    private static FindImport(binaryProvider: WasmBinaryProvider, initialPointer: number): [Import, number] {
        let newImport = new Import();
        let pointer = initialPointer;

        let moduleName: string;
        [moduleName, pointer] = binaryProvider.ReadName(pointer);
        if (!moduleName) {
            throw new Error("Could not determine module name in import");
        }
        newImport.Module = moduleName;

        let entityName: string;
        [entityName, pointer] = binaryProvider.ReadName(pointer);
        if (!entityName) {
            throw new Error("Could not determine module name in import");
        }
        newImport.EntityName = entityName;

        const typeOfImport = binaryProvider.GetRawByte(pointer);

        switch(typeOfImport){
            case ImportTypes.function:
            break;
            case ImportTypes.table:
                break;
            case ImportTypes.mem:
                break;
            case ImportTypes.global:
                break;
            default:
                throw new Error(`Could not figure out the type of import from ${typeOfImport}`)
        }

        pointer ++;


        return [newImport, pointer];
    }
}