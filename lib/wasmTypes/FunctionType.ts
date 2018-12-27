import { ValueType } from './ValueType';


/** Represents a function type as
 * described in WASM specification.
 * @see https://webassembly.github.io/spec/core/bikeshed/index.html#binary-functype
 */
export class FunctionType {
    Parameters: ValueType[];
    ResultTypes: ValueType[];

}