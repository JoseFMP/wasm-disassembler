import { Importable } from '../imports/Importable';

export class Function implements Importable {

    private index: number

    constructor(index: number){
        this.index = index
    }

    getIndex(){
        return this.index
    }
}