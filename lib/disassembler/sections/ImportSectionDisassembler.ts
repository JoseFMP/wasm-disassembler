import { WasmBinaryProvider } from '../../binaryProvider/WasmBinaryProvider';
import { Import } from '../../imports/Import';
import { Importable } from '../../imports/Importable';
import { Table } from '../../Table';
import { Memory } from '../../Memory';
import { Global } from '../../Global';
import { WasmFunction } from '../../functions/WasmFunction';

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

    static readonly ImportablesMapping: { [importType: number]: (new () => any) } = {
        [ImportTypes.table]: Table,
        [ImportTypes.mem]: Memory,
        [ImportTypes.global]: Global,
        [ImportTypes.function]: WasmFunction,
    };


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

        let importable: Importable = ImportSectionDisassembler.InstantiateImportable(typeOfImport);

        newImport.Content = importable;
        pointer ++;


        return [newImport, pointer];
    }


    private static InstantiateImportable(importableType: ImportTypes): Importable {
        if (!Object.values(ImportTypes).includes(importableType)) {
            throw new Error(`The importable type specified does not exist: ${importableType}`);
        }
        let newImportable: Importable = new ImportSectionDisassembler.ImportablesMapping[importableType]();
        return newImportable;
    }

}